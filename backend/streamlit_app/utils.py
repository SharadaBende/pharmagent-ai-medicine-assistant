import os
import sys

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import streamlit as st
from database import SessionLocal, UserProfile

ALLERGY_OPTIONS = [
    "Penicillin", "Amoxicillin", "Sulfa drugs", "Aspirin", "Ibuprofen / NSAIDs",
    "Cephalosporins", "Codeine / Opioids", "Local anesthetics (e.g. lidocaine)",
    "Latex", "Iodine / Contrast dye", "Peanuts", "Tree nuts", "Shellfish", "Eggs",
    "Milk / Dairy", "Soy", "Wheat / Gluten", "Pollen", "Dust mites", "Pet dander",
    "Bee / Insect stings", "Nickel", "Adhesive tape / Bandages",
]

CONDITION_OPTIONS = [
    "Diabetes (Type 1)", "Diabetes (Type 2)", "Hypertension", "Asthma",
    "Kidney disease", "Liver disease", "Heart disease", "Thyroid disorder",
    "Epilepsy / Seizure disorder", "COPD", "Anemia", "Glaucoma",
    "Peptic ulcer disease", "Osteoporosis", "Pregnancy", "Breastfeeding",
]

GENDERS = ["Female", "Male", "Other", "Prefer not to say"]


def logged_in() -> bool:
    return st.session_state.get("user_id") is not None


def require_login():
    """Call at the top of every page."""
    if not logged_in():
        st.warning("Please log in from the Home page first.")
        st.stop()


def logout():
    for key in ["user_id", "email", "full_name"]:
        st.session_state.pop(key, None)


def get_profile(user_id: int):
    db = SessionLocal()
    p = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    db.close()
    return p


def get_profile_dict(user_id: int):
    p = get_profile(user_id)
    if not p:
        return None
    return {
        "allergies": p.allergies,
        "current_medications": p.current_medications,
        "chronic_conditions": p.chronic_conditions,
    }


def _split(saved: str, options: list):
    items = [s.strip() for s in (saved or "").split(",") if s.strip()]
    return [i for i in items if i in options], ", ".join(i for i in items if i not in options)


def profile_form(user_id: int, button_label: str = "Save"):
    """Shared by profile setup and the Profile page. Returns True when saved."""
    p = get_profile(user_id)
    known_a, other_a = _split(p.allergies if p else "", ALLERGY_OPTIONS)
    known_c, other_c = _split(p.chronic_conditions if p else "", CONDITION_OPTIONS)

    with st.form("profile_form"):
        full_name = st.text_input("Full name", value=p.full_name if p else "")
        c1, c2 = st.columns([1, 2])
        age = c1.number_input("Age", 0, 120, value=p.age if p and p.age else 25)
        gender = c2.selectbox(
            "Gender", GENDERS,
            index=GENDERS.index(p.gender) if p and p.gender in GENDERS else 0,
        )
        allergies = st.multiselect("Known allergies", ALLERGY_OPTIONS, default=known_a)
        other_allergy = st.text_input("Other allergy not listed (optional)", value=other_a)
        conditions = st.multiselect("Chronic conditions", CONDITION_OPTIONS, default=known_c)
        other_condition = st.text_input("Other condition not listed (optional)", value=other_c)
        meds = st.text_area("Current medications (optional)",
                            value=p.current_medications if p else "", height=70)
        submitted = st.form_submit_button(button_label)

    if not submitted:
        return False
    if not full_name.strip():
        st.error("Full name is required.")
        return False

    a_list = allergies + ([other_allergy.strip()] if other_allergy.strip() else [])
    c_list = conditions + ([other_condition.strip()] if other_condition.strip() else [])

    db = SessionLocal()
    prof = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not prof:
        prof = UserProfile(user_id=user_id)
        db.add(prof)
    prof.full_name = full_name.strip()
    prof.age = int(age)
    prof.gender = gender
    prof.allergies = ", ".join(a_list)
    prof.chronic_conditions = ", ".join(c_list)
    prof.current_medications = meds
    db.commit()
    db.close()

    st.session_state["full_name"] = full_name.strip()
    return True