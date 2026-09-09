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

  const trip = await prisma.trip.findFirst({
    where: { id: params.id, vehicle: { userId: auth.user.userId } },
  });
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  await prisma.trip.delete({ where: { id: trip.id } });
  return NextResponse.json({ ok: true });
}