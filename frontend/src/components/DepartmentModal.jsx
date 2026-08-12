import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Loader2, X } from "lucide-react";

export default function DepartmentModal({
  open,
  onClose,
  onSubmit,
  initialDepartment = null,
  submitting
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(initialDepartment?.name || "");
      setError("");
    }
  }, [open, initialDepartment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Department name is required");
      return;
    }
    onSubmit({
      id: initialDepartment?.id,
      payload: { name: name.trim() }
    });
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
                  <Building2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    {initialDepartment ? "Edit Department" : "Add New Department"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {initialDepartment ? "Update department details" : "Create an academic department"}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Department Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Mechanical Engineering"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  className="input-field"
                  autoFocus
                />
                {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {initialDepartment ? "Save Changes" : "Create Department"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
