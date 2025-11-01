import json
import numpy as np

# Load complete sequence (30.5-33.5s, 91 frames)
with open('complete_throwing_sequence.json', 'r') as f:
    data = json.load(f)

sequence = data['sequence']
print(f"=== IMPROVED KEYFRAME EXTRACTION (30.5-33.5s) ===")
print(f"Total frames: {len(sequence)}\n")

# Manually select frames based on throwing motion progression
# Frame 0: Neutral (30.5s) - starting position
# Frame 15: Wind-up (30.75s) - arm starting to move back
# Frame 72: Cocking (32.9s) - arm fully cocked (min elbow angle)
# Frame 80: Acceleration (33.1s) - arm accelerating forward
# Frame 39: Release (31.8s) - highest wrist position
# Frame 66: Follow-through (32.7s) - arm fully extended

# Actually, let's analyze the sequence properly to find the right progression
# The throwing motion should be: Neutral → Wind-up → Cocking → Acceleration → Release → Follow-through

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

# Find cocking phase (minimum elbow angle)
cocking_idx = min(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['elbow_angle'])
print(f"Cocking phase detected at frame {cocking_idx}: elbow {frame_analysis[cocking_idx]['elbow_angle']:.1f}°")

# Find follow-through (maximum elbow angle)
follow_idx = max(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['elbow_angle'])
print(f"Follow-through detected at frame {follow_idx}: elbow {frame_analysis[follow_idx]['elbow_angle']:.1f}°")

# Find release (between cocking and follow-through, highest wrist)
release_candidates = frame_analysis[cocking_idx:follow_idx+1]
if release_candidates:
    release_idx = cocking_idx + min(range(len(release_candidates)), key=lambda i: release_candidates[i]['wrist_height'])
else:
    release_idx = min(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['wrist_height'])
print(f"Release detected at frame {release_idx}: wrist height {frame_analysis[release_idx]['wrist_height']:.3f}")

# Find acceleration (between cocking and release)
if release_idx > cocking_idx:
    accel_idx = (cocking_idx + release_idx) // 2
else:
    accel_idx = cocking_idx + 5
print(f"Acceleration at frame {accel_idx}: elbow {frame_analysis[accel_idx]['elbow_angle']:.1f}°")

# Find neutral (first 10 frames, most upright/relaxed position)
neutral_idx = 0
print(f"Neutral at frame {neutral_idx}: elbow {frame_analysis[neutral_idx]['elbow_angle']:.1f}°")

# Find wind-up (between neutral and cocking, about 1/3 of the way)
wind_up_idx = cocking_idx // 3
print(f"Wind-up at frame {wind_up_idx}: elbow {frame_analysis[wind_up_idx]['elbow_angle']:.1f}°")

# Ensure chronological order: neutral < wind-up < cocking < accel < release < follow
# If not, adjust
if not (neutral_idx < wind_up_idx < cocking_idx):
    wind_up_idx = (neutral_idx + cocking_idx) // 2
    
if not (cocking_idx < accel_idx < follow_idx):
    accel_idx = (cocking_idx + follow_idx) // 2
    
# Release should be after cocking
if release_idx < cocking_idx:
    release_idx = (cocking_idx + follow_idx) // 2

keyframe_indices = [neutral_idx, wind_up_idx, cocking_idx, accel_idx, release_idx, follow_idx]
phase_names = ['Neutral', 'Wind-up', 'Cocking', 'Acceleration', 'Release', 'Follow-through']

print("\n=== FINAL KEYFRAMES ===\n")
for name, idx in zip(phase_names, keyframe_indices):
    f = frame_analysis[idx]
    print(f"{name}:")
    print(f"  Frame: {idx}/{len(sequence)}")
    print(f"  Time: {f['timestamp']:.2f}s")
    print(f"  Elbow: {f['elbow_angle']:.1f}°")
    print(f"  Wrist height: {f['wrist_height']:.3f}")
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

# Save
with open('improved_keyframes.json', 'w') as f:
    json.dump({
        'video': 'fb_video2.mp4',
        'time_range': '30.5-33.5s',
        'keyframes': keyframes
    }, f, indent=2)

print("✅ Saved to improved_keyframes.json")

