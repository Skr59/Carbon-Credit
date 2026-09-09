import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const listings = await prisma.listing.findMany({
    select: {
      id: true,
      title: true,
      credits: true,
      pricePerCreditINR: true,
      totalValueINR: true,
      status: true,
      listedAt: true,
      user: { select: { id: true, name: true, email: true, phone: true, village: true, state: true } },
    },
    orderBy: { listedAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ listings });
}