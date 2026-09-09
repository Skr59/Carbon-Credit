import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Params = { params: { id: string } };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(_req);
  if (!auth) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  await prisma.listing.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}