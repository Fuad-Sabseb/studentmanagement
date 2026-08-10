import { AnimatePresence, motion } from "framer-motion";
import { Loader2, TriangleAlert } from "lucide-react";

export default function ConfirmDeleteModal({ open, student, onCancel, onConfirm, submitting }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            className="glass-panel w-full max-w-sm p-6 text-center"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30">
              <TriangleAlert className="h-6 w-6" />
            </div>
            <h2 id="confirm-delete-title" className="font-display text-base font-semibold text-white">
              Remove {student?.name}?
            </h2>
            <p className="mt-1.5 text-sm text-slate-400">
              This student will be soft-deleted and hidden from the active roster. This can be
              reversed later from the database if needed.
            </p>

            <div className="mt-6 flex justify-center gap-2">
              <button onClick={onCancel} className="btn-secondary">
                Cancel
              </button>
              <button onClick={onConfirm} disabled={submitting} className="btn-danger">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete Student
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
