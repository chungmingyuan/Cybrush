import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
import re
import math
import imageio

# Character Data (帥筆)
SHUAI_DATA = {
    "strokes": [
        "M 236 580 Q 278 629 302 662 Q 351 735 374 754 Q 392 770 376 784 Q 357 797 328 803 Q 301 809 289 803 Q 277 797 285 786 Q 300 755 218 583 Q 217 583 217 582 C 203 556 217 557 236 580 Z",
        "M 222 320 Q 222 375 224 416 L 225 444 Q 225 543 229 548 C 232 570 232 570 217 582 Q 202 597 180 604 Q 170 608 158 605 Q 151 599 157 587 Q 176 517 178 494 Q 190 290 159 168 Q 144 113 181 66 Q 191 53 203 65 Q 213 80 219 144 L 220 176 Q 220 260 221 292 L 222 320 Z",
        "M 407 478 Q 431 548 459 565 Q 474 581 460 597 Q 394 651 344 618 Q 314 606 236 580 C 208 570 180 538 229 548 Q 239 549 253 555 Q 307 568 358 583 Q 371 587 377 582 Q 384 575 382 558 Q 372 515 361 481 C 352 452 397 450 407 478 Z",
        "M 224 416 Q 240 412 256 415 Q 308 430 422 445 Q 432 446 433 456 Q 433 463 407 478 L 361 481 Q 357 481 355 480 Q 283 456 225 444 C 196 438 195 422 224 416 Z",
        "M 406 204 Q 430 271 458 296 Q 474 314 459 330 Q 387 384 335 353 Q 263 329 222 320 C 193 313 191 289 221 292 Q 230 291 354 316 Q 364 317 370 314 Q 377 307 376 291 Q 367 245 357 207 C 350 178 396 176 406 204 Z",
        "M 219 144 Q 229 141 243 145 Q 298 158 420 169 Q 430 170 432 179 Q 432 188 406 204 C 391 213 387 212 357 207 L 355 207 Q 280 188 220 176 C 191 170 189 149 219 144 Z",
        "M 546 529 Q 528 547 497 544 Q 484 540 490 529 Q 526 457 496 346 Q 472 304 506 258 L 508 256 Q 515 243 524 249 Q 552 270 553 349 Q 554 466 557 495 C 559 518 559 518 546 529 Z",
        "M 704 523 Q 806 544 819 531 Q 835 518 833 472 Q 830 427 828 371 Q 828 331 814 315 Q 808 303 784 309 Q 765 312 744 315 Q 728 319 723 313 Q 719 309 734 298 Q 786 258 816 223 Q 832 208 852 216 Q 865 222 875 252 Q 897 298 894 357 Q 885 484 897 527 Q 904 543 898 552 Q 876 567 841 581 Q 822 588 807 582 Q 773 566 705 554 L 648 542 Q 602 535 546 529 C 516 526 527 492 557 495 Q 564 495 573 496 Q 613 505 648 511 L 704 523 Z",
        "M 648 511 Q 648 235 643 148 Q 640 -42 660 -72 Q 675 -88 684 -66 Q 703 -21 702 332 Q 702 441 704 523 L 705 554 Q 706 647 711 702 Q 712 736 731 766 Q 738 782 717 799 Q 692 818 647 831 Q 626 835 613 821 Q 603 814 616 800 Q 647 775 649 738 Q 649 665 648 542 L 648 511 Z"
    ],
    "medians": [
        [[292, 793], [305, 787], [327, 762], [253, 621], [233, 593], [225, 594]],
        [[165, 597], [196, 555], [202, 502], [200, 288], [186, 132], [192, 72]],
        [[221, 577], [242, 566], [370, 607], [398, 601], [419, 580], [391, 502], [369, 486]],
        [[231, 423], [362, 459], [398, 461], [423, 455]],
        [[223, 299], [236, 308], [361, 340], [393, 333], [415, 308], [389, 230], [363, 212]],
        [[225, 149], [244, 163], [356, 185], [399, 186], [422, 179]],
        [[497, 535], [524, 514], [531, 486], [530, 382], [518, 310], [518, 258]],
        [[554, 525], [577, 514], [811, 559], [830, 556], [852, 542], [862, 519], [861, 348], [844, 286], [833, 272], [816, 274], [729, 311]],
        [[621, 811], [648, 805], [685, 770], [676, 587], [671, -66]]
    ]
}

