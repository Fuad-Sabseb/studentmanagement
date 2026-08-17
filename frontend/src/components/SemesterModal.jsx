import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Loader2, X } from "lucide-react";
import { semestersApi } from "../services/api.js";
import { useToast } from "./Toast.jsx";

export default function SemesterModal({ open, onClose, semester = null, onSuccess }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [academicYear, setAcademicYear] = useState("2025/2026");
  const [isCurrent, setIsCurrent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(semester && semester.id);

  useEffect(() => {
    if (open) {
      if (semester) {
        setName(semester.name || "");
        setAcademicYear(semester.academic_year || "2025/2026");
        setIsCurrent(Boolean(semester.is_current));
      } else {
        setName("");
        setAcademicYear("2025/2026");
        setIsCurrent(false);
      }
      setError("");
    }
  }, [open, semester]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Semester name is required (e.g. Year 1 Sem I, Fall 2025)");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = {
        name: name.trim(),
        academic_year: academicYear.trim(),
        is_current: isCurrent
      };

      if (isEditing) {
        await semestersApi.update(semester.id, payload);
        toast.success("Semester updated successfully!");
      } else {
        await semestersApi.create(payload);
        toast.success("Academic semester created successfully!");
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save semester");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="glass-panel w-full max-w-md p-6"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-slate-800/70 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    {isEditing ? "Edit Academic Semester" : "Add Academic Semester"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Define term structure (e.g. Year 1 Sem I, Fall 2025)
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-rose-800/60 bg-rose-950/40 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Semester Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Year 1 Sem I or Fall 2025"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Academic Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2025/2026"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCurrentSemester"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500"
                />
                <label htmlFor="isCurrentSemester" className="text-xs text-slate-300 cursor-pointer">
                  Set as Current Active Semester
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/70">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEditing ? "Save Changes" : "Create Semester"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
