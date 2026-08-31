"use client";

import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { getLaoById } from "@/data/lao";
import { useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function LAODetailPage() {
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  
  const laoId = params.id as string;
  const lao = useMemo(() => getLaoById(laoId), [laoId]);

  useEffect(() => {
    if (lao) {
      router.replace(`/${locale}/report-issue?location=${encodeURIComponent(lao.name)}`);
    } else {
      router.replace(`/${locale}/report-issue`);
    }
  }, [lao, locale, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12">
      <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
      <p className="text-gray-600 font-medium">กำลังไปยังหน้าแจ้งปัญหา...</p>
    </div>
  );
}