BI_DATA = {
    "strokes": [
        "M 389 780 Q 401 796 413 810 Q 423 822 410 837 Q 371 873 344 870 Q 334 869 334 854 Q 341 767 232 656 Q 211 637 202 624 Q 192 609 208 613 Q 259 617 343 716 Q 352 731 371 755 L 389 780 Z",
        "M 371 755 Q 407 740 446 750 Q 477 754 509 759 Q 524 762 526 764 Q 533 771 530 778 Q 524 788 499 795 Q 478 799 416 783 Q 401 783 389 780 C 360 774 343 766 371 755 Z",
        "M 363 672 Q 396 641 421 633 Q 434 632 440 644 Q 444 656 439 669 Q 432 688 416 696 Q 401 702 384 703 Q 357 709 348 703 Q 344 702 347 691 Q 348 682 363 672 Z",
        "M 673 813 Q 680 823 687 831 Q 696 843 682 856 Q 643 883 618 881 Q 608 878 611 865 Q 623 801 556 715 Q 552 709 549 703 Q 542 690 555 694 Q 598 700 650 777 L 673 813 Z",
        "M 650 777 Q 654 777 657 776 Q 675 773 781 789 Q 853 804 858 806 Q 867 813 863 821 Q 856 831 830 839 Q 802 846 775 835 Q 744 826 712 819 Q 693 816 673 813 C 643 809 620 781 650 777 Z",
        "M 646 704 Q 680 671 709 667 Q 722 667 728 680 Q 731 692 726 706 Q 716 725 699 733 Q 653 749 628 735 Q 622 734 627 723 Q 630 713 646 704 Z",
        "M 685 402 Q 697 438 707 461 L 730 505 Q 743 524 758 536 Q 776 555 761 573 Q 689 633 628 606 Q 585 591 548 580 L 490 567 Q 412 554 332 546 Q 314 545 316 535 Q 319 526 338 519 Q 363 507 401 519 Q 444 528 490 536 L 546 546 Q 583 556 622 562 Q 650 569 661 557 Q 673 544 660 493 L 651 458 Q 644 434 636 411 C 626 383 675 374 685 402 Z",
        "M 707 461 Q 785 467 946 467 Q 967 468 971 476 Q 977 488 960 502 Q 906 542 845 527 Q 793 517 730 505 L 660 493 Q 603 486 544 476 L 491 468 Q 320 446 124 422 Q 103 421 119 403 Q 152 373 188 383 Q 347 429 491 442 L 543 449 Q 591 455 651 458 L 707 461 Z",
        "M 541 356 Q 608 365 695 370 Q 705 371 707 379 Q 707 386 685 402 L 636 411 Q 633 412 631 411 Q 585 402 542 393 L 491 384 Q 400 371 323 363 Q 304 362 315 343 Q 325 330 377 335 Q 423 344 491 350 L 541 356 Z",
        "M 491 281 Q 394 265 309 250 Q 290 246 311 230 Q 329 217 367 222 Q 431 232 491 241 L 541 248 Q 614 260 680 267 Q 705 270 697 284 Q 687 300 660 306 Q 636 310 541 291 L 491 281 Z",
        "M 491 172 Q 364 157 216 141 Q 197 140 211 123 Q 224 110 241 104 Q 262 98 277 103 Q 370 127 474 137 Q 481 138 490 138 L 541 144 Q 604 150 818 150 Q 837 149 842 158 Q 848 168 832 182 Q 781 221 746 213 Q 667 198 541 179 L 491 172 Z",
        "M 548 580 Q 552 604 565 625 Q 572 641 552 655 Q 530 673 489 683 Q 471 687 460 674 Q 450 667 462 655 Q 487 633 490 602 Q 490 586 490 567 L 490 536 Q 490 506 491 468 L 491 442 Q 491 415 491 384 L 491 350 Q 494 304 491 281 L 491 241 Q 491 204 491 172 L 490 138 Q 481 -13 499 -77 Q 500 -83 505 -89 Q 518 -102 527 -83 Q 540 -41 541 144 L 541 179 Q 541 212 541 248 L 541 291 Q 541 325 541 356 L 542 393 Q 542 424 543 449 L 544 476 Q 544 516 546 546 L 548 580 Z"
    ],
    "medians": [
        [[347, 857], [369, 827], [370, 817], [352, 778], [292, 690], [257, 655], [211, 622]],
        [[380, 758], [476, 775], [519, 774]],
        [[355, 696], [406, 671], [423, 651]],
        [[621, 870], [647, 837], [643, 824], [594, 736], [559, 703]],
        [[654, 783], [684, 796], [799, 817], [853, 816]],
        [[637, 728], [689, 706], [709, 687]],
        [[326, 536], [361, 531], [465, 546], [642, 588], [664, 588], [695, 572], [710, 552], [671, 435], [643, 415]],
        [[121, 413], [177, 404], [353, 438], [844, 497], [903, 498], [960, 482]],
        [[321, 352], [380, 352], [628, 388], [676, 387], [697, 379]],
        [[310, 240], [372, 241], [613, 282], [662, 286], [685, 279]],
        [[214, 132], [267, 124], [443, 151], [756, 182], [795, 177], [831, 164]],
        [[467, 665], [491, 659], [524, 629], [516, 435], [515, -82]]
    ]
}

