import Link from "next/link";
import { useLocale } from "next-intl";
import { ChevronRight, Home, ExternalLink } from "lucide-react";

interface SitemapLink {
  titleTh: string;
  titleEn: string;
  href: string;
  isExternal?: boolean;
  children?: {
    titleTh: string;
    titleEn: string;
    href: string;
    isExternal?: boolean;
  }[];
}

interface SitemapGroup {
  categoryTh: string;
  categoryEn: string;
  links: SitemapLink[];
}

export default function SitemapPage() {
  const locale = useLocale();
  const isThai = locale === "th";

  // Only include active, currently displayed pages (exclude /feed, /report, /cooperation)
  const SITEMAP_GROUPS: SitemapGroup[] = [
    {
      categoryTh: "หน้าหลัก",
      categoryEn: "Home",
      links: [
        {
          titleTh: "หน้าหลักแพลตฟอร์ม",
          titleEn: "Home Dashboard",
          href: `/${locale}`,
        },
      ],
    },
    {
      categoryTh: "แจ้งปัญหา",
      categoryEn: "Report & LAO",
      links: [
        {
          titleTh: "แจ้งปัญหาน้ำเสียองค์การปกครองส่วนท้องถิ่น",
          titleEn: "LAO Directory & Issue Reporting",
          href: `/${locale}/lao`,
        },
        {
          titleTh: "รายงานปัญหาน้ำเสียทันที",
          titleEn: "Report Wastewater Issue Now",
          href: `/${locale}/report-issue`,
        },
      ],
    },
    {
      categoryTh: "แผนที่ อปท.",
      categoryEn: "LAO Map",
      links: [
        {
          titleTh: "แผนที่ อปท. (ระบบสารสนเทศภูมิศาสตร์)",
          titleEn: "LAO Wastewater Map (GIS)",
          href: `/${locale}/lao-map`,
          children: [
            {
              titleTh: "ชั้นข้อมูลระบบบำบัด อจน.",
              titleEn: "WMA Facilities Layer",
              href: `/${locale}/lao-map`,
            },
            {
              titleTh: "ชั้นข้อมูลระบบบำบัด อปท. ทั่วประเทศ",
              titleEn: "National LAO Facilities Layer",
              href: `/${locale}/lao-map`,
            },
          ],
        },
      ],
    },
    {
      categoryTh: "คลังความรู้",
      categoryEn: "Knowledge Base",
      links: [
        {
          titleTh: "คลังความรู้การจัดการน้ำเสียชุมชน",
          titleEn: "Wastewater Management Knowledge Hub",
          href: `/${locale}/knowledge`,
        },
      ],
    },
    {
      categoryTh: "ข่าวและประชาสัมพันธ์",
      categoryEn: "Announcements",
      links: [
        {
          titleTh: "ข่าวและประกาศทางการ",
          titleEn: "News & Official Announcements",
          href: `/${locale}/announcements`,
          children: [
            {
              titleTh: "Facebook องค์การจัดการน้ำเสีย",
              titleEn: "Official WMA Facebook",
              href: "https://www.facebook.com/WMA38",
              isExternal: true,
            },
          ],
        },
      ],
    },
    {
      categoryTh: "ติดต่อ อจน.",
      categoryEn: "Contact WMA",
      links: [
        {
          titleTh: "ติดต่อองค์การจัดการน้ำเสีย",
          titleEn: "Contact WMA",
          href: `/${locale}/join`,
          children: [
            {
              titleTh: "เว็บไซต์ทางการ อจน. (wma.or.th)",
              titleEn: "WMA Official Website",
              href: "https://www.wma.or.th",
              isExternal: true,
            },
          ],
        },
      ],
    },
    {
      categoryTh: "เข้าสู่ระบบ",
      categoryEn: "Sign In",
      links: [
        {
          titleTh: "เข้าสู่ระบบ Admin",
          titleEn: "Admin Sign In",
          href: `/${locale}/auth/login`,
        },
        {
          titleTh: "เข้าสู่ระบบผู้ใช้ทั่วไป",
          titleEn: "User Sign In",
          href: `/${locale}/auth/login/user`,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href={`/${locale}`} className="hover:text-primary-700 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>{isThai ? "หน้าหลัก" : "Home"}</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-primary-800 font-medium">{isThai ? "แผนผังเว็บไซต์" : "Sitemap"}</span>
        </nav>

        {/* Minimal Header */}
        <div className="border-b border-slate-200 pb-6 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {isThai ? "แผนผังเว็บไซต์" : "Sitemap"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isThai
              ? "โครงสร้างและผังการเชื่อมโยงหน้าเว็บทั้งหมดของระบบ WMA Platform"
              : "Site structure and directory of all active pages in WMA Platform"}
          </p>
        </div>

        {/* Clean Minimal Sitemap Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {SITEMAP_GROUPS.map((group, idx) => (
            <div key={idx} className="flex flex-col">
              {/* Category Title */}
              <div className="pb-2 mb-3 border-b-2 border-primary-700">
                <h2 className="text-base font-bold text-primary-900">
                  {isThai ? group.categoryTh : group.categoryEn}
                </h2>
              </div>

              {/* Links list */}
              <ul className="space-y-2.5 text-sm">
                {group.links.map((link, lIdx) => (
                  <li key={lIdx} className="space-y-1.5">
                    {link.isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-700 hover:text-primary-700 transition-colors font-medium"
                      >
                        <span>{isThai ? link.titleTh : link.titleEn}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-slate-800 hover:text-primary-700 transition-colors font-medium block"
                      >
                        {isThai ? link.titleTh : link.titleEn}
                      </Link>
                    )}

                    {/* Sub-links */}
                    {link.children && link.children.length > 0 && (
                      <ul className="pl-3.5 border-l border-slate-200 space-y-1.5 mt-1">
                        {link.children.map((sub, sIdx) => (
                          <li key={sIdx}>
                            {sub.isExternal ? (
                              <a
                                href={sub.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary-700 transition-colors"
                              >
                                <span>{isThai ? sub.titleTh : sub.titleEn}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            ) : (
                              <Link
                                href={sub.href}
                                className="text-xs text-slate-500 hover:text-primary-700 transition-colors block"
                              >
                                {isThai ? sub.titleTh : sub.titleEn}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
