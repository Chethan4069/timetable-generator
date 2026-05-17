import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import toast from "react-hot-toast";

export default function Electives() {
    const [pairs, setPairs] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [form, setForm] = useState({
        subject1_id: "", subject2_id: "", label: ""
    });

    const fetchAll = async () => {
        const [p, s] = await Promise.all([
            API.get("/electives/"),
            API.get("/subjects/"),
        ]);
        setPairs(p.data.elective_pairs);
        setSubjects(s.data.subjects);
    };

    useEffect(() => { fetchAll(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (form.subject1_id === form.subject2_id) {
            toast.error("Select two different subjects");
            return;
        }
        try {
            await API.post("/electives/", {
                subject1_id: Number(form.subject1_id),
                subject2_id: Number(form.subject2_id),
                label: form.label,
            });
            toast.success("Elective pair created!");
            setForm({ subject1_id: "", subject2_id: "", label: "" });
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this elective pair?")) return;
        await API.delete(`/electives/${id}`);
        toast.success("Deleted");
        fetchAll();
    };

    const sel = `bg-gray-700 text-white px-4 py-3 rounded-lg
               border border-gray-600 focus:outline-none
               focus:border-blue-500`;

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">
                    Elective Subjects
                </h1>
                <p className="text-gray-400 mt-1">
                    Pair elective subjects that must run at the same time slot
                    — e.g. CC and HCA shown as <span className="text-purple-400
          font-semibold">CC / HCA</span>
                </p>
            </div>

            {/* Info card */}
            <div className="bg-purple-900/30 border border-purple-700
                      rounded-xl p-4 mb-8 flex gap-3">
                <span className="text-2xl">💡</span>
                <div>
                    <p className="text-purple-200 font-semibold">
                        How elective pairs work
                    </p>
                    <p className="text-purple-300 text-sm mt-1">
                        When you pair CC and HCA, the GA forces both subjects
                        to the same day and slot in the timetable. Students who
                        picked CC go to one room, HCA students go to another.
                        The timetable grid shows them as <strong>CC / HCA</strong>.
                    </p>
                </div>
            </div>

            {/* Add form */}
            <div className="bg-gray-800 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-white mb-4">
                    Create Elective Pair
                </h2>
                <form onSubmit={handleAdd}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">
                            Subject 1 (e.g. Cloud Computing)
                        </label>
                        <select value={form.subject1_id}
                            onChange={(e) => setForm({
                                ...form,
                                subject1_id: e.target.value,
                                label: `${subjects.find(s => s.id === Number(e.target.value))?.name || ""} / ${subjects.find(s => s.id === Number(form.subject2_id))?.name || ""}`.trim().replace(/^\/\s*|\s*\/$/g, "")
                            })}
                            className={sel} required>
                            <option value="">Select Subject 1</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-gray-400 text-sm block mb-1">
                            Subject 2 (e.g. Human Centered AI)
                        </label>
                        <select value={form.subject2_id}
                            onChange={(e) => setForm({
                                ...form,
                                subject2_id: e.target.value,
                                label: `${subjects.find(s => s.id === Number(form.subject1_id))?.name || ""} / ${subjects.find(s => s.id === Number(e.target.value))?.name || ""}`.trim().replace(/^\/\s*|\s*\/$/g, "")
                            })}
                            className={sel} required>
                            <option value="">Select Subject 2</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-gray-400 text-sm block mb-1">
                            Display Label (auto-filled)
                        </label>
                        <input
                            value={form.label}
                            onChange={(e) => setForm({ ...form, label: e.target.value })}
                            placeholder="e.g. CC / HCA"
                            className={sel} required
                        />
                    </div>

                    <button type="submit"
                        className="md:col-span-3 bg-purple-600 hover:bg-purple-700
                       text-white font-semibold py-3 rounded-lg transition">
                        Create Elective Pair
                    </button>
                </form>
            </div>

            {/* Pairs list */}
            {pairs.length === 0 ? (
                <div className="bg-gray-800 rounded-2xl p-10 text-center">
                    <div className="text-4xl mb-3">🔀</div>
                    <p className="text-gray-400">No elective pairs yet.</p>
                    <p className="text-gray-500 text-sm mt-1">
                        Add pairs above to handle CC/HCA type subjects.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pairs.map(pair => (
                        <div key={pair.id}
                            className="bg-gray-800 rounded-2xl p-6
                            flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="bg-purple-900 rounded-xl p-3">
                                    <span className="text-2xl">🔀</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-blue-900 text-blue-300
                                     px-3 py-1 rounded-full text-sm
                                     font-medium">
                                            {pair.subject1_name}
                                        </span>
                                        <span className="text-gray-500">↔</span>
                                        <span className="bg-green-900 text-green-300
                                     px-3 py-1 rounded-full text-sm
                                     font-medium">
                                            {pair.subject2_name}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Shown in timetable as:
                                        <span className="text-purple-300 font-bold ml-1">
                                            {pair.label}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(pair.id)}
                                className="bg-red-900 hover:bg-red-800 text-red-300
                           px-5 py-2 rounded-lg text-sm transition">
                                🗑 Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}