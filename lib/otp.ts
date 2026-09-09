import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail, emailConfigured } from "@/lib/mailer";
import { sendOtpSms, smsConfigured } from "@/lib/sms";

export const OTP_TTL_MS = 10 * 60 * 1000;
export const DEV_OTP_ALLOWED = process.env.ALLOW_DEV_OTP !== "false";

export function validateEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
}

export function normalizePhone(v: string): string | null {
  let p = String(v).trim().replace(/[\s\-]/g, "");
  if (p.startsWith("+91")) p = p.slice(3);
  else if (p.startsWith("91") && p.length === 12) p = p.slice(2);
  if (/^[6-9]\d{9}$/.test(p)) return "+91" + p;
  return null;
}

export function generateOtp(): string {
  return String(crypto.randomInt(100000, 1000000));
}

export function hashOtp(code: string): string {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

export function safeCompareOtp(hash: string, code: string): boolean {
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(hashOtp(code), "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const MAX_OTP_PER_HOUR = 6;

export async function otpBudgetOk(userId: string): Promise<boolean> {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await prisma.verificationToken.count({
    where: { userId, createdAt: { gte: hourAgo } },
  });
  return recent < MAX_OTP_PER_HOUR;
}

export async function createOtp(
  userId: string,
  type: "email" | "phone",
  target: string
): Promise<string | null> {
  const code = generateOtp();
  await prisma.verificationToken.create({
    data: {
      userId,
      type,
      target,
      codeHash: hashOtp(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  console.log(`[KISAN-OTP][${type.toUpperCase()}] ${target} -> ${code} (valid 10 min)`);

  if (type === "email" && emailConfigured()) {
    if (await sendOtpEmail(target, code)) return null;
  } else if (type === "phone" && smsConfigured()) {
    if (await sendOtpSms(target, code)) return null;
  }

  return DEV_OTP_ALLOWED ? code : null;
}