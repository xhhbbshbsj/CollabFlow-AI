import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";

// 1. The Home Page (Only visible if logged in)
const Home = () => {
  const handleLogout = () => {
    localStorage.removeItem("token"); // Delete the key
    window.location.reload(); // Refresh the page
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-4 text-blue-600">Welcome to CollabFlow! 🚀</h1>
      <p className="text-xl mb-8 text-gray-700">You are successfully authenticated.</p>
      <button 
        onClick={handleLogout}
        className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
};

// 2. The Security Guard (Checks if token exists)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  // If no token, kick them to Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* We wrap Home inside the Security Guard */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* ADD THIS NEW ROUTE BELOW */}
        <Route 
          path="/board/:boardId" 
          element={
            <ProtectedRoute>
              <Board />
            </ProtectedRoute>
          } 
        />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Any unknown link goes to Login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;