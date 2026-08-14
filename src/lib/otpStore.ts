import { createHmac, randomInt, timingSafeEqual } from "crypto";

const OTP_TTL_SECONDS = 5 * 60;

type OTPFailureReason = "INVALID" | "NOT_FOUND" | "MALFORMED";

interface TokenPayload {
  email: string;
  otpHash: string;
  exp: number;
}

class OTPConfigurationError extends Error {}

// Dev-only fallback secret so `next dev` keeps working without any setup.
// In production a real OTP_SECRET is mandatory (see getSecret below).
const DEV_FALLBACK_SECRET = "dev-only-insecure-otp-secret-do-not-use-in-production";

function getSecret(): string {
  const secret = process.env.OTP_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV !== "production") return DEV_FALLBACK_SECRET;

  throw new OTPConfigurationError("OTP_SECRET must be configured in production.");
}

function normalizedEmail(email: string) {
  return email.trim().toLowerCase();
}

function otpHash(email: string, otp: string, secret: string) {
  return createHmac("sha256", secret)
    .update(`${normalizedEmail(email)}:${otp}`)
    .digest("hex");
}

function base64UrlEncode(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(payloadB64: string, secret: string) {
  return createHmac("sha256", secret).update(payloadB64).digest("hex");
}

function safeEqualHex(a: string, b: string) {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function newOtp() {
  return randomInt(100_000, 1_000_000).toString();
}

/**
 * Generates an OTP and packages its verification state into a signed,
 * self-contained token. There is no server-side storage: the token
 * carries the email + OTP hash + expiry, signed with OTP_SECRET so it
 * can't be tampered with client-side. This avoids needing any shared
 * datastore across Vercel's stateless serverless function instances.
 *
 * Trade-off: because nothing is stored server-side, a token cannot be
 * marked "used" after a successful verification. The 5-minute expiry
 * is the only enforced limit. Anyone who obtains both the token AND
 * the emailed OTP within that window could replay it.
 */
export function generateOTP(email: string): { otp: string; token: string; expiresAt: number; ttlSeconds: number } {
  const secret = getSecret();
  const otp = newOtp();
  const expiresAt = Date.now() + OTP_TTL_SECONDS * 1000;

  const payload: TokenPayload = {
    email: normalizedEmail(email),
    otpHash: otpHash(email, otp, secret),
    exp: expiresAt,
  };

  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadB64, secret);
  const token = `${payloadB64}.${signature}`;

  return { otp, token, expiresAt, ttlSeconds: OTP_TTL_SECONDS };
}

export function verifyOTP(
  email: string,
  inputOtp: string,
  token: string
): { valid: boolean; reason?: OTPFailureReason } {
  const secret = getSecret();

  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false, reason: "NOT_FOUND" };
  }

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature || sign(payloadB64, secret) !== signature) {
    return { valid: false, reason: "MALFORMED" };
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch {
    return { valid: false, reason: "MALFORMED" };
  }

  if (payload.email !== normalizedEmail(email)) {
    return { valid: false, reason: "MALFORMED" };
  }

  if (!payload.exp || payload.exp < Date.now()) {
    return { valid: false, reason: "NOT_FOUND" };
  }

  const expectedHash = otpHash(email, inputOtp.trim(), secret);
  if (!safeEqualHex(payload.otpHash, expectedHash)) {
    return { valid: false, reason: "INVALID" };
  }

  return { valid: true };
}

export function isOTPConfigurationError(error: unknown): error is OTPConfigurationError {
  return error instanceof OTPConfigurationError;
}
