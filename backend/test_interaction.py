from database import SessionLocal, check_interaction

db = SessionLocal()

# Test both orders — should return the same result either way
result1 = check_interaction(db, "aspirin", "ibuprofen")
result2 = check_interaction(db, "ibuprofen", "aspirin")

print("A+B:", result1.severity, "-", result1.description if result1 else "Not found")
print("B+A:", result2.severity, "-", result2.description if result2 else "Not found")

# Test a pair with no known interaction
result3 = check_interaction(db, "omeprazole", "cetirizine")
print("No known pair:", result3)

db.close()