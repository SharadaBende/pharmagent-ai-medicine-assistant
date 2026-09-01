from database import SessionLocal, Medicine

db = SessionLocal()
db.query(Medicine).delete()
db.commit()
db.close()
print("Cleared medicines table.")