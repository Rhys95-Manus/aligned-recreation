import * as THREE from 'three';

/**
 * Programmatic animations for Football Punt and Field Goal Kick.
 * These are driven by bone rotations matching professional biomechanical data.
 * Uses the existing fotball2.glb Mixamo rig — no model modifications needed.
 * 
 * Bone naming convention: "mixamorig:{BoneName}"
 * Rotation format: Euler angles converted to quaternions for smooth interpolation.
 */

// Helper: Convert Euler degrees to quaternion array [x, y, z, w]
function eulerToQuat(xDeg: number, yDeg: number, zDeg: number): [number, number, number, number] {
  const euler = new THREE.Euler(
    xDeg * Math.PI / 180,
    yDeg * Math.PI / 180,
    zDeg * Math.PI / 180,
    'XYZ'
  );
  const q = new THREE.Quaternion().setFromEuler(euler);
  return [q.x, q.y, q.z, q.w];
}

// Helper: Create time array for phases
function createPhaseTimestamps(
  phases: { startFrame: number; endFrame: number }[],
  fps: number
): number[] {
  const times: number[] = [];
  for (const phase of phases) {
    times.push(phase.startFrame / fps);
    times.push(phase.endFrame / fps);
  }
  // Deduplicate and sort
  return Array.from(new Set(times)).sort((a, b) => a - b);
}

// ============================================================
// PUNT ANIMATION
// Duration: 1.8s at 30fps (54 frames total, using 52 keyframes)
// Right-footed punter
// ============================================================

const PUNT_FPS = 30;
const PUNT_DURATION = 1.8; // seconds

// Phase boundaries (in frames)
const PUNT_PHASES = {
  stance: { start: 0, end: 8 },
  dropAndStep: { start: 8, end: 20 },
  legSwingContact: { start: 20, end: 35 },
  followThrough: { start: 35, end: 52 }
};

// Keyframe times for punt (seconds)
const puntTimes = [
  0,                                    // Start of stance
  PUNT_PHASES.stance.end / PUNT_FPS,    // End of stance / start of drop
  PUNT_PHASES.dropAndStep.end / PUNT_FPS, // End of drop / start of swing
  PUNT_PHASES.legSwingContact.end / PUNT_FPS, // End of swing / start of follow-through
  PUNT_PHASES.followThrough.end / PUNT_FPS  // End of follow-through
];

interface BoneKeyframes {
  boneName: string;
  times: number[];
  quaternions: number[]; // flat array of [x,y,z,w] per keyframe
}

