/**
 * Motion-Specific Priority Metric Weights
 * 
 * Each motion defines which metrics matter and how much weight they carry.
 * - "high" weight = 3 (critical to the motion)
 * - "medium" weight = 2 (important but secondary)
 * - "low" weight = 1 (supplementary)
 * 
 * Only priority metrics (defined here) count toward the overall score.
 * If a priority metric is undetected → scores 0 and counts fully against overall.
 * If a non-priority metric is undetected → ignored entirely.
 */

export type MetricWeight = "high" | "medium" | "low";

export interface PriorityMetric {
  /** The metric name as it appears in the scoring system */
  metricName: string;
  /** Weight level: high=3, medium=2, low=1 */
  weight: MetricWeight;
}

export interface MotionWeightProfile {
  /** Key used for lookup: subcategory-motionId */
  motionKey: string;
  /** Display name */
  motionName: string;
  /** Priority metrics for this motion */
  priorityMetrics: PriorityMetric[];
}

/** Convert weight level to numeric value */
export function getWeightValue(weight: MetricWeight): number {
  switch (weight) {
    case "high": return 3;
    case "medium": return 2;
    case "low": return 1;
  }
}

// ============================================================
// SPORTS — FOOTBALL
// ============================================================

const footballThrowWeights: MotionWeightProfile = {
  motionKey: "football-throw",
  motionName: "Throw",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Foot Positioning", weight: "medium" },
    { metricName: "Spine Angle", weight: "medium" },
  ]
};

const footballPuntWeights: MotionWeightProfile = {
  motionKey: "football-punt",
  motionName: "Punt",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Foot Positioning", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

const footballFieldGoalWeights: MotionWeightProfile = {
  motionKey: "football-field-goal",
  motionName: "Field Goal",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Foot Positioning", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

// ============================================================
// SPORTS — BASKETBALL
// ============================================================

const basketballJumpShotWeights: MotionWeightProfile = {
  motionKey: "basketball-jump-shot",
  motionName: "Jump Shot",
  priorityMetrics: [
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

const basketballFreeThrowWeights: MotionWeightProfile = {
  motionKey: "basketball-free-throw",
  motionName: "Free Throw",
  priorityMetrics: [
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
    { metricName: "Spine Angle", weight: "medium" },
  ]
};

const basketballLayupWeights: MotionWeightProfile = {
  motionKey: "basketball-layup",
  motionName: "Layup",
  priorityMetrics: [
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Elbow Angle", weight: "medium" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Hip Rotation", weight: "low" },
  ]
};

const basketballDribblingWeights: MotionWeightProfile = {
  motionKey: "basketball-dribbling",
  motionName: "Dribbling",
  priorityMetrics: [
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
    { metricName: "Elbow Angle", weight: "medium" },
  ]
};

// ============================================================
// SPORTS — BASEBALL
// ============================================================

const baseballFastballWeights: MotionWeightProfile = {
  motionKey: "baseball-fastball",
  motionName: "Fastball",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Foot Positioning", weight: "medium" },
    { metricName: "Spine Angle", weight: "medium" },
  ]
};

const baseballCurveballWeights: MotionWeightProfile = {
  motionKey: "baseball-curveball",
  motionName: "Curveball",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Foot Positioning", weight: "medium" },
  ]
};

const baseballSliderWeights: MotionWeightProfile = {
  motionKey: "baseball-slider",
  motionName: "Slider",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Foot Positioning", weight: "medium" },
  ]
};

const baseballKnuckleballWeights: MotionWeightProfile = {
  motionKey: "baseball-knuckleball",
  motionName: "Knuckleball",
  priorityMetrics: [
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Hip Rotation", weight: "medium" },
    { metricName: "Foot Positioning", weight: "medium" },
  ]
};

const baseballBattingWeights: MotionWeightProfile = {
  motionKey: "baseball-batting-swing",
  motionName: "Batting Swing",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Elbow Angle", weight: "medium" },
    { metricName: "Knee Flexion", weight: "medium" },
  ]
};

// ============================================================
// SPORTS — TENNIS
// ============================================================

const tennisServeWeights: MotionWeightProfile = {
  motionKey: "tennis-serve",
  motionName: "Serve",
  priorityMetrics: [
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Hip Rotation", weight: "medium" },
    { metricName: "Knee Flexion", weight: "medium" },
  ]
};