def parse_svg_path(path_str):
    tokens = re.findall(r"([A-Z])|([-+]?\d*\.\d+|[-+]?\d+)", path_str)
    commands, current_cmd, coords = [], None, []
    for cmd, val in tokens:
        if cmd:
            if current_cmd: commands.append((current_cmd, coords))
            current_cmd, coords = cmd, []
        else: coords.append(float(val))
    if current_cmd: commands.append((current_cmd, coords))
    return commands

def get_bezier_point(points, t):
    if len(points) == 2: return points[0] + (points[1] - points[0]) * t
    if len(points) == 3: return (1-t)**2 * points[0] + 2*(1-t)*t * points[1] + t**2 * points[2]
    if len(points) == 4: return (1-t)**3 * points[0] + 3*(1-t)**2*t * points[1] + 3*(1-t)*t**2 * points[2] + t**3 * points[3]
    return points[0]

def path_to_points(commands, steps=30):
    all_pts, curr, start = [], np.array([0.0, 0.0]), np.array([0.0, 0.0])
    for cmd, coords in commands:
        if cmd == 'M': curr = start = np.array([coords[0], coords[1]]); all_pts.append(curr)
        elif cmd == 'L':
            target = np.array([coords[0], coords[1]])
            for t in np.linspace(0, 1, steps)[1:]: all_pts.append(curr + (target - curr) * t)
            curr = target
        elif cmd == 'Q':
            p1, p2 = np.array([coords[0], coords[1]]), np.array([coords[2], coords[3]])
            for t in np.linspace(0, 1, steps)[1:]: all_pts.append(get_bezier_point([curr, p1, p2], t))
            curr = p2
        elif cmd == 'C':
            p1, p2, p3 = np.array([coords[0], coords[1]]), np.array([coords[2], coords[3]]), np.array([coords[4], coords[5]])
            for t in np.linspace(0, 1, steps)[1:]: all_pts.append(get_bezier_point([curr, p1, p2, p3], t))
            curr = p3
        elif cmd == 'Z':
            target = start
            for t in np.linspace(0, 1, steps)[1:]: all_pts.append(curr + (target - curr) * t)
            curr = target
    return [tuple(p) for p in all_pts]

def interpolate_medians(medians, steps_per_seg=22): 
    pts = []
    medians = [np.array(p) for p in medians]
    for i in range(len(medians) - 1):
        for t in np.linspace(0, 1, steps_per_seg): pts.append(tuple(medians[i] + (medians[i+1] - medians[i]) * t))
    return pts

