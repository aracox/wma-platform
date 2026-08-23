"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { BookOpen, ChevronRight, Download } from "lucide-react";
import { getKnowledgeArticles, getKnowledgePdfUrl } from "@/data/knowledge";

export default function KnowledgePage() {
  const locale = useLocale();
  const articles = getKnowledgeArticles();

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-10 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-3xl p-8 md:p-10 text-white border border-primary-900 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">คลังความรู้</h1>
            </div>
            <p className="text-sm md:text-base text-blue-100/90 max-w-3xl leading-relaxed">
              บทความและสื่อความรู้เกี่ยวกับการจัดการน้ำเสีย คุณภาพน้ำ และผลกระทบต่อสิ่งแวดล้อมและสุขภาพ
            </p>
          </div>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-500">ยังไม่มีบทความในคลังความรู้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article.slug}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200/70 overflow-hidden flex flex-col group"
              >
                <div className="p-6 flex-grow">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-primary-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-4">
                    {article.summary}
                  </p>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
                  <Link
                    href={`/${locale}/knowledge/${article.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
                  >
                    อ่านเพิ่มเติม
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <a
                    href={getKnowledgePdfUrl(article)}
                    download
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 px-2.5 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
