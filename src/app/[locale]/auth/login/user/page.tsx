"use client";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, KeyRound, AlertTriangle, ArrowRight, RefreshCw, CheckCircle2, LogOut, FileText, Clock } from "lucide-react";
import { useAppStore } from "@/store";
import Link from "next/link";

export default function UserLoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || `/${locale}/report`;
  const login = useAppStore((s) => s.login);
  const logout = useAppStore((s) => s.logout);
  const currentUser = useAppStore((s) => s.currentUser);

  // Form steps: "email" | "otp"
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  
  // UI Loading & Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Countdown timer state (60 seconds = 1 minute)
  const [timeLeft, setTimeLeft] = useState(60);
  const [isExpired, setIsExpired] = useState(false);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, timeLeft]);

  // Handle Step 1: Send OTP via Email
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMessage("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError(locale === "th" ? "กรุณากรอกอีเมลให้ถูกต้อง" : "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (locale === "th" ? "ไม่สามารถส่ง OTP ได้" : "Failed to send OTP"));
        return;
      }

      // OTP sent successfully
      setStep("otp");
      setTimeLeft(60);
      setIsExpired(false);
      setSuccessMessage(data.message || (locale === "th" ? "ส่งรหัส OTP ไปยังอีเมลเรียบร้อยแล้ว" : "OTP code sent to your email"));
    } catch (err) {
      setError(locale === "th" ? "เกิดข้อผิดพลาดในการส่ง OTP" : "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isExpired) {
      setError(locale === "th" ? "รหัส OTP หมดอายุแล้ว กรุณากดขอรหัสใหม่" : "OTP code expired. Please request a new code.");
      return;
    }

    if (!otp || otp.length !== 6) {
      setError(locale === "th" ? "กรุณากรอกรหัส OTP 6 หลัก" : "Please enter 6-digit OTP code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (locale === "th" ? "รหัส OTP ไม่ถูกต้อง" : "Invalid OTP"));
        return;
      }

      // Logged in successfully
      login(data.user);
      router.push(callbackUrl);
    } catch (err) {
      setError(locale === "th" ? "เกิดข้อผิดพลาดในการตรวจสอบ OTP" : "Error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  // Already logged in screen
  if (currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 animate-fade-up">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-5">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl shadow-inner">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {locale === "th" ? "เข้าสู่ระบบเรียบร้อยแล้ว" : "Already signed in"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {locale === "th" ? "คุณเข้าใช้งานในระบบด้วยอีเมล:" : "Logged in as:"}
            </p>
            <div className="mt-2 inline-block px-4 py-1.5 bg-slate-100 text-primary-800 font-mono font-semibold rounded-xl text-sm border border-slate-200">
              {currentUser.email}
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href={callbackUrl}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-sm text-sm"
            >
              <FileText className="h-4 w-4" />
              {locale === "th" ? "ไปยังหน้าถัดไป" : "Continue"}
            </Link>
            
            <button
              onClick={() => logout()}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold rounded-xl transition-all border border-slate-200 text-sm cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-slate-400" />
              {locale === "th" ? "ออกจากระบบ" : "Sign Out"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-up">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4 text-primary-600 shadow-sm border border-primary-200">
            <Mail className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {locale === "th" ? "เข้าสู่ระบบด้วยอีเมล (Email OTP)" : "Sign In with Email OTP"}
          </h1>
          <p className="text-slate-500 text-sm mt-1.5">
            {locale === "th"
              ? "ระบุอีเมลของคุณเพื่อรับรหัส OTP สำหรับแจ้งปัญหาและติดตามสถานะ"
              : "Enter your email address to receive an OTP code and track your reports"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-5">
          {/* Error notification */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-medium animate-fade-up">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Success message */}
          {successMessage && step === "otp" && (
            <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-medium animate-fade-up">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  {locale === "th" ? "อีเมลผู้ใช้งาน" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all"
                    placeholder="example@domain.com"
                    autoComplete="email"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {locale === "th" 
                    ? "* ระบบจะส่งรหัส OTP 6 หลักไปยังอีเมลที่คุณระบุเพื่อยืนยันตัวตน" 
                    : "* A 6-digit OTP code will be sent to your email to verify your identity."}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {locale === "th" ? "กำลังส่ง OTP..." : "Sending OTP..."}</>
                ) : (
                  <>{locale === "th" ? "ส่งรหัส OTP ไปยังอีเมล" : "Send OTP to Email"} <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter 6-digit OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* Target Email display */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block">{locale === "th" ? "ส่ง OTP ไปที่อีเมล:" : "Sent OTP to email:"}</span>
                  <span className="font-bold text-slate-800 font-mono text-sm">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setStep("email"); setError(""); }}
                  className="text-primary-600 hover:underline font-semibold text-xs cursor-pointer"
                >
                  {locale === "th" ? "เปลี่ยนอีเมล" : "Change Email"}
                </button>
              </div>

              {/* 6-digit OTP Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-800">
                    {locale === "th" ? "กรอกรหัส OTP (6 หลัก)" : "Enter 6-digit OTP"}
                  </label>
                  
                  {/* Countdown Timer */}
                  <div className={`flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                    isExpired 
                      ? "bg-rose-50 text-rose-600 border-rose-200" 
                      : "bg-primary-50 text-primary-700 border-primary-200"
                  }`}>
                    <Clock className="h-3.5 w-3.5" />
                    {isExpired ? (locale === "th" ? "หมดอายุ" : "Expired") : formatTime(timeLeft)}
                  </div>
                </div>

                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    disabled={isExpired}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none text-center font-mono text-xl font-bold tracking-widest text-slate-900 placeholder:text-slate-300 placeholder:tracking-normal transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                    placeholder="123456"
                    autoFocus
                  />
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || isExpired || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {locale === "th" ? "กำลังตรวจสอบ..." : "Verifying..."}</>
                ) : (
                  <>{locale === "th" ? "ยืนยันรหัส OTP และเข้าสู่ระบบ" : "Verify OTP & Sign In"}</>
                )}
              </button>

              {/* Resend OTP button */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-800 font-semibold hover:underline cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                  {locale === "th" ? "ส่งรหัส OTP อีกครั้ง" : "Resend OTP Code"}
                </button>
              </div>
            </form>
          )}

          {/* Admin portal link */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-center text-xs text-slate-400">
              {locale === "th" ? "สำหรับเจ้าหน้าที่หรือผู้ดูแลระบบ" : "For officials or system admins"}{" "}
              <Link href={`/${locale}/auth/login`} className="text-primary-600 hover:underline font-bold">
                {locale === "th" ? "เข้าสู่ระบบ Admin" : "Admin Sign In"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
