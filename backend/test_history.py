import requests

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzaGFyYWRhQGV4YW1wbGUuY29tIiwiZXhwIjoxNzg5Mzc3MTEwfQ.3gSCmP50kGvLkqq5ocotE6Eyy0WVzv72r2QTQepJnQs"

response = requests.get(
    "http://127.0.0.1:8000/history",
    headers={"Authorization": f"Bearer {token}"}
)

print(response.status_code)
print(response.json())