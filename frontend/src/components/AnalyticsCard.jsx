import { motion, AnimatePresence } from "framer-motion";


export default function AnalyticsCard({ label, value, icon: Icon, accent = "brand", loading, trend }) {
  const accentClasses = {
    brand: "from-brand-500/20 to-brand-500/5 text-brand-300 ring-brand-500/30",
    indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-300 ring-indigo-500/30",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-300 ring-emerald-500/30",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-300 ring-amber-500/30"
  }[accent];

  return (
    <div className="glass-panel flex items-center gap-4 p-5">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ${accentClasses}`}
      >
        <Icon className="h-5.5 w-5.5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        {loading ? (
          <div className="skeleton mt-2 h-7 w-20" />
        ) : (
          <AnimatePresence mode="wait">
            <motion.p
              key={String(value)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="font-display text-2xl font-semibold text-white"
            >
              {value}
            </motion.p>
          </AnimatePresence>
        )}

        {trend && !loading && (
          <p className="mt-0.5 text-xs text-emerald-400">{trend}</p>
        )}
      </div>
    </div>
  );
}
