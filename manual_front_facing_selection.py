import json
import numpy as np

# Load Video 2
with open('fb_video2_poses.json', 'r') as f:
    video2_data = json.load(f)

# Use 2-4s sequence
start_time = 2.0
end_time = 4.0
sequence = [p for p in video2_data['poses'] if start_time <= p['timestamp'] <= end_time]

print(f"=== ANALYZING VIDEO 2 (2-4s) FOR FRONT-FACING FRAMES ===")
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
    front_ratio = shoulder_width / shoulder_depth if shoulder_depth > 0 else 0
    
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

# Print all frames to manually select
print("All frames (showing every 3rd frame):")
print("Frame | Time | Elbow | Hip Rot | Front Ratio | Front?")
print("-" * 60)
for i in range(0, len(frame_analysis), 3):
    f = frame_analysis[i]
    front_str = "YES" if f['is_front_facing'] else "no"
    print(f"{i:3d}   | {f['timestamp']:.2f}s | {f['elbow_angle']:5.1f}° | {f['hip_rotation']:.3f}   | {f['front_ratio']:.2f}        | {front_str}")

# Find best front-facing frames
front_frames = [f for f in frame_analysis if f['is_front_facing']]
print(f"\n\nFront-facing frames: {len(front_frames)}/{len(frame_analysis)} ({100*len(front_frames)/len(frame_analysis):.1f}%)")

if len(front_frames) >= 6:
    # Select 6 keyframes from front-facing frames
    # Sort by timestamp to ensure chronological order
    front_frames.sort(key=lambda x: x['timestamp'])
    
    # Distribute evenly across the sequence
    step = len(front_frames) // 6
    selected_indices = [
        front_frames[0]['index'],  # First front-facing frame
        front_frames[step]['index'],
        front_frames[step*2]['index'],
        front_frames[step*3]['index'],
        front_frames[step*4]['index'],
        front_frames[-1]['index']  # Last front-facing frame
    ]
    
    phase_names = ['Neutral', 'Wind-up', 'Cocking', 'Acceleration', 'Release', 'Follow-through']
    
    print("\n=== SELECTED FRONT-FACING KEYFRAMES ===\n")
    for name, idx in zip(phase_names, selected_indices):
        f = frame_analysis[idx]
        print(f"{name}:")
        print(f"  Frame: {idx}, Time: {f['timestamp']:.2f}s")
        print(f"  Elbow: {f['elbow_angle']:.1f}°")
        print(f"  Hip rotation: {f['hip_rotation']:.3f}")
        print(f"  Front ratio: {f['front_ratio']:.2f}")
        print()
    
    # Extract keyframes
    keyframes = []
    for name, idx in zip(phase_names, selected_indices):
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
    with open('manual_front_keyframes.json', 'w') as f:
        json.dump({
            'video': 'fb_video2.mp4',
            'time_range': '2-4s',
            'camera_angle': 'front-facing (selected)',
            'keyframes': keyframes
        }, f, indent=2)
    
    print("✅ Saved to manual_front_keyframes.json")
else:
    print(f"\n⚠️ Not enough front-facing frames ({len(front_frames)}) to create 6 keyframes")

