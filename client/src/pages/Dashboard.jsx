import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [newBoardTitle, setNewBoardTitle] = useState("");

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://collabflow-ai-production-3494.up.railway.app//api/boards", {
          headers: { Authorization: token },
        });
        setBoards(res.data);
      } catch (error) {
        console.error("Error fetching boards:", error);
      }
    };

    fetchBoards();
  }, []);

  const createBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://collabflow-ai-production-3494.up.railway.app//api/boards",
        { title: newBoardTitle },
        { headers: { Authorization: token } }
      );
      
      setBoards([res.data, ...boards]); 
      setNewBoardTitle("");
    } catch (err) { // Renamed to 'err' and logging it to fix the warning
      console.error(err); 
      alert("Failed to create board");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Your Projects</h1>
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login"; 
            }}
            className="text-red-500 hover:text-red-700 font-semibold"
          >
            Logout
          </button>
        </div>

        {/* Create Board Form */}
        <form onSubmit={createBoard} className="mb-10 flex gap-4 bg-white p-4 rounded-lg shadow-sm">
          <input
            type="text"
            placeholder="Enter Project Name (e.g., Website Redesign)"
            className="p-3 rounded border border-gray-300 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            required
          />
          <button className="bg-blue-600 text-white px-8 py-3 rounded font-bold shadow hover:bg-blue-700 transition">
            + Create Board
          </button>
        </form>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {boards.map((board) => (
            <Link
              to={`/board/${board._id}`}
              key={board._id}
              className="block bg-white h-40 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 border-l-8 border-blue-500 flex flex-col justify-center"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{board.title}</h2>
              <p className="text-gray-400 text-sm">
                Created: {new Date(board.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
          
          {boards.length === 0 && (
            <div className="col-span-3 text-center text-gray-400 py-10">
              No projects yet. Create one above! 👆
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;