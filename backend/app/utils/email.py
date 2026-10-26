import resend
from flask import current_app


def send_email(to: str, subject: str, html: str) -> bool:
    """Sends one email through Resend. Returns False instead of raising.

    Without RESEND_API_KEY (local development) nothing is sent; the email is
    written to the log so links can still be followed.
    """
    api_key = current_app.config.get("RESEND_API_KEY")
    if not api_key:
        current_app.logger.warning(
            "RESEND_API_KEY not set, email not sent.\nTo: %s\nSubject: %s\n%s",
            to, subject, html,
        )
        return False

    resend.api_key = api_key
    try:
        resend.Emails.send({
            "from": f"Arvi Health <{current_app.config['SENDER_EMAIL']}>",
            "to": [to],
            "subject": subject,
            "html": html,
        })
    except Exception:
        current_app.logger.exception("Sending email to %s failed", to)
        return False
    return True
