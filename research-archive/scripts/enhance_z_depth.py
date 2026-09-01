import json
import copy

# Load Video 5 keyframes
with open('video5_keyframes_original.json', 'r') as f:
    keyframes = json.load(f)

print("Enhancing z-depth based on QB throwing biomechanics...")
print("="*80)

# Biomechanical z-depth enhancements for each phase
# Positive z = away from camera (back), Negative z = toward camera (forward)
z_enhancements = {
    'Neutral': {
        'description': 'Square stance, minimal rotation',
        'right_shoulder': 0.05,  # Slightly back (throwing arm side)
        'left_shoulder': -0.05,  # Slightly forward
        'right_hip': 0.05,
        'left_hip': -0.05,
        'right_foot': 0.10,  # Back foot
        'left_foot': -0.10,  # Front foot
    },
    'Wind-up': {
        'description': 'Beginning rotation, right side moving back',
        'right_shoulder': 0.20,  # Rotating back
        'left_shoulder': -0.10,
        'right_hip': 0.15,
        'left_hip': -0.05,
        'right_foot': 0.10,
        'left_foot': -0.10,
    },
    'Cocking': {
        'description': 'Maximum rotation, right shoulder/hip fully back',
        'right_shoulder': 0.30,  # Maximum back position
        'left_shoulder': -0.15,
        'right_hip': 0.25,
        'left_hip': -0.10,
        'right_foot': 0.10,
        'left_foot': -0.10,
    },
    'Acceleration': {
        'description': 'Hips snapping forward, shoulders lagging (torque)',
        'right_shoulder': 0.25,  # Still back (lag)
        'left_shoulder': -0.10,
        'right_hip': 0.10,  # Hips forward (lead)
        'left_hip': -0.05,
        'right_foot': 0.10,
        'left_foot': -0.10,
    },
    'Release': {
        'description': 'Body square to target, arm extended',
        'right_shoulder': 0.05,  # Square
        'left_shoulder': -0.05,
        'right_hip': 0.05,
        'left_hip': -0.05,
        'right_foot': 0.05,  # Weight transferred
        'left_foot': -0.15,  # Front foot planted
    },
    'Follow-through': {
        'description': 'Right shoulder crosses over, reverse rotation',
        'right_shoulder': -0.20,  # Crosses forward
        'left_shoulder': 0.10,  # Moves back
        'right_hip': -0.10,
        'left_hip': 0.05,
        'right_foot': 0.00,  # Weight fully forward
        'left_foot': -0.20,
    },
}

# MediaPipe landmark indices
landmark_map = {
    'left_shoulder': 11,
    'right_shoulder': 12,
    'left_hip': 23,
    'right_hip': 24,
    'left_foot': 31,  # Left heel
    'right_foot': 32,  # Right heel
}

# Apply enhancements
enhanced_keyframes = []
for kf in keyframes:
    phase = kf['phase']
    enhancements = z_enhancements[phase]
    
    print(f"\n{phase}: {enhancements['description']}")
    
    # Deep copy landmarks
    enhanced_lm = copy.deepcopy(kf['landmarks'])
    
    # Apply z-enhancements to key landmarks
    for body_part, lm_idx in landmark_map.items():
        if body_part in enhancements:
            original_z = enhanced_lm[lm_idx]['z']
            enhanced_z = enhancements[body_part]
            enhanced_lm[lm_idx]['z'] = enhanced_z
            print(f"  {body_part}: {original_z:.3f} → {enhanced_z:.3f}")
    
    # Interpolate other landmarks based on nearby enhanced landmarks
    # Elbows follow shoulders
    enhanced_lm[13]['z'] = enhanced_lm[11]['z']  # Left elbow = left shoulder
    enhanced_lm[14]['z'] = enhanced_lm[12]['z']  # Right elbow = right shoulder
    
    # Wrists follow elbows
    enhanced_lm[15]['z'] = enhanced_lm[13]['z']  # Left wrist = left elbow
    enhanced_lm[16]['z'] = enhanced_lm[14]['z']  # Right wrist = right elbow
    
    # Knees follow hips
    enhanced_lm[25]['z'] = enhanced_lm[23]['z']  # Left knee = left hip
    enhanced_lm[26]['z'] = enhanced_lm[24]['z']  # Right knee = right hip
    
    # Ankles follow feet
    enhanced_lm[27]['z'] = enhanced_lm[31]['z']  # Left ankle = left heel
    enhanced_lm[28]['z'] = enhanced_lm[32]['z']  # Right ankle = right heel
    
    enhanced_keyframes.append({
        'phase': phase,
        'frame': kf['frame'],
        'timestamp': kf['timestamp'],
        'elbow_angle': kf['elbow_angle'],
        'landmarks': enhanced_lm
    })

# Save enhanced keyframes
with open('video5_keyframes_enhanced.json', 'w') as f:
    json.dump(enhanced_keyframes, f, indent=2)

print("\n" + "="*80)
print("✅ Enhanced keyframes saved to video5_keyframes_enhanced.json")
print("✅ Z-depth manually added based on QB throwing biomechanics")

