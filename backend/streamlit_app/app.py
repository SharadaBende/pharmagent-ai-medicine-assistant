import streamlit as st
from utils import logged_in, logout, get_profile, profile_form

from database import SessionLocal, User, init_db
from auth_service import hash_password, verify_password

st.set_page_config(page_title="PharmAgent", page_icon="💊", layout="wide")
init_db()


def auth_screen():
    st.title("💊 PharmAgent")
    st.caption("Your trusted AI medicine assistant")
    login_tab, signup_tab = st.tabs(["Log in", "Sign up"])

    with login_tab:
        with st.form("login"):
            email = st.text_input("Email")
            password = st.text_input("Password", type="password")
            if st.form_submit_button("Log in"):
                db = SessionLocal()
                user = db.query(User).filter(User.email == email.strip().lower()).first()
                db.close()
                if user and verify_password(password, user.hashed_password):
                    st.session_state["user_id"] = user.id
                    st.session_state["email"] = user.email
                    st.rerun()
                else:
                    st.error("Invalid email or password.")

    with signup_tab:
        with st.form("signup"):
            email = st.text_input("Email", key="su_email")
            password = st.text_input("Password (min 8 characters)", type="password", key="su_pw")
            if st.form_submit_button("Sign up"):
                email = email.strip().lower()
                if "@" not in email:
                    st.error("Enter a valid email.")
                elif not 8 <= len(password) <= 72:
                    st.error("Password must be 8 to 72 characters.")
                else:
                    db = SessionLocal()
                    if db.query(User).filter(User.email == email).first():
                        st.error("An account with this email already exists.")
                        db.close()
                    else:
                        user = User(email=email, hashed_password=hash_password(password))
                        db.add(user)
                        db.commit()
                        db.refresh(user)
                        db.close()
                        st.session_state["user_id"] = user.id
                        st.session_state["email"] = email
                        st.rerun()


def profile_setup_screen():
    st.title("Tell us about yourself")
    st.caption("This helps us give you safer, more relevant guidance.")
    if profile_form(st.session_state["user_id"], "Save & Continue"):
        st.rerun()


def home_screen():
    profile = get_profile(st.session_state["user_id"])
    name = st.session_state.get("full_name") or profile.full_name
    st.session_state["full_name"] = name

    with st.sidebar:
        st.write(f"Signed in as **{name}**")
        if st.button("Log out"):
            logout()
            st.rerun()

    st.title("💊 PharmAgent")
    st.subheader(f"Welcome, {name}")
    st.write("Ask about medicines, check interactions, get general symptom guidance, "
             "and read prescriptions, all grounded in verified drug data.")
    st.info("Use the sidebar to open a feature. PharmAgent gives general information only "
            "and is not a substitute for professional medical advice.")


if not logged_in():
    auth_screen()
elif get_profile(st.session_state["user_id"]) is None:
    profile_setup_screen()
else:
    home_screen()