import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "carbon-credit-farmer-super-secret-key-2026";

export interface JwtPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export function signToken(user: { id: string; name: string; email: string; role: string }) {
  return jwt.sign(
    { userId: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  const cookie = req.cookies.get("token");
  return cookie?.value || null;
}

export function requireAuth(req: NextRequest): { token: string; user: JwtPayload } | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const user = verifyToken(token);
  if (!user) return null;
  return { token, user };
}

export async function requireAdmin(req: NextRequest): Promise<{ token: string; user: JwtPayload } | null> {
  const auth = requireAuth(req);
  if (!auth) return null;
  const dbUser = await prisma.user.findUnique({
    where: { id: auth.user.userId },
    select: { id: true, role: true },
  });
  if (!dbUser || dbUser.role !== "admin") return null;
  return auth;
}
