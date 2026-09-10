from chat_service import ask_about_medicine

result = ask_about_medicine("What is this used for?", "ibuprofen", language="hi")
print(result["answer"])