# Football Hologram Rig Audit: fotball2.glb

**File:** `fotball2_b7f18e4a.glb` (18.5 MB)  
**CDN:** `https://d2xsxph8kpxj0f.cloudfront.net/310519663143408740/Gd6AiijCmPwLtcbfaErCFP/fotball2_b7f18e4a.glb`  
**Rig type:** Mixamo-based humanoid with custom control bones  
**Animations:** 3 (1 main character animation + 2 prop animations)

---

## 1. Complete Bone List (168 bones in skeleton)

### Core Deformation Bones (Mixamo standard)

| # | Bone Name | Type |
|---|-----------|------|
| 1 | mixamorig:Hips | Root |
| 2 | mixamorig:Spine | Torso |
| 3 | mixamorig:Spine1 | Torso |
| 4 | mixamorig:Spine2 | Torso |
| 5 | mixamorig:Neck | Head |
| 6 | mixamorig:Head | Head |
| 7 | mixamorig:HeadTop_End | Head (terminal) |
| 8 | mixamorig:LeftShoulder | Left Arm |
| 9 | mixamorig:LeftArm | Left Arm |
| 10 | mixamorig:LeftForeArm | Left Arm |
| 11 | mixamorig:LeftHand | Left Hand |
| 12–31 | mixamorig:LeftHandThumb1–4, Index1–4, Middle1–4, Ring1–4, Pinky1–4 | Left Fingers |
| 32–46 | Ctrl_Thumb1–3_Left, Ctrl_Index1–3_Left, Ctrl_Middle1–3_Left, Ctrl_Ring1–3_Left, Ctrl_Pinky1–3_Left | Left Finger Controls |
| 47 | mixamorig:RightShoulder | Right Arm |
| 48 | mixamorig:RightArm | Right Arm |
| 49 | mixamorig:RightForeArm | Right Arm |
| 50 | mixamorig:RightHand | Right Hand |
| 51–70 | mixamorig:RightHandThumb1–4, Index1–4, Middle1–4, Ring1–4, Pinky1–4 | Right Fingers |
| 71–85 | Ctrl_Thumb1–3_Right, Ctrl_Index1–3_Right, Ctrl_Middle1–3_Right, Ctrl_Ring1–3_Right, Ctrl_Pinky1–3_Right | Right Finger Controls |
| 86 | mixamorig:LeftUpLeg | Left Leg (hip/thigh) |
| 87 | mixamorig:LeftLeg | Left Leg (knee/shin) |
| 88 | mixamorig:LeftFoot | Left Foot |
| 89 | mixamorig:LeftToeBase | Left Toe |
| 90 | mixamorig:LeftToe_End | Left Toe (terminal) |
| 91 | mixamorig:RightUpLeg | Right Leg (hip/thigh) |
| 92 | mixamorig:RightLeg | Right Leg (knee/shin) |
| 93 | mixamorig:RightFoot | Right Foot |
| 94 | mixamorig:RightToeBase | Right Toe |
| 95 | mixamorig:RightToe_End | Right Toe (terminal) |

### Control/IK Bones (custom rig layer)

| # | Bone Name | Purpose |
|---|-----------|---------|
| 96 | Ctrl_Master | Master control (root of control hierarchy) |
| 97 | Ctrl_Hips | Hip control |
| 98 | Ctrl_Hips_Free | Free hip rotation |
| 99 | Hips_Free_Helper | Helper bone |
| 100–101 | UpLeg_IK_Left, Leg_IK_Left | Left leg IK chain |
| 102–106 | Ctrl_UpLeg_FK_Left, Ctrl_Leg_FK_Left, Ctrl_Foot_FK_Left, Foot_FK_Left, Ctrl_Toe_FK_Left | Left leg FK chain |
| 107–108 | UpLeg_IK_Right, Leg_IK_Right | Right leg IK chain |
| 109–113 | Ctrl_UpLeg_FK_Right, Ctrl_Leg_FK_Right, Ctrl_Foot_FK_Right, Foot_FK_Right, Ctrl_Toe_FK_Right | Right leg FK chain |
| 114–118 | Ctrl_Spine, Ctrl_Spine1, Ctrl_Spine2, Ctrl_Neck, Ctrl_Head | Spine/head controls |
| 119–121 | Ctrl_Shoulder_Left, Arm_IK_Left, ForeArm_IK_Left | Left arm IK |
| 122–124 | Ctrl_Arm_FK_Left, Ctrl_ForeArm_FK_Left, Ctrl_Hand_FK_Left | Left arm FK |
| 125–127 | Ctrl_Shoulder_Right, Arm_IK_Right, ForeArm_IK_Right | Right arm IK |
| 128–130 | Ctrl_Arm_FK_Right, Ctrl_ForeArm_FK_Right, Ctrl_Hand_FK_Right | Right arm FK |
| 131–146 | Ctrl_Foot_IK_Left + foot roll system (Left) | Left foot IK + roll |
| 147 | Ctrl_LegPole_IK_Left | Left knee pole target |
| 148–163 | Ctrl_Foot_IK_Right + foot roll system (Right) | Right foot IK + roll |
| 164 | Ctrl_LegPole_IK_Right | Right knee pole target |
| 165 | Ctrl_ArmPole_IK_Left | Left elbow pole target |
| 166 | Ctrl_Hand_IK_Left | Left hand IK target |
| 167 | Ctrl_ArmPole_IK_Right | Right elbow pole target |
| 168 | Ctrl_Hand_IK_Right | Right hand IK target |