const tennisForehandWeights: MotionWeightProfile = {
  motionKey: "tennis-forehand",
  motionName: "Forehand",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Elbow Angle", weight: "medium" },
    { metricName: "Knee Flexion", weight: "medium" },
  ]
};

const tennisBackhandWeights: MotionWeightProfile = {
  motionKey: "tennis-backhand",
  motionName: "Backhand",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
    { metricName: "Knee Flexion", weight: "medium" },
  ]
};

// ============================================================
// SPORTS — GOLF
// ============================================================

const golfDriverWeights: MotionWeightProfile = {
  motionKey: "golf-driver-swing",
  motionName: "Driver Swing",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Knee Flexion", weight: "medium" },
  ]
};

const golfIronWeights: MotionWeightProfile = {
  motionKey: "golf-iron-shot",
  motionName: "Iron Shot",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Knee Flexion", weight: "medium" },
  ]
};

const golfPuttingWeights: MotionWeightProfile = {
  motionKey: "golf-putting",
  motionName: "Putting",
  priorityMetrics: [
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Knee Flexion", weight: "medium" },
    { metricName: "Elbow Angle", weight: "medium" },
  ]
};

// ============================================================
// SPORTS — SOCCER
// ============================================================

const soccerPowerShotWeights: MotionWeightProfile = {
  motionKey: "soccer-power-shot",
  motionName: "Power Shot",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Foot Positioning", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
  ]
};

const soccerPassingWeights: MotionWeightProfile = {
  motionKey: "soccer-passing",
  motionName: "Passing",
  priorityMetrics: [
    { metricName: "Foot Positioning", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Knee Flexion", weight: "medium" },
    { metricName: "Hip Rotation", weight: "medium" },
    { metricName: "Spine Angle", weight: "low" },
  ]
};

// ============================================================
// SPORTS — ARCHERY
// ============================================================

const archeryStanceWeights: MotionWeightProfile = {
  motionKey: "archery-stance",
  motionName: "Stance",
  priorityMetrics: [
    { metricName: "Foot Positioning", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Shoulder Angle", weight: "medium" },
    { metricName: "Knee Flexion", weight: "low" },
  ]
};

const archeryDrawWeights: MotionWeightProfile = {
  motionKey: "archery-draw",
  motionName: "Draw",
  priorityMetrics: [
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
    { metricName: "Hip Rotation", weight: "low" },
  ]
};

const archeryReleaseWeights: MotionWeightProfile = {
  motionKey: "archery-release",
  motionName: "Release",
  priorityMetrics: [
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
    { metricName: "Hip Rotation", weight: "low" },
  ]
};

// ============================================================
// SPORTS — TRACK & FIELD
// ============================================================

const trackSprintStartWeights: MotionWeightProfile = {
  motionKey: "track-field-sprint-start",
  motionName: "Sprint Start",
  priorityMetrics: [
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Foot Positioning", weight: "medium" },
  ]
};

const trackLongJumpWeights: MotionWeightProfile = {
  motionKey: "track-field-long-jump",
  motionName: "Long Jump",
  priorityMetrics: [
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Foot Positioning", weight: "medium" },
  ]
};

const trackHighJumpWeights: MotionWeightProfile = {
  motionKey: "track-field-high-jump",
  motionName: "High Jump",
  priorityMetrics: [
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
    { metricName: "Foot Positioning", weight: "medium" },
  ]
};

const trackShotPutWeights: MotionWeightProfile = {
  motionKey: "track-field-shot-put",
  motionName: "Shot Put",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Knee Flexion", weight: "medium" },
    { metricName: "Elbow Angle", weight: "medium" },
  ]
};

const trackDiscusWeights: MotionWeightProfile = {
  motionKey: "track-field-discus",
  motionName: "Discus",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Knee Flexion", weight: "medium" },
  ]
};

const trackJavelinWeights: MotionWeightProfile = {
  motionKey: "track-field-javelin",
  motionName: "Javelin",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
    { metricName: "Foot Positioning", weight: "medium" },
  ]
};

