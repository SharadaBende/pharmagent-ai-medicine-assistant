import requests
import json

response = requests.get(
    "https://api.fda.gov/drug/label.json",
    params={"search": "openfda.generic_name:acetaminophen", "limit": 1}
)
data = response.json()
result = data["results"][0]

# Print just the field names first, so it's not overwhelming
print(list(result.keys()))