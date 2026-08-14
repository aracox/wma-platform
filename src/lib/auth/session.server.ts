import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { User, UserRole } from "@/types";

const SESSION_COOKIE_NAME = "auth_token";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const DEV_FALLBACK_SECRET = "dev-only-insecure-auth-secret-do-not-use-in-prod";

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET || process.env.OTP_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") return DEV_FALLBACK_SECRET;
  throw new Error("AUTH_SECRET must be configured in production environment.");
}

interface SessionPayload {
  user: User;
  exp: number;
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function signPayload(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("hex");
}

/**
 * Creates a signed JWT-like session token
 */
export function createSessionToken(user: User, expiresInSeconds = SESSION_TTL_SECONDS): string {
  const secret = getAuthSecret();
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload: SessionPayload = { user, exp };
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

/**
 * Verifies and parses a signed session token
 */
export function verifySessionToken(token: string): User | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;
    const secret = getAuthSecret();
    const expectedSignature = signPayload(payloadB64, secret);

    const bufA = Buffer.from(signature, "hex");
    const bufB = Buffer.from(expectedSignature, "hex");
    if (bufA.length !== bufB.length || !timingSafeEqual(bufA, bufB)) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return null;
    }

    return payload.user;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the current session user from an incoming NextRequest
 */
export function getSessionUserFromRequest(request: NextRequest): User | null {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Attaches the HttpOnly Secure session cookie to a NextResponse
 */
export function attachSessionCookie(response: NextResponse, user: User): NextResponse {
  const token = createSessionToken(user);
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}

/**
 * Clears the session cookie on logout
 */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

/**
 * RBAC Helper to protect API routes: checks if the request is authenticated and has permitted roles
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles?: UserRole[]
): Promise<{ user: User; error?: undefined } | { user?: undefined; error: NextResponse }> {
  const user = getSessionUserFromRequest(request);

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ (Unauthorized)" },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      error: NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ในการดำเนินการนี้ (Forbidden)" },
        { status: 403 }
      ),
    };
  }

  return { user };
}
