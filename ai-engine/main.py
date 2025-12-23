from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
import os

# --- CONFIGURATION ---
# 🔴 PASTE YOUR API KEY BELOW (Keep the quotes!)
GOOGLE_API_KEY = "AIzaSyCqp3gJ62itPq-p2f_UIbYsiqi6UnB09Dc"

# Configure the AI Model
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

app = FastAPI()

class ProjectRequest(BaseModel):
    title: str

@app.get("/")
def read_root():
    return {"status": "Gemini AI Engine is Running"}

@app.post("/generate-tasks")
def generate_tasks(project: ProjectRequest):
    """
    Uses Google Gemini to generate 5-6 real project tasks.
    """
    try:
        topic = project.title
        print(f"🧠 Thinking about: {topic}...")

        # Prompt Engineering: We tell the AI exactly what we want
        prompt = (
            f"I am building a project management board for: '{topic}'. "
            "Generate a list of 5 to 6 specific, actionable short tasks (under 6 words each) "
            "that are required to complete this project. "
            "Return ONLY the tasks separated by commas. Do not include numbers or bullet points."
            "Example output: Design UI, Setup Database, Create API, Testing"
        )

        response = model.generate_content(prompt)
        raw_text = response.text

        # Clean up the response (split by comma and remove whitespace)
        tasks = [task.strip() for task in raw_text.split(",") if task.strip()]
        
        # Limit to first 6 tasks just in case
        return {"tasks": tasks[:6]}

    except Exception as e:
        print(f"Error: {e}")
        # Fallback if AI fails (e.g., internet issue)
        return {"tasks": ["Define Scope", "Research Competitors", "Draft Requirements", "Initial Setup"]}

# Run with: uvicorn main:app --reload --port 8000