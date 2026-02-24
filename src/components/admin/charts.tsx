"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

interface ChartData {
  name: string;
  value: number;
}

interface TimeSeriesData {
  date: string;
  leads: number;
  conversoes?: number;
}

// Gráfico de área para evolução de leads
export function LeadsChart({ data }: { data: TimeSeriesData[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        />
        <Area
          type="monotone"
          dataKey="leads"
          stroke="#2563eb"
          fillOpacity={1}
          fill="url(#colorLeads)"
          name="Leads"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Gráfico de pizza para status dos leads
export function StatusPieChart({ data }: { data: ChartData[] }) {
  const COLORS = ["#22c55e", "#eab308", "#3b82f6", "#ef4444", "#6b7280"];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Gráfico de barras para scores
export function ScoresBarChart({ data }: { data: ChartData[] }) {
  const getBarColor = (name: string) => {
    if (name === "Crítico") return "#ef4444";
    if (name === "Regular") return "#eab308";
    return "#22c55e";
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
          width={60}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Legenda personalizada
export function ChartLegend({
  items,
}: {
  items: { color: string; label: string; value: number }[];
}) {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm text-muted-foreground">
            {item.label}: <span className="font-medium">{item.value}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
