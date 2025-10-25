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

// Basketball Jump Shot Professional Reference (placeholder for future)
export const jumpShotReference: ProfessionalReference = {
  motionName: "Jump Shot",
  category: "sports",
  subcategory: "basketball",
  source: "To be researched",
  metrics: []
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
  const key = `${category}-${motionName.toLowerCase().replace(/\s+/g, '')}`;
  return professionalReferences[key] || null;
}

// Helper function to calculate score based on user metric vs professional reference
export function calculateMetricScore(
  userValue: number,
  metric: BiomechanicalMetric
): number {
  const { professionalAverage, optimalRange } = metric;
  
  // If within optimal range, score 90-100
  if (userValue >= optimalRange.min && userValue <= optimalRange.max) {
    // Score based on how close to professional average
    const distanceFromAverage = Math.abs(userValue - professionalAverage);
    const rangeSize = (optimalRange.max - optimalRange.min) / 2;
    const score = 100 - (distanceFromAverage / rangeSize) * 10;
    return Math.max(90, Math.min(100, score));
  }
  
  // If outside optimal range, score decreases with distance
  const distanceFromRange = userValue < optimalRange.min 
    ? optimalRange.min - userValue 
    : userValue - optimalRange.max;
  
  // Score decreases by 5 points per 5 degrees outside range
  const penaltyPoints = (distanceFromRange / 5) * 5;
  const score = 90 - penaltyPoints;
  
  return Math.max(0, Math.min(90, score));
}

// Helper function to get comparison text
export function getComparisonText(
  userValue: number,
  metric: BiomechanicalMetric
): string {
  const { professionalAverage, optimalRange } = metric;
  const difference = userValue - professionalAverage;
  
  if (userValue >= optimalRange.min && userValue <= optimalRange.max) {
    return "Within professional range";
  } else if (userValue < optimalRange.min) {
    return `${Math.abs(difference).toFixed(1)}° below professional average`;
  } else {
    return `${difference.toFixed(1)}° above professional average`;
  }
}

