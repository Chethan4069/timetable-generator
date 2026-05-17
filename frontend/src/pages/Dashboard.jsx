import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";

function StatCard({ label, value, icon, color }) {
    return (
        <div className={`bg-gray-800 rounded-2xl p-6 border-l-4 ${color}`}>
            <div className="text-3xl mb-2">{icon}</div>
            <div className="text-3xl font-bold text-white">{value}</div>
            <div className="text-gray-400 mt-1">{label}</div>
        </div>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState({
        teachers: 0, classes: 0, subjects: 0, rooms: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [t, c, s, r] = await Promise.all([
                    API.get("/teachers/"),
                    API.get("/classes/"),
                    API.get("/subjects/"),
                    API.get("/rooms/"),
                ]);
                setStats({
                    teachers: t.data.teachers.length,
                    classes: c.data.classes.length,
                    subjects: s.data.subjects.length,
                    rooms: r.data.rooms.length,
                });
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 mt-1">
                    Overview of your timetable system
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Teachers" value={stats.teachers}
                    icon="👨‍🏫" color="border-blue-500" />
                <StatCard label="Classes" value={stats.classes}
                    icon="🏫" color="border-green-500" />
                <StatCard label="Subjects" value={stats.subjects}
                    icon="📚" color="border-purple-500" />
                <StatCard label="Rooms" value={stats.rooms}
                    icon="🚪" color="border-amber-500" />
            </div>

            <div className="mt-10 bg-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Quick Start Guide</h2>
                <div className="space-y-3">
                    {[
                        { step: "1", text: "Add Teachers", done: stats.teachers > 0 },
                        { step: "2", text: "Add Classes", done: stats.classes > 0 },
                        { step: "3", text: "Add Subjects", done: stats.subjects > 0 },
                        { step: "4", text: "Add Rooms", done: stats.rooms > 0 },
                        { step: "5", text: "Create Assignments", done: false },
                        { step: "6", text: "Generate Timetable ⚡", done: false },
                    ].map((item) => (
                        <div key={item.step}
                            className="flex items-center gap-4 p-3
                            bg-gray-700 rounded-lg">
                            <div className={`w-8 h-8 rounded-full flex items-center
                              justify-center text-sm font-bold
                              ${item.done
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-600 text-gray-300"}`}>
                                {item.done ? "✓" : item.step}
                            </div>
                            <span className={item.done ? "text-green-400" : "text-gray-300"}>
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}