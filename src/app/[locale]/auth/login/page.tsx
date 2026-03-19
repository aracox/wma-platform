"use client";
import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Droplets, Lock, User, AlertTriangle, LogIn } from "lucide-react";
import { useAppStore } from "@/store";
import { USERS } from "@/data/users";
import Link from "next/link";

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const currentUser = useAppStore((s) => s.currentUser);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
            {locale === "th" ? currentUser.name : currentUser.nameEn}
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const user = USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      login(user);
      router.push(`/${locale}`);
    } else {
      setError(
        locale === "th"
          ? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
          : "Invalid username or password"
      );
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-2xl mb-4">
            <Droplets className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-primary-800">
            {locale === "th" ? "เข้าสู่ระบบ" : "Sign In"}
          </h1>
          <p className="text-text-secondary text-sm mt-1">WMA Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="kpi-card space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-quality-critical/10 border border-quality-critical/20 rounded-lg text-quality-critical text-sm">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-primary-800 mb-1.5">
              {locale === "th" ? "ชื่อผู้ใช้" : "Username"}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                placeholder="username"
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
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            <LogIn className="h-5 w-5" />
            {locale === "th" ? "เข้าสู่ระบบ" : "Sign In"}
          </button>

          {/* Test account hint */}
          <div className="bg-surface rounded-lg p-3 text-xs text-text-secondary border border-border">
            <div className="font-semibold text-primary-700 mb-1.5">
              {locale === "th" ? "บัญชีทดสอบ" : "Test Accounts"}:
            </div>
            <div className="space-y-1 font-mono">
              <div className="text-primary-500 font-semibold text-[10px] uppercase tracking-wide">Admin</div>
              <div>admin / <span className="text-primary-600">admin1234</span></div>
              <div className="text-primary-500 font-semibold text-[10px] uppercase tracking-wide mt-1.5">เจ้าหน้าที่ อปท.</div>
              <div>off_bkk / <span className="text-primary-600">bkk1234</span> <span className="text-text-secondary">(อปท. กรุงเทพฯ)</span></div>
              <div>off_cm / <span className="text-primary-600">cm1234</span> <span className="text-text-secondary">(อปท. เชียงใหม่)</span></div>
              <div>off_kk / <span className="text-primary-600">kk1234</span> <span className="text-text-secondary">(อปท. ขอนแก่น)</span></div>
              <div>off_pkt / <span className="text-primary-600">pkt1234</span> <span className="text-text-secondary">(อปท. ภูเก็ต)</span></div>
            </div>
          </div>
        </form>

        <p className="text-center text-sm text-text-secondary mt-4">
          {locale === "th" ? "สำหรับประชาชนทั่วไป" : "For public visitors"}{" "}
          <Link href={`/${locale}`} className="text-primary-600 hover:underline font-medium">
            {locale === "th" ? "ดูข้อมูลโดยไม่ต้องเข้าสู่ระบบ" : "View data without signing in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
