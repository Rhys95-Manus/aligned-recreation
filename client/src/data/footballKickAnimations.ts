import * as THREE from 'three';

/**
 * Programmatic animations for Football Punt and Field Goal Kick.
 * 
 * CRITICAL: The fotball2.glb Mixamo rig has non-trivial bind poses on the UpLeg bones:
 *   - mixamorig:RightUpLeg bind pose: euler(-4.22°, -0.67°, 171.00°)
 *   - mixamorig:LeftUpLeg bind pose: euler(-4.44°, 0.70°, -171.00°)
 * 
 * The throw animation (baked from Blender) stores ABSOLUTE quaternions that include
 * these bind pose orientations. Our programmatic clips must do the same — we compose
 * our desired rotation delta ON TOP of the bind pose quaternion.
 * 
 * The throw animation drives ONLY the mixamorig:* deformation bones.
 * The IK/FK control bones (Ctrl_*, UpLeg_IK_*, etc.) are either static or driven
 * by the baked IK solver — we do NOT animate them in our programmatic clips.
 * 
 * Sign conventions (from the working throw animation):
 *   - RightLeg (knee): NEGATIVE X = flexion (bent), ~0 = straight
 *   - LeftLeg (knee): NEGATIVE X = flexion (bent), ~0 = straight
 *   - RightFoot: POSITIVE X = dorsiflexion (foot up), base ~54°
 *   - LeftFoot: POSITIVE X = dorsiflexion (foot up), base ~51°
 *   - UpLeg bones: Must compose with bind pose quaternion
 * 
 * Bone naming: Three.js GLTFLoader sanitizes bone names by stripping reserved chars.
 * So 'mixamorig:Hips' becomes 'mixamorigHips' in the loaded scene.
 */

// ============================================================
// BIND POSE QUATERNIONS (extracted from the GLB file)
// These are the rest-state rotations for each bone.
// ============================================================

const BIND_POSES: Record<string, [number, number, number, number]> = {
  'mixamorig:Hips': [0, 0, 0, 1],
  'mixamorig:RightUpLeg': [0.002933, -0.037169, 0.996206, 0.078631],
  'mixamorig:RightLeg': [0.020806, -0.000805, -0.038654, 0.999036],
  'mixamorig:RightFoot': [0.449980, 0.110712, -0.056333, 0.884357],
  'mixamorig:RightToeBase': [0.266430, 0.093807, -0.026064, 0.958924],
  'mixamorig:LeftUpLeg': [0.003088, 0.039125, -0.996133, 0.078601],
  'mixamorig:LeftLeg': [0.033678, 0.001311, 0.038879, 0.998675],
  'mixamorig:LeftFoot': [0.428523, -0.119948, 0.057516, 0.893685],
  'mixamorig:LeftToeBase': [0.277439, -0.081611, 0.023661, 0.956978],
  'mixamorig:Spine': [-0.044074, 0, 0, 0.999028],
  'mixamorig:Spine1': [0, 0, 0, 1],
  'mixamorig:Spine2': [0, 0, 0, 1],
  'mixamorig:Neck': [0.044074, 0, 0, 0.999028],
  'mixamorig:RightArm': [-0.056524, 0.001550, -0.027366, 0.998025],
  'mixamorig:LeftArm': [-0.056440, -0.001597, 0.028246, 0.998005],
  'mixamorig:RightForeArm': [-0.031409, -0.000351, 0.011164, 0.999444],
  'mixamorig:LeftForeArm': [-0.031525, 0.000390, -0.012353, 0.999427],
  'mixamorig:RightShoulder': [0, 0, 0, 1],
  'mixamorig:LeftShoulder': [0, 0, 0, 1],
};

