import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req);
  if (!auth) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.emailVerified === "boolean") data.emailVerified = body.emailVerified;
  if (typeof body.phoneVerified === "boolean") data.phoneVerified = body.phoneVerified;
  if (body.role === "admin" || body.role === "farmer") data.role = body.role;

  if (data.role === "farmer" && params.id === auth.user.userId) {
    return NextResponse.json({ error: "You cannot remove your own admin access" }, { status: 400 });
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  return NextResponse.json({ user });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req);
  if (!auth) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  if (params.id === auth.user.userId) {
    return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}