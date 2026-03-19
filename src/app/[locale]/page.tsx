import Link from "next/link";
import { ArrowRight, Building2, CalendarCheck2, MessageCircleHeart, Siren, Waves } from "lucide-react";
import PurposeTrendChart from "@/components/dashboard/PurposeTrendChart";

interface MissionPillar {
  id: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface HomeAnnouncement {
  id: string;
  titleTh: string;
  titleEn: string;
  summaryTh: string;
  summaryEn: string;
  date: string;
  type: "system" | "lao" | "community";
}

const MISSION_PILLARS: MissionPillar[] = [
  {
    id: "system",
    titleTh: "ข้อมูลระบบบำบัดน้ำเสียของ อปท",
    titleEn: "LAO Wastewater System Data",
    descriptionTh: "ติดตามสถานะระบบบำบัด ความจุ และความพร้อมใช้งานของแต่ละพื้นที่",
    descriptionEn: "Track treatment status, capacity, and operational readiness by area.",
    href: "/lao-map",
    icon: Building2,
  },
  {
    id: "lao-activity",
    titleTh: "กิจกรรมของ อปท ในการจัดการน้ำเสีย",
    titleEn: "LAO Wastewater Management Activities",
    descriptionTh: "ดูแผนงาน การดำเนินงาน และผลลัพธ์ของกิจกรรมที่ อปท ดำเนินการ",
    descriptionEn: "View plans, execution, and outcomes of local wastewater activities.",
    href: "/feed",
    icon: CalendarCheck2,
  },
  {
    id: "community",
    titleTh: "กิจกรรมการมีส่วนร่วมของชุมชน",
    titleEn: "Community Participation Activities",
    descriptionTh: "รวบรวมกิจกรรมอาสา การเฝ้าระวังคุณภาพน้ำ และการมีส่วนร่วมจากประชาชน",
    descriptionEn: "Collect volunteer programs, water monitoring, and citizen engagement updates.",
    href: "/feed",
    icon: MessageCircleHeart,
  },
];

const MOCK_OVERVIEW = [
  { id: "lao", labelTh: "อปท ที่มีข้อมูลในระบบ", labelEn: "LAOs in platform", value: "1,426", noteTh: "+42 เดือนนี้", noteEn: "+42 this month" },
  { id: "facility", labelTh: "ระบบบำบัดที่กำลังเดินระบบ", labelEn: "Operational systems", value: "874", noteTh: "คิดเป็น 82%", noteEn: "82% operational" },
  { id: "activity", labelTh: "กิจกรรม อปท ไตรมาสนี้", labelEn: "LAO activities this quarter", value: "318", noteTh: "เพิ่มขึ้น 19%", noteEn: "+19% growth" },
  { id: "community", labelTh: "กิจกรรมชุมชนที่บันทึก", labelEn: "Community activities logged", value: "591", noteTh: "ผู้เข้าร่วม 12,480 คน", noteEn: "12,480 participants" },
];

const MOCK_HOME_ANNOUNCEMENTS: HomeAnnouncement[] = [
  {
    id: "ha1",
    titleTh: "อปท เมืองลำปาง ปรับปรุงระบบเติมอากาศแล้วเสร็จ",
    titleEn: "Lampang LAO completed aeration system retrofit",
    summaryTh: "เพิ่มประสิทธิภาพการบำบัดน้ำเสียได้ 18% และลดกลิ่นร้องเรียนในชุมชน",
    summaryEn: "Treatment efficiency improved by 18% with fewer odor complaints.",
    date: "2026-03-17",
    type: "system",
  },
  {
    id: "ha2",
    titleTh: "เทศบาล 12 แห่งเริ่มกิจกรรมล้างท่อระบายน้ำเชิงรุก",
    titleEn: "12 municipalities launched proactive drain-cleaning activities",
    summaryTh: "ดำเนินการตามแผนป้องกันน้ำเสียสะสมก่อนเข้าฤดูฝน",
    summaryEn: "Implemented as pre-rainy-season prevention for wastewater accumulation.",
    date: "2026-03-14",
    type: "lao",
  },
  {
    id: "ha3",
    titleTh: "เครือข่ายชุมชนคลองสามวาจัดเวรเฝ้าระวังคุณภาพน้ำ",
    titleEn: "Khlong Sam Wa community network started water watch shifts",
    summaryTh: "ชุมชนร่วมตรวจวัดค่าเบื้องต้นและรายงานเหตุผิดปกติผ่านแพลตฟอร์ม",
    summaryEn: "Residents conduct basic checks and report anomalies through the platform.",
    date: "2026-03-12",
    type: "community",
  },
];

const TYPE_STYLE: Record<HomeAnnouncement["type"], { th: string; en: string; className: string }> = {
  system: {
    th: "ระบบบำบัด",
    en: "System",
    className: "bg-primary-100 text-primary-700",
  },
  lao: {
    th: "กิจกรรม อปท",
    en: "LAO Activity",
    className: "bg-chula-100 text-chula-700",
  },
  community: {
    th: "ชุมชน",
    en: "Community",
    className: "bg-quality-good/10 text-quality-good",
  },
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isThai = locale === "th";

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-primary-950 to-blue-950 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #38bdf8 0, transparent 28%), radial-gradient(circle at 80% 10%, #0ea5e9 0, transparent 20%)" }} />
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            <Waves className="h-4 w-4" />
            {isThai ? "แพลตฟอร์มข้อมูลและการมีส่วนร่วม" : "Data & Participation Platform"}
          </p>
          <h1 className="max-w-4xl text-3xl font-bold leading-tight text-white drop-shadow-[0_2px_12px_rgba(15,23,42,0.45)] md:text-5xl">
            {isThai
              ? "แพลตฟอร์มการสื่อสารดิจิทัลเพื่อสนับสนุนการจัดการน้ำเสียชุมชน"
              : "A unified hub for LAO wastewater systems and community-driven action"}
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-sky-50 md:text-base">
            {isThai
              ? "โฟกัส 3 ภารกิจหลัก: ข้อมูลระบบบำบัดน้ำเสียของ อปท, กิจกรรมของ อปท ในการจัดการน้ำเสีย, และกิจกรรมการมีส่วนร่วมของชุมชน"
              : "Focused on three core missions: LAO system information, LAO wastewater management activities, and community participation activities."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/lao-map`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary-900 transition hover:bg-sky-100"
            >
              {isThai ? "ดูข้อมูล อปท บนแผนที่" : "Explore LAO Map"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/report`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/50 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Siren className="h-4 w-4" />
              {isThai ? "แจ้งเหตุ/แจ้งปัญหา" : "Report an Issue"}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary-900 md:text-2xl">
              {isThai ? "3 ภารกิจหลักของแพลตฟอร์ม" : "Three Core Missions"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {isThai
                ? "โครงสร้างหน้าแรกปรับใหม่ให้สอดคล้องกับวัตถุประสงค์การใช้งานหลัก"
                : "Homepage structure aligned to the platform purpose."}
            </p>
          </div>
          <Link href={`/${locale}/feed`} className="text-sm font-semibold text-primary-700 hover:text-primary-900">
            {isThai ? "ไปหน้าแจ้งข่าวสาร" : "Go to Announcements"}
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {MISSION_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Link
                key={pillar.id}
                href={`/${locale}${pillar.href}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow"
              >
                <div className="mb-3 inline-flex rounded-xl bg-primary-50 p-2 text-primary-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {isThai ? pillar.titleTh : pillar.titleEn}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {isThai ? pillar.descriptionTh : pillar.descriptionEn}
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 group-hover:text-primary-900">
                  {isThai ? "ดูรายละเอียด" : "View details"}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6">
        <h2 className="text-xl font-bold text-primary-900 md:text-2xl">
          {isThai ? "ภาพรวมข้อมูลเชิงปฏิบัติการ" : "Operational Overview"}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_OVERVIEW.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-700">{isThai ? item.labelTh : item.labelEn}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
              <p className="mt-1 text-sm font-semibold text-primary-800">{isThai ? item.noteTh : item.noteEn}</p>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <PurposeTrendChart isThai={isThai} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-primary-900 md:text-2xl">
            {isThai ? "แจ้งข่าวสารล่าสุด" : "Latest Announcements"}
          </h2>
          <Link href={`/${locale}/feed`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-900">
            {isThai ? "ดูทั้งหมด" : "View all"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {MOCK_HOME_ANNOUNCEMENTS.map((item) => {
            const badge = TYPE_STYLE[item.type];
            return (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${badge.className}`}>
                    {isThai ? badge.th : badge.en}
                  </span>
                  <time className="text-xs text-slate-500">{item.date}</time>
                </div>
                <h3 className="text-sm font-bold leading-snug text-slate-900">
                  {isThai ? item.titleTh : item.titleEn}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{isThai ? item.summaryTh : item.summaryEn}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
