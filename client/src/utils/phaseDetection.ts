/**
 * Phase Detection for QB Throwing Motion
 * Identifies current phase based on biomechanical metrics using finalized reference values
 */

export type ThrowingPhase = 'neutral' | 'early_cocking' | 'late_cocking' | 'release' | 'follow_through';
export type MotionPhase = "Neutral" | "Early Cocking" | "Late Cocking" | "Release" | "Follow-through";

export interface PhaseInfo {
  phase: ThrowingPhase;
  displayName: MotionPhase;
  instruction: string;
  confidence: number;
}

/**
 * Detect current throwing phase based on metrics
 * Uses finalized professional reference values
 */
export function detectThrowingPhase(
  hipRotation: number,
  shoulderRotation: number,
  rightElbow: number,
  weightTransfer: number
): PhaseInfo {
  // Phase detection based on finalized metrics:
  // Neutral: Hip/Shoulder ~90° back, Elbow 60-80°
  // Early Cocking: Hip 70° back, Shoulder 90° back, Elbow 75-82°
  // Late Cocking: Hip 50° back, Shoulder 90° back, Elbow 90-100°
  // Release: Hip/Shoulder square (0°), Elbow 140-160°
  // Follow-through: Hip/Shoulder forward, Elbow 165-180°

  let phase: ThrowingPhase = 'neutral';
  let displayName: MotionPhase = "Neutral";
  let instruction = "Ball near chest, stand sideways, weight balanced";
  let confidence = 0.5;

  // Convert to absolute values for comparison (rotation is negative when back)
  const absHipRot = Math.abs(hipRotation);
  const absShoulderRot = Math.abs(shoulderRotation);

  // Follow-through detection (most extended position)
  if (rightElbow > 155) {
    phase = 'follow_through';
    displayName = "Follow-through";
    instruction = "Finish with arm extended across body, slight lean forward";
    confidence = 0.9;
  }
  // Release detection (elbow extending, hips square)
  else if (rightElbow > 130 && absHipRot < 20) {
    phase = 'release';
    displayName = "Release";
    instruction = "Drive hips square leading the shoulders, extend arm through target";
    confidence = 0.85;
  }
  // Late cocking detection (elbow at 90°, hip-shoulder separation)
  else if (rightElbow > 85 && rightElbow < 110 && absHipRot < absShoulderRot - 10) {
    phase = 'late_cocking';
    displayName = "Late Cocking";
    instruction = "Begin shifting weight forward, hips rotate forward, shoulders stay closed, arm makes L shape behind head";
    confidence = 0.8;
  }
  // Early cocking detection (elbow in backstroke, weight on back foot)
  else if (rightElbow > 70 && rightElbow < 90 && absHipRot > 60) {
    phase = 'early_cocking';
    displayName = "Early Cocking";
    instruction = "Weight shifts slightly to back foot, throwing arm in backstroke position, pivot front foot";
    confidence = 0.75;
  }
  // Default to neutral
  else {
    phase = 'neutral';
    displayName = "Neutral";
    instruction = "Ball near chest, stand sideways, weight balanced";
    confidence = 0.6;
  }

  return { phase, displayName, instruction, confidence };
}

/**
 * Get phase instruction without detection (for static display)
 */
export function getPhaseInstruction(phase: ThrowingPhase): string {
  const instructions: Record<ThrowingPhase, string> = {
    neutral: "Ball near chest, stand sideways, weight balanced",
    early_cocking: "Weight shifts slightly to back foot, throwing arm in backstroke position, pivot front foot",
    late_cocking: "Begin shifting weight forward, hips rotate forward, shoulders stay closed, arm makes L shape behind head",
    release: "Drive hips square leading the shoulders, extend arm through target",
    follow_through: "Finish with arm extended across body, slight lean forward"
  };
  
  return instructions[phase];
}

/**
 * Legacy function for backward compatibility
 */
export function detectPhase(metrics: {
  hipRotation: number;
  rightElbowAngle: number;
  leftElbowAngle: number;
  weightTransfer: number;
}): MotionPhase {
  const phaseInfo = detectThrowingPhase(
    metrics.hipRotation,
    0, // shoulder rotation not provided in legacy call
    metrics.rightElbowAngle,
    metrics.weightTransfer
  );
  return phaseInfo.displayName;
}

/**
 * Get the frame index range for a specific phase
 */
export function getPhaseFrameRange(phase: MotionPhase, totalFrames: number): [number, number] {
  const phaseRanges: Record<MotionPhase, [number, number]> = {
    "Neutral": [0, Math.floor(totalFrames * 0.10)],
    "Early Cocking": [Math.floor(totalFrames * 0.10), Math.floor(totalFrames * 0.35)],
    "Late Cocking": [Math.floor(totalFrames * 0.35), Math.floor(totalFrames * 0.60)],
    "Release": [Math.floor(totalFrames * 0.60), Math.floor(totalFrames * 0.80)],
    "Follow-through": [Math.floor(totalFrames * 0.80), totalFrames - 1]
  };

  return phaseRanges[phase];
}

/**
 * Get the middle frame of a phase (for synchronization)
 */
export function getPhaseMiddleFrame(phase: MotionPhase, totalFrames: number): number {
  const [start, end] = getPhaseFrameRange(phase, totalFrames);
  return Math.floor((start + end) / 2);
}