---

## 2. Leg Bone Rotation Range — Can They Kick?

### Hip Flexion (mixamorig:LeftUpLeg / RightUpLeg)

| Bone | Axis | Min | Max | Range | Sufficient for 120° kick? |
|------|------|-----|-----|-------|---------------------------|
| mixamorig:LeftUpLeg | X | -8.3° | 24.6° | 32.9° | **Current animation only uses 33° — but the bone itself has NO hard limit** |
| mixamorig:LeftUpLeg | Y | -59.0° | 34.7° | 93.7° | N/A (lateral rotation) |
| mixamorig:LeftUpLeg | Z | -179.6° | 180.0° | 359.6° | Full rotation available |
| mixamorig:RightUpLeg | X | 2.0° | 31.8° | 29.7° | **Current animation only uses 30° — but no hard limit** |
| mixamorig:RightUpLeg | Y | -45.6° | 18.2° | 63.8° | N/A (lateral rotation) |
| mixamorig:RightUpLeg | Z | -179.9° | 178.8° | 358.7° | Full rotation available |

**Answer:** Yes, the hip bones CAN rotate to 120° for a kicking motion. The current throw animation only uses ~30° of hip flexion, but the rig has **no rotation constraints** — the bones are free to rotate to any angle. The Z-axis already demonstrates full 360° range in the current animation.

### Knee Extension (mixamorig:LeftLeg / RightLeg)

| Bone | Axis | Min | Max | Range | Full extension possible? |
|------|------|-----|-----|-------|--------------------------|
| mixamorig:LeftLeg | X | -48.3° | -0.3° | 48.0° | **Current animation uses 48° — but no hard limit** |
| mixamorig:RightLeg | X | -70.5° | -0.3° | 70.2° | **Current animation uses 70° — approaching full extension** |

**Answer:** Yes, the knee bones have full extension range. The right knee already demonstrates 70° of flexion range in the throw animation. There are no constraints preventing full extension (0°) or deep flexion (up to ~140°+). The bone can be rotated programmatically to any value.

---

## 3. Are Leg Bones Animated in the Throw?

**YES — the legs are actively animated in the throw animation.** They are NOT static.

| Bone | Max Range | Status | What it does |
|------|-----------|--------|--------------|
| mixamorig:LeftUpLeg | 359.6° | **ANIMATED** | Weight shift, hip rotation during throw |
| mixamorig:RightUpLeg | 358.7° | **ANIMATED** | Drive leg, hip rotation |
| mixamorig:LeftLeg | 48.0° | **ANIMATED** | Knee bend during weight transfer |
| mixamorig:RightLeg | 70.2° | **ANIMATED** | Knee drive during throw |
| mixamorig:LeftFoot | 29.6° | **ANIMATED** | Foot plant/pivot |
| mixamorig:RightFoot | 69.7° | **ANIMATED** | Foot push-off |
| Ctrl_Foot_IK_Left | 82.1° | **ANIMATED** | IK foot positioning |
| Ctrl_Foot_IK_Right | 97.5° | **ANIMATED** | IK foot positioning |
| Ctrl_LegPole_IK_Left | 82.1° | **ANIMATED** | Knee direction |
| Ctrl_LegPole_IK_Right | 210.4° | **ANIMATED** | Knee direction |

The legs show significant motion — the quarterback's weight transfer, step forward, and hip rotation are all captured in the leg bones. The right leg (drive leg) shows more range than the left (plant leg), which is biomechanically correct for a right-handed throw.

---

## 4. Current Throw Animation — All Keyframed Bones and Rotation Ranges

**Animation name:** "Action"  
**Duration:** 1.73 seconds  
**Keyframes per bone:** 52 (30 fps)  
**Total animated bones:** 101 with significant rotation (>5°)

