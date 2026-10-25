import os
import sys
import uuid

APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

import streamlit as st
from utils import require_login, logout

from ocr_service import process_prescription_image

st.set_page_config(page_title="Prescription OCR · PharmAgent", page_icon="📄", layout="wide")
require_login()

MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB

with st.sidebar:
    st.write(f"Signed in as **{st.session_state.get('full_name', st.session_state['email'])}**")
    if st.button("Log out", key="logout_ocr"):
        logout()
        st.rerun()

st.title("📄 Prescription Reader (OCR)")
st.caption("Upload a prescription image to extract and verify medicine details.")

uploaded = st.file_uploader("Prescription image", type=["png", "jpg", "jpeg", "webp"])

if uploaded is not None:
    data = uploaded.getvalue()
    if len(data) > MAX_UPLOAD_BYTES:
        st.error("Image too large (max 5 MB).")
        st.stop()

    st.image(data, caption="Uploaded prescription", width=400)

    if st.button("Upload & Read"):
        temp_path = f"temp_{uuid.uuid4().hex}.img"
        with open(temp_path, "wb") as f:
            f.write(data)
        try:
            with st.spinner("Reading prescription..."):
                result = process_prescription_image(temp_path)
        finally:
            os.remove(temp_path)

        st.subheader("Matched Medicines")
        matched = result["matched_medicines"]
        if not matched:
            st.warning("No medicines from our database were confidently matched. "
                       "Please double-check with your pharmacist.")
        for med in matched:
            with st.container(border=True):
                st.markdown(f"**{med['generic_name']}** ({med['brand_name']})")
                purpose = med["purpose"] or "Not listed in the label data."
                st.markdown(f"**Purpose:** {purpose[:300]}")
                dosage = med["verified_dosage"] or "Not listed."
                st.markdown(f"**Dosage:** {dosage[:400]}{'...' if len(dosage) > 400 else ''}")
                with st.expander("Full dosage text"):
                    st.write(dosage)

        with st.expander("View raw extracted text"):
            st.code(result["raw_extracted_text"])

        st.caption(result["note"])