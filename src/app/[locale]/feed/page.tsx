"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Newspaper, Scale, Users, ExternalLink, Download, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import FeedCard from "@/components/dashboard/FeedCard";
import { NEWS_ITEMS, LEGAL_ITEMS, PARTICIPATION_ITEMS } from "@/data/feed";

const TABS = [
  { id: "news", labelTh: "ข่าวสาร", labelEn: "News & Updates", icon: Newspaper },
  { id: "legal", labelTh: "กฎหมาย & มาตรฐาน", labelEn: "Laws & Standards", icon: Scale },
  { id: "participation", labelTh: "การมีส่วนร่วม", labelEn: "Participation", icon: Users },
];

const CATEGORY_LABELS: Record<string, { th: string; en: string; color: string }> = {
  act:          { th: "พ.ร.บ.",     en: "Act",         color: "bg-primary-100 text-primary-700" },
  regulation:   { th: "พระราชกฤษฎีกา", en: "Regulation", color: "bg-purple-100 text-purple-700" },
  standard:     { th: "มาตรฐาน",    en: "Standard",    color: "bg-quality-good/10 text-quality-good" },
  announcement: { th: "ประกาศ",     en: "Announcement", color: "bg-quality-fair/10 text-quality-fair" },
};

const TYPE_LABELS: Record<string, { th: string; en: string; color: string; emoji: string }> = {
  guide:    { th: "คู่มือ",      en: "Guide",    color: "bg-primary-100 text-primary-700",  emoji: "📘" },
  activity: { th: "กิจกรรม",    en: "Activity", color: "bg-quality-good/10 text-quality-good", emoji: "🎯" },
  network:  { th: "เครือข่าย",  en: "Network",  color: "bg-chula-100 text-chula-700",     emoji: "🤝" },
  campaign: { th: "แคมเปญ",     en: "Campaign", color: "bg-quality-fair/10 text-quality-fair", emoji: "📢" },
};

export default function FeedPage() {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState("news");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-800">
          {locale === "th" ? "ข้อมูลและข่าวสาร" : "Information & News"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {locale === "th"
            ? "ข่าวสาร กฎหมาย และช่องทางการมีส่วนร่วมของภาคประชาชน"
            : "News, laws & standards, and citizen participation channels"}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-border shadow-sm mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-primary-800 text-white shadow-sm"
                  : "text-text-secondary hover:text-primary-700 hover:bg-primary-50"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">
                {locale === "th" ? tab.labelTh : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── TAB: NEWS ── */}
      {activeTab === "news" && (
        <div className="space-y-4 animate-fade-up">
          {NEWS_ITEMS.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* ── TAB: LEGAL ── */}
      {activeTab === "legal" && (
        <div className="space-y-4 animate-fade-up">
          {/* Banner */}
          <div className="bg-primary-100 border border-primary-200 rounded-xl p-4 flex gap-3 items-start">
            <Scale className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-primary-800">
                {locale === "th" ? "กฎหมายและมาตรฐานที่เกี่ยวข้อง" : "Relevant Laws & Standards"}
              </p>
              <p className="text-xs text-primary-600 mt-0.5">
                {locale === "th"
                  ? "รวบรวมกฎหมาย ระเบียบ และมาตรฐานที่เกี่ยวข้องกับการจัดการน้ำเสียในประเทศไทย"
                  : "Compiled laws, regulations and standards related to wastewater management in Thailand."}
              </p>
            </div>
          </div>

          {LEGAL_ITEMS.map((item) => {
            const cat = CATEGORY_LABELS[item.category];
            return (
              <div key={item.id} className="kpi-card group cursor-pointer hover:border-primary-300 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", cat.color)}>
                        {locale === "th" ? cat.th : cat.en}
                      </span>
                      <span className="text-xs text-text-secondary flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> พ.ศ. {item.year}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-primary-800 leading-snug group-hover:text-primary-600 transition-colors">
                      {locale === "th" ? item.title : item.titleEn}
                    </h3>
                    <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                      {locale === "th" ? item.description : item.descriptionEn}
                    </p>
                    <p className="text-xs text-primary-400 mt-2 font-medium">{item.agency}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-800 font-semibold px-3 py-1.5 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors">
                      <Download className="h-3 w-3" />
                      {locale === "th" ? "ดาวน์โหลด" : "Download"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB: PARTICIPATION ── */}
      {activeTab === "participation" && (
        <div className="animate-fade-up">
          {/* Chula research banner */}
          <div className="bg-chula-100 border border-chula-300/30 rounded-xl p-4 flex gap-3 items-start mb-6">
            <span className="text-2xl">🎓</span>
            <div>
              <p className="text-sm font-bold text-chula-700">
                {locale === "th" ? "โครงการวิจัย จุฬาลงกรณ์มหาวิทยาลัย" : "Chulalongkorn University Research Project"}
              </p>
              <p className="text-xs text-chula-600 mt-0.5">
                {locale === "th"
                  ? "ร่วมมือกับ อจน. ในการพัฒนาแพลตฟอร์มการมีส่วนร่วมของชุมชนเพื่อการจัดการน้ำเสียอย่างยั่งยืน"
                  : "Collaborating with WMA to develop community participation platforms for sustainable wastewater management."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PARTICIPATION_ITEMS.map((item) => {
              const typeInfo = TYPE_LABELS[item.type];
              return (
                <div key={item.id} className="kpi-card group cursor-pointer hover:border-primary-300 transition-all flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl flex-shrink-0">{item.imageEmoji}</div>
                    <div className="flex-1 min-w-0">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-1.5", typeInfo.color)}>
                        {locale === "th" ? typeInfo.th : typeInfo.en}
                      </span>
                      <h3 className="text-sm font-bold text-primary-800 leading-snug group-hover:text-primary-600 transition-colors">
                        {locale === "th" ? item.title : item.titleEn}
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed flex-1">
                    {locale === "th" ? item.description : item.descriptionEn}
                  </p>
                  <button className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50 hover:border-primary-400 transition-colors">
                    {locale === "th" ? item.actionLabel : item.actionLabelEn}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
