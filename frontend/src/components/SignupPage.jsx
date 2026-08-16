import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock, User, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../images/logo.png";

export default function SignupPage({ onSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must include uppercase, lowercase, and a number.");
      return;
    }

    setSubmitting(true);
    try {
      await onSignup(username.trim(), password, confirmPassword);
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-panel w-full max-w-sm p-8"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-glow overflow-hidden">
            <img src={logo} alt="Student Management Logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="font-display text-lg font-semibold text-white">Create Account</h1>
          <p className="mt-1 text-sm text-slate-400">Sign up for a student account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-slate-400">
              Username
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field pl-9"
                placeholder="e.g. john.doe"
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-400">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-9"
                placeholder="Min 8 characters"
                autoComplete="new-password"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Must include uppercase, lowercase, and a number
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-medium text-slate-400">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pl-9"
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-rose-900/60 bg-rose-950/50 px-3 py-2 text-xs text-rose-300">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-400 hover:text-brand-300">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
