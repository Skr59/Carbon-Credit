import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { CREDIT_PRICE_INR } from "@/lib/carbonRates";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const [users, lands, trees, listings, vehicles, licences, trips] = await Promise.all([
    prisma.user.findMany({ select: { id: true, emailVerified: true, phoneVerified: true } }),
    prisma.land.findMany({ select: { estTotalCredits: true, areaHa: true } }),
    prisma.tree.findMany({ select: { estCO2Kg: true } }),
    prisma.listing.findMany({ select: { credits: true, id: true } }),
    prisma.vehicle.findMany({ select: { id: true } }),
    prisma.licence.findMany({ select: { id: true } }),
    prisma.trip.findMany({ select: { id: true } }),
  ]);

  const totalCredits =
    lands.reduce((s, l) => s + l.estTotalCredits, 0) +
    trees.reduce((s, t) => s + t.estCO2Kg, 0) / 1000;
  const verified = users.filter((u) => u.emailVerified && u.phoneVerified).length;

  return NextResponse.json({
    stats: {
      totalUsers: users.length,
      verifiedUsers: verified,
      pendingVerification: users.length - verified,
      totalLands: lands.length,
      totalTrees: trees.length,
      totalAreaHa: lands.reduce((s, l) => s + l.areaHa, 0),
      totalVehicles: vehicles.length,
      totalLicences: licences.length,
      totalTrips: trips.length,
      totalCredits,
      totalValueINR: Math.round(totalCredits * CREDIT_PRICE_INR),
      activeListings: listings.length,
      listedCredits: listings.reduce((s, l) => s + l.credits, 0),
      creditPriceINR: CREDIT_PRICE_INR,
    },
  });
}