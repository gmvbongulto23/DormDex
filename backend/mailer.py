"""Sends the 6-digit verification code.

- RESEND_API_KEY set  -> the code is emailed through Resend (free tier at resend.com).
- RESEND_API_KEY unset -> DEMO MODE: no email is sent; the code is printed in the server log
  and returned to the frontend so the flow can be demoed. The UI must label this "Demo mode".
"""
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
EMAIL_FROM = os.getenv("EMAIL_FROM", "DormDex <onboarding@resend.dev>")
DEMO_MODE = not RESEND_API_KEY


def send_code(to_email: str, code: str, listing_name: str) -> None:
    if DEMO_MODE:
        print(f"[mailer] DEMO MODE, no email sent. Code for {to_email}: {code}")
        return
    resp = httpx.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
        json={
            "from": EMAIL_FROM,
            "to": [to_email],
            "subject": f"Your DormDex code: {code}",
            "text": (
                f"Your code to publish your review of {listing_name} is {code}.\n"
                "It expires in 15 minutes. If you didn't write a review on DormDex, ignore this email."
            ),
        },
        timeout=10,
    )
    if resp.status_code >= 400:
        print(f"[mailer] Resend error {resp.status_code}: {resp.text[:200]}")
        raise RuntimeError("Could not send the verification email. Try again in a minute.")