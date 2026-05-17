import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import toast from "react-hot-toast";

export default function Teachers() {
    const [teachers, setTeachers] = useState([]);
    const [form, setForm] = useState({
        name: "", subject_expertise: "", max_hours_per_week: 20
    });
    const [loading, setLoading] = useState(false);

    const fetchTeachers = async () => {
        const res = await API.get("/teachers/");
        setTeachers(res.data.teachers);
    };

    useEffect(() => { fetchTeachers(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post("/teachers/", form);
            toast.success("Teacher added!");
            setForm({ name: "", subject_expertise: "", max_hours_per_week: 20 });
            fetchTeachers();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to add teacher");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this teacher?")) return;
        try {
            await API.delete(`/teachers/${id}`);
            toast.success("Teacher deleted");
            fetchTeachers();
        } catch {
            toast.error("Failed to delete");
        }
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Teachers</h1>
                <p className="text-gray-400 mt-1">Manage your teaching staff</p>
            </div>

            {/* Add Form */}
            <div className="bg-gray-800 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-white mb-4">Add Teacher</h2>
                <form onSubmit={handleAdd}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        placeholder="Full Name *"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="bg-gray-700 text-white px-4 py-3 rounded-lg
                       border border-gray-600 focus:outline-none
                       focus:border-blue-500"
                        required
                    />
                    <input
                        placeholder="Subject Expertise"
                        value={form.subject_expertise}
                        onChange={(e) => setForm({ ...form, subject_expertise: e.target.value })}
                        className="bg-gray-700 text-white px-4 py-3 rounded-lg
                       border border-gray-600 focus:outline-none
                       focus:border-blue-500"
                    />
                    <input
                        type="number"
                        placeholder="Max hours/week"
                        value={form.max_hours_per_week}
                        onChange={(e) => setForm({ ...form, max_hours_per_week: Number(e.target.value) })}
                        className="bg-gray-700 text-white px-4 py-3 rounded-lg
                       border border-gray-600 focus:outline-none
                       focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="md:col-span-3 bg-blue-600 hover:bg-blue-700
                       text-white font-semibold py-3 rounded-lg transition
                       disabled:opacity-50"
                    >
                        {loading ? "Adding..." : "Add Teacher"}
                    </button>
                </form>
            </div>

            {/* Teachers Table */}
            <div className="bg-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-700">
                        <tr>
                            {["ID", "Name", "Expertise", "Max Hrs/Week", "Action"].map(h => (
                                <th key={h}
                                    className="text-left text-gray-300 text-sm
                               font-semibold px-6 py-4">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.length === 0 ? (
                            <tr>
                                <td colSpan={5}
                                    className="text-center text-gray-500 py-10">
                                    No teachers yet. Add one above.
                                </td>
                            </tr>
                        ) : (
                            teachers.map((t) => (
                                <tr key={t.id}
                                    className="border-t border-gray-700
                               hover:bg-gray-750">
                                    <td className="px-6 py-4 text-gray-400">{t.id}</td>
                                    <td className="px-6 py-4 text-white font-medium">
                                        {t.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        {t.subject_expertise || "—"}
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        {t.max_hours_per_week}h
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            className="text-red-400 hover:text-red-300
                                 text-sm font-medium transition"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}