# Tests for app/services/dlp.py, which masks PII before chat text reaches
# Azure OpenAI. Run from backend/:
#   python -m unittest discover tests
#
# The unit tests fake Google DLP, so they need no credentials. LiveDLPTests
# call the real API and only run when asked to:
#   set DLP_LIVE_TESTS=1, GCP_PROJECT and GOOGLE_APPLICATION_CREDENTIALS first

import os
import re
import unittest
from datetime import date
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from flask import Flask
from google.api_core.exceptions import ServiceUnavailable

from app.services import dlp
from app.services.dlp import DLPUnavailable, mask

PATIENT = {
    "first_name": "May",
    "last_name": "Long",
    "date_of_birth": "1988-03-12",
    "phone": "0412 345 678",
    "email": "May.Long@Example.com",
    "address": "12 Fake Street, Sydney",
    "emergency_contact_name": "Rose Long",
    "emergency_contact_number": "(02) 9876 5432",
}


def sub(pattern, text):
    return re.sub(pattern, "[X]", text)


def dlp_app(**config):
    app = Flask(__name__)
    app.config.update(DLP_ENABLED=True, **config)
    return app


class NamePatternTests(unittest.TestCase):
    def setUp(self):
        self.pattern = dlp._name_pattern("May", "Long")

    def test_everyday_words_are_left_alone(self):
        for text in ["headaches for a long time", "I may be allergic"]:
            self.assertEqual(sub(self.pattern, text), text)

    def test_full_name_matches_in_any_case(self):
        for text in ["I'm May Long", "this is may long", "MAY LONG here", "Long, May"]:
            self.assertIn("[X]", sub(self.pattern, text), text)
            self.assertNotRegex(sub(self.pattern, text), r"(?i)may|long")

    def test_single_capitalised_name_word_matches(self):
        self.assertEqual(sub(self.pattern, "Dr said Long was fine"), "Dr said [X] was fine")
        self.assertEqual(sub(self.pattern, "ask for May"), "ask for [X]")

    def test_name_word_inside_another_word_is_left_alone(self):
        self.assertEqual(sub(self.pattern, "Longer days, Mayfield"), "Longer days, Mayfield")

    def test_single_letter_and_missing_names_are_ignored(self):
        self.assertIsNone(dlp._name_pattern(None, ""))
        self.assertIsNone(dlp._name_pattern("J"))


class DatePatternTests(unittest.TestCase):
    def setUp(self):
        self.pattern = dlp._date_pattern(date(1988, 3, 12))

    def test_common_formats_match(self):
        for text in ["12/03/1988", "12-3-88", "1988-03-12", "12.3.1988", "3/12/1988",
                     "12th March 1988", "12 of mar 1988", "March 12, 1988", "MAR 12 1988"]:
            self.assertEqual(sub(self.pattern, text), "[X]", text)

    def test_other_dates_do_not_match(self):
        for text in ["13/03/1988", "12/03/1989", "12 April 1988"]:
            self.assertEqual(sub(self.pattern, text), text, text)

    def test_iso_string_input(self):
        self.assertEqual(dlp._date_pattern("1988-03-12T00:00:00"), self.pattern)

    def test_bad_input(self):
        self.assertIsNone(dlp._date_pattern("not a date"))
        self.assertIsNone(dlp._date_pattern(None))


class PhoneAndPhrasePatternTests(unittest.TestCase):
    def test_phone_matches_local_and_international_forms(self):
        pattern = dlp._phone_pattern("0412 345 678")
        for text in ["0412345678", "+61 412 345 678", "412-345-678", "(04) 1234 5678"]:
            self.assertIn("[X]", sub(pattern, text), text)
        self.assertEqual(sub(pattern, "0412 999 678"), "0412 999 678")

    def test_short_or_missing_phone_is_ignored(self):
        self.assertIsNone(dlp._phone_pattern("12345", None))

    def test_phrase_matches_in_any_case(self):
        pattern = dlp._phrase_pattern("May.Long@Example.com")
        self.assertEqual(sub(pattern, "email may.long@example.com"), "email [X]")
        self.assertEqual(sub(dlp._phrase_pattern("12 Fake Street"), "12 fake  street"), "[X]")


class PatientInfoTypeTests(unittest.TestCase):
    def test_all_patient_details_become_detectors(self):
        names = [t["info_type"]["name"] for t in dlp._patient_info_types(PATIENT)]
        self.assertEqual(names, [
            "PATIENT_NAME", "PATIENT_DOB", "PATIENT_PHONE", "PATIENT_EMAIL",
            "PATIENT_ADDRESS", "CONTACT_NAME", "CONTACT_PHONE",
        ])

    def test_missing_details_are_skipped(self):
        self.assertEqual(dlp._patient_info_types(None), [])
        names = [t["info_type"]["name"] for t in dlp._patient_info_types({"first_name": "May"})]
        self.assertEqual(names, ["PATIENT_NAME"])

    def test_name_detector_keeps_its_own_case_rules(self):
        # A blanket (?i) would bring back "a long time" -> "a [PATIENT_NAME] time"
        name_type = dlp._patient_info_types({"last_name": "Long"})[0]
        self.assertFalse(name_type["regex"]["pattern"].startswith("(?i)"))

    def test_rule_set_drops_patient_findings_inside_wider_ones(self):
        self.assertEqual(dlp._rule_set([]), dlp.RULE_SET)
        patient_types = dlp._patient_info_types(PATIENT)
        extra = dlp._rule_set(patient_types)[-1]
        self.assertEqual(extra["info_types"], [t["info_type"] for t in patient_types])
        excluded = extra["rules"][0]["exclusion_rule"]["exclude_info_types"]["info_types"]
        self.assertEqual(excluded, dlp.DETECTOR_INFO_TYPES)


