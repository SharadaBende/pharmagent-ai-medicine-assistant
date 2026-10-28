import os
import sys

APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

import pandas as pd
import streamlit as st
from utils import require_login, logout

from database import SessionLocal, MedicineHistory

st.set_page_config(page_title="History · PharmAgent", page_icon="📋", layout="wide")
require_login()

with st.sidebar:
    st.write(f"Signed in as **{st.session_state.get('full_name', st.session_state['email'])}**")
    if st.button("Log out", key="logout_hist"):
        logout()
        st.rerun()

st.title("📋 Your History")

db = SessionLocal()
entries = (
    db.query(MedicineHistory)
    .filter(MedicineHistory.user_id == st.session_state["user_id"])
    .order_by(MedicineHistory.id.desc())
    .all()
)
db.close()

if not entries:
    st.info("No history yet. Questions you ask in Chat will show up here.")
    st.stop()

df = pd.DataFrame([
    {
        "Time": e.timestamp,
        "Medicine": e.medicine_name,
        "Question": e.question,
        "Answer": e.answer,
    }
    for e in entries
])
df["Time"] = pd.to_datetime(df["Time"], errors="coerce").dt.strftime("%Y-%m-%d %H:%M")

search = st.text_input("Search by medicine or question", placeholder="e.g. ibuprofen")
if search.strip():
    s = search.strip().lower()
    mask = (
        df["Medicine"].str.lower().str.contains(s, na=False)
        | df["Question"].str.lower().str.contains(s, na=False)
    )
    df = df[mask]

st.caption(f"{len(df)} entr{'y' if len(df) == 1 else 'ies'}")
st.dataframe(df[["Time", "Medicine", "Question"]], use_container_width=True, hide_index=True)

st.subheader("Full answers")
for _, row in df.iterrows():
    with st.expander(f"{row['Medicine']} · {row['Question'][:60]} · {row['Time']}"):
        st.write(row["Answer"])