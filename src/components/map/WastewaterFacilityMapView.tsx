"use client";
import { useState, useMemo } from "react";
import { ChevronDown, Droplets, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { getWmaFacilities, getDspotFacilities, ALL_LOCATIONS as ALL } from "@/data/wastewaterFacilities";

const WastewaterFacilityMapClient = dynamic(() => import("@/components/map/WastewaterFacilityMapClient"), {
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

export default function WastewaterFacilityMapView() {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showWma, setShowWma] = useState(true);
  const [showDspot, setShowDspot] = useState(true);

  const allWma = useMemo(() => getWmaFacilities(), []);
  const allDspot = useMemo(() => getDspotFacilities(), []);

  const provinces = useMemo(
    () => [...new Set(allWma.map((f) => f.province))].sort(),
    [allWma]
  );

  const filteredWma = useMemo(() => {
    let filtered = allWma;

    if (searchQuery) {
      const loQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.title.toLowerCase().includes(loQuery) ||
          f.orgName.toLowerCase().includes(loQuery) ||
          f.province.toLowerCase().includes(loQuery)
      );
    }

    if (selectedProvince && selectedProvince !== ALL) {
      filtered = filtered.filter((f) => f.province === selectedProvince);
    }

    return filtered;
  }, [allWma, searchQuery, selectedProvince]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 flex-shrink-0 shadow-sm flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-cyan-600" />
          <h1 className="font-bold text-gray-800 text-base hidden sm:block">แผนที่ อปท.</h1>
        </div>

        {/* Layer toggles */}
        <div className="flex items-center gap-3 ml-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showWma} onChange={(e) => setShowWma(e.target.checked)} className="cursor-pointer" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#007bff] inline-block" />
            WMA
          </label>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showDspot} onChange={(e) => setShowDspot(e.target.checked)} className="cursor-pointer" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28a745] inline-block" />
            DSPOT
          </label>
        </div>

        {/* Stats badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs ml-2">
          <span className="text-gray-500">
            {selectedProvince || searchQuery
              ? `${filteredWma.length.toLocaleString()} WMA`
              : `WMA ${allWma.length} · DSPOT ${allDspot.length}`}
          </span>
        </div>

        <div className="flex-1" />

        {/* Search input */}
        <div className="relative w-full sm:w-64 md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-white"
            placeholder="ค้นหาชื่อ อปท. หรือจังหวัด (WMA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Province filter (WMA only) */}
        <div className="relative">
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-cyan-400 focus:outline-none bg-white cursor-pointer"
          >
            <option value="">-- เลือกจังหวัด --</option>
            <option value={ALL}>ทุกจังหวัด</option>
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
        <WastewaterFacilityMapClient
          wmaFacilities={filteredWma}
          dspotFacilities={allDspot}
          showWma={showWma}
          showDspot={showDspot}
          selectedProvince={selectedProvince}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
