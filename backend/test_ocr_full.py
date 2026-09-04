from ocr_service import process_prescription_image

result = process_prescription_image("test_prescription.png")

print("Raw text:")
print(result["raw_extracted_text"])
print("\nMatched medicines:")
for med in result["matched_medicines"]:
    print("-", med["generic_name"])
    