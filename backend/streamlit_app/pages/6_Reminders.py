import os
import sys
from datetime import datetime

APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

import streamlit as st
from streamlit_autorefresh import st_autorefresh
from utils import require_login, logout

from database import SessionLocal, Reminder

st.set_page_config(page_title="Reminders · PharmAgent", page_icon="⏰", layout="wide")
require_login()

FREQ_LABELS = {"daily": "Daily", "twice_daily": "Twice daily", "weekly": "Weekly"}

with st.sidebar:
    st.write(f"Signed in as **{st.session_state.get('full_name', st.session_state['email'])}**")
    if st.button("Log out", key="logout_rem"):
        logout()
        st.rerun()

# re-run the page every 30 seconds so the "due now" banner stays current
st_autorefresh(interval=30_000, key="reminder_refresh")

st.title("⏰ Medicine Reminders")
st.caption("Reminders appear as a banner only while this page is open.")

user_id = st.session_state["user_id"]

# ---------- load ----------
db = SessionLocal()
reminders = db.query(Reminder).filter(Reminder.user_id == user_id).order_by(Reminder.time_of_day).all()
db.close()

# ---------- due now banner ----------
now = datetime.now()
now_minutes = now.hour * 60 + now.minute
st.caption(f"Page clock: {now.strftime('%H:%M:%S')} · last refreshed at this time")

for r in reminders:
    try:
        h, m = map(int, r.time_of_day.split(":"))
    except ValueError:
        st.error(f"Bad time format for {r.medicine_name}: {r.time_of_day!r}")
        continue
    diff = (h * 60 + m) - now_minutes   # minutes until the reminder
    if -5 <= diff <= 1:
        st.warning(f"💊 Time to take **{r.medicine_name}**. {r.dosage_note or ''}")
    elif 0 < diff <= 60:
        st.caption(f"Next: {r.medicine_name} at {r.time_of_day} (in {diff} min)")


# ---------- add form ----------
with st.form("add_reminder", clear_on_submit=True):
    medicine = st.text_input("Medicine name")
    dosage = st.text_input("Dosage note", placeholder="e.g. 1 tablet after food")
    time_val = st.time_input("Time", value=datetime.now().replace(second=0, microsecond=0).time(), step=60)
    freq = st.selectbox("Frequency", list(FREQ_LABELS.keys()), format_func=lambda k: FREQ_LABELS[k])
    submitted = st.form_submit_button("Add Reminder")

if submitted:
    if not medicine.strip():
        st.error("Please enter a medicine name.")
    else:
        db = SessionLocal()
        db.add(Reminder(
            user_id=user_id,
            medicine_name=medicine.strip(),
            dosage_note=dosage.strip(),
            time_of_day=time_val.strftime("%H:%M"),
            frequency=freq,
        ))
        db.commit()
        db.close()
        st.success("Reminder added.")
        st.rerun()

# ---------- list ----------
st.subheader("Your reminders")
if not reminders:
    st.info("No reminders set yet.")

for r in reminders:
    with st.container(border=True):
        c1, c2 = st.columns([5, 1])
        c1.markdown(f"**{r.medicine_name}**")
        c1.caption(f"{r.dosage_note or '-'} · {r.time_of_day} · {FREQ_LABELS.get(r.frequency, r.frequency)}")
        if c2.button("Delete", key=f"del_{r.id}"):
            db = SessionLocal()
            db.query(Reminder).filter(Reminder.id == r.id, Reminder.user_id == user_id).delete()
            db.commit()
            db.close()
            st.rerun()