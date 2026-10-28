import os
import sys
import numpy as np
import pandas as pd
from rapidfuzz import fuzz

BACKEND = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND)

from sentence_transformers import SentenceTransformer
from database import SessionLocal, Medicine

MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
ALIAS_CSV = os.path.join(BACKEND, "data", "aliases.csv")
CACHE_NPY = os.path.join(BACKEND, "ml", "medicine_vectors.npy")
CACHE_META = os.path.join(BACKEND, "ml", "medicine_meta.csv")

_model = None
_cache = None


def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def load_aliases() -> dict:
    if not os.path.exists(ALIAS_CSV):
        return {}
    df = pd.read_csv(ALIAS_CSV, dtype=str).fillna("")
    if "uses" not in df.columns:
        df["uses"] = ""
    return {
        r["generic_name"].strip().upper(): {"aliases": r["aliases"], "uses": r["uses"]}
        for _, r in df.iterrows()
    }


def medicine_text(m, aliases: dict) -> str:
    row = aliases.get((m.generic_name or "").strip().upper(), {"aliases": "", "uses": ""})
    return f"{m.generic_name}. Also known as: {row['aliases']}. Used for: {row['uses']}. Brand: {m.brand_name}."


def build_index():
    """Embed every medicine once and save the vectors to disk."""
    db = SessionLocal()
    meds = db.query(Medicine).all()
    db.close()
    aliases = load_aliases()
    vecs = get_model().encode(
        [medicine_text(m, aliases) for m in meds], normalize_embeddings=True
    )
    np.save(CACHE_NPY, vecs)
    pd.DataFrame(
        {"generic_name": [m.generic_name for m in meds],
         "brand_name": [m.brand_name for m in meds]}
    ).to_csv(CACHE_META, index=False)
    print(f"Indexed {len(meds)} medicines")


def _load_cache():
    global _cache
    if _cache is None:
        if not (os.path.exists(CACHE_NPY) and os.path.exists(CACHE_META)):
            build_index()
        _cache = (np.load(CACHE_NPY), pd.read_csv(CACHE_META, dtype=str).fillna(""))
    return _cache


def search_medicines(query: str, top_k: int = 5):
    vecs, meta = _load_cache()
    # wrap short queries in a sentence: helps MiniLM on one-word queries
    q = get_model().encode([f"medicine used for {query}"], normalize_embeddings=True)[0]
    scores = vecs @ q
    order = np.argsort(-scores)[:top_k]
    return [
        {"generic_name": meta.iloc[i]["generic_name"],
         "brand_name": meta.iloc[i]["brand_name"],
         "score": float(scores[i])}
        for i in order
    ]


def hybrid_search(query: str, top_k: int = 5, name_threshold: int = 85):
    """1) exact/fuzzy match on names and aliases, 2) fall back to embeddings."""
    q = query.strip().lower()
    aliases = load_aliases()
    _, meta = _load_cache()

    hits = []
    for _, row in meta.iterrows():
        gname = row["generic_name"].upper()
        names = [row["generic_name"].lower(), row["brand_name"].lower()]
        names += [a.strip().lower() for a in aliases.get(gname, {}).get("aliases", "").split(",") if a.strip()]
        best = max((fuzz.ratio(q, n) for n in names if n), default=0)
        if best >= name_threshold:
            hits.append({"generic_name": row["generic_name"], "brand_name": row["brand_name"],
                         "score": best / 100, "method": "name"})

    if hits:
        return sorted(hits, key=lambda h: -h["score"])[:top_k]

    results = search_medicines(query, top_k)
    for r in results:
        r["method"] = "semantic"
    return results


if __name__ == "__main__":
    build_index()
    for q in ["crocin", "pain relief", "पैरासिटामोल", "cholesterol", "एसिडिटी", "paracetamol"]:
        print(f"\nQuery: {q}")
        for r in hybrid_search(q, top_k=3):
            print(f"  {r['score']:.2f}  [{r['method']}]  {r['generic_name']} ({r['brand_name']})")
