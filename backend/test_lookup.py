from database import SessionLocal, get_medicine_by_name

db = SessionLocal()
result = get_medicine_by_name(db, "ibuprofen")

if result:
    print("Found:", result.generic_name, "-", result.brand_name)
    print("Purpose:", result.purpose)
else:
    print("Not found.")

db.close()