import os
from dotenv import load_dotenv
from groq import Groq
from database import SessionLocal, get_medicine_by_name

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are PharmAgent, an AI assistant that answers general questions about over-the-counter and common medicines.

Rules you must always follow:
- Answer ONLY using the medicine information provided in the context below. Do not use outside knowledge.
- If the context doesn't contain the answer, say you don't have verified information on that, and recommend consulting a pharmacist or doctor.
- Never suggest a specific dosage change or diagnose a condition.
- If the user's known allergies or conditions are provided and are relevant to this medicine, gently flag that connection — but never state it as a certainty, and always still recommend consulting a doctor or pharmacist before acting on it.
- Always end your answer with a short reminder to consult a doctor or pharmacist for personal medical advice.
- Keep answers concise and easy to understand for a general audience.
"""

def ask_about_medicine(user_question: str, medicine_name: str, language: str = "en", user_profile: dict | None = None):
    db = SessionLocal()
    medicine = get_medicine_by_name(db, medicine_name)
    db.close()

    if not medicine:
        return {
            "answer": f"I don't have verified information on '{medicine_name}' in my database. Please consult a pharmacist or doctor.",
            "found": False
        }

    context = f"""
Medicine: {medicine.generic_name} (Brand: {medicine.brand_name})
Purpose: {medicine.purpose}
Indications: {medicine.indications}
Dosage: {medicine.dosage}
Warnings: {medicine.warnings}
Do not use if: {medicine.do_not_use}
"""

    profile_context = ""
    if user_profile:
        parts = []
        if user_profile.get("allergies"):
            parts.append(f"Known allergies: {user_profile['allergies']}")
        if user_profile.get("chronic_conditions"):
            parts.append(f"Chronic conditions: {user_profile['chronic_conditions']}")
        if user_profile.get("current_medications"):
            parts.append(f"Current medications: {user_profile['current_medications']}")
        if parts:
            profile_context = "\n\nRelevant patient context (only mention if actually relevant to this medicine):\n" + "\n".join(parts)

    language_names = {"en": "English", "hi": "Hindi", "mr": "Marathi"}
    language_instruction = f"IMPORTANT: Respond entirely in {language_names.get(language, 'English')}, regardless of what language the context above is written in."

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT + "\n\n" + language_instruction},
            {"role": "user", "content": f"Context:\n{context}{profile_context}\n\nQuestion: {user_question}"}
        ]
    )

    return {
        "answer": response.choices[0].message.content,
        "found": True,
        "medicine": medicine.generic_name
    }