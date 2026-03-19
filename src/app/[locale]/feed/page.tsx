"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { ArrowRight, Building2, CalendarDays, CheckCircle2, Megaphone, MessageCircleHeart, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementItem {
  id: string;
  type: "system" | "lao" | "community";
  titleTh: string;
  titleEn: string;
  summaryTh: string;
  summaryEn: string;
  provinceTh: string;
  provinceEn: string;
  date: string;
  statusTh: string;
  statusEn: string;
}

const ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "a001",
    type: "system",
    titleTh: "อปท เมืองสุพรรณบุรีอัปเกรดบ่อเติมอากาศเฟส 2",
    titleEn: "Suphan Buri LAO upgraded aeration basin phase 2",
    summaryTh: "เพิ่มความสามารถรองรับน้ำเสียจาก 6,500 เป็น 8,000 ลบ.ม./วัน พร้อมติดตั้งระบบตรวจวัดออนไลน์",
    summaryEn: "Capacity increased from 6,500 to 8,000 m3/day with online monitoring installed.",
    provinceTh: "สุพรรณบุรี",
    provinceEn: "Suphan Buri",
    date: "2026-03-18",
    statusTh: "ดำเนินการแล้ว",
    statusEn: "Completed",
  },
  {
    id: "a002",
    type: "lao",
    titleTh: "เทศบาล 9 แห่งเริ่มกิจกรรมตรวจท่อรวบรวมน้ำเสียรายสัปดาห์",
    titleEn: "9 municipalities launched weekly wastewater pipe inspections",
    summaryTh: "ดำเนินงานเชิงป้องกันร่วมกับทีมช่างท้องถิ่น และรายงานผลผ่าน dashboard กลาง",
    summaryEn: "Preventive operations started with local technicians, reported via central dashboard.",
    provinceTh: "นครราชสีมา",
    provinceEn: "Nakhon Ratchasima",
    date: "2026-03-16",
    statusTh: "กำลังดำเนินการ",
    statusEn: "In progress",
  },
  {
    id: "a003",
    type: "community",
    titleTh: "ชุมชนคลองเปรมประชากรจัดกิจกรรมเก็บตัวอย่างน้ำร่วมกับ อปท",
    titleEn: "Khlong Prem Prachakorn community held joint water sampling with LAO",
    summaryTh: "มีผู้เข้าร่วม 73 คน พร้อมบันทึกค่าตรวจเบื้องต้นเข้าสู่ระบบแจ้งข่าวสาร",
    summaryEn: "73 participants joined and uploaded initial readings to the announcement system.",
    provinceTh: "กรุงเทพมหานคร",
    provinceEn: "Bangkok",
    date: "2026-03-15",
    statusTh: "รายงานผลแล้ว",
    statusEn: "Reported",
  },
  {
    id: "a004",
    type: "system",
    titleTh: "อปท บ้านฉางตรวจประเมินประสิทธิภาพระบบบำบัดไตรมาส 1",
    titleEn: "Ban Chang LAO completed Q1 treatment performance assessment",
    summaryTh: "ค่า BOD หลังบำบัดเฉลี่ย 13 mg/L ผ่านเกณฑ์ และเตรียมแผนอัปเกรดระบบควบคุมกลิ่น",
    summaryEn: "Average treated BOD at 13 mg/L passed standards, with odor control upgrade planned.",
    provinceTh: "ระยอง",
    provinceEn: "Rayong",
    date: "2026-03-13",
    statusTh: "ประเมินแล้ว",
    statusEn: "Assessed",
  },
  {
    id: "a005",
    type: "lao",
    titleTh: "อบต กลุ่มลุ่มน้ำยมเปิดแผนกิจกรรมลดน้ำเสียจากตลาดชุมชน",
    titleEn: "Yom basin SAOs launched market wastewater reduction activity plan",
    summaryTh: "เริ่มแยกน้ำเสียก่อนเข้าระบบและจัดอบรมผู้ประกอบการ 4 ตลาดนำร่อง",
    summaryEn: "Started pre-treatment separation and training for vendors in 4 pilot markets.",
    provinceTh: "สุโขทัย",
    provinceEn: "Sukhothai",
    date: "2026-03-12",
    statusTh: "เริ่มแผนงาน",
    statusEn: "Plan started",
  },
  {
    id: "a006",
    type: "community",
    titleTh: "อาสาสมัครชุมชนฝั่งธนฯ เปิดรอบอบรมการแจ้งเหตุผ่านแพลตฟอร์ม",
    titleEn: "Thonburi community volunteers opened training on digital issue reporting",
    summaryTh: "เน้นการแจ้งเหตุพร้อมพิกัดและหลักฐานภาพถ่าย เพื่อเร่งการตอบสนองของหน่วยงาน",
    summaryEn: "Focused on geotagged reporting with photo evidence to speed response.",
    provinceTh: "กรุงเทพมหานคร",
    provinceEn: "Bangkok",
    date: "2026-03-10",
    statusTh: "เปิดรับสมัคร",
    statusEn: "Open registration",
  },
];

