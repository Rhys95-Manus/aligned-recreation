import cv2
import mediapipe as mp
import json
import sys

if len(sys.argv) != 5:
    print("Usage: python3 extract_pose_range.py <video_path> <output_json> <start_time> <end_time>")
    sys.exit(1)

video_path = sys.argv[1]
output_path = sys.argv[2]
start_time = float(sys.argv[3])
end_time = float(sys.argv[4])

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=2,
    enable_segmentation=False,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Load video
cap = cv2.VideoCapture(video_path)
if not cap.isOpened():
    print(f"Error: Could not open video {video_path}")
    sys.exit(1)

fps = cap.get(cv2.CAP_PROP_FPS)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
duration = total_frames / fps

print(f"Video: {video_path}")
print(f"FPS: {fps}, Total frames: {total_frames}, Duration: {duration:.2f}s")
print(f"Processing range: {start_time}s to {end_time}s")

# Calculate frame range
start_frame = int(start_time * fps)
end_frame = int(end_time * fps)

# Seek to start frame
cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)

poses_data = []
frame_idx = start_frame
detected_count = 0

while frame_idx <= end_frame:
    ret, frame = cap.read()
    if not ret:
        break
    
    # Convert BGR to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Process with MediaPipe
    results = pose.process(rgb_frame)
    
    timestamp = frame_idx / fps
    
    if results.pose_landmarks:
        detected_count += 1
        landmarks = []
        for lm in results.pose_landmarks.landmark:
            landmarks.append({
                'x': float(lm.x),
                'y': float(lm.y),
                'z': float(lm.z),
                'visibility': float(lm.visibility)
            })
        
        poses_data.append({
            'frame': frame_idx,
            'timestamp': timestamp,
            'landmarks': landmarks
        })
    
    frame_idx += 1
    
    if frame_idx % 10 == 0:
        progress = (frame_idx - start_frame) / (end_frame - start_frame) * 100
        print(f"Progress: {progress:.1f}% ({frame_idx - start_frame}/{end_frame - start_frame} frames)")

cap.release()
pose.close()

detection_rate = detected_count / (end_frame - start_frame + 1) * 100
print(f"\nProcessing complete!")
print(f"Frames processed: {end_frame - start_frame + 1}")
print(f"Poses detected: {detected_count} ({detection_rate:.1f}%)")

# Save to JSON
output_data = {
    'video': video_path,
    'fps': fps,
    'time_range': f'{start_time}-{end_time}s',
    'detection_rate': detection_rate,
    'poses': poses_data
}

with open(output_path, 'w') as f:
    json.dump(output_data, f, indent=2)

print(f"Saved to {output_path}")

