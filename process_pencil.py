from PIL import Image, ImageDraw, ImageFilter, ImageOps
import numpy as np

def process_pencil():
    try:
        # Load source
        img = Image.open("apple_pencil_source.png").convert("RGBA")
        
        # Create mask from brightness
        arr = np.array(img)
        # Calculate brightness
        brightness = np.mean(arr[:, :, :3], axis=2)
        
        # Create alpha channel: 0 if dark, 255 if bright
        # Use sigmoid-like smoothstep for nice edges
        # Threshold around 40-60
        
        mask_high = brightness > 40
        alpha = np.zeros_like(brightness, dtype=np.uint8)
        alpha[mask_high] = 255
        
        # Create mask image
        mask_img = Image.fromarray(alpha, mode='L')
        # Blur mask slightly for AA (radius 1 is good)
        mask_img = mask_img.filter(ImageFilter.GaussianBlur(1.0))
        
        # Apply mask to alpha channel
        img.putalpha(mask_img)
        
        # Crop to content
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            img.save("apple_pencil_ultimate.png")
            print(f"Saved apple_pencil_ultimate.png with size {img.size}")
            
            # Determine tip location (bottom center)
            w, h = img.size
            tip_x = w // 2
            tip_y = h - 2 # Approx very bottom
            print(f"Estimated Tip Location: ({tip_x}, {tip_y})")
        else:
            print("No content found after masking!")
            
    except Exception as e:
        print(f"Error processing pencil: {e}")

if __name__ == "__main__":
    process_pencil()
