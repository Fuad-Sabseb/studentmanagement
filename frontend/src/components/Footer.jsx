import { Github, Mail, ShieldCheck, Twitter, Linkedin, Instagram } from "lucide-react";
import logo from "../images/logo.png";

// Update these URLs to your real profiles.
const SOCIAL_LINKS = [
  { id: "github", label: "GitHub", icon: Github, href: "https://github.com/your-username" },
  { id: "twitter", label: "Twitter / X", icon: Twitter, href: "https://twitter.com/your-handle" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/in/your-handle" },
  { id: "instagram", label: "Instagram", icon: Instagram, href: "https://instagram.com/your-handle" }
];

export default function Footer({ apiStatus, activeCount }) {
  const year = new Date().getFullYear();

  const statusMap = {
    online: { label: "Current status: Online", color: "text-emerald-400" },
    offline: { label: "Currently: API unreachable", color: "text-rose-400" },
    checking: { label: "Checking connection…", color: "text-amber-300" }
  };
  const status = statusMap[apiStatus] || statusMap.checking;

  return (
    <footer className="mt-10 border-t border-slate-800/70 bg-slate-950/60">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="logo-container flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-glow overflow-hidden">
                <img src={logo} alt="Student Management logo" className="h-full w-full object-cover" />
              </div>
              <span className="font-display text-sm font-semibold text-white">Student Management</span>
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-500">
              A student management dashboard for tracking students, departments,
              courses, and enrollments in one place.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Product
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><a href="#dashboard" className="transition hover:text-slate-300">Dashboard</a></li>
              <li><a href="#students" className="transition hover:text-slate-300">Students</a></li>
              <li><a href="#departments" className="transition hover:text-slate-300">Departments</a></li>
              <li><a href="#courses" className="transition hover:text-slate-300">Courses</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Resources
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><a href="/docs/API_DOCUMENTATION.md" className="transition hover:text-slate-300">API documentation</a></li>
              <li><a href="/docs/TESTING_REPORT.md" className="transition hover:text-slate-300">Testing report</a></li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 transition hover:text-slate-300"
                >
                  <Github className="h-3.5 w-3.5" /> GitHub repository
                </a>
              </li>
            </ul>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              System status
            </h4>
            <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-300">
              <span className={`glow-dot ${status.color}`} />
              {status.label}
            </div>
            {typeof activeCount === "number" && (
              <p className="mt-2 text-xs text-slate-500">
                {activeCount} active student{activeCount === 1 ? "" : "s"} tracked
              </p>
            )}
            <a
              href="mailto:support@cohort.app"
              className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-slate-300"
            >
              <Mail className="h-3.5 w-3.5" /> support@cohort.app
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-800/70 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {year} Student Management. Built for the Full-Stack Student Management project.</p>

          <div className="flex items-center gap-3 social-links">
            {SOCIAL_LINKS.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800/80 bg-slate-900/60 text-slate-400 transition hover:border-brand-500/50 hover:text-brand-300 hover:shadow-glow"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Data soft-deleted, never destroyed.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
