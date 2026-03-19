"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Search, MapPin, Building2, ChevronRight } from "lucide-react";
import { searchLaos, LaoItem } from "@/data/lao";

export default function LAODirectoryPage() {
  const t = useTranslations("lao");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  
  // Real-time search (limit 100 for performance)
  const results = useMemo(() => searchLaos(query, 100), [query]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-3xl leading-relaxed">
            ค้นหาข้อมูลพื้นฐาน สถานที่ตั้ง และระบบบำบัดน้ำเสียขององค์กรปกครองส่วนท้องถิ่นทั่วประเทศ
          </p>
          
          <div className="relative max-w-2xl shadow-sm rounded-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg transition-all duration-300 shadow-sm hover:shadow-md"
              placeholder={t("search_placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((lao: LaoItem) => (
            <Link
              key={lao.id}
              href={`/${locale}/lao/${lao.id}`}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col group transform hover:-translate-y-1"
            >
              <div className="p-6 flex-grow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary-50 rounded-xl text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 tracking-wide border border-gray-100">
                    {lao.type}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-primary-700 transition-colors">
                  {lao.name}
                </h3>
                
                <div className="flex items-center text-sm text-gray-500 mt-auto">
                  <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  <span className="truncate font-medium">จ.{lao.province} อ.{lao.district}</span>
                </div>
              </div>
              <div className="bg-gray-50/50 px-6 py-4 flex items-center justify-between text-sm text-primary-600 font-bold group-hover:bg-primary-50 transition-colors border-t border-gray-50">
                ดูรายละเอียด
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </div>
            </Link>
          ))}
          
          {results.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">ไม่พบข้อมูล</h3>
              <p className="text-gray-500">ลองใช้คำค้นหาอื่น หรือตรวจสอบตัวสะกดอีกครั้ง</p>
            </div>
          )}
        </div>
        
        {results.length > 0 && query === "" && (
          <div className="mt-12 text-center text-sm font-medium text-gray-400">
            แสดง {results.length} รายการแรกจากทั้งหมด
          </div>
        )}
      </div>
    </div>
  );
}
