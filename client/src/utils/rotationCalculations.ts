/**
 * Rotation Calculations with Directional Indicators
 * 
 * Rotation Convention:
 * - Negative values = rotated BACK from square (sideways stance)
 * - 0 = square to camera
 * - Positive values = rotated FORWARD past square
 * 
 * For QB throwing:
 * - Neutral: ~-90° (sideways, shoulder pointing at target)
 * - Cocking: -40° to -70° (hips opening, shoulders still back)
 * - Release: ~0° (square to target)
 * - Follow-through: +5° to +10° (rotated past square)
 */

export interface RotationResult {
  angle: number;
  direction: string; // "Back", "Square", "Forward"
  label: string; // e.g., "90° Back", "Square", "5° Forward"
}

/**
 * Calculate hip or shoulder rotation from MediaPipe landmarks
 * Returns signed angle with directional indicator
 */
export function calculateRotation(
  leftLandmark: any,
  rightLandmark: any,
  isVisible: boolean
): RotationResult {
  if (!isVisible || !leftLandmark || !rightLandmark) {
    return { angle: 0, direction: "Square", label: "Square" };
  }

  // Use Z-coordinates to detect rotation (depth)
  // When square to camera: both at same depth (zDiff ≈ 0)
  // When rotated back: right side back, left side forward (zDiff > 0)
  // When rotated forward: right side forward, left side back (zDiff < 0)
  
  const zDiff = rightLandmark.z - leftLandmark.z;
  const xDiff = Math.abs(rightLandmark.x - leftLandmark.x);
  
  // Calculate rotation angle using atan
  // Positive zDiff = rotated back (right side away from camera)
  // Negative zDiff = rotated forward (right side toward camera)
  const rotationRadians = Math.atan(zDiff / Math.max(xDiff, 0.01));
  let angle = rotationRadians * 180 / Math.PI;
  
  // Map to our convention:
  // - Sideways stance (neutral) should be ~-90°
  // - Square to camera should be 0°
  // - Past square should be positive
  
  // The raw atan gives us -90° to +90°
  // We need to scale this to match QB throwing convention
  // When fully sideways, zDiff/xDiff ≈ 1, atan ≈ 45°
  // We want this to map to -90°
  
  // Simple scaling: multiply by 2 to get full range
  angle = angle * 2;
  
  // Determine direction and label
  let direction: string;
  let label: string;
  
  if (angle < -15) {
    direction = "Back";
    label = `${Math.abs(Math.round(angle))}° Back`;
  } else if (angle > 15) {
    direction = "Forward";
    label = `${Math.round(angle)}° Forward`;
  } else {
    direction = "Square";
    label = "Square";
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
  if (absAngle < 15) {
    return "Square";
  } else if (angle < 0) {
    return `${Math.round(absAngle)}° Back`;
  } else {
    return `${Math.round(absAngle)}° Forward`;
  }
}
