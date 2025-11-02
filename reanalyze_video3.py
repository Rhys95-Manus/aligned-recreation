import json
import numpy as np

# Load Video 3
with open('qb_throw_video3_poses.json', 'r') as f:
    video3_data = json.load(f)

sequence = video3_data['poses']

print(f"=== RE-ANALYZING VIDEO 3 WITH CORRECT FRONT-FACING DETECTION ===")
print(f"Total frames: {len(sequence)}\n")

# Analyze all frames
frame_analysis = []
for i, pose in enumerate(sequence):
    lm = pose['landmarks']
    
    # Right elbow angle
    shoulder = np.array([lm[12]['x'], lm[12]['y'], lm[12]['z']])
    elbow = np.array([lm[14]['x'], lm[14]['y'], lm[14]['z']])
    wrist = np.array([lm[16]['x'], lm[16]['y'], lm[16]['z']])
    
    v1 = shoulder - elbow
    v2 = wrist - elbow
    elbow_angle = np.degrees(np.arccos(np.clip(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)), -1, 1)))
    
    wrist_height = lm[16]['y']
    hip_rotation = abs(lm[23]['z'] - lm[25]['z'])
    shoulder_rotation = abs(lm[11]['z'] - lm[12]['z'])
    
    # CORRECT front-facing check: depth should be larger than width
    shoulder_width = abs(lm[11]['x'] - lm[12]['x'])
    shoulder_depth = abs(lm[11]['z'] - lm[12]['z'])
    front_ratio = shoulder_depth / shoulder_width if shoulder_width > 0.001 else 0
    
    frame_analysis.append({
        'index': i,
        'timestamp': pose['timestamp'],
        'elbow_angle': elbow_angle,
        'wrist_height': wrist_height,
        'hip_rotation': hip_rotation,
        'shoulder_rotation': shoulder_rotation,
        'shoulder_width': shoulder_width,
        'shoulder_depth': shoulder_depth,
        'front_ratio': front_ratio,
        'is_front_facing': front_ratio > 1.0
    })

# Count front-facing frames
front_count = sum(1 for f in frame_analysis if f['is_front_facing'])
print(f"Front-facing frames: {front_count}/{len(frame_analysis)} ({100*front_count/len(frame_analysis):.1f}%)\n")

# Print progression
print("Frame progression (every 3rd frame):")
print("Frame | Time | Elbow | Hip Rot | Width | Depth | Ratio | Front?")
print("-" * 75)
for i in range(0, len(frame_analysis), 3):
    f = frame_analysis[i]
    front_str = "YES ✓" if f['is_front_facing'] else "no  ✗"
    print(f"{i:2d}    | {f['timestamp']:.2f}s | {f['elbow_angle']:5.1f}° | {f['hip_rotation']:.3f}   | {f['shoulder_width']:.3f} | {f['shoulder_depth']:.3f} | {f['front_ratio']:.2f}  | {front_str}")

# Find key phases
min_elbow_idx = min(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['elbow_angle'])
max_elbow_idx = max(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['elbow_angle'])

print(f"\nCocking (min elbow): Frame {min_elbow_idx} at {frame_analysis[min_elbow_idx]['timestamp']:.2f}s, {frame_analysis[min_elbow_idx]['elbow_angle']:.1f}°")
print(f"Follow-through (max elbow): Frame {max_elbow_idx} at {frame_analysis[max_elbow_idx]['timestamp']:.2f}s, {frame_analysis[max_elbow_idx]['elbow_angle']:.1f}°\n")

# Select keyframes
neutral_idx = 0
wind_up_idx = (neutral_idx + min_elbow_idx) // 2
cocking_idx = min_elbow_idx
accel_idx = (cocking_idx + max_elbow_idx) // 2
release_idx = max(range(cocking_idx, min(cocking_idx + 10, len(frame_analysis))), 
                  key=lambda i: frame_analysis[i]['elbow_angle']) if cocking_idx < len(frame_analysis) - 10 else accel_idx
follow_idx = max_elbow_idx

keyframe_indices = [neutral_idx, wind_up_idx, cocking_idx, accel_idx, release_idx, follow_idx]
phase_names = ['Neutral', 'Wind-up', 'Cocking', 'Acceleration', 'Release', 'Follow-through']

print("=== SELECTED KEYFRAMES ===\n")
for name, idx in zip(phase_names, keyframe_indices):
    f = frame_analysis[idx]
    front_str = "✓" if f['is_front_facing'] else "✗"
    print(f"{name}:")
    print(f"  Frame: {idx}, Time: {f['timestamp']:.2f}s")
    print(f"  Elbow: {f['elbow_angle']:.1f}°")
    print(f"  Hip rotation: {f['hip_rotation']:.3f}")
    print(f"  Shoulder depth: {f['shoulder_depth']:.3f}")
    print(f"  Front-facing: {front_str} (depth/width ratio: {f['front_ratio']:.2f})")
    print()

print(f"\n{'='*75}")
print(f"VERDICT: This video is {'FRONT-FACING ✓' if front_count > len(frame_analysis) * 0.5 else 'SIDE-VIEW ✗'}")
print(f"{'='*75}")

