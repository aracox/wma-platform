import { NextRequest, NextResponse } from "next/server";
import { generateOTP, isOTPConfigurationError } from "@/lib/otpStore";
import { sendOTPEmail } from "@/lib/sendEmail";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "กรุณาระบุอีเมลที่ถูกต้อง (Invalid email address)" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    // No server-side storage: the OTP hash + expiry are packed into a
    // signed token that the client must send back on verify-otp. This
    // keeps the flow stateless so it works across Vercel's independent
    // serverless function instances.
    const { otp, token, expiresAt, ttlSeconds } = generateOTP(cleanEmail);

    // Send real email via Nodemailer / SMTP
    const emailResult = await sendOTPEmail({ to: cleanEmail, otp, ttlSeconds });

    if (!emailResult.success) {
      console.error(`[AUTH OTP] Email delivery failed for ${cleanEmail}: ${emailResult.error}`);
      return NextResponse.json(
        { error: "ไม่สามารถส่งรหัส OTP ได้ กรุณาลองใหม่อีกครั้ง" },
        { status: 503 }
      );
    }

    console.log(`[AUTH OTP] Sent OTP to ${cleanEmail}. Expires in ${ttlSeconds}s`);

    return NextResponse.json({
      success: true,
      message: `ส่งรหัส OTP (6 หลัก) ไปยัง ${cleanEmail} เรียบร้อยแล้ว (รหัสมีอายุ 5 นาที)`,
      email: cleanEmail,
      token,
      expiresAt,
      ttlSeconds,
    });
  } catch (err) {
    console.error("Failed to send OTP:", err);
    return NextResponse.json(
      {
        error: isOTPConfigurationError(err)
          ? "ระบบ OTP ยังไม่ได้ตั้งค่าสำหรับการใช้งาน"
          : "เกิดข้อผิดพลาดในการส่ง OTP",
      },
      { status: isOTPConfigurationError(err) ? 503 : 500 }
    );
  }
}
