import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Table,
  Loader2,
  X,
  Save,
  Search,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { gradesApi } from "../services/api.js";
import { useToast } from "./Toast.jsx";

function computeRow(marks) {
  const mid = Number(marks.mid_exam) || 0;
  const q = Number(marks.quiz) || 0;
  const assign = Number(marks.assignment) || 0;
  const fin = Number(marks.final_exam) || 0;

  if (mid === 0 && q === 0 && assign === 0 && fin === 0) {
    return { total: 0, letter: "—", gpa: "—" };
  }

  let total = (mid + q + assign + fin <= 100)
    ? (mid + q + assign + fin)
    : (mid * 0.2 + q * 0.1 + assign * 0.2 + fin * 0.5);

  total = Number(Math.min(100, Math.max(0, total)).toFixed(2));

  let letter, gpa;
  if (total >= 90) { letter = "A+"; gpa = 4.0; }
  else if (total >= 85) { letter = "A"; gpa = 4.0; }
  else if (total >= 80) { letter = "A-"; gpa = 3.75; }
  else if (total >= 75) { letter = "B+"; gpa = 3.5; }
  else if (total >= 70) { letter = "B"; gpa = 3.0; }
  else if (total >= 65) { letter = "B-"; gpa = 2.75; }
  else if (total >= 60) { letter = "C+"; gpa = 2.5; }
  else if (total >= 50) { letter = "C"; gpa = 2.0; }
  else if (total >= 45) { letter = "C-"; gpa = 1.75; }
  else if (total >= 40) { letter = "D"; gpa = 1.0; }
  else { letter = "F"; gpa = 0.0; }

  return { total, letter, gpa };
}

// Simple robust CSV line parser
function parseCSV(text) {
  const lines = text.split(/\r\n|\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.replace(/^["']|["']$/g, "").trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Split by comma ignoring inside quotes
    const values = [];
    let insideQuote = false;
    let currVal = "";
    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c];
      if (char === '"' || char === "'") {
        insideQuote = !insideQuote;
      } else if (char === "," && !insideQuote) {
        values.push(currVal.trim());
        currVal = "";
      } else {
        currVal += char;
      }
    }
    values.push(currVal.trim());

    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] !== undefined ? values[idx].replace(/^["']|["']$/g, "").trim() : "";
    });
    rows.push(rowObj);
  }
  return rows;
}

