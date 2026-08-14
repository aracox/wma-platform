"use client";
import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Shield, Lock, User, AlertTriangle, LogIn, Loader2 } from "lucide-react";
import { useAppStore } from "@/store";
import Link from "next/link";

export default function AdminLoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const currentUser = useAppStore((s) => s.currentUser);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Already logged in — redirect
  if (currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-quality-excellent/10 rounded-2xl mb-4">
            <User className="h-8 w-8 text-quality-excellent" />
          </div>
          <h2 className="text-xl font-bold text-primary-800 mb-1">
            {locale === "th" ? "เข้าสู่ระบบแล้ว" : "Already signed in"}
          </h2>
          <p className="text-text-secondary text-sm mb-4">
            {currentUser.name}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-semibold"
          >
            {locale === "th" ? "กลับหน้าหลัก" : "Go to Home"}
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError(
        locale === "th"
          ? "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน"
          : "Please enter username and password"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            (locale === "th"
              ? "ชื่อผู้ใช้หรือรหัสผ่าน Admin ไม่ถูกต้อง"
              : "Invalid admin username or password")
        );
        return;
      }

      if (data.user) {
        login(data.user);
        router.push(`/${locale}`);
      }
    } catch {
      setError(
        locale === "th"
          ? "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์"
          : "Server connection error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-chula-100 rounded-2xl mb-4 text-chula-700 shadow-sm">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-primary-900">
            {locale === "th" ? "เข้าสู่ระบบผู้ดูแลระบบ (Admin)" : "Admin Sign In"}
          </h1>
          <p className="text-text-secondary text-sm mt-1">WMA Platform - Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-quality-critical/10 border border-quality-critical/20 rounded-lg text-quality-critical text-sm">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-primary-800 mb-1.5">
              {locale === "th" ? "ชื่อผู้ใช้ (Admin)" : "Admin Username"}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border focus:border-chula-400 focus:ring-2 focus:ring-chula-100 outline-none text-sm"
                placeholder="admin"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary-800 mb-1.5">
              {locale === "th" ? "รหัสผ่าน" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border focus:border-chula-400 focus:ring-2 focus:ring-chula-100 outline-none text-sm"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-800 text-white font-semibold rounded-xl hover:bg-primary-900 transition-colors cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {locale === "th" ? "กำลังตรวจสอบข้อมูล..." : "Verifying..."}
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                {locale === "th" ? "เข้าสู่ระบบ Admin" : "Sign In as Admin"}
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-5">
          {locale === "th" ? "สำหรับประชาชนทั่วไปในการแจ้งปัญหา" : "For general users reporting issues"}{" "}
          <Link href={`/${locale}/auth/login/user`} className="text-primary-700 hover:underline font-semibold">
            {locale === "th" ? "เข้าสู่ระบบผู้ใช้ทั่วไป" : "User Login"}
          </Link>
        </p>
      </div>
    </div>
  );
}
