import pytesseract
from PIL import Image
from rapidfuzz import fuzz
from database import SessionLocal, Medicine, fetch_and_cache_medicine

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_from_image(image_path: str) -> str:
    img = Image.open(image_path)
    return pytesseract.image_to_string(img)

def find_known_medicines_in_text(text: str, threshold: int = 80):
    """Cross-check OCR'd text against verified medicines, fuzzy-matching locally first,
    then attempting a live OpenFDA lookup for words that look like drug names but aren't cached yet."""
    db = SessionLocal()
    all_medicines = db.query(Medicine).all()

    words = text.split()
    found = []
    matched_names = set()

    # Step 1: fuzzy match against everything already in the local DB (fast, no API calls)
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

    # Step 2: for words that look like plausible drug names (long enough, alphabetic)
    # and weren't already matched, try a live OpenFDA lookup and cache if found
    candidate_words = [
        w.strip('.,:;"()').lower() for w in words
        if len(w.strip('.,:;"()')) >= 5 and w.strip('.,:;"()').isalpha()
    ]

    for word in set(candidate_words):
        if any(word in name.lower() or fuzz.ratio(word, name.lower()) >= threshold for name in matched_names):
            continue  # already matched above

        live_result = fetch_and_cache_medicine(db, word)
        if live_result and live_result.generic_name not in matched_names:
            found.append({
                "generic_name": live_result.generic_name,
                "brand_name": live_result.brand_name,
                "purpose": live_result.purpose,
                "verified_dosage": live_result.dosage,
                "warnings": live_result.warnings,
                "match_confidence": 100  # exact OpenFDA match, not fuzzy
            })
            matched_names.add(live_result.generic_name)

    db.close()
    return found

def process_prescription_image(image_path: str):
    raw_text = extract_text_from_image(image_path)
    matched_medicines = find_known_medicines_in_text(raw_text)

    return {
        "raw_extracted_text": raw_text,
        "matched_medicines": matched_medicines,
        "note": "Medicines are matched against our verified database (fetched live when needed) and shown with dosage info. Raw text may contain OCR errors — always confirm with your pharmacist."
    }