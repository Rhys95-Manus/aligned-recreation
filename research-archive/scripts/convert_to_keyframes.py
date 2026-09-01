#!/usr/bin/env python3
"""
Convert MediaPipe pose keyframes to our keyframe format
"""

import json

# Load extracted keyframes
with open('/home/ubuntu/aligned-recreation/throwing_keyframes.json', 'r') as f:
    data = json.load(f)

keyframes = data['keyframes']

# MediaPipe landmark indices
# 0: nose, 11: left_shoulder, 12: right_shoulder
# 13: left_elbow, 14: right_elbow, 15: left_wrist, 16: right_wrist
# 23: left_hip, 24: right_hip, 25: left_knee, 26: right_knee
# 27: left_ankle, 28: right_ankle, 29: left_heel, 30: right_heel
# 31: left_foot_index, 32: right_foot_index

def format_keyframe(phase_name, pose_data):
    """Convert MediaPipe landmarks to our keyframe format"""
    lms = pose_data['landmarks']
    
    # Create TypeScript-style keyframe
    lines = []
    lines.append(f"    // {phase_name.upper()} - Frame {pose_data['frame']} ({pose_data['timestamp']:.2f}s)")
    lines.append(f"    {{")
    lines.append(f"      progress: {get_progress(phase_name)},")
    lines.append(f"      phase: '{phase_name.capitalize()}',")
    lines.append(f"      landmarks: [")
    
    # All 33 landmarks
    for i, lm in enumerate(lms):
        x = lm['x']
        y = lm['y']
        z = lm['z']
        vis = lm['visibility']
        lines.append(f"        createLandmark({x:.6f}, {y:.6f}, {z:.6f}, {vis:.2f}), // {i}")
    
    lines.append(f"      ]")
    lines.append(f"    }}")
    
    return "\n".join(lines)

def get_progress(phase_name):
    """Get progress value for each phase"""
    progress_map = {
        'neutral': 0.0,
        'windup': 0.35,
        'cocking': 0.55,
        'acceleration': 0.70,
        'release': 0.82,
        'followthrough': 1.0
    }
    return progress_map.get(phase_name, 0.0)

# Generate keyframes
print("// REAL QUARTERBACK MOTION KEYFRAMES")
print("// Extracted from Facebook reel using MediaPipe Pose")
print("// Source: https://www.facebook.com/reel/912999550989454")
print()

for phase in ['neutral', 'windup', 'cocking', 'acceleration', 'release', 'followthrough']:
    if phase in keyframes:
        print(format_keyframe(phase, keyframes[phase]))
        if phase != 'followthrough':
            print(",")
        print()

print("\n// Analysis:")
print(f"// Elbow angle range: {data['analysis']['elbow_angle_range'][0]:.1f}° to {data['analysis']['elbow_angle_range'][1]:.1f}°")
print(f"// Wrist height range: {data['analysis']['wrist_height_range'][0]:.3f} to {data['analysis']['wrist_height_range'][1]:.3f}")
print(f"// Hip rotation range: {data['analysis']['hip_rotation_range'][0]:.3f} to {data['analysis']['hip_rotation_range'][1]:.3f}")

