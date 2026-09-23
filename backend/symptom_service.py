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

LANGUAGE_NAMES = {"en": "English", "hi": "Hindi", "mr": "Marathi"}

EMERGENCY_MESSAGES = {
    "en": (
        "This sounds like it could be a medical emergency. Please call your local "
        "emergency number immediately or go to the nearest emergency room. "
        "I'm not able to help with this — please seek immediate medical attention."
    ),
    "hi": (
        "यह एक मेडिकल इमरजेंसी हो सकती है। कृपया तुरंत अपने स्थानीय आपातकालीन नंबर पर "
        "कॉल करें या नज़दीकी अस्पताल के इमरजेंसी विभाग में जाएँ। मैं इसमें मदद नहीं कर सकता — "
        "कृपया तुरंत चिकित्सा सहायता लें।"
    ),
    "mr": (
        "ही वैद्यकीय आणीबाणी असू शकते. कृपया ताबडतोब तुमच्या स्थानिक आपत्कालीन क्रमांकावर "
        "कॉल करा किंवा जवळच्या रुग्णालयाच्या आपत्कालीन विभागात जा. मी यात मदत करू शकत नाही — "
        "कृपया त्वरित वैद्यकीय मदत घ्या."
    ),
}

SYSTEM_PROMPT = """You are PharmAgent, an AI assistant that suggests GENERAL categories of over-the-counter medicine for mild, common symptoms.

Strict rules:
- Suggest only general OTC categories (e.g., "pain reliever/fever reducer", "antihistamine", "acid reducer") — never a specific brand name, dosage, or frequency.
- Never diagnose a condition.
- If the symptom sounds serious, unusual, or persistent, recommend seeing a doctor instead of suggesting medicine.
- If the user's known allergies or conditions are provided and are relevant, gently note that connection and suggest they be extra cautious or consult a pharmacist first — but never state it as a certainty.
- Always end with a reminder to consult a pharmacist or doctor before taking anything.
- Keep the answer short and clear.
"""

def is_emergency(text: str) -> bool:
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in EMERGENCY_KEYWORDS)

def suggest_for_symptom(symptom_text: str, user_profile: dict | None = None, language: str = "en"):
    if language not in LANGUAGE_NAMES:
        language = "en"

    if is_emergency(symptom_text):
        return {
            "emergency": True,
            "answer": EMERGENCY_MESSAGES[language]
        }

    profile_context = ""
    # ... unchanged ...

    system_prompt = SYSTEM_PROMPT + f"- Write your entire answer in {LANGUAGE_NAMES[language]}.\n"

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Symptom: {symptom_text}{profile_context}"}
        ]
    )

    return {
        "emergency": False,
        "answer": response.choices[0].message.content
    }