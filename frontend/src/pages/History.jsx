import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../api/api";
import toast from "react-hot-toast";

export default function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchHistory = async () => {
        try {
            const res = await API.get("/timetables/");
            setHistory(res.data.timetables);
        } catch {
            toast.error("Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    const handleView = async (item) => {
        try {
            const res = await API.get(`/timetables/${item.id}`);
            localStorage.setItem("timetable_result",
                JSON.stringify(res.data.timetable.genes));
            localStorage.setItem("timetable_class",
                String(res.data.timetable.class_id));
            navigate("/timetable");
        } catch {
            toast.error("Failed to load timetable");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this timetable from history?")) return;
        try {
            await API.delete(`/timetables/${id}`);
            toast.success("Deleted from history");
            fetchHistory();
        } catch {
            toast.error("Failed to delete");
        }
    };

    const getFitnessLabel = (score) => {
        if (score === 0) return { text: "Perfect", style: "bg-green-900 text-green-300" };
        if (score >= -100) return { text: "Good", style: "bg-blue-900 text-blue-300" };
        if (score >= -300) return { text: "Fair", style: "bg-amber-900 text-amber-300" };
        return { text: "Poor", style: "bg-red-900 text-red-300" };
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Timetable History</h1>
                <p className="text-gray-400 mt-1">
                    All previously generated timetables
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="text-gray-400 text-lg animate-pulse">
                        Loading history...
                    </div>
                </div>
            ) : history.length === 0 ? (
                <div className="bg-gray-800 rounded-2xl p-12 text-center">
                    <div className="text-5xl mb-4">📋</div>
                    <p className="text-gray-400 text-lg">No history yet.</p>
                    <p className="text-gray-500 mt-2">
                        Generate a timetable and click "Save to History".
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((item) => {
                        const badge = getFitnessLabel(item.fitness_score);
                        return (
                            <div key={item.id}
                                className="bg-gray-800 rounded-2xl p-6
                              flex items-center justify-between
                              hover:bg-gray-750 transition">

                                {/* Left info */}
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-blue-600 rounded-xl
                                  flex items-center justify-center
                                  text-white font-bold text-lg">
                                        #{item.id}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-lg">
                                            {item.class_name}
                                        </h3>
                                        <p className="text-gray-400 text-sm mt-0.5">
                                            Semester {item.semester}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            🕐 {item.created_at}
                                        </p>
                                    </div>
                                </div>

                                {/* Right — badge + buttons */}
                                <div className="flex items-center gap-4">
                                    {/* Fitness badge */}
                                    <div className="text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs
                                     font-semibold ${badge.style}`}>
                                            {badge.text}
                                        </span>
                                        <p className="text-gray-500 text-xs mt-1">
                                            Score: {item.fitness_score}
                                        </p>
                                    </div>

                                    {/* View button */}
                                    <button
                                        onClick={() => handleView(item)}
                                        className="bg-blue-600 hover:bg-blue-700
                               text-white font-medium px-5 py-2
                               rounded-lg text-sm transition"
                                    >
                                        👁 View
                                    </button>

                                    {/* Delete button */}
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="bg-red-900 hover:bg-red-800
                               text-red-300 font-medium px-5 py-2
                               rounded-lg text-sm transition"
                                    >
                                        🗑 Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Layout>
    );
}