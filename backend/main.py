from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chat_service import ask_about_medicine

app = FastAPI(title="PharmAgent AI Medicine Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    medicine_name: str
    question: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/chat")
def chat(request: ChatRequest):
    return ask_about_medicine(request.question, request.medicine_name)