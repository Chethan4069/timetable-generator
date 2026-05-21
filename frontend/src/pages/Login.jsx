import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import toast from "react-hot-toast";

export default function Login() {
    const [form, setForm] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post("/auth/login", form);
            login(res.data.user, res.data.access_token);
            toast.success("Welcome back!");
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.error || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">

                {/* Logo / Title */}
                <div className="text-center mb-8">
                    <div className="text-4xl mb-2">🗓️</div>
                    <h1 className="text-2xl font-bold text-white">Timetable Generator</h1>
                    <p className="text-gray-400 mt-1">Sign in to your admin account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-gray-300 text-sm font-medium block mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            placeholder="Enter your username"
                            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg
                         border border-gray-600 focus:outline-none
                         focus:border-blue-500 transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-gray-300 text-sm font-medium block mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="Enter your password"
                            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg
                         border border-gray-600 focus:outline-none
                         focus:border-blue-500 transition"
                            required
                        />
                        
                        <p className="text-center text-gray-400 text-sm mt-6">
                            Don't have an account?{" "}
                            <Link to="/register"
                                  className="text-blue-400 hover:text-blue-300
                                             font-medium transition">
                              Register here
                            </Link>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white
                       font-semibold py-3 rounded-lg transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}