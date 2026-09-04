import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { species, ageYears, heightM, imageBase64, lat, lng, locationName, landId } = body;

    if (!species || lat == null || lng == null) {
      return NextResponse.json({ error: "Species and location are required" }, { status: 400 });
    }

    const co2PerTree = (heightM || 5) * 0.6 * (ageYears || 1) * 2.5;
    const estCO2Kg = Math.max(0, co2PerTree);
    const estValueINR = estCO2Kg * 0.9;

    const tree = await prisma.tree.create({
      data: {
        userId: auth.user.userId,
        landId: landId || null,
        species,
        ageYears: ageYears || 1,
        heightM: heightM || 5,
        imageBase64: imageBase64 || null,
        lat,
        lng,
        locationName: locationName || null,
        estCO2Kg,
        estValueINR,
      },
    });

    return NextResponse.json({ tree }, { status: 201 });
  } catch (err) {
    console.error("Tree create error:", err);
    return NextResponse.json({ error: "Failed to add tree" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const trees = await prisma.tree.findMany({
    where: { userId: auth.user.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ trees });
}