class MaskTests(unittest.TestCase):
    """mask() with a fake DLP client: what it sends and how it fails."""

    def setUp(self):
        self.app = dlp_app(GCP_PROJECT="test-project")
        ctx = self.app.app_context()
        ctx.push()
        self.addCleanup(ctx.pop)

        self.client = MagicMock()
        self.client.deidentify_content.return_value = SimpleNamespace(
            item=SimpleNamespace(value="I'm [PATIENT_NAME]")
        )
        patcher = patch.object(dlp, "_client", return_value=self.client)
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_returns_masked_text_and_sends_patient_detectors(self):
        self.assertEqual(mask("I'm May", PATIENT), "I'm [PATIENT_NAME]")

        request = self.client.deidentify_content.call_args.kwargs["request"]
        self.assertEqual(request["parent"], "projects/test-project/locations/australia-southeast1")
        self.assertEqual(request["item"], {"value": "I'm May"})
        custom = [t["info_type"]["name"] for t in request["inspect_config"]["custom_info_types"]]
        self.assertIn("ARVI_MRN", custom)
        self.assertIn("PATIENT_NAME", custom)

    def test_disabled_returns_text_unchanged(self):
        self.app.config["DLP_ENABLED"] = False
        self.assertEqual(mask("I'm May", PATIENT), "I'm May")
        self.client.deidentify_content.assert_not_called()

    def test_blank_text_skips_dlp(self):
        for text in [None, "", "   "]:
            self.assertEqual(mask(text), text)
        self.client.deidentify_content.assert_not_called()

    def test_missing_project_raises(self):
        self.app.config["GCP_PROJECT"] = None
        with self.assertRaises(DLPUnavailable):
            mask("I'm May")

    def test_api_error_raises_and_logs_no_content(self):
        self.client.deidentify_content.side_effect = ServiceUnavailable("echo: I'm May")
        with self.assertLogs(self.app.logger, "ERROR") as logs:
            with self.assertRaises(DLPUnavailable):
                mask("I'm May")
        self.assertIn("ServiceUnavailable", logs.output[0])
        self.assertNotIn("May", logs.output[0])


@unittest.skipUnless(os.getenv("DLP_LIVE_TESTS") == "1", "set DLP_LIVE_TESTS=1 to call the real DLP API")
class LiveDLPTests(unittest.TestCase):
    """mask() against the real Google DLP API: checks the detectors and
    patterns actually work there (DLP runs regexes with RE2, not Python's re)."""

    def setUp(self):
        project = os.getenv("GCP_PROJECT")
        if not project:
            self.skipTest("GCP_PROJECT is not set")
        ctx = dlp_app(GCP_PROJECT=project).app_context()
        ctx.push()
        self.addCleanup(ctx.pop)

    def assertMasked(self, masked, *originals):
        for original in originals:
            self.assertNotIn(original.lower(), masked.lower(), masked)
        self.assertIn("[", masked)

    def test_patient_details_are_masked(self):
        masked = mask(
            "I'm May Long, born 12/03/1988. Call 0412 345 678 or email may.long@example.com. "
            "I live at 12 Fake Street, Sydney. My sister Rose Long is on (02) 9876 5432.",
            PATIENT,
        )
        self.assertMasked(masked, "May Long", "12/03/1988", "0412 345 678",
                          "may.long@example.com", "12 Fake Street", "Rose", "9876 5432")

    def test_bare_first_name_and_unlabelled_dob_are_masked(self):
        self.assertMasked(mask("May here, I was born March 12, 1988", PATIENT), "May", "March 12")

    def test_other_pii_is_masked_without_patient_details(self):
        masked = mask("Dr Kamal Silva has my MRN 12345678 and Medicare 2123 45670 1")
        self.assertMasked(masked, "Kamal", "Silva", "12345678", "2123 45670 1")

    def test_clinical_text_is_kept(self):
        text = "I've had headaches for a long time and I may be allergic to penicillin"
        self.assertEqual(mask(text, PATIENT), text)

    def test_text_without_pii_comes_back_unchanged(self):
        text = "Chest pain when climbing stairs, worse in the mornings"
        self.assertEqual(mask(text), text)


if __name__ == "__main__":
    unittest.main()
