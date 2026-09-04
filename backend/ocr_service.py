import pytesseract
from PIL import Image
import re
from database import SessionLocal, Medicine
from rapidfuzz import fuzz


pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_from_image(image_path: str) -> str:
    img = Image.open(image_path)
    return pytesseract.image_to_string(img)



def find_known_medicines_in_text(text: str, threshold: int = 80):
    """Cross-check OCR'd text against verified medicines using fuzzy matching
    to tolerate OCR errors (e.g., 'Lbuprofen' vs 'Ibuprofen')."""
    db = SessionLocal()
    all_medicines = db.query(Medicine).all()
    db.close()

    words = text.split()
    found = []
    matched_names = set()

    for med in all_medicines:
        generic_name = med.generic_name.lower()
        best_score = 0

        for word in words:
            clean_word = word.strip('.,:;"()').lower()
            score = fuzz.ratio(generic_name, clean_word)
            best_score = max(best_score, score)

        if best_score >= threshold and med.generic_name not in matched_names:
            found.append({
                "generic_name": med.generic_name,
                "brand_name": med.brand_name,
                "purpose": med.purpose,
                "verified_dosage": med.dosage,
                "warnings": med.warnings,
                "match_confidence": best_score
            })
            matched_names.add(med.generic_name)

    return found

def process_prescription_image(image_path: str):
    raw_text = extract_text_from_image(image_path)
    matched_medicines = find_known_medicines_in_text(raw_text)

    return {
        "raw_extracted_text": raw_text,
        "matched_medicines": matched_medicines,
        "note": "Only medicines matched against our verified database are shown with dosage info. Raw text may contain OCR errors — always confirm with your pharmacist."
    }