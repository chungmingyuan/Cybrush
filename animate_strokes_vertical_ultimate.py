import numpy as np
import imageio
from PIL import Image, ImageDraw
import os

# Animation Settings
WIDTH, HEIGHT = 400, 600  # Tall for vertical layout
BG_COLOR = (8, 8, 8)      # Deep charcoal/black
INK_COLOR = (212, 175, 55) # Gold #D4AF37
TIP_COLOR = (240, 240, 240) # Bright tip for contrast
DURATION = 0.03            # Fast, smooth cadence

def create_smooth_path(points, density=3):
    interpolated = []
    for i in range(len(points) - 1):
        p1 = np.array(points[i])
        p2 = np.array(points[i+1])
        dist = np.linalg.norm(p2 - p1)
        steps = int(max(dist * density, 2))
        for s in range(steps):
            t = s / steps
            interpolated.append(tuple(p1 * (1 - t) + p2 * t))
    interpolated.append(points[-1])
    return interpolated

# --- STROKE DATA FOR "帥" (TOP) ---
# Centered at (200, 150)
S_OFF = (200, 140)
strokes_shuai = [
    # Radical (Left side)
    [(S_OFF[0]-70, S_OFF[1]-50), (S_OFF[0]-65, S_OFF[1]+80)], # Vertical
    [(S_OFF[0]-70, S_OFF[1]-30), (S_OFF[0]-30, S_OFF[1]-35)], # Horizontal
    [(S_OFF[0]-70, S_OFF[1]+30), (S_OFF[0]-30, S_OFF[1]+25)], # Horizontal
    # Right Side Top
    [(S_OFF[0]-10, S_OFF[1]-60), (S_OFF[0]+70, S_OFF[1]-60)], # Top bar
    [(S_OFF[0]-10, S_OFF[1]-60), (S_OFF[0]-10, S_OFF[1]-10), (S_OFF[0]+60, S_OFF[1]-10)], # Box
    [(S_OFF[0]+60, S_OFF[1]-60), (S_OFF[0]+60, S_OFF[1]-10)], 
    # Right Side Bottom (巾)
    [(S_OFF[0]-10, S_OFF[1]+10), (S_OFF[0]+60, S_OFF[1]+10)], # Top of Jin
    [(S_OFF[0]-10, S_OFF[1]+10), (S_OFF[0]-10, S_OFF[1]+80)], # Left vertical
    [(S_OFF[0]+60, S_OFF[1]+10), (S_OFF[0]+60, S_OFF[1]+80)], # Right vertical
    [(S_OFF[0]+25, S_OFF[1]-20), (S_OFF[0]+25, S_OFF[1]+110)]  # Main central vertical
]

# --- STROKE DATA FOR "筆" (BOTTOM) ---
# Centered at (200, 420)
B_OFF = (200, 420)
strokes_bi = [
    # Bamboo Radical (Top of Bi)
    [(B_OFF[0]-70, B_OFF[1]-90), (B_OFF[0]-40, B_OFF[1]-70)], # Left hook
    [(B_OFF[0]-60, B_OFF[1]-75), (B_OFF[0]-20, B_OFF[1]-75)], 
    [(B_OFF[0]+20, B_OFF[1]-90), (B_OFF[0]+50, B_OFF[1]-70)], # Right hook
    [(B_OFF[0]+30, B_OFF[1]-75), (B_OFF[0]+70, B_OFF[1]-75)],
    # Bottom Body
    [(B_OFF[0]-60, B_OFF[1]-40), (B_OFF[0]+60, B_OFF[1]-45)], # High horizontal
    [(B_OFF[0]-50, B_OFF[1]-10), (B_OFF[0]+50, B_OFF[1]-12)], # Mid horizontal
    [(B_OFF[0]-40, B_OFF[1]+20), (B_OFF[0]+40, B_OFF[1]+18)], # Low horizontal
    [(B_OFF[0]-55, B_OFF[1]-40), (B_OFF[0]-55, B_OFF[1]+50)], # Left side
    [(B_OFF[0]+55, B_OFF[1]-45), (B_OFF[0]+55, B_OFF[1]+50)], # Right side
    [(B_OFF[0], B_OFF[1]-60), (B_OFF[0], B_OFF[1]+100), (B_OFF[0]-15, B_OFF[1]+85)] # Main vertical with hook
]

all_strokes = strokes_shuai + strokes_bi

def run_animation():
    frames = []
    base_canvas = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    ink_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0,0,0,0))
    
    for s_idx, stroke in enumerate(all_strokes):
        path = create_smooth_path(stroke)
        
        for i, point in enumerate(path):
            # Create a frame
            frame = base_canvas.copy()
            
            # Draw persistent ink
            draw_ink = ImageDraw.Draw(ink_layer)
            if i > 0:
                p1 = path[i-1]
                p2 = point
                # Variable width for "brush" feel
                w = 10 + np.sin(i * 0.2) * 4
                draw_ink.line([p1, p2], fill=INK_COLOR + (255,), width=int(w))
            
            # Composite ink onto frame
            frame.paste(ink_layer, (0,0), ink_layer)
            
            # Draw Pencil Tip
            draw_frame = ImageDraw.Draw(frame)
            tx, ty = point
            # Subtle tip shadow/glow
            draw_frame.ellipse([tx-5, ty-5, tx+5, ty+5], fill=TIP_COLOR)
            
            frames.append(np.array(frame))
            
        # Pause briefly after each stroke
        last_frame = frames[-1]
        for _ in range(2):
            frames.append(last_frame)

    # Long pause at the end
    for _ in range(30):
        frames.append(frames[-1])

    imageio.mimsave("cybrush-app/public/shuaibi_vertical_ultimate.gif", frames, duration=DURATION, loop=0)
    print("Vertical Ultimate GIF created successfully.")

if __name__ == "__main__":
    run_animation()
