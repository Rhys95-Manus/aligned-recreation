#!/usr/bin/env python3
"""
Extract pose data from QB throwing video using MediaPipe
"""

import cv2
import mediapipe as mp
import json
import numpy as np

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=2,  # Highest accuracy
    smooth_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Load video
video_path = '/home/ubuntu/aligned-recreation/qb_video.mp4'
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("Error: Could not open video")
    exit(1)

# Get video properties
fps = cap.get(cv2.CAP_PROP_FPS)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
duration = total_frames / fps

print(f"Video loaded successfully")
print(f"FPS: {fps}")
print(f"Total frames: {total_frames}")
print(f"Duration: {duration:.2f} seconds")
print()

# Process video
all_poses = []
frame_count = 0

print("Processing video frames...")
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    
    # Convert BGR to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Process frame
    results = pose.process(rgb_frame)
    
    if results.pose_landmarks:
        # Extract landmarks
        landmarks = []
        for lm in results.pose_landmarks.landmark:
            landmarks.append({
                'x': lm.x,
                'y': lm.y,
                'z': lm.z,
                'visibility': lm.visibility
            })
        
        all_poses.append({
            'frame': frame_count,
            'timestamp': frame_count / fps,
            'landmarks': landmarks
        })
    else:
        all_poses.append({
            'frame': frame_count,
            'timestamp': frame_count / fps,
            'landmarks': None
        })
    
    frame_count += 1
    
    # Progress update every 30 frames
    if frame_count % 30 == 0:
        progress = (frame_count / total_frames) * 100
        print(f"Progress: {progress:.1f}% ({frame_count}/{total_frames} frames)")

cap.release()
pose.close()

print(f"\nProcessing complete!")
print(f"Frames with pose detected: {sum(1 for p in all_poses if p['landmarks'] is not None)}")
print(f"Frames without pose: {sum(1 for p in all_poses if p['landmarks'] is None)}")

# Save all pose data
output_file = '/home/ubuntu/aligned-recreation/pose_data_full.json'
with open(output_file, 'w') as f:
    json.dump({
        'fps': fps,
        'total_frames': total_frames,
        'duration': duration,
        'poses': all_poses
    }, f, indent=2)

print(f"\nPose data saved to: {output_file}")

# Analyze motion to find throwing sequences
print("\nAnalyzing motion patterns...")

# Calculate right elbow angle over time to find throwing motions
def calculate_angle(shoulder, elbow, wrist):
    """Calculate angle at elbow joint"""
    if not all([shoulder, elbow, wrist]):
        return None
    
    # Vectors
    v1 = np.array([shoulder['x'] - elbow['x'], shoulder['y'] - elbow['y']])
    v2 = np.array([wrist['x'] - elbow['x'], wrist['y'] - elbow['y']])
    
    # Angle
    cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
    angle = np.arccos(np.clip(cos_angle, -1.0, 1.0))
    return np.degrees(angle)

elbow_angles = []
for pose_data in all_poses:
    if pose_data['landmarks']:
        lms = pose_data['landmarks']
        # Right arm: shoulder(12), elbow(14), wrist(16)
        angle = calculate_angle(lms[12], lms[14], lms[16])
        elbow_angles.append(angle if angle else 180)
    else:
        elbow_angles.append(180)

# Find throwing motions (elbow angle drops significantly then extends)
print(f"\nElbow angle range: {min(elbow_angles):.1f}° to {max(elbow_angles):.1f}°")

# Find frames where elbow is most bent (cocking phase)
min_angle_frame = np.argmin(elbow_angles)
min_angle = elbow_angles[min_angle_frame]
print(f"Most bent elbow at frame {min_angle_frame} ({min_angle_frame/fps:.2f}s): {min_angle:.1f}°")

# Find a good throwing sequence (3 seconds around the most bent elbow)
sequence_duration = 3.0  # seconds
sequence_frames = int(sequence_duration * fps)
start_frame = max(0, min_angle_frame - sequence_frames // 2)
end_frame = min(total_frames, start_frame + sequence_frames)

print(f"\nBest throwing sequence:")
print(f"  Start: frame {start_frame} ({start_frame/fps:.2f}s)")
print(f"  End: frame {end_frame} ({end_frame/fps:.2f}s)")
print(f"  Duration: {(end_frame - start_frame)/fps:.2f}s")

# Extract throwing sequence
throwing_sequence = all_poses[start_frame:end_frame]

# Save throwing sequence
sequence_file = '/home/ubuntu/aligned-recreation/throwing_sequence.json'
with open(sequence_file, 'w') as f:
    json.dump({
        'fps': float(fps),
        'start_frame': int(start_frame),
        'end_frame': int(end_frame),
        'duration': float((end_frame - start_frame) / fps),
        'poses': throwing_sequence
    }, f, indent=2)

print(f"\nThrowing sequence saved to: {sequence_file}")
print("\nDone!")

