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

def init_db():
    Base.metadata.create_all(bind=engine)