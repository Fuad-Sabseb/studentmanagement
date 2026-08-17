import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Pencil,
  Trash2,
  BookPlus,
  Mail,
  Phone,
  Users,
  Inbox,
  ServerCrash,
  GraduationCap,
  FileText
} from "lucide-react";

function StatusBadge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-800/80 text-slate-300 border border-slate-700/60",
    brand: "bg-brand-500/15 text-brand-300 border border-brand-500/30"
  };
  return <span className={`pill ${tones[tone]}`}>{children}</span>;
}

function Avatar({ name }) {
  const initials = (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/30 to-indigo-500/20 text-xs font-semibold text-brand-200 ring-1 ring-brand-500/30">
      {initials}
    </div>
  );
}

function RowSkeleton() {
  return (
    <tr className="border-b border-slate-800/60">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="skeleton h-9 w-9 rounded-full" />
          <div className="space-y-2">
            <div className="skeleton h-3.5 w-32" />
            <div className="skeleton h-3 w-40" />
          </div>
        </div>
      </td>
      <td className="px-4 py-4"><div className="skeleton h-3 w-24" /></td>
      <td className="px-4 py-4"><div className="skeleton h-5 w-28 rounded-full" /></td>
      <td className="px-4 py-4"><div className="skeleton h-3 w-16" /></td>
      <td className="px-4 py-4"><div className="skeleton ml-auto h-8 w-24" /></td>
    </tr>
  );
}

export default function StudentTable({
  students,
  departments,
  loading,
  error,
  onRetry,
  onEdit,
  onAssignCourse,
  onDelete,
  onEnterGrades,
  onViewTranscript
}) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all"); // "all" | "byDepartment"
  const [deptFilter, setDeptFilter] = useState("all");

  const filtered = useMemo(() => {
    let rows = students;

    if (tab === "byDepartment" && deptFilter !== "all") {
      rows = rows.filter((s) => String(s.department_id) === String(deptFilter));
    }

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.department_name?.toLowerCase().includes(q)
      );
    }

    return rows;
  }, [students, search, tab, deptFilter]);

  return (
    <div className="glass-panel overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-800/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-900/60 p-1">
          {[
            { id: "all", label: "All Active Students" },
            { id: "byDepartment", label: "Department Breakdown" }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                tab === t.id ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab === t.id && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-lg bg-brand-500/90 shadow-glow"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center gap-2 sm:justify-end">
          {tab === "byDepartment" && (
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="input-field !w-auto max-w-[180px]"
            >
              <option value="all">All departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}

          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, department…"
              className="input-field pl-9"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      {error ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <ServerCrash className="h-10 w-10 text-rose-400" />
          <p className="text-sm font-medium text-slate-200">Couldn't load students</p>
          <p className="max-w-sm text-xs text-slate-500">{error}</p>
          <button onClick={onRetry} className="btn-secondary mt-2">
            Try again
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800/70 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Courses</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <Inbox className="h-8 w-8 opacity-40" />
                      <p className="text-sm font-medium text-slate-300">
                        {students.length === 0 ? "No students yet" : "No matches found"}
                      </p>
                      <p className="text-xs">
                        {students.length === 0
                          ? "Add your first student to get started."
                          : "Try a different search term or filter."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence initial={false}>
                  {filtered.map((s) => (
                    <motion.tr
                      key={s.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                      className="group border-b border-slate-800/60 transition hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={s.name} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-100">{s.name}</p>
                            <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                              <Mail className="h-3 w-3" /> {s.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {s.department_name ? (
                          <StatusBadge tone="brand">
                            <Users className="h-3 w-3" /> {s.department_name}
                          </StatusBadge>
                        ) : (
                          <StatusBadge>Unassigned</StatusBadge>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {(s.courses || []).length === 0 ? (
                            <span className="text-xs text-slate-600">No courses</span>
                          ) : (
                            s.courses.slice(0, 4).map((c) => {
                              const isInserted = c.status === "inserted" || (c.letter_grade && c.final_exam > 0);
                              const isPartial = c.status === "partial" || (c.mid_exam > 0 && !isInserted);

                              if (isInserted) {
                                return (
                                  <span
                                    key={c.id}
                                    className="pill border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 font-medium"
                                    title={`${c.code}: Marks Inserted! Score: ${c.total_score}, Grade: ${c.letter_grade}, GPA: ${c.gpa}`}
                                  >
                                    ✓ {c.code} {c.letter_grade ? `(${c.letter_grade})` : ""}
                                  </span>
                                );
                              }

                              if (isPartial) {
                                return (
                                  <span
                                    key={c.id}
                                    className="pill border border-amber-500/40 bg-amber-950/60 text-amber-300 font-medium"
                                    title={`${c.code}: Mid Exam Inserted (${c.mid_exam} pts). Final Exam pending.`}
                                  >
                                    ⏳ {c.code} (Mid)
                                  </span>
                                );
                              }

                              return (
                                <span
                                  key={c.id}
                                  className="pill border border-slate-700/60 bg-slate-900/60 text-slate-400"
                                  title={`${c.code} — ${c.name} (No marks inserted yet)`}
                                >
                                  {c.code}
                                </span>
                              );
                            })
                          )}
                          {s.courses?.length > 4 && (
                            <span className="pill border border-slate-700/60 bg-slate-800/60 text-slate-400">
                              +{s.courses.length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">
                        <span className="flex items-center gap-1 text-xs">
                          <Phone className="h-3 w-3" /> {s.phone || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-80 transition group-hover:opacity-100">
                          <button
                            onClick={() => onAssignCourse(s)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-500/10 hover:text-brand-300"
                            title="Assign course"
                            aria-label={`Assign course to ${s.name}`}
                          >
                            <BookPlus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onEnterGrades(s)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-500/10 hover:text-emerald-300"
                            title="Enter grades"
                            aria-label={`Enter grades for ${s.name}`}
                          >
                            <GraduationCap className="h-4 w-4" />
                          </button>
                          {onViewTranscript && (
                            <button
                              onClick={() => onViewTranscript(s)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-500/10 hover:text-brand-300"
                              title="View & Print Official Transcript"
                              aria-label={`Official Transcript for ${s.name}`}
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onEdit(s)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-500/10 hover:text-indigo-300"
                            title="Edit student"
                            aria-label={`Edit ${s.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete(s)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                            title="Delete student"
                            aria-label={`Delete ${s.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && (
        <div className="border-t border-slate-800/70 px-4 py-3 text-xs text-slate-500">
          Showing {filtered.length} of {students.length} active student
          {students.length === 1 ? "" : "s"}
        </div>
      )}
    </div>
  );
}
