"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AQUA = "#22d3ee";
const TEAL = "#2dd4bf";
const AZURE = "#38bdf8";
const STATUS_COLORS = ["#fbbf24", "#22d3ee", "#38bdf8", "#2dd4bf", "#f87171", "#64788c"];

export function RevenueChart({
  data,
}: {
  data: { month: string; revenue: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={AQUA} stopOpacity={0.5} />
            <stop offset="100%" stopColor={AQUA} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2b3d" />
        <XAxis dataKey="month" stroke="#64788c" fontSize={12} />
        <YAxis stroke="#64788c" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: "#0f1826",
            border: "1px solid #1e2b3d",
            borderRadius: 12,
            color: "#e8f1f6",
          }}
          formatter={(v) => [`${Number(v).toLocaleString("ru-RU")} ₽`, "Выручка"]}
        />
        <Area type="monotone" dataKey="revenue" stroke={AQUA} strokeWidth={2} fill="url(#rev)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TopServicesChart({
  data,
}: {
  data: { name: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2b3d" horizontal={false} />
        <XAxis type="number" stroke="#64788c" fontSize={12} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#64788c"
          fontSize={12}
          width={130}
        />
        <Tooltip
          contentStyle={{
            background: "#0f1826",
            border: "1px solid #1e2b3d",
            borderRadius: 12,
            color: "#e8f1f6",
          }}
          formatter={(v) => [`${v}`, "Раз"]}
          cursor={{ fill: "rgba(34,211,238,0.08)" }}
        />
        <Bar dataKey="count" fill={TEAL} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusPie({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} stroke="#0f1826" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#0f1826",
            border: "1px solid #1e2b3d",
            borderRadius: 12,
            color: "#e8f1f6",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export const CHART_LEGEND_COLORS = STATUS_COLORS;
export { AQUA, TEAL, AZURE };
