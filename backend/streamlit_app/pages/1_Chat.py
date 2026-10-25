import os
import sys

# make utils.py (one folder up) and the backend modules importable
APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

import streamlit as st
from utils import require_login, get_profile_dict, logout

from chat_service import ask_about_medicine
from database import SessionLocal, MedicineHistory
from datetime import datetime

st.set_page_config(page_title="Chat · PharmAgent", page_icon="💬", layout="wide")
require_login()

LANGUAGES = {"English": "en", "हिन्दी": "hi", "मराठी": "mr"}

with st.sidebar:
    st.write(f"Signed in as **{st.session_state.get('full_name', st.session_state['email'])}**")
    if st.button("Log out", key="logout_chat"):
        logout()
        st.rerun()

st.title("💬 Ask About a Medicine")

language_label = st.selectbox("Answer language", list(LANGUAGES.keys()))
language = LANGUAGES[language_label]

with st.form("chat_form"):
    medicine = st.text_input("Medicine name", placeholder="e.g. ibuprofen")
    question = st.text_area("Your question", placeholder="e.g. What is this used for?", height=100)
    submitted = st.form_submit_button("Ask")

if submitted:
    if not medicine.strip() or not question.strip():
        st.error("Please enter both a medicine name and a question.")
    else:
        profile = get_profile_dict(st.session_state["user_id"])
        with st.spinner("Asking..."):
            result = ask_about_medicine(question.strip(), medicine.strip(), language, profile)

        st.markdown("### Answer")
        st.info(result["answer"])

        db = SessionLocal()
        db.add(MedicineHistory(
            user_id=st.session_state["user_id"],
            medicine_name=medicine.strip(),
            question=question.strip(),
            answer=result.get("answer", ""),
            timestamp=datetime.utcnow().isoformat(),
        ))
        db.commit()
        db.close()