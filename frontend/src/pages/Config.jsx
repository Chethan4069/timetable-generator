import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import toast from "react-hot-toast";

export default function Config() {
  const [form, setForm] = useState({
    school_start_time:     "09:00",
    lecture_duration_mins: 50,
    lectures_per_day:      6,
    break_after_lecture:   3,
    break_duration_mins:   15,
    working_days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  });
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved,    setSaved]    = useState(false);

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Load existing config on mount
  useEffect(() => {
    API.get("/config/")
      .then(res => {
        setForm(res.data.config);
        setSaved(true);
      })
      .catch(() => {
        // No config yet — defaults stay
      })
      .finally(() => setFetching(false));
  }, []);

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      working_days: prev.working_days.includes(day)
        ? prev.working_days.filter(d => d !== day)
        : [...prev.working_days, day]
    }));
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.working_days.length === 0) {
      toast.error("Select at least one working day");
      return;
    }
    setLoading(true);
    try {
      await API.post("/config/", form);
      toast.success("Configuration saved!");
      setSaved(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const inp = `w-full bg-gray-700 text-white px-4 py-3 rounded-lg
               border border-gray-600 focus:outline-none
               focus:border-blue-500`;

  if (fetching) {
    return (
      <Layout>
        <div className="text-gray-400 text-center mt-20 animate-pulse">
          Loading config...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Global Configuration
        </h1>
        <p className="text-gray-400 mt-1">
          School timing settings — used by the GA to build timeslots
        </p>
      </div>

      {/* Status banner */}
      {saved ? (
        <div className="bg-green-900/40 border border-green-700
                        rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <p className="text-green-300 font-medium">
            Configuration is set and ready for timetable generation.
          </p>
        </div>
      ) : (
        <div className="bg-amber-900/40 border border-amber-700
                        rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <p className="text-amber-300 font-medium">
            No configuration saved yet. Please fill and save below
            before generating timetables.
          </p>
        </div>
      )}

      <form onSubmit={handleSave}
            className="bg-gray-800 rounded-2xl p-8 max-w-2xl">

        {/* School start time */}
        <div className="mb-6">
          <label className="text-gray-300 text-sm font-medium block mb-2">
            🕘 School Start Time
          </label>
          <input
            type="time"
            value={form.school_start_time}
            onChange={(e) => {
              setForm({ ...form, school_start_time: e.target.value });
              setSaved(false);
            }}
            className={inp}
          />
          <p className="text-gray-500 text-xs mt-1">
            First lecture starts at this time
          </p>
        </div>

        {/* Lecture duration */}
        <div className="mb-6">
          <label className="text-gray-300 text-sm font-medium block mb-2">
            ⏱️ Lecture Duration (minutes)
          </label>
          <input
            type="number"
            min={30} max={120}
            value={form.lecture_duration_mins}
            onChange={(e) => {
              setForm({
                ...form,
                lecture_duration_mins: Number(e.target.value)
              });
              setSaved(false);
            }}
            className={inp}
          />
          <p className="text-gray-500 text-xs mt-1">
            How long each lecture slot is — usually 50 or 60 minutes
          </p>
        </div>

        {/* Lectures per day */}
        <div className="mb-6">
          <label className="text-gray-300 text-sm font-medium block mb-2">
            📚 Lectures Per Day
          </label>
          <input
            type="number"
            min={1} max={10}
            value={form.lectures_per_day}
            onChange={(e) => {
              setForm({
                ...form,
                lectures_per_day: Number(e.target.value)
              });
              setSaved(false);
            }}
            className={inp}
          />
          <p className="text-gray-500 text-xs mt-1">
            Total number of lecture slots per day
          </p>
        </div>

        {/* Break after lecture */}
        <div className="mb-6">
          <label className="text-gray-300 text-sm font-medium block mb-2">
            ☕ Break After Slot Number
          </label>
          <input
            type="number"
            min={1}
            max={form.lectures_per_day - 1}
            value={form.break_after_lecture}
            onChange={(e) => {
              setForm({
                ...form,
                break_after_lecture: Number(e.target.value)
              });
              setSaved(false);
            }}
            className={inp}
          />
          <p className="text-gray-500 text-xs mt-1">
            Break is inserted after this slot number — e.g. 3 means
            break after 3rd lecture
          </p>
        </div>

        {/* Break duration */}
        <div className="mb-6">
          <label className="text-gray-300 text-sm font-medium block mb-2">
            ⏰ Break Duration (minutes)
          </label>
          <input
            type="number"
            min={5} max={60}
            value={form.break_duration_mins}
            onChange={(e) => {
              setForm({
                ...form,
                break_duration_mins: Number(e.target.value)
              });
              setSaved(false);
            }}
            className={inp}
          />
        </div>

        {/* Working days */}
        <div className="mb-8">
          <label className="text-gray-300 text-sm font-medium block mb-3">
            📅 Working Days
          </label>
          <div className="flex gap-3 flex-wrap">
            {DAYS.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold
                            border-2 transition
                            ${form.working_days.includes(day)
                              ? "bg-blue-600 border-blue-500 text-white"
                              : "bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500"}`}>
                {day}
              </button>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Selected: {form.working_days.join(", ")}
          </p>
        </div>

        {/* Timeslot preview */}
        <div className="bg-gray-900 rounded-xl p-4 mb-8">
          <p className="text-gray-400 text-sm font-medium mb-3">
            📋 Generated Timeslots Preview
          </p>
          <div className="grid grid-cols-3 gap-2">
            {generatePreview(form).map((slot, i) => (
              <div key={i}
                   className="bg-gray-800 rounded-lg px-3 py-2
                              text-xs text-gray-300 text-center">
                <span className="text-blue-400 font-bold">
                  Slot {slot.slot_number}
                </span>
                <br />
                {slot.start_time} – {slot.end_time}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white
                     font-bold py-4 rounded-xl text-lg transition
                     disabled:opacity-50">
          {loading ? "Saving..." : "💾 Save Configuration"}
        </button>
      </form>
    </Layout>
  );
}

// ── Timeslot preview generator ────────────────────────────────────────────────
function generatePreview(config) {
  const slots  = [];
  const [h, m] = config.school_start_time.split(":").map(Number);
  let minutes  = h * 60 + m;

  for (let i = 0; i < config.lectures_per_day; i++) {
    const startH = Math.floor(minutes / 60);
    const startM = minutes % 60;
    minutes += config.lecture_duration_mins;
    const endH = Math.floor(minutes / 60);
    const endM = minutes % 60;

    slots.push({
      slot_number: i + 1,
      start_time:  `${String(startH).padStart(2,"0")}:${String(startM).padStart(2,"0")}`,
      end_time:    `${String(endH).padStart(2,"0")}:${String(endM).padStart(2,"0")}`,
    });

    // Add break after configured slot
    if (i + 1 === config.break_after_lecture) {
      minutes += config.break_duration_mins;
    }
  }
  return slots;
}