"use client";

import { useMemo, useState, useEffect } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ArrowRight, Building2, CalendarDays, CheckCircle2, Megaphone, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";

const TABS = [
  { id: "all", labelTh: "ทั้งหมด", labelEn: "All", icon: Megaphone },
  { id: "system", labelTh: "ระบบบำบัดของ อปท", labelEn: "LAO Systems", icon: Building2 },
  { id: "lao", labelTh: "กิจกรรมของ อปท", labelEn: "LAO Activities", icon: CalendarDays },
  { id: "community", labelTh: "การมีส่วนร่วมชุมชน", labelEn: "Community", icon: Users },
] as const;

const TYPE_META = {
  system: {
    className: "bg-primary-100 text-primary-700 border border-primary-200/50",
    borderClass: "border-l-primary-500",
    labelTh: "ระบบบำบัด",
    labelEn: "System",
  },
  lao: {
    className: "bg-chula-100 text-chula-700 border border-chula-200/50",
    borderClass: "border-l-chula-500",
    labelTh: "กิจกรรม อปท",
    labelEn: "LAO Activity",
  },
  community: {
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
    borderClass: "border-l-emerald-500",
    labelTh: "ชุมชน",
    labelEn: "Community",
  },
} as const;

export default function FeedPage() {
  const locale = useLocale();
  const isThai = locale === "th";
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("all");

  const announcements = useAppStore((s) => s.announcements);
  const loadAnnouncements = useAppStore((s) => s.loadAnnouncements);
  const currentUser = useAppStore((s) => s.currentUser);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return announcements;
    return announcements.filter((item) => item.type === activeTab);
  }, [activeTab, announcements]);

  const summary = useMemo(() => {
    const system = announcements.filter((item) => item.type === "system").length;
    const lao = announcements.filter((item) => item.type === "lao").length;
    const community = announcements.filter((item) => item.type === "community").length;
    return { system, lao, community };
  }, [announcements]);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        {/* Banner header with dark gradient */}
        <header className="rounded-3xl border border-primary-900 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 p-8 md:p-12 text-white shadow-xl relative overflow-hidden animate-fade-up">
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-chula-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-blue-100 border border-white/10">
                <Megaphone className="h-4 w-4" />
                {isThai ? "แจ้งข่าวสาร" : "Announcements"}
              </p>
              <h1 className="text-3xl font-black text-white drop-shadow-[0_2px_8px_rgba(15,23,42,0.45)] md:text-4xl">
                {isThai ? "ศูนย์แจ้งข่าวสารด้านการจัดการน้ำเสียของ อปท และชุมชน" : "Wastewater announcement center for LAOs and communities"}
              </h1>
              <p className="mt-3 max-w-3xl text-sm md:text-base text-blue-100/90 leading-relaxed">
                {isThai
                  ? "เนื้อหาถูกจัดตามเป้าหมายหลักของแพลตฟอร์ม: ข้อมูลระบบบำบัดน้ำเสียของ อปท, กิจกรรมของ อปท ในการจัดการน้ำเสีย และกิจกรรมการมีส่วนร่วมของชุมชน"
                  : "Content is structured around the platform's core goals: LAO system data, LAO wastewater management activities, and community participation."}
              </p>
            </div>
            {currentUser?.role === "admin" && (
              <div className="flex-shrink-0">
                <Link
                  href={`/${locale}/feed/cms`}
                  className="inline-flex items-center gap-2 bg-white text-primary-900 hover:bg-primary-50 px-6 py-3 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95 text-sm cursor-pointer"
                >
                  <Settings className="h-4 w-4 text-primary-700" />
                  {isThai ? "จัดการระบบ CMS" : "Manage CMS"}
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Stat Overview cards */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border-y border-r border-slate-200 bg-white p-5 shadow-sm border-l-4 border-l-primary-500">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{isThai ? "อัปเดตระบบบำบัด" : "System updates"}</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{summary.system}</p>
          </div>
          <div className="rounded-2xl border-y border-r border-slate-200 bg-white p-5 shadow-sm border-l-4 border-l-chula-500">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{isThai ? "กิจกรรม อปท" : "LAO activities"}</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{summary.lao}</p>
          </div>
          <div className="rounded-2xl border-y border-r border-slate-200 bg-white p-5 shadow-sm border-l-4 border-l-emerald-500">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{isThai ? "กิจกรรมชุมชน" : "Community activities"}</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{summary.community}</p>
          </div>
        </section>

        {/* Category filtering tab bar */}
        <section className="mt-6">
          <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition cursor-pointer",
                    active
                      ? "bg-primary-800 text-white shadow-sm shadow-primary-900/10"
                      : "text-slate-600 hover:bg-slate-100 hover:text-primary-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{isThai ? tab.labelTh : tab.labelEn}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Feed Cards Section */}
        <section className="mt-4 space-y-4">
          {filteredItems.map((item) => {
            const meta = TYPE_META[item.type];
            return (
              <article
                key={item.id}
                className={cn(
                  "rounded-2xl border-y border-r border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:shadow-slate-200/50 hover:border-slate-300 transform hover:-translate-y-0.5 duration-200 border-l-4",
                  meta.borderClass
                )}
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider", meta.className)}>
                    {isThai ? meta.labelTh : meta.labelEn}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">จ.{isThai ? item.provinceTh : item.provinceEn}</span>
                  <span className="text-xs text-slate-300">|</span>
                  <span className="text-xs text-slate-500">{item.date}</span>
                </div>

                <h3 className="mt-3 text-lg md:text-xl font-bold leading-tight text-slate-900 hover:text-primary-600 transition-colors">
                  {isThai ? item.titleTh : item.titleEn}
                </h3>
                <p className="mt-2.5 text-sm md:text-base text-slate-600 leading-relaxed">{isThai ? item.summaryTh : item.summaryEn}</p>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                  <p className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    {isThai ? item.statusTh : item.statusEn}
                  </p>
                  <button className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors cursor-pointer">
                    {isThai ? "ดูรายละเอียด" : "Details"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
