import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Building2, Loader2, X } from "lucide-react";

export default function CourseModal({
  open,
  onClose,
  onSubmit,
  departments = [],
  semesters = [],
  initialCourse = null,
  submitting
}) {
  const [form, setForm] = useState({ name: "", code: "", department_id: "", credit_hours: 3, semester_id: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (initialCourse) {
        setForm({
          name: initialCourse.name || "",
          code: initialCourse.code || "",
          department_id: initialCourse.department_id ? String(initialCourse.department_id) : "",
          credit_hours: initialCourse.credit_hours ? Number(initialCourse.credit_hours) : 3,
          semester_id: initialCourse.semester_id ? String(initialCourse.semester_id) : ""
        });
      } else {
        setForm({
          name: "",
          code: "",
          department_id: departments[0]?.id ? String(departments[0].id) : "",
          credit_hours: 3,
          semester_id: semesters[0]?.id ? String(semesters[0].id) : ""
        });
      }
      setErrors({});
    }
  }, [open, initialCourse, departments, semesters]);

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
    if (!form.name.trim()) newErrors.name = "Course name is required";
    if (!form.code.trim()) newErrors.code = "Course code is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      id: initialCourse?.id,
      payload: {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        department_id: form.department_id ? Number(form.department_id) : null,
        credit_hours: Number(form.credit_hours) || 3,
        semester_id: form.semester_id ? Number(form.semester_id) : null
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
            className="glass-panel w-full max-w-md p-6"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-slate-800/70 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30">
                  <BookOpen className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    {initialCourse ? "Edit Course" : "Add New Course"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {initialCourse ? "Update course details" : "Register a curriculum course"}
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
                  Course Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS101, MATH201, PHY102"
                  value={form.code}
                  onChange={handleChange("code")}
                  className="input-field uppercase"
                  autoFocus
                />
                {errors.code && <p className="mt-1 text-xs text-rose-400">{errors.code}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Course Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures and Algorithms"
                  value={form.name}
                  onChange={handleChange("name")}
                  className="input-field"
                />
                {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">
                    Credit Hours (1–6)
                  </label>
                  <select
                    value={form.credit_hours}
                    onChange={handleChange("credit_hours")}
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5, 6].map((ch) => (
                      <option key={ch} value={ch}>
                        {ch} Credit{ch > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">
                    Academic Term / Semester
                  </label>
                  <select
                    value={form.semester_id}
                    onChange={handleChange("semester_id")}
                    className="input-field"
                  >
                    <option value="">No Semester Assigned</option>
                    {semesters.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.academic_year})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Building2 className="h-3.5 w-3.5" /> Department <span className="text-slate-600">(optional)</span>
                </label>
                <select
                  value={form.department_id}
                  onChange={handleChange("department_id")}
                  className="input-field"
                >
                  <option value="">No Department (General Course)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {initialCourse ? "Save Changes" : "Create Course"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
