import { NextRequest, NextResponse } from "next/server";
import { isOTPConfigurationError, verifyOTP } from "@/lib/otpStore";
import { attachSessionCookie } from "@/lib/auth/session.server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, token } = body;

    if (!email || !otp || !token) {
      return NextResponse.json(
        { error: "กรุณาระบุอีเมลและรหัส OTP" },
        { status: 400 }
      );
    }

    const result = verifyOTP(email, otp, token);

    if (!result.valid) {
      if (result.reason === "INVALID") {
        return NextResponse.json(
          { error: "รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "ไม่พบข้อมูล OTP หรือรหัสหมดอายุแล้ว กรุณากรอกอีเมลและขอรหัสใหม่" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Create public user session object
    const userSession = {
      id: `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`,
      username: cleanEmail,
      email: cleanEmail,
      name: cleanEmail,
      nameEn: cleanEmail,
      role: "user" as const,
    };

    const response = NextResponse.json({
      success: true,
      user: userSession,
      message: "เข้าสู่ระบบสำเร็จ",
    });

    return attachSessionCookie(response, userSession);
  } catch (err) {
    console.error("Failed to verify OTP:", err);
    return NextResponse.json(
      {
        error: isOTPConfigurationError(err)
          ? "ระบบ OTP ยังไม่ได้ตั้งค่าสำหรับการใช้งาน"
          : "เกิดข้อผิดพลาดในการตรวจสอบ OTP",
      },
      { status: isOTPConfigurationError(err) ? 503 : 500 }
    );
  }
}
