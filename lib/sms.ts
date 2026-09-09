const FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2";

export function smsConfigured(): boolean {
  return !!(process.env.SMS_API_KEY);
}

export function defaultSmsMessage(otp: string): string {
  return `${otp} is your Kisan Carbon verification OTP. It is valid for 10 minutes. Do not share it with anyone.`;
}

export async function sendOtpSms(to: string, otp: string): Promise<boolean> {
  const apiKey = process.env.SMS_API_KEY;
  if (!apiKey) return false;
  try {
    const numbers = to.replace("+", "");
    const message = (process.env.SMS_OTP_MSG || defaultSmsMessage(otp)).replace(/\{otp\}/g, otp).replace(/\{otp\}/g, otp);
    const params = new URLSearchParams();
    params.set("route", "q");
    params.set("message", message);
    params.set("language", "english");
    params.set("flash", "0");
    params.set("numbers", numbers);
    if (process.env.SMS_OTP_TEMPLATE_ID) params.set("template_id", process.env.SMS_OTP_TEMPLATE_ID);
    if (process.env.SMS_SENDER_ID) params.set("sender_id", process.env.SMS_SENDER_ID);

    const res = await fetch(FAST2SMS_URL, {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const data = await res.json().catch(() => ({}));
    if (data.return === true || res.ok) {
      return true;
    }
    console.error("[KISAN-OTP][SMS-SEND-FAILED]", JSON.stringify(data));
    return false;
  } catch (err) {
    console.error("[KISAN-OTP][SMS-SEND-FAILED]", err instanceof Error ? err.message : err);
    return false;
  }
}