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
  X
} from "lucide-react";
import { studentsApi, gradesApi, announcementsApi } from "../services/api.js";
import { useToast } from "./Toast.jsx";
import ChangePasswordModal from "./ChangePasswordModal.jsx";
import Footer from "./Footer.jsx";
import logo from "../images/logo.png";

export default function StudentDashboard({ currentUser, onLogout }) {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [grades, setGrades] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

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

      // 3. Fetch Announcements for students
      let announcementsList = [];
      try {
        const annRes = await announcementsApi.getAll();
        announcementsList = annRes.data ?? [];
      } catch {
        announcementsList = [];
      }

      setProfile(profileData);
      setGrades(gradesList);
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

  const { cgpa, totalCourses, gradedCount, academicStanding } = useMemo(() => {
    const validGrades = grades.filter((g) => g.gpa != null);
    let calculatedCgpa = "—";
    if (validGrades.length > 0) {
      const sumGpa = validGrades.reduce((acc, g) => acc + Number(g.gpa), 0);
      calculatedCgpa = (sumGpa / validGrades.length).toFixed(2);
    } else if (grades.length > 0 && grades[0]?.cgpa != null) {
      calculatedCgpa = Number(grades[0].cgpa).toFixed(2);
    }

    const numCgpa = Number(calculatedCgpa) || 0;
    let standing = "In Progress";
    if (numCgpa >= 3.75) standing = "High Distinction (Dean's List)";
    else if (numCgpa >= 3.5) standing = "Distinction";
    else if (numCgpa >= 3.0) standing = "Very Good";
    else if (numCgpa >= 2.0) standing = "Good Standing";
    else if (numCgpa > 0) standing = "Academic Warning";

    return {
      cgpa: calculatedCgpa,
      totalCourses: profile?.courses?.length || grades.length || 0,
      gradedCount: validGrades.length,
      academicStanding: standing
    };
  }, [grades, profile]);

  const openPhoneEdit = () => {
    setEditPhone(profile?.phone || "");
    setPhoneModalOpen(true);
  };

  const handleSavePhone = async (e) => {
    e.preventDefault();
    setSavingPhone(true);
    try {
      await studentsApi.updateMyProfile({ phone: editPhone.trim() });
      toast.success("Phone number updated!");
      setProfile((prev) => (prev ? { ...prev, phone: editPhone.trim() } : prev));
      setPhoneModalOpen(false);
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
              <img src={logo} alt="Student Management Logo" className="h-full w-full object-cover" />
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
              onClick={() => setPasswordModalOpen(true)}
              className="btn-secondary !px-2.5 text-xs flex items-center gap-1.5"
              title="Change Password"
            >
              <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Password</span>
            </button>
            <button
              onClick={() => loadData(true)}
              className="btn-secondary !px-3 text-xs"
              title="Refresh portal"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onLogout}
              className="btn-secondary !px-3 text-xs text-rose-300 hover:text-rose-200 hover:border-rose-800/50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
        {error && (
          <div className="glass-panel border border-rose-800/60 bg-rose-950/40 p-4 text-sm text-rose-300 rounded-xl">
            {error}
          </div>
        )}

        {/* Notice Board (Announcements) */}
        {announcements.length > 0 && (
          <div className="glass-panel p-5 border-amber-900/40 bg-amber-950/20">
            <div className="mb-3 flex items-center gap-2 text-amber-300 font-display font-semibold text-sm">
              <Bell className="h-4 w-4" /> Notice Board
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {announcements.slice(0, 4).map((ann) => {
                const priorityBadge =
                  ann.priority === "urgent"
                    ? "border-rose-800/60 bg-rose-950/60 text-rose-300 font-bold"
                    : ann.priority === "important"
                    ? "border-amber-800/60 bg-amber-950/60 text-amber-300"
                    : "border-slate-800 bg-slate-900 text-slate-300";

                return (
                  <div
                    key={ann.id}
                    className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-white text-xs">{ann.title}</span>
                      <span className={`pill text-[10px] ${priorityBadge}`}>{ann.priority}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed line-clamp-2">{ann.content}</p>
                    <div className="mt-2 text-[10px] text-slate-500">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="skeleton h-32 w-full rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="skeleton h-24 rounded-xl" />
              <div className="skeleton h-24 rounded-xl" />
              <div className="skeleton h-24 rounded-xl" />
            </div>
            <div className="skeleton h-64 w-full rounded-2xl" />
          </div>
        ) : profile ? (
          <>
            {/* Academic Highlights & Standing Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* CGPA Card */}
              <div className="glass-panel p-5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Cumulative GPA (CGPA)</span>
                  <Award className="h-5 w-5 text-brand-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-white tracking-tight">{cgpa}</span>
                  <span className="text-xs text-slate-400">/ 4.00</span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> {academicStanding}
                </p>
              </div>

              {/* Enrolled Courses */}
              <div className="glass-panel p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Courses Registered</span>
                  <BookOpen className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-white tracking-tight">{totalCourses}</span>
                  <span className="text-xs text-slate-400">courses</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  {profile.department_name ? `Dept: ${profile.department_name}` : "Undergraduate"}
                </p>
              </div>

              {/* Graded Courses */}
              <div className="glass-panel p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Completed Assessments</span>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-white tracking-tight">{gradedCount}</span>
                  <span className="text-xs text-slate-400">of {totalCourses} graded</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  {totalCourses - gradedCount > 0 ? `${totalCourses - gradedCount} courses in progress` : "All courses graded"}
                </p>
              </div>

              {/* Academic Performance Index */}
              <div className="glass-panel p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Academic Standing</span>
                  <TrendingUp className="h-5 w-5 text-amber-400" />
                </div>
                <div className="mt-3">
                  <span className="text-base font-semibold text-white truncate block">
                    {cgpa !== "—" && Number(cgpa) >= 2.0 ? "Satisfactory" : "Pending"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Standard 4.0 Scale</p>
              </div>
            </div>

            {/* Profile summary */}
            <div className="glass-panel p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-white">
                  Student Profile Information
                </h2>
                <button
                  onClick={openPhoneEdit}
                  className="btn-secondary !py-1 !px-2.5 text-xs flex items-center gap-1 hover:text-indigo-300"
                >
                  <Edit2 className="h-3 w-3" /> Update Phone
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5">
                  <span className="text-xs text-slate-500">Student Name</span>
                  <p className="mt-0.5 font-medium text-slate-200">{profile.name}</p>
                </div>
                <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5">
                  <span className="text-xs text-slate-500">Email Address</span>
                  <p className="mt-0.5 font-medium text-slate-200 flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" /> {profile.email}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5">
                  <span className="text-xs text-slate-500">Phone Number</span>
                  <p className="mt-0.5 font-medium text-slate-200 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" /> {profile.phone || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5">
                  <span className="text-xs text-slate-500">Department</span>
                  <p className="mt-0.5 font-medium text-slate-200">{profile.department_name || "Unassigned"}</p>
                </div>
              </div>
            </div>

            {/* Enrolled courses */}
            <div className="glass-panel p-6">
              <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-white">
                <BookOpen className="h-4 w-4 text-indigo-400" /> Enrolled Courses
              </h2>
              {(profile.courses || []).length === 0 ? (
                <p className="text-sm text-slate-500">You are not enrolled in any courses yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {profile.courses.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-xl border border-indigo-900/40 bg-indigo-950/30 p-3"
                    >
                      <div>
                        <span className="font-semibold text-indigo-300">{c.code}</span>
                        <p className="text-xs text-slate-300 truncate max-w-[200px]">{c.name}</p>
                      </div>
                      {c.letter_grade ? (
                        <span className="pill border border-emerald-800/60 bg-emerald-950/60 text-emerald-300 font-semibold">
                          {c.letter_grade} ({c.gpa})
                        </span>
                      ) : (
                        <span className="pill border border-slate-800 bg-slate-900 text-slate-400 text-[11px]">
                          In Progress
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Grades & Academic Performance Table */}
            <div className="glass-panel overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/70 p-5 gap-2">
                <div>
                  <h2 className="font-display text-base font-semibold text-white">Grades & Mark Assessment</h2>
                  <p className="text-xs text-slate-400">Detailed score components and grade points per course</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="pill border border-brand-500/40 bg-brand-500/15 text-brand-300 font-medium">
                    Cumulative CGPA: {cgpa}
                  </span>
                </div>
              </div>

              {grades.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No graded courses recorded yet. Once your instructors submit exam marks, your breakdown will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800/70 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/40">
                        <th className="px-4 py-3 font-medium">Course</th>
                        <th className="px-4 py-3 font-medium">Mid Exam</th>
                        <th className="px-4 py-3 font-medium">Quiz</th>
                        <th className="px-4 py-3 font-medium">Assignment</th>
                        <th className="px-4 py-3 font-medium">Final Exam</th>
                        <th className="px-4 py-3 font-medium">Total (100)</th>
                        <th className="px-4 py-3 font-medium">Letter Grade</th>
                        <th className="px-4 py-3 font-medium">GPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((g) => (
                        <tr key={g.id} className="border-b border-slate-800/60 transition hover:bg-slate-900/30">
                          <td className="px-4 py-3.5 font-medium text-slate-100">
                            {g.course_code} — {g.course_name}
                          </td>
                          <td className="px-4 py-3.5 text-slate-300">{g.mid_exam ?? "—"}</td>
                          <td className="px-4 py-3.5 text-slate-300">{g.quiz ?? "—"}</td>
                          <td className="px-4 py-3.5 text-slate-300">{g.assignment ?? "—"}</td>
                          <td className="px-4 py-3.5 text-slate-300">{g.final_exam ?? "—"}</td>
                          <td className="px-4 py-3.5 font-semibold text-white">{g.total_score}</td>
                          <td className="px-4 py-3.5">
                            <span className="pill border border-emerald-700/50 bg-emerald-950/60 text-emerald-300 font-semibold">
                              {g.letter_grade}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-indigo-300">{g.gpa}</td>
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
    </div>
  );
}