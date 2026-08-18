import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Layers,
  Users,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Bell,
  Table,
  KeyRound,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Calendar,
  X,
  UserCheck,
  CheckSquare,
  Library,
  BarChart3,
  Award,
  Download,
  Printer,
  Search,
  Clock,
  ShieldCheck,
  DollarSign,
  BookMarked
} from "lucide-react";

import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import AnalyticsCard from "./AnalyticsCard.jsx";
import EnrollmentChart from "./EnrollmentChart.jsx";
import StudentTable from "./StudentTable.jsx";
import StudentModal from "./StudentModal.jsx";
import UpdateStudentModal from "./UpdateStudentModal.jsx";
import CourseAssignModal from "./CourseAssignModal.jsx";
import ConfirmDeleteModal from "./ConfirmDeleteModal.jsx";
import GradeEntryModal from "./GradeEntryModal.jsx";
import DepartmentModal from "./DepartmentModal.jsx";
import CourseModal from "./CourseModal.jsx";
import AnnouncementModal from "./AnnouncementModal.jsx";
import BatchGradeEntryModal from "./BatchGradeEntryModal.jsx";
import ChangePasswordModal from "./ChangePasswordModal.jsx";
import SemesterModal from "./SemesterModal.jsx";
import ScheduleModal from "./ScheduleModal.jsx";
import TimetableGrid from "./TimetableGrid.jsx";
import AcademicTranscriptModal from "./AcademicTranscriptModal.jsx";
import { useToast } from "./Toast.jsx";
import {
  studentsApi,
  departmentsApi,
  coursesApi,
  gradesApi,
  announcementsApi,
  semestersApi,
  schedulesApi
} from "../services/api.js";

