import { useCallback, useEffect, useRef, useState } from "react";
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
  X
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
    departments: useRef(null),
    courses: useRef(null),
    announcements: useRef(null),
    semesters: useRef(null),
    schedules: useRef(null)
  };

  const handleNavigate = (id) => {
    setActiveSection(id);
    sectionRefs[id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  /* ---------------- Student Handlers ---------------- */
  const openAddStudent = () => {
    setEditingStudent(null);
    setStudentModalOpen(true);
  };

  const openEditStudent = (student) => {
    setEditingStudent(student);
    setStudentModalOpen(true);
  };

  const closeStudentModal = () => {
    if (!savingStudent) setStudentModalOpen(false);
  };

  const openUpdateStudentFromHeader = (student = null) => {
    setUpdateTarget(student || (students.length > 0 ? students[0] : null));
    setUpdateModalOpen(true);
  };

  const handleSubmitStudent = async (payload) => {
    setSavingStudent(true);
    try {
      if (editingStudent) {
        await studentsApi.update(editingStudent.id, payload);
        toast.success(`${payload.name} was updated successfully.`);
      } else {
        const res = await studentsApi.create(payload);
        toast.success(`${payload.name} was added to the roster.`);
        if (res.credentials) {
          setCreatedCredentials({
            name: payload.name,
            email: payload.email,
            username: res.credentials.username,
            password: res.credentials.defaultPassword
          });
        }
      }
      setStudentModalOpen(false);
      await loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Could not save this student.");
    } finally {
      setSavingStudent(false);
    }
  };

  const handleUpdateStudentSubmit = async ({ id, payload }) => {
    setSavingStudent(true);
    try {
      await studentsApi.update(id, payload);
      toast.success(`${payload.name} updated successfully.`);
      setUpdateModalOpen(false);
      await loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Could not update student information.");
    } finally {
      setSavingStudent(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await studentsApi.remove(deleteTarget.id);
      toast.success(`${deleteTarget.name} was removed from the active roster.`);
      setDeleteTarget(null);
      await loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Could not delete this student.");
    } finally {
      setDeleting(false);
    }
  };

  const openAssignModal = (student) => {
    setAssignTarget(student);
    setAssignModalOpen(true);
  };

  const handleAssignCourse = async (student, course) => {
    setAssigningCourseId(course.id);
    try {
      await studentsApi.assignCourse(student.id, course.id);
      toast.success(`Enrolled ${student.name} in ${course.code}.`);
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message ?? "Could not assign this course.");
    } finally {
      setAssigningCourseId(null);
    }
  };

  /* ---------------- Grade Handlers ---------------- */
  const openSubmitGradeFromHeader = (student = null) => {
    setGradeTarget(student || null);
    setGradeModalOpen(true);
  };

  const openBatchGrades = (courseId = null) => {
    setBatchCourseId(courseId);
    setBatchGradeModalOpen(true);
  };

  const handleSubmitGrade = async (payload) => {
    setSavingGrade(true);
    try {
      await gradesApi.enter(payload);
      toast.success("Grade saved successfully.");
      setGradeModalOpen(false);
      await loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Could not save this grade.");
    } finally {
      setSavingGrade(false);
    }
  };

  /* ---------------- Department Handlers ---------------- */
  const openAddDept = () => {
    setEditingDept(null);
    setDeptModalOpen(true);
  };

  const openEditDept = (dept) => {
    setEditingDept(dept);
    setDeptModalOpen(true);
  };

  const handleDeleteDept = async (dept) => {
    if (!window.confirm(`Delete department "${dept.name}"?`)) return;
    try {
      await departmentsApi.remove(dept.id);
      toast.success(`Department "${dept.name}" deleted.`);
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Could not delete department");
    }
  };

  const handleSubmitDept = async ({ id, payload }) => {
    setSavingDept(true);
    try {
      if (id) {
        await departmentsApi.update(id, payload);
        toast.success(`Department "${payload.name}" updated.`);
      } else {
        await departmentsApi.create(payload);
        toast.success(`Department "${payload.name}" created.`);
      }
      setDeptModalOpen(false);
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Failed to save department");
    } finally {
      setSavingDept(false);
    }
  };

  /* ---------------- Course Handlers ---------------- */
  const openAddCourse = () => {
    setEditingCourse(null);
    setCourseModalOpen(true);
  };

  const openEditCourse = (course) => {
    setEditingCourse(course);
    setCourseModalOpen(true);
  };

  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Delete course "${course.code} - ${course.name}"?`)) return;
    try {
      await coursesApi.remove(course.id);
      toast.success(`Course "${course.code}" deleted.`);
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Could not delete course");
    }
  };

  const handleSubmitCourse = async ({ id, payload }) => {
    setSavingCourse(true);
    try {
      if (id) {
        await coursesApi.update(id, payload);
        toast.success(`Course "${payload.code}" updated.`);
      } else {
        await coursesApi.create(payload);
        toast.success(`Course "${payload.code}" created.`);
      }
      setCourseModalOpen(false);
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Failed to save course");
    } finally {
      setSavingCourse(false);
    }
  };

  /* ---------------- Announcement Handlers ---------------- */
  const openAddAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnouncementModalOpen(true);
  };

  const openEditAnnouncement = (ann) => {
    setEditingAnnouncement(ann);
    setAnnouncementModalOpen(true);
  };

  const handleDeleteAnnouncement = async (ann) => {
    if (!window.confirm(`Delete announcement "${ann.title}"?`)) return;
    try {
      await announcementsApi.remove(ann.id);
      toast.success("Announcement deleted.");
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Could not delete announcement");
    }
  };

  const handleSubmitAnnouncement = async ({ id, payload }) => {
    setSavingAnnouncement(true);
    try {
      if (id) {
        await announcementsApi.update(id, payload);
        toast.success("Announcement updated.");
      } else {
        await announcementsApi.create(payload);
        toast.success("Announcement broadcasted successfully!");
      }
      setAnnouncementModalOpen(false);
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Failed to save announcement");
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const copyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Username: ${createdCredentials.username}\nTemporary Password: ${createdCredentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const totalCoursesEnrolled = courses.reduce((sum, c) => sum + (Number(c.enrolled_count) ?? 0), 0);

  return (
    <div className="min-h-screen">
      <Header
        onAddStudent={openAddStudent}
        onUpdateStudent={openUpdateStudentFromHeader}
        onSubmitGrade={openSubmitGradeFromHeader}
        onBatchGrades={() => openBatchGrades()}
        onChangePassword={() => setPasswordModalOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        apiStatus={apiStatus}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        currentStudent={currentUser}
        onLogout={onLogout}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Analytics Summary */}
        <section
          ref={sectionRefs.dashboard}
          className="grid scroll-mt-24 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <AnalyticsCard
            label="Active Students"
            value={activeCount ?? "—"}
            icon={Users}
            accent="brand"
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
            label="Courses Offered"
            value={courses.length}
            icon={BookOpen}
            accent="emerald"
            loading={loading}
          />
          <AnalyticsCard
            label="Total Enrollments"
            value={totalCoursesEnrolled}
            icon={BookOpen}
            accent="amber"
            loading={loading}
          />
        </section>

        {/* Notice Board Widget (Announcements) */}
        <section ref={sectionRefs.announcements} className="glass-panel scroll-mt-24 p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">
                <Bell className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-white">
                  Notice Board & Announcements
                </h3>
                <p className="text-xs text-slate-400">
                  Broadcast notices and deadlines to student dashboards
                </p>
              </div>
            </div>
            <button onClick={openAddAnnouncement} className="btn-primary !py-1.5 !text-xs">
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

        {/* Courses & Departments Management */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Courses Management */}
          <section ref={sectionRefs.courses} className="glass-panel scroll-mt-24 p-5 lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-emerald-400" />
                <h3 className="font-display text-base font-semibold text-white">Course Curriculum</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openBatchGrades()}
                  className="btn-secondary !py-1.5 !text-xs hover:border-emerald-500/50 hover:text-emerald-300"
                  title="Batch grade entry across all students in a course"
                >
                  <Table className="h-3.5 w-3.5 text-emerald-400" />
                  Batch Grades
                </button>
                <button onClick={openAddCourse} className="btn-primary !py-1.5 !text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Add Course
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">
                <div className="skeleton h-10 w-full" />
                <div className="skeleton h-10 w-full" />
                <div className="skeleton h-10 w-full" />
              </div>
            ) : courses.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">No courses registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800/70 text-[11px] uppercase tracking-wider text-slate-400">
                      <th className="pb-2">Code</th>
                      <th className="pb-2">Course Name</th>
                      <th className="pb-2">Department</th>
                      <th className="pb-2 text-center">Enrolled</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {courses.map((c) => (
                      <tr key={c.id} className="transition hover:bg-slate-900/40">
                        <td className="py-2.5 font-semibold text-emerald-300">{c.code}</td>
                        <td className="py-2.5 font-medium text-slate-200">{c.name}</td>
                        <td className="py-2.5 text-slate-400">{c.department_name || "General"}</td>
                        <td className="py-2.5 text-center font-mono text-slate-300">
                          {c.enrolled_count || 0}
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openBatchGrades(c.id)}
                              className="rounded p-1 text-emerald-400 hover:bg-emerald-950/50"
                              title="Enter batch grades for this course"
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
              <button onClick={openAddDept} className="btn-primary !py-1.5 !text-xs">
                <Plus className="h-3.5 w-3.5" />
                Add Dept
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">
                <div className="skeleton h-8 w-full" />
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
                        {d.student_count || 0} student{d.student_count === 1 ? "" : "s"} • {d.course_count || 0} course{d.course_count === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditDept(d)}
                        className="rounded p-1 text-slate-400 hover:text-indigo-300"
                        title="Edit Department"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDept(d)}
                        className="rounded p-1 text-slate-400 hover:text-rose-400"
                        title="Delete Department"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Semesters & Class Timetable Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Academic Semesters Section */}
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

            {loading ? (
              <div className="space-y-2">
                <div className="skeleton h-8 w-full" />
                <div className="skeleton h-8 w-full" />
              </div>
            ) : semesters.length === 0 ? (
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
                      <span className="text-[11px] text-slate-500">
                        {s.academic_year} • {s.course_count || 0} course{s.course_count === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingSemester(s); setSemesterModalOpen(true); }}
                        className="rounded p-1 text-slate-400 hover:text-indigo-300"
                        title="Edit Semester"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete semester "${s.name}"?`)) {
                            try {
                              await semestersApi.remove(s.id);
                              toast.success("Semester deleted");
                              loadAll({ silent: true });
                            } catch (e) {
                              toast.error(e.message || "Failed to delete");
                            }
                          }
                        }}
                        className="rounded p-1 text-slate-400 hover:text-rose-400"
                        title="Delete Semester"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Timetable Class Schedule Manager */}
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
                    toast.success("Class schedule removed");
                    loadAll({ silent: true });
                  } catch (e) {
                    toast.error(e.message || "Failed to delete schedule");
                  }
                }
              }}
            />
          </section>
        </div>

        {/* Enrollment Chart */}
        <section className="glass-panel p-5">
          <h3 className="mb-4 font-display text-sm font-semibold text-white">Enrollment Distribution</h3>
          <EnrollmentChart courses={courses} loading={loading} />
        </section>

        {/* Students Table */}
        <section ref={sectionRefs.students} className="scroll-mt-24">
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