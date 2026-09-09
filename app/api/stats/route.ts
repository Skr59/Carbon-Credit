import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { CREDIT_PRICE_INR } from "@/lib/carbonRates";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [lands, trees, listings] = await Promise.all([
    prisma.land.findMany({ where: { userId: auth.user.userId } }),
    prisma.tree.findMany({ where: { userId: auth.user.userId } }),
    prisma.listing.findMany({ where: { userId: auth.user.userId } }),
  ]);

  const totalCredits = lands.reduce((s, l) => s + l.estTotalCredits, 0);
  const treeCO2 = trees.reduce((s, t) => s + t.estCO2Kg, 0);
  const treeCredits = treeCO2 / 1000;
  const grandCredits = totalCredits + treeCredits;
  const totalValueINR = Math.round(grandCredits * CREDIT_PRICE_INR);
  const listedCredits = listings.reduce((s, l) => s + l.credits, 0);

  return NextResponse.json({
    stats: {
      landCount: lands.length,
      treeCount: trees.length,
      totalAreaHa: lands.reduce((s, l) => s + l.areaHa, 0),
      totalCredits: totalCredits + treeCredits,
      totalValueINR,
      listedCredits,
      activeListings: listings.length,
    },
  });
}
