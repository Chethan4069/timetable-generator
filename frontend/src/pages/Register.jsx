import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirm:  "",
    role:     "admin",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/register", {
        username: form.username,
        password: form.password,
        role:     form.role,
      });
      toast.success("Registered successfully! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inp = `w-full bg-gray-700 text-white px-4 py-3 rounded-lg
               border border-gray-600 focus:outline-none
               focus:border-blue-500 transition`;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center
                    justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl
                      w-full max-w-md border border-gray-700">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🗓️</div>
          <h1 className="text-2xl font-bold text-white">
            Create Admin Account
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Register to manage the timetable system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Username */}
          <div>
            <label className="text-gray-300 text-sm
                              font-medium block mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              value={form.username}
              onChange={(e) => setForm({
                ...form, username: e.target.value
              })}
              className={inp}
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-gray-300 text-sm
                              font-medium block mb-1">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({
                ...form, role: e.target.value
              })}
              className={inp}>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-300 text-sm
                              font-medium block mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => setForm({
                ...form, password: e.target.value
              })}
              className={inp}
              required
            />
          </div>

          {/* Confirm password */}
          <div>
            <label className="text-gray-300 text-sm
                              font-medium block mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={form.confirm}
              onChange={(e) => setForm({
                ...form, confirm: e.target.value
              })}
              className={inp}
              required
            />
            {/* Live match indicator */}
            {form.confirm && (
              <p className={`text-xs mt-1 ${
                form.password === form.confirm
                  ? "text-green-400"
                  : "text-red-400"
              }`}>
                {form.password === form.confirm
                  ? "✅ Passwords match"
                  : "❌ Passwords do not match"}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700
                       text-white font-semibold py-3 rounded-lg
                       transition disabled:opacity-50
                       disabled:cursor-not-allowed">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Link to login */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login"
                className="text-blue-400 hover:text-blue-300
                           font-medium transition">
            Sign in here
          </Link>
        </p>

      </div>
    </div>
  );
}