import json
import numpy as np

# Load Video 2 best sequence
with open('video2_best_sequence.json', 'r') as f:
    data = json.load(f)

sequence = data['sequence']
print(f"=== EXTRACTING KEYFRAMES FROM VIDEO 2 (32.5-34.5s) ===")
print(f"Total frames: {len(sequence)}\n")

# Analyze each frame to detect phases
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
    
    # Wrist height (lower y = higher position)
    wrist_height = lm[16]['y']
    
    # Hip rotation (z-depth difference)
    hip_rotation = abs(lm[23]['z'] - lm[25]['z'])
    
    # Shoulder rotation
    shoulder_rotation = abs(lm[11]['z'] - lm[12]['z'])
    
    frame_analysis.append({
        'index': i,
        'timestamp': pose['timestamp'],
        'elbow_angle': elbow_angle,
        'wrist_height': wrist_height,
        'hip_rotation': hip_rotation,
        'shoulder_rotation': shoulder_rotation
    })

# Find key phases
# 1. Neutral: First frame
neutral_idx = 0

# 2. Wind-up: Elbow starts extending, wrist moving back (increasing y)
# Find where elbow is moderately extended and wrist is moving back
wind_up_candidates = [f for f in frame_analysis if 100 < f['elbow_angle'] < 130 and f['wrist_height'] > 0.5]
wind_up_idx = wind_up_candidates[0]['index'] if wind_up_candidates else len(sequence) // 6

# 3. Cocking: Minimum elbow angle (arm pulled back)
cocking_idx = min(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['elbow_angle'])

# 4. Acceleration: Between cocking and release, elbow extending
accel_candidates = [f for f in frame_analysis if f['index'] > cocking_idx and 90 < f['elbow_angle'] < 120]
accel_idx = accel_candidates[0]['index'] if accel_candidates else (cocking_idx + len(sequence)) // 2

# 5. Release: Highest wrist position (minimum y value)
release_idx = min(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['wrist_height'])

# 6. Follow-through: Maximum elbow angle (arm fully extended)
follow_idx = max(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['elbow_angle'])

keyframe_indices = [neutral_idx, wind_up_idx, cocking_idx, accel_idx, release_idx, follow_idx]
phase_names = ['Neutral', 'Wind-up', 'Cocking', 'Acceleration', 'Release', 'Follow-through']

print("=== KEYFRAME DETECTION ===\n")
for name, idx in zip(phase_names, keyframe_indices):
    f = frame_analysis[idx]
    print(f"{name}:")
    print(f"  Frame: {idx}/{len(sequence)}")
    print(f"  Time: {f['timestamp']:.2f}s")
    print(f"  Elbow angle: {f['elbow_angle']:.1f}°")
    print(f"  Wrist height: {f['wrist_height']:.3f}")
    print(f"  Hip rotation: {f['hip_rotation']:.3f}")
    print(f"  Shoulder rotation: {f['shoulder_rotation']:.3f}")
    print()

# Extract keyframes with full landmark data
keyframes = []
for name, idx in zip(phase_names, keyframe_indices):
    pose = sequence[idx]
    lm = pose['landmarks']
    
    # Format landmarks for TypeScript
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

# Verify z-coordinate depth variation
print("\n=== Z-COORDINATE DEPTH VERIFICATION ===\n")
for kf in keyframes:
    lm = kf['landmarks']
    print(f"{kf['phase']}:")
    print(f"  Left shoulder z: {lm[11]['z']:.3f}")
    print(f"  Right shoulder z: {lm[12]['z']:.3f}")
    print(f"  Shoulder depth diff: {abs(lm[11]['z'] - lm[12]['z']):.3f}")
    print(f"  Left hip z: {lm[23]['z']:.3f}")
    print(f"  Right hip z: {lm[25]['z']:.3f}")
    print(f"  Hip depth diff: {abs(lm[23]['z'] - lm[25]['z']):.3f}")
    print()

# Save keyframes
with open('extracted_keyframes_v2.json', 'w') as f:
    json.dump({
        'video': 'fb_video2.mp4',
        'time_range': '32.5-34.5s',
        'keyframes': keyframes
    }, f, indent=2)

print("✅ Saved 6 keyframes to extracted_keyframes_v2.json")

