import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateEmail, normalizePhone, safeCompareOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, value, code } = body;

    if (type !== "email" && type !== "phone") {
      return NextResponse.json({ error: "Invalid verification type" }, { status: 400 });
    }
    if (!code || !/^\d{6}$/.test(String(code).trim())) {
      return NextResponse.json({ error: "Please enter the 6-digit OTP" }, { status: 400 });
    }

    let target: string;
    if (type === "email") {
      if (!validateEmail(value)) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
      }
      target = String(value).trim();
    } else {
      const normalized = normalizePhone(value);
      if (!normalized) {
        return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
      }
      target = normalized;
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: target }, { phone: target }] },
    });

    if (!user) {
      return NextResponse.json({ error: "No account found" }, { status: 404 });
    }

    const token = await prisma.verificationToken.findFirst({
      where: { userId: user.id, type, target, used: false },
      orderBy: { createdAt: "desc" },
    });

    if (!token || token.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "OTP expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (!safeCompareOtp(token.codeHash, String(code).trim())) {
      return NextResponse.json({ error: "Incorrect OTP. Please try again." }, { status: 400 });
    }

    await prisma.verificationToken.updateMany({
      where: { userId: user.id, type, target, used: false },
      data: { used: true },
    });

    if (type === "email") {
      await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
    } else {
      await prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}