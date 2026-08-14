import Link from "next/link";
import Image from "next/image";
import { Building2, CalendarCheck2, MessageCircleHeart } from "lucide-react";
import { getLaos } from "@/data/lao";
import { prisma } from "@/lib/prisma";
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
    titleTh: "ข้อมูลระบบบำบัดน้ำเสียของ อปท.",
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
    titleTh: "กิจกรรมของ อปท. ในการจัดการน้ำเสีย",
    titleEn: "LAO Wastewater Management Activities",
    descriptionTh: "ดูแผนงาน การดำเนินงาน และผลลัพธ์ของกิจกรรมที่ อปท. ดำเนินการ",
    descriptionEn: "View plans, execution, and outcomes of local wastewater activities.",
    href: "/lao-map",
    icon: CalendarCheck2,
  },
  {
    id: "community",
    image: "/images/mission-thai-3.png",
    labelTh: "เครือข่ายชุมชน",
    labelEn: "COMMUNITY",
    titleTh: "กิจกรรมการมีส่วนร่วมของชุมชน",
    titleEn: "Community Participation Activities",
    descriptionTh: "รวบรวมกิจกรรมอาสา การเฝ้าระวังคุณภาพน้ำ และการมีส่วนร่วมจากประชาชน",
    descriptionEn: "Collect volunteer programs, water monitoring, and citizen engagement updates.",
    href: "/feed",
    icon: MessageCircleHeart,
  },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isThai = locale === "th";

  // Load actual data from the database
  const laos = getLaos();
  const facilities = await prisma.facility.findMany();

  // Calculate real metrics
  const totalLaos = laos.length;
  const operationalFacilities = facilities.filter(f => f.status === "operational").length;

  return (
    <div className="bg-slate-50">
      <HeroSlider locale={locale} isThai={isThai} totalLaos={totalLaos} connectedFacilities={operationalFacilities} />

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
                    {pillar.id === "system" && isThai ? (
                      <>
                        {"ข้อมูลระบบบำบัดน้ำเสียของ "}
                        <abbr title="องค์กรปกครองส่วนท้องถิ่น" className="cursor-help underline decoration-dotted decoration-slate-400">อปท.</abbr>
                      </>
                    ) : (
                      isThai ? pillar.titleTh : pillar.titleEn
                    )}
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
    </div>
  );
}
