import { useEffect, useRef, useState } from "react";
import {
  GraduationCap,
  Plus,
  RefreshCw,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Layers,
  BookOpen,
  LogOut,
  UserCheck,
  Award,
  Table,
  Bell,
  KeyRound,
  Settings,
  ChevronDown,
  User,
  CheckSquare,
  Library,
  BarChart3,
  Home
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import logo from "../images/logo.png";

export const NAV_LINKS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "teachers", label: "Teachers", icon: UserCheck },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "departments", label: "Departments", icon: Layers },
  { id: "attendance", label: "Attendance", icon: CheckSquare },
  { id: "grades", label: "Grades", icon: Award },
  { id: "library", label: "Library", icon: Library },
  { id: "events", label: "Events", icon: Bell },
  { id: "reports", label: "Reports", icon: BarChart3 }
];

export default function Header({
  onAddStudent,
  onUpdateStudent,
  onSubmitGrade,
  onBatchGrades,
  onAnnouncements,
  onChangePassword,
  onRefresh,
  isRefreshing,
  apiStatus,
  activeSection = "dashboard",
  onNavigate,
  currentStudent,
  onLogout
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusMap = {
    online: { label: "API connected", color: "text-emerald-400" },
    offline: { label: "API unreachable", color: "text-rose-400" },
    checking: { label: "Checking connection…", color: "text-amber-300" }
  };
  const status = statusMap[apiStatus] || statusMap.checking;

  const handleNavClick = (id) => {
    setMobileOpen(false);
    onNavigate?.(id);
  };

  const handleActionClick = (actionFn) => {
    setMobileOpen(false);
    setSettingsOpen(false);
    actionFn?.();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Left: Brand & Return Home Link */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-crimson-700 to-indigo-600 shadow-glow-crimson overflow-hidden group">
            <img src={logo} alt="Student Management Logo" className="h-full w-full object-cover group-hover:scale-105 transition" />
          </a>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base sm:text-lg font-bold tracking-tight text-white">
                Student Management
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className={`glow-dot ${status.color}`} />
              <span className="hidden sm:inline">{status.label}</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-900/50 p-1 xl:flex">
          {NAV_LINKS.slice(0, 7).map((link) => {
            const Icon = link.icon;
            const active = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  active ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-crimson-700/90 shadow-glow-crimson"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="relative h-3.5 w-3.5" />
                <span className="relative">{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools & Settings Dropdown */}
        <div className="flex items-center gap-2">
          {/* Primary Action: Add Student */}
          {onAddStudent && (
            <button
              onClick={onAddStudent}
              className="btn-crimson !px-3.5 sm:!px-4 !py-2 text-xs sm:text-sm font-semibold shadow-glow-crimson"
              title="Add New Student"
            >
              <Plus className="h-4 w-4" />
              <span>Add Student</span>
            </button>
          )}

          {/* Desktop Settings & Quick Actions Dropdown */}
          <div className="relative hidden md:block" ref={settingsRef}>
            <button
              onClick={() => setSettingsOpen((prev) => !prev)}
              className={`btn-secondary !px-3 !py-2 text-xs sm:text-sm flex items-center gap-2 transition ${
                settingsOpen ? "border-crimson-500/60 bg-slate-800/80 text-white" : ""
              }`}
              title="Settings & Quick Actions"
              aria-expanded={settingsOpen}
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span className="font-medium text-slate-200">Settings</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                  settingsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="glass-panel absolute right-0 mt-2 w-64 p-2 shadow-2xl z-50 border border-slate-800 bg-slate-950/95 backdrop-blur-xl"
                >
                  {/* User Profile Header in Dropdown */}
                  {currentStudent && (
                    <div className="mb-2 rounded-lg bg-slate-900/80 p-2.5 border border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-crimson-500/20 text-crimson-300 font-bold text-xs">
                          {currentStudent.name?.[0] || "A"}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-white truncate">
                            {currentStudent.name || currentStudent.username}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                            Role: {currentStudent.role || "Admin"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Academic Actions */}
                  <div className="space-y-0.5">
                    <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Academic Actions
                    </p>

                    {onBatchGrades && (
                      <button
                        onClick={() => handleActionClick(onBatchGrades)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-200 transition hover:bg-slate-800/80 hover:text-emerald-300"
                      >
                        <Table className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Batch Grade Entry (Excel)</span>
                      </button>
                    )}

                    {onSubmitGrade && (
                      <button
                        onClick={() => handleActionClick(onSubmitGrade)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-200 transition hover:bg-slate-800/80 hover:text-emerald-300"
                      >
                        <Award className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Submit Single Grade</span>
                      </button>
                    )}

                    {onUpdateStudent && (
                      <button
                        onClick={() => handleActionClick(onUpdateStudent)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-200 transition hover:bg-slate-800/80 hover:text-indigo-300"
                      >
                        <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Update Student Information</span>
                      </button>
                    )}

                    {onAnnouncements && (
                      <button
                        onClick={() => handleActionClick(onAnnouncements)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-200 transition hover:bg-slate-800/80 hover:text-amber-300"
                      >
                        <Bell className="h-3.5 w-3.5 text-amber-400" />
                        <span>Create Announcement</span>
                      </button>
                    )}
                  </div>

                  <div className="my-1 border-t border-slate-800/80" />

                  {/* System & Account */}
                  <div className="space-y-0.5">
                    <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Account & System
                    </p>

                    <a
                      href="/"
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-200 transition hover:bg-slate-800/80 hover:text-white"
                    >
                      <Home className="h-3.5 w-3.5 text-slate-400" />
                      <span>Campus Portal Home</span>
                    </a>

                    {onRefresh && (
                      <button
                        onClick={() => handleActionClick(onRefresh)}
                        disabled={isRefreshing}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-200 transition hover:bg-slate-800/80 hover:text-brand-300 disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 text-brand-400 ${isRefreshing ? "animate-spin" : ""}`} />
                        <span>Refresh Data</span>
                      </button>
                    )}

                    {onChangePassword && (
                      <button
                        onClick={() => handleActionClick(onChangePassword)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-200 transition hover:bg-slate-800/80 hover:text-indigo-300"
                      >
                        <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Change Password</span>
                      </button>
                    )}

                    {onLogout && (
                      <button
                        onClick={() => handleActionClick(onLogout)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-rose-300 transition hover:bg-rose-950/40 hover:text-rose-200"
                      >
                        <LogOut className="h-3.5 w-3.5 text-rose-400" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="btn-secondary !p-2 xl:hidden"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-800/80 bg-slate-950/95 px-4 py-4 backdrop-blur-xl xl:hidden space-y-4"
          >
            {/* Nav links */}
            <div className="grid grid-cols-2 gap-2">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const active = activeSection === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`flex items-center gap-2 rounded-lg p-2.5 text-xs font-medium transition ${
                      active ? "bg-crimson-700 text-white" : "bg-slate-900/60 text-slate-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Actions */}
            <div className="space-y-2 border-t border-slate-800/80 pt-3 text-xs">
              <a href="/" className="btn-secondary w-full !py-2 flex items-center justify-center gap-2">
                <Home className="h-4 w-4" />
                <span>Return to Campus Home</span>
              </a>
              {onLogout && (
                <button
                  onClick={() => { setMobileOpen(false); onLogout(); }}
                  className="btn-danger w-full !py-2 flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
