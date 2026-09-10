from fastapi import UploadFile, File
from ocr_service import process_prescription_image
import shutil
import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chat_service import ask_about_medicine
from interaction_service import check_drug_interaction
from symptom_service import suggest_for_symptom
from database import User
from auth_service import hash_password, verify_password, create_access_token
from database import SessionLocal
from auth_service import get_current_user
from database import User
from fastapi import Header
from typing import Optional
from auth_service import decode_access_token
from database import User, MedicineHistory
from datetime import datetime
from interaction_service import check_multiple_interactions
from database import Reminder


def get_optional_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    if not payload:
        return None
    db = SessionLocal()
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    db.close()
    return user


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


class SignupRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class MultiInteractionRequest(BaseModel):
    drug_names: list[str]


class ReminderRequest(BaseModel):
    medicine_name: str
    dosage_note: str
    time_of_day: str
    frequency: str

@app.post("/symptoms")
def symptoms(request: SymptomRequest):
    return suggest_for_symptom(request.symptom)

@app.post("/interactions")
def interactions(request: InteractionRequest):
    return check_drug_interaction(request.drug_a, request.drug_b)

@app.post("/interactions/multi")
def multi_interactions(request: MultiInteractionRequest):
    if len(request.drug_names) < 2:
        return {"error": "Please provide at least 2 medicines to check."}
    return {"results": check_multiple_interactions(request.drug_names)}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/chat")
def chat(request: ChatRequest, current_user: Optional[User] = Depends(get_optional_user)):
    result = ask_about_medicine(request.question, request.medicine_name)

    if current_user:
        db = SessionLocal()
        history_entry = MedicineHistory(
            user_id=current_user.id,
            medicine_name=request.medicine_name,
            question=request.question,
            answer=result.get("answer", ""),
            timestamp=datetime.utcnow().isoformat()
        )
        db.add(history_entry)
        db.commit()
        db.close()

    return result

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


from database import SessionLocal

@app.post("/signup")
def signup(request: SignupRequest):
    db = SessionLocal()
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        db.close()
        return {"error": "An account with this email already exists."}

    new_user = User(
        email=request.email,
        hashed_password=hash_password(request.password)
    )
    db.add(new_user)
    db.commit()
    db.close()

    token = create_access_token({"sub": request.email})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/login")
def login(request: LoginRequest):
    db = SessionLocal()
    user = db.query(User).filter(User.email == request.email).first()
    db.close()

    if not user or not verify_password(request.password, user.hashed_password):
        return {"error": "Invalid email or password."}

    token = create_access_token({"sub": request.email})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/me")
def read_current_user(current_user: User = Depends(get_current_user)):
    return {"email": current_user.email, "id": current_user.id}



@app.get("/history")
def get_history(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    entries = db.query(MedicineHistory).filter(
        MedicineHistory.user_id == current_user.id
    ).order_by(MedicineHistory.id.desc()).all()
    db.close()

    return [
        {
            "medicine_name": e.medicine_name,
            "question": e.question,
            "answer": e.answer,
            "timestamp": e.timestamp
        }
        for e in entries
    ]



@app.post("/reminders")
def create_reminder(request: ReminderRequest, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    reminder = Reminder(
        user_id=current_user.id,
        medicine_name=request.medicine_name,
        dosage_note=request.dosage_note,
        time_of_day=request.time_of_day,
        frequency=request.frequency,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    db.close()
    return {
        "id": reminder.id,
        "medicine_name": reminder.medicine_name,
        "dosage_note": reminder.dosage_note,
        "time_of_day": reminder.time_of_day,
        "frequency": reminder.frequency,
    }

@app.get("/reminders")
def list_reminders(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    reminders = db.query(Reminder).filter(Reminder.user_id == current_user.id).all()
    db.close()
    return [
        {
            "id": r.id,
            "medicine_name": r.medicine_name,
            "dosage_note": r.dosage_note,
            "time_of_day": r.time_of_day,
            "frequency": r.frequency,
        }
        for r in reminders
    ]

@app.delete("/reminders/{reminder_id}")
def delete_reminder(reminder_id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id, Reminder.user_id == current_user.id
    ).first()

    if not reminder:
        db.close()
        return {"error": "Reminder not found."}

    db.delete(reminder)
    db.commit()
    db.close()
    return {"deleted": True}