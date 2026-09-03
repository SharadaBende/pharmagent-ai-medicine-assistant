from database import SessionLocal, Interaction, init_db

# Well-documented interactions among our 10 seeded medicines.
# Stored in lowercase for consistent matching.
INTERACTIONS = [
    {
        "drug_a": "aspirin",
        "drug_b": "ibuprofen",
        "severity": "moderate",
        "description": "Taking ibuprofen with aspirin may reduce aspirin's heart-protective (antiplatelet) effect if ibuprofen is taken too close to the aspirin dose. Also increases risk of stomach irritation/bleeding when combined."
    },
    {
        "drug_a": "aspirin",
        "drug_b": "acetaminophen",
        "severity": "mild",
        "description": "Generally considered safe to use together for pain relief, but combined long-term use should be discussed with a doctor due to cumulative effects on the stomach and kidneys."
    },
    {
        "drug_a": "ibuprofen",
        "drug_b": "acetaminophen",
        "severity": "mild",
        "description": "Commonly used together for pain/fever management, but total daily doses of each should be tracked separately to avoid exceeding safe limits."
    },
    {
        "drug_a": "ibuprofen",
        "drug_b": "aspirin",
        "severity": "moderate",
        "description": "Same as aspirin + ibuprofen: may interfere with aspirin's protective effects and increases GI bleeding risk."
    },
    {
        "drug_a": "diphenhydramine",
        "drug_b": "cetirizine",
        "severity": "moderate",
        "description": "Combining two antihistamines increases risk of excessive drowsiness/sedation with little added benefit."
    },
    {
        "drug_a": "diphenhydramine",
        "drug_b": "loratadine",
        "severity": "moderate",
        "description": "Combining two antihistamines increases risk of excessive drowsiness/sedation with little added benefit."
    },
    {
        "drug_a": "omeprazole",
        "drug_b": "azithromycin",
        "severity": "mild",
        "description": "No major interaction expected, but omeprazole can alter absorption of some drugs — monitor if used long-term together."
    },
    {
        "drug_a": "metformin",
        "drug_b": "ibuprofen",
        "severity": "moderate",
        "description": "NSAIDs like ibuprofen can affect kidney function, which may indirectly affect metformin clearance. Occasional use is usually fine; regular use should be discussed with a doctor."
    },
]

def seed_interactions():
    init_db()
    db = SessionLocal()

    db.query(Interaction).delete()  # clear old data to avoid duplicates on re-run

    for item in INTERACTIONS:
        interaction = Interaction(
            drug_a=item["drug_a"].lower(),
            drug_b=item["drug_b"].lower(),
            severity=item["severity"],
            description=item["description"]
        )
        db.add(interaction)

    db.commit()
    db.close()
    print(f"Seeded {len(INTERACTIONS)} interactions.")

if __name__ == "__main__":
    seed_interactions()