// First frame of throw animation — this is the "neutral standing" pose
// that looks correct on the model. We use this as our starting pose.
const THROW_FRAME0: Record<string, [number, number, number, number]> = {
  'mixamorig:Hips': [0.009258, -0.001744, -0.003346, 0.999950],
  'mixamorig:RightUpLeg': [0.009292, 0.056321, 0.997752, 0.035116],
  'mixamorig:RightLeg': [-0.133303, -0.000001, -0.000000, 0.991075],
  'mixamorig:RightFoot': [0.546797, -0.103755, -0.041789, 0.829760],
  'mixamorig:RightToeBase': [0.266430, 0.093806, -0.026064, 0.958924],
  'mixamorig:LeftUpLeg': [0.039916, -0.062412, -0.996678, 0.033839],
  'mixamorig:LeftLeg': [-0.150127, -0.000000, 0.000000, 0.988667],
  'mixamorig:LeftFoot': [0.539138, 0.035835, 0.074592, 0.838142],
  'mixamorig:LeftToeBase': [0.277437, -0.081611, 0.023659, 0.956979],
  'mixamorig:Spine': [-0.044072, -0.000109, 0.001442, 0.999027],
  'mixamorig:Spine1': [-0.000000, -0.000000, 0.000000, 1.000000],
  'mixamorig:Spine2': [-0.000000, -0.000000, 0.000000, 1.000000],
  'mixamorig:Neck': [0.044074, -0.000000, 0.000000, 0.999028],
  'mixamorig:RightArm': [0.721479, -0.291589, -0.043191, 0.626561],
  'mixamorig:LeftArm': [0.648955, 0.305678, 0.118691, 0.686535],
  'mixamorig:RightForeArm': [0.000000, -0.000000, -0.738171, 0.674613],
  'mixamorig:LeftForeArm': [0.000000, 0.000000, 0.750299, 0.661099],
};

/**
 * Compose a local rotation delta (in the bone's local space) with the bind pose.
 * Result = bindPose * delta
 * This produces the ABSOLUTE quaternion that should be stored in the animation track.
 */
function composeWithBind(boneName: string, deltaXDeg: number, deltaYDeg: number, deltaZDeg: number): [number, number, number, number] {
  const bind = BIND_POSES[boneName] || [0, 0, 0, 1];
  const bindQ = new THREE.Quaternion(bind[0], bind[1], bind[2], bind[3]);
  
  const deltaEuler = new THREE.Euler(
    deltaXDeg * Math.PI / 180,
    deltaYDeg * Math.PI / 180,
    deltaZDeg * Math.PI / 180,
    'XYZ'
  );
  const deltaQ = new THREE.Quaternion().setFromEuler(deltaEuler);
  
  // Compose: bind * delta (apply delta in local space of the bind pose)
  const result = bindQ.clone().multiply(deltaQ);
  return [result.x, result.y, result.z, result.w];
}

/**
 * Get the first-frame quaternion from the throw animation (neutral standing pose).
 * This is our "rest" pose that looks correct on the model.
 */
function getThrowFrame0(boneName: string): [number, number, number, number] {
  return THROW_FRAME0[boneName] || BIND_POSES[boneName] || [0, 0, 0, 1];
}

/**
 * For UpLeg bones, compose a hip flexion rotation relative to the throw's frame 0.
 * The throw frame 0 represents "standing neutral" — we apply our kick rotation on top.
 * 
 * For RightUpLeg: The bone's local X-axis points roughly forward due to the Z~171° bind.
 * From the throw data, the RightLeg (knee) uses NEGATIVE X for flexion.
 * For the UpLeg, we need to determine the correct axis by examining the throw's leg drive.
 * 
 * From throw data at peak leg drive (t=1.333s):
 *   RightUpLeg: euler(19.9°, -0.4°, 175.2°) vs frame0: euler(6.5°, -0.8°, 175.9°)
 *   The X went from 6.5° to 19.9° during the forward leg drive = +13.4° delta
 * 
 * So for the UpLeg bones: POSITIVE X delta = forward hip flexion (leg swings forward)
 */
function composeUpLegFlexion(boneName: string, flexionDeg: number, yRotDeg: number = 0): [number, number, number, number] {
  const base = getThrowFrame0(boneName);
  const baseQ = new THREE.Quaternion(base[0], base[1], base[2], base[3]);
  
  // Apply flexion as a rotation around the bone's local X axis
  const flexionEuler = new THREE.Euler(
    flexionDeg * Math.PI / 180,
    yRotDeg * Math.PI / 180,
    0,
    'XYZ'
  );
  const flexionQ = new THREE.Quaternion().setFromEuler(flexionEuler);
  
  // Compose: base * flexion (apply in local space)
  const result = baseQ.clone().multiply(flexionQ);
  return [result.x, result.y, result.z, result.w];
}

/**
 * For knee bones (RightLeg, LeftLeg): the throw uses NEGATIVE X for flexion.
 * Frame 0 has RightLeg at -15.3° (slight bend), peak at -67.7° (deep bend).
 * So delta from frame0 = additional negative X = more flexion.
 */
