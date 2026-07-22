"""
Email service for transactional mail (password reset, etc.).

Reads SMTP credentials from environment variables:
  SMTP_HOST      (default: localhost)
  SMTP_PORT      (default: 587)
  SMTP_USER      optional – skip auth if blank
  SMTP_PASSWORD  optional – skip auth if blank
  SMTP_FROM      (default: noreply@beancompassatl.com)
  SMTP_TLS       "true" / "false"  (default: true)
  APP_BASE_URL   used to build reset links (default: http://localhost:3000)

In development: when SMTP_HOST is not configured (or sending fails),
the reset link is printed to the console so you can use it immediately
without any mail server.
"""

import asyncio
import logging
import os
import smtplib
from email.message import EmailMessage

logger = logging.getLogger(__name__)

_SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
_SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
_SMTP_USER = os.getenv("SMTP_USER", "").strip()
_SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").strip()
_SMTP_FROM = os.getenv("SMTP_FROM", "noreply@beancompassatl.com")
_SMTP_TLS = os.getenv("SMTP_TLS", "true").lower() != "false"
_APP_BASE_URL = os.getenv("APP_BASE_URL", "http://localhost:3000").rstrip("/")


def _build_reset_url(token: str) -> str:
    return f"{_APP_BASE_URL}/reset-password?token={token}"


def _send_blocking(to: str, subject: str, body_text: str, body_html: str) -> None:
    """Blocking SMTP send — run inside asyncio.to_thread."""
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = _SMTP_FROM
    msg["To"] = to
    msg.set_content(body_text)
    msg.add_alternative(body_html, subtype="html")

    if _SMTP_TLS:
        with smtplib.SMTP(_SMTP_HOST, _SMTP_PORT) as conn:
            conn.ehlo()
            conn.starttls()
            if _SMTP_USER and _SMTP_PASSWORD:
                conn.login(_SMTP_USER, _SMTP_PASSWORD)
            conn.send_message(msg)
    else:
        with smtplib.SMTP(_SMTP_HOST, _SMTP_PORT) as conn:
            if _SMTP_USER and _SMTP_PASSWORD:
                conn.login(_SMTP_USER, _SMTP_PASSWORD)
            conn.send_message(msg)


async def send_password_reset_email(to_email: str, raw_token: str) -> None:
    """Send the password-reset email.  Falls back to console logging in dev."""
    reset_url = _build_reset_url(raw_token)

    subject = "Reset your BeanCompassATL password"
    body_text = (
        f"Hi,\n\n"
        f"You requested a password reset for your BeanCompassATL account.\n\n"
        f"Click the link below to set a new password. It expires in 1 hour.\n\n"
        f"{reset_url}\n\n"
        f"If you didn't request this, you can safely ignore this email.\n\n"
        f"— The BeanCompassATL Team"
    )
    body_html = f"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="font-family:sans-serif;background:#f9f8f6;margin:0;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;
              padding:32px;border:1px solid #fde68a">
    <div style="text-align:center;margin-bottom:24px">
      <div style="display:inline-flex;align-items:center;gap:8px">
        <span style="font-size:24px">☕</span>
        <span style="font-weight:700;color:#78350f;font-size:18px">BeanCompassATL</span>
      </div>
    </div>
    <h1 style="color:#78350f;font-size:22px;margin:0 0 12px">Reset your password</h1>
    <p style="color:#374151;line-height:1.6;margin:0 0 24px">
      You requested a password reset. Click the button below — this link
      expires in <strong>1 hour</strong>.
    </p>
    <a href="{reset_url}"
       style="display:inline-block;background:#92400e;color:#fff;
              text-decoration:none;padding:12px 28px;border-radius:9999px;
              font-weight:600;font-size:15px">
      Reset Password
    </a>
    <p style="color:#6b7280;font-size:13px;margin:24px 0 0">
      If you didn't request this, ignore this email — your password won't change.
    </p>
    <hr style="border:none;border-top:1px solid #fde68a;margin:24px 0">
    <p style="color:#9ca3af;font-size:12px;margin:0">© 2026 BeanCompassATL</p>
  </div>
</body>
</html>
"""

    if not _SMTP_HOST:
        # Dev mode: no SMTP configured — print the link so it's immediately usable.
        logger.warning(
            "\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            "  PASSWORD RESET LINK (dev mode — no SMTP set)\n"
            f"  → {reset_url}\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        )
        return

    try:
        await asyncio.to_thread(_send_blocking, to_email, subject, body_text, body_html)
        logger.info("Password-reset email sent to %s", to_email)
    except Exception:
        # Never leak SMTP errors to the client; log and fall back to console.
        logger.exception("Failed to send password-reset email to %s; printing reset URL", to_email)
        logger.warning("Password-reset URL for %s: %s", to_email, reset_url)
