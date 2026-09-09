import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { CREDIT_PRICE_INR } from "@/lib/carbonRates";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const licences = await prisma.licence.findMany({
    where: { userId: auth.user.userId },
    orderBy: { purchasedAt: "desc" },
  });

  return NextResponse.json({ licences });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { co2OffsetKg, credits } = body as { co2OffsetKg?: number; credits?: number };

    const offsetKg = Number(co2OffsetKg);
    if (isNaN(offsetKg) || offsetKg < 0) {
      return NextResponse.json({ error: "Invalid CO2 offset amount" }, { status: 400 });
    }

    const totalCredits = Number(credits) && !isNaN(Number(credits)) ? Number(credits) : Math.max(0.001, offsetKg / 1000);
    const totalValueINR = totalCredits * CREDIT_PRICE_INR;

    const licence = await prisma.licence.create({
      data: {
        userId: auth.user.userId,
        type: "vehicle",
        co2OffsetKg: offsetKg,
        credits: totalCredits,
        totalValueINR,
        status: "active",
      },
    });

    return NextResponse.json({ licence }, { status: 201 });
  } catch (err) {
    console.error("Licence create error:", err);
    return NextResponse.json({ error: "Failed to purchase licence" }, { status: 500 });
  }
}