function composeKneeFlexion(boneName: string, additionalFlexionDeg: number): [number, number, number, number] {
  const base = getThrowFrame0(boneName);
  const baseQ = new THREE.Quaternion(base[0], base[1], base[2], base[3]);
  
  // Additional flexion is negative X (more bent)
  const flexionEuler = new THREE.Euler(
    additionalFlexionDeg * Math.PI / 180,
    0,
    0,
    'XYZ'
  );
  const flexionQ = new THREE.Quaternion().setFromEuler(flexionEuler);
  
  const result = baseQ.clone().multiply(flexionQ);
  return [result.x, result.y, result.z, result.w];
}

/**
 * For foot bones: compose a rotation delta on top of the throw frame 0.
 */
function composeFootRotation(boneName: string, deltaXDeg: number): [number, number, number, number] {
  const base = getThrowFrame0(boneName);
  const baseQ = new THREE.Quaternion(base[0], base[1], base[2], base[3]);
  
  const deltaEuler = new THREE.Euler(deltaXDeg * Math.PI / 180, 0, 0, 'XYZ');
  const deltaQ = new THREE.Quaternion().setFromEuler(deltaEuler);
  
  const result = baseQ.clone().multiply(deltaQ);
  return [result.x, result.y, result.z, result.w];
}

/**
 * Sanitize bone name to match Three.js GLTFLoader's node naming.
 * GLTFLoader calls PropertyBinding.sanitizeNodeName() which strips reserved chars: [ ] . : /
 * So 'mixamorig:Hips' becomes 'mixamorigHips' in the loaded scene.
 */
function sanitizeBoneName(name: string): string {
  return name.replace(/[\[\].:/ ]/g, '');
}

// ============================================================
// PUNT ANIMATION (Simplified single-plane first)
// Duration: 1.8s at 30fps
// Right-footed punter
// Only animates: Hips, kicking leg (RightUpLeg, RightLeg, RightFoot),
// plant leg (LeftUpLeg, LeftLeg, LeftFoot), Spine
// ============================================================

const PUNT_FPS = 30;
const PUNT_DURATION = 1.8;

// 5 keyframe times for punt
const puntTimes = [0, 0.27, 0.67, 1.17, 1.73];
// Phases:     Stance | Drop/Step | Leg Swing + Contact | Follow Through | End

interface BoneKeyframes {
  boneName: string;
  times: number[];
  quaternions: number[]; // flat array of [x,y,z,w] per keyframe
}

