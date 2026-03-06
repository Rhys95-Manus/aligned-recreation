// Professional Reference Data for Motion Analysis
// Based on peer-reviewed biomechanical research and elite athlete analysis

export interface BiomechanicalMetric {
  name: string;
  professionalAverage: number;
  optimalRange: {
    min: number;
    max: number;
  };
  unit: string;
  description: string;
}

export interface ProfessionalReference {
  motionName: string;
  category: string;
  subcategory: string;
  metrics: BiomechanicalMetric[];
  source: string;
}

// Football Throw Professional Reference
// Source: "Kinematic Sequencing of the Football Pass Using Inertial Motion Analysis"
// International Journal of Sports Physical Therapy, 2025
// Represents averaged data from professional NFL quarterbacks
export const footballThrowReference: ProfessionalReference = {
  motionName: "Throw",
  category: "football",
  subcategory: "quarterback",
  source: "Professional QB Biomechanics Study (IJSPT 2025)",
  metrics: [
    {
      name: "Shoulder Abduction",
      professionalAverage: 112,
      optimalRange: { min: 105, max: 120 },
      unit: "degrees",
      description: "Angle of throwing arm away from body at acceleration phase"
    },
    {
      name: "Shoulder External Rotation",
      professionalAverage: 134,
      optimalRange: { min: 125, max: 145 },
      unit: "degrees",
      description: "Maximum shoulder rotation when arm is cocked back"
    },
    {
      name: "Elbow Flexion",
      professionalAverage: 100,
      optimalRange: { min: 90, max: 110 },
      unit: "degrees",
      description: "Elbow bend at maximal shoulder external rotation"
    },
    {
      name: "Hip Rotation",
      professionalAverage: 61,
      optimalRange: { min: 50, max: 70 },
      unit: "degrees",
      description: "Total hip rotation from foot contact to follow-through"
    },
    {
      name: "Hip-Shoulder Separation",
      professionalAverage: 20,
      optimalRange: { min: 15, max: 25 },
      unit: "degrees",
      description: "Separation between hip and shoulder rotation during cocking"
    },
    {
      name: "Spine Extension",
      professionalAverage: 23,
      optimalRange: { min: 18, max: 28 },
      unit: "degrees",
      description: "Lumbar extension at maximal shoulder external rotation"
    },
    {
      name: "Knee Flexion",
      professionalAverage: 38,
      optimalRange: { min: 30, max: 50 },
      unit: "degrees",
      description: "Stride leg knee bend (average of 29-46° range)"
    },
    {
      name: "Foot Positioning",
      professionalAverage: 45,
      optimalRange: { min: 35, max: 55 },
      unit: "degrees",
      description: "Front foot angle relative to target line during stride"
    },
    {
      name: "Weight Transfer",
      professionalAverage: 70,
      optimalRange: { min: 60, max: 80 },
      unit: "percent",
      description: "Percentage of weight transferred from back to front foot"
    }
  ]
};

// Basketball Jump Shot Professional Reference
// Based on comprehensive shooting mechanics analysis covering all 6 phases.
// Metrics represent optimal values across the full shot motion (Phase 1–Phase 5).
// Total shot time: 0.90–1.20s. Key landmarks: Dip Bottom at 35–45%, Release at 70–85%.
export const jumpShotReference: ProfessionalReference = {
  motionName: "Jump Shot",
  category: "sports",
  subcategory: "basketball",
  source: "Basketball Shooting Mechanics Analysis (Multi-Phase Model)",
  metrics: [
    {
      name: "Shooting Elbow Flexion",
      professionalAverage: 95,
      optimalRange: { min: 60, max: 180 },
      unit: "degrees",
      description: "Shooting elbow angle across the full shot: starts at 60–80° in pocket, extends to 160–180° at release"
    },
    {
      name: "Off-Hand Elbow Flexion",
      professionalAverage: 90,
      optimalRange: { min: 60, max: 180 },
      unit: "degrees",
      description: "Guide hand elbow: supports in pocket (60–90°), peels away at release (140–180°)"
    },
    {
      name: "Shooting Knee Flexion",
      professionalAverage: 135,
      optimalRange: { min: 90, max: 178 },
      unit: "degrees",
      description: "Shooting-side knee: dips to 90–120° in load, extends to 150–178° at release"
    },
    {
      name: "Non-Shooting Knee Flexion",
      professionalAverage: 135,
      optimalRange: { min: 90, max: 178 },
      unit: "degrees",
      description: "Non-shooting knee should track closely with shooting side throughout"
    },
    {
      name: "Shoulder Rotation",
      professionalAverage: 15,
      optimalRange: { min: 5, max: 25 },
      unit: "degrees",
      description: "Mild open stance maintained throughout — no sudden twist at release"
    },
    {
      name: "Spine Lean",
      professionalAverage: 8,
      optimalRange: { min: 0, max: 15 },
      unit: "degrees",
      description: "Natural forward lean during dip (10–25°), returns to vertical (0–5°) at release"
    },
    {
      name: "Weight Transfer",
      professionalAverage: 10,
      optimalRange: { min: 0, max: 20 },
      unit: "percent",
      description: "Centered to slight forward bias — energy transfers straight up, not forward"
    },
    {
      name: "Foot Positioning",
      professionalAverage: 30,
      optimalRange: { min: 15, max: 45 },
      unit: "degrees",
      description: "Shoulder-width stance with shooting foot slightly ahead"
    },
    {
      name: "Elbow Height Index",
      professionalAverage: 55,
      optimalRange: { min: 20, max: 90 },
      unit: "index (0–100)",
      description: "Ball height relative to body: starts low in pocket (30–50), rises to high release (70–90)"
    },
    {
      name: "Hip–Ball Synch Score",
      professionalAverage: 0.92,
      optimalRange: { min: 0.80, max: 1.00 },
      unit: "score (0–1)",
      description: "How closely the ball and hips move together during dip and rise phases"
    },
    {
      name: "Release Timing",
      professionalAverage: 78,
      optimalRange: { min: 70, max: 85 },
      unit: "percent of total motion",
      description: "When the ball is released relative to total shot duration — ideal at 70–85%"
    },
    {
      name: "Landing Recovery Time",
      professionalAverage: 0.28,
      optimalRange: { min: 0.15, max: 0.40 },
      unit: "seconds",
      description: "Time from landing to balanced stabilization"
    },
    {
      name: "Neutral Return Time",
      professionalAverage: 0.40,
      optimalRange: { min: 0.20, max: 0.60 },
      unit: "seconds",
      description: "Time from landing to full neutral reset — ready for next play"
    }
  ]
};

