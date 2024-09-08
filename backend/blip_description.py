import torch
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration
import sys

# Suppress warnings
import warnings
warnings.filterwarnings(action="ignore", category=FutureWarning)

processor = BlipProcessor.from_pretrained('Salesforce/blip-image-captioning-large')
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large").to("cuda")

def generate_caption(image_path):
    try:
        raw_image = Image.open(image_path).convert('RGB')
    except Exception as e:
        print(f"Error opening image: {e}")
    text = "a photography of "
    inputs = processor(raw_image,text ,return_tensors="pt").to("cuda")
    out = model.generate(**inputs)
    caption = processor.decode(out[0], skip_special_tokens=True)
    return caption

if __name__ == "__main__":
    image_path = sys.argv[1]
    print(generate_caption(image_path))
