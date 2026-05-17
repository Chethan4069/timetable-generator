import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Generate() {
    const [classes, setClasses] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [jobId, setJobId] = useState(null);
    const [progress, setProgress] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        API.get("/classes/").then(r => setClasses(r.data.classes));
    }, []);

    const toggleClass = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    // Poll status
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

                    // Store result — multi-section comes as { class_id: genes }
                    const result = res.data.result;
                    localStorage.setItem("timetable_result",
                        JSON.stringify(result));
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
        ? Math.min(100, Math.round((progress.generation / totalGenerations) * 100))
        : 0;

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">
                    Generate Timetable
                </h1>
                <p className="text-gray-400 mt-1">
                    Select one or multiple sections — cross-section teacher
                    conflicts are handled automatically
                </p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl">

                {/* Class selector */}
                <label className="text-gray-300 text-sm font-medium block mb-3">
                    Select Class(es) — tick multiple for cross-section scheduling
                </label>

                <div className="space-y-3 mb-6">
                    {classes.map(c => (
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
                    ))}
                </div>

                {/* Cross-section info */}
                {selectedIds.length > 1 && (
                    <div className="bg-amber-900/30 border border-amber-700
                          rounded-xl p-4 mb-6 flex gap-3">
                        <span className="text-xl">⚠️</span>
                        <p className="text-amber-200 text-sm">
                            <strong>{selectedIds.length} sections selected.</strong> The
                            GA will generate each section sequentially — earlier sections
                            become constraints for later ones, preventing teacher
                            double-booking across sections.
                        </p>
                    </div>
                )}

                {/* Generate button */}
                <button onClick={handleGenerate} disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700
                     text-white font-bold py-4 rounded-xl text-lg
                     transition disabled:opacity-50
                     disabled:cursor-not-allowed">
                    {loading
                        ? `⚡ Generating ${selectedIds.length} section(s)...`
                        : `⚡ Generate Timetable`}
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
                            <div className="bg-green-500 h-4 rounded-full transition-all"
                                style={{ width: `${percent}%` }} />
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