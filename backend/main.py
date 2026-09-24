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
from database import UserProfile
from fastapi import HTTPException
from fastapi import Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import uuid
from fastapi import HTTPException



def get_user_profile_dict(user_id: int) -> Optional[dict]:
    db = SessionLocal()
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    db.close()

    if not profile:
        return None

    return {
        "allergies": profile.allergies,
        "current_medications": profile.current_medications,
        "chronic_conditions": profile.chronic_conditions,
    }


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


limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="PharmAgent AI Medicine Assistant")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
    language: str = "en"

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

class SymptomRequest(BaseModel):
    symptom: str
    language: str = "en"


@app.post("/symptoms")
@limiter.limit("20/minute")
def symptoms(request: Request, payload: SymptomRequest, current_user: Optional[User] = Depends(get_optional_user)):
    user_profile = get_user_profile_dict(current_user.id) if current_user else None
    return suggest_for_symptom(payload.symptom, user_profile, payload.language)

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
@limiter.limit("20/minute")
def chat(request: Request, payload: ChatRequest, current_user: Optional[User] = Depends(get_optional_user)):
    user_profile = get_user_profile_dict(current_user.id) if current_user else None
    result = ask_about_medicine(payload.question, payload.medicine_name, payload.language, user_profile)

    if current_user:
        db = SessionLocal()
        history_entry = MedicineHistory(
            user_id=current_user.id,
            medicine_name=payload.medicine_name,
            question=payload.question,
            answer=result.get("answer", ""),
            timestamp=datetime.utcnow().isoformat()
        )
        db.add(history_entry)
        db.commit()
        db.close()

    return result

MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB

@app.post("/ocr")
@limiter.limit("10/minute")
async def ocr_prescription(request: Request, file: UploadFile = File(...)):
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image.")

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (max 5 MB).")

    temp_path = f"temp_{uuid.uuid4().hex}.img"
    with open(temp_path, "wb") as buffer:
        buffer.write(contents)

    try:
        result = process_prescription_image(temp_path)
    finally:
        os.remove(temp_path)  # clean up regardless of success/failure

    return result


@app.post("/signup")
@limiter.limit("5/minute")
def signup(request: Request, payload: SignupRequest):
    db = SessionLocal()
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        db.close()
        return {"error": "An account with this email already exists."}

    new_user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    db.close()

    token = create_access_token({"sub": payload.email})
    return {"access_token": token, "token_type": "bearer", "profile_complete": False}

@app.post("/login")
@limiter.limit("5/minute")
def login(request: Request, payload: LoginRequest):
    db = SessionLocal()
    user = db.query(User).filter(User.email == payload.email).first()
    db.close()

    if not user or not verify_password(payload.password, user.hashed_password):
        return {"error": "Invalid email or password."}

    token = create_access_token({"sub": payload.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "profile_complete": has_profile(user.id),
    }


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




class ProfileRequest(BaseModel):
    full_name: str
    age: int
    gender: str
    allergies: str = ""
    current_medications: str = ""
    chronic_conditions: str = ""


def has_profile(user_id: int) -> bool:
    db = SessionLocal()
    exists = db.query(UserProfile).filter(UserProfile.user_id == user_id).first() is not None
    db.close()
    return exists


@app.post("/profile")
def create_or_update_profile(request: ProfileRequest, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    if profile:
        profile.full_name = request.full_name
        profile.age = request.age
        profile.gender = request.gender
        profile.allergies = request.allergies
        profile.current_medications = request.current_medications
        profile.chronic_conditions = request.chronic_conditions
    else:
        profile = UserProfile(
            user_id=current_user.id,
            full_name=request.full_name,
            age=request.age,
            gender=request.gender,
            allergies=request.allergies,
            current_medications=request.current_medications,
            chronic_conditions=request.chronic_conditions,
        )
        db.add(profile)

    db.commit()
    db.close()
    return {"success": True}


@app.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    db.close()

    if not profile:
        return {"exists": False}

    return {
        "exists": True,
        "full_name": profile.full_name,
        "age": profile.age,
        "gender": profile.gender,
        "allergies": profile.allergies,
        "current_medications": profile.current_medications,
        "chronic_conditions": profile.chronic_conditions,
    }