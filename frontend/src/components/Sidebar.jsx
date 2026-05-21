import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// Admin sees everything
const adminLinks = [
  { to: "/dashboard",   label: "Dashboard",   icon: "🏠" },
  { to: "/config",      label: "Config",       icon: "⚙️" },
  { to: "/teachers",    label: "Teachers",     icon: "👨‍🏫" },
  { to: "/classes",     label: "Classes",      icon: "🏫" },
  { to: "/subjects",    label: "Subjects",     icon: "📚" },
  { to: "/rooms",       label: "Rooms",        icon: "🚪" },
  { to: "/assignments", label: "Assignments",  icon: "🔗" },
  { to: "/electives",   label: "Electives",    icon: "🔀" },
  { to: "/generate",    label: "Generate",     icon: "⚡" },
  { to: "/timetable",   label: "Timetable",    icon: "🗓️" },
  { to: "/history",     label: "History",      icon: "📋" },
];

// Viewer sees only these
const viewerLinks = [
  { to: "/timetable",   label: "Timetable",    icon: "🗓️" },
  { to: "/history",     label: "History",      icon: "📋" },
];

export default function Sidebar() {
  const { logout, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const links = isAdmin ? adminLinks : viewerLinks;

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className="w-64 bg-gray-900 min-h-screen flex flex-col
                    border-r border-gray-700">

      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="text-2xl font-bold text-white">
          🗓️ TimetableAI
        </div>
        <div className="text-gray-400 text-sm mt-1">
          {user?.username}
        </div>
        {/* Role badge */}
        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full
                         text-xs font-semibold
                         ${isAdmin
                           ? "bg-blue-900 text-blue-300"
                           : "bg-gray-700 text-gray-400"}`}>
          {isAdmin ? "👑 Admin" : "👁️ Viewer"}
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg
               text-sm font-medium transition
               ${isActive
                 ? "bg-blue-600 text-white"
                 : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
            }
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3
                     rounded-lg text-gray-400 hover:bg-red-900
                     hover:text-red-300 text-sm font-medium transition">
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}