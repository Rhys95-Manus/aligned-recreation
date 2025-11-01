import json
import numpy as np

def analyze_throwing_motion(poses, start_time, end_time, video_name):
    """Analyze throwing motion in a time range"""
    # Filter poses in time range
    sequence = [p for p in poses if start_time <= p['timestamp'] <= end_time]
    
    if len(sequence) == 0:
        print(f"{video_name}: No poses found in range {start_time}-{end_time}s")
        return None
    
    print(f"\n=== {video_name}: {start_time}-{end_time}s ===")
    print(f"Frames: {len(sequence)}")
    
    # Analyze motion metrics
    metrics = []
    for pose in sequence:
        lm = pose['landmarks']
        
        # Right elbow angle (shoulder 12, elbow 14, wrist 16)
        shoulder = np.array([lm[12]['x'], lm[12]['y'], lm[12]['z']])
        elbow = np.array([lm[14]['x'], lm[14]['y'], lm[14]['z']])
        wrist = np.array([lm[16]['x'], lm[16]['y'], lm[16]['z']])
        
        v1 = shoulder - elbow
        v2 = wrist - elbow
        elbow_angle = np.degrees(np.arccos(np.clip(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)), -1, 1)))
        
        # Hip rotation (z-depth difference between left and right hips)
        left_hip_z = lm[23]['z']
        right_hip_z = lm[25]['z']
        hip_rotation = abs(left_hip_z - right_hip_z)
        
        # Shoulder rotation
        left_shoulder_z = lm[11]['z']
        right_shoulder_z = lm[12]['z']
        shoulder_rotation = abs(left_shoulder_z - right_shoulder_z)
        
        # Wrist height
        wrist_height = lm[16]['y']
        
        metrics.append({
            'timestamp': pose['timestamp'],
            'elbow_angle': elbow_angle,
            'hip_rotation': hip_rotation,
            'shoulder_rotation': shoulder_rotation,
            'wrist_height': wrist_height
        })
    
    # Find key phases
    min_elbow_idx = min(range(len(metrics)), key=lambda i: metrics[i]['elbow_angle'])
    max_elbow_idx = max(range(len(metrics)), key=lambda i: metrics[i]['elbow_angle'])
    max_wrist_idx = min(range(len(metrics)), key=lambda i: metrics[i]['wrist_height'])  # min y = highest point
    
    print(f"\nMotion Analysis:")
    print(f"  Elbow angle range: {metrics[min_elbow_idx]['elbow_angle']:.1f}° → {metrics[max_elbow_idx]['elbow_angle']:.1f}°")
    print(f"  Hip rotation range: {min(m['hip_rotation'] for m in metrics):.3f} → {max(m['hip_rotation'] for m in metrics):.3f}")
    print(f"  Shoulder rotation range: {min(m['shoulder_rotation'] for m in metrics):.3f} → {max(m['shoulder_rotation'] for m in metrics):.3f}")
    print(f"  Wrist height range: {max(m['wrist_height'] for m in metrics):.3f} → {min(m['wrist_height'] for m in metrics):.3f}")
    
    print(f"\nKey Phases:")
    print(f"  Cocking (min elbow): {metrics[min_elbow_idx]['timestamp']:.2f}s, {metrics[min_elbow_idx]['elbow_angle']:.1f}°")
    print(f"  Release (max wrist): {metrics[max_wrist_idx]['timestamp']:.2f}s")
    print(f"  Follow-through (max elbow): {metrics[max_elbow_idx]['timestamp']:.2f}s, {metrics[max_elbow_idx]['elbow_angle']:.1f}°")
    
    # Score the sequence (higher is better)
    elbow_range = metrics[max_elbow_idx]['elbow_angle'] - metrics[min_elbow_idx]['elbow_angle']
    hip_range = max(m['hip_rotation'] for m in metrics) - min(m['hip_rotation'] for m in metrics)
    shoulder_range = max(m['shoulder_rotation'] for m in metrics) - min(m['shoulder_rotation'] for m in metrics)
    
    score = elbow_range + (hip_range * 100) + (shoulder_range * 100)
    
    print(f"\n3D Motion Score: {score:.1f}")
    print(f"  Elbow range: {elbow_range:.1f}°")
    print(f"  Hip rotation range: {hip_range:.3f}")
    print(f"  Shoulder rotation range: {shoulder_range:.3f}")
    
    return {
        'video': video_name,
        'start_time': start_time,
        'end_time': end_time,
        'score': score,
        'elbow_range': elbow_range,
        'hip_range': hip_range,
        'shoulder_range': shoulder_range,
        'sequence': sequence
    }

# Load both videos
with open('fb_video1_poses.json', 'r') as f:
    video1_data = json.load(f)

with open('fb_video2_poses.json', 'r') as f:
    video2_data = json.load(f)

# Analyze Video 1: seconds 3-4
result1 = analyze_throwing_motion(video1_data['poses'], 3.0, 4.0, "Video 1 (3-4s)")

# Analyze Video 2: 35 seconds onwards (try 35-37s for a 2-second sequence)
result2 = analyze_throwing_motion(video2_data['poses'], 35.0, 37.0, "Video 2 (35-37s)")

# Compare
print("\n\n=== COMPARISON ===")
if result1 and result2:
    print(f"Video 1 (3-4s): Score = {result1['score']:.1f}")
    print(f"Video 2 (35-37s): Score = {result2['score']:.1f}")
    
    best = result1 if result1['score'] > result2['score'] else result2
    print(f"\n✅ BEST: {best['video']} with score {best['score']:.1f}")
    print(f"   Elbow: {best['elbow_range']:.1f}°, Hip: {best['hip_range']:.3f}, Shoulder: {best['shoulder_range']:.3f}")
    
    # Save best sequence
    with open('best_throwing_sequence.json', 'w') as f:
        json.dump(best, f, indent=2)
    
    print("\nSaved best sequence to best_throwing_sequence.json")

