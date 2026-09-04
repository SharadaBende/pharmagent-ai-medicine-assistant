from PIL import Image, ImageDraw, ImageFont

img = Image.new("RGB", (600, 300), color="white")
draw = ImageDraw.Draw(img)

text = """Dr. A. Sharma, MD
Patient: Test Patient

Rx:
1. Ibuprofen 400mg
   Take 1 tablet twice daily after food

2. Amoxicillin 500mg
   Take 1 capsule three times daily for 5 days
"""

draw.multiline_text((20, 20), text, fill="black")
img.save("test_prescription.png")
print("Test image created.")