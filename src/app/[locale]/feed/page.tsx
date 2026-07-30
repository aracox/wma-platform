"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ChevronDown, ChevronUp, Megaphone, Settings } from "lucide-react";
import { formatDateBE } from "@/lib/utils";
import { useAppStore } from "@/store";

export default function FeedPage() {
  const locale = useLocale();
  const isThai = locale === "th";
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const announcements = useAppStore((s) => s.announcements);
  const loadAnnouncements = useAppStore((s) => s.loadAnnouncements);
  const currentUser = useAppStore((s) => s.currentUser);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
                {isThai ? "ข่าวสาร" : "News"}
              </p>
              <h1 className="text-3xl font-black text-white drop-shadow-[0_2px_8px_rgba(15,23,42,0.45)] md:text-4xl">
                {isThai ? "กิจกรรมการมีส่วนร่วมของชุมชนในการจัดการน้ำเสีย" : "Wastewater announcement center for LAOs and communities"}
              </h1>
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

        {/* Feed Cards Section */}
        <section className="mt-8 space-y-4">
          {announcements.filter((a) => a.isPublic !== false).map((item) => {
            const isExpanded = !!expandedIds[item.id];
            const detailsText = isThai ? item.detailsTh : item.detailsEn;

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:shadow-slate-200/50 hover:border-slate-300 transform hover:-translate-y-0.5 duration-200"
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-semibold text-slate-500">จ.{isThai ? item.provinceTh : item.provinceEn}</span>
                  <span className="text-xs text-slate-300">|</span>
                  <span className="text-xs text-slate-500">{formatDateBE(item.date, locale)}</span>
                </div>

                <h3 className="mt-3 text-lg md:text-xl font-bold leading-tight text-slate-900 hover:text-primary-600 transition-colors">
                  {isThai ? item.titleTh : item.titleEn}
                </h3>
                <p className="mt-2.5 text-sm md:text-base text-slate-600 leading-relaxed">
                  {isThai ? item.summaryTh : item.summaryEn}
                </p>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 text-sm md:text-base text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 animate-fade-in">
                    {detailsText ? (
                      <p>{detailsText}</p>
                    ) : (
                      <p>{isThai ? item.summaryTh : item.summaryEn}</p>
                    )}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-end pt-3 border-t border-slate-100">
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-900 bg-primary-50 hover:bg-primary-100/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? (isThai ? "ย่อเนื้อหา" : "Collapse") : (isThai ? "ดูรายละเอียด" : "Read details")}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
