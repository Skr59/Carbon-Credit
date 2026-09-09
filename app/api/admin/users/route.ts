import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const role = searchParams.get("role") || "";

  const users = await prisma.user.findMany({
    where: {
      AND: [
        role ? { role } : {},
        q
          ? {
              OR: [
                { name: { contains: q } },
                { email: { contains: q } },
                { phone: { contains: q } },
                { village: { contains: q } },
              ],
            }
          : {},
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      emailVerified: true,
      phoneVerified: true,
      village: true,
      state: true,
      createdAt: true,
      _count: { select: { lands: true, trees: true, listings: true, vehicles: true, licences: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ users });
}