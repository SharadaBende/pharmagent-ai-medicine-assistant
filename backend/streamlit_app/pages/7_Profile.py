import os
import sys

APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

import streamlit as st
from utils import require_login, logout, get_profile, profile_form

st.set_page_config(page_title="Profile · PharmAgent", page_icon="👤", layout="wide")
require_login()

with st.sidebar:
    st.write(f"Signed in as **{st.session_state.get('full_name', st.session_state['email'])}**")
    if st.button("Log out", key="logout_prof"):
        logout()
        st.rerun()

st.title("👤 Your Profile")

user_id = st.session_state["user_id"]
profile = get_profile(user_id)

if "editing_profile" not in st.session_state:
    st.session_state["editing_profile"] = False

if st.session_state["editing_profile"]:
    if profile_form(user_id, "Update Profile"):
        st.session_state["editing_profile"] = False
        st.success("Profile updated successfully.")
        st.rerun()
    if st.button("Cancel"):
        st.session_state["editing_profile"] = False
        st.rerun()
else:
    def pills(text):
        items = [i.strip() for i in (text or "").split(",") if i.strip()]
        return " ".join(f"`{i}`" for i in items) if items else "_None listed_"

    st.subheader(profile.full_name)
    st.caption(f"{profile.age} · {profile.gender}")

    st.markdown("**Known allergies**")
    st.markdown(pills(profile.allergies))

    st.markdown("**Chronic conditions**")
    st.markdown(pills(profile.chronic_conditions))

    st.markdown("**Current medications**")
    st.write(profile.current_medications or "_None listed_")

    if st.button("Edit Profile"):
        st.session_state["editing_profile"] = True
        st.rerun()
