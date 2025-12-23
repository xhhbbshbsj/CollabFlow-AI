import express from "express";
import { 
  getBoards, 
  createBoard, 
  updateBoard, 
  getBoard, 
  generateTasksAI, 
  deleteTask 
} from "../controllers/boardController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all boards for the user
router.get("/", auth, getBoards);

// Get a single board
router.get("/:boardId", auth, getBoard);

// Create a new board
router.post("/", auth, createBoard);

// Update a board (Drag & Drop)
router.put("/:boardId", auth, updateBoard);

// AI Task Generation
router.post("/generate-ai", auth, generateTasksAI);

// Delete a Task
router.delete("/:boardId/tasks/:taskId", auth, deleteTask);

export default router;