def render_animation():
    W, H = 1400, 2400 # TALLER FOR VERTICAL
    scale = 0.8
    # VERTICAL STACK OFFSETS
    shua_offset, bi_offset = np.array([200, 150]), np.array([200, 1150]) 
    
    def transform_pt(p, offset): return (p[0] * scale + offset[0], (1024 - p[1]) * scale + offset[1])

    shua_strokes = [[transform_pt(p, shua_offset) for p in path_to_points(parse_svg_path(s))] for s in SHUAI_DATA["strokes"]]
    bi_strokes = [[transform_pt(p, bi_offset) for p in path_to_points(parse_svg_path(s))] for s in BI_DATA["strokes"]]
    shua_medians = [[transform_pt(p, shua_offset) for p in interpolate_medians(m)] for m in SHUAI_DATA["medians"]]
    bi_medians = [[transform_pt(p, bi_offset) for p in interpolate_medians(m)] for m in BI_DATA["medians"]]

    # Load Tip
    orig_tip = Image.open("apple_pencil_ultimate.png").convert("RGBA")
    
    fixed_angle, tip_rescale = -25, 0.45 
    orig_tip_x, orig_tip_y = 66, 909
    tr_w, tr_h = int(orig_tip.width * tip_rescale), int(orig_tip.height * tip_rescale)
    tip_img = orig_tip.resize((tr_w, tr_h), Image.LANCZOS)
    tip_red_x, tip_red_y = orig_tip_x * tip_rescale, orig_tip_y * tip_rescale
    rotated_tip = tip_img.rotate(fixed_angle, expand=True, resample=Image.BICUBIC)
    rw, rh = rotated_tip.size
    cx, cy = tr_w / 2, tr_h / 2
    theta = math.radians(-fixed_angle) 
    rel_x, rel_y = tip_red_x - cx, tip_red_y - cy
    rot_x = rel_x * math.cos(theta) - rel_y * math.sin(theta)
    rot_y = rel_x * math.sin(theta) + rel_y * math.cos(theta)
    final_tip_x, final_tip_y = rot_x + rw / 2, rot_y + rh / 2

    # PRE-RENDER FULL STROKE MASKS
    def get_stroke_mask(outline):
        mask = Image.new("L", (W, H), 0)
        ImageDraw.Draw(mask).polygon(outline, fill=255)
        return mask

    shua_masks = [get_stroke_mask(s) for s in shua_strokes]
    bi_masks = [get_stroke_mask(s) for s in bi_strokes]

    frames, ink_color = [], (0, 0, 0, 255)
    canvas = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    char_sequence = [(shua_strokes, shua_medians, shua_masks), (bi_strokes, bi_medians, bi_masks)]
    
    # INITIAL HOLD (BLANK PAPER)
    blank_frame = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    for _ in range(15): frames.append(blank_frame)

    for strokes, medians, masks in char_sequence:
        for i in range(len(strokes)):
            stroke_median = medians[i]
            stroke_mask = masks[i]
            num_pts, step = len(stroke_median), 14
            
            # FRAME: TIP ARRIVAL
            tip_p_start = stroke_median[0]
            arr_frame = Image.new("RGBA", (W, H), (255, 255, 255, 255))
            arr_frame.paste(canvas, (0,0), canvas)
            paste_pos_start = (int(tip_p_start[0] - final_tip_x), int(tip_p_start[1] - final_tip_y))
            arr_frame.paste(rotated_tip, paste_pos_start, rotated_tip)
            frames.append(arr_frame)

            # RENDER STROKE
            for j in range(0, num_pts + 1, step):
                limit = min(j, num_pts)
                if limit > 0:
                    brush_layer = Image.new("RGBA", (W, H), (0,0,0,0))
                    brush_draw = ImageDraw.Draw(brush_layer)
                    start_k = max(0, limit - step)
                    for k in range(start_k, limit):
                        p, r = stroke_median[k], 100
                        brush_draw.ellipse([p[0]-r, p[1]-r, p[0]+r, p[1]+r], fill=ink_color)
                    masked_release = Image.new("RGBA", (W, H), (0,0,0,0))
                    masked_release.paste(brush_layer, (0,0), stroke_mask)
                    canvas.paste(masked_release, (0,0), masked_release)
                
                frame = Image.new("RGBA", (W, H), (255, 255, 255, 255))
                frame.paste(canvas, (0,0), canvas)
                tip_p = stroke_median[min(limit, num_pts - 1)]
                paste_pos = (int(tip_p[0] - final_tip_x), int(tip_p[1] - final_tip_y))
                frame.paste(rotated_tip, paste_pos, rotated_tip)
                frames.append(frame)
                if limit >= num_pts: break
            
            # FRAME: TIP REMOVAL
            rem_frame = Image.new("RGBA", (W, H), (255, 255, 255, 255))
            rem_frame.paste(canvas, (0,0), canvas)
            frames.append(rem_frame)

    # FINAL HOLD
    final_canvas_only = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    final_canvas_only.paste(canvas, (0,0), canvas)
    for _ in range(30): frames.append(final_canvas_only)

    if len(frames) > 400: frames = frames[::2]
    frames[0].save("shuaibi_vertical_ultimate_v2.gif", save_all=True, append_images=frames[1:], duration=45, loop=0)
    print("Vertical Ultimate V2 animation saved with black ink on white bg.")

if __name__ == "__main__":
    render_animation()
