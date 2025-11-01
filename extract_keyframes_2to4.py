#!/usr/bin/env python3
"""
Extract 6 keyframes from seconds 2-4 of the Facebook video
"""

import json
import numpy as np

# Load pose data
with open('/home/ubuntu/aligned-recreation/facebook_pose_data.json', 'r') as f:
    data = json.load(f)

fps = data['fps']
all_poses = data['poses']

# Filter to seconds 2-4 (frames 60-120 at 30fps)
start_frame = int(2 * fps)  # 60
end_frame = int(4 * fps)    # 120

# Get poses in this range
target_poses = [p for p in all_poses[start_frame:end_frame+1] if p['landmarks'] is not None]

print(f"Analyzing seconds 2-4 (frames {start_frame}-{end_frame})")
print(f"Valid poses in range: {len(target_poses)}")
print()

# Analyze motion
def calculate_angle(p1, p2, p3):
    """Calculate angle at p2"""
    v1 = np.array([p1['x'] - p2['x'], p1['y'] - p2['y']])
    v2 = np.array([p3['x'] - p2['x'], p3['y'] - p2['y']])
    cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
    angle = np.arccos(np.clip(cos_angle, -1.0, 1.0))
    return np.degrees(angle)

elbow_angles = []
wrist_heights = []
hip_rotations = []

for pose_data in target_poses:
    lms = pose_data['landmarks']
    
    # Right arm: shoulder(12), elbow(14), wrist(16)
    elbow_angle = calculate_angle(lms[12], lms[14], lms[16])
    elbow_angles.append(elbow_angle)
    
    # Right wrist height (y-coordinate, lower = higher on screen)
    wrist_heights.append(lms[16]['y'])
    
    # Hip rotation (difference in z-coordinates)
    hip_rotation = abs(lms[24]['z'] - lms[23]['z'])  # Right hip - Left hip
    hip_rotations.append(hip_rotation)

elbow_angles = np.array(elbow_angles)
wrist_heights = np.array(wrist_heights)
hip_rotations = np.array(hip_rotations)

print("Motion analysis (seconds 2-4):")
print(f"  Elbow angle range: {elbow_angles.min():.1f}° to {elbow_angles.max():.1f}°")
print(f"  Wrist height range: {wrist_heights.min():.3f} to {wrist_heights.max():.3f}")
print(f"  Hip rotation range: {hip_rotations.min():.3f} to {hip_rotations.max():.3f}")
print()

# Find key phases
# Release: wrist at highest point (lowest y value)
release_idx = np.argmin(wrist_heights)

# Cocking: maximum elbow bend (smallest angle) before release
cocking_idx = np.argmin(elbow_angles[:release_idx]) if release_idx > 5 else 0

# Neutral: start of this segment
neutral_idx = 0

# Wind-up: 1/3 between neutral and cocking
windup_idx = neutral_idx + (cocking_idx - neutral_idx) // 3

# Acceleration: midpoint between cocking and release
acceleration_idx = (cocking_idx + release_idx) // 2

# Follow-through: 10 frames after release
followthrough_idx = min(release_idx + 10, len(target_poses) - 1)

keyframe_indices = {
    'neutral': neutral_idx,
    'windup': windup_idx,
    'cocking': cocking_idx,
    'acceleration': acceleration_idx,
    'release': release_idx,
    'followthrough': followthrough_idx
}

print("Keyframe extraction (seconds 2-4):")
for phase, idx in keyframe_indices.items():
    pose = target_poses[idx]
    frame_num = pose['frame']
    timestamp = pose['timestamp']
    print(f"  {phase.capitalize():15s}: frame {frame_num:3d} ({timestamp:.2f}s) - elbow: {elbow_angles[idx]:.1f}°, wrist_y: {wrist_heights[idx]:.3f}, hip_rot: {hip_rotations[idx]:.3f}")
print()

# Extract keyframes
keyframes = {}
for phase, idx in keyframe_indices.items():
    keyframes[phase] = target_poses[idx]

# Save keyframes
output_file = '/home/ubuntu/aligned-recreation/throwing_keyframes_2to4.json'
with open(output_file, 'w') as f:
    json.dump({
        'fps': fps,
        'timeframe': '2-4 seconds',
        'keyframes': keyframes,
        'analysis': {
            'elbow_angle_range': [float(elbow_angles.min()), float(elbow_angles.max())],
            'wrist_height_range': [float(wrist_heights.min()), float(wrist_heights.max())],
            'hip_rotation_range': [float(hip_rotations.min()), float(hip_rotations.max())]
        }
    }, f, indent=2)

print(f"Keyframes saved to: {output_file}")
print("\nDone!")

