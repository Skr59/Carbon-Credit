import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone, password } = body;

    const identifier = email || phone;
    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/phone and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.role !== "admin" && (!user.emailVerified || !user.phoneVerified)) {
      return NextResponse.json(
        {
          error: "verify_required",
          needsVerification: true,
          email: user.email,
          phone: user.phone,
        },
        { status: 403 }
      );
    }

    const token = signToken(user);

    const res = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        village: user.village,
        state: user.state,
      },
      token,
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Failed to login. Please try again." }, { status: 500 });
  }
}
