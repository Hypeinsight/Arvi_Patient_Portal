# Prints what DLP does to text, to check it by eye. Run from backend/:
#
#   venv\Scripts\python scripts\dlp_check.py                    built-in sample text
#   venv\Scripts\python scripts\dlp_check.py "your own text"
#   venv\Scripts\python scripts\dlp_check.py --watch            live chat messages
#
# Add --arvi <path to healthai\backend> to also run ARVI's reversible
# encryption: original -> encrypted -> decrypted, checked for an exact match.
#
# --watch reads each patient message from Redis as it arrives while you chat
# in the browser, and shows what was typed and the masked copy sent to Azure
# OpenAI. It prints patient details, so it refuses a Redis that isn't on this
# machine. In the live system ARVI never sees chat messages: it encrypts the
# intake summary on submit. The ARVI lines show what its encryption does to
# the same text.

import argparse
import json
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import redis
from dotenv import dotenv_values
from flask import Flask

from app.services.dlp import mask

SAMPLE_TEXT = (
    "I'm May Long, born 12/03/1988. Call me on 0412 345 678 or email may.long@example.com. "
    "I live at 12 Fake Street, Sydney NSW 2000 and my Medicare is 2123 45670 1. "
    "Dr Priya Fernando has my MRN 00482913. I've had headaches for a long time."
)

# Made-up intake form details, so the patient-specific detectors run too
SAMPLE_PATIENT = {
    "first_name": "May",
    "last_name": "Long",
    "date_of_birth": "1988-03-12",
    "phone": "0412 345 678",
    "email": "may.long@example.com",
    "address": "12 Fake Street, Sydney NSW 2000",
}

LOCAL_HOSTS = {"localhost", "127.0.0.1", "::1"}


def show(label, value):
    print(f"{label:<12}: {value}")


def load_arvi_service(arvi_backend):
    """ARVI's DLPService, loaded from its backend folder with its own settings."""
    arvi_backend = Path(arvi_backend).resolve()
    # ARVI's own settings (WRAPPED_KEY, its project and key) win over the portal's
    for name, value in dotenv_values(arvi_backend / ".env").items():
        if name in ("GCP_PROJECT", "WRAPPED_KEY", "GOOGLE_APPLICATION_CREDENTIALS") and value:
            os.environ[name] = value
    sys.path.insert(0, str(arvi_backend))

    from Service.dlp_service import DLPService
    logging.getLogger().setLevel(logging.WARNING)  # ARVI's module turns on DEBUG logging
    return DLPService()


def show_arvi_round_trip(arvi, text):
    encrypted = arvi.deidentify(text)
    decrypted = arvi.reidentify(encrypted)
    show("ARVI encrypt", encrypted)
    show("ARVI decrypt", decrypted)
    show("Round trip", "MATCH" if decrypted == text else "MISMATCH - decrypted text differs from the input")


def check_text(text, arvi):
    print("=== Portal: one-way masking (sent to Azure OpenAI) ===")
    app = Flask(__name__)
    app.config.update(DLP_ENABLED=True, GCP_PROJECT=os.getenv("GCP_PROJECT"))
    with app.app_context():
        masked = mask(text, SAMPLE_PATIENT)
    show("Input", text)
    show("Masked", masked)
    print("No decrypt step: placeholders can't be turned back into the original.")

    if not arvi:
        return
    print("\n=== ARVI: reversible encryption (stored in ARVI's database) ===")
    show_arvi_round_trip(arvi, text)

    print("\nARVI encrypts these form fields whole:")
    for field, value in [("Name", "May Long"), ("Gender", "Female"), ("DOB", "12/03/1988")]:
        token = arvi.deidentify_field(value)
        back = arvi.reidentify(token)
        print(f"  {field:<7} {value!r} -> {token}\n          -> {back!r}  {'MATCH' if back == value else 'MISMATCH'}")


def chat_messages(client, key) -> list:
    raw = client.get(key)
    return (json.loads(raw) or {}).get("messages", []) if raw else []


def watch_chats(arvi):
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    if urlparse(redis_url).hostname not in LOCAL_HOSTS:
        sys.exit(f"Refusing to watch {urlparse(redis_url).hostname}: this prints patient details, local Redis only")
    client = redis.from_url(redis_url, decode_responses=True)

    # Only show messages sent from now on
    shown = {key: len(chat_messages(client, key)) for key in client.scan_iter("chat:*")}
    print(f"Watching {redis_url} - send a message in the chat. Ctrl+C to stop.")

    try:
        while True:
            for key in client.scan_iter("chat:*"):
                messages = chat_messages(client, key)
                for message in messages[shown.get(key, 0):]:
                    if message.get("role") != "user":
                        continue
                    print(f"\n--- {key}  {datetime.now():%H:%M:%S}")
                    show("Typed", message.get("content", ""))
                    show("Sent to AI", message.get("ai_content", "(no masked copy: sent before DLP was on)"))
                    if arvi:
                        show_arvi_round_trip(arvi, message.get("content", ""))
                shown[key] = len(messages)
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopped.")


def main():
    parser = argparse.ArgumentParser(description="Print what DLP masks or encrypts")
    parser.add_argument("text", nargs="?", default=SAMPLE_TEXT, help="text to check (default: built-in sample)")
    parser.add_argument("--watch", action="store_true", help="print live chat messages from local Redis instead")
    parser.add_argument("--arvi", metavar="PATH", help="ARVI's backend folder, to also run its encrypt/decrypt")
    args = parser.parse_args()

    arvi = load_arvi_service(args.arvi) if args.arvi else None
    if args.watch:
        watch_chats(arvi)
    else:
        check_text(args.text, arvi)


if __name__ == "__main__":
    main()
