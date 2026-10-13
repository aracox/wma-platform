"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Megaphone,
  ExternalLink,
  ThumbsUp,
  RefreshCw,
  Calendar,
  X,
  ChevronRight,
} from "lucide-react";
import { formatDateBE } from "@/lib/utils";

const FACEBOOK_PAGE_URL = "https://www.facebook.com/WMA38";

interface SyncedPost {
  seq: number;
  id: string;
  message?: string;
  picture?: string;
  permalinkUrl?: string;
  createdTime?: string;
  syncedAt?: string;
}

export default function AnnouncementsPage() {
  const [posts, setPosts] = useState<SyncedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<SyncedPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/facebook/posts?limit=9");
      const data = await res.json();
      if (data?.posts && Array.isArray(data.posts)) {
        setPosts(data.posts.slice(0, 9));
      } else {
        setPosts([]);
      }
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const openModal = (post: SyncedPost) => {
    setSelectedPost(post);
    // Double rAF ensures the initial state is painted before animating
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsModalOpen(true);
      });
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedPost(null);
    }, 280);
  };

  // Lock body scroll when popup is open
  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedPost]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 pt-8">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-3xl p-8 md:p-12 text-white border border-primary-900 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  ข่าวและกิจกรรม องค์การจัดการน้ำเสีย
                </h1>
              </div>
              <p className="text-sm md:text-base text-blue-100/90 max-w-2xl leading-relaxed">
                ติดตามข่าวสาร กิจกรรม และความเคลื่อนไหวล่าสุด เชื่อมต่อสดจากเพจ Facebook
                ทางการขององค์การจัดการน้ำเสีย (@WMA38)
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white text-blue-900 hover:bg-blue-50 px-5 py-2.5 rounded-2xl text-xs font-black shadow-md transition-all active:scale-95"
              >
                <ThumbsUp className="w-4 h-4 text-blue-600" />
                เพจ Facebook ทางการ
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-800">
              ข่าวสารทั้งหมด ({posts.length} โพสต์)
            </span>
          </div>

          <button
            onClick={fetchPosts}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            รีเฟรช
          </button>
        </div>

        {/* Posts Grid */}
        {loading && posts.length === 0 ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
            <p className="text-xs text-slate-500">กำลังโหลดข่าวสาร...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl font-black shadow-xs">
              f
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-slate-900">
                ยังไม่มีโพสต์ที่ซิงค์จากเพจ Facebook @WMA38
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                เมื่อมีโพสต์ใหม่ ข้อมูลจริงจากเพจทางการจะถูกบันทึกลงระบบและแสดงผลที่นี่โดยอัตโนมัติ
              </p>
            </div>
            <div className="pt-2">
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm"
              >
                เปิดดูโพสต์บนเพจทางการ @WMA38
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {posts.map((post) => (
              <article
                key={post.id}
                onClick={() => openModal(post)}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-primary-200 transition-all flex flex-col group cursor-pointer"
              >
                {/* Post Image */}
                {post.picture && (
                  <div className="h-48 relative bg-slate-100 overflow-hidden">
                    <Image
                      src={post.picture}
                      alt="WMA Facebook Update"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Post Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary-600" />
                        {post.createdTime ? formatDateBE(post.createdTime, "th") : "เมื่อเร็วๆ นี้"}
                      </span>
                      <span>•</span>
                      <span className="text-slate-400">@WMA38</span>
                    </div>

                    <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-normal line-clamp-4">
                      {post.message || "ดูรายละเอียดกิจกรรมและข้อมูลเพิ่มเติมบนเพจทางการขององค์การจัดการน้ำเสีย"}
                    </p>
                  </div>

                  {/* Bottom Action Link */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary-600 group-hover:text-primary-700">
                    <span className="inline-flex items-center gap-1">
                      อ่านรายละเอียด
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">องค์การจัดการน้ำเสีย</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* View More on Facebook Button */}
        {posts.length > 0 && (
          <div className="pt-4 text-center">
            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white hover:bg-primary-50 text-primary-900 border border-slate-200 hover:border-primary-300 px-6 py-3 rounded-2xl text-xs font-bold shadow-xs hover:shadow-md transition-all group"
            >
              <span>ดูโพสต์ทั้งหมดเพิ่มเติมบนเพจ Facebook @WMA38</span>
              <ExternalLink className="w-3.5 h-3.5 text-primary-600 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* OVERLAY POPUP MODAL (SMOOTH SPRING MOTION & FADE TRANSITION)   */}
      {/* ============================================================== */}
      {selectedPost && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto transition-opacity duration-300 ease-out ${
            isModalOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[90vh] flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
              isModalOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-4"
            }`}
          >
            {/* Close Button Top Right */}
            <button
              onClick={closeModal}
              aria-label="ปิดหน้าต่าง"
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto flex-1">
              {/* Full Image */}
              {selectedPost.picture && (
                <div className="relative w-full h-64 sm:h-80 bg-slate-100">
                  <Image
                    src={selectedPost.picture}
                    alt="WMA Facebook Update Detail"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Text & Details Content */}
              <div className="p-6 sm:p-8 space-y-4">
                {/* Metadata Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedPost.createdTime
                      ? formatDateBE(selectedPost.createdTime, "th")
                      : "เมื่อเร็วๆ นี้"}
                  </span>
                  <span className="text-slate-400 font-medium">
                    องค์การจัดการน้ำเสีย (@WMA38)
                  </span>
                </div>

                {/* Full Unclamped Message */}
                <div className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {selectedPost.message || "ไม่มีข้อความเพิ่มเติมสำหรับโพสต์นี้"}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
              >
                ปิดหน้าต่าง
              </button>

              <a
                href={selectedPost.permalinkUrl || FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
              >
                ดูต้นฉบับบน Facebook
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
