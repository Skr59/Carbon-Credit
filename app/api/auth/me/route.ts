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
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      emailVerified: true,
      phoneVerified: true,
      village: true,
      state: true,
      upiId: true,
      acHolderName: true,
      bankName: true,
      accountNumber: true,
      ifsc: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
