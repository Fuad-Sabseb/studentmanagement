import { useCallback, useEffect, useRef, useState } from "react";
import { Layers, Users, BookOpen } from "lucide-react";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import AnalyticsCard from "./components/AnalyticsCard.jsx";
import EnrollmentChart from "./components/EnrollmentChart.jsx";
import StudentTable from "./components/StudentTable.jsx";
import StudentModal from "./components/StudentModal.jsx";
import CourseAssignModal from "./components/CourseAssignModal.jsx";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal.jsx";
import { useToast } from "./components/Toast.jsx";
import { studentsApi, departmentsApi, coursesApi } from "./services/api.js";

export default function App() {
  const toast = useToast();

  // ---- core data state -------------------------------------------------
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeCount, setActiveCount] = useState(null);

  // ---- loading / error state ---------------------------------------
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");

  // ---- modal state ----------------------------------------------------
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [savingStudent, setSavingStudent] = useState(false);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [assigningCourseId, setAssigningCourseId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ---- nav / section state -------------------------------------------
  const [activeSection, setActiveSection] = useState("dashboard");
  const sectionRefs = {
    dashboard: useRef(null),
    students: useRef(null),
    departments: useRef(null),
    courses: useRef(null)
  };

  const handleNavigate = (id) => {
    setActiveSection(id);
    sectionRefs[id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ------------------------------------------------------------------
  // Data loading
  // ------------------------------------------------------------------
  const loadAll = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [studentsRes, departmentsRes, coursesRes, countRes] = await Promise.all([
        studentsApi.getAll(),
        departmentsApi.getAll(),
        coursesApi.getAll(),
        studentsApi.getCount()
      ]);

      setStudents(studentsRes.data || []);
      setDepartments(departmentsRes.data || []);
      setCourses(coursesRes.data || []);
      setActiveCount(countRes.data?.total ?? studentsRes.data?.length ?? 0);
      setApiStatus("online");
    } catch (err) {
      setError(err.message || "Something went wrong while loading data.");
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

  // ------------------------------------------------------------------
  // Student CRUD
  // ------------------------------------------------------------------
  const openAddStudent = () => {
    setEditingStudent(null);
    setStudentModalOpen(true);
  };

  const openEditStudent = (student) => {
    setEditingStudent(student);
    setStudentModalOpen(true);
  };

  const closeStudentModal = () => {
    if (savingStudent) return;
    setStudentModalOpen(false);
  };

  const handleSubmitStudent = async (payload) => {
    setSavingStudent(true);
    try {
      if (editingStudent) {
        await studentsApi.update(editingStudent.id, payload);
        toast.success(`${payload.name} was updated successfully.`);
      } else {
        await studentsApi.create(payload);
        toast.success(`${payload.name} was added to the roster.`);
      }
      setStudentModalOpen(false);
      await loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Could not save this student.");
    } finally {
      setSavingStudent(false);
    }
  };

  // ------------------------------------------------------------------
  // Soft delete
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // Course assignment
  // ------------------------------------------------------------------
  const openAssignModal = (student) => {
    setAssignTarget(student);
    setAssignModalOpen(true);
  };

  const handleAssignCourse = async (student, course) => {
    setAssigningCourseId(course.id);
    try {
      await studentsApi.assignCourse(student.id, course.id);
      toast.success(`Enrolled ${student.name} in ${course.code}.`);

      // keep the modal in sync without a full reload flicker
      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id ? { ...s, courses: [...(s.courses || []), course] } : s
        )
      );
      setAssignTarget((prev) =>
        prev && prev.id === student.id
          ? { ...prev, courses: [...(prev.courses || []), course] }
          : prev
      );
      loadAll({ silent: true });
    } catch (err) {
      toast.error(err.message || "Could not assign this course.");
    } finally {
      setAssigningCourseId(null);
    }
  };

  // ------------------------------------------------------------------
  // Derived metrics
  // ------------------------------------------------------------------
  const totalCoursesEnrolled = courses.reduce(
    (sum, c) => sum + (Number(c.enrolled_count) || 0),
    0
  );

  return (
    <div className="min-h-screen">
      <Header
        onAddStudent={openAddStudent}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        apiStatus={apiStatus}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Top analytics bar */}
        <section ref={sectionRefs.dashboard} className="grid scroll-mt-24 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Chart + directory */}
        <section
          ref={sectionRefs.courses}
          className="mt-6 grid scroll-mt-24 grid-cols-1 gap-4 lg:grid-cols-3"
        >
          <EnrollmentChart courses={courses} loading={loading} />
          <div
            ref={sectionRefs.departments}
            className="glass-panel flex scroll-mt-24 flex-col justify-center gap-3 p-5"
          >
            <h3 className="font-display text-sm font-semibold text-white">Departments</h3>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-8 w-full" />
                ))}
              </div>
            ) : departments.length === 0 ? (
              <p className="text-sm text-slate-500">No departments yet.</p>
            ) : (
              <ul className="space-y-2">
                {departments.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-900/50 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-200">{d.name}</span>
                    <span className="text-xs text-slate-500">
                      {d.student_count} student{d.student_count === 1 ? "" : "s"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Student directory */}
        <section ref={sectionRefs.students} className="mt-6 scroll-mt-24">
          <StudentTable
            students={students}
            departments={departments}
            loading={loading}
            error={error}
            onRetry={() => loadAll()}
            onEdit={openEditStudent}
            onAssignCourse={openAssignModal}
            onDelete={setDeleteTarget}
          />
        </section>
      </main>

      <Footer apiStatus={apiStatus} activeCount={activeCount} />

      {/* Modals */}
      <StudentModal
        open={studentModalOpen}
        onClose={closeStudentModal}
        onSubmit={handleSubmitStudent}
        departments={departments}
        student={editingStudent}
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
    </div>
  );
}
