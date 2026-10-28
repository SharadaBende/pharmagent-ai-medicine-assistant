import os, sys
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from embeddings import hybrid_search

BACKEND = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
df = pd.read_csv(os.path.join(BACKEND, "data", "search_eval.csv"), dtype=str)

top1 = top3 = 0
for _, r in df.iterrows():
    res = [x["generic_name"].upper() for x in hybrid_search(r["query"], top_k=3)]
    accepted = set(r["expected"].split("|"))
    ok1 = bool(res) and res[0] in accepted
    ok3 = any(x in accepted for x in res)
    top1 += ok1
    top3 += ok3
    print(f"{'OK ' if ok3 else 'BAD'} {r['query']!r} -> {res}")

n = len(df)
print(f"\nTop-1 accuracy: {top1}/{n} = {top1/n:.0%}")
print(f"Top-3 accuracy: {top3}/{n} = {top3/n:.0%}")
