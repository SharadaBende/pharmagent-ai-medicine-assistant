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