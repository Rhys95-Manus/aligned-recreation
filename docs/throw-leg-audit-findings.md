# Throw Animation Leg Bone Audit Findings

## Key Finding: The throw animation drives BOTH deformation bones AND IK bones simultaneously

The throw animation (baked from Blender) keyframes ALL bone sets:
- `mixamorig:*` deformation bones (RightUpLeg, RightLeg, RightFoot, etc.)
- `UpLeg_IK_*` / `Leg_IK_*` IK bones (significant rotation)
- `Ctrl_UpLeg_FK_*` / `Ctrl_Leg_FK_*` FK control bones (STATIC — 0° range)
- `Ctrl_Foot_IK_*` / `Ctrl_LegPole_IK_*` (significant rotation)

## FK Control Bones Are STATIC (Not Used)
- `Ctrl_UpLeg_FK_Right`: 0° total range (static at 179.3°)
- `Ctrl_Leg_FK_Right`: 0° total range (static at -5.0°)
- `Ctrl_Foot_FK_Right`: 0° total range (static at 58.0°)
- `Ctrl_UpLeg_FK_Left`: 0° total range (static at -179.9°)
- `Ctrl_Leg_FK_Left`: 0° total range (static at -5.9°)
- `Ctrl_Foot_FK_Left`: 0° total range (static at 56.7°)

## IK Bones ARE Animated (Significant Range)
- `UpLeg_IK_Right`: 452° total range
- `Leg_IK_Right`: 70° X range
- `UpLeg_IK_Left`: 810° total range
- `Leg_IK_Left`: 48° X range
- `Ctrl_Foot_IK_Right`: 251° total range
- `Ctrl_LegPole_IK_Right`: 408° total range

## Deformation Bones (mixamorig:*) Rotation Conventions

### mixamorig:RightUpLeg (drive leg in throw)
- Start: euler(6.5°, -0.8°, 175.9°) — note Z is ~180° (this is the bind pose offset!)
- The X values range from small positive values — forward hip flexion is POSITIVE X
- The Z ~180° is the bind pose orientation (leg pointing down)

### mixamorig:RightLeg (knee)
- ALL keyframes have NEGATIVE X: -15° to -68°
- Knee flexion (bending) = NEGATIVE X
- Near straight = small negative (like -0.3°)

### mixamorig:LeftLeg (knee)
- Same pattern: NEGATIVE X for knee flexion (-0.3° to -46°)

### mixamorig:RightFoot
- POSITIVE X values (28° to 92°) — dorsiflexion/plantarflexion

### mixamorig:LeftFoot
- POSITIVE X values (40° to 65°)

## Critical Insight: UpLeg bones have Z ~180° bind pose
The UpLeg deformation bones have a Z rotation of ~175-180° in their bind pose.
This means the local coordinate system is FLIPPED compared to what you'd expect.
When Z is ~180°, the X axis is inverted — so what looks like "positive X = forward"
is actually the bone's local frame being upside-down.

## Conclusion for Programmatic Animations

Since the throw works correctly and drives BOTH mixamorig:* AND UpLeg_IK_*/Leg_IK_* bones
simultaneously (they're baked together from Blender), our programmatic animations should:

1. ONLY animate the `mixamorig:*` deformation bones
2. NOT animate any IK/FK control bones (they'll just sit at their bind pose)
3. The key sign conventions from the working throw:
   - RightLeg (knee): NEGATIVE X = flexion (bent), near 0 = straight
   - LeftLeg (knee): NEGATIVE X = flexion (bent), near 0 = straight
   - RightUpLeg: Complex — has Z ~180° bind pose offset
   - LeftUpLeg: Complex — has Z ~-176° bind pose offset
   - Feet: POSITIVE X = dorsiflexion

## The Real Problem
Our programmatic clips only set rotation quaternions, but the throw animation
also includes the Z ~180° base rotation on UpLeg bones. When we set eulerToQuat(110, 0, 0),
we're setting the ABSOLUTE rotation, overriding the bind pose Z ~180°.
This causes the leg to flip because we lost the bind pose orientation.

We need to COMPOSE our desired rotation ON TOP of the bind pose, not replace it.
