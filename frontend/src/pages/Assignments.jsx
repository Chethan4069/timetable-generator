import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import toast from "react-hot-toast";

export default function Assignments() {
    const [assignments, setAssignments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [form, setForm] = useState({
        class_id: "", subject_id: "", teacher_id: "", priority: 1
    });

    const fetchAll = async () => {
        const [a, t, c, s] = await Promise.all([
            API.get("/assignments/"),
            API.get("/teachers/"),
            API.get("/classes/"),
            API.get("/subjects/"),
        ]);
        setAssignments(a.data.assignments);
        setTeachers(t.data.teachers);
        setClasses(c.data.classes);
        setSubjects(s.data.subjects);
    };

    useEffect(() => { fetchAll(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await API.post("/assignments/", {
                class_id: Number(form.class_id),
                subject_id: Number(form.subject_id),
                teacher_id: Number(form.teacher_id),
                priority: Number(form.priority),
            });
            toast.success("Assignment created!");
            setForm({ class_id: "", subject_id: "", teacher_id: "", priority: 1 });
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this assignment?")) return;
        await API.delete(`/assignments/${id}`);
        toast.success("Deleted");
        fetchAll();
    };

    const sel = "bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500";

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Assignments</h1>
                <p className="text-gray-400 mt-1">
                    Link subjects to classes and teachers
                </p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-white mb-4">
                    Create Assignment
                </h2>
                <form onSubmit={handleAdd}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select value={form.class_id}
                        onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                        className={sel} required>
                        <option value="">Select Class</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name} — Sem {c.semester}
                            </option>
                        ))}
                    </select>
                    <select value={form.subject_id}
                        onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                        className={sel} required>
                        <option value="">Select Subject</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    <select value={form.teacher_id}
                        onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                        className={sel} required>
                        <option value="">Select Teacher</option>
                        {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                    <input type="number" placeholder="Priority (1=high)"
                        value={form.priority} min={1} max={5}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        className={sel} />
                    <button type="submit"
                        className="md:col-span-4 bg-blue-600 hover:bg-blue-700
                       text-white font-semibold py-3 rounded-lg transition">
                        Create Assignment
                    </button>
                </form>
            </div>

            <div className="bg-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-700">
                        <tr>
                            {["ID", "Class", "Subject", "Teacher", "Priority", "Action"].map(h => (
                                <th key={h} className="text-left text-gray-300 text-sm
                                       font-semibold px-6 py-4">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {assignments.length === 0 ? (
                            <tr><td colSpan={6}
                                className="text-center text-gray-500 py-10">
                                No assignments yet.</td></tr>
                        ) : assignments.map((a) => (
                            <tr key={a.id} className="border-t border-gray-700">
                                <td className="px-6 py-4 text-gray-400">{a.id}</td>
                                <td className="px-6 py-4 text-white">{a.class_name}</td>
                                <td className="px-6 py-4 text-gray-300">{a.subject_name}</td>
                                <td className="px-6 py-4 text-gray-300">{a.teacher_name}</td>
                                <td className="px-6 py-4 text-gray-300">{a.priority}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleDelete(a.id)}
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