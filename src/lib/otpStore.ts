interface OTPRecord {
  email: string;
  otp: string;
  expiresAt: number; // Unix timestamp in ms
  createdAt: number;
}

// Global in-memory map to survive hot-reloads during dev mode
const globalForOTP = globalThis as unknown as {
  otpStore?: Map<string, OTPRecord>;
};

const otpStore = globalForOTP.otpStore ?? new Map<string, OTPRecord>();
if (process.env.NODE_ENV !== "production") globalForOTP.otpStore = otpStore;

export function generateOTP(email: string): { otp: string; expiresAt: number; ttlSeconds: number } {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Generate 6-digit random number
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const createdAt = Date.now();
  const ttlMs = 60 * 1000; // 1 minute (60 seconds)
  const expiresAt = createdAt + ttlMs;

  otpStore.set(normalizedEmail, {
    email: normalizedEmail,
    otp,
    expiresAt,
    createdAt,
  });

  return {
    otp,
    expiresAt,
    ttlSeconds: 60,
  };
}

export function verifyOTP(email: string, inputOtp: string): { valid: boolean; reason?: "EXPIRED" | "INVALID" | "NOT_FOUND" } {
  const normalizedEmail = email.trim().toLowerCase();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return { valid: false, reason: "NOT_FOUND" };
  }

  const now = Date.now();
  if (now > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return { valid: false, reason: "EXPIRED" };
  }

  if (record.otp !== inputOtp.trim()) {
    return { valid: false, reason: "INVALID" };
  }

  // OTP verified successfully -> clear it so it cannot be reused
  otpStore.delete(normalizedEmail);
  return { valid: true };
}

export function getOTPStatus(email: string): { exists: boolean; expiresAt?: number; remainingSeconds?: number } {
  const normalizedEmail = email.trim().toLowerCase();
  const record = otpStore.get(normalizedEmail);
  if (!record) return { exists: false };

  const now = Date.now();
  if (now > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return { exists: false };
  }

  return {
    exists: true,
    expiresAt: record.expiresAt,
    remainingSeconds: Math.max(0, Math.ceil((record.expiresAt - now) / 1000)),
  };
}
