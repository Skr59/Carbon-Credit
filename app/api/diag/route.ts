import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const out: Record<string, unknown> = {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    dbHost: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/\/\/[^@]*@/, "//***:***@").split("?")[0]
      : null,
    hasJwtSecret: !!process.env.JWT_SECRET,
    prismaEngineEnv: process.env.PRISMA_QUERY_ENGINE_LIBRARY || null,
  };

  try {
    const n = await prisma.user.count();
    out.dbOk = true;
    out.userCount = n;
  } catch (e) {
    out.dbOk = false;
    out.dbError = e instanceof Error ? e.message : String(e);
    out.dbStack = e instanceof Error ? (e.stack || "").split("\n").slice(0, 6) : null;
  }

  return NextResponse.json(out, { status: 200 });
}
