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
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import logo from "../images/logo.png";

const NAV_LINKS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "departments", label: "Departments", icon: Layers },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "announcements", label: "Notice Board", icon: Bell }
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
    <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-glow overflow-hidden">
            <img src={logo} alt="Student Management Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold tracking-tight text-white">
              Student Management
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className={`glow-dot ${status.color}`} />
              <span className="hidden sm:inline">{status.label}</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-900/50 p-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const active = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-brand-500/90 shadow-glow"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions & Settings Dropdown */}
        <div className="flex items-center gap-2">
          {/* Primary Action: Add Student */}
          {onAddStudent && (
            <button
              onClick={onAddStudent}
              className="btn-primary !px-3.5 sm:!px-4 !py-2 text-xs sm:text-sm font-medium shadow-glow"
              title="Add New Student"
            >
              <Plus className="h-4 w-4" />
              <span>Add Student</span>
            </button>
          )}

          {/* Desktop Settings / Quick Actions Dropdown */}
          <div className="relative hidden md:block" ref={settingsRef}>
            <button
              onClick={() => setSettingsOpen((prev) => !prev)}
              className={`btn-secondary !px-3 !py-2 text-xs sm:text-sm flex items-center gap-2 transition ${
                settingsOpen ? "border-brand-500/60 bg-slate-800/80 text-white" : ""
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
                    <div className="mb-2 rounded-lg bg-slate-900/70 p-2.5 border border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500/20 text-brand-300">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-white truncate">
                            {currentStudent.name || currentStudent.username}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate uppercase tracking-wider">
                            Role: {currentStudent.role || "Admin"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Academic / Grade Actions */}
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
                        <span>Batch Grades Spreadsheet</span>
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
                  </div>

                  <div className="my-1.5 border-t border-slate-800/80" />

                  {/* System & Account Actions */}
                  <div className="space-y-0.5">
                    <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      System & Account
                    </p>

                    {onRefresh && (
                      <button
                        onClick={() => handleActionClick(onRefresh)}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-slate-200 transition hover:bg-slate-800/80 hover:text-slate-100"
                      >
                        <div className="flex items-center gap-2.5">
                          <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${isRefreshing ? "animate-spin" : ""}`} />
                          <span>Refresh Data</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{status.label}</span>
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
                  </div>

                  {/* Logout Action */}
                  {currentStudent && (
                    <>
                      <div className="my-1.5 border-t border-slate-800/80" />
                      <button
                        onClick={() => handleActionClick(onLogout)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-400 transition hover:bg-rose-950/40 hover:text-rose-300"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="btn-secondary !px-2.5 lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Clean Responsive Design) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden border-t border-slate-800/80 bg-slate-950/95 lg:hidden"
          >
            <div className="space-y-4 px-4 py-4">
              {/* User badge on mobile */}
              {currentStudent && (
                <div className="flex items-center justify-between rounded-xl border border-slate-800/90 bg-slate-900/60 p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/20 text-brand-300">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {currentStudent.name || currentStudent.username}
                      </p>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                        Role: {currentStudent.role || "Admin"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className={`glow-dot ${status.color}`} />
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-1">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Navigation
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {NAV_LINKS.map((link) => {
                    const Icon = link.icon;
                    const active = activeSection === link.id;
                    return (
                      <button
                        key={link.id}
                        onClick={() => handleNavClick(link.id)}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                          active
                            ? "bg-brand-500/90 text-white shadow-glow"
                            : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {link.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions & Settings on Mobile */}
              <div className="space-y-1.5">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Actions & Settings
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {onBatchGrades && (
                    <button
                      onClick={() => handleActionClick(onBatchGrades)}
                      className="btn-secondary w-full justify-start !py-2 text-xs font-medium hover:border-emerald-500/50 hover:text-emerald-300"
                    >
                      <Table className="h-4 w-4 text-emerald-400 mr-1.5" />
                      Batch Grades Spreadsheet
                    </button>
                  )}
                  {onSubmitGrade && (
                    <button
                      onClick={() => handleActionClick(onSubmitGrade)}
                      className="btn-secondary w-full justify-start !py-2 text-xs font-medium hover:border-emerald-500/50 hover:text-emerald-300"
                    >
                      <Award className="h-4 w-4 text-emerald-400 mr-1.5" />
                      Submit Single Grade
                    </button>
                  )}
                  {onUpdateStudent && (
                    <button
                      onClick={() => handleActionClick(onUpdateStudent)}
                      className="btn-secondary w-full justify-start !py-2 text-xs font-medium hover:border-indigo-500/50 hover:text-indigo-300"
                    >
                      <UserCheck className="h-4 w-4 text-indigo-400 mr-1.5" />
                      Update Student Info
                    </button>
                  )}
                  {onChangePassword && (
                    <button
                      onClick={() => handleActionClick(onChangePassword)}
                      className="btn-secondary w-full justify-start !py-2 text-xs font-medium hover:border-indigo-500/50 hover:text-indigo-300"
                    >
                      <KeyRound className="h-4 w-4 text-indigo-400 mr-1.5" />
                      Change Password
                    </button>
                  )}
                  {onRefresh && (
                    <button
                      onClick={() => handleActionClick(onRefresh)}
                      className="btn-secondary w-full justify-start !py-2 text-xs font-medium"
                    >
                      <RefreshCw className="h-4 w-4 text-slate-400 mr-1.5" />
                      Refresh System Data
                    </button>
                  )}
                </div>
              </div>

              {/* Sign Out Footer */}
              {currentStudent && (
                <div className="border-t border-slate-800/80 pt-3 flex justify-end">
                  <button
                    onClick={() => handleActionClick(onLogout)}
                    className="flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out ({currentStudent.name || currentStudent.username})
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
