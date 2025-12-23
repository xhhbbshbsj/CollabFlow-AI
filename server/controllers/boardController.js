import Board from "../models/Board.js";
import axios from "axios";

// Get all boards for the logged-in user
export const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Create a new board
export const createBoard = async (req, res) => {
  try {
    const { title } = req.body;
    const newBoard = await Board.create({
      user: req.user.id,
      title: title || "New Project",
    });
    res.json(newBoard);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update board state (for Drag and Drop)
export const updateBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const updatedBoard = await Board.findByIdAndUpdate(
      boardId,
      { ...req.body }, // Updates columns, tasks, and order
      { new: true }
    );
    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get a single board by ID
export const getBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.boardId, user: req.user.id });
    if (!board) return res.status(404).json({ message: "Board not found" });
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// --- NEW AI FUNCTION ---
export const generateTasksAI = async (req, res) => {
  try {
    const { boardId, topic } = req.body;

    // 1. Call Python AI Engine
    const aiResponse = await axios.post("http://127.0.0.1:8000/generate-tasks", {
      title: topic
    });

    const suggestedTasks = aiResponse.data.tasks;

    // 2. Find the board
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: "Board not found" });

    // 3. Add tasks to the first column (To-Do)
    const firstColId = board.columnOrder[0]; 

    suggestedTasks.forEach(taskContent => {
        const taskId = `task-${Date.now()}-${Math.random()}`;
        // Add task to the tasks object
        board.tasks[taskId] = { id: taskId, content: taskContent };
        // Add task ID to the column
        board.columns[firstColId].taskIds.push(taskId);
    });

    // 4. Save and return
    await board.save();
    res.json(board);

  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ message: "Failed to generate tasks. Is Python running?" });
  }
};


// Delete a Task
export const deleteTask = async (req, res) => {
  try {
    const { boardId, taskId } = req.params;
    const board = await Board.findById(boardId);

    if (!board) return res.status(404).json({ message: "Board not found" });

    // 1. Remove from the "tasks" object
    if (board.tasks && board.tasks[taskId]) {
      delete board.tasks[taskId];
    }

    // 2. Remove the ID from whichever column it is in
    Object.keys(board.columns).forEach((colId) => {
      board.columns[colId].taskIds = board.columns[colId].taskIds.filter(
        (id) => id !== taskId
      );
    });

    // 3. Save
    await board.save();
    res.json(board); // Return the clean board
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};