const TABS = [
  { id: "all", labelTh: "ทั้งหมด", labelEn: "All", icon: Megaphone },
  { id: "system", labelTh: "ระบบบำบัดของ อปท", labelEn: "LAO Systems", icon: Building2 },
  { id: "lao", labelTh: "กิจกรรมของ อปท", labelEn: "LAO Activities", icon: CalendarDays },
  { id: "community", labelTh: "การมีส่วนร่วมชุมชน", labelEn: "Community", icon: Users },
] as const;

const TYPE_META = {
  system: {
    className: "bg-primary-100 text-primary-700",
    labelTh: "ระบบบำบัด",
    labelEn: "System",
  },
  lao: {
    className: "bg-chula-100 text-chula-700",
    labelTh: "กิจกรรม อปท",
    labelEn: "LAO Activity",
  },
  community: {
    className: "bg-quality-good/10 text-quality-good",
    labelTh: "ชุมชน",
    labelEn: "Community",
  },
} as const;

export default function FeedPage() {
  const locale = useLocale();
  const isThai = locale === "th";
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("all");

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return ANNOUNCEMENTS;
    return ANNOUNCEMENTS.filter((item) => item.type === activeTab);
  }, [activeTab]);

  const summary = useMemo(() => {
    const system = ANNOUNCEMENTS.filter((item) => item.type === "system").length;
    const lao = ANNOUNCEMENTS.filter((item) => item.type === "lao").length;
    const community = ANNOUNCEMENTS.filter((item) => item.type === "community").length;
    return { system, lao, community };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-900 to-primary-700 p-6 text-white">
        <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
          <Megaphone className="h-4 w-4" />
          {isThai ? "แจ้งข่าวสาร" : "Announcements"}
        </p>
        <h1 className="text-2xl font-bold text-white drop-shadow-[0_2px_8px_rgba(15,23,42,0.45)] md:text-3xl">
          {isThai ? "ศูนย์แจ้งข่าวสารด้านการจัดการน้ำเสียของ อปท และชุมชน" : "Wastewater announcement center for LAOs and communities"}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-sky-100">
          {isThai
            ? "เนื้อหาถูกจัดตามเป้าหมายหลักของแพลตฟอร์ม: ข้อมูลระบบบำบัดน้ำเสียของ อปท, กิจกรรมของ อปท ในการจัดการน้ำเสีย และกิจกรรมการมีส่วนร่วมของชุมชน"
            : "Content is structured around the platform's core goals: LAO system data, LAO wastewater management activities, and community participation."}
        </p>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">{isThai ? "อัปเดตระบบบำบัด" : "System updates"}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{summary.system}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">{isThai ? "กิจกรรม อปท" : "LAO activities"}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{summary.lao}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">{isThai ? "กิจกรรมชุมชน" : "Community activities"}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{summary.community}</p>
        </div>
      </section>

      <section className="mt-6">
        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
                  active ? "bg-primary-800 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-primary-800"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{isThai ? tab.labelTh : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-4 space-y-3">
        {filteredItems.map((item) => {
          const meta = TYPE_META[item.type];
          return (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary-300">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full px-2 py-1 text-xs font-semibold", meta.className)}>
                  {isThai ? meta.labelTh : meta.labelEn}
                </span>
                <span className="text-xs text-slate-500">{isThai ? item.provinceTh : item.provinceEn}</span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs text-slate-500">{item.date}</span>
              </div>

              <h3 className="mt-2 text-base font-bold leading-snug text-slate-900">
                {isThai ? item.titleTh : item.titleEn}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{isThai ? item.summaryTh : item.summaryEn}</p>

              <div className="mt-3 flex items-center justify-between">
                <p className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {isThai ? item.statusTh : item.statusEn}
                </p>
                <button className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-900">
                  {isThai ? "ดูรายละเอียด" : "Details"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-2xl border border-chula-300/50 bg-chula-100 p-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-chula-700">
          <MessageCircleHeart className="h-4 w-4" />
          {isThai ? "พื้นที่ข้อมูลตัวอย่าง" : "Sample Data Zone"}
        </p>
        <p className="mt-1 text-sm text-chula-700/90">
          {isThai
            ? "ข้อมูลในหน้านี้เป็นตัวอย่างเพื่อออกแบบโครงสร้างการสื่อสารข่าวสารในเฟสปัจจุบัน"
            : "Data on this page is mocked for the current design phase and communication structure."}
        </p>
      </section>
    </div>
  );
}
