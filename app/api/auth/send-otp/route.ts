import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateEmail, normalizePhone, createOtp, otpBudgetOk } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, value } = body;

    if (type !== "email" && type !== "phone") {
      return NextResponse.json({ error: "Invalid verification type" }, { status: 400 });
    }

    let target: string;
    if (type === "email") {
      if (!validateEmail(value)) {
        return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
      }
      target = String(value).trim();
    } else {
      const normalized = normalizePhone(value);
      if (!normalized) {
        return NextResponse.json(
          { error: "Please enter a valid 10-digit Indian mobile number" },
          { status: 400 }
        );
      }
      target = normalized;
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: target }, { phone: target }] },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found for this " + (type === "email" ? "email" : "phone") },
        { status: 404 }
      );
    }

    if (!(await otpBudgetOk(user.id))) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please wait an hour and try again." },
        { status: 429 }
      );
    }

    const devOtp = await createOtp(user.id, type, target);

    return NextResponse.json({ ok: true, devOtp });
  } catch (err) {
    console.error("Send OTP error:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}