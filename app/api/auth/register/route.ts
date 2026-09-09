import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validateEmail, normalizePhone, createOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, village, state } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Name, email, phone and password are required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: email.trim() }, { phone: normalizedPhone }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email or phone already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.trim(),
        phone: normalizedPhone,
        passwordHash,
        village,
        state,
        role: "farmer",
      },
    });

    const devEmail = await createOtp(user.id, "email", user.email);
    const devPhone = await createOtp(user.id, "phone", user.phone);

    return NextResponse.json(
      {
        needsVerification: true,
        email: user.email,
        phone: user.phone,
        devEmail,
        devPhone,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Failed to register. Please try again." }, { status: 500 });
  }
}