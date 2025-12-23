# 🚀 CollabFlow AI - Real-Time Smart Kanban Board

**CollabFlow AI** is a full-stack Project Management tool that combines **Real-Time Collaboration** (like Trello) with **Generative AI** (powered by Google Gemini).

Users can manage tasks with Drag & Drop, collaborate with team members instantly, and use the **"✨ AI Generate"** feature to automatically create project plans from a single topic.

## 🌟 Key Features

* **🧠 AI-Powered Planning:** Type a project name (e.g., "Launch Coffee Shop"), and the AI generates a complete task list using the **Google Gemini LLM**.
* **⚡ Real-Time Sync:** Uses **Socket.io** to sync board state across all users instantly. No refresh needed.
* **📋 Drag & Drop Interface:** Smooth Kanban board experience built with `@hello-pangea/dnd`.
* **🔐 Secure Auth:** Full User Registration & Login system using JWT (JSON Web Tokens).
* **🗑️ Smart Actions:** Create, Update, Move, and Delete tasks with optimistic UI updates.

## 🛠️ Tech Stack

### **Frontend**
* **React + Vite:** Fast, modern UI development.
* **Tailwind CSS:** For sleek, responsive styling.
* **Socket.io Client:** For real-time bi-directional communication.

### **Backend (Node.js)**
* **Express.js:** REST API to handle Users and Boards.
* **MongoDB Atlas:** Cloud NoSQL database for flexible data storage.
* **Socket.io:** Handling WebSocket connections for live sync.

### **AI Engine (Python)**
* **FastAPI:** High-performance API for the AI microservice.
* **Google Gemini API:** The Large Language Model (LLM) powering the task generation.

## 🚀 How to Run Locally

### 1. Clone the Repo
```bash
git clone [https://github.com/xhhbbshbsj/CollabFlow-AI.git](https://github.com/xhhbbshbsj/CollabFlow-AI.git)
cd CollabFlow-AI

2. Setup Server (Node.js)
cd server
npm install
# Create a .env file with: MONGO_URI, JWT_SECRET
npm start

3. Setup AI Engine (Python)
cd ai-engine
# Create a venv (optional) and install dependencies
pip install fastapi uvicorn google-generativeai
# Update API Key in main.py
uvicorn main:app --reload --port 8000

4. Start Client (React)
cd client
npm install
npm run dev

Built by Snehangshu Pal
