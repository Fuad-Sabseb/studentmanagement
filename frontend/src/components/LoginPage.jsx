import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2,
  Lock,
  User,
  Eye,
  EyeOff,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import logo from "../images/logo.png";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter both your username and password.");
      return;
    }

    setSubmitting(true);
    try {
      await onLogin(username.trim(), password);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Demo Auto-Fill Helpers
  const fillCredentials = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-brand-500/40">
      {/* Top Bar Return Link */}
      <header className="p-4 sm:p-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to University Hub</span>
        </Link>
        <span className="pill border border-brand-500/30 bg-brand-500/10 text-brand-300 text-xs">
          SIS Portal v2.0
        </span>
      </header>

      {/* Center Split Screen Container (Image 1 Inspired) */}
      <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-4 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center glass-panel p-6 sm:p-10 border-slate-800/80 bg-slate-900/60 shadow-2xl">
          
          {/* Left Column: Academic Scholar Workstation Illustration & Badges */}
          <div className="lg:col-span-7 hidden lg:flex flex-col justify-between space-y-6 pr-4 border-r border-slate-800/60">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl overflow-hidden border border-brand-500/30 bg-slate-900 shadow-glow">
                  <img src={logo} alt="Cohort Logo" className="h-full w-full object-cover" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold tracking-tight text-white">
                    STUDENT MANAGEMENT UNIVERSITY
                  </h2>
                  <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
                    Student Information System (SIS)
                  </p>
                </div>
              </div>

              <h1 className="font-display text-2xl xl:text-3xl font-extrabold text-white leading-tight">
                Academic Management, <br />
                <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-crimson-300 bg-clip-text text-transparent">
                  Simplified & Unified.
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-2 max-w-md leading-relaxed">
                Log in to access your course gradebook, manage class timetables, and download verifiable official academic transcripts.
              </p>
            </div>

            {/* Custom SVG Illustration of Student at Modern Workstation (Image 1 Style) */}
            <div className="relative py-4 flex items-center justify-center">
              <div className="w-full max-w-md h-56 rounded-2xl bg-gradient-to-tr from-brand-950/80 via-slate-900/60 to-indigo-950/80 border border-brand-500/20 p-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
                {/* Floating Achievement Cards */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-4 right-4 pill border border-emerald-500/40 bg-emerald-950/80 text-emerald-300 shadow-lg text-[11px] backdrop-blur-md"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Cumulative CGPA: 3.85 / 4.00</span>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-4 left-4 pill border border-brand-500/40 bg-brand-950/80 text-brand-200 shadow-lg text-[11px] backdrop-blur-md"
                >
                  <Sparkles className="h-3.5 w-3.5 text-brand-400" />
                  <span>Year 1 Sem I • Enrolled</span>
                </motion.div>

                {/* Workstation Graphic Elements */}
                <div className="flex flex-col items-center justify-center my-auto space-y-2 text-center">
                  <div className="h-16 w-28 rounded-lg border-2 border-brand-400/40 bg-slate-950/80 p-2 flex flex-col justify-between shadow-glow">
                    <div className="h-2 w-12 bg-brand-400/40 rounded-full mx-auto" />
                    <div className="h-1.5 w-20 bg-slate-700 rounded-full mx-auto" />
                    <div className="h-1.5 w-16 bg-slate-800 rounded-full mx-auto" />
                  </div>
                  <div className="h-2 w-8 bg-brand-400/60 rounded-t-sm" />
                  <div className="h-1.5 w-24 bg-slate-800 rounded-full" />
                </div>
              </div>
            </div>

            {/* Feature Pills Footer */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>3-Tier RBAC</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-brand-400" />
                <span>Weighted CGPA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>PDF Transcript</span>
              </div>
            </div>
          </div>

          {/* Right Column: Focused Modern Login Card */}
          <div className="lg:col-span-5 w-full flex flex-col justify-center">
            <div className="mb-6 text-center lg:text-left">
              <div className="lg:hidden flex items-center justify-center gap-2 mb-3">
                <div className="h-10 w-10 rounded-xl overflow-hidden border border-brand-500/40">
                  <img src={logo} alt="Student Logo" className="h-full w-full object-cover" />
                </div>
              </div>
              <h2 className="font-display text-2xl font-bold text-white">Sign In</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your university credentials to enter your portal.
              </p>
            </div>

            {/* Quick Demo Credentials Switcher */}
            <div className="mb-5 rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-1.5 text-center">
                ⚡ Quick Demo Auto-Fill:
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => fillCredentials("admin", "admin123")}
                  className="rounded-lg border border-slate-700/60 bg-slate-900/80 px-2 py-1.5 text-[11px] font-medium text-slate-300 hover:border-brand-500/50 hover:text-white transition"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("teacher1", "Teacher@123")}
                  className="rounded-lg border border-slate-700/60 bg-slate-900/80 px-2 py-1.5 text-[11px] font-medium text-slate-300 hover:border-crimson-500/50 hover:text-white transition"
                >
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("fuad.sabseb", "Student@123")}
                  className="rounded-lg border border-slate-700/60 bg-slate-900/80 px-2 py-1.5 text-[11px] font-medium text-slate-300 hover:border-indigo-500/50 hover:text-white transition"
                >
                  Student
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Username or Institutional ID
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field pl-9 !py-2.5 text-sm"
                    placeholder="e.g. admin or student ID"
                    autoFocus
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-medium text-slate-400">
                    Password
                  </label>
                  <span className="text-[11px] text-brand-400 hover:text-brand-300 cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-9 pr-10 !py-2.5 text-sm"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
                  />
                  <span>Keep me signed in for 7 days</span>
                </label>
              </div>

              {error && (
                <p className="rounded-xl border border-rose-900/60 bg-rose-950/60 p-3 text-xs text-rose-300 animate-shake">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full !py-3 text-sm font-semibold shadow-glow flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Sign In to Portal</span>
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
              Need assistance? Contact the{" "}
              <span className="text-slate-300 font-medium">Registrar's IT Helpdesk</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-[11px] text-slate-600">
        © 2026 University Student Information System. Authorized Institutional Access Only.
      </footer>
    </div>
  );
}
