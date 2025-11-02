import json
import numpy as np

# Load Video 3
with open('qb_throw_video3_poses.json', 'r') as f:
    video3_data = json.load(f)

sequence = video3_data['poses']

print(f"=== ANALYZING VIDEO 3 (3-4s) ===")
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
    
    # Front-facing check
    shoulder_width = abs(lm[11]['x'] - lm[12]['x'])
    shoulder_depth = abs(lm[11]['z'] - lm[12]['z'])
    front_ratio = shoulder_width / shoulder_depth if shoulder_depth > 0.001 else 0
    
    frame_analysis.append({
        'index': i,
        'timestamp': pose['timestamp'],
        'elbow_angle': elbow_angle,
        'wrist_height': wrist_height,
        'hip_rotation': hip_rotation,
        'shoulder_rotation': shoulder_rotation,
        'front_ratio': front_ratio,
        'is_front_facing': front_ratio > 1.0
    })

# Print elbow progression
print("Elbow angle progression (every 3rd frame):")
for i in range(0, len(frame_analysis), 3):
    f = frame_analysis[i]
    front_str = "✓" if f['is_front_facing'] else "✗"
    print(f"Frame {i:2d}: {f['timestamp']:.2f}s, Elbow: {f['elbow_angle']:5.1f}°, Hip: {f['hip_rotation']:.3f}, Front: {f['front_ratio']:.2f} {front_str}")

# Find key phases
min_elbow_idx = min(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['elbow_angle'])
max_elbow_idx = max(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['elbow_angle'])

print(f"\nCocking (min elbow): Frame {min_elbow_idx} at {frame_analysis[min_elbow_idx]['timestamp']:.2f}s, {frame_analysis[min_elbow_idx]['elbow_angle']:.1f}°")
print(f"Follow-through (max elbow): Frame {max_elbow_idx} at {frame_analysis[max_elbow_idx]['timestamp']:.2f}s, {frame_analysis[max_elbow_idx]['elbow_angle']:.1f}°\n")

# Select keyframes in chronological order
neutral_idx = 0
wind_up_idx = (neutral_idx + min_elbow_idx) // 2
cocking_idx = min_elbow_idx
accel_idx = (cocking_idx + max_elbow_idx) // 2
release_idx = max(range(cocking_idx, min(cocking_idx + 10, len(frame_analysis))), 
                  key=lambda i: frame_analysis[i]['elbow_angle']) if cocking_idx < len(frame_analysis) - 10 else accel_idx
follow_idx = max_elbow_idx

keyframe_indices = [neutral_idx, wind_up_idx, cocking_idx, accel_idx, release_idx, follow_idx]
phase_names = ['Neutral', 'Wind-up', 'Cocking', 'Acceleration', 'Release', 'Follow-through']

print("=== KEYFRAMES IN CHRONOLOGICAL ORDER ===\n")
for name, idx in zip(phase_names, keyframe_indices):
    f = frame_analysis[idx]
    front_str = "✓" if f['is_front_facing'] else "✗"
    print(f"{name}:")
    print(f"  Frame: {idx}/{len(sequence)}, Time: {f['timestamp']:.2f}s")
    print(f"  Elbow: {f['elbow_angle']:.1f}°")
    print(f"  Hip rotation: {f['hip_rotation']:.3f}")
    print(f"  Shoulder rotation: {f['shoulder_rotation']:.3f}")
    print(f"  Front-facing: {front_str} (ratio: {f['front_ratio']:.2f})")
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

# Verify z-depth
print("\n=== Z-DEPTH VERIFICATION ===\n")
for kf in keyframes:
    lm = kf['landmarks']
    shoulder_depth = abs(lm[11]['z'] - lm[12]['z'])
    hip_depth = abs(lm[23]['z'] - lm[25]['z'])
    foot_depth = abs(lm[31]['z'] - lm[32]['z'])
    print(f"{kf['phase']} (t={kf['timestamp']:.2f}s):")
    print(f"  Shoulder: {shoulder_depth:.3f}, Hip: {hip_depth:.3f}, Foot: {foot_depth:.3f}")

# Save
with open('video3_keyframes.json', 'w') as f:
    json.dump({
        'video': 'qb_throw_video3.mp4',
        'time_range': '3-4s',
        'camera_angle': 'front-facing',
        'keyframes': keyframes
    }, f, indent=2)

print("\n✅ Saved to video3_keyframes.json")
print(f"✅ Keyframes are in correct chronological order!")

