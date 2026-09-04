import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

type Params = { id: string };

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const land = await prisma.land.findFirst({
      where: { id, userId: auth.user.userId },
    });

    if (!land) {
      return NextResponse.json({ error: "Land not found" }, { status: 404 });
    }

    await prisma.land.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Land deleted" });
  } catch (err) {
    console.error("Land delete error:", err);
    return NextResponse.json({ error: "Failed to delete land" }, { status: 500 });
  }
}
