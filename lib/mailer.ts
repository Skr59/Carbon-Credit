import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  const host = process.env.EMAIL_SMTP_HOST;
  const user = process.env.EMAIL_SMTP_USER;
  const pass = process.env.EMAIL_SMTP_PASS;
  if (!host || !user || !pass) return null;
  if (!transporter) {
    const port = parseInt(process.env.EMAIL_SMTP_PORT || "587", 10);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return transporter;
}

export function emailConfigured(): boolean {
  return !!(process.env.EMAIL_SMTP_HOST && process.env.EMAIL_SMTP_USER && process.env.EMAIL_SMTP_PASS);
}

export async function sendOtpEmail(to: string, otp: string): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;
  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || `"Kisan Carbon" <${process.env.EMAIL_SMTP_USER}>`,
      to,
      subject: "Your Kisan Carbon verification code",
      text: `Your Kisan Carbon verification code is ${otp}. It is valid for 10 minutes. Do not share it with anyone.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(90deg,#16a34a,#059669);padding:20px;color:#fff;text-align:center">
            <h2 style="margin:0;font-size:20px">Kisan Carbon Hub</h2>
            <p style="margin:4px 0 0;opacity:.9">Verify your account</p>
          </div>
          <div style="padding:24px;color:#1f2937">
            <p>Hello,</p>
            <p>Use this code to verify your email address:</p>
            <div style="text-align:center;margin:20px 0">
              <span style="display:inline-block;font-size:32px;font-weight:800;letter-spacing:8px;
                background:#f0fdf4;border:2px dashed #16a34a;border-radius:12px;padding:12px 24px;color:#166534">${otp}</span>
            </div>
            <p style="font-size:13px;color:#6b7280">This code is valid for <b>10 minutes</b>. Do not share it with anyone.</p>
          </div>
          <div style="background:#f9fafb;padding:14px;text-align:center;font-size:11px;color:#9ca3af">
            Kisan Carbon · Earn money by saving the planet
          </div>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("[KISAN-OTP][EMAIL-SEND-FAILED]", err instanceof Error ? err.message : err);
    return false;
  }
}