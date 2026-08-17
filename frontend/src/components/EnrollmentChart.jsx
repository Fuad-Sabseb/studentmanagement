
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { BarChart3 } from "lucide-react";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel border-slate-700/80 px-3 py-2 text-xs">
      <p className="font-medium text-slate-200">{label}</p>
      <p className="text-brand-300">{payload[0].value} students enrolled</p>
    </div>
  );
}

export default function EnrollmentChart({ courses, loading }) {
  const data = (courses || [])
    .map((c) => ({
      name: c.code || c.name,
      enrolled: Number(c.enrolled_count) || 0
    }))
    .sort((a, b) => b.enrolled - a.enrolled)
    .slice(0, 8);

  return (
    <div className="glass-panel p-5 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-brand-300" />
          <h3 className="font-display text-sm font-semibold text-white">
            Course Enrollment
          </h3>
        </div>
        <span className="pill border border-slate-700/80 text-slate-400">
          Top {data.length || 0}
        </span>
      </div>

      {loading ? (
        <div className="skeleton h-56 w-full" />
      ) : data.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center gap-2 text-slate-500">
          <BarChart3 className="h-8 w-8 opacity-40" />
          <p className="text-sm">No enrollment data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={224}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={{ fill: "rgba(139, 92, 246, 0.08)" }} content={<CustomTooltip />} />
            <Bar dataKey="enrolled" fill="url(#barFill)" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
