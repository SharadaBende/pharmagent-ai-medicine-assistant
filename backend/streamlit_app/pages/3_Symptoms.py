import os
import sys

APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

import streamlit as st
from utils import require_login, get_profile_dict, logout

from symptom_service import suggest_for_symptom

st.set_page_config(page_title="Symptoms · PharmAgent", page_icon="🩺", layout="wide")
require_login()

LANGUAGES = {"English": "en", "हिन्दी": "hi", "मराठी": "mr"}

with st.sidebar:
    st.write(f"Signed in as **{st.session_state.get('full_name', st.session_state['email'])}**")
    if st.button("Log out", key="logout_sym"):
        logout()
        st.rerun()

st.title("🩺 Symptom Checker")

language_label = st.selectbox("Answer language", list(LANGUAGES.keys()))
language = LANGUAGES[language_label]

with st.form("symptom_form"):
    symptom = st.text_area(
        "Describe your symptom",
        placeholder="e.g. mild headache, sore throat",
        height=100,
    )
    submitted = st.form_submit_button("Get Guidance")

if submitted:
    if not symptom.strip():
        st.error("Please describe your symptom.")
    else:
        profile = get_profile_dict(st.session_state["user_id"])
        with st.spinner("Checking..."):
            result = suggest_for_symptom(symptom.strip(), profile, language)

        if result.get("emergency"):
            st.error("⚠️ Emergency Notice")
            st.error(result["answer"])
        else:
            st.markdown("### Guidance")
            st.info(result["answer"])