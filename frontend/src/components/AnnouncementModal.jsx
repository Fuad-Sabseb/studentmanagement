import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Loader2, X, AlertTriangle, Info, Flame } from "lucide-react";

export default function AnnouncementModal({
  open,
  onClose,
  onSubmit,
  initialAnnouncement = null,
  submitting
}) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "normal",
    audience: "all"
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (initialAnnouncement) {
        setForm({
          title: initialAnnouncement.title || "",
          content: initialAnnouncement.content || "",
          priority: initialAnnouncement.priority || "normal",
          audience: initialAnnouncement.audience || "all"
        });
      } else {
        setForm({
          title: "",
          content: "",
          priority: "normal",
          audience: "all"
        });
      }
      setErrors({});
    }
  }, [open, initialAnnouncement]);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((errs) => {
        const next = { ...errs };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.content.trim()) newErrors.content = "Announcement content is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      id: initialAnnouncement?.id,
      payload: {
        title: form.title.trim(),
        content: form.content.trim(),
        priority: form.priority,
        audience: form.audience
      }
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
            className="glass-panel w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-slate-800/70 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">
                  <Bell className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    {initialAnnouncement ? "Edit Announcement" : "Post New Announcement"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Publish a notice to student dashboards and the portal
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
                  Notice Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mid-Term Examination Schedule Released"
                  value={form.title}
                  onChange={handleChange("title")}
                  className="input-field"
                  autoFocus
                />
                {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">
                    Priority Level
                  </label>
                  <select
                    value={form.priority}
                    onChange={handleChange("priority")}
                    className="input-field"
                  >
                    <option value="normal">🔵 Normal Notice</option>
                    <option value="important">🟡 Important Notice</option>
                    <option value="urgent">🔴 Urgent Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">
                    Target Audience
                  </label>
                  <select
                    value={form.audience}
                    onChange={handleChange("audience")}
                    className="input-field"
                  >
                    <option value="all">Everyone (Students & Admins)</option>
                    <option value="students">Students Only</option>
                    <option value="admins">Admins Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Notice Content & Details
                </label>
                <textarea
                  rows={4}
                  placeholder="Type the full message, guidelines, or instructions here..."
                  value={form.content}
                  onChange={handleChange("content")}
                  className="input-field resize-none"
                />
                {errors.content && <p className="mt-1 text-xs text-rose-400">{errors.content}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {initialAnnouncement ? "Save Notice" : "Broadcast Announcement"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
