import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  // We store the Kanban state as a flexible Object
  // This matches exactly what the Drag-n-Drop library needs
  columns: {
    type: Object,
    default: {
      "col-1": { id: "col-1", title: "To Do", taskIds: [] },
      "col-2": { id: "col-2", title: "In Progress", taskIds: [] },
      "col-3": { id: "col-3", title: "Done", taskIds: [] },
    },
  },
  columnOrder: {
    type: Array,
    default: ["col-1", "col-2", "col-3"],
  },
  tasks: {
    type: Object,
    default: {}, // Tasks will be added here dynamically
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Board", boardSchema);