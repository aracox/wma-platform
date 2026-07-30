import { NextRequest, NextResponse } from "next/server";
import { generateOTP } from "@/lib/otpStore";
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
    const { otp, expiresAt, ttlSeconds } = generateOTP(cleanEmail);

    // Send real email via Nodemailer / SMTP
    const emailResult = await sendOTPEmail({ to: cleanEmail, otp });

    if (!emailResult.success) {
      console.warn(`[AUTH OTP] Email sending warning: ${emailResult.error}`);
    }

    console.log(`[AUTH OTP] Generated & Sent OTP to ${cleanEmail}. Expires in ${ttlSeconds}s`);

    return NextResponse.json({
      success: true,
      message: `ส่งรหัส OTP (6 หลัก) ไปยัง ${cleanEmail} เรียบร้อยแล้ว (รหัสมีอายุ 1 นาที)`,
      email: cleanEmail,
      expiresAt,
      ttlSeconds,
    });
  } catch (err) {
    console.error("Failed to send OTP:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการส่ง OTP" },
      { status: 500 }
    );
  }
}
