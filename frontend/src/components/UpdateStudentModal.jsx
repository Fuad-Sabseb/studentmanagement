import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, UserCheck, X, Search, Building2, Phone, Mail, User } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UpdateStudentModal({
  open,
  onClose,
  onSubmit,
  students = [],
  departments = [],
  submitting,
  initialStudent = null
}) {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", department_id: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (open) {
      if (initialStudent) {
        setSelectedStudentId(String(initialStudent.id));
        setForm({
          name: initialStudent.name || "",
          email: initialStudent.email || "",
          phone: initialStudent.phone || "",
          department_id: initialStudent.department_id ? String(initialStudent.department_id) : ""
        });
      } else if (students.length > 0) {
        const first = students[0];
        setSelectedStudentId(String(first.id));
        setForm({
          name: first.name || "",
          email: first.email || "",
          phone: first.phone || "",
          department_id: first.department_id ? String(first.department_id) : ""
        });
      } else {
        setSelectedStudentId("");
        setForm({ name: "", email: "", phone: "", department_id: "" });
      }
      setSearchFilter("");
      setErrors({});
      setTouched({});
    }
  }, [open, initialStudent, students]);

  const handleSelectStudent = (studentId) => {
    setSelectedStudentId(studentId);
    const target = students.find((s) => String(s.id) === String(studentId));
    if (target) {
      setForm({
        name: target.name || "",
        email: target.email || "",
        phone: target.phone || "",
        department_id: target.department_id ? String(target.department_id) : ""
      });
    }
    setErrors({});
    setTouched({});
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleBlur = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    validateField(field);
  };

  const validateField = (field) => {
    const errs = { ...errors };
    if (field === "name" || !field) {
      if (!form.name.trim()) errs.name = "Name is required";
      else delete errs.name;
    }
    if (field === "email" || !field) {
      if (!form.email.trim()) errs.email = "Email is required";
      else if (!EMAIL_REGEX.test(form.email.trim())) errs.email = "Enter a valid email address";
      else delete errs.email;
    }
    if (field === "phone" || !field) {
      if (form.phone && !/^[0-9+\-()\s]{7,20}$/.test(form.phone)) {
        errs.phone = "Enter a valid phone number";
      } else {
        delete errs.phone;
      }
    }
    setErrors(errs);
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    const validationErrors = validateField();
    setTouched({ name: true, email: true, phone: true });

    if (Object.keys(validationErrors).length > 0) return;

    const studentObj = students.find((s) => String(s.id) === String(selectedStudentId));

    onSubmit({
      id: Number(selectedStudentId),
      payload: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        department_id: form.department_id ? Number(form.department_id) : null
      },
      original: studentObj
    });
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.email.toLowerCase().includes(searchFilter.toLowerCase())
  );

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
            aria-labelledby="update-student-title"
            className="glass-panel w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between border-b border-slate-800/70 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30">
                  <UserCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 id="update-student-title" className="font-display text-base font-semibold text-white">
                    Update Student Information
                  </h2>
                  <p className="text-xs text-slate-400">Select a student and edit their details</p>
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

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Student Selector */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Select Student to Update
                </label>
                {students.length > 5 && (
                  <div className="relative mb-2">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Filter student list..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="input-field pl-8 !py-1.5 text-xs"
                    />
                  </div>
                )}
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleSelectStudent(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="" disabled>-- Select a student --</option>
                  {filteredStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email}){s.department_name ? ` • ${s.department_name}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudentId && (
                <div className="space-y-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="update-name" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <User className="h-3.5 w-3.5" /> Full Name
                    </label>
                    <input
                      id="update-name"
                      value={form.name}
                      onChange={handleChange("name")}
                      onBlur={handleBlur("name")}
                      className="input-field"
                      placeholder="e.g. Fuad Sabseb"
                    />
                    {touched.name && errors.name && (
                      <p className="mt-1 text-xs text-rose-400">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="update-email" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <Mail className="h-3.5 w-3.5" /> Email Address
                    </label>
                    <input
                      id="update-email"
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

                  {/* Phone */}
                  <div>
                    <label htmlFor="update-phone" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <Phone className="h-3.5 w-3.5" /> Phone Number <span className="text-slate-600">(optional)</span>
                    </label>
                    <input
                      id="update-phone"
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

                  {/* Department */}
                  <div>
                    <label htmlFor="update-dept" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <Building2 className="h-3.5 w-3.5" /> Department <span className="text-slate-600">(optional)</span>
                    </label>
                    <select
                      id="update-dept"
                      value={form.department_id}
                      onChange={handleChange("department_id")}
                      className="input-field"
                    >
                      <option value="">No department (Unassigned)</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedStudentId}
                  className="btn-primary"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Student Changes
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}