const trackPoleVaultWeights: MotionWeightProfile = {
  motionKey: "track-field-pole-vault",
  motionName: "Pole Vault",
  priorityMetrics: [
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

const trackHurdlesWeights: MotionWeightProfile = {
  motionKey: "track-field-hurdles",
  motionName: "Hurdles",
  priorityMetrics: [
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
    { metricName: "Foot Positioning", weight: "medium" },
  ]
};

// ============================================================
// WEIGHTLIFTING — POWERLIFTING
// ============================================================

const powerliftingBackSquatWeights: MotionWeightProfile = {
  motionKey: "powerlifting-back-squat",
  motionName: "Back Squat",
  priorityMetrics: [
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Foot Positioning", weight: "high" },
    { metricName: "Elbow Angle", weight: "medium" },
    // Hip Rotation is NOT a priority metric for squat
  ]
};

const powerliftingFrontSquatWeights: MotionWeightProfile = {
  motionKey: "powerlifting-front-squat",
  motionName: "Front Squat",
  priorityMetrics: [
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Foot Positioning", weight: "medium" },
  ]
};

const powerliftingDeadliftWeights: MotionWeightProfile = {
  motionKey: "powerlifting-deadlift",
  motionName: "Deadlift",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

const powerliftingSumoDeadliftWeights: MotionWeightProfile = {
  motionKey: "powerlifting-sumo-deadlift",
  motionName: "Sumo Deadlift",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Foot Positioning", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

const powerliftingBenchPressWeights: MotionWeightProfile = {
  motionKey: "powerlifting-bench-press",
  motionName: "Bench Press",
  priorityMetrics: [
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Foot Positioning", weight: "medium" },
    // Hip Rotation is NOT a priority metric for bench press
  ]
};

const powerliftingInclineBenchWeights: MotionWeightProfile = {
  motionKey: "powerlifting-incline-bench",
  motionName: "Incline Bench Press",
  priorityMetrics: [
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Foot Positioning", weight: "medium" },
  ]
};

const powerliftingOverheadPressWeights: MotionWeightProfile = {
  motionKey: "powerlifting-overhead-press",
  motionName: "Overhead Press",
  priorityMetrics: [
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
    { metricName: "Knee Flexion", weight: "low" },
  ]
};

// ============================================================
// WEIGHTLIFTING — OLYMPIC LIFTING
// ============================================================

const olympicCleanJerkWeights: MotionWeightProfile = {
  motionKey: "olympic-lifting-clean-jerk",
  motionName: "Clean & Jerk",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

const olympicSnatchWeights: MotionWeightProfile = {
  motionKey: "olympic-lifting-snatch",
  motionName: "Snatch",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

const olympicHangCleanWeights: MotionWeightProfile = {
  motionKey: "olympic-lifting-hang-clean",
  motionName: "Hang Clean",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

const olympicPowerCleanWeights: MotionWeightProfile = {
  motionKey: "olympic-lifting-power-clean",
  motionName: "Power Clean",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

// ============================================================
// WEIGHTLIFTING — KETTLEBELL
// ============================================================

const kettlebellSwingWeights: MotionWeightProfile = {
  motionKey: "kettlebell-kb-swing",
  motionName: "Kettlebell Swing",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Knee Flexion", weight: "medium" },
    { metricName: "Shoulder Angle", weight: "medium" },
    { metricName: "Weight Transfer", weight: "low" },
  ]
};

const kettlebellCleanWeights: MotionWeightProfile = {
  motionKey: "kettlebell-kb-clean",
  motionName: "Kettlebell Clean",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Knee Flexion", weight: "medium" },
    { metricName: "Shoulder Angle", weight: "medium" },
  ]
};

const kettlebellSnatchWeights: MotionWeightProfile = {
  motionKey: "kettlebell-kb-snatch",
  motionName: "Kettlebell Snatch",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Knee Flexion", weight: "medium" },
  ]
};

const kettlebellPressWeights: MotionWeightProfile = {
  motionKey: "kettlebell-kb-press",
  motionName: "Kettlebell Press",
  priorityMetrics: [
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
    { metricName: "Knee Flexion", weight: "low" },
  ]
};

const kettlebellTurkishGetupWeights: MotionWeightProfile = {
  motionKey: "kettlebell-turkish-getup",
  motionName: "Turkish Get-Up",
  priorityMetrics: [
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Knee Flexion", weight: "medium" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

const kettlebellWindmillWeights: MotionWeightProfile = {
  motionKey: "kettlebell-kb-windmill",
  motionName: "Kettlebell Windmill",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Knee Flexion", weight: "medium" },
    { metricName: "Weight Transfer", weight: "low" },
  ]
};

const kettlebellGobletSquatWeights: MotionWeightProfile = {
  motionKey: "kettlebell-goblet-squat",
  motionName: "Goblet Squat",
  priorityMetrics: [
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Elbow Angle", weight: "medium" },
    { metricName: "Foot Positioning", weight: "medium" },
  ]
};

const kettlebellDeadliftWeights: MotionWeightProfile = {
  motionKey: "kettlebell-kb-deadlift",
  motionName: "Kettlebell Deadlift",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
    { metricName: "Shoulder Angle", weight: "low" },
  ]
};

const kettlebellRowWeights: MotionWeightProfile = {
  motionKey: "kettlebell-kb-row",
  motionName: "Kettlebell Row",
  priorityMetrics: [
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Hip Rotation", weight: "medium" },
    { metricName: "Knee Flexion", weight: "low" },
  ]
};

// ============================================================
// RECOVERY — PHYSICAL THERAPY
// ============================================================

const ptGluteBridgeWeights: MotionWeightProfile = {
  motionKey: "physical-therapy-glute-bridge",
  motionName: "Glute Bridge",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

const ptClamshellsWeights: MotionWeightProfile = {
  motionKey: "physical-therapy-clamshells",
  motionName: "Clamshells",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

const ptBirdDogWeights: MotionWeightProfile = {
  motionKey: "physical-therapy-bird-dog",
  motionName: "Bird Dog",
  priorityMetrics: [
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Shoulder Angle", weight: "medium" },
    { metricName: "Knee Flexion", weight: "medium" },
  ]
};

const ptWallSlidesWeights: MotionWeightProfile = {
  motionKey: "physical-therapy-wall-slides",
  motionName: "Wall Slides",
  priorityMetrics: [
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "low" },
  ]
};

const ptHeelRaisesWeights: MotionWeightProfile = {
  motionKey: "physical-therapy-heel-raises",
  motionName: "Heel Raises",
  priorityMetrics: [
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Foot Positioning", weight: "medium" },
  ]
};

const ptSideLegRaisesWeights: MotionWeightProfile = {
  motionKey: "physical-therapy-side-leg-raises",
  motionName: "Side Leg Raises",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Knee Flexion", weight: "medium" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

const ptMarchingWeights: MotionWeightProfile = {
  motionKey: "physical-therapy-marching",
  motionName: "Marching in Place",
  priorityMetrics: [
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

const ptSingleLegStandWeights: MotionWeightProfile = {
  motionKey: "physical-therapy-single-leg-stand",
  motionName: "Single Leg Stand",
  priorityMetrics: [
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Hip Rotation", weight: "medium" },
  ]
};

const ptStepUpsWeights: MotionWeightProfile = {
  motionKey: "physical-therapy-step-ups",
  motionName: "Step-Ups",
  priorityMetrics: [
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Weight Transfer", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Hip Rotation", weight: "medium" },
  ]
};

const ptResistanceRowsWeights: MotionWeightProfile = {
  motionKey: "physical-therapy-resistance-rows",
  motionName: "Resistance Band Rows",
  priorityMetrics: [
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Hip Rotation", weight: "low" },
  ]
};

// ============================================================
// RECOVERY — STRETCHING
// ============================================================

const stretchHipFlexorWeights: MotionWeightProfile = {
  motionKey: "stretching-hip-flexor-stretch",
  motionName: "Hip Flexor Stretch",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

const stretchHamstringWeights: MotionWeightProfile = {
  motionKey: "stretching-hamstring-stretch",
  motionName: "Hamstring Stretch",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "low" },
  ]
};

const stretchCalfWeights: MotionWeightProfile = {
  motionKey: "stretching-calf-stretch",
  motionName: "Calf Stretch",
  priorityMetrics: [
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Foot Positioning", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

const stretchQuadWeights: MotionWeightProfile = {
  motionKey: "stretching-quad-stretch",
  motionName: "Quadriceps Stretch",
  priorityMetrics: [
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

const stretchShoulderWeights: MotionWeightProfile = {
  motionKey: "stretching-shoulder-crossbody",
  motionName: "Shoulder Cross-Body Stretch",
  priorityMetrics: [
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Hip Rotation", weight: "low" },
  ]
};

// ============================================================
// RECOVERY — MOBILITY
// ============================================================

const mobilityThoracicRotationWeights: MotionWeightProfile = {
  motionKey: "mobility-thoracic-rotation",
  motionName: "Thoracic Spine Rotation",
  priorityMetrics: [
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Knee Flexion", weight: "low" },
  ]
};

const mobilityHipCirclesWeights: MotionWeightProfile = {
  motionKey: "mobility-hip-circles",
  motionName: "Hip Circles",
  priorityMetrics: [
    { metricName: "Hip Rotation", weight: "high" },
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
    { metricName: "Spine Angle", weight: "medium" },
  ]
};

const mobilityAnkleCirclesWeights: MotionWeightProfile = {
  motionKey: "mobility-ankle-circles",
  motionName: "Ankle Circles",
  priorityMetrics: [
    { metricName: "Foot Positioning", weight: "high" },
    { metricName: "Knee Flexion", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
    { metricName: "Spine Angle", weight: "low" },
  ]
};

const mobilityNeckRollsWeights: MotionWeightProfile = {
  motionKey: "mobility-neck-rolls",
  motionName: "Neck Rolls",
  priorityMetrics: [
    { metricName: "Spine Angle", weight: "high" },
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Weight Transfer", weight: "medium" },
  ]
};

const mobilityArmCirclesWeights: MotionWeightProfile = {
  motionKey: "mobility-arm-circles",
  motionName: "Arm Circles",
  priorityMetrics: [
    { metricName: "Shoulder Angle", weight: "high" },
    { metricName: "Elbow Angle", weight: "high" },
    { metricName: "Spine Angle", weight: "medium" },
    { metricName: "Weight Transfer", weight: "low" },
  ]
};

// ============================================================
// LOOKUP MAP
// ============================================================

const motionWeightProfiles: Record<string, MotionWeightProfile> = {
  // Football
  "football-throw": footballThrowWeights,
  "football-punt": footballPuntWeights,
  "football-field-goal": footballFieldGoalWeights,
  // Basketball
  "basketball-jump-shot": basketballJumpShotWeights,
  "basketball-free-throw": basketballFreeThrowWeights,
  "basketball-layup": basketballLayupWeights,
  "basketball-dribbling": basketballDribblingWeights,
  // Baseball
  "baseball-fastball": baseballFastballWeights,
  "baseball-curveball": baseballCurveballWeights,
  "baseball-slider": baseballSliderWeights,
  "baseball-knuckleball": baseballKnuckleballWeights,
  "baseball-batting-swing": baseballBattingWeights,
  // Tennis
  "tennis-serve": tennisServeWeights,
  "tennis-forehand": tennisForehandWeights,
  "tennis-backhand": tennisBackhandWeights,
  // Golf
  "golf-driver-swing": golfDriverWeights,
  "golf-iron-shot": golfIronWeights,
  "golf-putting": golfPuttingWeights,
  // Soccer
  "soccer-power-shot": soccerPowerShotWeights,
  "soccer-passing": soccerPassingWeights,
  // Archery
  "archery-stance": archeryStanceWeights,
  "archery-draw": archeryDrawWeights,
  "archery-release": archeryReleaseWeights,
  // Track & Field
  "track-field-sprint-start": trackSprintStartWeights,
  "track-field-long-jump": trackLongJumpWeights,
  "track-field-high-jump": trackHighJumpWeights,
  "track-field-shot-put": trackShotPutWeights,
  "track-field-discus": trackDiscusWeights,
  "track-field-javelin": trackJavelinWeights,
  "track-field-pole-vault": trackPoleVaultWeights,
  "track-field-hurdles": trackHurdlesWeights,
  // Powerlifting
  "powerlifting-back-squat": powerliftingBackSquatWeights,
  "powerlifting-front-squat": powerliftingFrontSquatWeights,
  "powerlifting-deadlift": powerliftingDeadliftWeights,
  "powerlifting-sumo-deadlift": powerliftingSumoDeadliftWeights,
  "powerlifting-bench-press": powerliftingBenchPressWeights,
  "powerlifting-incline-bench": powerliftingInclineBenchWeights,
  "powerlifting-overhead-press": powerliftingOverheadPressWeights,
  // Olympic Lifting
  "olympic-lifting-clean-jerk": olympicCleanJerkWeights,
  "olympic-lifting-snatch": olympicSnatchWeights,
  "olympic-lifting-hang-clean": olympicHangCleanWeights,
  "olympic-lifting-power-clean": olympicPowerCleanWeights,
  // Kettlebell
  "kettlebell-kb-swing": kettlebellSwingWeights,
  "kettlebell-kb-clean": kettlebellCleanWeights,
  "kettlebell-kb-snatch": kettlebellSnatchWeights,
  "kettlebell-kb-press": kettlebellPressWeights,
  "kettlebell-turkish-getup": kettlebellTurkishGetupWeights,
  "kettlebell-kb-windmill": kettlebellWindmillWeights,
  "kettlebell-goblet-squat": kettlebellGobletSquatWeights,
  "kettlebell-kb-deadlift": kettlebellDeadliftWeights,
  "kettlebell-kb-row": kettlebellRowWeights,
  // Physical Therapy
  "physical-therapy-glute-bridge": ptGluteBridgeWeights,
  "physical-therapy-clamshells": ptClamshellsWeights,
  "physical-therapy-bird-dog": ptBirdDogWeights,
  "physical-therapy-wall-slides": ptWallSlidesWeights,
  "physical-therapy-heel-raises": ptHeelRaisesWeights,
  "physical-therapy-side-leg-raises": ptSideLegRaisesWeights,
  "physical-therapy-marching": ptMarchingWeights,
  "physical-therapy-single-leg-stand": ptSingleLegStandWeights,
  "physical-therapy-step-ups": ptStepUpsWeights,
  "physical-therapy-resistance-rows": ptResistanceRowsWeights,
  // Stretching
  "stretching-hip-flexor-stretch": stretchHipFlexorWeights,
  "stretching-hamstring-stretch": stretchHamstringWeights,
  "stretching-calf-stretch": stretchCalfWeights,
  "stretching-quad-stretch": stretchQuadWeights,
  "stretching-shoulder-crossbody": stretchShoulderWeights,
  // Mobility
  "mobility-thoracic-rotation": mobilityThoracicRotationWeights,
  "mobility-hip-circles": mobilityHipCirclesWeights,
  "mobility-ankle-circles": mobilityAnkleCirclesWeights,
  "mobility-neck-rolls": mobilityNeckRollsWeights,
  "mobility-arm-circles": mobilityArmCirclesWeights,
};

/**
 * Get the priority metric weights for a specific motion.
 * Uses the same lookup logic as professionalReferences: subcategory-motionId.
 * Falls back to a generic profile if no exact match is found.
 */
export function getMotionWeights(
  category: string,
  subcategory: string,
  motionName: string
): MotionWeightProfile {
  const formattedMotion = motionName.toLowerCase().replace(/\s+/g, '-');
  const key = `${subcategory.toLowerCase()}-${formattedMotion}`;
  
  // Try exact match
  if (motionWeightProfiles[key]) return motionWeightProfiles[key];
  
  // Try without subcategory prefix
  if (motionWeightProfiles[formattedMotion]) return motionWeightProfiles[formattedMotion];
  
  // Try category-based match
  const catKey = `${category.toLowerCase()}-${formattedMotion}`;
  if (motionWeightProfiles[catKey]) return motionWeightProfiles[catKey];
  
  // Fuzzy match
  for (const [refKey, profile] of Object.entries(motionWeightProfiles)) {
    if (refKey.includes(formattedMotion) || formattedMotion.includes(refKey.split('-').slice(1).join('-'))) {
      return profile;
    }
  }
  
  // Generic fallback — all metrics equal weight
  console.warn(`⚠️ No weight profile found for: ${key}. Using generic equal weights.`);
  return {
    motionKey: key,
    motionName: motionName,
    priorityMetrics: [
      { metricName: "Hip Rotation", weight: "medium" },
      { metricName: "Shoulder Angle", weight: "medium" },
      { metricName: "Elbow Angle", weight: "medium" },
      { metricName: "Knee Flexion", weight: "medium" },
      { metricName: "Spine Angle", weight: "medium" },
      { metricName: "Foot Positioning", weight: "medium" },
      { metricName: "Weight Transfer", weight: "medium" },
    ]
  };
}

/**
 * Check if a metric is a priority metric for the given motion.
 */
export function isPriorityMetric(
  metricName: string,
  weightProfile: MotionWeightProfile
): boolean {
  return weightProfile.priorityMetrics.some(
    pm => pm.metricName.toLowerCase() === metricName.toLowerCase()
  );
}

/**
 * Get the weight value for a specific metric in a motion.
 * Returns 0 if the metric is not a priority metric.
 */
export function getMetricWeight(
  metricName: string,
  weightProfile: MotionWeightProfile
): number {
  const pm = weightProfile.priorityMetrics.find(
    p => p.metricName.toLowerCase() === metricName.toLowerCase()
  );
  return pm ? getWeightValue(pm.weight) : 0;
}
