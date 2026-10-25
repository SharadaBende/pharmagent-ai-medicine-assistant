import os
import sys

APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

import streamlit as st
from utils import require_login, logout

from interaction_service import check_multiple_interactions

st.set_page_config(page_title="Interactions · PharmAgent", page_icon="⚕️", layout="wide")
require_login()

SEVERITY_ICON = {"mild": "🟡", "moderate": "🟠", "severe": "🔴", "unknown": "⚪"}

with st.sidebar:
    st.write(f"Signed in as **{st.session_state.get('full_name', st.session_state['email'])}**")
    if st.button("Log out", key="logout_inter"):
        logout()
        st.rerun()

st.title("⚕️ Drug Interaction Checker")
st.caption("Check interactions between 2 or more medicines.")

# keep the number of input fields in session state
if "n_drugs" not in st.session_state:
    st.session_state["n_drugs"] = 2

c1, c2, _ = st.columns([1, 1, 4])
if c1.button("+ Add medicine"):
    st.session_state["n_drugs"] += 1
if c2.button("- Remove last") and st.session_state["n_drugs"] > 2:
    st.session_state["n_drugs"] -= 1

with st.form("interaction_form"):
    drugs = [
        st.text_input(f"Medicine {i + 1}", key=f"drug_{i}")
        for i in range(st.session_state["n_drugs"])
    ]
    submitted = st.form_submit_button("Check Interactions")

if submitted:
    filled = [d.strip() for d in drugs if d.strip()]
    if len(filled) < 2:
        st.error("Please enter at least 2 medicines.")
    else:
        with st.spinner("Checking..."):
            results = check_multiple_interactions(filled)

        st.subheader(f"Results ({len(results)} pair(s) checked)")
        for r in results:
            with st.container(border=True):
                st.markdown(f"**{r['drug_a']} + {r['drug_b']}**")
                if r["verified"]:
                    icon = SEVERITY_ICON.get(r["severity"], "⚪")
                    st.markdown(f"{icon} Severity: **{r['severity']}**")
                else:
                    st.markdown("⚪ Not verified")
                st.write(r["description"])