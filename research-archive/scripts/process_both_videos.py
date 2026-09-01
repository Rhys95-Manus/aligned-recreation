import cv2
import mediapipe as mp
import json

mp_pose = mp.solutions.pose

def process_video(video_path, output_json):
    """Process video with MediaPipe and save pose data"""
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps
    
    print(f"\n=== Processing {video_path} ===")
    print(f"FPS: {fps}, Total frames: {total_frames}, Duration: {duration:.2f}s")
    
    poses = []
    frame_count = 0
    detected_count = 0
    
    with mp_pose.Pose(
        static_image_mode=False,
        model_complexity=2,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(frame_rgb)
            
            timestamp = frame_count / fps
            
            if results.pose_landmarks:
                landmarks = []
                for lm in results.pose_landmarks.landmark:
                    landmarks.append({
                        'x': lm.x,
                        'y': lm.y,
                        'z': lm.z,
                        'visibility': lm.visibility
                    })
                
                poses.append({
                    'frame': frame_count,
                    'timestamp': timestamp,
                    'landmarks': landmarks
                })
                detected_count += 1
            
            frame_count += 1
            if frame_count % 30 == 0:
                print(f"Progress: {frame_count}/{total_frames} ({frame_count/total_frames*100:.1f}%)")
    
    cap.release()
    
    # Save to JSON
    data = {
        'fps': fps,
        'total_frames': total_frames,
        'duration': duration,
        'poses': poses
    }
    
    with open(output_json, 'w') as f:
        json.dump(data, f)
    
    print(f"✅ Processed {detected_count}/{total_frames} frames ({detected_count/total_frames*100:.1f}% detection rate)")
    print(f"Saved to {output_json}")
    
    return data

# Process both videos
video1_data = process_video('fb_video1.mp4', 'fb_video1_poses.json')
video2_data = process_video('fb_video2.mp4', 'fb_video2_poses.json')

print("\n=== SUMMARY ===")
print(f"Video 1: {video1_data['duration']:.2f}s, {len(video1_data['poses'])} poses detected")
print(f"Video 2: {video2_data['duration']:.2f}s, {len(video2_data['poses'])} poses detected")

