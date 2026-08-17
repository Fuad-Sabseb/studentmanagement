import { useEffect, useState } from "react";
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
  Clock
} from "lucide-react";
import { coursesApi, gradesApi, schedulesApi, announcementsApi } from "../services/api.js";
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
  const [schedules, setSchedules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedBatchCourseId, setSelectedBatchCourseId] = useState(null);
  const [singleGradeOpen, setSingleGradeOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, schedulesRes, noticesRes] = await Promise.all([
        coursesApi.getAll().catch(() => ({ data: [] })),
        schedulesApi.getAll().catch(() => ({ data: [] })),
        announcementsApi.getAll().catch(() => ({ data: [] }))
      ]);
      setCourses(coursesRes.data || []);
      setSchedules(schedulesRes.data || []);
      setAnnouncements(noticesRes.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load instructor portal data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openBatchForCourse = (courseId) => {
    setSelectedBatchCourseId(courseId);
    setBatchModalOpen(true);
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/85 px-4 py-3.5 sm:px-6 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-glow overflow-hidden">
              <img src={logo} alt="Cohort Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="font-display text-base sm:text-lg font-semibold text-white">
                Faculty & Instructor Portal
              </h1>
              <p className="text-xs text-slate-400">
                Logged in as <strong>{currentUser?.name || currentUser?.username || "Instructor"}</strong> (Faculty)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPasswordModalOpen(true)}
              className="btn-secondary !px-2.5 text-xs flex items-center gap-1.5"
            >
              <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Password</span>
            </button>
            <button
              onClick={loadData}
              className="btn-secondary !px-2.5 text-xs"
              title="Refresh"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
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

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Curriculum Courses</p>
              <p className="font-display text-xl font-bold text-white">{courses.length}</p>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Weekly Lecture Slots</p>
              <p className="font-display text-xl font-bold text-white">{schedules.length}</p>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30">
              <Table className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Grading Mode</p>
              <p className="font-display text-sm font-semibold text-emerald-300">Spreadsheet & Batch</p>
            </div>
          </div>
        </div>

        {/* Assigned Courses Section */}
        <div className="glass-panel p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-display text-base font-semibold text-white">
                Course Gradebooks & Enrolled Rosters
              </h2>
              <p className="text-xs text-slate-400">
                Select any course to enter exam marks via in-app spreadsheet or Excel upload
              </p>
            </div>

            <div className="relative max-w-xs flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-8 !py-1.5 !text-xs"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex h-36 items-center justify-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
              Loading courses…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-3.5 py-2.5 font-semibold">Course Code & Name</th>
                    <th className="px-3.5 py-2.5 font-semibold">Department</th>
                    <th className="px-3.5 py-2.5 font-semibold">Credits</th>
                    <th className="px-3.5 py-2.5 font-semibold">Enrolled Students</th>
                    <th className="px-3.5 py-2.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCourses.map((c) => (
                    <tr key={c.id} className="transition hover:bg-slate-900/40">
                      <td className="px-3.5 py-2.5">
                        <div className="font-semibold text-white">{c.code}</div>
                        <div className="text-[11px] text-slate-400">{c.name}</div>
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-300">
                        {c.department_name || "General"}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-slate-300">
                        {c.credit_hours || 3} CH
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="pill border border-brand-500/40 bg-brand-500/10 text-brand-300 font-mono">
                          {c.enrolled_count || 0} students
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <button
                          onClick={() => openBatchForCourse(c.id)}
                          className="btn-primary !py-1 !px-2.5 text-xs inline-flex items-center gap-1.5 shadow-glow"
                        >
                          <Table className="h-3.5 w-3.5" />
                          <span>Batch Grade Sheet</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Weekly Class Timetable Section */}
        <TimetableGrid schedules={schedules} isAdmin={false} />
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

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
}