function createPuntBoneKeyframes(): BoneKeyframes[] {
  const bones: BoneKeyframes[] = [];

  // Hips
  bones.push({
    boneName: 'mixamorig:Hips',
    times: puntTimes,
    quaternions: [
      ...eulerToQuat(-5, 0, 0),       // Stance: slight forward lean
      ...eulerToQuat(-5, 0, 0),       // End stance
      ...eulerToQuat(-8, -15, 0),     // Drop & step: weight shifting left
      ...eulerToQuat(-5, -25, 0),     // Leg swing: hip rotation through kick
      ...eulerToQuat(0, -35, 0),      // Follow through: full rotation
    ]
  });

  // Right Up Leg (kicking leg)
  bones.push({
    boneName: 'mixamorig:RightUpLeg',
    times: puntTimes,
    quaternions: [
      ...eulerToQuat(5, 0, 0),        // Stance: slight hip flexion
      ...eulerToQuat(5, 0, 0),        // End stance
      ...eulerToQuat(35, 0, 0),       // Drop: leg swinging back
      ...eulerToQuat(110, 0, 0),      // Contact: aggressive hip flexion forward & up
      ...eulerToQuat(130, 0, 0),      // Follow through: leg continues upward
    ]
  });

  // Right Leg (kicking shin/knee)
  bones.push({
    boneName: 'mixamorig:RightLeg',
    times: puntTimes,
    quaternions: [
      ...eulerToQuat(10, 0, 0),       // Stance: slight knee bend
      ...eulerToQuat(10, 0, 0),       // End stance
      ...eulerToQuat(45, 0, 0),       // Drop: knee loading (bent)
      ...eulerToQuat(5, 0, 0),        // Contact: near full extension
      ...eulerToQuat(15, 0, 0),       // Follow through: slight re-bend
    ]
  });

  // Right Foot (kicking foot)
  bones.push({
    boneName: 'mixamorig:RightFoot',
    times: puntTimes,
    quaternions: [
      ...eulerToQuat(0, 0, 0),        // Stance: neutral
      ...eulerToQuat(0, 0, 0),        // End stance
      ...eulerToQuat(0, 0, 0),        // Drop: neutral
      ...eulerToQuat(20, 0, 0),       // Contact: toe pointed down
      ...eulerToQuat(30, 0, 0),       // Follow through: toe still pointed
    ]
  });

  // Left Up Leg (plant leg)
  bones.push({
    boneName: 'mixamorig:LeftUpLeg',
    times: puntTimes,
    quaternions: [
      ...eulerToQuat(5, 0, 0),        // Stance: slight hip flexion
      ...eulerToQuat(5, 0, 0),        // End stance
      ...eulerToQuat(20, 0, 0),       // Drop: stepping forward
      ...eulerToQuat(15, 0, 0),       // Contact: straightening
      ...eulerToQuat(10, 0, 0),       // Follow through: stable
    ]
  });

  // Left Leg (plant knee)
  bones.push({
    boneName: 'mixamorig:LeftLeg',
    times: puntTimes,
    quaternions: [
      ...eulerToQuat(10, 0, 0),       // Stance: slight knee bend
      ...eulerToQuat(10, 0, 0),       // End stance
      ...eulerToQuat(25, 0, 0),       // Drop: knee bend on plant
      ...eulerToQuat(10, 0, 0),       // Contact: extending for stability
      ...eulerToQuat(8, 0, 0),        // Follow through: firm
    ]
  });

  // Left Foot (plant foot)
  bones.push({
    boneName: 'mixamorig:LeftFoot',
    times: puntTimes,
    quaternions: [
      ...eulerToQuat(0, 0, 0),        // Stance: neutral
      ...eulerToQuat(0, 0, 0),        // End stance
      ...eulerToQuat(-15, 0, 0),      // Drop: heel strike
      ...eulerToQuat(-5, 0, 0),       // Contact: flat
      ...eulerToQuat(-20, 0, 0),      // Follow through: pivoting on toes
    ]
  });

  // Spine
  bones.push({
    boneName: 'mixamorig:Spine',
    times: puntTimes,
    quaternions: [
      ...eulerToQuat(0, 0, 0),        // Stance: neutral upright
      ...eulerToQuat(0, 0, 0),        // End stance
      ...eulerToQuat(5, 0, 0),        // Drop: slight forward lean
      ...eulerToQuat(-10, 0, 0),      // Contact: trunk extending back
      ...eulerToQuat(-15, 0, 0),      // Follow through: leans back to counterbalance
    ]
  });

  // Spine1
  bones.push({
    boneName: 'mixamorig:Spine1',
    times: puntTimes,
    quaternions: [
      ...eulerToQuat(0, 0, 0),        // Stance
      ...eulerToQuat(0, 0, 0),        // End stance
      ...eulerToQuat(3, 0, 0),        // Drop
      ...eulerToQuat(-8, 0, 0),       // Contact
      ...eulerToQuat(-10, 0, 0),      // Follow through
    ]
  });

  // Right Arm (counter-balance)
  bones.push({
    boneName: 'mixamorig:RightArm',
    times: puntTimes,
    quaternions: [
      ...eulerToQuat(30, 0, 0),       // Stance: slightly out for balance
      ...eulerToQuat(30, 0, 0),       // End stance
      ...eulerToQuat(45, 0, 0),       // Drop: extending outward
      ...eulerToQuat(-30, 0, -45),    // Contact: sweeps back for counter-balance
      ...eulerToQuat(-40, 0, -50),    // Follow through: continues counter-rotation
    ]
  });

  // Left Arm (counter-balance)
  bones.push({
    boneName: 'mixamorig:LeftArm',
    times: puntTimes,
    quaternions: [
      ...eulerToQuat(30, 0, 0),       // Stance: slightly out for balance
      ...eulerToQuat(30, 0, 0),       // End stance
      ...eulerToQuat(60, 0, 0),       // Drop: extending outward
      ...eulerToQuat(45, 0, 30),      // Contact: extends forward
      ...eulerToQuat(50, 0, 35),      // Follow through: continues forward
    ]
  });

  // Right Forearm
  bones.push({
    boneName: 'mixamorig:RightForeArm',
    times: puntTimes,
    quaternions: [
      ...eulerToQuat(0, 0, -30),      // Stance: relaxed bend
      ...eulerToQuat(0, 0, -30),      // End stance
      ...eulerToQuat(0, 0, -45),      // Drop: slightly more bent
      ...eulerToQuat(0, 0, -20),      // Contact: extending
      ...eulerToQuat(0, 0, -15),      // Follow through: nearly straight
    ]
  });

  // Left Forearm
  bones.push({
    boneName: 'mixamorig:LeftForeArm',
    times: puntTimes,
    quaternions: [
      ...eulerToQuat(0, 0, 30),       // Stance: relaxed bend
      ...eulerToQuat(0, 0, 30),       // End stance
      ...eulerToQuat(0, 0, 45),       // Drop: slightly more bent
      ...eulerToQuat(0, 0, 60),       // Contact: bent for balance
      ...eulerToQuat(0, 0, 50),       // Follow through: relaxing
    ]
  });

  // Neck (slight head tracking)
  bones.push({
    boneName: 'mixamorig:Neck',
    times: puntTimes,
    quaternions: [
      ...eulerToQuat(0, 0, 0),        // Stance: looking forward
      ...eulerToQuat(0, 0, 0),        // End stance
      ...eulerToQuat(-5, 0, 0),       // Drop: looking down at ball
      ...eulerToQuat(5, 0, 0),        // Contact: looking up at trajectory
      ...eulerToQuat(10, 0, 0),       // Follow through: watching ball
    ]
  });

  return bones;
}

