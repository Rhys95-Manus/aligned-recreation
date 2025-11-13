/**
 * Rotation Calculations with Directional Indicators
 * 
 * Rotation Convention:
 * - 0° = square to camera (facing forward)
 * - 90° = sideways (shoulder pointing at camera)
 * - Negative values = rotated to the left
 * - Positive values = rotated to the right
 * 
 * For QB throwing (right-handed):
 * - Neutral: ~90° (sideways, right shoulder back)
 * - Cocking: 40° to 70° (hips opening, shoulders still back)
 * - Release: ~0° (square to target)
 * - Follow-through: -5° to -10° (rotated past square)
 */

export interface RotationResult {
  angle: number;
  direction: string; // "Back", "Square", "Forward"
  label: string; // e.g., "90° Back", "Square", "5° Forward"
}

/**
 * Calculate hip or shoulder rotation from MediaPipe landmarks
 * Returns signed angle with directional indicator
 * 
 * ACCURATE CALCULATION:
 * - Uses z-coordinates (depth) to determine rotation
 * - When square: both landmarks at same depth (z values similar)
 * - When sideways: one landmark much further back than the other
 */
export function calculateRotation(
  leftLandmark: any,
  rightLandmark: any,
  isVisible: boolean
): RotationResult {
  if (!isVisible || !leftLandmark || !rightLandmark) {
    return { angle: 0, direction: "Square", label: "Square" };
  }

  // Check visibility of individual landmarks
  const leftVis = leftLandmark.visibility ?? 0;
  const rightVis = rightLandmark.visibility ?? 0;
  
  if (leftVis < 0.5 || rightVis < 0.5) {
    return { angle: 0, direction: "Square", label: "Square" };
  }

  // Calculate rotation using z-coordinates (depth)
  // MediaPipe z: negative = closer to camera, positive = further from camera
  const zDiff = rightLandmark.z - leftLandmark.z;
  const xDiff = Math.abs(rightLandmark.x - leftLandmark.x);
  
  // Calculate angle using arctangent
  // When square to camera: zDiff ≈ 0, angle ≈ 0°
  // When sideways (90°): zDiff ≈ xDiff, angle ≈ 45° (need to scale)
  
  // Use atan2 for better accuracy
  const angleRadians = Math.atan2(Math.abs(zDiff), xDiff);
  let angle = angleRadians * 180 / Math.PI;
  
  // Scale to match real-world rotation
  // atan2(zDiff, xDiff) gives 0-90° range
  // We want: 0° = square, 90° = sideways
  // The calculation already gives us this!
  
  // Determine if rotated left or right based on which shoulder is back
  // For right-handed QB: right shoulder back = positive angle
  if (zDiff > 0) {
    // Right landmark is further back (right shoulder back) - positive angle
    angle = Math.abs(angle);
  } else {
    // Left landmark is further back (left shoulder back) - negative angle
    angle = -Math.abs(angle);
  }
  
  // Determine direction and label
  let direction: string;
  let label: string;
  
  const absAngle = Math.abs(angle);
  
  if (absAngle < 10) {
    direction = "Square";
    label = "Square";
  } else if (angle > 0) {
    // Right shoulder back (typical QB stance)
    direction = "Back";
    label = `${Math.round(absAngle)}° Back`;
  } else {
    // Left shoulder back (past square)
    direction = "Forward";
    label = `${Math.round(absAngle)}° Forward`;
  }
  
  return { angle, direction, label };
}

/**
 * Calculate hip-shoulder separation
 * Returns the difference between hip and shoulder rotation
 */
export function calculateHipShoulderSeparation(
  hipRotation: number,
  shoulderRotation: number
): RotationResult {
  // Separation = how much hips are ahead of shoulders
  // Positive = hips more forward than shoulders (good!)
  // Negative = shoulders ahead of hips (bad)
  
  const separation = hipRotation - shoulderRotation;
  
  let direction: string;
  let label: string;
  
  if (Math.abs(separation) < 5) {
    direction = "Aligned";
    label = "Aligned";
  } else if (separation > 0) {
    direction = "Hips Ahead";
    label = `${Math.round(separation)}° Separation`;
  } else {
    direction = "Shoulders Ahead";
    label = `${Math.abs(Math.round(separation))}° Reverse`;
  }
  
  return { angle: separation, direction, label };
}

/**
 * Format weight distribution with directional indicator
 */
export function formatWeightDistribution(weightPercent: number): string {
  if (Math.abs(weightPercent) < 10) {
    return "Balanced";
  } else if (weightPercent < 0) {
    return `Back Foot: ${Math.abs(Math.round(weightPercent))}%`;
  } else {
    return `Front Foot: ${Math.round(weightPercent)}%`;
  }
}

/**
 * Format spine angle with directional indicator
 */
export function formatSpineAngle(angle: number): string {
  if (Math.abs(angle) < 3) {
    return `${angle.toFixed(1)}° (Upright)`;
  } else if (angle < 0) {
    return `${Math.abs(angle).toFixed(1)}° (Back)`;
  } else {
    return `${angle.toFixed(1)}° (Forward)`;
  }
}

/**
 * Format rotation angle (hip or shoulder) with directional indicator
 */
export function formatRotationAngle(angle: number): string {
  const absAngle = Math.abs(angle);
  if (absAngle < 10) {
    return "Square";
  } else if (angle > 0) {
    return `${Math.round(absAngle)}° Back`;
  } else {
    return `${Math.round(absAngle)}° Forward`;
  }
}
