import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const listings = await prisma.listing.findMany({
    orderBy: { listedAt: "desc" },
    include: {
      user: {
        select: { name: true, village: true, state: true, upiId: true, acHolderName: true, bankName: true, accountNumber: true, ifsc: true },
      },
    },
  });

  return NextResponse.json({ listings });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, credits, pricePerCreditINR, landId } = body;

    if (!credits || !pricePerCreditINR) {
      return NextResponse.json({ error: "Credits and price are required" }, { status: 400 });
    }

    const listing = await prisma.listing.create({
      data: {
        userId: auth.user.userId,
        title: title || `${auth.user.name}'s credits`,
        landId: landId || null,
        credits,
        pricePerCreditINR,
        totalValueINR: credits * pricePerCreditINR,
        status: "active",
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (err) {
    console.error("Listing create error:", err);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