export default function BatchGradeEntryModal({
  open,
  onClose,
  courses = [],
  initialCourseId = null,
  onSuccess
}) {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [students, setStudents] = useState([]);
  const [grid, setGrid] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const currentCourse = courses.find((c) => String(c.id) === String(selectedCourseId));

  useEffect(() => {
    if (open) {
      const cId = initialCourseId ? String(initialCourseId) : (courses[0]?.id ? String(courses[0].id) : "");
      setSelectedCourseId(cId);
      setSearch("");
      if (cId) loadCourseRoster(cId);
      else { setStudents([]); setGrid({}); }
    }
  }, [open, initialCourseId, courses]);

  const loadCourseRoster = async (courseId) => {
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await gradesApi.getCourseStudentsAndGrades(courseId);
      const roster = res.data || [];
      setStudents(roster);

      const initialGrid = {};
      roster.forEach((s) => {
        initialGrid[s.student_id] = {
          mid_exam: s.mid_exam != null && Number(s.mid_exam) > 0 ? String(s.mid_exam) : "",
          quiz: s.quiz != null && Number(s.quiz) > 0 ? String(s.quiz) : "",
          assignment: s.assignment != null && Number(s.assignment) > 0 ? String(s.assignment) : "",
          final_exam: s.final_exam != null && Number(s.final_exam) > 0 ? String(s.final_exam) : ""
        };
      });
      setGrid(initialGrid);
    } catch (err) {
      toast.error(err.message || "Failed to load course roster");
      setStudents([]);
      setGrid({});
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (newCId) => {
    setSelectedCourseId(newCId);
    loadCourseRoster(newCId);
  };

  const handleCellChange = (studentId, field, value) => {
    setGrid((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [field]: value }
    }));
  };

  /* ---------------- CSV Template Download ---------------- */
  const handleDownloadTemplate = () => {
    if (students.length === 0) {
      toast.error("No students enrolled in this course to export.");
      return;
    }

    const headers = [
      "Student ID",
      "Student Name",
      "Student Email",
      "Mid Exam (20)",
      "Quiz (10)",
      "Assignment (20)",
      "Final Exam (50)"
    ];

    const rows = students.map((s) => {
      const row = grid[s.student_id] || {};
      return [
        s.student_id,
        `"${(s.student_name || "").replace(/"/g, '""')}"`,
        `"${(s.student_email || "").replace(/"/g, '""')}"`,
        row.mid_exam ?? "",
        row.quiz ?? "",
        row.assignment ?? "",
        row.final_exam ?? ""
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${currentCourse?.code || "Course"}_grades_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded template for ${currentCourse?.code || "course"}`);
  };

  /* ---------------- CSV File Upload & Parsing ---------------- */
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== "string") return;

        const parsedRows = parseCSV(text);
        if (parsedRows.length === 0) {
          toast.error("The CSV file is empty or could not be parsed.");
          return;
        }

        let matchedCount = 0;
        const newGrid = { ...grid };

        parsedRows.forEach((row) => {
          // Identify student by student id or email
          const rowId = row["student id"] || row["id"] || row["studentid"];
          const rowEmail = (row["student email"] || row["email"] || "").toLowerCase();

          const targetStudent = students.find((s) =>
            (rowId && String(s.student_id) === String(rowId)) ||
            (rowEmail && s.student_email.toLowerCase() === rowEmail)
          );

          if (targetStudent) {
            matchedCount++;
            const mid = row["mid exam (20)"] ?? row["mid exam"] ?? row["mid_exam"] ?? row["mid"] ?? "";
            const quiz = row["quiz (10)"] ?? row["quiz"] ?? "";
            const assign = row["assignment (20)"] ?? row["assignment"] ?? row["assign"] ?? "";
            const fin = row["final exam (50)"] ?? row["final exam"] ?? row["final_exam"] ?? row["final"] ?? "";

            newGrid[targetStudent.student_id] = {
              mid_exam: mid !== "" && !isNaN(Number(mid)) ? String(Number(mid)) : (newGrid[targetStudent.student_id]?.mid_exam || ""),
              quiz: quiz !== "" && !isNaN(Number(quiz)) ? String(Number(quiz)) : (newGrid[targetStudent.student_id]?.quiz || ""),
              assignment: assign !== "" && !isNaN(Number(assign)) ? String(Number(assign)) : (newGrid[targetStudent.student_id]?.assignment || ""),
              final_exam: fin !== "" && !isNaN(Number(fin)) ? String(Number(fin)) : (newGrid[targetStudent.student_id]?.final_exam || "")
            };
          }
        });

        setGrid(newGrid);
        toast.success(`Successfully imported marks for ${matchedCount} student(s) from spreadsheet!`);
      } catch (err) {
        toast.error(err.message || "Failed to process CSV file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSaveAll = async () => {
    if (!selectedCourseId) return;
    setSaving(true);
    try {
      const payloadGrades = students.map((s) => {
        const row = grid[s.student_id] || {};
        return {
          student_id: s.student_id,
          mid_exam: row.mid_exam !== "" && row.mid_exam !== undefined ? Number(row.mid_exam) : undefined,
          quiz: row.quiz !== "" && row.quiz !== undefined ? Number(row.quiz) : undefined,
          assignment: row.assignment !== "" && row.assignment !== undefined ? Number(row.assignment) : undefined,
          final_exam: row.final_exam !== "" && row.final_exam !== undefined ? Number(row.final_exam) : undefined
        };
      });

      await gradesApi.batchEnter({
        course_id: Number(selectedCourseId),
        grades: payloadGrades
      });

      toast.success("All student marks saved successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to save batch grades");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.student_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="glass-panel w-full max-w-5xl p-5 sm:p-6 max-h-[92vh] flex flex-col"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
                  <Table className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    Batch Grade Entry & Spreadsheet Import
                  </h2>
                  <p className="text-xs text-slate-400">
                    Input marks inline or upload an Excel/CSV spreadsheet
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCourseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="input-field !py-1.5 !text-xs max-w-[240px]"
                >
                  <option value="" disabled>-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Bar: Search + CSV Tools */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
              <div className="relative max-w-xs flex-1 min-w-[200px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter student list..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-8 !py-1.5 !text-xs"
                />
              </div>

              {/* Spreadsheet CSV Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadTemplate}
                  disabled={students.length === 0}
                  className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5 hover:border-brand-500/50 hover:text-brand-300"
                  title="Download CSV Grade Sheet to fill in Excel"
                >
                  <Download className="h-3.5 w-3.5 text-brand-400" />
                  <span>Download Excel/CSV</span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,text/csv"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={students.length === 0}
                  className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5 hover:border-emerald-500/50 hover:text-emerald-300"
                  title="Upload filled CSV file from Excel"
                >
                  <Upload className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Upload Spreadsheet</span>
                </button>
              </div>
            </div>

            {/* Spreadsheet Table Container */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-950/60">
              {loading ? (
                <div className="flex h-48 items-center justify-center gap-2 text-sm text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
                  Loading enrolled students…
                </div>
              ) : students.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No students are enrolled in this course yet.
                </div>
              ) : (
                <table className="w-full min-w-[700px] text-left text-xs">
                  <thead className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-3.5 py-2.5 font-semibold">Student Name & Email</th>
                      <th className="px-2.5 py-2.5 font-semibold w-24 text-center">Mid (20)</th>
                      <th className="px-2.5 py-2.5 font-semibold w-24 text-center">Quiz (10)</th>
                      <th className="px-2.5 py-2.5 font-semibold w-24 text-center">Assign (20)</th>
                      <th className="px-2.5 py-2.5 font-semibold w-24 text-center">Final (50)</th>
                      <th className="px-2.5 py-2.5 font-semibold w-20 text-center">Total</th>
                      <th className="px-2.5 py-2.5 font-semibold w-20 text-center">Grade</th>
                      <th className="px-3.5 py-2.5 font-semibold w-24 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStudents.map((s) => {
                      const row = grid[s.student_id] || {};
                      const derived = computeRow(row);
                      const isComplete = row.final_exam !== "" && Number(row.final_exam) > 0;
                      const isPartial = (row.mid_exam !== "" && Number(row.mid_exam) > 0) && !isComplete;

                      return (
                        <tr key={s.student_id} className="transition hover:bg-slate-900/40">
                          <td className="px-3.5 py-2">
                            <div className="font-medium text-slate-100">{s.student_name}</div>
                            <div className="text-[11px] text-slate-500">{s.student_email}</div>
                          </td>
                          <td className="px-1.5 py-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={row.mid_exam ?? ""}
                              onChange={(e) => handleCellChange(s.student_id, "mid_exam", e.target.value)}
                              placeholder="—"
                              className="input-field !py-1 text-center font-mono !text-xs focus:ring-1 focus:ring-brand-500"
                            />
                          </td>
                          <td className="px-1.5 py-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={row.quiz ?? ""}
                              onChange={(e) => handleCellChange(s.student_id, "quiz", e.target.value)}
                              placeholder="—"
                              className="input-field !py-1 text-center font-mono !text-xs focus:ring-1 focus:ring-brand-500"
                            />
                          </td>
                          <td className="px-1.5 py-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={row.assignment ?? ""}
                              onChange={(e) => handleCellChange(s.student_id, "assignment", e.target.value)}
                              placeholder="—"
                              className="input-field !py-1 text-center font-mono !text-xs focus:ring-1 focus:ring-brand-500"
                            />
                          </td>
                          <td className="px-1.5 py-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={row.final_exam ?? ""}
                              onChange={(e) => handleCellChange(s.student_id, "final_exam", e.target.value)}
                              placeholder="—"
                              className="input-field !py-1 text-center font-mono !text-xs focus:ring-1 focus:ring-brand-500"
                            />
                          </td>
                          <td className="px-2.5 py-2 text-center font-mono font-semibold text-slate-100">
                            {derived.total > 0 ? derived.total : "—"}
                          </td>
                          <td className="px-2.5 py-2 text-center">
                            {derived.letter !== "—" ? (
                              <span className="pill border border-emerald-800/60 bg-emerald-950/60 text-emerald-300 font-semibold !px-2 !py-0.5">
                                {derived.letter}
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                          <td className="px-3.5 py-2 text-center">
                            {isComplete ? (
                              <span className="pill border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 !px-2 !py-0.5">
                                🟢 Graded
                              </span>
                            ) : isPartial ? (
                              <span className="pill border border-amber-500/40 bg-amber-950/60 text-amber-300 !px-2 !py-0.5">
                                🟡 Mid Saved
                              </span>
                            ) : (
                              <span className="pill border border-slate-700/60 bg-slate-900/60 text-slate-500 !px-2 !py-0.5">
                                ⚪ Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer Actions */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-800/70 pt-3">
              <span className="text-xs text-slate-400">
                You can download the template to Excel, edit marks, and upload it back here anytime.
              </span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={saving}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={saving || students.length === 0}
                  className="btn-primary !px-4"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving All Grades…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save All Course Grades
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
