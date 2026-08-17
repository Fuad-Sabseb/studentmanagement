import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, User, X } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = { name: "", email: "", phone: "", department_id: "" };

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!EMAIL_REGEX.test(form.email.trim())) errors.email = "Enter a valid email address";
  if (form.phone && !/^[0-9+\-()\s]{7,20}$/.test(form.phone)) {
    errors.phone = "Enter a valid phone number";
  }
  return errors;
}

export default function StudentModal({ open, onClose, onSubmit, departments, student, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const isEdit = Boolean(student);

  useEffect(() => {
    if (open) {
      setForm(
        student
          ? {
              name: student.name || "",
              email: student.email || "",
              phone: student.phone || "",
              department_id: student.department_id ? String(student.department_id) : ""
            }
          : emptyForm
      );
      setErrors({});
      setTouched({});
    }
  }, [open, student]);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleBlur = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate({ ...form }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    setTouched({ name: true, email: true, phone: true });

    if (Object.keys(validationErrors).length > 0) return;

    onSubmit({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      department_id: form.department_id ? Number(form.department_id) : null
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
            aria-labelledby="student-modal-title"
            className="glass-panel w-full max-w-md p-6"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30">
                  <User className="h-4.5 w-4.5" />
                </div>
                <h2 id="student-modal-title" className="font-display text-base font-semibold text-white">
                  {isEdit ? "Edit Student" : "Add New Student"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Full name
                </label>
                <input
                  id="name"
                  value={form.name}
                  onChange={handleChange("name")}
                  onBlur={handleBlur("name")}
                  className="input-field"
                  placeholder="e.g. Fuad Sabseb"
                  autoFocus
                />
                {touched.name && errors.name && (
                  <p className="mt-1 text-xs text-rose-400">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  onBlur={handleBlur("email")}
                  className="input-field"
                  placeholder="e.g. fuad@example.com"
                />
                {touched.email && errors.email && (
                  <p className="mt-1 text-xs text-rose-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Phone <span className="text-slate-600">(optional)</span>
                </label>
                <input
                  id="phone"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  onBlur={handleBlur("phone")}
                  className="input-field"
                  placeholder="e.g. 0911000001"
                />
                {touched.phone && errors.phone && (
                  <p className="mt-1 text-xs text-rose-400">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="department" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Department <span className="text-slate-600">(optional)</span>
                </label>
                <select
                  id="department"
                  value={form.department_id}
                  onChange={handleChange("department_id")}
                  className="input-field"
                >
                  <option value="">No department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEdit ? "Save Changes" : "Add Student"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
