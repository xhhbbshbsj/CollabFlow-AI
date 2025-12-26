import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Removed unused 'useNavigate'

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  // We removed 'const navigate = useNavigate()' because we aren't using it.

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://collabflow-ai-production-3494.up.railway.app/api/auth/login", formData);
      
      console.log("Login Success:", res.data);
      localStorage.setItem("token", res.data.token);
      alert("Login Successful!");
      
      // We use this instead of navigate('/') to force a real page reload
      window.location.href = "/"; 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Login to CollabFlow</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Don't have an account? <Link to="/register" className="text-blue-500">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;