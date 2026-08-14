import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session.server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "ออกจากระบบเรียบร้อยแล้ว",
  });
  return clearSessionCookie(response);
}
