from symptom_service import suggest_for_symptom

# Emergency case
result1 = suggest_for_symptom("I have severe chest pain and difficulty breathing")
print("EMERGENCY TEST:", result1)

print()

# Normal case
result2 = suggest_for_symptom("I have a mild headache")
print("NORMAL TEST:", result2)