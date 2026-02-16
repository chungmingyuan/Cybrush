from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageEnhance
import numpy as np

def process_pencil():
    try:
        # Load source
        img = Image.open("apple_pencil_source.png").convert("RGBA")
        
        # Desaturate to remove yellow tint (Apple Pencil is white/grey)
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(0.0) # 0.0 means full grayscale/no color
        
        # Capture the array for masking BEFORE we brighten the image
        # This prevents the background from becoming bright enough to be selected by the mask
        arr = np.array(img)
        
        # Custom contrast/brightness curve using a point function (LUT)
        # This brightens the light greys (body) to white, while keeping dark greys (logo) visible
        # Map: 0->0 (black stays black), 100->80 (dark grey stays somewhat dark), 150->255 (mid-grey becomes white)
        def lut(x):
            # Sigmoid-ish curve:
            # Below 128 (dark): keep relatively dark (x*0.8)
            # Above 128 (light): push quickly to 255
            if x < 100:
                return int(x * 0.9) 
            elif x > 180:
                return 255
            else:
                # Linear interpolation between 100->90 and 180->255
                return int(90 + (x - 100) * (165 / 80))

        # Apply LUT to each channel (since it's greyscale now, they are same)
        # We need to split, apply, and merge or just apply to the image if composite
        # Since enhance(0.0) makes it grayscale RGB (R=G=B), we can apply to L and convert back
        gray = img.convert("L")
        gray = gray.point(lut)
        img = gray.convert("RGBA")
        
        # Calculate brightness for MASK from the original (darker/desaturated) array
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
