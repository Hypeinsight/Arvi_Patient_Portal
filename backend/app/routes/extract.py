import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.session import IntakeSession
import fitz  # PyMuPDF
import io
from PIL import Image
import re
import statistics
from pytesseract import Output, TesseractError

extract_bp = Blueprint("extract", __name__)

ALLOWED_MIME         = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
ALLOWED_EXTRACT_TYPES = {"personal", "medical"}

# Keep this in sync with the label variants your frontend regex looks for.
# Used here only to decide which OCR cells are "labels" for pairing purposes.
LABEL_KEYWORDS = [
    r"given\s*names?", r"first\s*name", r"forename",
    r"surname", r"last\s*name", r"family\s*name",
    r"full\s*name", r"name",
    r"date\s*of\s*birth", r"d\.?o\.?b\.?", r"birth\s*date",
    r"gender", r"sex",
    r"phone\s*number", r"mobile", r"contact\s*number", r"tel(?:ephone)?",
    r"email\s*address", r"email",
    r"home\s*address", r"residential\s*address", r"address",
    r"emergency\s*contact\s*name", r"emergency\s*contact",
    r"next\s*of\s*kin",
    r"emergency\s*contact\s*number", r"emergency\s*(?:phone|number)",
    r"licence\s*expiry", r"license\s*expiry", r"expiry\s*date",
    r"licence\s*number", r"license\s*number",
    r"licence\s*type", r"conditions",
    r"current\s*medical\s*conditions", r"medical\s*conditions",
    r"current\s*medications", r"medications",
    r"allerg(?:y|ies)",
    r"previous\s*surgeries", r"surgical\s*history",
    r"family\s*(?:medical\s*)?history",
]

_LABEL_REGEX = re.compile(r"^(?:%s)\s*:?$" % "|".join(LABEL_KEYWORDS), re.IGNORECASE)


def _looks_like_label(text):
    cleaned = text.strip().rstrip(":").strip()
    if not cleaned:
        return False
    return bool(_LABEL_REGEX.match(cleaned))


def _correct_orientation(img):
    """
    Run Tesseract's OSD (Orientation and Script Detection) on the image and
    rotate it upright if it detects the page is sideways/upside-down.
    """
    try:
        osd = pytesseract.image_to_osd(img, output_type=Output.DICT)
    except TesseractError:
        # OSD couldn't find enough text to determine orientation confidently.
        return img

    rotate_by = osd.get("rotate", 0)
    confidence = osd.get("orientation_conf", 0)

    if rotate_by and confidence >= 1.0:
        img = img.rotate(-rotate_by, expand=True)

    return img


def _extract_words(img):
    """Run pytesseract with bounding-box output and return a clean word list."""
    data = pytesseract.image_to_data(img, output_type=Output.DICT)
    words = []
    n = len(data["text"])
    for i in range(n):
        text = data["text"][i].strip()
        conf_raw = str(data["conf"][i])
        conf = int(conf_raw) if conf_raw.lstrip("-").isdigit() else -1
        if not text or conf < 0:
            continue
        left = data["left"][i]
        top = data["top"][i]
        width = data["width"][i]
        height = data["height"][i]
        words.append({
            "text": text,
            "left": left,
            "top": top,
            "right": left + width,
            "bottom": top + height,
            "cx": left + width / 2,
            "cy": top + height / 2,
            "height": height,
        })
    return words


def _cluster_rows(words, y_tolerance_ratio=0.6):
    """Group words into visual rows based on vertical position, regardless
    of reading order or how many columns the document has."""
    if not words:
        return []

    avg_height = statistics.mean(w["height"] for w in words) or 20
    tolerance = avg_height * y_tolerance_ratio

    sorted_words = sorted(words, key=lambda w: w["cy"])
    rows = []
    current_row = [sorted_words[0]]
    current_cy = sorted_words[0]["cy"]

    for w in sorted_words[1:]:
        if abs(w["cy"] - current_cy) <= tolerance:
            current_row.append(w)
            current_cy = statistics.mean(x["cy"] for x in current_row)
        else:
            rows.append(current_row)
            current_row = [w]
            current_cy = w["cy"]
    rows.append(current_row)

    for row in rows:
        row.sort(key=lambda w: w["left"])

    rows.sort(key=lambda row: statistics.mean(w["cy"] for w in row))
    return rows


def _group_cells(row_words, gap_ratio=2.2):
    """Merge adjacent words in a row into 'cells'. A big horizontal gap
    signals a new column; a small gap means the words belong to the same
    phrase (e.g. 'DATE' 'OF' 'BIRTH' -> one cell 'DATE OF BIRTH')."""
    if not row_words:
        return []

    avg_height = statistics.mean(w["height"] for w in row_words) or 20
    gap_threshold = avg_height * gap_ratio

    cells = []
    current_words = [row_words[0]]

    for w in row_words[1:]:
        prev = current_words[-1]
        gap = w["left"] - prev["right"]
        if gap <= gap_threshold:
            current_words.append(w)
        else:
            cells.append(_merge_words_to_cell(current_words))
            current_words = [w]
    cells.append(_merge_words_to_cell(current_words))
    return cells


def _merge_words_to_cell(words):
    text = " ".join(w["text"] for w in words)
    left = min(w["left"] for w in words)
    right = max(w["right"] for w in words)
    top = min(w["top"] for w in words)
    bottom = max(w["bottom"] for w in words)
    return {
        "text": text,
        "left": left,
        "right": right,
        "top": top,
        "bottom": bottom,
        "cx": (left + right) / 2,
        "cy": (top + bottom) / 2,
    }


