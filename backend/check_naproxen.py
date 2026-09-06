from database import SessionLocal, Medicine

db = SessionLocal()
result = db.query(Medicine).filter(Medicine.generic_name.ilike("%naproxen%")).first()
print("Found in DB:", result.generic_name if result else "Not cached")
db.close()