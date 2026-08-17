import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, Loader2, X } from "lucide-react";

export default function CourseAssignModal({ open, onClose, onAssign, student, courses, assigningId }) {
  const [query, setQuery] = useState("");

  const assignedIds = useMemo(
    () => new Set((student?.courses || []).map((c) => c.id)),
    [student]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [courses, query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-modal-title"
            className="glass-panel w-full max-w-md rounded-b-none p-6 sm:rounded-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30">
                  <BookOpen className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 id="assign-modal-title" className="font-display text-base font-semibold text-white">
                    Assign Courses
                  </h2>
                  <p className="text-xs text-slate-500">{student?.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses…"
              className="input-field mb-3"
            />

            <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No courses found</p>
              ) : (
                filtered.map((c) => {
                  const isAssigned = assignedIds.has(c.id);
                  const isBusy = assigningId === c.id;
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-900/50 px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-100">{c.name}</p>
                        <p className="text-xs text-slate-500">
                          {c.code} {c.department_name ? `· ${c.department_name}` : ""}
                        </p>
                      </div>

                      <button
                        onClick={() => onAssign(student, c)}
                        disabled={isAssigned || isBusy}
                        className={`ml-3 flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          isAssigned
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-brand-500/15 text-brand-300 hover:bg-brand-500/25"
                        }`}
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isAssigned ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : null}
                        {isAssigned ? "Enrolled" : "Assign"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button onClick={onClose} className="btn-secondary">
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
