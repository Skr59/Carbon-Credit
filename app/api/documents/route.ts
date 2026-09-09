import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.user.userId },
    select: {
      id: true,
      name: true,
      aadharNumber: true,
      aadharImage: true,
      dlNumber: true,
      dlImage: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ documents: user });
}

export async function PUT(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { aadharNumber, aadharImage, dlNumber, dlImage } = body as {
      aadharNumber?: string;
      aadharImage?: string;
      dlNumber?: string;
      dlImage?: string;
    };

    if (aadharNumber && !/^[0-9]{12}$/.test(aadharNumber)) {
      return NextResponse.json({ error: "Aadhar number must be exactly 12 digits" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: auth.user.userId },
      data: {
        aadharNumber: aadharNumber !== undefined ? aadharNumber : undefined,
        aadharImage: aadharImage !== undefined ? aadharImage : undefined,
        dlNumber: dlNumber !== undefined ? dlNumber : undefined,
        dlImage: dlImage !== undefined ? dlImage : undefined,
      },
      select: {
        id: true,
        name: true,
        aadharNumber: true,
        aadharImage: true,
        dlNumber: true,
        dlImage: true,
      },
    });

    return NextResponse.json({ documents: user });
  } catch (err) {
    console.error("Documents update error:", err);
    return NextResponse.json({ error: "Failed to save documents" }, { status: 500 });
  }
}
