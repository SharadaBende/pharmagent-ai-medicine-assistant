import os
import sys

APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.dirname(APP_DIR)
for p in (APP_DIR, BACKEND_DIR):
    if p not in sys.path:
        sys.path.insert(0, p)

import streamlit as st
from utils import require_login, logout

from ml.embeddings import hybrid_search, build_index

st.set_page_config(page_title="Smart Search · PharmAgent", page_icon="🔎", layout="wide")
require_login()

with st.sidebar:
    st.write(f"Signed in as **{st.session_state.get('full_name', st.session_state['email'])}**")
    if st.button("Log out", key="logout_search"):
        logout()
        st.rerun()

st.title("🔎 Smart Medicine Search")
st.caption(
    "Search by brand name (crocin), a local name (पैरासिटामोल), or what you need it for "
    "(acidity, high blood pressure, cough)."
)

with st.form("search_form"):
    query = st.text_input("Search", placeholder="e.g. crocin, acidity, cholesterol")
    top_k = st.slider("Number of results", 1, 10, 5)
    submitted = st.form_submit_button("Search")

if submitted:
    if not query.strip():
        st.error("Please type something to search for.")
    else:
        with st.spinner("Searching..."):
            results = hybrid_search(query.strip(), top_k=top_k)

        if not results:
            st.warning("No matches found.")
        for r in results:
            with st.container(border=True):
                c1, c2 = st.columns([4, 1])
                c1.markdown(f"**{r['generic_name']}**")
                c1.caption(f"Brand: {r['brand_name'] or '-'}")
                badge = "🏷️ Name match" if r["method"] == "name" else "🧠 Meaning match"
                c2.markdown(badge)
                c2.caption(f"score {r['score']:.2f}")

        st.info(
            "Results show medicines related to your search. They are not a recommendation. "
            "Ask a pharmacist or doctor before taking anything."
        )

with st.expander("Admin: rebuild search index"):
    st.caption("Run this after adding medicines or editing data/aliases.csv.")
    if st.button("Rebuild index"):
        with st.spinner("Rebuilding..."):
            build_index()
        st.success("Index rebuilt. Restart the app to load the new vectors.")
