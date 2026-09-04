import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getCreditsPerHa, CREDIT_PRICE_INR } from "@/lib/carbonRates";

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, village, district, state, areaHa, areaAcres, lat, lng, polygons, vegetationType, treeType, cropType, soilType, waterSource } = body;

    if (!title || !village || !state || areaHa == null || lat == null || lng == null) {
      return NextResponse.json({ error: "Missing required land details" }, { status: 400 });
    }

    const typeKey = treeType || vegetationType || "mango";
    const estCreditsPerHa = getCreditsPerHa(typeKey);
    const estTotalCredits = estCreditsPerHa * areaHa;
    const estValueINR = estTotalCredits * CREDIT_PRICE_INR;

    const land = await prisma.land.create({
      data: {
        userId: auth.user.userId,
        ownerName: auth.user.name,
        title,
        village,
        district,
        state,
        areaHa,
        areaAcres,
        lat,
        lng,
        polygons: polygons ? JSON.stringify(polygons) : null,
        vegetationType: typeKey,
        cropType: cropType || null,
        soilType: soilType || null,
        waterSource: waterSource || null,
        estCreditsPerHa,
        estTotalCredits,
        estValueINR,
      },
    });

    return NextResponse.json({ land }, { status: 201 });
  } catch (err) {
    console.error("Land create error:", err);
    return NextResponse.json({ error: "Failed to register land" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const lands = await prisma.land.findMany({
    where: { userId: auth.user.userId },
    orderBy: { registeredAt: "desc" },
    include: { trees: true },
  });

  return NextResponse.json({ lands });
}
