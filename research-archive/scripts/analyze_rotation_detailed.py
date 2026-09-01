import json
import numpy as np

# Load Video 3 poses
with open('qb_throw_video3_poses.json', 'r') as f:
    video3_data = json.load(f)

sequence = video3_data['poses']

print("=== DETAILED ROTATION ANALYSIS ===")
print("Looking for: Right shoulder/hip BEHIND left (negative z) → Square (similar z)\n")

print("Frame | Time  | L.Shldr Z | R.Shldr Z | Diff  | L.Hip Z | R.Hip Z | Diff  | Rotation")
print("-" * 95)

for i, pose in enumerate(sequence):
    lm = pose['landmarks']
    
    # Shoulders: 11=left, 12=right
    left_shoulder_z = lm[11]['z']
    right_shoulder_z = lm[12]['z']
    shoulder_diff = right_shoulder_z - left_shoulder_z
    
    # Hips: 23=left, 24=right  
    left_hip_z = lm[23]['z']
    right_hip_z = lm[24]['z']
    hip_diff = right_hip_z - left_hip_z
    
    # Determine rotation state
    # If right side is MORE NEGATIVE (further back), that's rotated
    # If both are similar, that's square
    if shoulder_diff < -0.3:
        rotation = "ROTATED (R back)"
    elif shoulder_diff > 0.3:
        rotation = "ROTATED (L back)"
    else:
        rotation = "SQUARE"
    
    print(f"{i:2d}    | {pose['timestamp']:.2f}s | {left_shoulder_z:+.3f}    | {right_shoulder_z:+.3f}     | {shoulder_diff:+.3f} | {left_hip_z:+.3f}  | {right_hip_z:+.3f}   | {hip_diff:+.3f} | {rotation}")

print("\n" + "="*95)
print("INTERPRETATION:")
print("- Negative diff (right < left): Right side is BEHIND (rotated stance)")
print("- Positive diff (right > left): Right side is AHEAD (shouldn't happen for right-handed QB)")
print("- Near zero diff: Body is SQUARE/FLAT")
print("="*95)

