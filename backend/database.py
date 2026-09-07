from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base, sessionmaker
import requests
from datetime import datetime




# Common regional/brand name synonyms mapped to their OpenFDA-recognized generic name
DRUG_SYNONYMS = {
    "paracetamol": "acetaminophen",
    "crocin": "acetaminophen",
    "brufen": "ibuprofen",
    "combiflam": "ibuprofen",
}

def resolve_synonym(name: str) -> str:
    return DRUG_SYNONYMS.get(name.strip().lower(), name.strip().lower())

DATABASE_URL = "sqlite:///./pharmagent.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    brand_name = Column(String, index=True)
    generic_name = Column(String, index=True)
    purpose = Column(Text)
    indications = Column(Text)
    dosage = Column(Text)
    warnings = Column(Text)
    do_not_use = Column(Text)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    drug_a = Column(String, index=True)
    drug_b = Column(String, index=True)
    severity = Column(String)      # "mild", "moderate", "severe"
    description = Column(Text)


class MedicineHistory(Base):
    __tablename__ = "medicine_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    medicine_name = Column(String)
    question = Column(Text)
    answer = Column(Text)
    timestamp = Column(String)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_medicine_by_name(db, name: str):
    """Look up a medicine locally first; if not found, try fetching it live from OpenFDA."""
    name_clean = name.strip().lower()
    result = db.query(Medicine).filter(
        (Medicine.generic_name.ilike(f"%{name_clean}%")) |
        (Medicine.brand_name.ilike(f"%{name_clean}%"))
    ).first()

    if result:
        return result

    return fetch_and_cache_medicine(db, name_clean)

def fetch_and_cache_medicine(db, name: str):
    """If a medicine isn't in the local DB, try fetching it live from OpenFDA and cache it."""
    name_clean = resolve_synonym(name)

    response = requests.get(
        "https://api.fda.gov/drug/label.json",
        params={"search": f'openfda.generic_name.exact:"{name_clean.upper()}"', "limit": 1}
    )

    if response.status_code != 200:
        return None

    results = response.json().get("results", [])
    if not results:
        return None

    result = results[0]
    openfda = result.get("openfda", {})

    def extract_field(field):
        value = result.get(field)
        if isinstance(value, list):
            return " ".join(value)
        return value or ""

    medicine = Medicine(
        brand_name=", ".join(openfda.get("brand_name", [])),
        generic_name=", ".join(openfda.get("generic_name", [name_clean])),
        purpose=extract_field("purpose"),
        indications=extract_field("indications_and_usage"),
        dosage=extract_field("dosage_and_administration"),
        warnings=extract_field("warnings"),
        do_not_use=extract_field("do_not_use"),
    )

    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return medicine


def check_interaction(db, drug_a: str, drug_b: str):
    """Check for a known interaction between two drugs, in either order."""
    a = drug_a.strip().lower()
    b = drug_b.strip().lower()

    result = db.query(Interaction).filter(
        ((Interaction.drug_a == a) & (Interaction.drug_b == b)) |
        ((Interaction.drug_a == b) & (Interaction.drug_b == a))
    ).first()

    return result