function createPuntBoneKeyframes(): BoneKeyframes[] {
  const bones: BoneKeyframes[] = [];

  // --- HIPS: slight forward lean, then hip rotation through kick ---
  bones.push({
    boneName: 'mixamorig:Hips',
    times: puntTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:Hips'),                    // Stance: neutral
      ...composeWithBind('mixamorig:Hips', -3, -10, 0),       // Drop: slight lean + rotation
      ...composeWithBind('mixamorig:Hips', -5, -20, 0),       // Swing: more rotation
      ...composeWithBind('mixamorig:Hips', 0, -30, 0),        // Follow through: full rotation
      ...composeWithBind('mixamorig:Hips', 0, -30, 0),        // Hold
    ]
  });

  // --- RIGHT UP LEG (kicking leg): swing forward to ~90° ---
  // Positive X delta = forward hip flexion (from throw analysis)
  bones.push({
    boneName: 'mixamorig:RightUpLeg',
    times: puntTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:RightUpLeg'),              // Stance: neutral standing
      ...composeUpLegFlexion('mixamorig:RightUpLeg', -20),    // Drop: leg swings back (negative = extension/back)
      ...composeUpLegFlexion('mixamorig:RightUpLeg', 60),     // Swing: forward hip flexion
      ...composeUpLegFlexion('mixamorig:RightUpLeg', 90),     // Contact: aggressive forward
      ...composeUpLegFlexion('mixamorig:RightUpLeg', 100),    // Follow through: continues up
    ]
  });

  // --- RIGHT LEG (kicking knee): load then extend ---
  // Negative X delta = more flexion (from throw analysis)
  bones.push({
    boneName: 'mixamorig:RightLeg',
    times: puntTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:RightLeg'),                // Stance: slight bend (~-15°)
      ...composeKneeFlexion('mixamorig:RightLeg', -30),       // Drop: knee loading (more bent)
      ...composeKneeFlexion('mixamorig:RightLeg', -20),       // Swing: starting to extend
      ...composeKneeFlexion('mixamorig:RightLeg', 10),        // Contact: near full extension
      ...composeKneeFlexion('mixamorig:RightLeg', 5),         // Follow through: straight
    ]
  });

  // --- RIGHT FOOT (kicking foot): toe pointed ---
  bones.push({
    boneName: 'mixamorig:RightFoot',
    times: puntTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:RightFoot'),               // Stance: neutral
      ...getThrowFrame0('mixamorig:RightFoot'),               // Drop: neutral
      ...composeFootRotation('mixamorig:RightFoot', -20),     // Swing: toe pointing
      ...composeFootRotation('mixamorig:RightFoot', -30),     // Contact: toe pointed down
      ...composeFootRotation('mixamorig:RightFoot', -25),     // Follow through
    ]
  });

  // --- LEFT UP LEG (plant leg): step forward, hold stable ---
  bones.push({
    boneName: 'mixamorig:LeftUpLeg',
    times: puntTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:LeftUpLeg'),               // Stance: neutral
      ...composeUpLegFlexion('mixamorig:LeftUpLeg', 10),      // Drop: step forward
      ...composeUpLegFlexion('mixamorig:LeftUpLeg', 5),       // Swing: stable
      ...composeUpLegFlexion('mixamorig:LeftUpLeg', 0),       // Contact: firm
      ...composeUpLegFlexion('mixamorig:LeftUpLeg', 0),       // Follow through: stable
    ]
  });

  // --- LEFT LEG (plant knee): slight bend for stability ---
  bones.push({
    boneName: 'mixamorig:LeftLeg',
    times: puntTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:LeftLeg'),                 // Stance: slight bend
      ...composeKneeFlexion('mixamorig:LeftLeg', -10),        // Drop: bend for plant
      ...composeKneeFlexion('mixamorig:LeftLeg', -5),         // Swing: firm
      ...composeKneeFlexion('mixamorig:LeftLeg', 5),          // Contact: extending
      ...composeKneeFlexion('mixamorig:LeftLeg', 5),          // Follow through: stable
    ]
  });

  // --- LEFT FOOT (plant foot): flat on ground ---
  bones.push({
    boneName: 'mixamorig:LeftFoot',
    times: puntTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:LeftFoot'),                // Stance: neutral
      ...composeFootRotation('mixamorig:LeftFoot', -10),      // Drop: heel strike
      ...composeFootRotation('mixamorig:LeftFoot', -5),       // Swing: flat
      ...composeFootRotation('mixamorig:LeftFoot', 0),        // Contact: flat
      ...composeFootRotation('mixamorig:LeftFoot', 5),        // Follow through: pivot
    ]
  });

  // --- SPINE: lean back to counterbalance kick ---
  bones.push({
    boneName: 'mixamorig:Spine',
    times: puntTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:Spine'),                   // Stance: neutral
      ...composeWithBind('mixamorig:Spine', 3, 0, 0),         // Drop: slight forward
      ...composeWithBind('mixamorig:Spine', -5, 0, 0),        // Swing: leaning back
      ...composeWithBind('mixamorig:Spine', -10, 0, 0),       // Contact: counterbalance
      ...composeWithBind('mixamorig:Spine', -8, 0, 0),        // Follow through
    ]
  });

  // --- ARMS: counter-balance (simplified) ---
  bones.push({
    boneName: 'mixamorig:RightArm',
    times: puntTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:RightArm'),                // Stance
      ...getThrowFrame0('mixamorig:RightArm'),                // Drop
      ...getThrowFrame0('mixamorig:RightArm'),                // Swing
      ...getThrowFrame0('mixamorig:RightArm'),                // Contact
      ...getThrowFrame0('mixamorig:RightArm'),                // Follow through
    ]
  });

  bones.push({
    boneName: 'mixamorig:LeftArm',
    times: puntTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:LeftArm'),                 // Stance
      ...getThrowFrame0('mixamorig:LeftArm'),                 // Drop
      ...getThrowFrame0('mixamorig:LeftArm'),                 // Swing
      ...getThrowFrame0('mixamorig:LeftArm'),                 // Contact
      ...getThrowFrame0('mixamorig:LeftArm'),                 // Follow through
    ]
  });

  // --- NECK: head tracking ---
  bones.push({
    boneName: 'mixamorig:Neck',
    times: puntTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:Neck'),                    // Stance
      ...getThrowFrame0('mixamorig:Neck'),                    // Drop
      ...getThrowFrame0('mixamorig:Neck'),                    // Swing
      ...getThrowFrame0('mixamorig:Neck'),                    // Contact
      ...getThrowFrame0('mixamorig:Neck'),                    // Follow through
    ]
  });

  return bones;
}

