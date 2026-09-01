#!/usr/bin/env python3
"""
Audit script to analyze keyframe 3D coordinates and proportions
Reads the TypeScript keyframes file and analyzes z-coordinates
"""

import re
import json

# Read the keyframes file
with open('/home/ubuntu/aligned-recreation/client/src/utils/professionalMotionKeyframes.ts', 'r') as f:
    content = f.read()

# Extract keyframe data by finding createLandmark calls
# This is a simplified parser - looks for patterns like:
# createLandmark(baseX + 0.09, baseY - 0.23, 0.01)

print('='*80)
print('KEYFRAME 3D COORDINATE AUDIT')
print('='*80)

# Find all keyframe blocks
keyframe_pattern = r'{\s*phase:\s*"([^"]+)",\s*progress:\s*([\d.]+),'
keyframes = list(re.finditer(keyframe_pattern, content))

for idx, kf_match in enumerate(keyframes):
    phase = kf_match.group(1)
    progress = kf_match.group(2)
    
    print(f'\n{"="*80}')
    print(f'KEYFRAME {idx + 1}: {phase} (Progress: {progress})')
    print('='*80)
    
    # Find the landmarks section for this keyframe
    kf_start = kf_match.end()
    # Find next keyframe or end of array
    if idx < len(keyframes) - 1:
        kf_end = keyframes[idx + 1].start()
    else:
        kf_end = content.find('export function interpolateKeyframes')
    
    kf_content = content[kf_start:kf_end]
    
    # Extract shoulder, hip, knee, ankle landmarks
    # Shoulders (11-12), Hips (23-24), Knees (25-26), Ankles (27-28), Feet (29-32)
    
    # Find comments that mark these landmarks
    shoulder_match = re.search(r'// Shoulders.*?\n(.*?)createLandmark\((.*?)\).*?// Left shoulder.*?\n.*?createLandmark\((.*?)\).*?// Right shoulder', kf_content, re.DOTALL)
    hip_match = re.search(r'// Hips.*?\n(.*?)createLandmark\((.*?)\).*?// Left hip.*?\n.*?createLandmark\((.*?)\).*?// Right hip', kf_content, re.DOTALL)
    knee_match = re.search(r'// Knees.*?\n(.*?)createLandmark\((.*?)\).*?// Left knee.*?\n.*?createLandmark\((.*?)\).*?// Right knee', kf_content, re.DOTALL)
    ankle_match = re.search(r'// Ankles.*?\n(.*?)createLandmark\((.*?)\).*?// Left ankle.*?\n.*?createLandmark\((.*?)\).*?// Right ankle', kf_content, re.DOTALL)
    
    def parse_landmark(text):
        """Extract x, y, z from createLandmark(x, y, z) call"""
        # Remove baseX, baseY references and evaluate
        text = text.replace('baseX', '0.5').replace('baseY', '0.5')
        parts = [p.strip() for p in text.split(',')]
        if len(parts) >= 3:
            try:
                x = eval(parts[0])
                y = eval(parts[1])
                z = eval(parts[2])
                return {'x': x, 'y': y, 'z': z}
            except:
                return None
        return None
    
    # Parse landmarks
    if shoulder_match:
        left_shoulder = parse_landmark(shoulder_match.group(2))
        right_shoulder = parse_landmark(shoulder_match.group(3))
    else:
        left_shoulder = right_shoulder = None
        
    if hip_match:
        left_hip = parse_landmark(hip_match.group(2))
        right_hip = parse_landmark(hip_match.group(3))
    else:
        left_hip = right_hip = None
        
    if knee_match:
        left_knee = parse_landmark(knee_match.group(2))
        right_knee = parse_landmark(knee_match.group(3))
    else:
        left_knee = right_knee = None
        
    if ankle_match:
        left_ankle = parse_landmark(ankle_match.group(2))
        right_ankle = parse_landmark(ankle_match.group(3))
    else:
        left_ankle = right_ankle = None
    
    # Calculate z-rotations
    if left_shoulder and right_shoulder:
        shoulder_z_rot = right_shoulder['z'] - left_shoulder['z']
        print(f'\n📊 Z-AXIS ROTATION (Right - Left):')
        print(f'  Shoulders: {shoulder_z_rot:+.3f} (L: {left_shoulder["z"]:+.3f}, R: {right_shoulder["z"]:+.3f})')
    
    if left_hip and right_hip:
        hip_z_rot = right_hip['z'] - left_hip['z']
        print(f'  Hips:      {hip_z_rot:+.3f} (L: {left_hip["z"]:+.3f}, R: {right_hip["z"]:+.3f})')
    
    if left_knee and right_knee:
        knee_z_rot = right_knee['z'] - left_knee['z']
        print(f'  Knees:     {knee_z_rot:+.3f} (L: {left_knee["z"]:+.3f}, R: {right_knee["z"]:+.3f})')
    
    if left_ankle and right_ankle:
        ankle_z_rot = right_ankle['z'] - left_ankle['z']
        print(f'  Ankles:    {ankle_z_rot:+.3f} (L: {left_ankle["z"]:+.3f}, R: {right_ankle["z"]:+.3f})')
    
    # Check coordination
    if all([left_shoulder, right_shoulder, left_hip, right_hip]):
        rotation_diff = abs(shoulder_z_rot - hip_z_rot)
        print(f'\n⚠️  COORDINATION CHECK:')
        print(f'  Shoulder-Hip rotation diff: {rotation_diff:.3f} {"❌ TOO LARGE" if rotation_diff > 0.05 else "✅ OK"}')
        
        if left_knee and right_knee:
            knee_hip_diff = abs(knee_z_rot - hip_z_rot)
            print(f'  Knee-Hip rotation diff:     {knee_hip_diff:.3f} {"❌ TOO LARGE" if knee_hip_diff > 0.05 else "✅ OK"}')
        
        if left_ankle and right_ankle:
            ankle_hip_diff = abs(ankle_z_rot - hip_z_rot)
            print(f'  Ankle-Hip rotation diff:    {ankle_hip_diff:.3f} {"❌ TOO LARGE" if ankle_hip_diff > 0.05 else "✅ OK"}')
    
    # Calculate proportions
    if all([left_shoulder, right_shoulder, left_hip, right_hip]):
        shoulder_width = abs(right_shoulder['x'] - left_shoulder['x'])
        hip_width = abs(right_hip['x'] - left_hip['x'])
        torso_length = abs(left_shoulder['y'] - left_hip['y'])
        
        print(f'\n📏 BODY PROPORTIONS:')
        print(f'  Shoulder width: {shoulder_width:.3f}')
        print(f'  Hip width:      {hip_width:.3f}')
        print(f'  Torso length:   {torso_length:.3f}')

print(f'\n{"="*80}')
print('AUDIT COMPLETE')
print('='*80)

