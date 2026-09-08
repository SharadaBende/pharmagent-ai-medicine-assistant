from database import SessionLocal, check_interaction
import os
from dotenv import load_dotenv
from groq import Groq

from itertools import combinations
from database import SessionLocal, check_interaction

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



def check_multiple_interactions(drug_names: list[str]):
    """Check all pairwise interactions among 3+ drugs."""
    results = []
    db = SessionLocal()

    for drug_a, drug_b in combinations(drug_names, 2):
        result = check_interaction(db, drug_a, drug_b)

        if result:
            results.append({
                "drug_a": drug_a,
                "drug_b": drug_b,
                "verified": True,
                "severity": result.severity,
                "description": result.description
            })
        else:
            # For multi-drug checks, skip the LLM fallback per-pair (too many API calls)
            # Just flag it as unverified/unknown so the user knows to check manually
            results.append({
                "drug_a": drug_a,
                "drug_b": drug_b,
                "verified": False,
                "severity": "unknown",
                "description": "No verified interaction data found for this pair. Please consult a pharmacist."
            })

    db.close()
    return results