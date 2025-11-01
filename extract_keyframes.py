#!/usr/bin/env python3
"""
Analyze throwing motion and extract 6 keyframes for professional reference
"""

import json
import numpy as np

# Load pose data
with open('/home/ubuntu/aligned-recreation/facebook_pose_data.json', 'r') as f:
    data = json.load(f)

fps = data['fps']
all_poses = data['poses']

# Filter out frames without pose detection
valid_poses = [p for p in all_poses if p['landmarks'] is not None]

print(f"Total frames: {len(all_poses)}")
print(f"Valid poses: {len(valid_poses)}")
print()

# Analyze motion to find throwing sequence
# Calculate right elbow angle and right wrist height over time
def calculate_angle(p1, p2, p3):
    """Calculate angle at p2"""
    v1 = np.array([p1['x'] - p2['x'], p1['y'] - p2['y']])
    v2 = np.array([p3['x'] - p2['x'], p3['y'] - p2['y']])
    cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
    angle = np.arccos(np.clip(cos_angle, -1.0, 1.0))
    return np.degrees(angle)

# Analyze motion
elbow_angles = []
wrist_heights = []
hip_rotations = []

for pose_data in valid_poses:
    lms = pose_data['landmarks']
    
    # Right arm: shoulder(12), elbow(14), wrist(16)
    elbow_angle = calculate_angle(lms[12], lms[14], lms[16])
    elbow_angles.append(elbow_angle)
    
    # Right wrist height (y-coordinate, lower = higher on screen)
    wrist_heights.append(lms[16]['y'])
    
    # Hip rotation (difference in z-coordinates)
    hip_rotation = abs(lms[24]['z'] - lms[23]['z'])  # Right hip - Left hip
    hip_rotations.append(hip_rotation)

# Convert to numpy arrays
elbow_angles = np.array(elbow_angles)
wrist_heights = np.array(wrist_heights)
hip_rotations = np.array(hip_rotations)

print("Motion analysis:")
print(f"  Elbow angle range: {elbow_angles.min():.1f}° to {elbow_angles.max():.1f}°")
print(f"  Wrist height range: {wrist_heights.min():.3f} to {wrist_heights.max():.3f}")
print(f"  Hip rotation range: {hip_rotations.min():.3f} to {hip_rotations.max():.3f}")
print()

# Find key phases of throwing motion
# 1. Neutral: Start of motion (first valid frame)
# 2. Wind-up: Hip rotation starts increasing
# 3. Cocking: Maximum hip rotation + elbow bent
# 4. Acceleration: Elbow starts extending, wrist still low
# 5. Release: Wrist at highest point
# 6. Follow-through: After release, arm extended

# Find release point (wrist at highest point = lowest y value)
release_idx = np.argmin(wrist_heights)
release_frame = valid_poses[release_idx]['frame']

# Find cocking phase (maximum hip rotation before release)
cocking_idx = np.argmax(hip_rotations[:release_idx]) if release_idx > 0 else 0
cocking_frame = valid_poses[cocking_idx]['frame']

# Find neutral (start - use frame 30 to skip initial motion)
neutral_idx = min(30, len(valid_poses) - 1)
neutral_frame = valid_poses[neutral_idx]['frame']

# Find wind-up (midpoint between neutral and cocking)
windup_idx = (neutral_idx + cocking_idx) // 2
windup_frame = valid_poses[windup_idx]['frame']

# Find acceleration (midpoint between cocking and release)
acceleration_idx = (cocking_idx + release_idx) // 2
acceleration_frame = valid_poses[acceleration_idx]['frame']

# Find follow-through (15 frames after release)
followthrough_idx = min(release_idx + 15, len(valid_poses) - 1)
followthrough_frame = valid_poses[followthrough_idx]['frame']

keyframe_indices = {
    'neutral': neutral_idx,
    'windup': windup_idx,
    'cocking': cocking_idx,
    'acceleration': acceleration_idx,
    'release': release_idx,
    'followthrough': followthrough_idx
}

print("Keyframe extraction:")
for phase, idx in keyframe_indices.items():
    frame_num = valid_poses[idx]['frame']
    timestamp = valid_poses[idx]['timestamp']
    print(f"  {phase.capitalize():15s}: frame {frame_num:3d} ({timestamp:.2f}s) - elbow: {elbow_angles[idx]:.1f}°, wrist_y: {wrist_heights[idx]:.3f}")
print()

# Extract keyframes
keyframes = {}
for phase, idx in keyframe_indices.items():
    keyframes[phase] = valid_poses[idx]

# Save keyframes
output_file = '/home/ubuntu/aligned-recreation/throwing_keyframes.json'
with open(output_file, 'w') as f:
    json.dump({
        'fps': fps,
        'keyframes': keyframes,
        'analysis': {
            'elbow_angle_range': [float(elbow_angles.min()), float(elbow_angles.max())],
            'wrist_height_range': [float(wrist_heights.min()), float(wrist_heights.max())],
            'hip_rotation_range': [float(hip_rotations.min()), float(hip_rotations.max())]
        }
    }, f, indent=2)

print(f"Keyframes saved to: {output_file}")
print("\nDone!")

