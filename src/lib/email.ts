/** Send transactional emails via Resend API.
 *
 *  Env var required: RESEND_API_KEY
 *
 *  Free tier: 100 emails/day — more than enough for admin OTPs.
 *  Sign up at https://resend.com and add the API key to Vercel env vars.
 *
 *  By default sends from "onboarding@resend.dev" (Resend's sandbox).
 *  To use a custom "from" address, verify your domain in Resend and set
 *  RESEND_FROM_EMAIL (e.g. "Tesmaraneh <no-reply@tesmaranehclothing.com>").
 */

const RESEND_URL = "https://api.resend.com/emails";

function getApiKey(): string | null {
  return process.env.RESEND_API_KEY ?? null;
}

function getFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL ?? "Tesmaraneh <onboarding@resend.dev>"
  );
}

export async function sendOtpEmail(
  to: string,
  code: string
): Promise<boolean> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY not configured — cannot send OTP");
    return false;
  }

  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: [to],
        subject: `${code} is your Tesmaraneh login code`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #F3920F; margin-right: 8px;"></div>
              <span style="font-size: 12px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #78716c;">Tesmaraneh Admin</span>
            </div>
            <h1 style="font-size: 24px; font-weight: 700; color: #1c1917; text-align: center; margin: 0 0 8px;">
              Your login code
            </h1>
            <p style="font-size: 14px; color: #78716c; text-align: center; margin: 0 0 32px;">
              Enter this code to sign in to the admin dashboard.
            </p>
            <div style="background: #fafaf9; border: 2px solid #e7e5e4; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <span style="font-family: monospace; font-size: 36px; font-weight: 700; letter-spacing: 0.3em; color: #1c1917;">
                ${code}
              </span>
            </div>
            <p style="font-size: 12px; color: #a8a29e; text-align: center; margin: 0;">
              This code expires in 10 minutes. If you didn't request this, ignore this email.
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[email] Resend returned ${res.status}:`, text);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[email] Failed to send OTP email:", err);
    return false;
  }
}
