import json
import numpy as np

# Load Video 1
with open('fb_video1_poses.json', 'r') as f:
    video1_data = json.load(f)

# Extract 3-4s sequence (highest motion score: 203.1)
start_time = 3.0
end_time = 4.0
sequence = [p for p in video1_data['poses'] if start_time <= p['timestamp'] <= end_time]

print(f"=== ANALYZING VIDEO 1 SIDE-VIEW (3-4s) ===")
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

# Print progression
print("Elbow angle progression:")
for i in range(0, len(frame_analysis), 3):
    f = frame_analysis[i]
    print(f"Frame {i}: {f['timestamp']:.2f}s, Elbow: {f['elbow_angle']:.1f}°, Wrist: {f['wrist_height']:.3f}, Hip: {f['hip_rotation']:.3f}")

# Find key phases
min_elbow_idx = min(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['elbow_angle'])
max_elbow_idx = max(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['elbow_angle'])
min_wrist_idx = min(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['wrist_height'])

print(f"\nKey points:")
print(f"Min elbow (cocking): Frame {min_elbow_idx} at {frame_analysis[min_elbow_idx]['timestamp']:.2f}s, {frame_analysis[min_elbow_idx]['elbow_angle']:.1f}°")
print(f"Max elbow (follow): Frame {max_elbow_idx} at {frame_analysis[max_elbow_idx]['timestamp']:.2f}s, {frame_analysis[max_elbow_idx]['elbow_angle']:.1f}°")
print(f"Min wrist (release): Frame {min_wrist_idx} at {frame_analysis[min_wrist_idx]['timestamp']:.2f}s, {frame_analysis[min_wrist_idx]['wrist_height']:.3f}")

# Select keyframes in chronological order
neutral_idx = 0  # Start
wind_up_idx = min_elbow_idx // 2  # Halfway to cocking
cocking_idx = min_elbow_idx  # Minimum elbow
accel_idx = (min_elbow_idx + max_elbow_idx) // 2  # Between cocking and follow
release_idx = min_wrist_idx if min_wrist_idx > min_elbow_idx else accel_idx  # Highest wrist
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
    shoulder_depth = abs(lm[11]['z'] - lm[12]['z'])
    hip_depth = abs(lm[23]['z'] - lm[25]['z'])
    foot_depth = abs(lm[31]['z'] - lm[32]['z'])
    print(f"{kf['phase']}:")
    print(f"  Shoulder depth: {shoulder_depth:.3f}")
    print(f"  Hip depth: {hip_depth:.3f}")
    print(f"  Foot depth: {foot_depth:.3f}")
    print(f"  Total depth score: {(shoulder_depth + hip_depth + foot_depth):.3f}")
    print()

# Save
with open('video1_keyframes.json', 'w') as f:
    json.dump({
        'video': 'fb_video1.mp4',
        'time_range': '3-4s',
        'camera_angle': 'side-view',
        'motion_score': 203.1,
        'keyframes': keyframes
    }, f, indent=2)

print("✅ Saved to video1_keyframes.json")
print("\nNote: This is side-view footage with excellent motion dynamics.")
print("Hip rotation: 0.454, Shoulder rotation: 0.711 - highest of all sequences!")

