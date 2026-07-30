import nodemailer from "nodemailer";

interface SendOTPEmailParams {
  to: string;
  otp: string;
}

export async function sendOTPEmail({ to, otp }: SendOTPEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER || "";
    const smtpPass = process.env.SMTP_PASS || "";
    const smtpFrom = process.env.SMTP_FROM || `"WMA Platform" <noreply@wma.or.th>`;

    // If SMTP credentials are provided, use them
    let transporter: nodemailer.Transporter;

    if (smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      // Dev mode: Create test account via Ethereal or log simulation if no credentials
      console.log(`[EMAIL SERVICE] Sending OTP ${otp} to ${to}...`);
      
      // Try creating test ethereal account for dev preview if no env provided
      try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch {
        // Fallback JSON transport
        transporter = nodemailer.createTransport({
          jsonTransport: true,
        });
      }
    }

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); width: 56px; height: 56px; line-height: 56px; border-radius: 16px; margin: 0 auto 12px; color: #ffffff; font-size: 24px; font-weight: bold;">
            WMA
          </div>
          <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0;">องค์การจัดการน้ำเสีย (WMA Platform)</h2>
          <p style="font-size: 13px; color: #64748b; margin-top: 4px;">รหัสยืนยันตัวตนสำหรับแจ้งปัญหาน้ำเสีย</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 12px;">รหัส OTP 6 หลักของคุณคือ:</p>
          <div style="font-size: 36px; font-weight: 900; font-family: monospace; letter-spacing: 8px; color: #0284c7; background-color: #ffffff; padding: 12px 20px; border-radius: 12px; border: 2px dashed #0284c7; display: inline-block; margin-bottom: 12px;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #e11d48; font-weight: 600; margin: 0;">
            ⏳ รหัสนี้จะหมดอายุภายใน 1 นาที (60 วินาที)
          </p>
        </div>

        <p style="font-size: 13px; color: #475569; leading-height: 1.6;">
          หากคุณไม่ได้เป็นผู้ทำรายการนี้ กรุณาเพิกถอนรหัสนี้ และโปรดอย่าเปิดเผยรหัส OTP นี้แก่ผู้อื่นเพื่อความปลอดภัย
        </p>

        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />

        <div style="text-align: center; font-size: 11px; color: #94a3b8;">
          © ${new Date().getFullYear()} องค์การจัดการน้ำเสีย (WMA). All rights reserved.
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: smtpFrom,
      to,
      subject: `[WMA Platform] รหัส OTP ของคุณคือ ${otp}`,
      text: `รหัส OTP ของคุณคือ: ${otp} (มีอายุ 1 นาที)`,
      html: htmlContent,
    });

    const testUrl = nodemailer.getTestMessageUrl(info);
    if (testUrl) {
      console.log(`[EMAIL SENT] Preview URL: ${testUrl}`);
    }

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("Failed to send OTP email:", err);
    return { success: false, error: err.message || "Failed to send email" };
  }
}
