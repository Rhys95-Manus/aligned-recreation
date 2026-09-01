import cv2
import mediapipe as mp
import json
import sys

# Video processing configuration
videos = [
    ("video1_side_fluid.mp4", 2.0, 4.0, "side"),
    ("video2_side.mp4", 15.0, 17.0, "side"),
    ("video3_side.mp4", 0.0, 2.0, "side"),
    ("video4_front_torso.mp4", 63.0, 65.0, "front_torso"),
    ("video5_front.mp4", 3.0, 4.0, "front"),
    ("video6_mixed.mp4", 2.0, 4.0, "mixed"),
]

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=2,
    enable_segmentation=False,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

all_results = {}

for video_file, start_time, end_time, angle in videos:
    print(f"\n{'='*80}")
    print(f"Processing: {video_file} ({start_time}-{end_time}s, {angle} angle)")
    print(f"{'='*80}")
    
    cap = cv2.VideoCapture(video_file)
    if not cap.isOpened():
        print(f"ERROR: Could not open {video_file}")
        continue
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps
    
    print(f"FPS: {fps}, Total frames: {total_frames}, Duration: {duration:.2f}s")
    
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
    
    cap.release()
    
    detection_rate = detected_count / (end_frame - start_frame + 1) * 100
    print(f"Frames processed: {end_frame - start_frame + 1}")
    print(f"Poses detected: {detected_count} ({detection_rate:.1f}%)")
    
    # Save individual result
    output_file = video_file.replace('.mp4', '_poses.json')
    output_data = {
        'video': video_file,
        'fps': fps,
        'time_range': f'{start_time}-{end_time}s',
        'angle': angle,
        'detection_rate': detection_rate,
        'poses': poses_data
    }
    
    with open(output_file, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"Saved to {output_file}")
    
    all_results[video_file] = {
        'angle': angle,
        'time_range': f'{start_time}-{end_time}s',
        'detection_rate': detection_rate,
        'pose_count': len(poses_data)
    }

pose.close()

print(f"\n{'='*80}")
print("PROCESSING COMPLETE - SUMMARY")
print(f"{'='*80}")
for video, info in all_results.items():
    print(f"{video}:")
    print(f"  Angle: {info['angle']}")
    print(f"  Time: {info['time_range']}")
    print(f"  Detection: {info['detection_rate']:.1f}%")
    print(f"  Poses: {info['pose_count']}")
    print()

