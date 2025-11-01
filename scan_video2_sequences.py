import json
import numpy as np

def analyze_throwing_motion(poses, start_time, end_time):
    """Analyze throwing motion in a time range"""
    sequence = [p for p in poses if start_time <= p['timestamp'] <= end_time]
    
    if len(sequence) < 20:  # Need at least 20 frames for a good sequence
        return None
    
    # Analyze motion metrics
    metrics = []
    for pose in sequence:
        lm = pose['landmarks']
        
        # Right elbow angle
        shoulder = np.array([lm[12]['x'], lm[12]['y'], lm[12]['z']])
        elbow = np.array([lm[14]['x'], lm[14]['y'], lm[14]['z']])
        wrist = np.array([lm[16]['x'], lm[16]['y'], lm[16]['z']])
        
        v1 = shoulder - elbow
        v2 = wrist - elbow
        elbow_angle = np.degrees(np.arccos(np.clip(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)), -1, 1)))
        
        # Hip rotation (z-depth difference)
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
            'elbow_angle': elbow_angle,
            'hip_rotation': hip_rotation,
            'shoulder_rotation': shoulder_rotation,
            'wrist_height': wrist_height
        })
    
    # Score the sequence
    elbow_range = max(m['elbow_angle'] for m in metrics) - min(m['elbow_angle'] for m in metrics)
    hip_range = max(m['hip_rotation'] for m in metrics) - min(m['hip_rotation'] for m in metrics)
    shoulder_range = max(m['shoulder_rotation'] for m in metrics) - min(m['shoulder_rotation'] for m in metrics)
    
    score = elbow_range + (hip_range * 100) + (shoulder_range * 100)
    
    return {
        'start_time': start_time,
        'end_time': end_time,
        'score': score,
        'elbow_range': elbow_range,
        'hip_range': hip_range,
        'shoulder_range': shoulder_range,
        'frames': len(sequence)
    }

# Load Video 2
with open('fb_video2_poses.json', 'r') as f:
    video2_data = json.load(f)

print("Scanning Video 2 (48.33s total) for best throwing sequences...")
print("Testing 2-second windows every 0.5 seconds\n")

# Scan every 0.5 seconds with 2-second windows
results = []
for start in np.arange(0, 46.5, 0.5):  # 48.33 - 2 = 46.33
    end = start + 2.0
    result = analyze_throwing_motion(video2_data['poses'], start, end)
    if result:
        results.append(result)

# Sort by score
results.sort(key=lambda x: x['score'], reverse=True)

# Show top 10
print("=== TOP 10 THROWING SEQUENCES ===\n")
for i, r in enumerate(results[:10], 1):
    print(f"{i}. {r['start_time']:.1f}-{r['end_time']:.1f}s: Score = {r['score']:.1f}")
    print(f"   Elbow: {r['elbow_range']:.1f}°, Hip: {r['hip_range']:.3f}, Shoulder: {r['shoulder_range']:.3f}, Frames: {r['frames']}")
    print()

# Save best
best = results[0]
print(f"✅ BEST SEQUENCE: {best['start_time']:.1f}-{best['end_time']:.1f}s")
print(f"   Score: {best['score']:.1f}")
print(f"   Elbow range: {best['elbow_range']:.1f}°")
print(f"   Hip rotation: {best['hip_range']:.3f}")
print(f"   Shoulder rotation: {best['shoulder_range']:.3f}")

# Extract and save the best sequence
best_sequence = [p for p in video2_data['poses'] if best['start_time'] <= p['timestamp'] <= best['end_time']]

with open('video2_best_sequence.json', 'w') as f:
    json.dump({
        'video': 'fb_video2.mp4',
        'start_time': best['start_time'],
        'end_time': best['end_time'],
        'score': best['score'],
        'elbow_range': best['elbow_range'],
        'hip_range': best['hip_range'],
        'shoulder_range': best['shoulder_range'],
        'sequence': best_sequence
    }, f, indent=2)

print("\nSaved to video2_best_sequence.json")

