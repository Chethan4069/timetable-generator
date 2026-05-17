import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import Rooms from "./pages/Rooms";
import Assignments from "./pages/Assignments";
import Generate from "./pages/Generate";
import Timetable from "./pages/Timetable";
import History from "./pages/History";
import Electives from "./pages/Electives";


// Protect all routes — redirect to login if not authenticated
function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />

          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/teachers" element={
            <PrivateRoute><Teachers /></PrivateRoute>} />
          <Route path="/classes" element={
            <PrivateRoute><Classes /></PrivateRoute>} />
          <Route path="/subjects" element={
            <PrivateRoute><Subjects /></PrivateRoute>} />
          <Route path="/rooms" element={
            <PrivateRoute><Rooms /></PrivateRoute>} />
          <Route path="/assignments" element={
            <PrivateRoute><Assignments /></PrivateRoute>} />
          <Route path="/generate" element={
            <PrivateRoute><Generate /></PrivateRoute>} />
          <Route path="/timetable" element={
            <PrivateRoute><Timetable /></PrivateRoute>} />
          <Route path="/history" element={
            <PrivateRoute><History /></PrivateRoute>} />
          <Route path="/electives" element={
            <PrivateRoute><Electives /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}