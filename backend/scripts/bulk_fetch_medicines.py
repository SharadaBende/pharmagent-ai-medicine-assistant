import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import SessionLocal, init_db, get_medicine_by_name

NAMES = [
    "ibuprofen", "aspirin", "naproxen", "acetaminophen", "metformin", "simvastatin",
    "atorvastatin", "amlodipine", "losartan", "omeprazole", "pantoprazole", "ranitidine",
    "cetirizine", "loratadine", "diphenhydramine", "amoxicillin", "azithromycin",
    "ciprofloxacin", "doxycycline", "warfarin", "clopidogrel", "metoprolol", "lisinopril",
    "levothyroxine", "salbutamol", "prednisone", "diclofenac", "ondansetron", "loperamide",
    "guaifenesin", "dextromethorphan", "pseudoephedrine", "famotidine", "glimepiride",
    "gabapentin", "sertraline", "furosemide", "hydrochlorothiazide", "domperidone", "ketoconazole",
]

init_db()
db = SessionLocal()
ok = 0
for n in NAMES:
    try:
        m = get_medicine_by_name(db, n)
    except Exception as e:
        print(f"ERR  {n}: {e}")
        db.rollback()
        m = None
    else:
        print(("OK   " if m else "MISS ") + n)
    ok += bool(m)
db.close()
print(f"{ok}/{len(NAMES)} medicines available")