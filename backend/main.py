from fastapi import FastAPI

app = FastAPI(title="PharmAgent AI Medicine Assistant")

@app.get("/health")
def health_check():
    return {"status": "ok"}