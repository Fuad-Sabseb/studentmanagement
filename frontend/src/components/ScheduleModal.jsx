import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Loader2, X, MapPin, User, BookOpen } from "lucide-react";
import { schedulesApi } from "../services/api.js";
import { useToast } from "./Toast.jsx";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export default function ScheduleModal({
  open,
  onClose,
  schedule = null,
  courses = [],
  onSuccess
}) {
  const toast = useToast();
  const [courseId, setCourseId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [startTime, setStartTime] = useState("08:30");
  const [endTime, setEndTime] = useState("10:00");
  const [room, setRoom] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(schedule && schedule.id);

  useEffect(() => {
    if (open) {
      if (schedule) {
        setCourseId(String(schedule.course_id || ""));
        setDayOfWeek(schedule.day_of_week || "Monday");
        setStartTime(schedule.start_time || "08:30");
        setEndTime(schedule.end_time || "10:00");
        setRoom(schedule.room || "");
        setInstructorName(schedule.instructor_name || "");
      } else {
        setCourseId(courses[0]?.id ? String(courses[0].id) : "");
        setDayOfWeek("Monday");
        setStartTime("08:30");
        setEndTime("10:00");
        setRoom("");
        setInstructorName("");
      }
      setError("");
    }
  }, [open, schedule, courses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId) {
      setError("Please select a course");
      return;
    }
    if (!room.trim()) {
      setError("Room or Lecture Hall is required (e.g. Hall 3B, Lab 102)");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = {
        course_id: Number(courseId),
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        room: room.trim(),
        instructor_name: instructorName.trim() || "Staff"
      };

      if (isEditing) {
        await schedulesApi.update(schedule.id, payload);
        toast.success("Schedule updated successfully!");
      } else {
        await schedulesApi.create(payload);
        toast.success("Class schedule added to timetable!");
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save class schedule");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="glass-panel w-full max-w-md p-6"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-slate-800/70 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    {isEditing ? "Edit Class Timeslot" : "Schedule Class Timeslot"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Add weekly lecture or lab session to timetable
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-rose-800/60 bg-rose-950/40 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Course
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="" disabled>-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">
                    Day of Week
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="input-field"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">
                    Room / Hall / Lab
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hall 3B or Lab 102"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Instructor Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. John Doe"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/70">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEditing ? "Save Changes" : "Add to Timetable"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
