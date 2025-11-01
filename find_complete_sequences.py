import json
import numpy as np

# Load Video 2
with open('fb_video2_poses.json', 'r') as f:
    video2_data = json.load(f)

def analyze_sequence_completeness(poses, start_time, end_time):
    """Check if sequence has all throwing phases"""
    sequence = [p for p in poses if start_time <= p['timestamp'] <= end_time]
    
    if len(sequence) < 30:  # Need at least 1 second
        return None
    
    # Analyze metrics
    elbow_angles = []
    wrist_heights = []
    hip_rotations = []
    
    for pose in sequence:
        lm = pose['landmarks']
        
        # Right elbow angle
        shoulder = np.array([lm[12]['x'], lm[12]['y'], lm[12]['z']])
        elbow = np.array([lm[14]['x'], lm[14]['y'], lm[14]['z']])
        wrist = np.array([lm[16]['x'], lm[16]['y'], lm[16]['z']])
        
        v1 = shoulder - elbow
        v2 = wrist - elbow
        elbow_angle = np.degrees(np.arccos(np.clip(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)), -1, 1)))
        
        elbow_angles.append(elbow_angle)
        wrist_heights.append(lm[16]['y'])
        hip_rotations.append(abs(lm[23]['z'] - lm[25]['z']))
    
    # Check for complete motion pattern:
    # 1. Elbow should go from extended → flexed → extended (U-shape or inverted U)
    # 2. Wrist should move up then down (or vice versa)
    
    min_elbow = min(elbow_angles)
    max_elbow = max(elbow_angles)
    min_elbow_idx = elbow_angles.index(min_elbow)
    max_elbow_idx = elbow_angles.index(max_elbow)
    
    min_wrist = min(wrist_heights)
    max_wrist = max(wrist_heights)
    min_wrist_idx = wrist_heights.index(min_wrist)
    max_wrist_idx = wrist_heights.index(max_wrist)
    
    # Check if motion follows throwing pattern:
    # Elbow should go from high → low → high (cocking in middle)
    # OR low → high (acceleration to follow-through)
    
    # Score based on:
    # 1. Elbow range
    # 2. Hip rotation range
    # 3. Wrist movement range
    # 4. Pattern completeness (does it have beginning, middle, end?)
    
    elbow_range = max_elbow - min_elbow
    hip_range = max(hip_rotations) - min(hip_rotations)
    wrist_range = max_wrist - min_wrist
    
    # Check if sequence starts with neutral (higher wrist, moderate elbow)
    starts_neutral = wrist_heights[0] > np.median(wrist_heights) and 80 < elbow_angles[0] < 140
    
    # Check if sequence has clear cocking phase (low elbow angle)
    has_cocking = min_elbow < 60
    
    # Check if sequence has release (high wrist position)
    has_release = min_wrist < np.median(wrist_heights)
    
    # Check if sequence has follow-through (high elbow angle)
    has_follow = max_elbow > 150
    
    completeness_score = sum([starts_neutral, has_cocking, has_release, has_follow])
    
    score = elbow_range + (hip_range * 100) + (wrist_range * 50) + (completeness_score * 20)
    
    return {
        'start_time': start_time,
        'end_time': end_time,
        'score': score,
        'elbow_range': elbow_range,
        'hip_range': hip_range,
        'wrist_range': wrist_range,
        'starts_neutral': starts_neutral,
        'has_cocking': has_cocking,
        'has_release': has_release,
        'has_follow': has_follow,
        'completeness': completeness_score,
        'frames': len(sequence)
    }

print("Scanning for COMPLETE throwing sequences (all phases visible)...\n")

# Try 2-3 second windows
results = []
for duration in [2.0, 2.5, 3.0]:
    for start in np.arange(0, 48.33 - duration, 0.5):
        end = start + duration
        result = analyze_sequence_completeness(video2_data['poses'], start, end)
        if result:
            results.append(result)

# Sort by completeness first, then score
results.sort(key=lambda x: (x['completeness'], x['score']), reverse=True)

# Show top 15 most complete sequences
print("=== TOP 15 MOST COMPLETE SEQUENCES ===\n")
for i, r in enumerate(results[:15], 1):
    phases = []
    if r['starts_neutral']: phases.append('Neutral')
    if r['has_cocking']: phases.append('Cocking')
    if r['has_release']: phases.append('Release')
    if r['has_follow']: phases.append('Follow')
    
    print(f"{i}. {r['start_time']:.1f}-{r['end_time']:.1f}s ({r['end_time']-r['start_time']:.1f}s): Score={r['score']:.1f}, Completeness={r['completeness']}/4")
    print(f"   Phases: {', '.join(phases)}")
    print(f"   Elbow: {r['elbow_range']:.1f}°, Hip: {r['hip_range']:.3f}, Wrist: {r['wrist_range']:.3f}")
    print()

# Save best complete sequence
best = results[0]
print(f"\n✅ BEST COMPLETE SEQUENCE: {best['start_time']:.1f}-{best['end_time']:.1f}s")
print(f"   Completeness: {best['completeness']}/4")
print(f"   Score: {best['score']:.1f}")

# Extract and save
best_sequence = [p for p in video2_data['poses'] if best['start_time'] <= p['timestamp'] <= best['end_time']]

with open('complete_throwing_sequence.json', 'w') as f:
    json.dump({
        'video': 'fb_video2.mp4',
        'start_time': float(best['start_time']),
        'end_time': float(best['end_time']),
        'completeness': int(best['completeness']),
        'score': float(best['score']),
        'sequence': best_sequence
    }, f, indent=2)

print("\nSaved to complete_throwing_sequence.json")

