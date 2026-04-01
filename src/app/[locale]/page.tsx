import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, CalendarCheck2, MessageCircleHeart } from "lucide-react";
import PurposeTrendChart from "@/components/dashboard/PurposeTrendChart";
import HeroSlider from "@/components/hero/HeroSlider";

interface MissionPillar {
  id: string;
  image: string;
  labelTh: string;
  labelEn: string;
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
    image: "/images/mission-thai-1.png",
    labelTh: "ข้อมูลระบบ",
    labelEn: "SYSTEMS",
    titleTh: "ข้อมูลระบบบำบัดน้ำเสียของ อปท",
    titleEn: "Wastewater Treatment Systems",
    descriptionTh: "ติดตามสถานะระบบบำบัด ความจุ และความพร้อมใช้งานของแต่ละพื้นที่",
    descriptionEn: "Track treatment status, capacity, and operational readiness by area.",
    href: "/lao-map",
    icon: Building2,
  },
  {
    id: "lao-activity",
    image: "/images/mission-thai-2.png",
    labelTh: "แผนและการดำเนินการ",
    labelEn: "MANAGEMENT",
    titleTh: "กิจกรรมของ อปท ในการจัดการน้ำเสีย",
    titleEn: "LAO Wastewater Management Activities",
    descriptionTh: "ดูแผนงาน การดำเนินงาน และผลลัพธ์ของกิจกรรมที่ อปท ดำเนินการ",
    descriptionEn: "View plans, execution, and outcomes of local wastewater activities.",
    href: "/feed",
    icon: CalendarCheck2,
  },
  {
    id: "community",
    image: "/images/mission-thai-3.png",
    labelTh: "เครือข่ายเปิด",
    labelEn: "COMMUNITY",
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
      <HeroSlider locale={locale} isThai={isThai} />

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
        <div className="grid gap-6 md:grid-cols-3">
          {MISSION_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Link
                key={pillar.id}
                href={`/${locale}${pillar.href}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary-300 hover:shadow-md"
              >
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={pillar.image}
                    alt={isThai ? pillar.titleTh : pillar.titleEn}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-primary-600 uppercase">
                    <Icon className="h-5 w-5" />
                    <span>{isThai ? pillar.labelTh : pillar.labelEn}</span>
                  </div>
                  <h3 className="mb-3 text-xl font-bold leading-tight text-slate-900">
                    {isThai ? pillar.titleTh : pillar.titleEn}
                  </h3>
                  <p className="flex-1 text-base leading-relaxed text-slate-600">
                    {isThai ? pillar.descriptionTh : pillar.descriptionEn}
                  </p>
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
