import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otpStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: "กรุณาระบุอีเมลและรหัส OTP" },
        { status: 400 }
      );
    }

    const result = verifyOTP(email, otp);

    if (!result.valid) {
      if (result.reason === "EXPIRED") {
        return NextResponse.json(
          { error: "รหัส OTP หมดอายุแล้ว (เกิน 1 นาที) กรุณากดขอรหัส OTP ใหม่" },
          { status: 400 }
        );
      }
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

    return NextResponse.json({
      success: true,
      user: userSession,
      message: "เข้าสู่ระบบสำเร็จ",
    });
  } catch (err) {
    console.error("Failed to verify OTP:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการตรวจสอบ OTP" },
      { status: 500 }
    );
  }
}
