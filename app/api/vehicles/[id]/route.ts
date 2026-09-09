import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function DELETE(
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

    await prisma.vehicle.delete({ where: { id: vehicle.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Vehicle delete error:", err);
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
  }
}
