# Quarterback Throwing Biomechanics Research

## Four Phases of QB Throw

Based on research from Gardner-Webb University and biomechanics studies:

### 1. Loading Phase
- **Primary Plane**: Sagittal
- **Primary Muscles**: Quadriceps, glutes
- **Sequence**: After receiving snap, QB takes 3 steps backward
- **Body Position**: Feet shoulder-width apart, facing target
- **Hip/Shoulder Alignment**: Both aligned on z-axis (facing target)
- **Key Movement**: Separation from lower and upper half begins
- **Video Analysis**: Subject shows 108.2 degrees of flexion in rear knee
- **Improvements**: More hip and knee flexion = more force output and power

### 2. Arm-Cocking Phase (Wind-up + Cocking)
- **Primary Plane**: Transverse
- **Primary Muscles**: Supraspinatus, infraspinatus, teres minor
- **Sequence**: Rear foot contact begins arm cocking, maximum shoulder external rotation ends this phase
- **Body Rotation**: Elbow begins to drop, shoulder and elbow at elevated position away from body
- **Hip Rotation**: Hips BEGIN rotating (perpendicular to target)
- **Shoulder Position**: Shoulder externally rotates, hand of QB's hand elevated near shoulder height
- **Key Position**: "Layback" position - maximum external rotation (MER)
- **Improvements**: Begin arm cocking with shoulder in abducted position, ball elevated near shoulder height

### 3. Acceleration Phase
- **Primary Plane**: Transverse, Sagittal
- **Primary Muscles**: Pectoralis major, latissimus dorsi, subscapularis
- **Sequence**: Maximum external rotation → arm acceleration begins
- **Critical Timing**: Pectoralis major reaches maximum activation during acceleration
- **Hip Rotation**: Hips EXPLOSIVELY rotate back toward target (z-axis)
- **Shoulder Rotation**: Shoulders follow hips, rotating from external to internal
- **Target Position**: Shoulder going from external to internal rotation, facing square to target
- **Improvements**: Increase shoulder external rotation for more torque

### 4. Follow-Through Phase (Release + Follow-through)
- **Primary Plane**: Sagittal
- **Primary Muscles**: Teres minor, infraspinatus, posterior deltoid, serratus anterior
- **Sequence**: Ball release → deceleration with maximal dominant shoulder internal rotation
- **Body Position**: Hips and shoulders SQUARE to target (z-axis) at release
- **Post-Release**: Body continues to decelerate, muscle contributors reduce activity
- **Weight Transfer**: Weight fully on front foot
- **Improvements**: Decrease shoulder angle to ~120 degrees for optimal rate

## Key Biomechanical Principles

### Hip-Shoulder Separation
- **Loading**: Hips and shoulders aligned (z-axis, facing target)
- **Cocking**: Both rotate to perpendicular (x-axis), hips lead slightly
- **Acceleration**: Hips rotate FIRST back to z-axis, shoulders lag behind (creates torque)
- **Release**: Both square to target (z-axis)
- **Follow-through**: Continue past z-axis

### Rotation Sequence (Critical for Torque)
1. Start: Z-axis (facing target) - 0° rotation
2. Wind-up: Begin rotation toward X-axis - ~45° rotation
3. Cocking: Maximum X-axis rotation - ~90° rotation (perpendicular)
4. Acceleration: Explosive rotation back to Z-axis - hips lead, shoulders follow
5. Release: Z-axis (square to target) - 0° rotation
6. Follow-through: Past Z-axis - negative rotation

### Weight Transfer
- Loading: Weight on back foot (right foot for right-handed)
- Cocking: Weight loaded on back leg, front foot planted
- Acceleration: Weight transfers from back to front
- Release: Weight centered
- Follow-through: Weight fully on front foot (left foot for right-handed)

## MediaPipe Landmark Mapping

For implementing in keyframes:
- **Hips**: Landmarks 23 (left) and 24 (right)
- **Shoulders**: Landmarks 11 (left) and 12 (right)
- **Z-axis rotation**: Controlled by z-coordinate differences between left/right landmarks
- **X-axis position**: Controlled by x-coordinate
- **Y-axis position**: Controlled by y-coordinate (vertical)

### Z-Coordinate Interpretation
- **Facing target (z-axis)**: Left and right hips/shoulders have similar z values (near 0)
- **Perpendicular (x-axis)**: One side forward (negative z), other side back (positive z)
- **Right-handed throw**: 
  - Cocking: Left hip/shoulder forward (z < 0), right hip/shoulder back (z > 0)
  - Release: Both near z = 0 (square to target)