def _build_table(words):
    """Full pipeline: words -> rows -> cells. Works for 1, 2, 3+ columns
    since nothing here assumes a fixed column count."""
    rows = _cluster_rows(words)
    return [_group_cells(row) for row in rows]


def _find_value_for_label(table, row_idx, label_cell, max_rows_below=2, x_pad_ratio=0.5):
    """Look for a value aligned with a label cell: same row first (covers
    'Label: value' on one line), then rows below (covers table layouts)."""

    same_row = table[row_idx]
    label_pos = same_row.index(label_cell)
    if label_pos + 1 < len(same_row):
        candidate = same_row[label_pos + 1]
        if not _looks_like_label(candidate["text"]):
            return candidate["text"]

    label_width = label_cell["right"] - label_cell["left"]
    pad = label_width * x_pad_ratio
    search_min = label_cell["left"] - pad
    search_max = label_cell["right"] + pad

    for offset in range(1, max_rows_below + 1):
        next_row_idx = row_idx + offset
        if next_row_idx >= len(table):
            break
        candidate_row = table[next_row_idx]
        if all(_looks_like_label(c["text"]) for c in candidate_row):
            continue  # this is another header row, not values yet
        best = None
        best_dist = None
        for cell in candidate_row:
            if _looks_like_label(cell["text"]):
                continue
            if search_min <= cell["cx"] <= search_max:
                dist = abs(cell["cx"] - label_cell["cx"])
                if best is None or dist < best_dist:
                    best = cell
                    best_dist = dist
        if best:
            return best["text"]

    return None


def reconstruct_layout_text(words):
    """Turn raw OCR words into text where every detected label sits right
    next to its value, regardless of the original column layout. Anything
    not recognised as a label/value pair is still included in normal
    reading order, so nothing is lost for non-tabular content."""
    table = _build_table(words)

    matched_pairs = []
    for row_idx, row in enumerate(table):
        for cell in row:
            if not _looks_like_label(cell["text"]):
                continue
            value = _find_value_for_label(table, row_idx, cell)
            if value:
                matched_pairs.append(f"{cell['text']}: {value}")

    reading_order_lines = [
        " ".join(cell["text"] for cell in row) for row in table
    ]

    layout_text = "\n".join(matched_pairs) + "\n\n" + "\n".join(reading_order_lines)
    return layout_text.strip()


def _extract_text(file_bytes: bytes, mime_type: str) -> dict:
    """Returns both the plain OCR text (unchanged, for display/debugging)
    and a layout-aware text (for field extraction) that reconstructs
    label-value pairs correctly for 1, 2, 3+ column documents."""
    all_words = []
    plain_text_parts = []

    if mime_type == "application/pdf":
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            pix = page.get_pixmap(dpi=300)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            img = _correct_orientation(img)
            all_words.extend(_extract_words(img))
            plain_text_parts.append(pytesseract.image_to_string(img))
        doc.close()
    else:
        img = Image.open(io.BytesIO(file_bytes))
        img = _correct_orientation(img)
        all_words.extend(_extract_words(img))
        plain_text_parts.append(pytesseract.image_to_string(img))

    plain_text = "\n".join(p.strip() for p in plain_text_parts).strip()
    layout_text = reconstruct_layout_text(all_words) if all_words else plain_text

    return {
        "text": plain_text,
        "layout_text": layout_text,
    }


@extract_bp.post("/sessions/<uuid:session_id>/ocr")
def ocr_personal_id(session_id):
    if db.session.get(IntakeSession, session_id) is None:
        return jsonify({"success": False, "message": "Session not found"}), 404

    file = request.files.get("file")
    if not file:
        return jsonify({"success": False, "message": "No file provided"}), 400
    if file.mimetype not in ALLOWED_MIME:
        return jsonify({"success": False, "message": f"File type {file.mimetype} not allowed"}), 415

    file_bytes = file.read()

    try:
        result = _extract_text(file_bytes, file.mimetype)
    except Exception as e:
        return jsonify({"success": False, "message": f"OCR failed: {str(e)}"}), 500

    return jsonify({
        "success": True,
        "text": result["text"],
        "layout_text": result["layout_text"],
    }), 200

# @extract_bp.post("/sessions/<uuid:session_id>/ocr") # to perform OCR on a personal ID upload
# def ocr_personal_id(session_id):
#     if get_intake_data(session_id) is None:
#         return jsonify({"success": False, "message": "Session not found"}), 404

#     file = request.files.get("file")
#     if not file:
#         return jsonify({"success": False, "message": "No file provided"}), 400
#     if file.mimetype not in ALLOWED_MIME:
#         return jsonify({"success": False, "message": f"File type {file.mimetype} not allowed"}), 415

#     file_bytes = file.read()

#     try:
#         text = _extract_text(file_bytes, file.mimetype)
#     except Exception as e:
#         return jsonify({"success": False, "message": f"OCR failed: {str(e)}"}), 500

#     return jsonify({"success": True, "text": text}), 200


# def _extract_text(file_bytes: bytes, mime_type: str) -> str:
#     if mime_type == "application/pdf":
#         doc = fitz.open(stream=file_bytes, filetype="pdf")
#         text = ""
#         for page in doc:
#             pix = page.get_pixmap(dpi=300)
#             img = Image.open(io.BytesIO(pix.tobytes("png")))
#             text += pytesseract.image_to_string(img)
#         doc.close()
#         return text.strip()
#     else:
#         img = Image.open(io.BytesIO(file_bytes))
#         return pytesseract.image_to_string(img).strip()
