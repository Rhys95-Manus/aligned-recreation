#!/usr/bin/env python3
"""
Extract pose data from Facebook QB throwing video using MediaPipe
"""

import cv2
import mediapipe as mp
import json
import numpy as np

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=2,
    smooth_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Load video
video_path = '/home/ubuntu/aligned-recreation/qb_facebook.mp4'
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
    
    # Progress update
    if frame_count % 30 == 0 or frame_count == total_frames:
        progress = (frame_count / total_frames) * 100
        print(f"Progress: {progress:.1f}% ({frame_count}/{total_frames} frames)")

cap.release()
pose.close()

print(f"\nProcessing complete!")
print(f"Frames with pose detected: {sum(1 for p in all_poses if p['landmarks'] is not None)}")
print(f"Frames without pose: {sum(1 for p in all_poses if p['landmarks'] is None)}")

# Save all pose data
output_file = '/home/ubuntu/aligned-recreation/facebook_pose_data.json'
with open(output_file, 'w') as f:
    json.dump({
        'fps': float(fps),
        'total_frames': total_frames,
        'duration': float(duration),
        'poses': all_poses
    }, f, indent=2)

print(f"\nPose data saved to: {output_file}")
print("\nDone!")

