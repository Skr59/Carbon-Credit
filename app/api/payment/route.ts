import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.user.userId },
    select: {
      upiId: true,
      acHolderName: true,
      bankName: true,
      accountNumber: true,
      ifsc: true,
    },
  });

  return NextResponse.json({ payment: user });
}

export async function PUT(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { upiId, acHolderName, bankName, accountNumber, ifsc } = body || {};

    if (!upiId && !accountNumber) {
      return NextResponse.json(
        { error: "Provide either a UPI ID or bank account details" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: auth.user.userId },
      data: {
        upiId: upiId?.trim() || null,
        acHolderName: acHolderName?.trim() || null,
        bankName: bankName?.trim() || null,
        accountNumber: accountNumber?.trim() || null,
        ifsc: ifsc?.trim() || null,
      },
      select: {
        upiId: true,
        acHolderName: true,
        bankName: true,
        accountNumber: true,
        ifsc: true,
      },
    });

    return NextResponse.json({ payment: user });
  } catch (err) {
    console.error("Payment save error:", err);
    return NextResponse.json({ error: "Failed to save payment details" }, { status: 500 });
  }
}