// ============================================================
// FIELD GOAL KICK ANIMATION (Simplified single-plane)
// Duration: 1.6s at 30fps
// Right-footed kicker, more compact than punt
// ============================================================

const FG_FPS = 30;
const FG_DURATION = 1.6;

// 5 keyframe times for field goal
const fgTimes = [0, 0.27, 0.73, 1.20, 1.60];
// Phases:   Approach | Plant/Load | Strike | Follow Through | End

function createFieldGoalBoneKeyframes(): BoneKeyframes[] {
  const bones: BoneKeyframes[] = [];

  // --- HIPS ---
  bones.push({
    boneName: 'mixamorig:Hips',
    times: fgTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:Hips'),                    // Approach: neutral
      ...composeWithBind('mixamorig:Hips', -3, -15, 0),       // Plant: weight shift
      ...composeWithBind('mixamorig:Hips', -2, -25, 0),       // Strike: forward drive
      ...composeWithBind('mixamorig:Hips', 0, -35, 0),        // Follow through: full rotation
      ...composeWithBind('mixamorig:Hips', 0, -35, 0),        // Hold
    ]
  });

  // --- RIGHT UP LEG (kicking leg): swing forward ---
  bones.push({
    boneName: 'mixamorig:RightUpLeg',
    times: fgTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:RightUpLeg'),              // Approach: neutral
      ...composeUpLegFlexion('mixamorig:RightUpLeg', -15),    // Plant: leg loading back
      ...composeUpLegFlexion('mixamorig:RightUpLeg', 50),     // Strike: forward hip flexion
      ...composeUpLegFlexion('mixamorig:RightUpLeg', 80),     // Follow through: up
      ...composeUpLegFlexion('mixamorig:RightUpLeg', 85),     // Hold
    ]
  });

  // --- RIGHT LEG (kicking knee): load then extend ---
  bones.push({
    boneName: 'mixamorig:RightLeg',
    times: fgTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:RightLeg'),                // Approach: slight bend
      ...composeKneeFlexion('mixamorig:RightLeg', -40),       // Plant: deep knee load
      ...composeKneeFlexion('mixamorig:RightLeg', 10),        // Strike: near full extension
      ...composeKneeFlexion('mixamorig:RightLeg', 5),         // Follow through: straight
      ...composeKneeFlexion('mixamorig:RightLeg', 0),         // Hold
    ]
  });

  // --- RIGHT FOOT (kicking foot — instep contact) ---
  bones.push({
    boneName: 'mixamorig:RightFoot',
    times: fgTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:RightFoot'),               // Approach: neutral
      ...getThrowFrame0('mixamorig:RightFoot'),               // Plant: neutral
      ...composeFootRotation('mixamorig:RightFoot', -15),     // Strike: toe down (instep)
      ...composeFootRotation('mixamorig:RightFoot', -20),     // Follow through
      ...composeFootRotation('mixamorig:RightFoot', -15),     // Hold
    ]
  });

  // --- LEFT UP LEG (plant leg): step in, hold firm ---
  bones.push({
    boneName: 'mixamorig:LeftUpLeg',
    times: fgTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:LeftUpLeg'),               // Approach: neutral
      ...composeUpLegFlexion('mixamorig:LeftUpLeg', 10),      // Plant: step in
      ...composeUpLegFlexion('mixamorig:LeftUpLeg', 5),       // Strike: firm
      ...composeUpLegFlexion('mixamorig:LeftUpLeg', 0),       // Follow through: stable
      ...composeUpLegFlexion('mixamorig:LeftUpLeg', 0),       // Hold
    ]
  });

  // --- LEFT LEG (plant knee): deeper bend for stability ---
  bones.push({
    boneName: 'mixamorig:LeftLeg',
    times: fgTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:LeftLeg'),                 // Approach: slight bend
      ...composeKneeFlexion('mixamorig:LeftLeg', -15),        // Plant: deeper bend
      ...composeKneeFlexion('mixamorig:LeftLeg', -5),         // Strike: firm
      ...composeKneeFlexion('mixamorig:LeftLeg', 5),          // Follow through: extending
      ...composeKneeFlexion('mixamorig:LeftLeg', 5),          // Hold
    ]
  });

  // --- LEFT FOOT (plant foot) ---
  bones.push({
    boneName: 'mixamorig:LeftFoot',
    times: fgTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:LeftFoot'),                // Approach: neutral
      ...composeFootRotation('mixamorig:LeftFoot', -8),       // Plant: firm
      ...composeFootRotation('mixamorig:LeftFoot', -3),       // Strike: flat
      ...composeFootRotation('mixamorig:LeftFoot', 0),        // Follow through
      ...composeFootRotation('mixamorig:LeftFoot', 5),        // Hold: pivot
    ]
  });

  // --- SPINE ---
  bones.push({
    boneName: 'mixamorig:Spine',
    times: fgTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:Spine'),                   // Approach: neutral
      ...composeWithBind('mixamorig:Spine', 5, 0, 0),         // Plant: lean over ball
      ...composeWithBind('mixamorig:Spine', -3, 0, 0),        // Strike: lean back
      ...composeWithBind('mixamorig:Spine', -8, 0, 0),        // Follow through
      ...composeWithBind('mixamorig:Spine', -6, 0, 0),        // Hold
    ]
  });

  // --- ARMS: hold at neutral (simplified) ---
  bones.push({
    boneName: 'mixamorig:RightArm',
    times: fgTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:RightArm'),
      ...getThrowFrame0('mixamorig:RightArm'),
      ...getThrowFrame0('mixamorig:RightArm'),
      ...getThrowFrame0('mixamorig:RightArm'),
      ...getThrowFrame0('mixamorig:RightArm'),
    ]
  });

  bones.push({
    boneName: 'mixamorig:LeftArm',
    times: fgTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:LeftArm'),
      ...getThrowFrame0('mixamorig:LeftArm'),
      ...getThrowFrame0('mixamorig:LeftArm'),
      ...getThrowFrame0('mixamorig:LeftArm'),
      ...getThrowFrame0('mixamorig:LeftArm'),
    ]
  });

  // --- NECK ---
  bones.push({
    boneName: 'mixamorig:Neck',
    times: fgTimes,
    quaternions: [
      ...getThrowFrame0('mixamorig:Neck'),
      ...getThrowFrame0('mixamorig:Neck'),
      ...getThrowFrame0('mixamorig:Neck'),
      ...getThrowFrame0('mixamorig:Neck'),
      ...getThrowFrame0('mixamorig:Neck'),
    ]
  });

  return bones;
}

