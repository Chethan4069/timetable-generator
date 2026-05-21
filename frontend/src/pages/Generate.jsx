import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Generate() {
  const [classes,    setClasses]    = useState([]);
  const [selectedIds,setSelectedIds]= useState([]);
  const [loading,    setLoading]    = useState(false);
  const [jobId,      setJobId]      = useState(null);
  const [progress,   setProgress]   = useState(null);
  const [config,     setConfig]     = useState(null);
  const [configOk,   setConfigOk]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      API.get("/classes/"),
      API.get("/config/").catch(() => ({ data: null })),
    ]).then(([c, cfg]) => {
      setClasses(c.data.classes);
      if (cfg.data?.config) {
        setConfig(cfg.data.config);
        setConfigOk(true);
      }
    });
  }, []);

  const toggleClass = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  useEffect(() => {
    if (!jobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await API.get(`/generate/status/${jobId}`);
        setProgress(res.data);
        if (res.data.status === "completed") {
          clearInterval(interval);
          setLoading(false);
          toast.success("Timetable generated!");
          localStorage.setItem("timetable_result",
                                JSON.stringify(res.data.result));
          localStorage.setItem("timetable_class_ids",
                                JSON.stringify(selectedIds));
          navigate("/timetable");
        }
      } catch {
        clearInterval(interval);
        setLoading(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [jobId]);

  const handleGenerate = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one class");
      return;
    }
    setLoading(true);
    setProgress(null);
    try {
      const res = await API.post("/generate/", {
        class_ids: selectedIds
      });
      setJobId(res.data.job_id);
      toast(`Generating for ${res.data.sections} section(s)...`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
      setLoading(false);
    }
  };

  const totalGenerations = selectedIds.length * 100;
  const percent = progress
    ? Math.min(100, Math.round(
        (progress.generation / totalGenerations) * 100
      ))
    : 0;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Generate Timetable
        </h1>
        <p className="text-gray-400 mt-1">
          Select one or multiple sections — cross-section teacher
          conflicts handled automatically
        </p>
      </div>

      <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl">

        {/* Config warning */}
        {!configOk && (
          <div className="bg-red-900/40 border border-red-700
                          rounded-xl p-4 mb-6 flex gap-3">
            <span className="text-xl">❌</span>
            <div>
              <p className="text-red-300 font-semibold">
                Global Config not set!
              </p>
              <p className="text-red-400 text-sm mt-1">
                Go to{" "}
                <a href="/config"
                   className="underline text-red-300">
                  ⚙️ Config page
                </a>{" "}
                and save school settings before generating.
              </p>
            </div>
          </div>
        )}

        {/* Config preview */}
        {configOk && config && (
          <div className="bg-gray-700 rounded-xl p-4 mb-6">
            <p className="text-gray-300 text-sm font-medium mb-2">
              ⚙️ Current Config
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs
                            text-gray-400">
              <span>🕘 Start:{" "}
                <strong className="text-white">
                  {config.school_start_time}
                </strong>
              </span>
              <span>⏱️ Duration:{" "}
                <strong className="text-white">
                  {config.lecture_duration_mins} mins
                </strong>
              </span>
              <span>📚 Slots/day:{" "}
                <strong className="text-white">
                  {config.lectures_per_day}
                </strong>
              </span>
              <span>📅 Days:{" "}
                <strong className="text-white">
                  {(config.working_days || []).join(", ")}
                </strong>
              </span>
              <span>☕ Break after:{" "}
                <strong className="text-white">
                  Slot {config.break_after_lecture}
                </strong>
              </span>
              <span>⏰ Break:{" "}
                <strong className="text-white">
                  {config.break_duration_mins} mins
                </strong>
              </span>
            </div>
          </div>
        )}

        {/* Class selector */}
        <label className="text-gray-300 text-sm font-medium
                          block mb-3">
          Select Class(es)
        </label>

        <div className="space-y-3 mb-6">
          {classes.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No classes found. Add classes first.
            </p>
          ) : (
            classes.map(c => (
              <label key={c.id}
                className={`flex items-center gap-4 p-4 rounded-xl
                            border-2 cursor-pointer transition
                            ${selectedIds.includes(c.id)
                              ? "border-blue-500 bg-blue-900/20"
                              : "border-gray-600 bg-gray-700/30 hover:border-gray-500"}`}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(c.id)}
                  onChange={() => toggleClass(c.id)}
                  className="w-5 h-5 accent-blue-500"
                />
                <div>
                  <p className="text-white font-semibold">{c.name}</p>
                  <p className="text-gray-400 text-sm">
                    Semester {c.semester} — Section {c.section}
                  </p>
                </div>
                {selectedIds.includes(c.id) && (
                  <span className="ml-auto bg-blue-600 text-white
                                   text-xs px-2 py-1 rounded-full">
                    Selected
                  </span>
                )}
              </label>
            ))
          )}
        </div>

        {/* Cross section warning */}
        {selectedIds.length > 1 && (
          <div className="bg-amber-900/30 border border-amber-700
                          rounded-xl p-4 mb-6 flex gap-3">
            <span className="text-xl">⚠️</span>
            <p className="text-amber-200 text-sm">
              <strong>{selectedIds.length} sections selected.</strong>{" "}
              GA generates each section sequentially — earlier sections
              become constraints for later ones, preventing teacher
              double-booking across sections.
            </p>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !configOk}
          className="w-full bg-green-600 hover:bg-green-700
                     text-white font-bold py-4 rounded-xl text-lg
                     transition disabled:opacity-50
                     disabled:cursor-not-allowed">
          {loading
            ? `⚡ Generating ${selectedIds.length} section(s)...`
            : !configOk
              ? "⚙️ Set Config First"
              : "⚡ Generate Timetable"}
        </button>

        {/* Progress */}
        {progress && (
          <div className="mt-8">
            <div className="flex justify-between text-sm
                            text-gray-400 mb-2">
              <span>Progress</span>
              <span>Best fitness: {progress.best_fitness}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm mt-3 text-center">
              {progress.status === "completed"
                ? "✅ Done! Redirecting..."
                : "🔄 Evolving timetable..."}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}