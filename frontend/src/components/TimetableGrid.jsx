import { Clock, MapPin, User, Calendar, BookOpen, Trash2, Edit2, Plus } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const COLOR_CLASSES = [
  "border-brand-500/40 bg-brand-950/40 text-brand-200",
  "border-emerald-500/40 bg-emerald-950/40 text-emerald-200",
  "border-indigo-500/40 bg-indigo-950/40 text-indigo-200",
  "border-amber-500/40 bg-amber-950/40 text-amber-200",
  "border-rose-500/40 bg-rose-950/40 text-rose-200",
  "border-cyan-500/40 bg-cyan-950/40 text-cyan-200"
];

function getCourseColor(courseCode = "") {
  let hash = 0;
  for (let i = 0; i < courseCode.length; i++) {
    hash = (hash << 5) - hash + courseCode.charCodeAt(i);
  }
  return COLOR_CLASSES[Math.abs(hash) % COLOR_CLASSES.length];
}

export default function TimetableGrid({
  schedules = [],
  isAdmin = false,
  onEdit = null,
  onDelete = null,
  onAdd = null
}) {
  // Group schedules by day
  const schedulesByDay = DAYS.reduce((acc, day) => {
    acc[day] = schedules.filter((s) => s.day_of_week === day);
    return acc;
  }, {});

  return (
    <div className="glass-panel p-5">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30">
            <Calendar className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-white">
              Weekly Class Schedule & Timetable
            </h3>
            <p className="text-xs text-slate-400">
              Interactive Monday through Friday lecture & lab timeslots
            </p>
          </div>
        </div>

        {isAdmin && onAdd && (
          <button
            onClick={onAdd}
            className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Schedule Timeslot</span>
          </button>
        )}
      </div>

      {schedules.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">
          No class schedules published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {DAYS.map((day) => {
            const dayList = schedulesByDay[day] || [];
            return (
              <div
                key={day}
                className="flex flex-col rounded-xl border border-slate-800/80 bg-slate-900/40 p-3"
              >
                <div className="mb-2.5 flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <span className="font-display text-xs font-semibold uppercase tracking-wider text-slate-300">
                    {day}
                  </span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
                    {dayList.length} class{dayList.length === 1 ? "" : "es"}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {dayList.length === 0 ? (
                    <div className="flex h-24 items-center justify-center text-center text-[11px] text-slate-600">
                      No classes
                    </div>
                  ) : (
                    dayList.map((slot) => {
                      const color = getCourseColor(slot.course_code);
                      return (
                        <div
                          key={slot.id}
                          className={`group relative rounded-lg border p-2.5 transition hover:shadow-glow ${color}`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono text-[11px] font-bold tracking-tight text-white truncate">
                              {slot.course_code}
                            </span>
                            <span className="flex items-center gap-1 font-mono text-[10px] opacity-85">
                              <Clock className="h-3 w-3" />
                              {slot.start_time} - {slot.end_time}
                            </span>
                          </div>

                          <p className="text-xs font-medium text-slate-100 line-clamp-1 mb-1.5">
                            {slot.course_name}
                          </p>

                          <div className="flex items-center justify-between text-[11px] opacity-80 pt-1 border-t border-white/10">
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{slot.room}</span>
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <User className="h-3 w-3 shrink-0" />
                              <span className="truncate">{slot.instructor_name}</span>
                            </span>
                          </div>

                          {isAdmin && (
                            <div className="absolute top-1.5 right-1.5 hidden gap-1 group-hover:flex bg-slate-950/90 rounded p-0.5 shadow-md">
                              {onEdit && (
                                <button
                                  onClick={() => onEdit(slot)}
                                  className="p-1 text-slate-300 hover:text-white"
                                  title="Edit slot"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  onClick={() => onDelete(slot)}
                                  className="p-1 text-rose-400 hover:text-rose-300"
                                  title="Delete slot"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
