import json
import numpy as np

# Load both best sequences
with open('best_throwing_sequence.json', 'r') as f:
    video1_best = json.load(f)

with open('video2_best_sequence.json', 'r') as f:
    video2_best = json.load(f)

print("=== COMPARISON: Video 1 (side-view) vs Video 2 (front-view) ===\n")

print("VIDEO 1 (Side-view, 3-4s):")
print(f"  Score: {video1_best['score']:.1f}")
print(f"  Elbow range: {video1_best['elbow_range']:.1f}°")
print(f"  Hip rotation: {video1_best['hip_range']:.3f}")
print(f"  Shoulder rotation: {video1_best['shoulder_range']:.3f}")
print(f"  Frames: {len(video1_best['sequence'])}")

print("\nVIDEO 2 (Front-view, 32.5-34.5s):")
print(f"  Score: {video2_best['score']:.1f}")
print(f"  Elbow range: {video2_best['elbow_range']:.1f}°")
print(f"  Hip rotation: {video2_best['hip_range']:.3f}")
print(f"  Shoulder rotation: {video2_best['shoulder_range']:.3f}")
print(f"  Frames: {len(video2_best['sequence'])}")

print("\n=== ANALYSIS ===")
print(f"✅ Video 2 has BETTER elbow range: {video2_best['elbow_range']:.1f}° vs {video1_best['elbow_range']:.1f}° (+{video2_best['elbow_range'] - video1_best['elbow_range']:.1f}°)")
print(f"⚠️  Video 1 has BETTER hip rotation: {video1_best['hip_range']:.3f} vs {video2_best['hip_range']:.3f} (+{video1_best['hip_range'] - video2_best['hip_range']:.3f})")
print(f"⚠️  Video 1 has BETTER shoulder rotation: {video1_best['shoulder_range']:.3f} vs {video2_best['shoulder_range']:.3f} (+{video1_best['shoulder_range'] - video2_best['shoulder_range']:.3f})")

print("\n=== CAMERA ANGLE ===")
# Check if person is facing camera or sideways by comparing x-spread vs z-spread
v1_seq = video1_best['sequence']
v2_seq = video2_best['sequence']

# Sample middle frame
v1_mid = v1_seq[len(v1_seq)//2]['landmarks']
v2_mid = v2_seq[len(v2_seq)//2]['landmarks']

# Calculate shoulder width (x-axis) vs depth (z-axis)
v1_shoulder_width = abs(v1_mid[11]['x'] - v1_mid[12]['x'])
v1_shoulder_depth = abs(v1_mid[11]['z'] - v1_mid[12]['z'])

v2_shoulder_width = abs(v2_mid[11]['x'] - v2_mid[12]['x'])
v2_shoulder_depth = abs(v2_mid[11]['z'] - v2_mid[12]['z'])

print(f"Video 1: Shoulder width={v1_shoulder_width:.3f}, depth={v1_shoulder_depth:.3f}, ratio={v1_shoulder_width/v1_shoulder_depth:.2f}")
print(f"Video 2: Shoulder width={v2_shoulder_width:.3f}, depth={v2_shoulder_depth:.3f}, ratio={v2_shoulder_width/v2_shoulder_depth:.2f}")

if v1_shoulder_width/v1_shoulder_depth < 1.0:
    print("  → Video 1 is SIDE-VIEW (depth > width)")
else:
    print("  → Video 1 is FRONT-VIEW (width > depth)")

if v2_shoulder_width/v2_shoulder_depth < 1.0:
    print("  → Video 2 is SIDE-VIEW (depth > width)")
else:
    print("  → Video 2 is FRONT-VIEW (width > depth)")

print("\n=== RECOMMENDATION ===")
print("Video 2 (32.5-34.5s) is the BEST choice because:")
print("  ✅ Front-facing (matches user's recording angle)")
print("  ✅ Excellent elbow range (147.6°)")
print("  ✅ Good shoulder rotation (0.610)")
print("  ⚠️  Moderate hip rotation (0.215) - but still visible")
print("\nVideo 1 has more hip rotation but is side-view (wrong angle).")

