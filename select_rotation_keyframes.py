import json
import numpy as np

# Load Video 3 poses
with open('qb_throw_video3_poses.json', 'r') as f:
    video3_data = json.load(f)

sequence = video3_data['poses']

print("=== SELECTING KEYFRAMES WITH MAXIMUM ROTATION PROGRESSION ===\n")

# Analyze rotation for each frame
frame_data = []
for i, pose in enumerate(sequence):
    lm = pose['landmarks']
    
    # Shoulders and hips
    shoulder_diff = lm[12]['z'] - lm[11]['z']  # Right - Left (positive = right is behind)
    hip_diff = lm[24]['z'] - lm[23]['z']
    
    # Elbow angle
    shoulder = np.array([lm[12]['x'], lm[12]['y'], lm[12]['z']])
    elbow = np.array([lm[14]['x'], lm[14]['y'], lm[14]['z']])
    wrist = np.array([lm[16]['x'], lm[16]['y'], lm[16]['z']])
    
    v1 = shoulder - elbow
    v2 = wrist - elbow
    elbow_angle = np.degrees(np.arccos(np.clip(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)), -1, 1)))
    
    # Weight transfer: compare z-coordinates of feet
    # Right foot (back): 32, Left foot (front): 31
    right_foot_z = lm[32]['z']
    left_foot_z = lm[31]['z']
    foot_diff = right_foot_z - left_foot_z  # Positive = right foot is behind
    
    frame_data.append({
        'index': i,
        'timestamp': pose['timestamp'],
        'shoulder_rotation': shoulder_diff,
        'hip_rotation': hip_diff,
        'elbow_angle': elbow_angle,
        'foot_diff': foot_diff
    })

# Select 6 keyframes showing progression from rotated to square
# Phase 1 (Neutral): Max rotation, elbow moderate
# Phase 2 (Wind-up): High rotation, elbow decreasing
# Phase 3 (Cocking): High rotation, min elbow
# Phase 4 (Acceleration): Rotation decreasing, elbow increasing
# Phase 5 (Release): Low rotation, elbow high
# Phase 6 (Follow-through): Min rotation (square), elbow max

# Find frames with max and min rotation
max_rotation_idx = max(range(len(frame_data)), key=lambda i: frame_data[i]['shoulder_rotation'])
min_rotation_idx = min(range(len(frame_data)), key=lambda i: frame_data[i]['shoulder_rotation'])

# Find min elbow (cocking)
min_elbow_idx = min(range(len(frame_data)), key=lambda i: frame_data[i]['elbow_angle'])

print(f"Max rotation: Frame {max_rotation_idx} ({frame_data[max_rotation_idx]['shoulder_rotation']:.3f})")
print(f"Min rotation: Frame {min_rotation_idx} ({frame_data[min_rotation_idx]['shoulder_rotation']:.3f})")
print(f"Min elbow: Frame {min_elbow_idx} ({frame_data[min_elbow_idx]['elbow_angle']:.1f}°)\n")

# Select keyframes
keyframe_indices = [
    2,   # Neutral: High rotation (0.867)
    4,   # Wind-up: High rotation (0.827), elbow decreasing
    5,   # Cocking: High rotation (0.840), min elbow (68.2°)
    12,  # Acceleration: Mid rotation (0.764), elbow increasing
    18,  # Release: Low rotation (0.467), elbow high
    27   # Follow-through: Min rotation (0.221), body square
]

phase_names = ['Neutral', 'Wind-up', 'Cocking', 'Acceleration', 'Release', 'Follow-through']

print("=== SELECTED KEYFRAMES ===\n")
for name, idx in zip(phase_names, keyframe_indices):
    f = frame_data[idx]
    print(f"{name}:")
    print(f"  Frame: {idx}, Time: {f['timestamp']:.2f}s")
    print(f"  Shoulder rotation: {f['shoulder_rotation']:.3f} (R-L diff)")
    print(f"  Hip rotation: {f['hip_rotation']:.3f}")
    print(f"  Elbow angle: {f['elbow_angle']:.1f}°")
    print(f"  Foot diff: {f['foot_diff']:.3f} (weight on back)")
    print()

# Extract keyframes
keyframes = []
for name, idx in zip(phase_names, keyframe_indices):
    pose = sequence[idx]
    lm = pose['landmarks']
    
    landmarks_dict = {}
    for i, landmark in enumerate(lm):
        landmarks_dict[i] = {
            'x': round(landmark['x'], 4),
            'y': round(landmark['y'], 4),
            'z': round(landmark['z'], 4),
            'visibility': round(landmark.get('visibility', 1.0), 4)
        }
    
    keyframes.append({
        'phase': name,
        'timestamp': pose['timestamp'],
        'frame_index': idx,
        'landmarks': landmarks_dict
    })

# Save
with open('rotation_keyframes.json', 'w') as f:
    json.dump({
        'video': 'qb_throw_video3.mp4',
        'time_range': '3-4s',
        'description': 'Keyframes showing maximum rotation progression from rotated stance to square',
        'keyframes': keyframes
    }, f, indent=2)

print("✅ Saved to rotation_keyframes.json")
print("\nRotation progression: 0.867 → 0.221 (body opens up)")
print("Elbow progression: 81.0° → 68.2° → 148.1° (full throwing motion)")

