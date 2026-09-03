from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base, sessionmaker

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


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    drug_a = Column(String, index=True)
    drug_b = Column(String, index=True)
    severity = Column(String)      # "mild", "moderate", "severe"
    description = Column(Text)

def init_db():
    Base.metadata.create_all(bind=engine)


def get_medicine_by_name(db, name: str):
    """Look up a medicine by brand or generic name (case-insensitive partial match)."""
    name = name.strip().lower()
    return db.query(Medicine).filter(
        (Medicine.generic_name.ilike(f"%{name}%")) |
        (Medicine.brand_name.ilike(f"%{name}%"))
    ).first()


def check_interaction(db, drug_a: str, drug_b: str):
    """Check for a known interaction between two drugs, in either order."""
    a = drug_a.strip().lower()
    b = drug_b.strip().lower()

    result = db.query(Interaction).filter(
        ((Interaction.drug_a == a) & (Interaction.drug_b == b)) |
        ((Interaction.drug_a == b) & (Interaction.drug_b == a))
    ).first()

    return result