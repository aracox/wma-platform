"use client";

import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useMemo } from "react";
import { ArrowLeft, BookOpen, Download } from "lucide-react";
import { getKnowledgeArticleBySlug, getKnowledgePdfUrl } from "@/data/knowledge";

export default function KnowledgeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();

  const slug = params.slug as string;
  const article = useMemo(() => getKnowledgeArticleBySlug(slug), [slug]);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col py-12">
        <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-700 mb-2">ไม่พบบทความ</h1>
        <button
          onClick={() => router.push(`/${locale}/knowledge`)}
          className="flex items-center text-primary-600 hover:text-primary-700 font-medium bg-primary-50 px-6 py-3 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          กลับไปหน้าคลังความรู้
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 border-b border-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 max-w-4xl py-6 relative z-10">
          <button
            onClick={() => router.push(`/${locale}/knowledge`)}
            className="flex items-center text-primary-100 hover:text-white font-medium mb-5 group transition-colors text-sm bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full w-fit backdrop-blur-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            กลับไปหน้าคลังความรู้
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-primary-200 text-xs font-bold uppercase tracking-wider opacity-80">คลังความรู้</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
            {article.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-4xl mt-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="space-y-4 text-slate-700 leading-relaxed text-[15px]">
            {article.content.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <a
              href={getKnowledgePdfUrl(article)}
              download
              className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <Download className="w-4 h-4" />
              ดาวน์โหลดไฟล์ PDF ฉบับเต็ม
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
