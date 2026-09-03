from chat_service import ask_about_medicine

result = ask_about_medicine("What is this used for and how do I take it?", "ibuprofen")
print(result["answer"])
