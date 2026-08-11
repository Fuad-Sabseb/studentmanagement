import { useState } from "react";
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
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "departments", label: "Departments", icon: Layers },
  { id: "courses", label: "Courses", icon: BookOpen }
];

export default function Header({
  onAddStudent,
  onRefresh,
  isRefreshing,
  apiStatus,
  activeSection = "dashboard",
  onNavigate,
  currentStudent,
  onLogout
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-glow">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold tracking-tight text-white">
              Cohort
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className={`glow-dot ${status.color}`} />
              <span>{status.label}</span>
            </div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-900/50 p-1 md:flex">
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

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="btn-secondary !px-3"
            aria-label="Refresh data"
            title="Refresh data"
          >
            <motion.span
              animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : {}}
              className="flex"
            >
              <RefreshCw className="h-4 w-4" />
            </motion.span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={onAddStudent} className="btn-primary">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Student</span>
          </button>

          {currentStudent && (
            <button
              onClick={onLogout}
              className="btn-secondary !px-3"
              title={`Sign out ${currentStudent.name}`}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">{currentStudent.name}</span>
            </button>
          )}

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="btn-secondary !px-3 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-800/70 bg-slate-950/95 md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const active = activeSection === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                      active
                        ? "bg-brand-500/90 text-white shadow-glow"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </button>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
