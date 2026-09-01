import requests
from database import SessionLocal, Medicine, init_db

# A starter list of common OTC/generic medicine names to pull from OpenFDA
DRUG_NAMES = [
    "acetaminophen", "ibuprofen", "aspirin", "amoxicillin",
    "cetirizine", "omeprazole", "metformin", "loratadine",
    "diphenhydramine", "azithromycin"
]

def extract_field(result, field):
    """OpenFDA fields are usually lists of strings — join them safely."""
    value = result.get(field)
    if isinstance(value, list):
        return " ".join(value)
    return value or ""

def fetch_and_store():
    init_db()
    db = SessionLocal()

    for drug in DRUG_NAMES:
        response = requests.get(
    "https://api.fda.gov/drug/label.json",
    params={"search": f'openfda.generic_name.exact:"{drug.upper()}"', "limit": 1}
)

        if response.status_code != 200:
            print(f"Skipped {drug}: no data found (status {response.status_code})")
            continue

        result = response.json()["results"][0]
        openfda = result.get("openfda", {})

        medicine = Medicine(
            brand_name=", ".join(openfda.get("brand_name", [])),
            generic_name=", ".join(openfda.get("generic_name", [drug])),
            purpose=extract_field(result, "purpose"),
            indications=extract_field(result, "indications_and_usage"),
            dosage=extract_field(result, "dosage_and_administration"),
            warnings=extract_field(result, "warnings"),
            do_not_use=extract_field(result, "do_not_use"),
        )
        db.add(medicine)
        print(f"Added: {drug}")

    db.commit()
    db.close()
    print("Done seeding database.")

if __name__ == "__main__":
    fetch_and_store()
