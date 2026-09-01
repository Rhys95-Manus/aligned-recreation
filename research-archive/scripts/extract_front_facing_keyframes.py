import json
import numpy as np

# Load Video 2
with open('fb_video2_poses.json', 'r') as f:
    video2_data = json.load(f)

# Try the 0-2s sequence which had high hip rotation (0.356)
start_time = 0.0
end_time = 2.0
sequence = [p for p in video2_data['poses'] if start_time <= p['timestamp'] <= end_time]

print(f"=== EXTRACTING FRONT-FACING KEYFRAMES (0-2s) ===")
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
    
    # Check if front-facing (shoulder width > depth)
    shoulder_width = abs(lm[11]['x'] - lm[12]['x'])
    shoulder_depth = abs(lm[11]['z'] - lm[12]['z'])
    
    frame_analysis.append({
        'index': i,
        'timestamp': pose['timestamp'],
        'elbow_angle': elbow_angle,
        'wrist_height': wrist_height,
        'hip_rotation': hip_rotation,
        'shoulder_rotation': shoulder_rotation,
        'shoulder_width': shoulder_width,
        'shoulder_depth': shoulder_depth,
        'is_front_facing': shoulder_width > shoulder_depth
    })

# Verify this is front-facing
front_facing_count = sum(1 for f in frame_analysis if f['is_front_facing'])
print(f"Front-facing frames: {front_facing_count}/{len(frame_analysis)} ({100*front_facing_count/len(frame_analysis):.1f}%)\n")

# Find key phases based on elbow angle
min_elbow_idx = min(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['elbow_angle'])
max_elbow_idx = max(range(len(frame_analysis)), key=lambda i: frame_analysis[i]['elbow_angle'])

print(f"Min elbow (cocking): Frame {min_elbow_idx} at {frame_analysis[min_elbow_idx]['timestamp']:.2f}s, {frame_analysis[min_elbow_idx]['elbow_angle']:.1f}°")
print(f"Max elbow (follow): Frame {max_elbow_idx} at {frame_analysis[max_elbow_idx]['timestamp']:.2f}s, {frame_analysis[max_elbow_idx]['elbow_angle']:.1f}°\n")

# Select keyframes in chronological order
neutral_idx = 0
wind_up_idx = min_elbow_idx // 2
cocking_idx = min_elbow_idx
accel_idx = (cocking_idx + max_elbow_idx) // 2
release_idx = max(range(cocking_idx, min(cocking_idx + 15, len(frame_analysis))), 
                  key=lambda i: frame_analysis[i]['elbow_angle']) if cocking_idx < len(frame_analysis) - 15 else (cocking_idx + max_elbow_idx) // 2
follow_idx = max_elbow_idx

keyframe_indices = [neutral_idx, wind_up_idx, cocking_idx, accel_idx, release_idx, follow_idx]
phase_names = ['Neutral', 'Wind-up', 'Cocking', 'Acceleration', 'Release', 'Follow-through']

print("=== KEYFRAMES ===\n")
for name, idx in zip(phase_names, keyframe_indices):
    f = frame_analysis[idx]
    print(f"{name}:")
    print(f"  Frame: {idx}/{len(sequence)}, Time: {f['timestamp']:.2f}s")
    print(f"  Elbow: {f['elbow_angle']:.1f}°")
    print(f"  Hip rotation: {f['hip_rotation']:.3f}")
    print(f"  Shoulder rotation: {f['shoulder_rotation']:.3f}")
    print(f"  Front-facing: {f['is_front_facing']} (width/depth: {f['shoulder_width']:.3f}/{f['shoulder_depth']:.3f})")
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
    print(f"  Shoulder: {shoulder_depth:.3f}, Hip: {hip_depth:.3f}, Foot: {foot_depth:.3f}")

# Save
with open('front_facing_keyframes.json', 'w') as f:
    json.dump({
        'video': 'fb_video2.mp4',
        'time_range': '0-2s',
        'camera_angle': 'front-facing',
        'keyframes': keyframes
    }, f, indent=2)

print("\n✅ Saved to front_facing_keyframes.json")

