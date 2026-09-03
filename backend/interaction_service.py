from database import SessionLocal, check_interaction
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

FALLBACK_SYSTEM_PROMPT = """You are PharmAgent, an AI assistant. The user is asking about a possible interaction between two medicines, but no verified data was found in the local database.

Rules:
- Clearly state that this is NOT a verified/confirmed interaction from a trusted database.
- Do not make up specific interaction data or claim certainty.
- Strongly recommend they confirm with a pharmacist or doctor before combining these medicines.
- Keep the response short.
"""

def check_drug_interaction(drug_a: str, drug_b: str):
    db = SessionLocal()
    result = check_interaction(db, drug_a, drug_b)
    db.close()

    if result:
        return {
            "verified": True,
            "severity": result.severity,
            "description": result.description
        }

    # Fallback: no verified data found
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": FALLBACK_SYSTEM_PROMPT},
            {"role": "user", "content": f"Is there a known interaction between {drug_a} and {drug_b}?"}
        ]
    )

    return {
        "verified": False,
        "severity": "unknown",
        "description": response.choices[0].message.content
    }