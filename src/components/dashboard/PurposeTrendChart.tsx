"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface PurposeTrendChartProps {
  isThai: boolean;
}

const DATA = [
  { monthTh: "ม.ค.", monthEn: "Jan", system: 62, lao: 41, community: 55 },
  { monthTh: "ก.พ.", monthEn: "Feb", system: 74, lao: 58, community: 69 },
  { monthTh: "มี.ค.", monthEn: "Mar", system: 89, lao: 73, community: 84 },
  { monthTh: "เม.ย.", monthEn: "Apr", system: 95, lao: 81, community: 92 },
];

export default function PurposeTrendChart({ isThai }: PurposeTrendChartProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-base font-bold text-slate-900">
          {isThai ? "แนวโน้มกิจกรรมรายเดือน" : "Monthly Activity Trend"}
        </h3>
        <p className="text-xs text-slate-600">
          {isThai ? "เปรียบเทียบความคืบหน้า 3 ภารกิจหลักของแพลตฟอร์ม" : "Progress comparison across the 3 core platform missions."}
        </p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={isThai ? "monthTh" : "monthEn"} stroke="#475569" />
            <YAxis stroke="#475569" />
            <Tooltip />
            <Legend />
            <Bar name={isThai ? "ระบบบำบัด อปท" : "LAO Systems"} dataKey="system" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
            <Bar name={isThai ? "กิจกรรมของ อปท" : "LAO Activities"} dataKey="lao" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            <Bar name={isThai ? "กิจกรรมชุมชน" : "Community"} dataKey="community" fill="#059669" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
