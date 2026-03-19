"use client";
import { useState, useMemo } from "react";
import { ChevronDown, Map } from "lucide-react";
import dynamic from "next/dynamic";
import { getLaos } from "@/data/lao";

const LaoMapClient = dynamic(() => import("@/components/map/LaoMapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-cyan-700 font-medium text-sm">กำลังโหลดแผนที่ อปท. ...</p>
      </div>
    </div>
  ),
});

export default function LaoMapPage() {
  const [selectedProvince, setSelectedProvince] = useState("");

  // Load all LAOs; useMemo to avoid re-reading on every render
  const allLaos = useMemo(() => getLaos(), []);

  // Provinces from dataset (sorted, deduplicated)
  const provinces = useMemo(
    () => [...new Set(allLaos.map((l) => l.province))].sort(),
    [allLaos]
  );

  const countWithCoords = useMemo(
    () =>
      (selectedProvince
        ? allLaos.filter((l) => l.province === selectedProvince)
        : allLaos
      ).filter((l) => l.lat !== 0 && l.lng !== 0).length,
    [allLaos, selectedProvince]
  );

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-cyan-600" />
          <h1 className="font-bold text-gray-800 text-base hidden sm:block">แผนที่ อปท.</h1>
        </div>

        {/* Stats badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs ml-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
          <span className="text-gray-500">
            {countWithCoords.toLocaleString()} อปท. ที่มีพิกัด
          </span>
        </div>

        <div className="flex-1" />

        {/* Province filter */}
        <div className="relative">
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-cyan-400 focus:outline-none bg-white cursor-pointer"
          >
            <option value="">ทุกจังหวัด</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Map fills remaining height */}
      <div className="flex-1 relative overflow-hidden">
        <LaoMapClient laos={allLaos} selectedProvince={selectedProvince} />
      </div>
    </div>
  );
}