// ============================================================
// PUBLIC API: Create THREE.AnimationClip objects
// ============================================================

/**
 * Creates the Punt animation clip that can be played on the football model's mixer.
 * Uses smooth quaternion interpolation between keyframes.
 * Only drives mixamorig:* deformation bones (matching the throw animation approach).
 */
export function createPuntClip(): THREE.AnimationClip {
  const boneKeyframes = createPuntBoneKeyframes();
  const tracks: THREE.KeyframeTrack[] = [];

  for (const bone of boneKeyframes) {
    const sanitizedName = sanitizeBoneName(bone.boneName);
    const track = new THREE.QuaternionKeyframeTrack(
      `${sanitizedName}.quaternion`,
      bone.times,
      bone.quaternions,
      THREE.InterpolateSmooth
    );
    tracks.push(track);
  }

  return new THREE.AnimationClip('punt', PUNT_DURATION, tracks);
}

/**
 * Creates the Field Goal Kick animation clip.
 * More compact and precise than the punt.
 * Only drives mixamorig:* deformation bones (matching the throw animation approach).
 */
export function createFieldGoalClip(): THREE.AnimationClip {
  const boneKeyframes = createFieldGoalBoneKeyframes();
  const tracks: THREE.KeyframeTrack[] = [];

  for (const bone of boneKeyframes) {
    const sanitizedName = sanitizeBoneName(bone.boneName);
    const track = new THREE.QuaternionKeyframeTrack(
      `${sanitizedName}.quaternion`,
      bone.times,
      bone.quaternions,
      THREE.InterpolateSmooth
    );
    tracks.push(track);
  }

  return new THREE.AnimationClip('fieldGoalKick', FG_DURATION, tracks);
}

// Export durations for external timing calculations
export const PUNT_CLIP_DURATION = PUNT_DURATION;
export const FIELD_GOAL_CLIP_DURATION = FG_DURATION;