// ============================================================
// FIELD GOAL KICK ANIMATION
// Duration: 1.6s at 30fps (48 frames)
// Right-footed kicker, more compact and precise than punt
// ============================================================

const FG_FPS = 30;
const FG_DURATION = 1.6; // seconds

const FG_PHASES = {
  approachStance: { start: 0, end: 8 },
  plantAndLoad: { start: 8, end: 22 },
  strike: { start: 22, end: 36 },
  followThrough: { start: 36, end: 48 }
};

const fgTimes = [
  0,
  FG_PHASES.approachStance.end / FG_FPS,
  FG_PHASES.plantAndLoad.end / FG_FPS,
  FG_PHASES.strike.end / FG_FPS,
  FG_PHASES.followThrough.end / FG_FPS
];

function createFieldGoalBoneKeyframes(): BoneKeyframes[] {
  const bones: BoneKeyframes[] = [];

  // Hips
  bones.push({
    boneName: 'mixamorig:Hips',
    times: fgTimes,
    quaternions: [
      ...eulerToQuat(-5, -10, 0),     // Approach: slight forward lean, angled
      ...eulerToQuat(-5, -10, 0),     // End approach
      ...eulerToQuat(-8, -20, 0),     // Plant: weight shifting, forward tilt
      ...eulerToQuat(-3, -30, 0),     // Strike: forward drive
      ...eulerToQuat(0, -40, 0),      // Follow through: full rotation
    ]
  });

  // Right Up Leg (kicking leg)
  bones.push({
    boneName: 'mixamorig:RightUpLeg',
    times: fgTimes,
    quaternions: [
      ...eulerToQuat(12, 0, 0),       // Approach: slight knee bend
      ...eulerToQuat(12, 0, 0),       // End approach
      ...eulerToQuat(30, 0, 0),       // Plant: kicking leg loading back
      ...eulerToQuat(95, 0, 0),       // Strike: hip flexion (less than punt, more controlled)
      ...eulerToQuat(115, 0, 0),      // Follow through: upward (less extreme than punt)
    ]
  });

  // Right Leg (kicking shin/knee)
  bones.push({
    boneName: 'mixamorig:RightLeg',
    times: fgTimes,
    quaternions: [
      ...eulerToQuat(12, 0, 0),       // Approach: slight bend
      ...eulerToQuat(12, 0, 0),       // End approach
      ...eulerToQuat(55, 0, 0),       // Plant: deeper knee load than punt
      ...eulerToQuat(8, 0, 0),        // Strike: near full extension at contact
      ...eulerToQuat(20, 0, 0),       // Follow through: slight re-bend
    ]
  });

  // Right Foot (kicking foot — instep contact)
  bones.push({
    boneName: 'mixamorig:RightFoot',
    times: fgTimes,
    quaternions: [
      ...eulerToQuat(0, 0, 0),        // Approach: neutral
      ...eulerToQuat(0, 0, 0),        // End approach
      ...eulerToQuat(0, 0, 0),        // Plant: neutral
      ...eulerToQuat(15, 0, 0),       // Strike: toe slightly up (instep contact)
      ...eulerToQuat(20, 0, 0),       // Follow through
    ]
  });

  // Left Up Leg (plant leg)
  bones.push({
    boneName: 'mixamorig:LeftUpLeg',
    times: fgTimes,
    quaternions: [
      ...eulerToQuat(12, 0, 0),       // Approach: slight bend
      ...eulerToQuat(12, 0, 0),       // End approach
      ...eulerToQuat(25, 0, 0),       // Plant: stepping in firmly
      ...eulerToQuat(15, 0, 0),       // Strike: firm and straight
      ...eulerToQuat(10, 0, 0),       // Follow through: stable
    ]
  });

  // Left Leg (plant knee — deeper than punt)
  bones.push({
    boneName: 'mixamorig:LeftLeg',
    times: fgTimes,
    quaternions: [
      ...eulerToQuat(12, 0, 0),       // Approach: slight bend
      ...eulerToQuat(12, 0, 0),       // End approach
      ...eulerToQuat(30, 0, 0),       // Plant: deeper knee bend than punt
      ...eulerToQuat(8, 0, 0),        // Strike: firm and straight
      ...eulerToQuat(5, 0, 0),        // Follow through: locked
    ]
  });

  // Left Foot (plant foot)
  bones.push({
    boneName: 'mixamorig:LeftFoot',
    times: fgTimes,
    quaternions: [
      ...eulerToQuat(0, 0, 0),        // Approach: neutral
      ...eulerToQuat(0, 0, 0),        // End approach
      ...eulerToQuat(-10, 0, 0),      // Plant: firm plant
      ...eulerToQuat(-5, 0, 0),       // Strike: flat
      ...eulerToQuat(-15, 0, 0),      // Follow through: pivoting
    ]
  });

  // Spine (less lean back than punt — more controlled)
  bones.push({
    boneName: 'mixamorig:Spine',
    times: fgTimes,
    quaternions: [
      ...eulerToQuat(0, 0, 0),        // Approach: neutral
      ...eulerToQuat(0, 0, 0),        // End approach
      ...eulerToQuat(8, 0, 0),        // Plant: forward lean over ball
      ...eulerToQuat(-5, 0, 0),       // Strike: less trunk lean back than punt
      ...eulerToQuat(-10, 0, 0),      // Follow through
    ]
  });

  // Spine1
  bones.push({
    boneName: 'mixamorig:Spine1',
    times: fgTimes,
    quaternions: [
      ...eulerToQuat(0, 0, 0),        // Approach
      ...eulerToQuat(0, 0, 0),        // End approach
      ...eulerToQuat(5, 0, 0),        // Plant
      ...eulerToQuat(-3, 0, 0),       // Strike
      ...eulerToQuat(-7, 0, 0),       // Follow through
    ]
  });

  // Right Arm (tighter to body than punt)
  bones.push({
    boneName: 'mixamorig:RightArm',
    times: fgTimes,
    quaternions: [
      ...eulerToQuat(25, 0, 0),       // Approach: arms close
      ...eulerToQuat(25, 0, 0),       // End approach
      ...eulerToQuat(35, 0, 0),       // Plant: tighter than punt
      ...eulerToQuat(-20, 0, -50),    // Strike: sweeps back
      ...eulerToQuat(-30, 0, -40),    // Follow through: settling
    ]
  });

  // Left Arm (tighter to body than punt)
  bones.push({
    boneName: 'mixamorig:LeftArm',
    times: fgTimes,
    quaternions: [
      ...eulerToQuat(25, 0, 0),       // Approach: arms close
      ...eulerToQuat(25, 0, 0),       // End approach
      ...eulerToQuat(40, 0, 0),       // Plant: tighter than punt
      ...eulerToQuat(50, 0, 25),      // Strike: extends for balance
      ...eulerToQuat(40, 0, 20),      // Follow through: settling
    ]
  });

  // Right Forearm
  bones.push({
    boneName: 'mixamorig:RightForeArm',
    times: fgTimes,
    quaternions: [
      ...eulerToQuat(0, 0, -25),      // Approach
      ...eulerToQuat(0, 0, -25),      // End approach
      ...eulerToQuat(0, 0, -35),      // Plant
      ...eulerToQuat(0, 0, -15),      // Strike
      ...eulerToQuat(0, 0, -20),      // Follow through
    ]
  });

  // Left Forearm
  bones.push({
    boneName: 'mixamorig:LeftForeArm',
    times: fgTimes,
    quaternions: [
      ...eulerToQuat(0, 0, 25),       // Approach
      ...eulerToQuat(0, 0, 25),       // End approach
      ...eulerToQuat(0, 0, 40),       // Plant
      ...eulerToQuat(0, 0, 55),       // Strike
      ...eulerToQuat(0, 0, 45),       // Follow through
    ]
  });

  // Neck
  bones.push({
    boneName: 'mixamorig:Neck',
    times: fgTimes,
    quaternions: [
      ...eulerToQuat(0, 0, 0),        // Approach: looking at ball
      ...eulerToQuat(0, 0, 0),        // End approach
      ...eulerToQuat(-8, 0, 0),       // Plant: looking down at ball
      ...eulerToQuat(3, 0, 0),        // Strike: looking up
      ...eulerToQuat(8, 0, 0),        // Follow through: watching ball
    ]
  });

  return bones;
}

// ============================================================
// PUBLIC API: Create THREE.AnimationClip objects
// ============================================================

/**
 * Sanitize bone name to match Three.js GLTFLoader's node naming.
 * GLTFLoader calls PropertyBinding.sanitizeNodeName() which strips reserved chars: [ ] . : /
 * So 'mixamorig:Hips' becomes 'mixamorigHips' in the loaded scene.
 */
function sanitizeBoneName(name: string): string {
  return name.replace(/[\[\].:/ ]/g, '');
}

/**
 * Creates the Punt animation clip that can be played on the football model's mixer.
 * Uses smooth quaternion interpolation between keyframes.
 */
export function createPuntClip(): THREE.AnimationClip {
  const boneKeyframes = createPuntBoneKeyframes();
  const tracks: THREE.KeyframeTrack[] = [];

  for (const bone of boneKeyframes) {
    // Use sanitized bone name to match GLTFLoader's internal node naming
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
 */
export function createFieldGoalClip(): THREE.AnimationClip {
  const boneKeyframes = createFieldGoalBoneKeyframes();
  const tracks: THREE.KeyframeTrack[] = [];

  for (const bone of boneKeyframes) {
    // Use sanitized bone name to match GLTFLoader's internal node naming
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
