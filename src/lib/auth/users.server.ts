import "server-only";
import bcrypt from "bcryptjs";
import { User, UserRole } from "@/types";

export interface ServerUser {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  nameEn: string;
  role: UserRole;
  email: string;
  laoId?: string;
  laoName?: string;
  province?: string;
  provinceEn?: string;
}

// Pre-hashed passwords:
// "admin1234" -> $2b$10$.qPqhrx5YnND8nysz7Cv0elzr3OWe3ywmKlcl5Yb0QWKtV/R/wZQW
// "user1234"  -> $2b$10$1AJi8hL1HOcHyGLvkSbkjeStDagj9xIhRsldISI6pKs/PFHX16AVq
const DEFAULT_USERS: ServerUser[] = [
  {
    id: "u01",
    username: "admin",
    passwordHash: process.env.ADMIN_PASSWORD_HASH || "$2b$10$.qPqhrx5YnND8nysz7Cv0elzr3OWe3ywmKlcl5Yb0QWKtV/R/wZQW",
    name: "ผู้ดูแลระบบ",
    nameEn: "System Admin",
    role: "admin",
    email: process.env.ADMIN_EMAIL || "admin@wma.or.th",
  },
  {
    id: "u02",
    username: "user",
    passwordHash: "$2b$10$1AJi8hL1HOcHyGLvkSbkjeStDagj9xIhRsldISI6pKs/PFHX16AVq",
    name: "ประชาชนทั่วไป",
    nameEn: "General User",
    role: "user",
    email: "user@community.or.th",
  },
];

/**
 * Remove sensitive server fields like passwordHash before returning to client
 */
export function sanitizeUser(user: ServerUser): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

/**
 * Hash a plain text password with bcrypt
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

/**
 * Verify a plain text password against a bcrypt hash
 */
export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

/**
 * Find server user by username (internal server use only)
 */
export async function findServerUserByUsername(username: string): Promise<ServerUser | null> {
  const normalized = username.trim().toLowerCase();
  const user = DEFAULT_USERS.find((u) => u.username.toLowerCase() === normalized);
  return user || null;
}

/**
 * Find user by username and return sanitized safe user
 */
export async function findUserByUsername(username: string): Promise<User | null> {
  const user = await findServerUserByUsername(username);
  return user ? sanitizeUser(user) : null;
}

/**
 * Find user by id and return sanitized safe user
 */
export async function findUserById(id: string): Promise<User | null> {
  const user = DEFAULT_USERS.find((u) => u.id === id);
  return user ? sanitizeUser(user) : null;
}

/**
 * Find user by email and return sanitized safe user
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  const user = DEFAULT_USERS.find((u) => u.email.toLowerCase() === normalized);
  return user ? sanitizeUser(user) : null;
}

/**
 * Authenticate user with username and password on the server
 */
export async function authenticateUser(username: string, plainTextPassword: string): Promise<User | null> {
  // Dev-only plain text override from env (e.g. ADMIN_PASSWORD in .env.local). Never honored in production.
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.ADMIN_PASSWORD &&
    username.trim().toLowerCase() === "admin"
  ) {
    if (plainTextPassword === process.env.ADMIN_PASSWORD) {
      const adminUser = await findServerUserByUsername("admin");
      return adminUser ? sanitizeUser(adminUser) : null;
    }
  }

  const serverUser = await findServerUserByUsername(username);
  if (!serverUser || !serverUser.passwordHash) {
    return null;
  }

  const isValid = await verifyPassword(plainTextPassword, serverUser.passwordHash);
  if (!isValid) {
    return null;
  }

  return sanitizeUser(serverUser);
}
