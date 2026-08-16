import { useEffect, useMemo, useState } from "react";
import { X, Award, CheckCircle2, Clock, AlertCircle, Search, User } from "lucide-react";
import { gradesApi } from "../services/api.js";

function calculateLivePreview(marks) {
  const mid = Number(marks.mid_exam) || 0;
  const q = Number(marks.quiz) || 0;
  const assign = Number(marks.assignment) || 0;
  const fin = Number(marks.final_exam) || 0;

  if (mid === 0 && q === 0 && assign === 0 && fin === 0) {
    return null;
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

export default function GradeEntryModal({
  open,
  onClose,
  onSubmit,
  student: targetStudent,
  students = [],
  courses = [],
  submitting
}) {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [marks, setMarks] = useState({ mid_exam: "", quiz: "", assignment: "", final_exam: "" });
  const [fetchingMarks, setFetchingMarks] = useState(false);
  const [studentFilter, setStudentFilter] = useState("");

  // Determine effective student
  const activeStudent = useMemo(() => {
    if (targetStudent) return targetStudent;
    if (!selectedStudentId) return null;
    return students.find((s) => String(s.id) === String(selectedStudentId)) || null;
  }, [targetStudent, selectedStudentId, students]);

  useEffect(() => {
    if (open) {
      if (targetStudent) {
        setSelectedStudentId(String(targetStudent.id));
        const initialCourse = targetStudent.courses?.[0]?.id || "";
        setCourseId(initialCourse ? String(initialCourse) : "");
        loadCourseMarks(targetStudent, initialCourse);
      } else if (students.length > 0) {
        const first = students[0];
        setSelectedStudentId(String(first.id));
        const initialCourse = first.courses?.[0]?.id || "";
        setCourseId(initialCourse ? String(initialCourse) : "");
        loadCourseMarks(first, initialCourse);
      } else {
        setSelectedStudentId("");
        setCourseId("");
        setMarks({ mid_exam: "", quiz: "", assignment: "", final_exam: "" });
      }
      setStudentFilter("");
    }
  }, [open, targetStudent, students]);

  const loadCourseMarks = async (stud, cId) => {
    if (!stud || !cId) {
      setMarks({ mid_exam: "", quiz: "", assignment: "", final_exam: "" });
      return;
    }

    // First check local course object
    const courseObj = (stud.courses || []).find((c) => String(c.id) === String(cId));
    if (courseObj && (courseObj.mid_exam != null || courseObj.final_exam != null)) {
      setMarks({
        mid_exam: courseObj.mid_exam != null && Number(courseObj.mid_exam) > 0 ? String(courseObj.mid_exam) : "",
        quiz: courseObj.quiz != null && Number(courseObj.quiz) > 0 ? String(courseObj.quiz) : "",
        assignment: courseObj.assignment != null && Number(courseObj.assignment) > 0 ? String(courseObj.assignment) : "",
        final_exam: courseObj.final_exam != null && Number(courseObj.final_exam) > 0 ? String(courseObj.final_exam) : ""
      });
      return;
    }

    setFetchingMarks(true);
    try {
      const res = await gradesApi.getByStudentAndCourse(stud.id, cId);
      if (res.data) {
        setMarks({
          mid_exam: res.data.mid_exam != null && Number(res.data.mid_exam) > 0 ? String(res.data.mid_exam) : "",
          quiz: res.data.quiz != null && Number(res.data.quiz) > 0 ? String(res.data.quiz) : "",
          assignment: res.data.assignment != null && Number(res.data.assignment) > 0 ? String(res.data.assignment) : "",
          final_exam: res.data.final_exam != null && Number(res.data.final_exam) > 0 ? String(res.data.final_exam) : ""
        });
      } else {
        setMarks({ mid_exam: "", quiz: "", assignment: "", final_exam: "" });
      }
    } catch {
      setMarks({ mid_exam: "", quiz: "", assignment: "", final_exam: "" });
    } finally {
      setFetchingMarks(false);
    }
  };

  const handleStudentChange = (sId) => {
    setSelectedStudentId(sId);
    const stud = students.find((s) => String(s.id) === String(sId));
    const firstCourse = stud?.courses?.[0]?.id || "";
    setCourseId(firstCourse ? String(firstCourse) : "");
    loadCourseMarks(stud, firstCourse);
  };

  const handleCourseChange = (newCId) => {
    setCourseId(newCId);
    loadCourseMarks(activeStudent, newCId);
  };

  const handleChange = (field) => (e) => {
    setMarks((m) => ({ ...m, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeStudent || !courseId) return;

    onSubmit({
      student_id: activeStudent.id,
      course_id: Number(courseId),
      mid_exam: marks.mid_exam !== "" ? Number(marks.mid_exam) : undefined,
      quiz: marks.quiz !== "" ? Number(marks.quiz) : undefined,
      assignment: marks.assignment !== "" ? Number(marks.assignment) : undefined,
      final_exam: marks.final_exam !== "" ? Number(marks.final_exam) : undefined
    });
  };

  if (!open) return null;

  const enrolledCourses = activeStudent?.courses?.length
    ? activeStudent.courses
    : courses;

  const selectedCourseObj = (activeStudent?.courses || []).find((c) => String(c.id) === String(courseId));
  const currentStatus = selectedCourseObj?.status || (selectedCourseObj?.letter_grade ? "inserted" : "not_inserted");

  const preview = calculateLivePreview(marks);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentFilter.toLowerCase()) ||
      s.email.toLowerCase().includes(studentFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-800/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-white">
                {targetStudent ? `Submit Grade — ${targetStudent.name}` : "Submit Course Grade"}
              </h3>
              <p className="text-xs text-slate-400">
                Enter exam marks. Mid exam persists when completing final exam later.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Picker if modal opened globally from Header */}
          {!targetStudent && (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <User className="h-3.5 w-3.5" /> Select Student
              </label>
              {students.length > 5 && (
                <div className="relative mb-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={studentFilter}
                    onChange={(e) => setStudentFilter(e.target.value)}
                    className="input-field pl-8 !py-1.5 text-xs"
                  />
                </div>
              )}
              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="input-field"
                required
              >
                <option value="" disabled>-- Select a student --</option>
                {filteredStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email}) — {s.courses?.length || 0} course{s.courses?.length === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Course Selector */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-slate-400">Course</label>
              {/* Status Badge */}
              {selectedCourseObj && (
                <div>
                  {currentStatus === "inserted" ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Marks Inserted
                    </span>
                  ) : currentStatus === "partial" ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400">
                      <Clock className="h-3.5 w-3.5" /> Mid Exam Inserted (Partial)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <AlertCircle className="h-3.5 w-3.5" /> Not Inserted Yet
                    </span>
                  )}
                </div>
              )}
            </div>
            <select
              value={courseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="input-field"
              required
              disabled={!activeStudent || enrolledCourses.length === 0}
            >
              <option value="" disabled>
                {enrolledCourses.length === 0 ? "No courses available for this student" : "Select a course"}
              </option>
              {enrolledCourses.map((c) => {
                const markStatus = c.status === "inserted" ? "🟢 Graded" : c.status === "partial" ? "🟡 Mid Saved" : "⚪ Pending";
                return (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name} [{markStatus}]
                  </option>
                );
              })}
            </select>
          </div>

          {/* Marks Input Fields */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-300">Marks Assessment</p>
              {fetchingMarks && <span className="text-xs text-brand-400">Loading saved marks…</span>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["mid_exam", "Mid Exam", "e.g. 20 (or out of 100)"],
                ["quiz", "Quiz", "e.g. 10 (or out of 100)"],
                ["assignment", "Assignment", "e.g. 20 (or out of 100)"],
                ["final_exam", "Final Exam", "e.g. 50 (or out of 100)"]
              ].map(([field, label, hint]) => (
                <div key={field}>
                  <label className="mb-1 block text-xs font-medium text-slate-400">{label}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder={hint}
                    value={marks[field]}
                    onChange={handleChange(field)}
                    className="input-field"
                  />
                </div>
              ))}
            </div>

            {/* Live Calculation Preview Banner */}
            {preview && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-800/90 bg-slate-950/70 p-2.5 text-xs">
                <span className="text-slate-400">
                  Computed Total: <strong className="text-slate-100">{preview.total} / 100</strong>
                </span>
                <div className="flex items-center gap-2">
                  <span className="pill border border-emerald-800/50 bg-emerald-950/50 text-emerald-300 font-semibold">
                    Grade: {preview.letter}
                  </span>
                  <span className="pill border border-indigo-800/50 bg-indigo-950/50 text-indigo-300">
                    GPA: {preview.gpa}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !courseId || !activeStudent}
            >
              {submitting ? "Saving…" : "Save Grade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}