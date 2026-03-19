"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, MapPin, Building2, ExternalLink, 
  Droplets, Users, CheckCircle2, AlertCircle, Clock 
} from "lucide-react";
import { getLaoById } from "@/data/lao";
import { useMemo } from "react";

export default function LAODetailPage() {
  const t = useTranslations("lao");
  const params = useParams();
  const router = useRouter();
  
  const laoId = params.id as string;
  const lao = useMemo(() => getLaoById(laoId), [laoId]);

  if (!lao) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col py-12">
        <Building2 className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-700 mb-2">ไม่พบข้อมูล อปท.</h1>
        <p className="text-gray-500 mb-6">รหัสอ้างอิง: {laoId}</p>
        <button 
          onClick={() => router.back()}
          className="flex items-center text-primary-600 hover:text-primary-700 font-medium bg-primary-50 px-6 py-3 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          กลับไปหน้ารายชื่อ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 border-b border-primary-800 relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 max-w-6xl py-12 relative z-10">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-primary-100 hover:text-white font-medium mb-8 group transition-colors text-sm bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full w-fit backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            กลับไปหน้ารายชื่อ
          </button>
          
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
              <Building2 className="w-12 h-12 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-100 border border-teal-500/30">
                  {lao.type}
                </span>
                <span className="text-primary-200 text-sm opacity-80">รหัส: {lao.id}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-sm">
                {lao.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-primary-100 text-sm sm:text-base">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-1.5 opacity-80" />
                  จ.{lao.province} อ.{lao.district} ต.{lao.subdistrict}
                </div>
                {lao.website && lao.website !== '-' && (
                  <a 
                    href={lao.website.startsWith('http') ? lao.website : `http://${lao.website}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center text-teal-300 hover:text-teal-200 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {lao.website}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 2. ข้อมูลระบบบำบัดน้ำเสีย */}
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-6 border-b border-gray-50 pb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                  <Droplets className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t("details.wastewater_system")}</h2>
              </div>
              
              {lao.wastewaterSystems.length > 0 ? (
                <div className="space-y-4">
                  {lao.wastewaterSystems.map(sys => (
                    <div key={sys.id} className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg text-gray-900">{sys.name}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          sys.status === 'operational' ? 'bg-green-100 text-green-700' :
                          sys.status === 'construction' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {sys.status === 'operational' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                          {sys.status === 'operational' ? 'ใช้งานปกติ' : 'อยู่ระหว่างก่อสร้าง/ปรับปรุง'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100/50">
                          <p className="text-xs font-medium text-gray-500 mb-1">{t("details.capacity")}</p>
                          <p className="text-2xl font-bold text-blue-600">{sys.capacityCubicMetersPerDay.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100/50">
                          <p className="text-xs font-medium text-gray-500 mb-1">{t("details.population")}</p>
                          <p className="text-2xl font-bold text-indigo-600">{sys.servedPopulation.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-gray-400 mt-4 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> ปรับปรุงข้อมูลล่าสุด: {sys.lastMaintained}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-2xl">
                  {t("details.no_data")}
                </div>
              )}
            </section>

            {/* 3. กิจกรรมในการจัดการน้ำเสีย */}
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-6 border-b border-gray-50 pb-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center mr-4">
                  <Building2 className="w-5 h-5 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t("details.activities")}</h2>
              </div>
              
              <div className="space-y-6">
                {lao.activities
                  .filter(a => a.category === 'wastewater_management')
                  .map(act => (
                    <div key={act.id} className="relative pl-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-teal-100 last:before:hidden">
                      <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-4 border-teal-500 shadow-sm" />
                      <div className="bg-teal-50/30 rounded-2xl p-6 border border-teal-100/50 hover:bg-teal-50/50 transition-colors">
                        <span className="text-xs font-bold text-teal-600 mb-2 block">{act.date}</span>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{act.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{act.description}</p>
                      </div>
                    </div>
                ))}
                {lao.activities.filter(a => a.category === 'wastewater_management').length === 0 && (
                  <p className="text-gray-500 py-4">{t("details.no_data")}</p>
                )}
              </div>
            </section>

            {/* 4. กิจกรรมการมีส่วนร่วมของชุมชน */}
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-6 border-b border-gray-50 pb-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mr-4">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t("details.participation")}</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {lao.activities
                  .filter(a => a.category === 'community_participation')
                  .map(act => (
                    <div key={act.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                      <div className="h-32 bg-orange-100 flex items-center justify-center relative overflow-hidden">
                        <Users className="w-12 h-12 text-orange-200 absolute group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
                        <span className="absolute bottom-3 left-4 text-white text-xs font-bold">{act.date}</span>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 mb-2 leading-tight group-hover:text-orange-600 transition-colors">{act.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-3">{act.description}</p>
                      </div>
                    </div>
                ))}
                {lao.activities.filter(a => a.category === 'community_participation').length === 0 && (
                  <p className="text-gray-500 py-4 col-span-full">{t("details.no_data")}</p>
                )}
              </div>
            </section>

          </div>

          {/* Sidebar (Right Column) */}
          <div className="lg:col-span-1">
            {/* 1. ที่ตั้งและแผนที่ */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mr-3">
                  <MapPin className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">{t("details.location_map")}</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">ที่ตั้งสำนักงาน</label>
                  <p className="text-gray-800 font-medium">เลขที่ {lao.address} หมู่ {lao.moo}</p>
                  <p className="text-gray-600 mt-1">ต.{lao.subdistrict} อ.{lao.district}</p>
                  <p className="text-gray-600 mt-1">จ.{lao.province} {lao.zipcode}</p>
                </div>
                
                {lao.area && (
                  <div className="pt-4 border-t border-gray-50">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">พื้นที่</label>
                    <p className="text-gray-800 font-medium">{lao.area} ตร.กม.</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-50">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">พิกัดสถานที่</label>
                  <div className="flex justify-between bg-gray-50 p-3 rounded-xl text-sm font-mono text-gray-700 items-center">
                    <span className="font-semibold text-gray-900">{lao.lat.toFixed(6)}</span>
                    <span className="text-gray-300 px-2">|</span>
                    <span className="font-semibold text-gray-900">{lao.lng.toFixed(6)}</span>
                  </div>
                </div>
              </div>

              {/* Map embed using iframe with standard Google Maps (Using coordinates) */}
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 relative shadow-inner">
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${lao.lat},${lao.lng}&hl=th&z=15&output=embed`}
                  allowFullScreen
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl pointer-events-none" />
              </div>
              
              <a 
                href={`https://maps.google.com/maps?q=${lao.lat},${lao.lng}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 w-full flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
              >
                เปิดพิกัดใน Google Maps
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
