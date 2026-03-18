"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Menu, X, Droplets, LogOut, User, Shield } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";

const navItems = [
  { key: "home", href: "/" },
  { key: "map", href: "/map" },
  { key: "feed", href: "/feed" },
  { key: "report", href: "/report" },
];

const ROLE_LABELS: Record<string, { th: string; en: string; color: string }> = {
  admin:       { th: "ผู้ดูแลระบบ",  en: "Admin",       color: "bg-chula-500" },
  official:    { th: "เจ้าหน้าที่",   en: "Official",    color: "bg-primary-500" },
  coordinator: { th: "ผู้ประสานงาน",  en: "Coordinator", color: "bg-quality-good" },
  public:      { th: "ประชาชน",      en: "Public",      color: "bg-gray-400" },
};

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);

  const switchLocale = () => {
    const newLocale = locale === "th" ? "en" : "th";
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  const isActive = (href: string) => {
    const fullHref = `/${locale}${href === "/" ? "" : href}`;
    return pathname === fullHref || (href !== "/" && pathname.startsWith(fullHref));
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push(`/${locale}`);
  };

  const roleInfo = currentUser ? ROLE_LABELS[currentUser.role] : null;

  return (
    <nav className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
            <div className="bg-white/20 rounded-full p-1.5 group-hover:bg-white/30 transition-colors">
              <Droplets className="h-6 w-6 text-primary-300" />
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-bold text-sm leading-tight">WMA Platform</div>
              <div className="text-primary-300 text-xs leading-tight">องค์การจัดการน้ำเสีย</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                className={cn(isActive(item.href) ? "nav-link-active" : "nav-link")}
              >
                {t(item.key)}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <button
              onClick={switchLocale}
              className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors px-2 py-1 rounded-md hover:bg-white/10"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{locale === "th" ? "EN" : "ไทย"}</span>
            </button>

            {/* Auth area */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-white text-xs font-semibold leading-tight">
                      {locale === "th" ? currentUser.name : currentUser.nameEn}
                    </div>
                    <div className="text-primary-300 text-[10px] leading-tight">
                      {roleInfo && (locale === "th" ? roleInfo.th : roleInfo.en)}
                    </div>
                  </div>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-border shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-border">
                        <div className="text-sm font-bold text-primary-800">
                          {locale === "th" ? currentUser.name : currentUser.nameEn}
                        </div>
                        <div className="text-xs text-text-secondary">{currentUser.email}</div>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className={cn("w-2 h-2 rounded-full", roleInfo?.color)} />
                          <span className="text-xs font-medium text-text-secondary">
                            {roleInfo && (locale === "th" ? roleInfo.th : roleInfo.en)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-quality-critical hover:bg-quality-critical/5 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        {t("logout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href={`/${locale}/auth/login`}
                className="hidden md:inline-flex items-center px-4 py-2 bg-white text-primary-800 text-sm font-semibold rounded-lg hover:bg-primary-100 transition-colors"
              >
                {t("login")}
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-white/20 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm font-medium",
                  isActive(item.href) ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {t(item.key)}
              </Link>
            ))}
            {!currentUser && (
              <Link
                href={`/${locale}/auth/login`}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10"
              >
                {t("login")}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
