import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { io } from "socket.io-client";

const Board = () => {
  const { boardId } = useParams();
  const [boardData, setBoardData] = useState(null);
  const [newTask, setNewTask] = useState("");
  const [isSyncActive, setIsSyncActive] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const socketRef = useRef();

  // --- Socket Logic ---
  useEffect(() => {
    if (!isSyncActive) {
      if (socketRef.current) socketRef.current.disconnect();
      return; 
    }
    
    socketRef.current = io("https://collabflow-ai-production-3494.up.railway.app/");
    socketRef.current.emit("joinBoard", boardId);
    
    socketRef.current.on("boardUpdated", (newBoardData) => {
      if (isSyncActive) setBoardData(newBoardData);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [boardId, isSyncActive]);

  // --- Fetch Board Data ---
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`https://collabflow-ai-production-3494.up.railway.app/api/boards/${boardId}`, {
          headers: { Authorization: token },
        });
        setBoardData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBoard();
  }, [boardId]);

  // --- Drag & Drop Logic ---
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newBoard = JSON.parse(JSON.stringify(boardData));
    const sourceCol = newBoard.columns[source.droppableId];
    const sourceTaskIds = Array.from(sourceCol.taskIds);
    sourceTaskIds.splice(source.index, 1);
    
    const destCol = newBoard.columns[destination.droppableId];
    const destTaskIds = source.droppableId === destination.droppableId ? sourceTaskIds : Array.from(destCol.taskIds);
      
    if (source.droppableId !== destination.droppableId) {
      destTaskIds.splice(destination.index, 0, draggableId);
      newBoard.columns[destination.droppableId].taskIds = destTaskIds;
    } else {
      sourceTaskIds.splice(destination.index, 0, draggableId);
    }
    newBoard.columns[source.droppableId].taskIds = sourceTaskIds;

    setBoardData(newBoard);

    if (isSyncActive && socketRef.current) {
        socketRef.current.emit("updateBoard", { boardId, boardData: newBoard });
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://collabflow-ai-production-3494.up.railway.app/api/boards/${boardId}`, newBoard, {
        headers: { Authorization: token },
      });
    } catch (err) {
      console.error("Failed to save board state", err);
    }
  };

  // --- Add Task ---
  const addTask = async (columnId) => {
    if (!newTask) return;
    const newBoard = JSON.parse(JSON.stringify(boardData));
    if (!newBoard.tasks) newBoard.tasks = {};

    const taskId = `task-${Date.now()}`; 
    const newTaskObj = { id: taskId, content: newTask };

    newBoard.tasks[taskId] = newTaskObj;
    newBoard.columns[columnId].taskIds.push(taskId);

    setBoardData(newBoard);
    setNewTask("");

    if (isSyncActive && socketRef.current) {
        socketRef.current.emit("updateBoard", { boardId, boardData: newBoard });
    }

    try {
        const token = localStorage.getItem("token");
        await axios.put(`https://collabflow-ai-production-3494.up.railway.app/api/boards/${boardId}`, newBoard, {
          headers: { Authorization: token },
        });
    } catch (err) {
        console.error("Save failed:", err);
    }
  };

  // --- AI Generate ---
  const generateAITasks = async () => {
    if (!newTask) return alert("Please type a topic first (e.g., 'Coffee Shop App')");
    
    setIsGenerating(true);
    try {
        const token = localStorage.getItem("token");
        const res = await axios.post("https://collabflow-ai-production-3494.up.railway.app/api/boards/generate-ai", 
            { boardId, topic: newTask },
            { headers: { Authorization: token } }
        );

        setBoardData(res.data); 
        setNewTask(""); 
        
        if (isSyncActive && socketRef.current) {
            socketRef.current.emit("updateBoard", { boardId, boardData: res.data });
        }
        alert("✨ AI successfully generated tasks!");
    } catch (err) {
        console.error(err); // <--- FIXED: Now we use the 'err' variable
        alert("AI Generation failed. Is the Python backend running?");
    } finally {
        setIsGenerating(false);
    }
  };

  // --- Delete Task ---
  const handleDeleteTask = async (taskId) => {
    if(!window.confirm("Are you sure you want to delete this task?")) return;

    const newBoard = JSON.parse(JSON.stringify(boardData));
    
    // Optimistically remove
    if (newBoard.tasks[taskId]) delete newBoard.tasks[taskId];
    
    Object.keys(newBoard.columns).forEach(colId => {
        newBoard.columns[colId].taskIds = newBoard.columns[colId].taskIds.filter(id => id !== taskId);
    });

    setBoardData(newBoard);

    if (isSyncActive && socketRef.current) {
        socketRef.current.emit("updateBoard", { boardId, boardData: newBoard });
    }

    try {
        const token = localStorage.getItem("token");
        await axios.delete(`https://collabflow-ai-production-3494.up.railway.app/api/boards/${boardId}/tasks/${taskId}`, {
            headers: { Authorization: token }
        });
    } catch (err) {
        console.error("Failed to delete", err);
    }
  };

  if (!boardData) return <div className="text-center mt-20">Loading Board...</div>;

  return (
    <div className="min-h-screen bg-blue-50 p-10 flex flex-col items-center">
      <div className="w-full max-w-5xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{boardData.title}</h1>
        
        {/* Sync Toggle */}
        <button 
            onClick={() => setIsSyncActive(!isSyncActive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all shadow-md ${
                isSyncActive 
                ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200" 
                : "bg-gray-200 text-gray-600 border border-gray-300 hover:bg-gray-300"
            }`}
        >
            <span className={`h-3 w-3 rounded-full ${isSyncActive ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}></span>
            {isSyncActive ? "Live Sync Active" : "Sync Paused"}
        </button>
      </div>
      
      <div className="mb-8 flex gap-2">
        <input 
          className="p-2 border rounded w-64 shadow-sm"
          placeholder="Type task or AI Topic..." 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button 
           onClick={() => addTask("col-1")} 
           className="bg-green-500 text-white px-4 py-2 rounded font-bold shadow hover:bg-green-600 transition"
        >
          Add Task
        </button>
        
        {/* AI Button */}
        <button 
           onClick={generateAITasks} 
           disabled={isGenerating}
           className={`bg-purple-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-purple-700 transition flex items-center gap-2 ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isGenerating ? "Thinking..." : "✨ AI Generate"}
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-8 items-start flex-wrap justify-center">
          {boardData.columnOrder.map((columnId) => {
            const column = boardData.columns[columnId];
            const tasks = column.taskIds.map((taskId) => boardData.tasks?.[taskId]).filter(Boolean);

            return (
              <div key={column.id} className="bg-gray-100 p-4 rounded-lg w-80 shadow-md min-h-[300px]">
                <h3 className="font-bold text-lg mb-4 text-gray-700 uppercase tracking-wide">
                  {column.title}
                </h3>
                
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex flex-col gap-3 min-h-[100px]"
                    >
                      {tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-4 rounded shadow-sm text-gray-800 border hover:border-blue-400 cursor-grab flex justify-between items-center group"
                            >
                              <span>{task.content}</span>
                              {/* Delete Button (Visible on Hover) */}
                              <button 
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-gray-300 hover:text-red-500 font-bold px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Task"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board;