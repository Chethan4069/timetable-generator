import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import toast from "react-hot-toast";

export default function Classes() {
    const [classes, setClasses] = useState([]);
    const [form, setForm] = useState({
        name: "", semester: 1, section: "A", student_count: 30
    });

    const fetchClasses = async () => {
        const res = await API.get("/classes/");
        setClasses(res.data.classes);
    };

    useEffect(() => { fetchClasses(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await API.post("/classes/", form);
            toast.success("Class added!");
            setForm({ name: "", semester: 1, section: "A", student_count: 30 });
            fetchClasses();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this class?")) return;
        await API.delete(`/classes/${id}`);
        toast.success("Deleted");
        fetchClasses();
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Classes</h1>
                <p className="text-gray-400 mt-1">Manage classes and semesters</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-white mb-4">Add Class</h2>
                <form onSubmit={handleAdd}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input placeholder="Class Name *" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="bg-gray-700 text-white px-4 py-3 rounded-lg
                       border border-gray-600 focus:outline-none
                       focus:border-blue-500"
                        required />
                    <input type="number" placeholder="Semester" value={form.semester}
                        onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                        className="bg-gray-700 text-white px-4 py-3 rounded-lg
                       border border-gray-600 focus:outline-none
                       focus:border-blue-500" />
                    <input placeholder="Section" value={form.section}
                        onChange={(e) => setForm({ ...form, section: e.target.value })}
                        className="bg-gray-700 text-white px-4 py-3 rounded-lg
                       border border-gray-600 focus:outline-none
                       focus:border-blue-500" />
                    <input type="number" placeholder="Student count" value={form.student_count}
                        onChange={(e) => setForm({ ...form, student_count: Number(e.target.value) })}
                        className="bg-gray-700 text-white px-4 py-3 rounded-lg
                       border border-gray-600 focus:outline-none
                       focus:border-blue-500" />
                    <button type="submit"
                        className="md:col-span-4 bg-blue-600 hover:bg-blue-700
                       text-white font-semibold py-3 rounded-lg transition">
                        Add Class
                    </button>
                </form>
            </div>

            <div className="bg-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-700">
                        <tr>
                            {["ID", "Name", "Semester", "Section", "Students", "Action"].map(h => (
                                <th key={h} className="text-left text-gray-300 text-sm
                                       font-semibold px-6 py-4">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {classes.length === 0 ? (
                            <tr><td colSpan={6}
                                className="text-center text-gray-500 py-10">
                                No classes yet.</td></tr>
                        ) : classes.map((c) => (
                            <tr key={c.id} className="border-t border-gray-700">
                                <td className="px-6 py-4 text-gray-400">{c.id}</td>
                                <td className="px-6 py-4 text-white font-medium">{c.name}</td>
                                <td className="px-6 py-4 text-gray-300">Sem {c.semester}</td>
                                <td className="px-6 py-4 text-gray-300">{c.section}</td>
                                <td className="px-6 py-4 text-gray-300">{c.student_count}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleDelete(c.id)}
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