import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import toast from "react-hot-toast";

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [form, setForm] = useState({
        name: "", capacity: 30, room_type: "classroom"
    });

    const fetchRooms = async () => {
        const res = await API.get("/rooms/");
        setRooms(res.data.rooms);
    };

    useEffect(() => { fetchRooms(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await API.post("/rooms/", form);
            toast.success("Room added!");
            setForm({ name: "", capacity: 30, room_type: "classroom" });
            fetchRooms();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this room?")) return;
        await API.delete(`/rooms/${id}`);
        toast.success("Deleted");
        fetchRooms();
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Rooms</h1>
                <p className="text-gray-400 mt-1">Manage classrooms and labs</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-white mb-4">Add Room</h2>
                <form onSubmit={handleAdd}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input placeholder="Room Name e.g. Room 101 *" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="bg-gray-700 text-white px-4 py-3 rounded-lg
                       border border-gray-600 focus:outline-none
                       focus:border-blue-500" required />
                    <input type="number" placeholder="Capacity" value={form.capacity}
                        onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                        className="bg-gray-700 text-white px-4 py-3 rounded-lg
                       border border-gray-600 focus:outline-none
                       focus:border-blue-500" />
                    <select value={form.room_type}
                        onChange={(e) => setForm({ ...form, room_type: e.target.value })}
                        className="bg-gray-700 text-white px-4 py-3 rounded-lg
                       border border-gray-600 focus:outline-none
                       focus:border-blue-500">
                        <option value="classroom">Classroom</option>
                        <option value="lab">Lab</option>
                        <option value="auditorium">Auditorium</option>
                    </select>
                    <button type="submit"
                        className="md:col-span-3 bg-blue-600 hover:bg-blue-700
                       text-white font-semibold py-3 rounded-lg transition">
                        Add Room
                    </button>
                </form>
            </div>

            <div className="bg-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-700">
                        <tr>
                            {["ID", "Name", "Capacity", "Type", "Action"].map(h => (
                                <th key={h} className="text-left text-gray-300 text-sm
                                       font-semibold px-6 py-4">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.length === 0 ? (
                            <tr><td colSpan={5}
                                className="text-center text-gray-500 py-10">
                                No rooms yet.</td></tr>
                        ) : rooms.map((r) => (
                            <tr key={r.id} className="border-t border-gray-700">
                                <td className="px-6 py-4 text-gray-400">{r.id}</td>
                                <td className="px-6 py-4 text-white font-medium">{r.name}</td>
                                <td className="px-6 py-4 text-gray-300">{r.capacity}</td>
                                <td className="px-6 py-4 text-gray-300 capitalize">{r.room_type}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleDelete(r.id)}
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