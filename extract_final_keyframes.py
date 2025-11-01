import json
import numpy as np

# Load complete sequence
with open('complete_throwing_sequence.json', 'r') as f:
    data = json.load(f)

sequence = data['sequence']
print(f"=== EXTRACTING KEYFRAMES FROM COMPLETE SEQUENCE (30.5-33.5s) ===")
print(f"Total frames: {len(sequence)}\n")

# Analyze each frame
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
    
    # Wrist height
    wrist_height = lm[16]['y']
    
    # Hip rotation
    hip_rotation = abs(lm[23]['z'] - lm[25]['z'])
    
    # Shoulder rotation
    shoulder_rotation = abs(lm[11]['z'] - lm[12]['z'])
    
    # Right wrist x position (for wind-up detection)
    wrist_x = lm[16]['x']
    
    frame_analysis.append({
        'index': i,
        'timestamp': pose['timestamp'],
        'elbow_angle': elbow_angle,
        'wrist_height': wrist_height,
        'wrist_x': wrist_x,
        'hip_rotation': hip_rotation,
        'shoulder_rotation': shoulder_rotation
    })

# Find key phases
# 1. Neutral: First frame with moderate elbow angle
neutral_candidates = [f for f in frame_analysis[:10] if 80 < f['elbow_angle'] < 140]
neutral_idx = neutral_candidates[0]['index'] if neutral_candidates else 0

# 2. Wind-up: Wrist moving back (increasing x for right-handed), before cocking
# Find frame with moderate elbow and wrist starting to move back
wind_up_candidates = [f for f in frame_analysis[neutral_idx:] if 60 < f['elbow_angle'] < 100]
wind_up_idx = wind_up_candidates[0]['index'] if wind_up_candidates else len(sequence) // 6

# 3. Cocking: Minimum elbow angle (arm pulled back)
cocking_idx = min(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['elbow_angle'])

# 4. Acceleration: Between cocking and release, elbow extending rapidly
accel_start = cocking_idx
accel_candidates = [f for f in frame_analysis[accel_start:] if 70 < f['elbow_angle'] < 110]
accel_idx = accel_candidates[len(accel_candidates)//2]['index'] if accel_candidates else (cocking_idx + len(sequence)) // 2

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
    print(f"  Left foot z: {lm[31]['z']:.3f}")
    print(f"  Right foot z: {lm[32]['z']:.3f}")
    print(f"  Foot depth diff: {abs(lm[31]['z'] - lm[32]['z']):.3f}")
    print()

# Save keyframes
with open('final_keyframes.json', 'w') as f:
    json.dump({
        'video': 'fb_video2.mp4',
        'time_range': '30.5-33.5s',
        'completeness': '4/4 phases',
        'keyframes': keyframes
    }, f, indent=2)

print("✅ Saved 6 keyframes to final_keyframes.json")

# Generate TypeScript code
print("\n=== TYPESCRIPT CODE FOR professionalMotionKeyframes.ts ===\n")
print("export const professionalMotionKeyframes: MotionKeyframe[] = [")
for kf in keyframes:
    print(f"  // {kf['phase']}")
    print("  {")
    print(f"    phase: '{kf['phase']}',")
    print("    landmarks: {")
    for i in range(33):  # MediaPipe has 33 landmarks
        lm = kf['landmarks'][i]
        print(f"      {i}: {{ x: {lm['x']}, y: {lm['y']}, z: {lm['z']}, visibility: {lm['visibility']} }},")
    print("    },")
    print("  },")
print("];")