// Export all references
export const professionalReferences: Record<string, ProfessionalReference> = {
  "football-throw": footballThrowReference,
  "basketball-jumpshot": jumpShotReference
};

// Helper function to get reference by motion
export function getProfessionalReference(
  category: string, 
  subcategory: string, 
  motionName: string
): ProfessionalReference | null {
  // Convert motion name to lowercase and replace spaces with dashes to match key format
  // e.g., "Football Throw" -> "football-throw"
  // Use SUBCATEGORY (e.g., "football") not category (e.g., "sports") for the key
  const formattedMotion = motionName.toLowerCase().replace(/\s+/g, '-');
  const key = `${subcategory.toLowerCase()}-${formattedMotion}`;
  console.log('🔑 Looking for professional reference with key:', key);
  return professionalReferences[key] || null;
}

// Helper function to calculate alignment score based on distance from optimal
// This measures how close the user is to professional mechanics, treating
// over-rotation and under-rotation equally (e.g., 45° and 77° both score the same if pro is 61°)
export function calculateMetricScore(
  userValue: number,
  metric: BiomechanicalMetric
): number {
  const { professionalAverage, optimalRange } = metric;
  
  // Calculate absolute distance from professional average
  const distanceFromOptimal = Math.abs(userValue - professionalAverage);
  
  // If within optimal range, score 90-100 based on closeness to average
  if (userValue >= optimalRange.min && userValue <= optimalRange.max) {
    const rangeSize = (optimalRange.max - optimalRange.min) / 2;
    // Perfect alignment (at professional average) = 100
    // At edge of optimal range = 90
    const score = 100 - (distanceFromOptimal / rangeSize) * 10;
    return Math.max(90, Math.min(100, score));
  }
  
  // If outside optimal range, calculate alignment score (0-90)
  // Distance from the nearest edge of optimal range
  const distanceFromRange = userValue < optimalRange.min 
    ? optimalRange.min - userValue 
    : userValue - optimalRange.max;
  
  // Total distance from optimal (distance from average to edge + distance beyond edge)
  const totalDistance = distanceFromOptimal;
  
  // Alignment score: 90 at edge of range, decreasing by 5 points per 5° away
  // This ensures symmetry: being 20° under or 20° over scores the same
  const penaltyPoints = (distanceFromRange / 5) * 5;
  const score = 90 - penaltyPoints;
  
  return Math.max(0, Math.min(90, score));
}

// Helper function to get comparison text based on alignment
export function getComparisonText(
  userValue: number,
  metric: BiomechanicalMetric
): string {
  const { professionalAverage, optimalRange } = metric;
  const distanceFromOptimal = Math.abs(userValue - professionalAverage);
  
  if (userValue >= optimalRange.min && userValue <= optimalRange.max) {
    if (distanceFromOptimal < 2) {
      return "Perfect alignment with professional average";
    }
    return "Within professional range";
  }
  
  // Show absolute distance from optimal, not directional difference
  const direction = userValue < professionalAverage ? "below" : "above";
  return `${distanceFromOptimal.toFixed(1)}° ${direction} professional average`;
}

