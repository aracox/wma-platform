"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Siren, Waves } from "lucide-react";

interface Slide {
  img: string;
  subtitleTh: string;
  subtitleEn: string;
}

const STATIC_SLIDES: Slide[] = [
  {
    img: "/images/hero-slide-2.jpg",
    subtitleTh:
      "เจ้าหน้าที่ อปท ตรวจสอบโครงสร้างพื้นฐานระบบบำบัดน้ำเสียเพื่อรับรองมาตรฐานคุณภาพน้ำชุมชน",
    subtitleEn:
      "LAO officers inspect wastewater infrastructure to maintain community water quality standards.",
  },
  {
    img: "/images/hero-slide-3.jpg",
    subtitleTh:
      "เครือข่ายอาสาชุมชนร่วมทำความสะอาดคลองและเฝ้าระวังคุณภาพน้ำ — พลังของการมีส่วนร่วม",
    subtitleEn:
      "Community volunteer networks join canal clean-ups and water monitoring — the power of participation.",
  },
  {
    img: "/images/hero-slide-4.jpg",
    subtitleTh:
      "แพลตฟอร์มดิจิทัลรวมข้อมูลเชิงพื้นที่ เชื่อมโยงผู้บริหาร อปท และประชาชนในวงจรนโยบายเดียว",
    subtitleEn:
      "A digital platform unifying spatial data — connecting LAO administrators and citizens in one policy loop.",
  },
  {
    img: "/images/hero-slide-5.jpg",
    subtitleTh:
      "เป้าหมายปลายทาง: แม่น้ำ ลำคลองสะอาด — ขับเคลื่อนด้วยข้อมูลและการมีส่วนร่วมของทุกภาคส่วน",
    subtitleEn:
      "The end goal: clean rivers, smiling communities — driven by data and collective participation.",
  },
];

const INTERVAL_MS = 5000;

interface HeroSliderProps {
  locale: string;
  isThai: boolean;
  totalLaos: number;
  connectedFacilities: number;
}

export default function HeroSlider({ 
  locale, 
  isThai, 
  totalLaos = 0, 
  connectedFacilities = 0 
}: HeroSliderProps) {
  const [current, setCurrent] = useState(0);

  const safeFacilities = (connectedFacilities ?? 0).toLocaleString();
  const safeTotalLaos = (totalLaos ?? 0).toLocaleString();

  // First slide is generated from real platform data so it never drifts out of
  // sync with the actual LAO/facility counts shown elsewhere on the dashboard.
  const SLIDES: Slide[] = [
    {
      img: "/images/hero-slide-1.jpg",
      subtitleTh: `${safeFacilities} ระบบบำบัดที่เชื่อมต่อข้อมูลแล้ว จาก อปท. ทั้งหมด ${safeTotalLaos} แห่งทั่วประเทศ ติดตามสถานะและความพร้อมใช้งานแบบเรียลไทม์`,
      subtitleEn: `${safeFacilities} treatment systems connected and monitored, out of ${safeTotalLaos} LAOs nationwide. Track status and readiness in real time.`,
    },
    ...STATIC_SLIDES,
  ];

  const goTo = useCallback((next: number) => {
    setCurrent(next);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [current, goTo]);

  return (
    <section className="relative overflow-hidden text-white" style={{ minHeight: 300 }}>
      {/* ─── Background layers ─────────────────────────────── */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.img}
          className="absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          <Image
            src={slide.img}
            alt=""
            fill
            className={`object-cover object-center transition-transform duration-[10000ms] ease-linear ${i === current ? "scale-105" : "scale-100"}`}
            priority={i === 0}
            sizes="100vw"
          />
          {/* dark overlay so text stays readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-primary-950/75 to-blue-950/60 transition-opacity duration-1000" />
        </div>
      ))}

      {/* ─── Fixed radial decoration ───────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #38bdf8 0, transparent 28%), radial-gradient(circle at 80% 10%, #0ea5e9 0, transparent 20%)",
        }}
      />

      {/* ─── Fixed WMA Logo ────────────────────────────────── */}
      <div className="pointer-events-none absolute right-12 top-1/2 z-20 hidden -translate-y-1/2 lg:block">
        <Image
          src="/images/wma-logo.png"
          alt="WMA Logo"
          width={320}
          height={266}
          className="h-auto w-[320px] object-contain opacity-95 drop-shadow-[0_8px_24px_rgba(15,23,42,0.5)]"
          priority
        />
      </div>

      {/* ─── Content ───────────────────────────────────────── */}
      <div className="relative z-20 mx-auto max-w-6xl px-4 py-16">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          <Waves className="h-4 w-4" />
          {isThai ? "แพลตฟอร์มข้อมูลและการมีส่วนร่วม" : "Data & Participation Platform"}
        </p>

        {/* Fixed main title */}
        <h1 className="max-w-4xl text-3xl font-bold leading-tight text-white drop-shadow-[0_2px_12px_rgba(15,23,42,0.45)] md:text-5xl">
          {isThai
            ? "แพลตฟอร์มการสื่อสารดิจิทัลเพื่อสนับสนุนการจัดการน้ำเสียชุมชน"
            : "A unified hub for LAO wastewater systems and community-driven action"}
        </h1>

        {/* Animated subtitle */}
        <div className="relative mt-4 h-16 max-w-3xl md:h-12">
          {SLIDES.map((slide, i) => (
            <p
              key={`subtitle-${i}`}
              className={`absolute top-0 left-0 w-full text-sm text-sky-50 transition-all duration-1000 ease-in-out md:text-base ${
                i === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              }`}
              aria-hidden={i !== current}
            >
              {isThai ? slide.subtitleTh : slide.subtitleEn}
            </p>
          ))}
        </div>

        {/* CTA Buttons */}
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

      {/* ─── Dot + Arrow Controls ──────────────────────────── */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
        <button
          onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
          aria-label="Previous slide"
          className="rounded-full bg-white/20 p-1 text-white transition hover:bg-white/40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}

        <button
          onClick={() => goTo((current + 1) % SLIDES.length)}
          aria-label="Next slide"
          className="rounded-full bg-white/20 p-1 text-white transition hover:bg-white/40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
