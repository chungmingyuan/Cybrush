import numpy as np
import imageio
from PIL import Image, ImageDraw, ImageOps
import os

# Animation Settings
WIDTH, HEIGHT = 400, 500  # Vertical layout
BG_COLOR = (5, 5, 5)     # Match StartPage dark background
INK_COLOR = (212, 175, 55) # Gold color #D4AF37
DURATION = 0.04          # Frame duration
PENCIL_TIP_COLOR = (200, 200, 200)

def create_stroke(points, width_profile):
    """Interpolates points to create a smooth stroke."""
    # Simple interpolation for now
    interpolated = []
    for i in range(len(points) - 1):
        p1 = np.array(points[i])
        p2 = np.array(points[i+1])
        dist = np.linalg.norm(p2 - p1)
        steps = int(max(dist / 2, 1))
        for s in range(steps):
            t = s / steps
            interpolated.append(p1 * (1 - t) + p2 * t)
    interpolated.append(np.array(points[-1]))
    return interpolated

# Define "帥" (Shuai) strokes (Approximate coordinates)
# Offset for Vertical (Top)
O1 = (100, 50)
stroke_shuai = [
    # Top horizontal-ish
    [(120, 100), (180, 110), (280, 105)],
    # Left vertical
    [(140, 120), (145, 250)],
    # Middle structures
    [(160, 150), (240, 150), (240, 220)],
    [(160, 185), (240, 185)],
    [(190, 120), (195, 270)],
    # Right side
    [(260, 130), (320, 130), (310, 260)],
    [(260, 190), (310, 190)]
]

# Apply offset to Shuai
stroke_shuai = [[(p[0], p[1]) for p in s] for s in stroke_shuai]

# Define "筆" (Bi) strokes (Vertical layout - Bottom)
# Offset for Vertical (Bottom)
O2 = (100, 280)
stroke_bi = [
    # Bamboo radical (Top part of Bi)
    [(140, 300), (110, 320)], # Left part
    [(145, 310), (180, 310)],
    [(220, 300), (190, 320)], # Right part
    [(225, 310), (260, 310)],
    # Bottom part (Brush/Pen)
    [(130, 340), (270, 340)], # Top line
    [(150, 340), (150, 450)], # Left vertical
    [(250, 340), (250, 450)], # Right vertical
    [(150, 380), (250, 380)], # Mid line
    [(150, 420), (250, 420)], # Bottom line
    [(200, 340), (200, 480)]  # Main central vertical
]

all_strokes = stroke_shuai + stroke_bi

def generate_gif(output_path):
    frames = []
    canvas = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(canvas)
    
    # Track drawn strokes for persistence
    drawn_image = canvas.copy()
    
    for s_idx, stroke in enumerate(all_strokes):
        # Interpolate stroke for smooth animation
        points = create_stroke(stroke, None)
        
        for i in range(len(points)):
            # Draw on a temp frame to include the pencil tip
            frame = drawn_image.copy()
            f_draw = ImageDraw.Draw(frame)
            
            # Draw the ink on the persistent image
            p1 = points[i-1] if i > 0 else points[0]
            p2 = points[i]
            
            # Simulate brush pressure/width
            width = 8 + np.sin(i / 5) * 3
            
            # Persistent ink
            persistent_draw = ImageDraw.Draw(drawn_image)
            persistent_draw.line([tuple(p1), tuple(p2)], fill=INK_COLOR, width=int(width))
            
            # Draw the cumulative ink on frame
            frame.paste(drawn_image, (0,0))
            
            # Draw the "Pencil Tip" pointing at current position
            tip_pos = tuple(p2)
            f_draw.ellipse([tip_pos[0]-4, tip_pos[1]-4, tip_pos[0]+4, tip_pos[1]+4], fill=PENCIL_TIP_COLOR)
            
            frames.append(np.array(frame))
            
        # Add a few pause frames between strokes if desired
        for _ in range(3):
            frames.append(np.array(drawn_image))

    # Add final pause
    for _ in range(20):
        frames.append(np.array(drawn_image))

    imageio.mimsave(output_path, frames, duration=DURATION)
    print(f"GIF saved to {output_path}")

if __name__ == "__main__":
    generate_gif("cybrush-app/public/shuaibi_vertical.gif")
