import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  Users,
  ShieldCheck,
  ArrowRight,
  Search,
  Bell,
  Sparkles,
  Library,
  Clock,
  FileText,
  CheckCircle2,
  Filter,
  BarChart3,
  ExternalLink,
  ChevronRight,
  BookMarked,
  CheckSquare,
  AlertTriangle
} from "lucide-react";
import logo from "../images/logo.png";
import disImage from "../images/dis.png";
import { announcementsApi, coursesApi, departmentsApi, studentsApi } from "../services/api.js";

export default function LandingPage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);

  // Search Filter state
  const [filterDept, setFilterDept] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterYear, setFilterYear] = useState("2025/2026");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    announcementsApi
      .getAll()
      .then((res) => setAnnouncements(res.data || []))
      .catch(() => {});
    coursesApi
      .getAll()
      .then((res) => setCourses(res.data || []))
      .catch(() => {});
    departmentsApi
      .getAll()
      .then((res) => setDepartments(res.data || []))
      .catch(() => {});
    studentsApi
      .getCount()
      .then((res) => setStudentsCount(res.data?.total || 0))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchResults({
      department: filterDept === "all" ? "All Departments" : filterDept,
      program: filterProgram === "all" ? "All Degree Programs" : filterProgram,
      year: filterYear,
      status: filterStatus === "all" ? "Active" : filterStatus,
      matchedCount: courses.length > 0 ? courses.length : 14
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-crimson-500/40">
      
      {/* ==================================================================== */}
      {/* 1. TOP NAVIGATION BAR                                               */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 overflow-hidden rounded-xl border border-crimson-500/40 bg-gradient-to-br from-crimson-900 to-slate-900 shadow-glow-crimson transition group-hover:scale-105">
              <img src={logo} alt="University" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-base sm:text-lg font-bold tracking-tight text-white">
                  Student management
                </span>
                <span className="pill border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[10px]">
                  Institutional Portal
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold hidden sm:block">
                smart management
              </p>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-300">
            <a href="#hero" className="hover:text-white transition">Home</a>
            <Link to="/login" className="hover:text-white transition">Dashboard</Link>
            <a href="#student-directory" className="hover:text-white transition">Students</a>
            <a href="#course-management" className="hover:text-white transition">Courses</a>
            <a href="#attendance-tracking" className="hover:text-white transition">Attendance</a>
            <a href="#grade-management" className="hover:text-white transition">Grades</a>
            <a href="#library-services" className="hover:text-white transition">Library</a>
            <a href="#events-notices" className="hover:text-white transition">Events</a>
          </nav>

          {/* Direct Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/login"
              className="btn-secondary !py-1.5 !px-3 text-xs hidden sm:inline-flex items-center gap-1.5"
            >
              <span>Explore Dashboard</span>
            </Link>
            <Link
              to="/login"
              className="btn-crimson !py-2 !px-4 text-xs flex items-center gap-2 shadow-glow-crimson"
            >
              <span>Portal Login</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1">

        {/* ==================================================================== */}
        {/* 2. HERO SECTION (Curved Banner with Campus Background Image)         */}
        {/* ==================================================================== */}
        <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-crimson-950/90 via-slate-950 to-slate-950 pt-16 pb-24 px-4 sm:px-6 curved-hero border-b border-crimson-900/40">
          {/* Background Ambient Glow & Mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(225,29,72,0.3),rgba(255,255,255,0))]" />
          
          <div className="relative mx-auto max-w-5xl text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-crimson-500/40 bg-crimson-950/70 px-4 py-1.5 text-xs text-crimson-200 backdrop-blur-md shadow-lg"
            >
              <Sparkles className="h-3.5 w-3.5 text-crimson-400" />
              <span>Unified Academic ERP • Term 2025/2026 Active</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
            >
              Welcome to the <br />
              <span className="bg-gradient-to-r from-crimson-400 via-rose-300 to-indigo-300 bg-clip-text text-transparent">
                Student Management Portal
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto max-w-3xl text-sm sm:text-base text-slate-300 leading-relaxed"
            >
              Manage students, teachers, attendance, grades, departments, courses, and academic activities from one intelligent, university-grade platform.
            </motion.p>

            {/* Two Modern Buttons Requested in Specification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3.5 pt-3"
            >
              <Link to="/login" className="btn-crimson !py-3.5 !px-7 text-sm font-semibold flex items-center gap-2.5 shadow-xl shadow-crimson-900/30">
                <BarChart3 className="h-4.5 w-4.5" />
                <span>Explore Dashboard</span>
              </Link>
              <Link to="/login" className="btn-secondary !py-3.5 !px-7 text-sm font-semibold flex items-center gap-2.5 backdrop-blur-xl">
                <GraduationCap className="h-4.5 w-4.5 text-brand-300" />
                <span>Register Student</span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 3. SEARCH & FILTER SECTION (Directly Below Hero)                     */}
        {/* ==================================================================== */}
        <section className="relative -mt-10 mx-auto max-w-6xl px-4 sm:px-6 z-20">
          <div className="glass-panel p-5 sm:p-6 border-slate-700/80 bg-slate-900/90 shadow-2xl backdrop-blur-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-crimson-400" />
                <h3 className="font-display text-sm font-semibold text-white">
                  Academic Directory & Program Search
                </h3>
              </div>
              <span className="text-xs text-slate-400">Search student records & curriculum</span>
            </div>

            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
              {/* Department */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="input-field !py-2 !text-xs"
                >
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                </select>
              </div>

              {/* Program */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Program
                </label>
                <select
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  className="input-field !py-2 !text-xs"
                >
                  <option value="all">All Programs</option>
                  <option value="B.Sc. Software Engineering">B.Sc. Software Engineering</option>
                  <option value="B.Sc. Computer Science">B.Sc. Computer Science</option>
                  <option value="B.Eng. Robotics">B.Eng. Robotics</option>
                  <option value="B.B.A. Finance">B.B.A. Finance</option>
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Academic Year
                </label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="input-field !py-2 !text-xs"
                >
                  <option value="2025/2026">2025/2026 (Current)</option>
                  <option value="2024/2025">2024/2025</option>
                  <option value="2023/2024">2023/2024</option>
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Semester
                </label>
                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="input-field !py-2 !text-xs"
                >
                  <option value="all">All Semesters</option>
                  <option value="Year 1 Sem I">Year 1 Sem I</option>
                  <option value="Year 1 Sem II">Year 1 Sem II</option>
                  <option value="Year 2 Sem I">Year 2 Sem I</option>
                  <option value="Year 2 Sem II">Year 2 Sem II</option>
                </select>
              </div>

              {/* Student Status */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Student Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-field !py-2 !text-xs"
                >
                  <option value="all">All Statuses</option>
                  <option value="Enrolled">Enrolled / Active</option>
                  <option value="Dean's List">Dean's List (GPA ≥ 3.75)</option>
                  <option value="Good Standing">Good Standing</option>
                </select>
              </div>

              {/* Search Button */}
              <div>
                <button
                  type="submit"
                  className="btn-crimson w-full !py-2.5 text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* Quick Live Filter Confirmation */}
            {searchResults && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs flex items-center justify-between text-emerald-200"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>
                    Showing directory records for <strong>{searchResults.department}</strong> ({searchResults.program}, {searchResults.year}).
                  </span>
                </div>
                <Link to="/login" className="text-white underline hover:text-emerald-300 font-semibold">
                  Open Roster View →
                </Link>
              </motion.div>
            )}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 4. SIX ASYMMETRICAL EDITORIAL FEATURE SECTIONS (Image 2 Style)       */}
        {/* ==================================================================== */}

        {/* ---------------- SECTION 1: Student Directory ---------------- */}
        <section id="student-directory" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Image Side with Offset White Border Frame (Image 2 style) */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* White / Crimson Accent Frame */}
                <div className="absolute -inset-3 rounded-3xl border-2 border-crimson-500/30 bg-crimson-950/20 transform -rotate-1 pointer-events-none" />
                <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-900 shadow-2xl aspect-[4/3] group">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
                    alt="University Students"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-white font-medium">
                      <span>Active Student Body</span>
                      <span className="text-emerald-400 font-mono font-bold">{studentsCount || 240}+ Records</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Editorial Content Side */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-crimson-500/40 bg-crimson-950/60 px-3.5 py-1 text-xs text-crimson-300">
                <Users className="h-3.5 w-3.5" />
                <span>Student Management Module</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                Comprehensive <br />
                <span className="text-crimson-400">Student Directory & Profiles</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Manage all registered students, search records instantly, edit profiles, assign departments, monitor enrollment, and access complete academic information in real time.
              </p>

              <div className="space-y-3 pt-2 text-xs text-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                  <span>Instant student profile lookup & auto-generated credentials</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                  <span>Multi-format export: CSV, Excel spreadsheet, and print-ready rosters</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                  <span>Soft-delete protection preserving complete academic audit histories</span>
                </div>
              </div>

              <div className="pt-4">
                <Link to="/login" className="btn-crimson !py-3 !px-6 text-xs font-semibold inline-flex items-center gap-2">
                  <span>Explore Student Roster</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- SECTION 2: Course Management ---------------- */}
        <section id="course-management" className="border-t border-slate-800/80 bg-slate-900/30 py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Content Side */}
              <div className="lg:col-span-6 space-y-5 order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-950/60 px-3.5 py-1 text-xs text-indigo-300">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Curriculum & Academics</span>
                </div>
                <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  Intelligent <br />
                  <span className="text-indigo-400">Course Management & Credit Weights</span>
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Create courses, assign instructors, manage semesters, prerequisites, credit hours (1–6 credits), weekly schedules, and learning resources across every academic department.
                </p>

                <div className="space-y-3 pt-2 text-xs text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">✓</div>
                    <span>Accredited credit-hour weights mapped to semester terms</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">✓</div>
                    <span>Course-specific enrolled student rosters with batch grading access</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link to="/login" className="btn-primary !py-3 !px-6 text-xs font-semibold inline-flex items-center gap-2">
                    <span>Manage Curriculum</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Image Side with Framing Frame (Image 2 style) */}
              <div className="lg:col-span-6 relative order-1 lg:order-2">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  <div className="absolute -inset-3 rounded-3xl border-2 border-indigo-500/30 bg-indigo-950/20 transform rotate-1 pointer-events-none" />
                  <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-900 shadow-2xl aspect-[4/3] group">
                    <img
                      src="https://wongaaa.co.za/wp-content/uploads/2023/02/Credit-Management-1.jpg"
                      alt="Academic Classroom Lecture"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs">
                      <div className="flex items-center justify-between text-white font-medium">
                        <span>Curriculum Breadth</span>
                        <span className="text-indigo-400 font-mono font-bold">100% Accredited</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- SECTION 3: Attendance Tracking ---------------- */}
        <section id="attendance-tracking" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Image Side */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-3 rounded-3xl border-2 border-emerald-500/30 bg-emerald-950/20 transform -rotate-1 pointer-events-none" />
                <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-900 shadow-2xl aspect-[4/3] group">
                  <img
                    src="https://www.lystloc.com/blog/wp-content/uploads/2022/11/bloger.webp"
                    alt="Classroom Attendance & Lecture"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-white font-medium">
                      <span>Overall Institutional Attendance</span>
                      <span className="text-emerald-400 font-mono font-bold">94.2% Attendance Rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-3.5 py-1 text-xs text-emerald-300">
                <CheckSquare className="h-3.5 w-3.5" />
                <span>Attendance Module</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                Real-Time <br />
                <span className="text-emerald-400">Attendance Tracking & Exam Alerts</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Track daily lecture attendance with real-time analytics, generate monthly participation heatmaps, and automatically warn students whose attendance drops below the 75% final exam eligibility threshold.
              </p>

              <div className="space-y-3 pt-2 text-xs text-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                  <span>Instant status marking: Present, Absent, Late, or Excused</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">⚠️</div>
                  <span>Automated 75% attendance threshold warning for exam eligibility</span>
                </div>
              </div>

              <div className="pt-4">
                <Link to="/login" className="btn-secondary !py-3 !px-6 text-xs font-semibold inline-flex items-center gap-2">
                  <span>View Attendance Analytics</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- SECTION 4: Grade Management ---------------- */}
        <section id="grade-management" className="border-t border-slate-800/80 bg-slate-900/30 py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Content Side */}
              <div className="lg:col-span-6 space-y-5 order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-crimson-500/40 bg-crimson-950/60 px-3.5 py-1 text-xs text-crimson-300">
                  <Award className="h-3.5 w-3.5" />
                  <span>Assessment & Transcripts</span>
                </div>
                <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  Automated <br />
                  <span className="text-crimson-400">Gradebook & Verifiable PDF Transcripts</span>
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Enter grades via in-browser spreadsheets or Excel/CSV uploads, calculate credit-weighted Cumulative GPAs (CGPA) automatically, and generate authenticated official PDF academic transcripts.
                </p>

                <div className="space-y-3 pt-2 text-xs text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-crimson-500/20 text-crimson-400 flex items-center justify-center">✓</div>
                    <span>Multi-component scoring: Mid (20), Quiz (10), Assign (20), Final (50)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-crimson-500/20 text-crimson-400 flex items-center justify-center">✓</div>
                    <span>One-click downloadable & printable authenticated PDF transcripts</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link to="/login" className="btn-crimson !py-3 !px-6 text-xs font-semibold inline-flex items-center gap-2">
                    <span>Open Gradebook</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Image Side with Framing Frame (Image 2 style) */}
              <div className="lg:col-span-6 relative order-1 lg:order-2">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  <div className="absolute -inset-3 rounded-3xl border-2 border-crimson-500/30 bg-crimson-950/20 transform rotate-1 pointer-events-none" />
                  <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-900 shadow-2xl aspect-[4/3] group">
                    <img
                      src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80"
                      alt="Student Studying and Exams"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs">
                      <div className="flex items-center justify-between text-white font-medium">
                        <span>CGPA Calculation Engine</span>
                        <span className="text-crimson-400 font-mono font-bold">Credit-Weighted 4.00 Scale</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- SECTION 5: Library Services ---------------- */}
        <section id="library-services" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Image Side */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-3 rounded-3xl border-2 border-amber-500/30 bg-amber-950/20 transform -rotate-1 pointer-events-none" />
                <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-900 shadow-2xl aspect-[4/3] group">
                  <img
                      src="https://images.imagerenderer.com/images/artworkimages/mediumlarge/2/3-old-books-in-a-library-luoman.jpg"
                      alt="Campus Events and Seminars"

                    
                    alt="University Library and Digital Resources"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-white font-medium">
                      <span>Digital & Physical Catalog</span>
                      <span className="text-amber-300 font-mono font-bold">14,200+ Books & Journals</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/60 px-3.5 py-1 text-xs text-amber-300">
                <Library className="h-3.5 w-3.5" />
                <span>Library Resources</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                Digital & Physical <br />
                <span className="text-amber-400">Library Services & Catalogs</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Manage academic textbook catalogs, issue and return records, automated overdue notifications, research journals, and digital e-learning repositories.
              </p>

              <div className="space-y-3 pt-2 text-xs text-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">✓</div>
                  <span>Instant ISBN & title search across college departments</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">✓</div>
                  <span>Automated circulation records with return due-date reminders</span>
                </div>
              </div>

              <div className="pt-4">
                <Link to="/login" className="btn-secondary !py-3 !px-6 text-xs font-semibold inline-flex items-center gap-2">
                  <span>Browse Library Catalog</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- SECTION 6: Events & Announcements ---------------- */}
        <section id="events-notices" className="border-t border-slate-800/80 bg-slate-900/30 py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Content Side */}
              <div className="lg:col-span-6 space-y-5 order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-950/60 px-3.5 py-1 text-xs text-rose-300">
                  <Bell className="h-3.5 w-3.5" />
                  <span>Campus Bulletin</span>
                </div>
                <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  Campus Events, <br />
                  <span className="text-rose-400">Examinations & Priority Notices</span>
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Keep students and faculty informed about upcoming campus seminars, examination schedules, institutional holidays, and emergency broadcasts with priority audience tagging.
                </p>

                <div className="space-y-3 pt-2 text-xs text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">✓</div>
                    <span>Priority tags: Urgent Alerts, Important Notices, Normal Updates</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">✓</div>
                    <span>Audience targeting for all students, specific departments, or faculty</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link to="/login" className="btn-crimson !py-3 !px-6 text-xs font-semibold inline-flex items-center gap-2">
                    <span>View All Notices</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Image Side with Framing Frame (Image 2 style) */}
              <div className="lg:col-span-6 relative order-1 lg:order-2">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  <div className="absolute -inset-3 rounded-3xl border-2 border-rose-500/30 bg-rose-950/20 transform rotate-1 pointer-events-none" />
                  <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-900 shadow-2xl aspect-[4/3] group">
                    <img
                      src="./images/dis.png"
                      alt="Campus Events and Seminars"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs">
                      <div className="flex items-center justify-between text-white font-medium">
                        <span>Campus Life & Bulletin</span>
                        <span className="text-rose-400 font-mono font-bold">Live Announcements</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ==================================================================== */}
      {/* 5. INSTITUTIONAL FOOTER (Matching Reference Image 2 Style)           */}
      {/* ==================================================================== */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-6 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-10">
          <div>
            <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-3">
              About
            </h5>
            <ul className="space-y-2">
              <li><a href="#hero" className="hover:text-slate-300">University Overview</a></li>
              <li><a href="#hero" className="hover:text-slate-300">Academic Leadership</a></li>
              <li><a href="#hero" className="hover:text-slate-300">Accreditation</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-3">
              Departments
            </h5>
            <ul className="space-y-2">
              <li><a href="#course-management" className="hover:text-slate-300">Computer Science</a></li>
              <li><a href="#course-management" className="hover:text-slate-300">Engineering & Robotics</a></li>
              <li><a href="#course-management" className="hover:text-slate-300">Business Administration</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-3">
              Admissions
            </h5>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-slate-300">Student Enrollment</Link></li>
              <li><Link to="/login" className="hover:text-slate-300">Academic Calendar</Link></li>
              <li><Link to="/login" className="hover:text-slate-300">Credit Transfer</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-3">
              Student Resources
            </h5>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-slate-300">Student Academic Hub</Link></li>
              <li><a href="#library-services" className="hover:text-slate-300">Digital Library</a></li>
              <li><a href="#grade-management" className="hover:text-slate-300">Transcripts & GPAs</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-3">
              Support & Contact
            </h5>
            <ul className="space-y-2">
              <li><a href="#hero" className="hover:text-slate-300">IT Helpdesk</a></li>
              <li><a href="#hero" className="hover:text-slate-300">Registrar Office</a></li>
              <li><a href="#hero" className="hover:text-slate-300">Campus Security</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-3">
              Quick Portals
            </h5>
            <ul className="space-y-2 font-medium text-slate-400">
              <li><Link to="/login" className="text-brand-400 hover:text-brand-300">Student Login</Link></li>
              <li><Link to="/login" className="text-crimson-400 hover:text-crimson-300">Faculty Portal</Link></li>
              <li><Link to="/login" className="text-emerald-400 hover:text-emerald-300">Admin Console</Link></li>
            </ul>
          </div>
        </div>

        <div className="mx-auto max-w-7xl pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 University Student Management System.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-500">Privacy Policy</span>
            <span className="text-slate-500">Terms of Service</span>
            <Link to="/login" className="text-crimson-400 hover:text-crimson-300 font-medium">Sign In to SIS</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
