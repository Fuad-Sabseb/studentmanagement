import { useEffect, useState, useMemo } from "react";
import {
  GraduationCap,
  LogOut,
  Mail,
  Phone,
  BookOpen,
  Award,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Bell,
  KeyRound,
  Edit2,
  Loader2,
  X,
  FileText,
  Calendar,
  Clock
} from "lucide-react";
import { studentsApi, gradesApi, announcementsApi, schedulesApi } from "../services/api.js";
import { useToast } from "./Toast.jsx";
import ChangePasswordModal from "./ChangePasswordModal.jsx";
import AcademicTranscriptModal from "./AcademicTranscriptModal.jsx";
import TimetableGrid from "./TimetableGrid.jsx";
import Footer from "./Footer.jsx";
import logo from "../images/logo.png";

export default function StudentDashboard({ currentUser, onLogout }) {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [grades, setGrades] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modals
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [transcriptModalOpen, setTranscriptModalOpen] = useState(false);

  // Phone edit modal
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  const loadData = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const studentId = currentUser?.studentId || currentUser?.student_id || currentUser?.id;

    try {
      // 1. Fetch Profile
      let profileData = null;
      try {
        const profileRes = await studentsApi.getMyProfile();
        profileData = profileRes.data;
      } catch {
        if (studentId) {
          const profileRes = await studentsApi.getById(studentId);
          profileData = profileRes.data;
        }
      }

      // 2. Fetch Grades
      let gradesList = [];
      try {
        const gradesRes = await gradesApi.getMyGrades();
        gradesList = gradesRes.data ?? [];
      } catch {
        if (studentId) {
          const gradesRes = await gradesApi.getByStudent(studentId);
          gradesList = gradesRes.data ?? [];
        }
      }

      // 3. Fetch Class Schedules
      let schedulesList = [];
      try {
        const schedRes = await schedulesApi.getMySchedule();
        schedulesList = schedRes.data ?? [];
      } catch {
        schedulesList = [];
      }

      // 4. Fetch Announcements for students
      let announcementsList = [];
      try {
        const annRes = await announcementsApi.getAll();
        announcementsList = annRes.data ?? [];
      } catch {
        announcementsList = [];
      }

      setProfile(profileData);
      setGrades(gradesList);
      setSchedules(schedulesList);
      setAnnouncements(announcementsList);
    } catch (err) {
      setError(err.message || "Could not load your academic dashboard.");
      toast.error("Failed to load some portal data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.studentId, currentUser?.student_id]);

  const { cgpa, totalCredits, totalCourses, gradedCount, academicStanding } = useMemo(() => {
    const validGrades = grades.filter((g) => g.gpa != null);
    let totalCreds = 0;
    let weightedSum = 0;

    validGrades.forEach((g) => {
      const cr = Number(g.credit_hours) || 3;
      totalCreds += cr;
      weightedSum += (Number(g.gpa) * cr);
    });

    let calculatedCgpa = "—";
    if (totalCreds > 0) {
      calculatedCgpa = (weightedSum / totalCreds).toFixed(2);
    } else if (grades.length > 0 && grades[0]?.cgpa != null) {
      calculatedCgpa = Number(grades[0].cgpa).toFixed(2);
    }

    const numCgpa = Number(calculatedCgpa) || 0;
    let standing = "In Progress";
    if (numCgpa >= 3.75) standing = "First Class Honours (Dean's List)";
    else if (numCgpa >= 3.5) standing = "First Class Honours";
    else if (numCgpa >= 3.0) standing = "Second Class (Upper Division)";
    else if (numCgpa >= 2.0) standing = "Good Academic Standing";
    else if (numCgpa > 0) standing = "Academic Warning";

    return {
      cgpa: calculatedCgpa,
      totalCredits: totalCreds,
      totalCourses: profile?.courses?.length || grades.length || 0,
      gradedCount: validGrades.length,
      academicStanding: standing
    };
  }, [grades, profile]);

  const handleSavePhone = async (e) => {
    e.preventDefault();
    setSavingPhone(true);
    try {
      await studentsApi.updateMyProfile({ phone: editPhone });
      toast.success("Phone number updated successfully!");
      setPhoneModalOpen(false);
      loadData(true);
    } catch (err) {
      toast.error(err.message || "Failed to update phone number");
    } finally {
      setSavingPhone(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/85 px-4 py-3.5 sm:px-6 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-glow overflow-hidden">
              <img src={logo} alt="Student Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="font-display text-base sm:text-lg font-semibold text-white">
                Student Academic Portal
              </h1>
              <p className="text-xs text-slate-400">
                {profile ? `${profile.name} • ${profile.department_name || "Enrolled Student"}` : "Welcome back"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTranscriptModalOpen(true)}
              className="btn-primary !px-3 !py-1.5 text-xs flex items-center gap-1.5 shadow-glow"
              title="Official Transcript (PDF)"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Official Transcript</span>
            </button>

            <button
              onClick={() => setPasswordModalOpen(true)}
              className="btn-secondary !px-2.5 text-xs flex items-center gap-1.5"
              title="Change Password"
            >
              <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Password</span>
            </button>

            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="btn-secondary !px-2.5 text-xs"
              title="Refresh"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={onLogout}
              className="btn-secondary !px-2.5 text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
        {loading ? (
          <div className="glass-panel flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
            <p className="text-sm">Loading your student academic profile…</p>
          </div>
        ) : error ? (
          <div className="glass-panel border-rose-800/60 p-6 text-center text-rose-300">
            <p className="text-sm font-medium">{error}</p>
            <button onClick={() => loadData()} className="btn-secondary mt-3 text-xs">
              Try Again
            </button>
          </div>
        ) : profile ? (
          <>
            {/* Student ID Hero Card */}
            <div className="glass-panel overflow-hidden p-6 relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-glow text-white font-display text-2xl font-bold">
                    {profile.name?.charAt(0) || "S"}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-xl font-bold text-white">{profile.name}</h2>
                      <span className="pill border border-brand-500/40 bg-brand-500/10 text-brand-300 font-mono text-[11px]">
                        ID: STU-{String(profile.id).padStart(5, "0")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">
                      Department: <strong className="text-white">{profile.department_name || "General"}</strong>
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                        {profile.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-500" />
                        {profile.phone || "No phone added"}
                        <button
                          onClick={() => {
                            setEditPhone(profile.phone || "");
                            setPhoneModalOpen(true);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 ml-1"
                          title="Update phone number"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Standing & CGPA badge */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0 border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-xs uppercase font-medium tracking-wide text-slate-400">
                      Cumulative CGPA
                    </p>
                    <p className="font-display text-3xl font-bold text-brand-300 font-mono">
                      {cgpa} <span className="text-xs text-slate-500 font-normal">/ 4.00</span>
                    </p>
                  </div>
                  <span className="pill border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold">
                    <Sparkles className="h-3 w-3 inline mr-1" />
                    {academicStanding}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick KPI Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-panel p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs">
                  <BookOpen className="h-4 w-4 text-indigo-400" />
                  <span>Enrolled Courses</span>
                </div>
                <p className="font-display text-2xl font-bold text-white">{totalCourses}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Active curriculum</p>
              </div>

              <div className="glass-panel p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs">
                  <Award className="h-4 w-4 text-emerald-400" />
                  <span>Graded Courses</span>
                </div>
                <p className="font-display text-2xl font-bold text-emerald-300">{gradedCount}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {totalCourses - gradedCount > 0 ? `${totalCourses - gradedCount} in progress` : "All completed"}
                </p>
              </div>

              <div className="glass-panel p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-brand-400" />
                  <span>Credits Earned</span>
                </div>
                <p className="font-display text-2xl font-bold text-white">{totalCredits} CH</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Credit-hour weighted</p>
              </div>

              <div className="glass-panel p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs">
                  <TrendingUp className="h-4 w-4 text-amber-400" />
                  <span>Academic Standing</span>
                </div>
                <p className="font-display text-sm font-semibold text-amber-200 truncate mt-1">
                  {academicStanding}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Good record</p>
              </div>
            </div>

            {/* Campus Notice Board */}
            {announcements.length > 0 && (
              <div className="glass-panel p-5">
                <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2 text-white font-display font-semibold text-sm">
                    <Bell className="h-4 w-4 text-brand-400" />
                    <span>Campus Notice Board</span>
                  </div>
                  <span className="text-xs text-slate-400">{announcements.length} announcement(s)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {announcements.slice(0, 4).map((a) => (
                    <div
                      key={a.id}
                      className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-xs text-white truncate">{a.title}</h4>
                        <span
                          className={`pill text-[10px] font-semibold uppercase ${
                            a.priority === "urgent"
                              ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                              : a.priority === "important"
                              ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                              : "border-slate-700 bg-slate-800 text-slate-300"
                          }`}
                        >
                          {a.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{a.content}</p>
                      <p className="text-[10px] text-slate-400 font-mono pt-1">
                        Posted by {a.author_name || "Admin"} • {new Date(a.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Timetable & Class Schedule */}
            <TimetableGrid schedules={schedules} isAdmin={false} />

            {/* Grades & Mark Assessment Breakdown */}
            <div className="glass-panel overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/70 p-5 gap-2">
                <div>
                  <h2 className="font-display text-base font-semibold text-white">Course Grades & Mark Assessment</h2>
                  <p className="text-xs text-slate-400">Score components, credit hours, and grade points per course</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTranscriptModalOpen(true)}
                    className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5 hover:border-brand-500/50 hover:text-brand-300"
                  >
                    <FileText className="h-3.5 w-3.5 text-brand-400" />
                    <span>Download PDF Transcript</span>
                  </button>
                  <span className="pill border border-brand-500/40 bg-brand-500/15 text-brand-300 font-medium font-mono text-xs">
                    CGPA: {cgpa}
                  </span>
                </div>
              </div>

              {grades.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No graded courses recorded yet. Once your instructors submit exam marks, your breakdown will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800/70 text-[11px] uppercase tracking-wide text-slate-400 bg-slate-900/40">
                        <th className="px-4 py-3 font-semibold">Course</th>
                        <th className="px-3 py-3 font-semibold text-center w-20">Credits</th>
                        <th className="px-3 py-3 font-semibold text-center w-20">Mid (20)</th>
                        <th className="px-3 py-3 font-semibold text-center w-20">Quiz (10)</th>
                        <th className="px-3 py-3 font-semibold text-center w-20">Assign (20)</th>
                        <th className="px-3 py-3 font-semibold text-center w-20">Final (50)</th>
                        <th className="px-3 py-3 font-semibold text-center w-20">Total</th>
                        <th className="px-3 py-3 font-semibold text-center w-20">Grade</th>
                        <th className="px-3 py-3 font-semibold text-center w-20">GPA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {grades.map((g) => (
                        <tr key={g.id} className="transition hover:bg-slate-900/30">
                          <td className="px-4 py-3 font-medium text-slate-100">
                            <div>{g.course_code} — {g.course_name}</div>
                            {g.semester_name && (
                              <div className="text-[10px] text-indigo-400 font-mono">{g.semester_name}</div>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center font-mono text-slate-300">
                            {g.credit_hours || 3} CH
                          </td>
                          <td className="px-3 py-3 text-center text-slate-300 font-mono">{g.mid_exam ?? "—"}</td>
                          <td className="px-3 py-3 text-center text-slate-300 font-mono">{g.quiz ?? "—"}</td>
                          <td className="px-3 py-3 text-center text-slate-300 font-mono">{g.assignment ?? "—"}</td>
                          <td className="px-3 py-3 text-center text-slate-300 font-mono">{g.final_exam ?? "—"}</td>
                          <td className="px-3 py-3 text-center font-semibold text-white font-mono">{g.total_score}</td>
                          <td className="px-3 py-3 text-center">
                            <span className="pill border border-emerald-700/50 bg-emerald-950/60 text-emerald-300 font-semibold !px-2">
                              {g.letter_grade}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center font-mono font-semibold text-indigo-300">{g.gpa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>

      <Footer apiStatus="online" />

      {/* Edit Phone Modal */}
      {phoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm p-5">
            <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-display text-sm font-semibold text-white">Update Contact Phone</h3>
              <button onClick={() => setPhoneModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSavePhone} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. 0911000001"
                  className="input-field"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPhoneModalOpen(false)}
                  className="btn-secondary !py-1.5 !px-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPhone}
                  className="btn-primary !py-1.5 !px-3 text-xs"
                >
                  {savingPhone ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Phone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />

      {/* Official Academic Transcript PDF Modal */}
      <AcademicTranscriptModal
        open={transcriptModalOpen}
        onClose={() => setTranscriptModalOpen(false)}
        student={profile}
        grades={grades}
      />
    </div>
  );
}