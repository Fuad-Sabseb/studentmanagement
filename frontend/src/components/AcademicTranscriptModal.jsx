import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Printer, Download, X, GraduationCap, Award, ShieldCheck, Calendar, User } from "lucide-react";
import logo from "../images/logo.png";

export default function AcademicTranscriptModal({
  open,
  onClose,
  student,
  grades = [],
  semesters = []
}) {
  const printRef = useRef(null);

  if (!student) return null;

  const totalCredits = grades.reduce((sum, g) => sum + Number(g.credit_hours || 3), 0);
  const totalWeightedPoints = grades.reduce(
    (sum, g) => sum + (Number(g.gpa || 0) * Number(g.credit_hours || 3)),
    0
  );
  const cgpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : "0.00";

  let standing = "Good Academic Standing";
  if (Number(cgpa) >= 3.75) standing = "First Class Honours with Distinction / Dean's List";
  else if (Number(cgpa) >= 3.5) standing = "First Class Honours";
  else if (Number(cgpa) >= 3.0) standing = "Second Class Honours (Upper Division)";
  else if (Number(cgpa) < 2.0 && grades.length > 0) standing = "Academic Warning / Probation";

  const handlePrint = () => {
    window.print();
  };

  const issueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-md overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="glass-panel w-full max-w-4xl p-6 sm:p-8 max-h-[94vh] flex flex-col"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <span className="pill border border-brand-500/40 bg-brand-500/15 text-brand-300 text-xs font-semibold">
                  Official Document Preview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1.5 shadow-glow"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Printable Transcript Document Sheet */}
            <div
              ref={printRef}
              className="flex-1 overflow-y-auto rounded-xl border border-slate-700/60 bg-slate-900/90 p-6 sm:p-8 text-slate-100 print:bg-white print:text-black print:p-0 print:border-none shadow-2xl"
            >
              {/* University Letterhead Header */}
              <div className="flex items-center justify-between border-b-2 border-brand-500 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden shadow-glow border border-brand-500/30">
                    <img src={logo} alt="x University" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white print:text-black">
                      x UNIVERSITY
                    </h1>
                    <p className="text-xs uppercase tracking-widest text-brand-400 print:text-slate-700 font-semibold">
                      Office of the Registrar & Academic Affairs
                    </p>
                    <p className="text-[11px] text-slate-400 print:text-slate-600">
                      Official Student Academic Transcript & Grade Report
                    </p>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <div className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-mono text-emerald-300 print:text-emerald-800">
                    <ShieldCheck className="h-3 w-3" />
                    AUTHENTICATED RECORD
                  </div>
                  <p className="text-[11px] text-slate-400 print:text-slate-600 mt-1 font-mono">
                    Issue Date: {issueDate}
                  </p>
                </div>
              </div>

              {/* Student Demographics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/60 print:bg-slate-50 print:border-slate-300 mb-6 text-xs">
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-slate-400 print:text-slate-600">
                    Student Full Name
                  </span>
                  <span className="font-semibold text-white print:text-black text-sm">
                    {student.name}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-slate-400 print:text-slate-600">
                    Student ID
                  </span>
                  <span className="font-mono font-semibold text-white print:text-black text-sm">
                    STU-{String(student.id).padStart(5, "0")}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-slate-400 print:text-slate-600">
                    Department
                  </span>
                  <span className="font-medium text-slate-200 print:text-slate-800">
                    {student.department_name || "General Studies"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-slate-400 print:text-slate-600">
                    Email Contact
                  </span>
                  <span className="font-medium text-slate-200 print:text-slate-800 truncate block">
                    {student.email}
                  </span>
                </div>
              </div>

              {/* Course & Grade Table */}
              <div className="overflow-hidden rounded-xl border border-slate-800 print:border-slate-300 mb-6">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950/90 text-[11px] uppercase tracking-wider text-slate-400 print:bg-slate-100 print:text-slate-700">
                    <tr>
                      <th className="px-3.5 py-2.5 font-semibold">Course Code</th>
                      <th className="px-3.5 py-2.5 font-semibold">Course Title</th>
                      <th className="px-3 py-2.5 font-semibold text-center w-20">Credits</th>
                      <th className="px-3 py-2.5 font-semibold text-center w-20">Score</th>
                      <th className="px-3 py-2.5 font-semibold text-center w-20">Letter</th>
                      <th className="px-3 py-2.5 font-semibold text-center w-20">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 print:divide-slate-200">
                    {grades.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500">
                          No recorded grades for this student.
                        </td>
                      </tr>
                    ) : (
                      grades.map((g) => (
                        <tr key={g.id} className="print:bg-transparent">
                          <td className="px-3.5 py-2.5 font-mono font-bold text-slate-200 print:text-black">
                            {g.course_code}
                          </td>
                          <td className="px-3.5 py-2.5 font-medium text-slate-100 print:text-black">
                            {g.course_name}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono text-slate-300 print:text-slate-800">
                            {g.credit_hours || 3}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono text-slate-300 print:text-slate-800">
                            {g.total_score}
                          </td>
                          <td className="px-3 py-2.5 text-center font-semibold text-emerald-400 print:text-black">
                            {g.letter_grade}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono font-semibold text-indigo-300 print:text-black">
                            {g.gpa}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Statistics & Standing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-slate-800/80 print:border-slate-300 py-4 mb-8">
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-slate-400 print:text-slate-600">
                    Total Credits Earned
                  </span>
                  <span className="font-display text-lg font-bold text-white print:text-black">
                    {totalCredits} Credits
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-slate-400 print:text-slate-600">
                    Cumulative CGPA (4.0 Scale)
                  </span>
                  <span className="font-display text-lg font-bold text-brand-300 print:text-black font-mono">
                    {cgpa} / 4.00
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-slate-400 print:text-slate-600">
                    Academic Standing
                  </span>
                  <span className="font-semibold text-emerald-300 print:text-emerald-800 text-xs block mt-1">
                    {standing}
                  </span>
                </div>
              </div>

              {/* Official Seal & Signature Section */}
              <div className="flex items-end justify-between pt-6 text-xs text-slate-400 print:text-slate-600">
                <div className="space-y-1">
                  <p className="font-mono text-[10px]">Verification Document No: TRN-{Date.now().toString().slice(-8)}</p>
                  <p className="text-[10px]">This transcript is valid only when bearing the official digital university verification.</p>
                </div>
                <div className="text-center w-48 border-t border-slate-600 print:border-black pt-2">
                  <p className="font-semibold text-slate-200 print:text-black">Registrar's Signature</p>
                  <p className="text-[10px] text-slate-400">Office of Academic Records</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
