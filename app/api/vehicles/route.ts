import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getEmissionGPerKm } from "@/lib/vehicleRates";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: auth.user.userId },
    orderBy: { createdAt: "desc" },
    include: { trips: { orderBy: { date: "desc" } } },
  });

  return NextResponse.json({ vehicles });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, category, fuel, make, model, regNumber, year, typeKey } = body as {
      name?: string;
      category?: string;
      fuel?: string;
      make?: string;
      model?: string;
      regNumber?: string;
      year?: number;
      typeKey?: string;
    };

    if (!name || !category) {
      return NextResponse.json({ error: "Vehicle name and category are required" }, { status: 400 });
    }

    const emissionGPerKm = getEmissionGPerKm(typeKey);

    const vehicle = await prisma.vehicle.create({
      data: {
        userId: auth.user.userId,
        name,
        category,
        fuel: fuel || "petrol",
        make: make || name,
        model: model || "",
        regNumber: regNumber || null,
        year: year || null,
        emissionGPerKm,
      },
      include: { trips: true },
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (err) {
    console.error("Vehicle create error:", err);
    return NextResponse.json({ error: "Failed to add vehicle" }, { status: 500 });
  }
}
