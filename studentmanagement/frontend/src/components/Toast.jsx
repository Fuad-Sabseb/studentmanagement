import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

const ToastContext = createContext(null);

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    ring: "border-emerald-800/60 bg-emerald-950/70",
    iconColor: "text-emerald-400",
    dot: "text-emerald-400"
  },
  error: {
    icon: TriangleAlert,
    ring: "border-rose-800/60 bg-rose-950/70",
    iconColor: "text-rose-400",
    dot: "text-rose-400"
  },
  info: {
    icon: Info,
    ring: "border-indigo-800/60 bg-indigo-950/70",
    iconColor: "text-indigo-300",
    dot: "text-indigo-300"
  }
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message, variant = "info", duration = 4000) => {
      const id = ++counter.current;
      setToasts((current) => [...current, { id, message, variant }]);
      if (duration) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (msg, duration) => notify(msg, "success", duration),
    error: (msg, duration) => notify(msg, "error", duration),
    info: (msg, duration) => notify(msg, "info", duration),
    dismiss
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const v = VARIANTS[t.variant] || VARIANTS.info;
            const Icon = v.icon;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className={`glass-panel pointer-events-auto flex w-full max-w-sm items-start gap-3 border px-4 py-3 ${v.ring}`}
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${v.iconColor}`} />
                <p className="flex-1 text-sm leading-snug text-slate-100">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 rounded-lg p-1 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
