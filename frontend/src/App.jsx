import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login       from "./pages/Login";
import Register    from "./pages/Register";
import Dashboard   from "./pages/Dashboard";
import Config      from "./pages/Config";
import Teachers    from "./pages/Teachers";
import Classes     from "./pages/Classes";
import Subjects    from "./pages/Subjects";
import Rooms       from "./pages/Rooms";
import Assignments from "./pages/Assignments";
import Electives   from "./pages/Electives";
import Generate    from "./pages/Generate";
import Timetable   from "./pages/Timetable";
import History     from "./pages/History";

// Any logged in user
function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return null;   // wait for auth to load
  return token ? children : <Navigate to="/login" />;
}

// Admin only — viewer gets redirected to timetable
function AdminRoute({ children }) {
  const { token, isAdmin, loading } = useAuth();
  if (loading) return null;   // wait for auth to load
  if (!token)   return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/timetable" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>

          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/"         element={<Navigate to="/dashboard" />} />

          {/* Admin only routes */}
          <Route path="/dashboard" element={
            <AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/config" element={
            <AdminRoute><Config /></AdminRoute>} />
          <Route path="/teachers" element={
            <AdminRoute><Teachers /></AdminRoute>} />
          <Route path="/classes" element={
            <AdminRoute><Classes /></AdminRoute>} />
          <Route path="/subjects" element={
            <AdminRoute><Subjects /></AdminRoute>} />
          <Route path="/rooms" element={
            <AdminRoute><Rooms /></AdminRoute>} />
          <Route path="/assignments" element={
            <AdminRoute><Assignments /></AdminRoute>} />
          <Route path="/electives" element={
            <AdminRoute><Electives /></AdminRoute>} />
          <Route path="/generate" element={
            <AdminRoute><Generate /></AdminRoute>} />

          {/* Both admin and viewer */}
          <Route path="/timetable" element={
            <PrivateRoute><Timetable /></PrivateRoute>} />
          <Route path="/history" element={
            <PrivateRoute><History /></PrivateRoute>} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}