/**
 * Phase Detection Utility
 * Detects which phase of the throwing motion the user is currently in based on their biomechanical metrics
 */

export type MotionPhase = "Neutral" | "Wind-up" | "Cocking" | "Acceleration" | "Release" | "Follow-through";

interface PhaseThresholds {
  hipRotation: [number, number];  // [min, max]
  rightElbowAngle: [number, number];
  weightTransfer: [number, number];
}

/**
 * Phase detection thresholds based on professional quarterback throwing motion
 */
const PHASE_THRESHOLDS: Record<MotionPhase, PhaseThresholds> = {
  "Neutral": {
    hipRotation: [0, 20],
    rightElbowAngle: [0, 25],
    weightTransfer: [40, 60]
  },
  "Wind-up": {
    hipRotation: [20, 60],
    rightElbowAngle: [25, 70],
    weightTransfer: [20, 45]
  },
  "Cocking": {
    hipRotation: [60, 100],
    rightElbowAngle: [70, 120],
    weightTransfer: [10, 30]
  },
  "Acceleration": {
    hipRotation: [30, 70],
    rightElbowAngle: [40, 80],
    weightTransfer: [50, 75]
  },
  "Release": {
    hipRotation: [10, 35],
    rightElbowAngle: [5, 30],
    weightTransfer: [75, 95]
  },
  "Follow-through": {
    hipRotation: [0, 20],
    rightElbowAngle: [10, 35],
    weightTransfer: [60, 90]
  }
};

/**
 * Detect the current phase based on user's biomechanical metrics
 * Uses a scoring system to find the best matching phase
 */
export function detectPhase(metrics: {
  hipRotation: number;
  rightElbowAngle: number;
  leftElbowAngle: number;
  weightTransfer: number;
}): MotionPhase {
  let bestPhase: MotionPhase = "Neutral";
  let bestScore = -Infinity;

  // Score each phase based on how well the metrics match
  (Object.keys(PHASE_THRESHOLDS) as MotionPhase[]).forEach(phase => {
    const thresholds = PHASE_THRESHOLDS[phase];
    let score = 0;

    // Hip rotation score
    if (metrics.hipRotation >= thresholds.hipRotation[0] && metrics.hipRotation <= thresholds.hipRotation[1]) {
      score += 10; // Perfect match
    } else {
      // Penalty based on distance from range
      const distance = Math.min(
        Math.abs(metrics.hipRotation - thresholds.hipRotation[0]),
        Math.abs(metrics.hipRotation - thresholds.hipRotation[1])
      );
      score -= distance * 0.5;
    }

    // Elbow angle score
    if (metrics.rightElbowAngle >= thresholds.rightElbowAngle[0] && metrics.rightElbowAngle <= thresholds.rightElbowAngle[1]) {
      score += 10;
    } else {
      const distance = Math.min(
        Math.abs(metrics.rightElbowAngle - thresholds.rightElbowAngle[0]),
        Math.abs(metrics.rightElbowAngle - thresholds.rightElbowAngle[1])
      );
      score -= distance * 0.5;
    }

    // Weight transfer score
    if (metrics.weightTransfer >= thresholds.weightTransfer[0] && metrics.weightTransfer <= thresholds.weightTransfer[1]) {
      score += 10;
    } else {
      const distance = Math.min(
        Math.abs(metrics.weightTransfer - thresholds.weightTransfer[0]),
        Math.abs(metrics.weightTransfer - thresholds.weightTransfer[1])
      );
      score -= distance * 0.5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestPhase = phase;
    }
  });

  return bestPhase;
}

/**
 * Get the frame index range for a specific phase
 */
export function getPhaseFrameRange(phase: MotionPhase, totalFrames: number): [number, number] {
  const phaseRanges: Record<MotionPhase, [number, number]> = {
    "Neutral": [0, Math.floor(totalFrames * 0.15)],
    "Wind-up": [Math.floor(totalFrames * 0.15), Math.floor(totalFrames * 0.35)],
    "Cocking": [Math.floor(totalFrames * 0.35), Math.floor(totalFrames * 0.55)],
    "Acceleration": [Math.floor(totalFrames * 0.55), Math.floor(totalFrames * 0.75)],
    "Release": [Math.floor(totalFrames * 0.75), Math.floor(totalFrames * 0.85)],
    "Follow-through": [Math.floor(totalFrames * 0.85), totalFrames - 1]
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

