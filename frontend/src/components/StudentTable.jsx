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
  FileText,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

function StatusBadge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-800/80 text-slate-300 border border-slate-700/60",
    brand: "bg-brand-500/15 text-brand-300 border border-brand-500/30",
    emerald: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    crimson: "bg-crimson-500/15 text-crimson-300 border border-crimson-500/30"
  };
  return <span className={`pill ${tones[tone] || tones.slate}`}>{children}</span>;
}

function Avatar({ name }) {
  const initials = (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-crimson-600/30 to-brand-600/30 text-xs font-semibold text-white ring-1 ring-crimson-500/40">
      {initials}
    </div>
  );
}

function RowSkeleton() {
  return (
    <tr className="border-b border-slate-800/60">
      <td className="px-4 py-4"><div className="skeleton h-4 w-16" /></td>
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
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

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
          s.department_name?.toLowerCase().includes(q) ||
          String(s.id).includes(q)
      );
    }

    return rows;
  }, [students, search, tab, deptFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage]);

  // Export Handlers
  const exportToCSV = () => {
    const headers = ["Student ID", "Full Name", "Email", "Phone", "Department", "Courses Enrolled"];
    const rows = filtered.map((s) => [
      `STU-${String(s.id).padStart(5, "0")}`,
      `"${s.name}"`,
      s.email,
      s.phone || "—",
      `"${s.department_name || "Unassigned"}"`,
      `"${(s.courses || []).map((c) => c.code).join(", ")}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Student_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="glass-panel overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-800/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-900/60 p-1">
          <button
            onClick={() => { setTab("all"); setCurrentPage(1); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              tab === "all" ? "bg-crimson-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Students ({students.length})
          </button>
          <button
            onClick={() => { setTab("byDepartment"); setCurrentPage(1); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              tab === "byDepartment" ? "bg-crimson-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            By Department
          </button>
        </div>

        {/* Right Tools: Export, Print, Search */}
        <div className="flex flex-wrap items-center gap-2">
          {tab === "byDepartment" && (
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
              className="input-field !py-1.5 text-xs max-w-[160px]"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}

          {/* Search Field */}
          <div className="relative min-w-[180px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="input-field pl-8 !py-1.5 text-xs"
            />
          </div>

          {/* Export Buttons */}
          <button
            onClick={exportToCSV}
            className="btn-secondary !px-2.5 !py-1.5 text-xs flex items-center gap-1.5"
            title="Download CSV Spreadsheet"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn-secondary !px-2.5 !py-1.5 text-xs flex items-center gap-1.5"
            title="Print Student Directory"
          >
            <Printer className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800/80 bg-slate-900/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">Student ID</th>
              <th className="px-4 py-3">Student Profile</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Enrolled Courses</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <>
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
              </>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="mx-auto max-w-sm space-y-3">
                    <ServerCrash className="mx-auto h-8 w-8 text-rose-400" />
                    <p className="text-sm text-slate-300">{error}</p>
                    {onRetry && (
                      <button onClick={onRetry} className="btn-secondary !py-1.5 !px-3 text-xs">
                        Try Again
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  <Inbox className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-xs">No students match the current filter.</p>
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {paginatedRows.map((s) => (
                  <motion.tr
                    key={s.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                    className="group border-b border-slate-800/60 transition hover:bg-slate-800/40"
                  >
                    {/* Student ID */}
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-400">
                      <span className="pill border border-slate-700 bg-slate-900/80 text-slate-300">
                        STU-{String(s.id).padStart(5, "0")}
                      </span>
                    </td>

                    {/* Student Profile (Avatar, Name, Email) */}
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

                    {/* Department */}
                    <td className="px-4 py-3.5">
                      {s.department_name ? (
                        <StatusBadge tone="brand">
                          <Users className="h-3 w-3" /> {s.department_name}
                        </StatusBadge>
                      ) : (
                        <StatusBadge>Unassigned</StatusBadge>
                      )}
                    </td>

                    {/* Enrolled Courses */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {(s.courses || []).length === 0 ? (
                          <span className="text-xs text-slate-600">No courses</span>
                        ) : (
                          s.courses.slice(0, 3).map((c) => (
                            <span
                              key={c.id}
                              className="pill border border-slate-700/60 bg-slate-900/60 text-slate-300 text-[11px]"
                              title={`${c.code} — ${c.name}`}
                            >
                              {c.code}
                            </span>
                          ))
                        )}
                        {s.courses?.length > 3 && (
                          <span className="pill border border-slate-700 bg-slate-800 text-slate-400 text-[11px]">
                            +{s.courses.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3.5 text-slate-400">
                      <span className="flex items-center gap-1 text-xs">
                        <Phone className="h-3 w-3" /> {s.phone || "—"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-80 transition group-hover:opacity-100">
                        {onAssignCourse && (
                          <button
                            onClick={() => onAssignCourse(s)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-500/10 hover:text-brand-300"
                            title="Assign course"
                          >
                            <BookPlus className="h-4 w-4" />
                          </button>
                        )}
                        {onEnterGrades && (
                          <button
                            onClick={() => onEnterGrades(s)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-500/10 hover:text-emerald-300"
                            title="Enter grades"
                          >
                            <GraduationCap className="h-4 w-4" />
                          </button>
                        )}
                        {onViewTranscript && (
                          <button
                            onClick={() => onViewTranscript(s)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-crimson-500/10 hover:text-crimson-300"
                            title="View & Print Official Transcript"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(s)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-500/10 hover:text-indigo-300"
                            title="Edit student"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(s)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
                            title="Delete student"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-800/80 px-4 py-3 text-xs text-slate-400">
          <span>
            Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
            {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} students
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-medium text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
