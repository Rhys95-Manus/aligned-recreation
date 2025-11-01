import json
import numpy as np

# Load the full pose data
with open('facebook_pose_data.json', 'r') as f:
    data = json.load(f)

pose_data = data['poses']

# Extract frames from seconds 6-7 (frames 180-210 at 30fps)
start_frame = 180
end_frame = 210

# Filter frames in the 6-7 second range
frames_6to7 = [f for f in pose_data if start_frame <= f['frame'] <= end_frame]

print(f"Total frames in 6-7 second range: {len(frames_6to7)}")

# Analyze throwing motion by tracking right wrist height and elbow angle
def calculate_elbow_angle(landmarks):
    # Right arm: shoulder(12), elbow(14), wrist(16)
    shoulder = np.array([landmarks[12]['x'], landmarks[12]['y'], landmarks[12]['z']])
    elbow = np.array([landmarks[14]['x'], landmarks[14]['y'], landmarks[14]['z']])
    wrist = np.array([landmarks[16]['x'], landmarks[16]['y'], landmarks[16]['z']])
    
    # Vectors
    v1 = shoulder - elbow
    v2 = wrist - elbow
    
    # Angle
    cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
    angle = np.degrees(np.arccos(np.clip(cos_angle, -1.0, 1.0)))
    
    return angle

# Find key phases based on elbow angle and wrist height
motion_analysis = []
for frame in frames_6to7:
    landmarks = frame['landmarks']
    elbow_angle = calculate_elbow_angle(landmarks)
    wrist_height = landmarks[16]['y']  # Right wrist
    
    motion_analysis.append({
        'frame': frame['frame'],
        'timestamp': frame['timestamp'],
        'elbow_angle': elbow_angle,
        'wrist_height': wrist_height
    })

# Find 6 keyframes
# Neutral: Start of motion (frame 180)
# Wind-up: Elbow starts bending
# Cocking: Minimum elbow angle (most bent)
# Acceleration: Elbow extending rapidly
# Release: Wrist at highest point
# Follow-through: After release

neutral_frame = frames_6to7[0]
follow_through_frame = frames_6to7[-1]

# Find cocking (minimum elbow angle)
cocking_idx = min(range(len(motion_analysis)), key=lambda i: motion_analysis[i]['elbow_angle'])
cocking_frame = frames_6to7[cocking_idx]

# Find release (maximum wrist height)
release_idx = max(range(len(motion_analysis)), key=lambda i: motion_analysis[i]['wrist_height'])
release_frame = frames_6to7[release_idx]

# Wind-up: 1/3 between neutral and cocking
windup_idx = len(frames_6to7) // 6
windup_frame = frames_6to7[windup_idx]

# Acceleration: midpoint between cocking and release
acceleration_idx = (cocking_idx + release_idx) // 2
acceleration_frame = frames_6to7[acceleration_idx]

keyframes = {
    'neutral': neutral_frame,
    'windup': windup_frame,
    'cocking': cocking_frame,
    'acceleration': acceleration_frame,
    'release': release_frame,
    'follow_through': follow_through_frame
}

print("\n=== KEYFRAMES EXTRACTED (6-7 seconds, FRONT-FACING) ===")
for phase, frame in keyframes.items():
    idx = frames_6to7.index(frame)
    analysis = motion_analysis[idx]
    print(f"{phase.upper()}: Frame {frame['frame']} ({frame['timestamp']:.2f}s)")
    print(f"  Elbow angle: {analysis['elbow_angle']:.1f}°")
    print(f"  Wrist height: {analysis['wrist_height']:.3f}")

# Save keyframes
with open('keyframes_6to7_frontfacing.json', 'w') as f:
    json.dump(keyframes, f, indent=2)

print("\n✅ Keyframes saved to keyframes_6to7_frontfacing.json")