### Top 30 Most Active Bones (sorted by max rotation range):

| Bone | Max Range | Primary Motion |
|------|-----------|----------------|
| UpLeg_IK_Left | 359.6° | Hip rotation/weight shift |
| mixamorig:LeftUpLeg | 359.6° | Left hip (plant leg) |
| mixamorig:RightUpLeg | 358.7° | Right hip (drive leg) |
| UpLeg_IK_Right | 358.7° | Right hip IK |
| Ctrl_Hand_IK_Right | 352.2° | Throwing hand trajectory |
| Ctrl_Shoulder_Right | 345.7° | Right shoulder rotation |
| mixamorig:RightShoulder | 345.7° | Right shoulder |
| Ctrl_Shoulder_Left | 342.5° | Left shoulder counter-rotation |
| mixamorig:LeftShoulder | 342.5° | Left shoulder |
| mixamorig:RightArm | 234.4° | Throwing arm |
| Arm_IK_Right | 234.4° | Right arm IK |
| Ctrl_LegPole_IK_Right | 210.4° | Right knee direction |
| Ctrl_Hand_IK_Left | 181.7° | Left hand (guide hand) |
| mixamorig:Hips | 175.8° | Full hip rotation |
| ForeArm_IK_Right | 137.5° | Right forearm (release) |
| mixamorig:RightForeArm | 137.5° | Right forearm |
| mixamorig:RightHand | 113.8° | Wrist/release |
| Ctrl_Foot_IK_Right | 97.5° | Right foot IK |
| Arm_IK_Left | 92.8° | Left arm |
| mixamorig:LeftArm | 92.8° | Left arm |
| Ctrl_ArmPole_IK_Left | 91.4° | Left elbow direction |
| mixamorig:LeftHand | 84.3° | Left hand |
| Ctrl_Foot_IK_Left | 82.1° | Left foot IK |
| Ctrl_LegPole_IK_Left | 82.1° | Left knee direction |
| Leg_IK_Right | 70.2° | Right shin |
| mixamorig:RightLeg | 70.2° | Right knee |
| mixamorig:RightFoot | 69.7° | Right foot |
| ForeArm_IK_Left | 68.4° | Left forearm |
| mixamorig:LeftForeArm | 68.4° | Left forearm |
| Ctrl_Hips | 66.7° | Hip control |

---

## 5. Constraints and Limitations

| Check | Result |
|-------|--------|
| IK Constraints in file | **None detected** (no glTF constraint extensions) |
| Bone rotation limits | **None** — standard Mixamo rig, all bones freely rotatable |
| Extensions used | None |
| Extensions required | None |
| Rig type | Dual FK/IK with control bones — but constraints are NOT baked into the GLB |

### Key Finding: No Constraints Prevent Leg Animation

The rig uses a **dual FK/IK system** (visible in the bone names like `Ctrl_UpLeg_FK_Left` vs `UpLeg_IK_Left`), but these are **Blender-side constraints that are NOT exported to glTF/GLB**. In the exported file:

- All bones are simple transform nodes with no rotation limits
- The IK solver is NOT active — it was baked into keyframes during export
- Any bone can be rotated to any angle programmatically via Three.js
- The existing animation already demonstrates full 360° rotation on hip bones

### What This Means for Adding Kick Animations

1. **The rig is fully capable** of a kicking motion — hip flexion to 120°+ and full knee extension are trivially achievable
2. **You can either:**
   - Create a new animation clip in Blender and export a new GLB
   - Programmatically drive the bones in Three.js (like the hologram mode already does for basketball)
3. **The existing `mapBone()` function** in `Hologram3D.tsx` already maps the leg bones: `leftUpLeg`, `rightUpLeg`, `leftLeg`, `rightLeg`, `leftFoot`, `rightFoot`
4. **No mesh deformation issues** are expected since the rig already animates legs with significant range in the throw

---

## Summary

| Question | Answer |
|----------|--------|
| What bones are present? | 168 total: 95 Mixamo deformation bones + 73 custom control/IK bones |
| Can hip flex to ~120°? | **Yes** — no rotation limits, Z-axis already shows 360° range |
| Does knee have full extension? | **Yes** — right knee already uses 70° in throw, no hard limits |
| Are legs animated in throw? | **Yes** — both legs are actively animated (weight transfer, hip drive, knee bend) |
| Which bones are keyframed? | 101 bones with significant rotation, including all leg bones |
| Any constraints preventing leg animation? | **No** — standard Mixamo rig, IK was baked, all bones freely rotatable |
