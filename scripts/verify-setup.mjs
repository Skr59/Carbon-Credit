import { createInterface } from "readline/promises";
import { stdin, stdout } from "process";
import { writeFileSync, readFileSync, existsSync } from "fs";
import path from "path";
import nodemailer from "nodemailer";

const ENV_PATH = path.resolve(process.cwd(), ".env");
const rl = createInterface({ input: stdin, output: stdout });

function loadEnv() {
  const out = {};
  if (existsSync(ENV_PATH)) {
    for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)\s*=\s*("?")(.*)\2$/);
      if (m) out[m[1]] = m[3];
    }
  }
  return out;
}

function saveEnv(env) {
  const lines = [
    `DATABASE_URL="${env.DATABASE_URL}"`,
    `JWT_SECRET="${env.JWT_SECRET}"`,
    "",
    "# Email verification via Gmail SMTP (Gmail App Password)",
    `EMAIL_SMTP_HOST="${env.EMAIL_SMTP_HOST || "smtp.gmail.com"}"`,
    `EMAIL_SMTP_PORT="${env.EMAIL_SMTP_PORT || "587"}"`,
    `EMAIL_SMTP_USER="${env.EMAIL_SMTP_USER || ""}"`,
    `EMAIL_SMTP_PASS="${env.EMAIL_SMTP_PASS || ""}"`,
    `EMAIL_FROM="${env.EMAIL_FROM || `Kisan Carbon <${env.EMAIL_SMTP_USER || "yourgmail@gmail.com"}>`}"`,
    "",
    "# SMS verification via Fast2SMS (transactional route with DLT template)",
    `SMS_API_KEY="${env.SMS_API_KEY || ""}"`,
    `SMS_SENDER_ID="${env.SMS_SENDER_ID || ""}"`,
    `SMS_OTP_TEMPLATE_ID="${env.SMS_OTP_TEMPLATE_ID || ""}"`,
    `SMS_OTP_MSG="${env.SMS_OTP_MSG || "{otp} is your Kisan Carbon verification OTP. It is valid for 10 minutes. Do not share it with anyone."}"`,
  ];
  writeFileSync(ENV_PATH, lines.join("\n") + "\n");
}

const env = loadEnv();
const otp = String(Math.floor(100000 + Math.random() * 900000));

async function testEmail(to) {
  if (!env.EMAIL_SMTP_USER || !env.EMAIL_SMTP_PASS) {
    console.log("[SKIP] Email test skipped - EMAIL_SMTP_USER / EMAIL_SMTP_PASS are empty");
    return false;
  }
  const port = parseInt(env.EMAIL_SMTP_PORT || "587", 10);
  const transporter = nodemailer.createTransport({
    host: env.EMAIL_SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: env.EMAIL_SMTP_USER, pass: env.EMAIL_SMTP_PASS },
  });
  const info = await transporter.sendMail({
    from: env.EMAIL_FROM || `"Kisan Carbon" <${env.EMAIL_SMTP_USER}>`,
    to,
    subject: "Kisan Carbon - live OTP test",
    text: `Test OTP: ${otp}`,
  });
  console.log(`[EMAIL SENT] to ${to} (message id ${info.messageId})`);
  return true;
}

async function testSms(to) {
  if (!env.SMS_API_KEY) {
    console.log("[SKIP] SMS test skipped - SMS_API_KEY is empty");
    return false;
  }
  const message = (env.SMS_OTP_MSG || "{otp} is your Kisan Carbon verification OTP.").replace(/\{otp\}/g, otp);
  const params = new URLSearchParams();
  params.set("route", "q");
  params.set("message", message);
  params.set("language", "english");
  params.set("flash", "0");
  params.set("numbers", String(to).replace("+", ""));
  if (env.SMS_OTP_TEMPLATE_ID) params.set("template_id", env.SMS_OTP_TEMPLATE_ID);
  if (env.SMS_SENDER_ID) params.set("sender_id", env.SMS_SENDER_ID);

  const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: { authorization: env.SMS_API_KEY, "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (data.return === true || res.ok) {
    console.log(`[SMS SENT] to ${to} (request ${data.request_id || "ok"})`);
    return true;
  }
  console.error(`[SMS FAILED] ${JSON.stringify(data)}`);
  return false;
}

console.log("==============================================");
console.log("  Kisan Carbon - Live email + SMS OTP setup");
console.log("==============================================");

env.EMAIL_SMTP_USER = (await rl.question(`Gmail address [${env.EMAIL_SMTP_USER || "blank"}]: `)) || env.EMAIL_SMTP_USER;
env.EMAIL_SMTP_PASS = (await rl.question("Gmail App Password (16-char, not your normal password): ")) || env.EMAIL_SMTP_PASS;
env.SMS_API_KEY = (await rl.question(`Fast2SMS authorization key [${env.SMS_API_KEY || "blank"}]: `)) || env.SMS_API_KEY;
env.SMS_SENDER_ID = (await rl.question(`Fast2SMS sender ID [${env.SMS_SENDER_ID || "blank"}]: `)) || env.SMS_SENDER_ID;
env.SMS_OTP_TEMPLATE_ID = (await rl.question(`Fast2SMS DLT template ID [${env.SMS_OTP_TEMPLATE_ID || "blank"}]: `)) || env.SMS_OTP_TEMPLATE_ID;
env.SMS_OTP_MSG = (await rl.question(`SMS OTP template text [$(default)]: `)) || env.SMS_OTP_MSG || "{otp} is your Kisan Carbon verification OTP. It is valid for 10 minutes. Do not share it with anyone.";

saveEnv(env);
console.log("Saved .env");

const testEmailAddr = await rl.question("Test email address to receive the live email: ");
const testPhone = await rl.question("Test mobile number to receive the live SMS (10-digit, with or without +91): ");

await testEmail(testEmailAddr);
await testSms(testPhone);

console.log(`== Test OTP used: ${otp}. Check your inbox / SMS. ==`);
console.log("Next: restart the app (stop & run `npm run dev`), then register a new user - OTPs will be delivered for real.");
rl.close();