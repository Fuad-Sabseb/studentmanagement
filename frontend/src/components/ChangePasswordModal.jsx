import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, Loader2, X, Lock, CheckCircle2 } from "lucide-react";
import { authApi } from "../services/api.js";
import { useToast } from "./Toast.jsx";

export default function ChangePasswordModal({ open, onClose }) {
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("New password must be at least 8 characters and include upper and lower case letters and a number");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully!");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update password");
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
                  <KeyRound className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    Change Account Password
                  </h2>
                  <p className="text-xs text-slate-400">
                    Update your login credentials securely
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

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  New Password (min. 8 chars, upper + lower + number)
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update Password
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
