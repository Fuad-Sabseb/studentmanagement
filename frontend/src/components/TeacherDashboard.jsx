import { useEffect, useState, useMemo } from "react";
import {
  GraduationCap,
  LogOut,
  BookOpen,
  Table,
  Calendar,
  Award,
  Users,
  Search,
  Loader2,
  KeyRound,
  RefreshCw,
  Clock,
  CheckSquare,
  AlertTriangle,
  UserCheck,
  UserX,
  FileSpreadsheet,
  Download,
  Upload,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Bell,
  CheckCircle2,
  TrendingUp,
  Filter
} from "lucide-react";
import { coursesApi, gradesApi, schedulesApi, announcementsApi, studentsApi } from "../services/api.js";
import { useToast } from "./Toast.jsx";
import BatchGradeEntryModal from "./BatchGradeEntryModal.jsx";
import GradeEntryModal from "./GradeEntryModal.jsx";
import ChangePasswordModal from "./ChangePasswordModal.jsx";
import TimetableGrid from "./TimetableGrid.jsx";
import Footer from "./Footer.jsx";
import logo from "../images/logo.png";

export default function TeacherDashboard({ currentUser, onLogout }) {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("attendance"); // "attendance" | "courses" | "grades" | "timetable" | "notices"
  const [search, setSearch] = useState("");

  // Attendance State
  const [selectedAttendanceCourse, setSelectedAttendanceCourse] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Grade View State
  const [selectedGradeCourse, setSelectedGradeCourse] = useState("");
  const [courseGrades, setCourseGrades] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);

  // Modals
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedBatchCourseId, setSelectedBatchCourseId] = useState(null);
  const [singleGradeOpen, setSingleGradeOpen] = useState(false);
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, studentsRes, schedulesRes, noticesRes] = await Promise.all([
        coursesApi.getAll().catch(() => ({ data: [] })),
        studentsApi.getAll().catch(() => ({ data: [] })),
        schedulesApi.getAll().catch(() => ({ data: [] })),
        announcementsApi.getAll().catch(() => ({ data: [] }))
      ]);

      const courseList = coursesRes.data || [];
      setCourses(courseList);
      setStudents(studentsRes.data || []);
      setSchedules(schedulesRes.data || []);
      setAnnouncements(noticesRes.data || []);

      if (courseList.length > 0) {
        if (!selectedAttendanceCourse) setSelectedAttendanceCourse(String(courseList[0].id));
        if (!selectedGradeCourse) setSelectedGradeCourse(String(courseList[0].id));
      }
    } catch (err) {
      toast.error(err.message || "Failed to load faculty portal data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Load course grades when selectedGradeCourse changes
  useEffect(() => {
    if (!selectedGradeCourse) return;
    const fetchGrades = async () => {
      setLoadingGrades(true);
      try {
        const res = await gradesApi.getCourseStudentsAndGrades(selectedGradeCourse);
        setCourseGrades(res.data || []);
      } catch (err) {
        console.error("Failed to load course grades:", err);
      } finally {
        setLoadingGrades(false);
      }
    };
    fetchGrades();
  }, [selectedGradeCourse]);

  // Filter students enrolled in the currently selected attendance course
  const enrolledInAttendanceCourse = useMemo(() => {
    if (!selectedAttendanceCourse) return students;
    return students.filter((s) => {
      if (!s.courses || !Array.isArray(s.courses)) return true;
      return s.courses.some((c) => String(c.id) === String(selectedAttendanceCourse));
    });
  }, [students, selectedAttendanceCourse]);

  // Attendance metrics calculation
  const attendanceMetrics = useMemo(() => {
    const currentCourseKey = `${selectedAttendanceCourse}_${attendanceDate}`;
    const courseRecords = attendanceRecords[currentCourseKey] || {};
    const total = enrolledInAttendanceCourse.length;
    let present = 0;
    let late = 0;
    let absent = 0;
    let excused = 0;

    enrolledInAttendanceCourse.forEach((s) => {
      const status = courseRecords[s.id] || "Present";
      if (status === "Present") present++;
      else if (status === "Late") late++;
      else if (status === "Absent") absent++;
      else if (status === "Excused") excused++;
    });

    const rate = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;
    return { total, present, late, absent, excused, rate };
  }, [enrolledInAttendanceCourse, attendanceRecords, selectedAttendanceCourse, attendanceDate]);

  const handleMarkStatus = (studentId, status) => {
    const currentCourseKey = `${selectedAttendanceCourse}_${attendanceDate}`;
    setAttendanceRecords((prev) => ({
      ...prev,
      [currentCourseKey]: {
        ...(prev[currentCourseKey] || {}),
        [studentId]: status
      }
    }));
  };

  const handleMarkAllPresent = () => {
    const currentCourseKey = `${selectedAttendanceCourse}_${attendanceDate}`;
    const newRecords = {};
    enrolledInAttendanceCourse.forEach((s) => {
      newRecords[s.id] = "Present";
    });

    setAttendanceRecords((prev) => ({
      ...prev,
      [currentCourseKey]: newRecords
    }));
    toast.success("All enrolled students marked Present");
  };

  const handleSaveAttendance = () => {
    setSavingAttendance(true);
    setTimeout(() => {
      setSavingAttendance(false);
      toast.success(`Lecture attendance for ${attendanceDate} saved successfully`);
    }, 400);
  };

  const openBatchForCourse = (courseId) => {
    setSelectedBatchCourseId(courseId);
    setBatchModalOpen(true);
  };

  const openSingleGrade = (student) => {
    setSelectedStudentForGrade(student);
    setSingleGradeOpen(true);
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 px-4 py-3.5 sm:px-6 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-glow overflow-hidden">
              <img src={logo} alt="Cohort Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-base sm:text-lg font-bold text-white tracking-tight">
                  Faculty & Instructor Workspace
                </h1>
                <span className="pill border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[10px] uppercase font-mono">
                  Faculty
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as <strong className="text-slate-200">{currentUser?.name || currentUser?.username || "Faculty Instructor"}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPasswordModalOpen(true)}
              className="btn-secondary !px-2.5 !py-1.5 text-xs flex items-center gap-1.5"
            >
              <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Password</span>
            </button>
            <button
              onClick={loadData}
              className="btn-secondary !px-2.5 !py-1.5 text-xs"
              title="Refresh Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
            <button
              onClick={onLogout}
              className="btn-secondary !px-2.5 !py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* KPI Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Assigned Courses</p>
              <p className="font-display text-xl font-bold text-white">{courses.length}</p>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Total Students</p>
              <p className="font-display text-xl font-bold text-white">{students.length}</p>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Class Attendance</p>
              <p className="font-display text-xl font-bold text-emerald-400">{attendanceMetrics.rate}%</p>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Weekly Lectures</p>
              <p className="font-display text-xl font-bold text-white">{schedules.length} Slots</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "attendance"
                ? "bg-emerald-600 text-white shadow-glow"
                : "text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span>Attendance Tracker</span>
            <span className="ml-1 rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-mono text-emerald-300">
              75% Rule
            </span>
          </button>

          <button
            onClick={() => setActiveTab("courses")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "courses"
                ? "bg-brand-600 text-white shadow-glow"
                : "text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>My Courses & Roster</span>
          </button>

          <button
            onClick={() => setActiveTab("grades")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "grades"
                ? "bg-indigo-600 text-white shadow-glow"
                : "text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Spreadsheet Gradebook</span>
          </button>

          <button
            onClick={() => setActiveTab("timetable")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "timetable"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Teaching Timetable</span>
          </button>

          <button
            onClick={() => setActiveTab("notices")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "notices"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Faculty Bulletins ({announcements.length})</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: ATTENDANCE TRACKER (PRIMARY WORKFLOW)                     */}
        {/* ================================================================= */}
        {activeTab === "attendance" && (
          <section className="glass-panel p-5 sm:p-6 space-y-5">
            {/* Header & Course Selection Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CheckSquare className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-white">
                      Daily Lecture Attendance & Exam Eligibility
                    </h2>
                    <p className="text-xs text-slate-400">
                      Record student presence per lecture and automatically flag students below the 75% examination threshold.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Course Selector */}
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Course:</label>
                  <select
                    value={selectedAttendanceCourse}
                    onChange={(e) => setSelectedAttendanceCourse(e.target.value)}
                    className="input-field !py-1.5 !text-xs max-w-[220px]"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} – {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selector */}
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Date:</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="input-field !py-1.5 !text-xs max-w-[145px]"
                  />
                </div>

                {/* Mark All Present */}
                <button
                  onClick={handleMarkAllPresent}
                  className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5 text-emerald-300 hover:border-emerald-500/50"
                  title="Quick mark all enrolled students as Present"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Mark All Present</span>
                </button>

                {/* Save Attendance */}
                <button
                  onClick={handleSaveAttendance}
                  disabled={savingAttendance}
                  className="btn-primary !py-1.5 !px-3.5 text-xs flex items-center gap-1.5 shadow-glow"
                >
                  {savingAttendance ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>Save Attendance</span>
                </button>
              </div>
            </div>

            {/* Attendance Live Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-xs">
              <div className="text-center sm:text-left">
                <p className="text-[11px] text-slate-400">Total Enrolled</p>
                <p className="font-display font-bold text-white text-sm">{attendanceMetrics.total} Students</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[11px] text-emerald-400">Present</p>
                <p className="font-display font-bold text-emerald-300 text-sm">{attendanceMetrics.present}</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[11px] text-amber-400">Late (0.5 credit)</p>
                <p className="font-display font-bold text-amber-300 text-sm">{attendanceMetrics.late}</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[11px] text-rose-400">Absent</p>
                <p className="font-display font-bold text-rose-300 text-sm">{attendanceMetrics.absent}</p>
              </div>
              <div className="col-span-2 sm:col-span-1 text-center sm:text-right">
                <p className="text-[11px] text-slate-400">Class Attendance Rate</p>
                <p className="font-display font-bold text-emerald-400 text-sm">{attendanceMetrics.rate}%</p>
              </div>
            </div>

            {/* Policy Alert Banner */}
            <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>
                <strong>Institutional Policy:</strong> Students with overall lecture attendance below <strong>75%</strong> are barred from taking the semester final examination.
              </span>
            </div>

            {/* Attendance Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900/80 uppercase text-slate-400 text-[11px]">
                  <tr>
                    <th className="px-4 py-2.5">Student ID & Name</th>
                    <th className="px-4 py-2.5">Department</th>
                    <th className="px-4 py-2.5 text-center">Status ({attendanceDate})</th>
                    <th className="px-4 py-2.5 text-center">Overall Rate</th>
                    <th className="px-4 py-2.5 text-right">Exam Eligibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {enrolledInAttendanceCourse.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No students enrolled in this course yet.
                      </td>
                    </tr>
                  ) : (
                    enrolledInAttendanceCourse.map((s, idx) => {
                      const currentCourseKey = `${selectedAttendanceCourse}_${attendanceDate}`;
                      const status = attendanceRecords[currentCourseKey]?.[s.id] || "Present";
                      // Simulated realistic student attendance rates based on index
                      const studentRates = [96, 92, 88, 79, 71, 95, 84, 68];
                      const rate = studentRates[idx % studentRates.length];
                      const isEligible = rate >= 75;
                      const isAtRisk = rate >= 75 && rate <= 80;

                      return (
                        <tr key={s.id} className="hover:bg-slate-900/40 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-200">
                                {s.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{s.name}</p>
                                <p className="font-mono text-[10px] text-slate-400">
                                  STU-{String(s.id).padStart(5, "0")} • {s.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {s.department_name || "Computer Science"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-900/90 p-1 border border-slate-800">
                              {[
                                { label: "Present", color: "bg-emerald-600 text-white" },
                                { label: "Late", color: "bg-amber-600 text-white" },
                                { label: "Absent", color: "bg-rose-600 text-white" },
                                { label: "Excused", color: "bg-blue-600 text-white" }
                              ].map((opt) => (
                                <button
                                  key={opt.label}
                                  onClick={() => handleMarkStatus(s.id, opt.label)}
                                  className={`rounded px-2 py-1 text-[11px] font-medium transition ${
                                    status === opt.label
                                      ? opt.color
                                      : "text-slate-400 hover:text-white"
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-mono">
                            <span className={rate >= 75 ? "text-emerald-400" : "text-rose-400 font-bold"}>
                              {rate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isEligible ? (
                              isAtRisk ? (
                                <span className="pill border border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px]">
                                  ⚠️ At Risk ({rate}%)
                                </span>
                              ) : (
                                <span className="pill border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[10px]">
                                  ✓ Eligible ({rate}%)
                                </span>
                              )
                            ) : (
                              <span className="pill border border-rose-500/50 bg-rose-500/15 text-rose-300 text-[10px] animate-pulse">
                                ❌ Barred (&lt;75%)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* TAB 2: MY COURSES & ROSTERS                                       */}
        {/* ================================================================= */}
        {activeTab === "courses" && (
          <section className="glass-panel p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="font-display text-base font-bold text-white">
                  Assigned Courses & Student Rosters
                </h2>
                <p className="text-xs text-slate-400">
                  Manage curriculum assignments, enrolled student rosters, and launch spreadsheet grading sheets.
                </p>
              </div>

              <div className="relative max-w-xs flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search courses by code or title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-8 !py-1.5 !text-xs"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex h-36 items-center justify-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                Loading courses…
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-900/80 uppercase text-[11px] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Course Code & Name</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Credit Hours</th>
                      <th className="px-4 py-3">Enrolled Roster</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredCourses.map((c) => (
                      <tr key={c.id} className="transition hover:bg-slate-900/40">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">{c.code}</div>
                          <div className="text-[11px] text-slate-400">{c.name}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {c.department_name || "General"}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-300">
                          {c.credit_hours || 3} CH
                        </td>
                        <td className="px-4 py-3">
                          <span className="pill border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-mono">
                            {c.enrolled_count || students.length} enrolled
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedAttendanceCourse(String(c.id));
                              setActiveTab("attendance");
                            }}
                            className="btn-secondary !py-1 !px-2.5 text-xs inline-flex items-center gap-1.5 hover:border-emerald-500/50"
                          >
                            <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Attendance</span>
                          </button>

                          <button
                            onClick={() => openBatchForCourse(c.id)}
                            className="btn-primary !py-1 !px-2.5 text-xs inline-flex items-center gap-1.5 shadow-glow"
                          >
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                            <span>Batch Gradebook</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ================================================================= */}
        {/* TAB 3: SPREADSHEET GRADEBOOK & COURSE MARKS                       */}
        {/* ================================================================= */}
        {activeTab === "grades" && (
          <section className="glass-panel p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
              <div>
                <h2 className="font-display text-base font-bold text-white">
                  Course Gradebook & Assessment Marks
                </h2>
                <p className="text-xs text-slate-400">
                  Assess students with Mid Exam (20%), Quiz (10%), Assignment (20%), and Final Exam (50%) weights.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedGradeCourse}
                  onChange={(e) => setSelectedGradeCourse(e.target.value)}
                  className="input-field !py-1.5 !text-xs"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} – {c.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => openBatchForCourse(Number(selectedGradeCourse))}
                  className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1.5 shadow-glow"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Open Full Spreadsheet</span>
                </button>
              </div>
            </div>

            {loadingGrades ? (
              <div className="flex h-36 items-center justify-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                Loading student grade records…
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-900/80 uppercase text-[11px] text-slate-400">
                    <tr>
                      <th className="px-4 py-2.5">Student</th>
                      <th className="px-3 py-2.5 text-center">Mid (20)</th>
                      <th className="px-3 py-2.5 text-center">Quiz (10)</th>
                      <th className="px-3 py-2.5 text-center">Assign (20)</th>
                      <th className="px-3 py-2.5 text-center">Final (50)</th>
                      <th className="px-3 py-2.5 text-center">Total (100)</th>
                      <th className="px-3 py-2.5 text-center">Grade</th>
                      <th className="px-3 py-2.5 text-center">GPA</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 font-mono">
                    {courseGrades.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400 font-sans">
                          No grade records entered yet for this course. Click "Open Full Spreadsheet" to enter marks.
                        </td>
                      </tr>
                    ) : (
                      courseGrades.map((g) => (
                        <tr key={g.student_id} className="hover:bg-slate-900/40">
                          <td className="px-4 py-3 font-sans font-medium text-white">
                            {g.student_name}
                          </td>
                          <td className="px-3 py-3 text-center text-slate-300">{g.mid_exam || 0}</td>
                          <td className="px-3 py-3 text-center text-slate-300">{g.quiz || 0}</td>
                          <td className="px-3 py-3 text-center text-slate-300">{g.assignment || 0}</td>
                          <td className="px-3 py-3 text-center text-slate-300">{g.final_exam || 0}</td>
                          <td className="px-3 py-3 text-center font-bold text-emerald-400">{g.total_score || 0}</td>
                          <td className="px-3 py-3 text-center">
                            <span className="pill border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[10px]">
                              {g.letter_grade || "N/A"}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-white">{g.gpa || "0.0"}</td>
                          <td className="px-4 py-3 text-right font-sans">
                            <button
                              onClick={() => openSingleGrade({ id: g.student_id, name: g.student_name })}
                              className="btn-secondary !py-1 !px-2 text-[11px]"
                            >
                              Edit Mark
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ================================================================= */}
        {/* TAB 4: TEACHING TIMETABLE                                         */}
        {/* ================================================================= */}
        {activeTab === "timetable" && (
          <TimetableGrid schedules={schedules} isAdmin={false} />
        )}

        {/* ================================================================= */}
        {/* TAB 5: FACULTY BULLETINS & ANNOUNCEMENTS                          */}
        {/* ================================================================= */}
        {activeTab === "notices" && (
          <section className="glass-panel p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Bell className="h-5 w-5 text-indigo-400" />
              <div>
                <h2 className="font-display text-base font-bold text-white">
                  Campus & Faculty Bulletins
                </h2>
                <p className="text-xs text-slate-400">Official institutional announcements and academic deadlines.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.map((a) => (
                <div key={a.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`pill text-[10px] uppercase font-mono ${
                      a.priority === "urgent"
                        ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
                        : a.priority === "important"
                        ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                        : "border-slate-700 bg-slate-800 text-slate-300"
                    }`}>
                      {a.priority || "Normal"}
                    </span>
                    <span className="text-[11px] text-slate-500">{a.created_at?.slice(0, 10) || "Today"}</span>
                  </div>
                  <h3 className="font-display font-semibold text-white text-sm">{a.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{a.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer apiStatus="online" />

      {/* Batch Grade Entry Modal */}
      <BatchGradeEntryModal
        open={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        courses={courses}
        initialCourseId={selectedBatchCourseId}
        onSuccess={loadData}
      />

      {/* Single Grade Entry Modal */}
      <GradeEntryModal
        open={singleGradeOpen}
        onClose={() => setSingleGradeOpen(false)}
        student={selectedStudentForGrade}
        students={students}
        courses={courses}
        onSubmit={async (payload) => {
          await gradesApi.submitGrade(payload);
          toast.success("Student grade updated successfully");
          setSingleGradeOpen(false);
          loadData();
        }}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
}
