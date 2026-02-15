from PIL import Image
import numpy as np

def analyze_image():
    try:
        img = Image.open("apple_pencil_source.png").convert("RGBA")
        print(f"Image mode: {img.mode}, size: {img.size}")
        
        # Check corners to confirm background color
        corners = [
            img.getpixel((0, 0)),
            img.getpixel((img.width-1, 0)),
            img.getpixel((0, img.height-1)),
            img.getpixel((img.width-1, img.height-1))
        ]
        print(f"Corner pixels: {corners}")
        
        # specific for finding white pixels in a dark image
        arr = np.array(img)
        gray = np.mean(arr[:, :, :3], axis=2)
        print(f"Mean brightness: {gray.mean()}")
        print(f"Max brightness: {gray.max()}")
        print(f"Min brightness: {gray.min()}")
        
        # Find white pixels (pencil body?)
        white_mask = gray > 200
        coords = np.argwhere(white_mask)
        
        if coords.size > 0:
            y0, x0 = coords.min(axis=0)
            y1, x1 = coords.max(axis=0) + 1
            print(f"White content bbox: x={x0}-{x1}, y={y0}-{y1}")
        else:
            print("No white content found!")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    analyze_image()
