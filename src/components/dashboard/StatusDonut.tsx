"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useTranslations } from "next-intl";

const STATUS_COLORS = {
  operational: "#43A047",
  non_operational: "#E53935",
  construction: "#FFC107",
  cancelled: "#90A4AE",
};

interface Props {
  data: { status: string; count: number }[];
}

export default function StatusDonut({ data }: Props) {
  const t = useTranslations("home.status");
  const chartData = data.map((d) => ({
    name: t(d.status as any),
    value: d.count,
    color: STATUS_COLORS[d.status as keyof typeof STATUS_COLORS] ?? "#90A4AE",
  }));

  return (
    <div className="kpi-card">
      <h3 className="font-semibold text-primary-800 mb-4">{t("title")}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, "ระบบ"]} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
