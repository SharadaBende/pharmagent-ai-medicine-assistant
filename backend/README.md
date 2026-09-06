\# PharmAgent — AI Medicine Assistant



An AI-powered medicine assistant that answers medicine questions, checks drug interactions, offers general symptom guidance, and reads prescriptions — all grounded in verified drug data via retrieval-augmented generation (RAG), not guessed by the LLM.



\## Tech Stack

\- \*\*Backend:\*\* FastAPI (Python), SQLite, SQLAlchemy

\- \*\*Frontend:\*\* React (Vite), Tailwind CSS

\- \*\*LLM:\*\* Groq API (openai/gpt-oss-120b)

\- \*\*Drug data:\*\* OpenFDA API

\- \*\*OCR:\*\* Tesseract (via pytesseract) + fuzzy matching (rapidfuzz)



\## Features

1\. \*\*Chat Q\&A\*\* — Ask questions about common medicines, grounded in verified drug data

2\. \*\*Interaction Checker\*\* — Rule-based lookup with LLM fallback for unverified pairs

3\. \*\*Symptom Checker\*\* — General OTC-category guidance with emergency detection

4\. \*\*Prescription OCR\*\* — Upload a prescription image, extract and verify medicine names



\## Setup



\### Backend

\\`\\`\\`bash

cd backend

python -m venv venv

venv\\Scripts\\activate       # Windows

pip install -r requirements.txt

\\`\\`\\`



Create a `.env` file in `backend/` with:

\\`\\`\\`

GROQ\_API\_KEY=your\_key\_here

\\`\\`\\`



Set up the database:

\\`\\`\\`bash

python scripts/init\_db.py

python scripts/seed\_medicines.py

python scripts/seed\_interactions.py

\\`\\`\\`



Run the server:

\\`\\`\\`bash

uvicorn main:app --reload

\\`\\`\\`



\### Frontend

\\`\\`\\`bash

cd frontend

npm install

npm run dev

\\`\\`\\`



Visit `http://localhost:5173`.



\## Safety Design

\- All medicine facts are retrieved from a verified local database before being passed to the LLM (RAG), reducing hallucination risk

\- Drug interactions use a curated lookup table first, falling back to a clearly-labeled "unverified" LLM response only when no data exists

\- Symptom guidance is limited to general OTC categories — never specific dosing — with emergency keyword detection that bypasses the AI entirely

\- OCR-extracted text is cross-checked against the verified medicine database using fuzzy matching before being trusted

