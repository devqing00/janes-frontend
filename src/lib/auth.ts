import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("[auth] ADMIN_JWT_SECRET env var is not set — admin auth will be unavailable.");
}
const secret = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;
const COOKIE_NAME = "janes-admin-token";

export async function signToken(payload: Record<string, unknown>) {
  if (!secret) throw new Error("ADMIN_JWT_SECRET is not configured. Cannot sign tokens.");
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function authCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}