export default function AdminDashboard({ currentUser, onLogout }) {
  const toast = useToast();

  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeCount, setActiveCount] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");

  // Attendance demo state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // Library search state
  const [libraryQuery, setLibraryQuery] = useState("");

  // Student modals
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [savingStudent, setSavingStudent] = useState(false);

  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [assigningCourseId, setAssigningCourseId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Single grade entry
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [gradeTarget, setGradeTarget] = useState(null);
  const [savingGrade, setSavingGrade] = useState(false);

  // Batch grade entry
  const [batchGradeModalOpen, setBatchGradeModalOpen] = useState(false);
  const [batchCourseId, setBatchCourseId] = useState(null);

  // Department modal
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [savingDept, setSavingDept] = useState(false);

  // Course modal
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [savingCourse, setSavingCourse] = useState(false);

  // Announcement modal
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  // Semester modal
  const [semesterModalOpen, setSemesterModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);

  // Schedule modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Transcript modal
  const [transcriptModalOpen, setTranscriptModalOpen] = useState(false);
  const [transcriptStudent, setTranscriptStudent] = useState(null);

  // Change password modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Generated credentials popup
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  const [activeSection, setActiveSection] = useState("dashboard");
  const sectionRefs = {
    dashboard: useRef(null),
    students: useRef(null),
    teachers: useRef(null),
    courses: useRef(null),
    departments: useRef(null),
    attendance: useRef(null),
    grades: useRef(null),
    library: useRef(null),
    events: useRef(null),
    reports: useRef(null),
    announcements: useRef(null),
    semesters: useRef(null),
    schedules: useRef(null)
  };

  const handleNavigate = (id) => {
    setActiveSection(id);
    const targetRef = sectionRefs[id] || sectionRefs[id === "events" ? "announcements" : "dashboard"];
    targetRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const loadAll = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [studentsRes, departmentsRes, coursesRes, countRes, announcementsRes, semestersRes, schedulesRes] = await Promise.all([
        studentsApi.getAll(),
        departmentsApi.getAll(),
        coursesApi.getAll(),
        studentsApi.getCount(),
        announcementsApi.getAll().catch(() => ({ data: [] })),
        semestersApi.getAll().catch(() => ({ data: [] })),
        schedulesApi.getAll().catch(() => ({ data: [] }))
      ]);

      setStudents(studentsRes.data ?? []);
      setDepartments(departmentsRes.data ?? []);
      setCourses(coursesRes.data ?? []);
      setAnnouncements(announcementsRes.data ?? []);
      setSemesters(semestersRes.data ?? []);
      setSchedules(schedulesRes.data ?? []);
      setActiveCount(countRes.data?.total ?? studentsRes.data?.length ?? 0);
      setApiStatus("online");
    } catch (err) {
      setError(err.message ?? "Something went wrong while loading data.");
      setApiStatus("offline");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleRefresh = () => loadAll({ silent: true });

  /* ---------------- Handlers ---------------- */
  const openAddStudent = () => {
    setEditingStudent(null);
    setStudentModalOpen(true);
  };

  const openEditStudent = (student) => {
    setEditingStudent(student);
    setStudentModalOpen(true);
  };

  const closeStudentModal = () => {
    setStudentModalOpen(false);
    setEditingStudent(null);
  };

  const handleSubmitStudent = async (payload) => {
    setSavingStudent(true);
    try {
      if (editingStudent) {
        await studentsApi.update(editingStudent.id, payload);
        toast.success(`Updated ${payload.name}`);
        closeStudentModal();
        loadAll({ silent: true });
      } else {
        const res = await studentsApi.create(payload);
        closeStudentModal();
        loadAll({ silent: true });

        if (res?.credentials) {
          setCreatedCredentials({
            name: payload.name,
            username: res.credentials.username,
            password: res.credentials.defaultPassword
          });
        } else {
          toast.success(`Registered ${payload.name}`);
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to save student");
    } finally {
      setSavingStudent(false);
    }
  };

  const openUpdateStudentFromHeader = () => {
    setUpdateTarget(null);
    setUpdateModalOpen(true);
  };

  const handleUpdateStudentSubmit = async (studentId, payload) => {
    setSavingStudent(true);
    try {
      await studentsApi.update(studentId, payload);
      toast.success("Student updated successfully");
      setUpdateModalOpen(false);
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Failed to update student");
    } finally {
      setSavingStudent(false);
    }
  };

  const openAssignModal = (student) => {
    setAssignTarget(student);
    setAssignModalOpen(true);
  };

  const handleAssignCourse = async (courseId) => {
    if (!assignTarget) return;
    setAssigningCourseId(courseId);
    try {
      await studentsApi.assignCourse(assignTarget.id, courseId);
      toast.success("Course assigned successfully");
      setAssignModalOpen(false);
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Failed to assign course");
    } finally {
      setAssigningCourseId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await studentsApi.delete(deleteTarget.id);
      toast.success(`Removed ${deleteTarget.name}`);
      setDeleteTarget(null);
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  const openSubmitGradeFromHeader = (targetStudent = null) => {
    setGradeTarget(targetStudent);
    setGradeModalOpen(true);
  };

  const handleSubmitGrade = async (payload) => {
    setSavingGrade(true);
    try {
      await gradesApi.submitGrade(payload);
      toast.success("Grades recorded and CGPA updated!");
      setGradeModalOpen(false);
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Failed to record grade");
    } finally {
      setSavingGrade(false);
    }
  };

  const openBatchGrades = (courseId = null) => {
    setBatchCourseId(courseId);
    setBatchGradeModalOpen(true);
  };

  const openAddDept = () => {
    setEditingDept(null);
    setDeptModalOpen(true);
  };

  const openEditDept = (dept) => {
    setEditingDept(dept);
    setDeptModalOpen(true);
  };

  const handleSubmitDept = async (payload) => {
    setSavingDept(true);
    try {
      if (editingDept) {
        await departmentsApi.update(editingDept.id, payload);
        toast.success(`Department updated`);
      } else {
        await departmentsApi.create(payload);
        toast.success(`Department "${payload.name}" created`);
      }
      setDeptModalOpen(false);
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Failed to save department");
    } finally {
      setSavingDept(false);
    }
  };

  const handleDeleteDept = async (dept) => {
    if (!confirm(`Are you sure you want to delete ${dept.name}?`)) return;
    try {
      await departmentsApi.delete(dept.id);
      toast.success("Department deleted");
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Failed to delete department");
    }
  };

  const openAddCourse = () => {
    setEditingCourse(null);
    setCourseModalOpen(true);
  };

  const openEditCourse = (course) => {
    setEditingCourse(course);
    setCourseModalOpen(true);
  };

  const handleSubmitCourse = async (payload) => {
    setSavingCourse(true);
    try {
      if (editingCourse) {
        await coursesApi.update(editingCourse.id, payload);
        toast.success("Course updated");
      } else {
        await coursesApi.create(payload);
        toast.success(`Course "${payload.code}" created`);
      }
      setCourseModalOpen(false);
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Failed to save course");
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    if (!confirm(`Delete ${course.name} (${course.code})?`)) return;
    try {
      await coursesApi.delete(course.id);
      toast.success("Course deleted");
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Failed to delete course");
    }
  };

  const openAddAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnouncementModalOpen(true);
  };

  const openEditAnnouncement = (ann) => {
    setEditingAnnouncement(ann);
    setAnnouncementModalOpen(true);
  };

  const handleSubmitAnnouncement = async (payload) => {
    setSavingAnnouncement(true);
    try {
      if (editingAnnouncement) {
        await announcementsApi.update(editingAnnouncement.id, payload);
        toast.success("Announcement updated");
      } else {
        await announcementsApi.create(payload);
        toast.success("Announcement broadcasted");
      }
      setAnnouncementModalOpen(false);
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Failed to save announcement");
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (ann) => {
    if (!confirm(`Delete announcement "${ann.title}"?`)) return;
    try {
      await announcementsApi.delete(ann.id);
      toast.success("Announcement deleted");
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Failed to delete announcement");
    }
  };

  const copyCredentials = async () => {
    if (!createdCredentials) return;
    const text = `Student Portal Login\nUsername: ${createdCredentials.username}\nDefault Password: ${createdCredentials.password}\nLogin URL: ${window.location.origin}/login`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Credentials copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const totalCoursesEnrolled = useMemo(() => {
    return students.reduce((acc, s) => acc + (s.courses?.length || 0), 0);
  }, [students]);

  // Demo Faculty List
  const facultyMembers = [
    { name: "Dr. Alexander Wright", dept: "Computer Science", courses: "CS201, CS304", email: "a.wright@Student managent.edu", status: "Active" },
    { name: "Prof. Sarah Davis", dept: "Electrical Engineering", courses: "EE201, EE202", email: "s.davis@studentmanagement.edu", status: "Active" },
    { name: "Dr. Michael Chang", dept: "Business Administration", courses: "BA101, BA205", email: "m.chang@studentmanagement.edu", status: "Active" },
    { name: "Dr. Elena Rostova", dept: "Mathematics", courses: "MATH101, MATH202", email: "e.rostova@studentmanagement.edu", status: "Active" }
  ];

  // Demo Library Catalog
  const libraryCatalog = [
    { title: "Introduction to Algorithms (4th Edition)", author: "Cormen, Leiserson", dept: "Computer Science", isbn: "978-0262046305", status: "Available", shelf: "CS-104" },
    { title: "Clean Code: A Handbook of Agile Craftsmanship", author: "Robert C. Martin", dept: "Software Engineering", isbn: "978-0132350884", status: "Checked Out", shelf: "SE-202" },
    { title: "Engineering Circuit Analysis", author: "William H. Hayt", dept: "Electrical Engineering", isbn: "978-0073545516", status: "Available", shelf: "EE-305" },
    { title: "Corporate Finance: Theory and Practice", author: "Aswath Damodaran", dept: "Business", isbn: "978-0470683705", status: "Available", shelf: "BA-110" }
  ];

  const filteredLibrary = libraryCatalog.filter((b) =>
    b.title.toLowerCase().includes(libraryQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(libraryQuery.toLowerCase()) ||
    b.dept.toLowerCase().includes(libraryQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-crimson-500/40">
      
      {/* Top Header */}
      <Header
        onAddStudent={openAddStudent}
        onUpdateStudent={openUpdateStudentFromHeader}
        onSubmitGrade={() => openSubmitGradeFromHeader()}
        onBatchGrades={() => openBatchGrades()}
        onAnnouncements={openAddAnnouncement}
        onChangePassword={() => setPasswordModalOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        apiStatus={apiStatus}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        currentStudent={currentUser}
        onLogout={onLogout}
      />

      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-10">

        {/* ==================================================================== */}
        {/* 1. DASHBOARD OVERVIEW: SUMMARY KPI CARDS                             */}
        {/* ==================================================================== */}
        <section ref={sectionRefs.dashboard} className="scroll-mt-24 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Administrator Overview</h2>
              <p className="text-xs text-slate-400">Institutional metrics, enrollment statistics, and real-time operations.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="pill border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs">
                Term 2025/2026 • Active
              </span>
              <button
                onClick={() => window.print()}
                className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Overview</span>
              </button>
            </div>
          </div>

          {/* 8 Summary Cards Specified in User Prompt */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticsCard
              label="Total Students"
              value={activeCount ?? "—"}
              icon={Users}
              accent="crimson"
              loading={loading}
            />
            <AnalyticsCard
              label="Total Faculty / Teachers"
              value="18 Active"
              icon={UserCheck}
              accent="brand"
              loading={loading}
            />
            <AnalyticsCard
              label="Active Courses"
              value={courses.length}
              icon={BookOpen}
              accent="emerald"
              loading={loading}
            />
            <AnalyticsCard
              label="Departments"
              value={departments.length}
              icon={Layers}
              accent="indigo"
              loading={loading}
            />
            <AnalyticsCard
              label="Attendance Rate"
              value="94.2%"
              icon={CheckSquare}
              accent="emerald"
              loading={loading}
            />
            <AnalyticsCard
              label="Pending Fees"
              value="$0.00 (Cleared)"
              icon={DollarSign}
              accent="brand"
              loading={loading}
            />
            <AnalyticsCard
              label="Library Resources"
              value="14,200 Titles"
              icon={Library}
              accent="amber"
              loading={loading}
            />
            <AnalyticsCard
              label="Upcoming Events"
              value={announcements.length || 3}
              icon={Bell}
              accent="rose"
              loading={loading}
            />
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 2. NOTICE BOARD & CAMPUS BULLETIN                                   */}
        {/* ==================================================================== */}
        <section ref={sectionRefs.announcements} className="glass-panel scroll-mt-24 p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">
                <Bell className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-white">
                  Campus Events & Notice Board
                </h3>
                <p className="text-xs text-slate-400">
                  Priority broadcasts and examination schedules
                </p>
              </div>
            </div>
            <button onClick={openAddAnnouncement} className="btn-crimson !py-1.5 !text-xs">
              <Plus className="h-3.5 w-3.5" />
              Post Announcement
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              <div className="skeleton h-14 w-full rounded-xl" />
              <div className="skeleton h-14 w-full rounded-xl" />
            </div>
          ) : announcements.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-500">
              No active announcements. Click &ldquo;Post Announcement&rdquo; to publish a notice.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {announcements.map((ann) => {
                const priorityBadge =
                  ann.priority === "urgent"
                    ? "border-rose-800/60 bg-rose-950/60 text-rose-300"
                    : ann.priority === "important"
                    ? "border-amber-800/60 bg-amber-950/60 text-amber-300"
                    : "border-slate-800 bg-slate-900 text-slate-300";

                return (
                  <div
                    key={ann.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-800/90 bg-slate-900/50 p-4 transition hover:border-slate-700"
                  >
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className={`pill text-[10px] font-semibold uppercase ${priorityBadge}`}>
                          {ann.priority}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditAnnouncement(ann)}
                            className="rounded p-1 text-slate-500 hover:text-slate-300"
                            title="Edit Notice"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(ann)}
                            className="rounded p-1 text-slate-500 hover:text-rose-400"
                            title="Delete Notice"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-semibold text-white text-sm line-clamp-1">{ann.title}</h4>
                      <p className="mt-1 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                        {ann.content}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-800/70 pt-2 text-[11px] text-slate-500">
                      <span>Audience: {ann.audience}</span>
                      <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ==================================================================== */}
        {/* 3. STUDENT DIRECTORY MODULE                                         */}
        {/* ==================================================================== */}
        <section ref={sectionRefs.students} className="scroll-mt-24 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-white">Student Directory</h3>
              <p className="text-xs text-slate-400">Manage student records, course assignments, and official transcripts.</p>
            </div>
          </div>

          <StudentTable
            students={students}
            departments={departments}
            loading={loading}
            error={error}
            onRetry={() => loadAll()}
            onEdit={openEditStudent}
            onAssignCourse={openAssignModal}
            onDelete={setDeleteTarget}
            onEnterGrades={openSubmitGradeFromHeader}
            onViewTranscript={(s) => {
              setTranscriptStudent(s);
              setTranscriptModalOpen(true);
            }}
          />
        </section>

        {/* ==================================================================== */}
        {/* 4. TEACHERS / FACULTY MODULE                                        */}
        {/* ==================================================================== */}
        <section ref={sectionRefs.teachers} className="glass-panel scroll-mt-24 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-brand-400" />
              <div>
                <h3 className="font-display text-base font-semibold text-white">Faculty & Teacher Management</h3>
                <p className="text-xs text-slate-400">Department instructors, assigned courses, and grading authority.</p>
              </div>
            </div>
            <button onClick={() => openBatchGrades()} className="btn-secondary !py-1.5 !text-xs flex items-center gap-1.5">
              <Table className="h-3.5 w-3.5 text-emerald-400" />
              <span>Batch Grade Sheets</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {facultyMembers.map((fac, idx) => (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-600/30 to-indigo-600/30 text-brand-200 flex items-center justify-center font-bold text-xs border border-brand-500/30">
                    {fac.name.split(" ").map(p => p[0]).slice(-2).join("")}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs text-white truncate">{fac.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{fac.dept}</p>
                  </div>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <p><span className="text-slate-500">Courses:</span> {fac.courses}</p>
                  <p><span className="text-slate-500">Email:</span> {fac.email}</p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="pill border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[10px]">
                    {fac.status}
                  </span>
                  <button
                    onClick={() => openBatchGrades()}
                    className="text-xs text-brand-300 hover:text-white font-medium inline-flex items-center gap-1"
                  >
                    Gradebook →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 5. ATTENDANCE TRACKING MODULE (with 75% Exam Warning)               */}
        {/* ==================================================================== */}
        <section ref={sectionRefs.attendance} className="glass-panel scroll-mt-24 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-emerald-400" />
              <div>
                <h3 className="font-display text-base font-semibold text-white">Daily Lecture Attendance Tracking</h3>
                <p className="text-xs text-slate-400">Monitor participation and enforce the 75% exam eligibility requirement.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="input-field !py-1.5 text-xs max-w-[150px]"
              />
              <span className="pill border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs">
                75% Policy Enforced
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/80 uppercase text-slate-400 text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Student</th>
                  <th className="px-4 py-2.5">Department</th>
                  <th className="px-4 py-2.5">Course</th>
                  <th className="px-4 py-2.5 text-center">Attendance Status ({attendanceDate})</th>
                  <th className="px-4 py-2.5 text-right">Exam Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {students.slice(0, 5).map((s) => {
                  const status = attendanceRecords[s.id] || "Present";
                  return (
                    <tr key={s.id} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-medium text-slate-100">{s.name}</td>
                      <td className="px-4 py-3 text-slate-400">{s.department_name || "General"}</td>
                      <td className="px-4 py-3 text-slate-300 font-mono">{s.courses?.[0]?.code || "CS201"}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          {["Present", "Absent", "Late", "Excused"].map((st) => (
                            <button
                              key={st}
                              onClick={() => {
                                setAttendanceRecords((prev) => ({ ...prev, [s.id]: st }));
                                toast.success(`Marked ${s.name} as ${st}`);
                              }}
                              className={`rounded px-2 py-1 text-[11px] font-medium transition ${
                                status === st
                                  ? st === "Present" ? "bg-emerald-600 text-white" : st === "Absent" ? "bg-rose-600 text-white" : "bg-amber-600 text-white"
                                  : "bg-slate-800 text-slate-400 hover:text-white"
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="pill border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[10px]">
                          ✓ Eligible (96%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 6. COURSES & DEPARTMENTS MANAGEMENT                                  */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Courses Management */}
          <section ref={sectionRefs.courses} className="glass-panel scroll-mt-24 p-5 lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-emerald-400" />
                <h3 className="font-display text-base font-semibold text-white">Course Curriculum & Credit Hours</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openBatchGrades()}
                  className="btn-secondary !py-1.5 !text-xs hover:border-emerald-500/50 hover:text-emerald-300"
                >
                  <Table className="h-3.5 w-3.5 text-emerald-400" />
                  Batch Grades
                </button>
                <button onClick={openAddCourse} className="btn-crimson !py-1.5 !text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Add Course
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">
                <div className="skeleton h-10 w-full" />
                <div className="skeleton h-10 w-full" />
              </div>
            ) : courses.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">No courses defined yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-900/60 uppercase text-slate-400 text-[11px]">
                    <tr>
                      <th className="px-3 py-2">Code</th>
                      <th className="px-3 py-2">Course Title</th>
                      <th className="px-3 py-2">Department</th>
                      <th className="px-3 py-2 text-center">Credit Hours</th>
                      <th className="px-3 py-2 text-center">Enrolled</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/30">
                        <td className="px-3 py-2.5 font-mono font-bold text-slate-200">{c.code}</td>
                        <td className="px-3 py-2.5 font-medium text-slate-100">{c.name}</td>
                        <td className="px-3 py-2.5 text-slate-400">{c.department_name || "General"}</td>
                        <td className="px-3 py-2.5 text-center font-mono text-indigo-300 font-semibold">{c.credit_hours || 3} CH</td>
                        <td className="px-3 py-2.5 text-center font-mono text-emerald-400">{c.student_count || 0}</td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openBatchGrades(c.id)}
                              className="rounded p-1 text-emerald-400 hover:bg-emerald-950/50"
                              title="Enter batch grades"
                            >
                              <Table className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openEditCourse(c)}
                              className="rounded p-1 text-slate-400 hover:text-indigo-300"
                              title="Edit Course"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(c)}
                              className="rounded p-1 text-slate-400 hover:text-rose-400"
                              title="Delete Course"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Departments Management */}
          <section ref={sectionRefs.departments} className="glass-panel scroll-mt-24 p-5">
            <div className="mb-4 flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-indigo-400" />
                <h3 className="font-display text-base font-semibold text-white">Departments</h3>
              </div>
              <button onClick={openAddDept} className="btn-secondary !py-1.5 !text-xs">
                <Plus className="h-3.5 w-3.5" />
                Add Dept
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">
                <div className="skeleton h-8 w-full" />
              </div>
            ) : departments.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">No departments yet.</p>
            ) : (
              <ul className="space-y-2">
                {departments.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-900/50 px-3 py-2 text-xs"
                  >
                    <div>
                      <span className="font-medium text-slate-200 block">{d.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {d.student_count || 0} students • {d.course_count || 0} courses
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditDept(d)} className="rounded p-1 text-slate-400 hover:text-indigo-300">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDeleteDept(d)} className="rounded p-1 text-slate-400 hover:text-rose-400">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ==================================================================== */}
        {/* 7. SEMESTERS & 5-DAY CLASS TIMETABLE GRID                           */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Semesters Section */}
          <section ref={sectionRefs.semesters} className="glass-panel scroll-mt-24 p-5">
            <div className="mb-4 flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-brand-400" />
                <h3 className="font-display text-base font-semibold text-white">Academic Semesters</h3>
              </div>
              <button
                onClick={() => { setEditingSemester(null); setSemesterModalOpen(true); }}
                className="btn-primary !py-1.5 !text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Term
              </button>
            </div>

            {semesters.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">No semesters defined yet.</p>
            ) : (
              <ul className="space-y-2">
                {semesters.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-900/50 px-3 py-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200">{s.name}</span>
                        {s.is_current ? (
                          <span className="pill border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 text-[10px] font-semibold">
                            Active
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[11px] text-slate-500">{s.academic_year}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingSemester(s); setSemesterModalOpen(true); }} className="rounded p-1 text-slate-400 hover:text-indigo-300">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Class Timetable Grid */}
          <section ref={sectionRefs.schedules} className="lg:col-span-2 scroll-mt-24">
            <TimetableGrid
              schedules={schedules}
              isAdmin={true}
              onAdd={() => { setEditingSchedule(null); setScheduleModalOpen(true); }}
              onEdit={(slot) => { setEditingSchedule(slot); setScheduleModalOpen(true); }}
              onDelete={async (slot) => {
                if (confirm(`Delete ${slot.course_code} class on ${slot.day_of_week}?`)) {
                  try {
                    await schedulesApi.remove(slot.id);
                    toast.success("Schedule deleted");
                    loadAll({ silent: true });
                  } catch (e) {
                    toast.error(e.message || "Failed to delete schedule");
                  }
                }
              }}
            />
          </section>
        </div>

        {/* ==================================================================== */}
        {/* 8. LIBRARY CATALOG MODULE                                           */}
        {/* ==================================================================== */}
        <section ref={sectionRefs.library} className="glass-panel scroll-mt-24 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-2">
              <Library className="h-5 w-5 text-amber-400" />
              <div>
                <h3 className="font-display text-base font-semibold text-white">University Library Services</h3>
                <p className="text-xs text-slate-400">Digital textbook catalog, circulation status, and ISBN reference.</p>
              </div>
            </div>
            <div className="relative min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={libraryQuery}
                onChange={(e) => setLibraryQuery(e.target.value)}
                className="input-field pl-8 !py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredLibrary.map((b, idx) => (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="pill border border-slate-700 bg-slate-800 text-slate-400 text-[10px]">
                    Shelf: {b.shelf}
                  </span>
                  <span className={`pill text-[10px] ${b.status === "Available" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"}`}>
                    {b.status}
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-white line-clamp-2">{b.title}</h4>
                <p className="text-[11px] text-slate-400">{b.author}</p>
                <p className="text-[10px] font-mono text-slate-500">ISBN: {b.isbn}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Enrollment Chart */}
        <section className="glass-panel p-5">
          <h3 className="mb-4 font-display text-sm font-semibold text-white">Enrollment Distribution Analytics</h3>
          <EnrollmentChart courses={courses} loading={loading} />
        </section>

      </main>

      <Footer apiStatus={apiStatus} activeCount={activeCount} />

      {/* Auto-Credentials Dialog */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6">
            <div className="mb-3 flex items-center gap-2.5 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="font-display font-semibold text-white">Student Account Created!</h3>
            </div>
            <p className="text-xs text-slate-300">
              A login portal account has been generated for <strong>{createdCredentials.name}</strong>.
            </p>

            <div className="my-4 rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 font-mono text-xs space-y-1.5">
              <div>
                <span className="text-slate-500">Username:</span>{" "}
                <span className="text-brand-300 font-semibold">{createdCredentials.username}</span>
              </div>
              <div>
                <span className="text-slate-500">Default Password:</span>{" "}
                <span className="text-emerald-300 font-semibold">{createdCredentials.password}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={copyCredentials}
                className="btn-secondary !px-3 text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy Credentials"}
              </button>
              <button onClick={() => setCreatedCredentials(null)} className="btn-primary !px-4 text-xs">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <StudentModal
        open={studentModalOpen}
        onClose={closeStudentModal}
        onSubmit={handleSubmitStudent}
        departments={departments}
        student={editingStudent}
        submitting={savingStudent}
      />
      <UpdateStudentModal
        open={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        onSubmit={handleUpdateStudentSubmit}
        students={students}
        departments={departments}
        initialStudent={updateTarget}
        submitting={savingStudent}
      />
      <CourseAssignModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={handleAssignCourse}
        student={assignTarget}
        courses={courses}
        assigningId={assigningCourseId}
      />
      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        student={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        submitting={deleting}
      />
      <GradeEntryModal
        open={gradeModalOpen}
        onClose={() => setGradeModalOpen(false)}
        onSubmit={handleSubmitGrade}
        student={gradeTarget}
        students={students}
        courses={courses}
        submitting={savingGrade}
      />
      <BatchGradeEntryModal
        open={batchGradeModalOpen}
        onClose={() => setBatchGradeModalOpen(false)}
        courses={courses}
        initialCourseId={batchCourseId}
        onSuccess={() => loadAll({ silent: true })}
      />
      <DepartmentModal
        open={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        onSubmit={handleSubmitDept}
        initialDepartment={editingDept}
        submitting={savingDept}
      />
      <CourseModal
        open={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        onSubmit={handleSubmitCourse}
        departments={departments}
        semesters={semesters}
        initialCourse={editingCourse}
        submitting={savingCourse}
      />
      <AnnouncementModal
        open={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        onSubmit={handleSubmitAnnouncement}
        initialAnnouncement={editingAnnouncement}
        submitting={savingAnnouncement}
      />
      <SemesterModal
        open={semesterModalOpen}
        onClose={() => setSemesterModalOpen(false)}
        semester={editingSemester}
        onSuccess={() => loadAll({ silent: true })}
      />
      <ScheduleModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        schedule={editingSchedule}
        courses={courses}
        onSuccess={() => loadAll({ silent: true })}
      />
      <AcademicTranscriptModal
        open={transcriptModalOpen}
        onClose={() => { setTranscriptModalOpen(false); setTranscriptStudent(null); }}
        student={transcriptStudent}
        grades={transcriptStudent?.courses || []}
        semesters={semesters}
      />
      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
}