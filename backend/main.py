from fastapi import UploadFile, File
from ocr_service import process_prescription_image
import shutil
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chat_service import ask_about_medicine
from interaction_service import check_drug_interaction
from symptom_service import suggest_for_symptom

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

class InteractionRequest(BaseModel):
    drug_a: str
    drug_b: str

class SymptomRequest(BaseModel):
    symptom: str

@app.post("/symptoms")
def symptoms(request: SymptomRequest):
    return suggest_for_symptom(request.symptom)

@app.post("/interactions")
def interactions(request: InteractionRequest):
    return check_drug_interaction(request.drug_a, request.drug_b)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/chat")
def chat(request: ChatRequest):
    return ask_about_medicine(request.question, request.medicine_name)

@app.post("/ocr")
async def ocr_prescription(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = process_prescription_image(temp_path)
    finally:
        os.remove(temp_path)  # clean up temp file regardless of success/failure

    return result