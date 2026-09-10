import requests

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzaGFyYWRhQGV4YW1wbGUuY29tIiwiZXhwIjoxNzg5NjI3NDcxfQ.0rsmp85TSgZ0CLttO_VceYDaYfouo_IOosVh3-bpoWA"
headers = {"Authorization": f"Bearer {token}"}

# Create a reminder
create_response = requests.post(
    "http://127.0.0.1:8000/reminders",
    json={
        "medicine_name": "metformin",
        "dosage_note": "1 tablet",
        "time_of_day": "08:00",
        "frequency": "daily"
    },
    headers=headers
)
print("Create:", create_response.json())

# List reminders
list_response = requests.get("http://127.0.0.1:8000/reminders", headers=headers)
print("List:", list_response.json())