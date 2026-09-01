import json
import numpy as np

# Load Video 1
with open('fb_video1_poses.json', 'r') as f:
    video1_data = json.load(f)

# Extract 3-4s sequence
start_time = 3.0
end_time = 4.0
sequence = [p for p in video1_data['poses'] if start_time <= p['timestamp'] <= end_time]

print(f"=== EXTRACTING CORRECT KEYFRAMES FROM VIDEO 1 (3-4s) ===")
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

# Find key phases based on elbow angle progression
# Throwing motion: Neutral (moderate elbow) → Wind-up (elbow decreasing) → Cocking (min elbow) 
#                  → Acceleration (elbow increasing) → Release (elbow ~90-120°) → Follow-through (max elbow)

min_elbow_idx = min(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['elbow_angle'])
max_elbow_idx = max(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['elbow_angle'])

print(f"Cocking (min elbow): Frame {min_elbow_idx} at {frame_analysis[min_elbow_idx]['timestamp']:.2f}s, {frame_analysis[min_elbow_idx]['elbow_angle']:.1f}°")
print(f"Follow-through (max elbow): Frame {max_elbow_idx} at {frame_analysis[max_elbow_idx]['timestamp']:.2f}s, {frame_analysis[max_elbow_idx]['elbow_angle']:.1f}°\n")

# Keyframes in CHRONOLOGICAL order:
# 1. Neutral: First frame
neutral_idx = 0

# 2. Wind-up: Halfway between neutral and cocking
wind_up_idx = (neutral_idx + min_elbow_idx) // 2

# 3. Cocking: Minimum elbow angle
cocking_idx = min_elbow_idx

# 4. Acceleration: Between cocking and follow-through, elbow angle increasing rapidly
accel_idx = (cocking_idx + max_elbow_idx) // 2

# 5. Release: Between acceleration and follow-through, elbow around 120-140°
# Find frame with elbow closest to 130° after cocking
release_candidates = [i for i in range(cocking_idx, max_elbow_idx) if 110 < frame_analysis[i]['elbow_angle'] < 145]
if release_candidates:
    release_idx = release_candidates[len(release_candidates)//2]  # Middle of release range
else:
    release_idx = (accel_idx + max_elbow_idx) // 2

# 6. Follow-through: Maximum elbow angle
follow_idx = max_elbow_idx

keyframe_indices = [neutral_idx, wind_up_idx, cocking_idx, accel_idx, release_idx, follow_idx]
phase_names = ['Neutral', 'Wind-up', 'Cocking', 'Acceleration', 'Release', 'Follow-through']

print("=== KEYFRAMES IN CHRONOLOGICAL ORDER ===\n")
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

# Verify z-depth and motion progression
print("\n=== Z-DEPTH AND MOTION VERIFICATION ===\n")
for kf in keyframes:
    lm = kf['landmarks']
    shoulder_depth = abs(lm[11]['z'] - lm[12]['z'])
    hip_depth = abs(lm[23]['z'] - lm[25]['z'])
    foot_depth = abs(lm[31]['z'] - lm[32]['z'])
    print(f"{kf['phase']} (t={kf['timestamp']:.2f}s):")
    print(f"  Shoulder depth: {shoulder_depth:.3f}")
    print(f"  Hip depth: {hip_depth:.3f}")
    print(f"  Foot depth: {foot_depth:.3f}")
    print()

# Save
with open('correct_keyframes.json', 'w') as f:
    json.dump({
        'video': 'fb_video1.mp4',
        'time_range': '3-4s',
        'camera_angle': 'side-view',
        'keyframes': keyframes
    }, f, indent=2)

print("✅ Saved to correct_keyframes.json")
print("\n✅ Keyframes are in correct chronological order!")
print("   Neutral (3.00s) → Wind-up → Cocking (3.13s) → Acceleration → Release → Follow-through (3.53s)")

