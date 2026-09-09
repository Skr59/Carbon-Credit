import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: params.id, userId: auth.user.userId },
    });
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const body = await req.json();
    const { date, distanceKm, routeName, notes } = body as {
      date?: string;
      distanceKm?: number;
      routeName?: string;
      notes?: string;
    };

    if (distanceKm == null || isNaN(distanceKm) || distanceKm <= 0) {
      return NextResponse.json({ error: "Distance must be a positive number" }, { status: 400 });
    }

    const emissionKg = (distanceKm * vehicle.emissionGPerKm) / 1000;

    const trip = await prisma.trip.create({
      data: {
        vehicleId: vehicle.id,
        date: date ? new Date(date) : new Date(),
        distanceKm,
        routeName: routeName || null,
        notes: notes || null,
        emissionKg,
      },
    });

    return NextResponse.json({ trip }, { status: 201 });
  } catch (err) {
    console.error("Trip create error:", err);
    return NextResponse.json({ error: "Failed to add trip" }, { status: 500 });
  }
}
