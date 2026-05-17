import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import toast from "react-hot-toast";

export default function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [form, setForm] = useState({
        name: "", code: "", credits_per_week: 3, subject_type: "theory"
    });

    const fetchSubjects = async () => {
        const res = await API.get("/subjects/");
        setSubjects(res.data.subjects);
    };

    useEffect(() => { fetchSubjects(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await API.post("/subjects/", form);
            toast.success("Subject added!");
            setForm({ name: "", code: "", credits_per_week: 3, subject_type: "theory" });
            fetchSubjects();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this subject?")) return;
        await API.delete(`/subjects/${id}`);
        toast.success("Deleted");
        fetchSubjects();
    };

    const typeColors = {
        theory: "bg-blue-900 text-blue-300",
        lab: "bg-amber-900 text-amber-300",
        elective: "bg-purple-900 text-purple-300",
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Subjects</h1>
                <p className="text-gray-400 mt-1">Manage subjects and credits</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-white mb-4">Add Subject</h2>
                <form onSubmit={handleAdd}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input placeholder="Subject Name *" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="bg-gray-700 text-white px-4 py-3 rounded-lg
                       border border-gray-600 focus:outline-none
                       focus:border-blue-500" required />
                    <input placeholder="Code e.g. CS301 *" value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                        className="bg-gray-700 text-white px-4 py-3 rounded-lg
                       border border-gray-600 focus:outline-none
                       focus:border-blue-500" required />
                    <input type="number" placeholder="Credits/week" value={form.credits_per_week}
                        onChange={(e) => setForm({ ...form, credits_per_week: Number(e.target.value) })}
                        className="bg-gray-700 text-white px-4 py-3 rounded-lg
                       border border-gray-600 focus:outline-none
                       focus:border-blue-500" />
                    <select value={form.subject_type}
                        onChange={(e) => setForm({ ...form, subject_type: e.target.value })}
                        className="bg-gray-700 text-white px-4 py-3 rounded-lg
                       border border-gray-600 focus:outline-none
                       focus:border-blue-500">
                        <option value="theory">Theory</option>
                        <option value="lab">Lab</option>
                        <option value="elective">Elective</option>
                    </select>
                    <button type="submit"
                        className="md:col-span-4 bg-blue-600 hover:bg-blue-700
                       text-white font-semibold py-3 rounded-lg transition">
                        Add Subject
                    </button>
                </form>
            </div>

            <div className="bg-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-700">
                        <tr>
                            {["ID", "Name", "Code", "Credits/Week", "Type", "Action"].map(h => (
                                <th key={h} className="text-left text-gray-300 text-sm
                                       font-semibold px-6 py-4">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.length === 0 ? (
                            <tr><td colSpan={6}
                                className="text-center text-gray-500 py-10">
                                No subjects yet.</td></tr>
                        ) : subjects.map((s) => (
                            <tr key={s.id} className="border-t border-gray-700">
                                <td className="px-6 py-4 text-gray-400">{s.id}</td>
                                <td className="px-6 py-4 text-white font-medium">{s.name}</td>
                                <td className="px-6 py-4 text-gray-300">{s.code}</td>
                                <td className="px-6 py-4 text-gray-300">{s.credits_per_week}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                                   ${typeColors[s.subject_type]}`}>
                                        {s.subject_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleDelete(s.id)}
                                        className="text-red-400 hover:text-red-300
                               text-sm font-medium">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}