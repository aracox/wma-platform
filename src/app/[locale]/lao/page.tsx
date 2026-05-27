"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Search, MapPin, Building2, ChevronRight, ChevronDown } from "lucide-react";
import { LaoItem, getLaos } from "@/data/lao";

export default function LAODirectoryPage() {
  const t = useTranslations("lao");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const allLaos = useMemo(() => getLaos(), []);

  // Provinces from dataset (sorted, deduplicated)
  const provinces = useMemo(
    () => [...new Set(allLaos.map((l) => l.province))].sort(),
    [allLaos]
  );

  // Districts from dataset based on selected province (sorted, deduplicated)
  const districts = useMemo(() => {
    if (!selectedProvince) return [];
    const provinceLaos = allLaos.filter((l) => l.province === selectedProvince);
    return [...new Set(provinceLaos.map((l) => l.district))].sort();
  }, [allLaos, selectedProvince]);

  // Combined real-time search and filter (limit 100 for performance)
  const results = useMemo(() => {
    let filtered = allLaos;

    if (query) {
      const loQuery = query.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(loQuery) ||
          l.province.toLowerCase().includes(loQuery) ||
          l.district.toLowerCase().includes(loQuery) ||
          l.id.includes(loQuery) ||
          (l.zipcode && l.zipcode.includes(loQuery))
      );
    }

    if (selectedProvince) {
      filtered = filtered.filter((l) => l.province === selectedProvince);
    }

    if (selectedDistrict) {
      filtered = filtered.filter((l) => l.district === selectedDistrict);
    }

    return filtered.slice(0, 100);
  }, [allLaos, query, selectedProvince, selectedDistrict]);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section with Dark Gradient Card */}
        <div className="mb-10 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-3xl p-8 md:p-12 text-white border border-primary-900 shadow-xl relative overflow-hidden animate-fade-up">
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-chula-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight text-white">
              {t("title")}
            </h1>
            <p className="text-sm md:text-base text-blue-100/90 mb-8 max-w-3xl leading-relaxed">
              ค้นหาข้อมูลพื้นฐาน สถานที่ตั้ง และระบบบำบัดน้ำเสียขององค์กรปกครองส่วนท้องถิ่นทั่วประเทศ
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 max-w-5xl">
              {/* Search Input */}
              <div className="relative flex-1 shadow-sm rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-3.5 border border-slate-200/10 rounded-xl leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base transition-all duration-300 shadow-sm"
                  placeholder={t("search_placeholder")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {/* Province Select */}
              <div className="relative w-full md:w-56">
                <select
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value);
                    setSelectedDistrict(""); // Reset district selection when province changes
                  }}
                  className="appearance-none w-full pl-4 pr-10 py-3.5 border border-slate-200/10 rounded-xl leading-5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base transition-all duration-300 shadow-sm cursor-pointer font-medium"
                >
                  <option value="">ทุกจังหวัด</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                </div>
              </div>

              {/* District Select */}
              <div className="relative w-full md:w-56">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={!selectedProvince}
                  className="appearance-none w-full pl-4 pr-10 py-3.5 border border-slate-200/10 rounded-xl leading-5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base transition-all duration-300 shadow-sm disabled:bg-white/50 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer font-medium"
                >
                  <option value="">ทุกอำเภอ</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((lao: LaoItem) => (
            <Link
              key={lao.id}
              href={`/${locale}/lao/${lao.id}`}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300 border-l-4 border-l-primary-500 hover:border-l-primary-600 border-y border-r border-slate-200/70 overflow-hidden flex flex-col group transform hover:-translate-y-1"
            >
              <div className="p-6 flex-grow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary-50 rounded-xl text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-100">
                    {lao.type}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
                  {lao.name}
                </h3>
                
                <div className="flex items-center text-sm mt-auto">
                  <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-slate-400 group-hover:text-primary-500 transition-colors" />
                  <span className="truncate font-medium text-slate-500 group-hover:text-slate-600">จ.{lao.province} อ.{lao.district}</span>
                </div>
              </div>
              <div className="bg-slate-50/50 px-6 py-4 flex items-center justify-between text-sm text-primary-600 font-bold group-hover:bg-primary-50/60 transition-colors border-t border-slate-100">
                ดูรายละเอียด
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </div>
            </Link>
          ))}
          
          {results.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1">ไม่พบข้อมูล</h3>
              <p className="text-slate-500">ลองใช้คำค้นหาอื่น หรือตรวจสอบตัวสะกดอีกครั้ง</p>
            </div>
          )}
        </div>
        
        {results.length > 0 && (
          <div className="mt-12 text-center text-sm font-semibold text-slate-400">
            {query === "" && selectedProvince === "" && selectedDistrict === ""
              ? `แสดง ${results.length} รายการแรกจากทั้งหมด`
              : `แสดงผลลัพธ์ ${results.length} รายการ`}
          </div>
        )}
      </div>
    </div>
  );
}
