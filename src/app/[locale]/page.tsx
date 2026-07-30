import Link from "next/link";
import Image from "next/image";
import fs from "fs";
import path from "path";
import { ArrowRight, Building2, CalendarCheck2, MessageCircleHeart, ShieldAlert } from "lucide-react";
import { getLaos } from "@/data/lao";
import { formatDateBE } from "@/lib/utils";
import PurposeTrendChart from "@/components/dashboard/PurposeTrendChart";
import HeroSlider from "@/components/hero/HeroSlider";

export const dynamic = "force-dynamic";

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
    href: "/lao",
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
    href: "/lao-map",
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

const REPORT_STATUS_LABELS: Record<string, { th: string; en: string; className: string }> = {
  pending: {
    th: "รอดำเนินการ",
    en: "Pending",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200"
  },
  reviewing: {
    th: "กำลังตรวจสอบ",
    en: "Reviewing",
    className: "bg-blue-100 text-blue-700 border-blue-200"
  },
  resolved: {
    th: "แก้ไขแล้ว",
    en: "Resolved",
    className: "bg-green-100 text-green-700 border-green-200"
  }
};

function readJSONData<T>(filename: string): T[] {
  try {
    const filePath = path.join(process.cwd(), "src/data", filename);
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error(`Failed to read data file ${filename}:`, err);
    return [];
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isThai = locale === "th";

  // Load actual data from file databases
  const laos = getLaos();
  const facilities = readJSONData<any>("facilities.json");
  const cooperations = readJSONData<any>("cooperation.json");
  const reports = readJSONData<any>("reports.json");

  // Calculate real metrics
  const totalLaos = laos.length;
  const totalFacilities = facilities.length;
  const operationalFacilities = facilities.filter(f => f.status === "operational").length;
  const operationalPercent = totalFacilities > 0 
    ? Math.round((operationalFacilities / totalFacilities) * 100) 
    : 0;

  const totalCooperations = cooperations.length;
  const totalReports = reports.length;

  const overviewStats = [
    {
      id: "lao",
      labelTh: "อปท. ในระบบข้อมูล",
      labelEn: "LAOs in Platform",
      value: totalLaos.toLocaleString(),
      noteTh: "ครอบคลุมทุกภูมิภาค",
      noteEn: "Nationwide coverage",
    },
    {
      id: "facility",
      labelTh: "ระบบบำบัดที่เปิดใช้งาน",
      labelEn: "Operational Systems",
      value: operationalFacilities.toString(),
      noteTh: `คิดเป็น ${operationalPercent}% ของระบบทั้งหมด`,
      noteEn: `${operationalPercent}% operational systems`,
    },
    {
      id: "cooperation",
      labelTh: "คำขอจัดตั้งศูนย์คุณภาพน้ำ",
      labelEn: "WQMC Requests",
      value: totalCooperations.toString(),
      noteTh: "ประสานความร่วมมือ อปท.",
      noteEn: "Cooperation requests logged",
    },
    {
      id: "reports",
      labelTh: "รายงานปัญหาน้ำเสียจากชุมชน",
      labelEn: "Community Reports Logged",
      value: totalReports.toString(),
      noteTh: "รับเรื่องจากภาคประชาชน",
      noteEn: "Wastewater issues reported",
    },
  ];

  // Calculate real monthly trend data for the chart (covering Jan-May 2026)
  const months = [
    { monthTh: "ม.ค.", monthEn: "Jan", num: 1 },
    { monthTh: "ก.พ.", monthEn: "Feb", num: 2 },
    { monthTh: "มี.ค.", monthEn: "Mar", num: 3 },
    { monthTh: "เม.ย.", monthEn: "Apr", num: 4 },
    { monthTh: "พ.ค.", monthEn: "May", num: 5 },
  ];

  const chartData = months.map(m => {
    // Cumulative operational systems
    const system = facilities.length;

    // Cumulative cooperation requests created on or before this month in 2026
    const lao = cooperations.filter((c: any) => {
      const d = new Date(c.createdAt);
      const y = d.getFullYear();
      const mon = d.getMonth() + 1;
      return y < 2026 || (y === 2026 && mon <= m.num);
    }).length;

    // Cumulative community reports created on or before this month in 2026
    const community = reports.filter((r: any) => {
      const d = new Date(r.createdAt);
      const y = d.getFullYear();
      const mon = d.getMonth() + 1;
      return y < 2026 || (y === 2026 && mon <= m.num);
    }).length;

    return {
      monthTh: m.monthTh,
      monthEn: m.monthEn,
      system,
      lao,
      community,
    };
  });

  // Get the 3 latest community reports sorted by date descending
  const latestReports = [...reports]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="bg-slate-50">
      <HeroSlider locale={locale} isThai={isThai} />

      {/* 3 Core Missions */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary-900 md:text-2xl">
              {isThai ? "3 ภารกิจหลักของแพลตฟอร์ม" : "Three Core Missions"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {isThai
                ? "โครงสร้างข้อมูลสอดคล้องกับวัตถุประสงค์การใช้งานและภารกิจหลัก"
                : "Homepage structure aligned to the platform purpose."}
            </p>
          </div>

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

      {/* Operational Overview Section — disabled */}
      {false && (
      <section className="mx-auto max-w-6xl px-4 pb-6">
        <h2 className="text-xl font-bold text-primary-900 md:text-2xl">
          {isThai ? "ภาพรวมข้อมูลเชิงปฏิบัติการ" : "Operational Overview"}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {overviewStats.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isThai ? item.labelTh : item.labelEn}
              </p>
              <p className="mt-2 text-3xl font-black text-slate-900">{item.value}</p>
              <p className="mt-1 text-xs font-semibold text-primary-700 bg-primary-50/50 border border-primary-100 inline-block px-2 py-0.5 rounded">
                {isThai ? item.noteTh : item.noteEn}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <PurposeTrendChart isThai={isThai} data={chartData} />
        </div>
      </section>
      )}

      {/* Latest Reports Section — disabled */}
      {false && (
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-primary-900 md:text-2xl">
            {isThai ? "รายงานปัญหาน้ำเสียจากชุมชนล่าสุด" : "Latest Community Reports"}
          </h2>
          <Link href={`/${locale}/report`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-900">
            {isThai ? "ดูประวัติรายงาน" : "View report history"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {latestReports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">{isThai ? "ไม่มีข้อมูลรายงานจากชุมชนในขณะนี้" : "No community reports available."}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {latestReports.map((item: any) => {
              const status = REPORT_STATUS_LABELS[item.status] || REPORT_STATUS_LABELS.pending;
              const dateStr = formatDateBE(item.createdAt, locale);

              // Truncate issues text
              const description = item.identifiedIssues && item.identifiedIssues.length > 110 
                ? item.identifiedIssues.slice(0, 110) + "..." 
                : item.identifiedIssues || "-";

              return (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${status.className}`}>
                        {isThai ? status.th : status.en}
                      </span>
                      <time className="text-[10px] font-semibold text-slate-400">{dateStr}</time>
                    </div>
                    <h3 className="text-base font-bold leading-snug text-slate-800 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <span>{item.laoName}</span>
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed min-h-[4.5rem]">
                      {description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span>จังหวัด: {item.province}</span>
                    <span>อปท. รหัส: {item.laoId}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      )}
    </div>
  );
}
