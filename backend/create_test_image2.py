from PIL import Image, ImageDraw

img = Image.new("RGB", (600, 250), color="white")
draw = ImageDraw.Draw(img)

text = """Dr. R. Patel, MD
Patient: Test Patient 2

Rx:
1. Simvastatin 20mg
   Take 1 tablet once daily at bedtime
"""

draw.multiline_text((20, 20), text, fill="black")
img.save("test_prescription2.png")
print("Test image 2 created.")