import os
from dotenv import load_dotenv
from groq import Groq
from database import SessionLocal, Medicine

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

EMERGENCY_KEYWORDS = [
    "chest pain", "difficulty breathing", "can't breathe", "cannot breathe",
    "severe bleeding", "unconscious", "suicidal", "suicide", "overdose",
    "seizure", "stroke", "heart attack", "severe allergic reaction",
    "anaphylaxis", "not breathing", "choking"
]

EMERGENCY_MESSAGE = (
    "This sounds like it could be a medical emergency. Please call your local "
    "emergency number immediately or go to the nearest emergency room. "
    "I'm not able to help with this — please seek immediate medical attention."
)

SYSTEM_PROMPT = """You are PharmAgent, an AI assistant that suggests GENERAL categories of over-the-counter medicine for mild, common symptoms.

Strict rules:
- Suggest only general OTC categories (e.g., "pain reliever/fever reducer", "antihistamine", "acid reducer") — never a specific brand name, dosage, or frequency.
- Never diagnose a condition.
- If the symptom sounds serious, unusual, or persistent, recommend seeing a doctor instead of suggesting medicine.
- Always end with a reminder to consult a pharmacist or doctor before taking anything.
- Keep the answer short and clear.
"""

def is_emergency(text: str) -> bool:
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in EMERGENCY_KEYWORDS)

def suggest_for_symptom(symptom_text: str):
    if is_emergency(symptom_text):
        return {
            "emergency": True,
            "answer": EMERGENCY_MESSAGE
        }

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Symptom: {symptom_text}"}
        ]
    )

    return {
        "emergency": False,
        "answer": response.choices[0].message.content
    }