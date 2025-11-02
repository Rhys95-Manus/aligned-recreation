import json
import numpy as np
from collections import defaultdict

# Load all processed videos
videos = [
    ("video2_side_poses.json", "side"),
    ("video3_side_poses.json", "side"),
    ("video4_front_torso_poses.json", "front_torso"),
    ("video5_front_poses.json", "front"),
    ("video6_mixed_poses.json", "mixed"),
]

print("="*80)
print("MULTI-ANGLE 3D KEYFRAME EXTRACTION")
print("="*80)

all_video_data = {}
for filename, angle in videos:
    with open(filename, 'r') as f:
        data = json.load(f)
        all_video_data[filename] = {
            'angle': angle,
            'poses': data['poses'],
            'fps': data['fps']
        }
    print(f"Loaded {filename}: {len(data['poses'])} poses, {angle} angle")

print("\n" + "="*80)
print("ANALYZING EACH VIDEO FOR BEST THROWING SEQUENCE")
print("="*80)

def analyze_throwing_motion(poses):
    """Analyze poses to find best throwing sequence"""
    motion_scores = []
    
    for i, pose in enumerate(poses):
        lm = pose['landmarks']
        
        # Right elbow angle
        shoulder = np.array([lm[12]['x'], lm[12]['y'], lm[12]['z']])
        elbow = np.array([lm[14]['x'], lm[14]['y'], lm[14]['z']])
        wrist = np.array([lm[16]['x'], lm[16]['y'], lm[16]['z']])
        
        v1 = shoulder - elbow
        v2 = wrist - elbow
        elbow_angle = np.degrees(np.arccos(np.clip(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)), -1, 1)))
        
        # Rotation metrics
        shoulder_rotation = abs(lm[11]['z'] - lm[12]['z'])
        hip_rotation = abs(lm[23]['z'] - lm[24]['z'])
        
        # Motion score: combination of elbow range and rotation
        score = elbow_angle * 0.5 + shoulder_rotation * 200 + hip_rotation * 200
        
        motion_scores.append({
            'index': i,
            'timestamp': pose['timestamp'],
            'elbow_angle': elbow_angle,
            'shoulder_rotation': shoulder_rotation,
            'hip_rotation': hip_rotation,
            'score': score
        })
    
    return motion_scores

# Analyze each video
video_analyses = {}
for filename, info in all_video_data.items():
    scores = analyze_throwing_motion(info['poses'])
    video_analyses[filename] = scores
    
    # Find best sequence (highest average score over 6 frames)
    best_score = 0
    best_start = 0
    window_size = min(6, len(scores))
    
    for i in range(len(scores) - window_size + 1):
        window_score = sum(s['score'] for s in scores[i:i+window_size]) / window_size
        if window_score > best_score:
            best_score = window_score
            best_start = i
    
    print(f"\n{filename} ({info['angle']}):")
    print(f"  Best sequence: frames {best_start}-{best_start+window_size-1}")
    print(f"  Average score: {best_score:.1f}")
    print(f"  Time range: {scores[best_start]['timestamp']:.2f}-{scores[best_start+window_size-1]['timestamp']:.2f}s")

print("\n" + "="*80)
print("EXTRACTING 6 KEYFRAMES FROM EACH VIDEO")
print("="*80)

# Extract 6 keyframes from each video
all_keyframes = defaultdict(list)

for filename, info in all_video_data.items():
    poses = info['poses']
    angle = info['angle']
    
    # Find key phases
    scores = video_analyses[filename]
    
    # Find min/max elbow
    min_elbow_idx = min(range(len(scores)), key=lambda i: scores[i]['elbow_angle'])
    max_elbow_idx = max(range(len(scores)), key=lambda i: scores[i]['elbow_angle'])
    
    # Select 6 keyframes
    keyframe_indices = [
        0,  # Neutral
        min(len(poses)-1, min_elbow_idx // 2),  # Wind-up
        min_elbow_idx,  # Cocking
        (min_elbow_idx + max_elbow_idx) // 2,  # Acceleration
        max_elbow_idx,  # Release
        min(len(poses)-1, max_elbow_idx + (len(poses) - max_elbow_idx) // 2)  # Follow-through
    ]
    
    phase_names = ['Neutral', 'Wind-up', 'Cocking', 'Acceleration', 'Release', 'Follow-through']
    
    print(f"\n{filename} ({angle}):")
    for phase, idx in zip(phase_names, keyframe_indices):
        pose = poses[idx]
        s = scores[idx]
        print(f"  {phase}: frame {idx}, t={s['timestamp']:.2f}s, elbow={s['elbow_angle']:.1f}°, rot={s['shoulder_rotation']:.3f}")
        
        # Store keyframe with angle info
        all_keyframes[phase].append({
            'angle': angle,
            'video': filename,
            'landmarks': pose['landmarks']
        })

print("\n" + "="*80)
print("COMBINING DEPTH DATA FROM MULTIPLE ANGLES")
print("="*80)

# Combine keyframes by averaging z-coordinates from different angles
# Front views give accurate x/y, side views give accurate z
combined_keyframes = []

for phase in ['Neutral', 'Wind-up', 'Cocking', 'Acceleration', 'Release', 'Follow-through']:
    keyframes_for_phase = all_keyframes[phase]
    
    # Separate by angle type
    front_keyframes = [kf for kf in keyframes_for_phase if kf['angle'] in ['front', 'front_torso']]
    side_keyframes = [kf for kf in keyframes_for_phase if kf['angle'] == 'side']
    mixed_keyframes = [kf for kf in keyframes_for_phase if kf['angle'] == 'mixed']
    
    # Use front view for x/y, side view for z
    if front_keyframes and side_keyframes:
        # Average front views for x/y
        front_lm = front_keyframes[0]['landmarks']
        
        # Average side views for z
        side_z_avg = []
        for i in range(33):
            z_values = [kf['landmarks'][i]['z'] for kf in side_keyframes]
            side_z_avg.append(np.mean(z_values))
        
        # Combine
        combined_lm = {}
        for i in range(33):
            combined_lm[i] = {
                'x': front_lm[i]['x'],
                'y': front_lm[i]['y'],
                'z': side_z_avg[i],
                'visibility': front_lm[i]['visibility']
            }
        
        combined_keyframes.append({
            'phase': phase,
            'landmarks': combined_lm
        })
        
        print(f"{phase}: Combined front (x/y) + side (z)")
    else:
        # Fallback: use first available keyframe
        combined_keyframes.append({
            'phase': phase,
            'landmarks': keyframes_for_phase[0]['landmarks']
        })
        print(f"{phase}: Using {keyframes_for_phase[0]['angle']} view")

# Save combined keyframes
with open('combined_multi_angle_keyframes.json', 'w') as f:
    json.dump({
        'description': 'Multi-angle 3D keyframes combining front (x/y) and side (z) views',
        'keyframes': combined_keyframes
    }, f, indent=2)

print("\n✅ Saved to combined_multi_angle_keyframes.json")
print(f"✅ Created {len(combined_keyframes)} keyframes with true 3D depth!")

