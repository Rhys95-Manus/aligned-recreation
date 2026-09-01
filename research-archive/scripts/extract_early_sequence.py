import json
import numpy as np

# Load Video 2
with open('fb_video2_poses.json', 'r') as f:
    video2_data = json.load(f)

# Extract 2-4s sequence (scored 227.8, had all phases except neutral)
start_time = 2.0
end_time = 4.0
sequence = [p for p in video2_data['poses'] if start_time <= p['timestamp'] <= end_time]

print(f"=== ANALYZING EARLY SEQUENCE (2-4s) ===")
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
    
    frame_analysis.append({
        'index': i,
        'timestamp': pose['timestamp'],
        'elbow_angle': elbow_angle,
        'wrist_height': wrist_height,
        'hip_rotation': hip_rotation,
        'shoulder_rotation': shoulder_rotation
    })

# Print elbow angle progression to understand the motion
print("Elbow angle progression (every 5th frame):")
for i in range(0, len(frame_analysis), 5):
    f = frame_analysis[i]
    print(f"Frame {i}: {f['timestamp']:.2f}s, Elbow: {f['elbow_angle']:.1f}°, Wrist: {f['wrist_height']:.3f}")

# Find key phases
min_elbow_idx = min(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['elbow_angle'])
max_elbow_idx = max(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['elbow_angle'])
min_wrist_idx = min(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['wrist_height'])

print(f"\nKey points:")
print(f"Min elbow (cocking): Frame {min_elbow_idx}, {frame_analysis[min_elbow_idx]['elbow_angle']:.1f}°")
print(f"Max elbow (follow): Frame {max_elbow_idx}, {frame_analysis[max_elbow_idx]['elbow_angle']:.1f}°")
print(f"Min wrist height (release): Frame {min_wrist_idx}, {frame_analysis[min_wrist_idx]['wrist_height']:.3f}")

# Check chronological order
print(f"\nChronological check:")
print(f"Min elbow at: {frame_analysis[min_elbow_idx]['timestamp']:.2f}s")
print(f"Max elbow at: {frame_analysis[max_elbow_idx]['timestamp']:.2f}s")
print(f"Min wrist at: {frame_analysis[min_wrist_idx]['timestamp']:.2f}s")

# Select keyframes in chronological order
neutral_idx = 0  # Start of sequence
wind_up_idx = min_elbow_idx // 2  # Halfway to cocking
cocking_idx = min_elbow_idx  # Minimum elbow
accel_idx = (min_elbow_idx + min_wrist_idx) // 2 if min_wrist_idx > min_elbow_idx else min_elbow_idx + 5
release_idx = min_wrist_idx  # Highest wrist
follow_idx = max_elbow_idx  # Maximum elbow

keyframe_indices = [neutral_idx, wind_up_idx, cocking_idx, accel_idx, release_idx, follow_idx]
phase_names = ['Neutral', 'Wind-up', 'Cocking', 'Acceleration', 'Release', 'Follow-through']

print("\n=== SELECTED KEYFRAMES ===\n")
for name, idx in zip(phase_names, keyframe_indices):
    f = frame_analysis[idx]
    print(f"{name}:")
    print(f"  Frame: {idx}/{len(sequence)}")
    print(f"  Time: {f['timestamp']:.2f}s")
    print(f"  Elbow: {f['elbow_angle']:.1f}°")
    print(f"  Wrist: {f['wrist_height']:.3f}")
    print(f"  Hip rotation: {f['hip_rotation']:.3f}")
    print(f"  Shoulder rotation: {f['shoulder_rotation']:.3f}")
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
    print(f"{kf['phase']}:")
    print(f"  Shoulder depth: {abs(lm[11]['z'] - lm[12]['z']):.3f}")
    print(f"  Hip depth: {abs(lm[23]['z'] - lm[25]['z']):.3f}")
    print(f"  Foot depth: {abs(lm[31]['z'] - lm[32]['z']):.3f}")

# Save
with open('early_sequence_keyframes.json', 'w') as f:
    json.dump({
        'video': 'fb_video2.mp4',
        'time_range': '2-4s',
        'keyframes': keyframes
    }, f, indent=2)

print("\n✅ Saved to early_sequence_keyframes.json")

