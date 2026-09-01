from database import SessionLocal, Medicine

db = SessionLocal()
medicines = db.query(Medicine).all()

for m in medicines:
    print(f"\n--- {m.generic_name} ({m.brand_name}) ---")
    print("Purpose:", m.purpose[:100])
    print("Dosage:", m.dosage[:100])

db.close()