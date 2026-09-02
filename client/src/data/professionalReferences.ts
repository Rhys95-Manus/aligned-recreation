
/**
 * ANGLE CONVENTION — applies to every angle in this document.
 *
 * All joint angles are INTERIOR JOINT ANGLES measured between the two
 * adjacent body segments, matching the angle computed from three MediaPipe
 * landmarks.
 *
 *   180° = limb fully straight (full extension)
 *    90° = limb bent to a right angle
 *     0° = limb fully folded
 *
 * To convert from published research using range-of-motion flexion angles:
 *   interior = 180 − ROM_flexion
 *   Example: research "110° of knee flexion" = 70° in this document.
 *
 * Spine Lean is measured in degrees FROM VERTICAL (0° = perfectly upright).
 * Weight Transfer is a percentage where negative = toward heels,
 * positive = toward toes, 0% = centered over mid-foot.
 */

// Professional Athlete Biomechanical Reference Data
// Values originate from AlignedMetrics.docx, with Aligned_Metrics_Corrections.md taking precedence.

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

export interface PhaseMetric {
  name: string;
  min: number;
  max: number;
  unit: string;
  note: string;
}

export interface ProfessionalReferencePhase {
  name: string;
  cueText: string;
  instruction: string;
  approximateDuration: string;
  metrics: PhaseMetric[];
}

export type VerificationLevel = "research-verified" | "coaching-standard" | "unverified";

export interface ProfessionalReference {
  motionName: string;
  category: string;
  subcategory: string;
  metrics: BiomechanicalMetric[];
  source: string;
  verificationLevel: VerificationLevel;
  phases?: ProfessionalReferencePhase[];
}

type PhaseMetricTuple = readonly [name: string, min: number, max: number, unit: string, note: string];

const alignedMetricsSource = "AlignedMetrics.docx with Aligned_Metrics_Corrections.md overrides";

function referencePhase(
  name: string,
  cueText: string,
  instruction: string,
  approximateDuration: string,
  metrics: readonly PhaseMetricTuple[],
): ProfessionalReferencePhase {
  return {
    name,
    cueText,
    instruction,
    approximateDuration,
    metrics: metrics.map(([metricName, min, max, unit, note]) => ({ name: metricName, min, max, unit, note })),
  };
}

// ============================================================
// SPORTS — FOOTBALL
// ============================================================

export const footballThrowReference: ProfessionalReference = {
  motionName: "Throw",
  category: "sports",
  subcategory: "football",
  source: "Professional QB Biomechanics Study (IJSPT 2025)",
  verificationLevel: "research-verified",
  metrics: [
    { name: "Shoulder External Rotation", professionalAverage: 134, optimalRange: { min: 125, max: 145 }, unit: "degrees", description: "Maximum shoulder rotation when arm is cocked back" },
    { name: "Elbow Flexion", professionalAverage: 100, optimalRange: { min: 90, max: 110 }, unit: "degrees", description: "Elbow bend at maximal shoulder external rotation" },
    { name: "Hip Rotation", professionalAverage: 61, optimalRange: { min: 50, max: 70 }, unit: "degrees", description: "Total hip rotation from foot contact to follow-through" },
    { name: "Hip-Shoulder Separation", professionalAverage: 37.5, optimalRange: { min: 30, max: 45 }, unit: "degrees", description: "Peak dynamic separation between hip and shoulder rotation during late cocking" },
    { name: "Spine Extension", professionalAverage: 23, optimalRange: { min: 18, max: 28 }, unit: "degrees", description: "Lumbar extension at maximal shoulder external rotation" },
    { name: "Knee Flexion", professionalAverage: 38, optimalRange: { min: 30, max: 50 }, unit: "degrees", description: "Stride leg knee bend" },
    { name: "Foot Positioning", professionalAverage: 45, optimalRange: { min: 35, max: 55 }, unit: "degrees", description: "Front foot angle relative to target line" },
    { name: "Weight Transfer", professionalAverage: 70, optimalRange: { min: 60, max: 80 }, unit: "percent", description: "Percentage of weight transferred from back to front foot" }
  ],
  phases: [
    {
      name: "Neutral / Ready Position",
      cueText: "Stand sideways to the target with the ball near the chest, a relaxed grip, feet just outside shoulder width, soft knees, balanced weight, and a tall athletic spine.",
      instruction: "Start tall and balanced with the ball near your chest, standing sideways to the target with a relaxed posture that prepares your body to rotate smoothly.",
      approximateDuration: "0.25-0.35 sec",
      metrics: [
        { name: "Weight Distribution", min: -5, max: 5, unit: "percent", note: "Balanced base" },
        { name: "Back Knee Flexion", min: 150, max: 170, unit: "degrees", note: "Athletic bend" },
        { name: "Lead Knee Flexion", min: 150, max: 170, unit: "degrees", note: "Ready to step" },
        { name: "Spine Angle", min: 0, max: 10, unit: "degrees", note: "Tall posture" },
        { name: "Hip Rotation", min: 0, max: 10, unit: "degrees", note: "Closed hips" },
        { name: "Shoulder Rotation", min: 0, max: 10, unit: "degrees", note: "Closed shoulders" },
        { name: "Throwing Elbow Flexion", min: 80, max: 120, unit: "degrees", note: "Relaxed arm" },
        { name: "Non-Throwing Elbow Flexion", min: 70, max: 120, unit: "degrees", note: "Balanced counter" }
      ]
    },
    {
      name: "Early Cocking",
      cueText: "Shift slightly into the back foot as the throwing arm begins its backstroke, pivot or step the front foot toward the target, let the hips start opening, and keep the shoulders closed with the elbow near shoulder height.",
      instruction: "Shift slightly into your back leg as your throwing arm moves into its backstroke position, pivoting your front foot toward the target while keeping your shoulders closed.",
      approximateDuration: "0.20-0.30 sec",
      metrics: [
        { name: "Weight Distribution", min: -20, max: -10, unit: "percent", note: "Load the back leg" },
        { name: "Back Knee Flexion", min: 140, max: 160, unit: "degrees", note: "Absorb load" },
        { name: "Lead Knee Flexion", min: 150, max: 170, unit: "degrees", note: "Free to pivot" },
        { name: "Spine Angle", min: 0, max: 10, unit: "degrees", note: "Stay tall" },
        { name: "Hip Rotation", min: 10, max: 25, unit: "degrees open", note: "Hips start first" },
        { name: "Shoulder Rotation", min: 0, max: 10, unit: "degrees open", note: "Shoulders stay closed" },
        { name: "Throwing Elbow Height", min: -5, max: 5, unit: "degrees from shoulder level", note: "Elbow up, not flared" },
        { name: "Throwing Elbow Flexion", min: 80, max: 100, unit: "degrees", note: "Compact arm" },
        { name: "Non-Throwing Elbow Flexion", min: 30, max: 70, unit: "degrees", note: "Counterbalance" }
      ]
    },
    {
      name: "Late Cocking / Max Torque",
      cueText: "Begin moving weight forward as the hips rotate open, delay the shoulders, form a clean L-shape behind the head, keep the throwing elbow at shoulder height, and maintain a tall spine with only slight backward tilt.",
      instruction: "Begin shifting your weight forward as your hips rotate open while your shoulders stay closed, creating torque as your throwing arm forms a clean L-shape behind your head.",
      approximateDuration: "0.20-0.30 sec",
      metrics: [
        { name: "Weight Distribution", min: 0, max: 10, unit: "percent", note: "Energy moves forward" },
        { name: "Back Knee Flexion", min: 150, max: 165, unit: "degrees", note: "Drive from back leg" },
        { name: "Lead Knee Flexion", min: 140, max: 160, unit: "degrees", note: "Prepare to brace" },
        { name: "Spine Angle", min: -5, max: 5, unit: "degrees", note: "Tall with control" },
        { name: "Hip Rotation", min: 30, max: 45, unit: "degrees open", note: "Hips lead power" },
        { name: "Shoulder Rotation", min: 5, max: 15, unit: "degrees open", note: "Delay shoulders" },
        { name: "Hip-Shoulder Separation", min: 30, max: 45, unit: "degrees", note: "Peak dynamic torque window" },
        { name: "Throwing Elbow Flexion", min: 85, max: 100, unit: "degrees", note: "Strong L-shape" },
        { name: "Throwing Elbow Height", min: -5, max: 5, unit: "degrees from shoulder level", note: "Protect shoulder" },
        { name: "Non-Throwing Elbow Extension", min: 30, max: 70, unit: "degrees", note: "Pull torso through" }
      ]
    },
    {
      name: "Acceleration / Release",
      cueText: "Square the hips before the shoulders, rotate the shoulders aggressively, drive the throwing elbow along the target line, extend through the target, snap the wrist downward, and release just before full elbow extension.",
      instruction: "Drive your hips square to lead your shoulders, then whip your elbow forward in a straight line and extend your arm through the target as you release the ball.",
      approximateDuration: "0.15-0.25 sec",
      metrics: [
        { name: "Weight Distribution", min: 20, max: 40, unit: "percent on lead foot", note: "Finish into throw" },
        { name: "Lead Knee Extension", min: 150, max: 180, unit: "degrees", note: "Dynamic brace from 150 degrees toward 170-180 degrees" },
        { name: "Back Knee Extension", min: 150, max: 180, unit: "degrees", note: "Dynamic drive from 150 degrees toward 170-180 degrees" },
        { name: "Spine Angle", min: 0, max: 10, unit: "degrees", note: "No collapse" },
        { name: "Hip Rotation", min: 45, max: 60, unit: "degrees", note: "Hips finish first" },
        { name: "Shoulder Rotation", min: 45, max: 60, unit: "degrees", note: "Shoulders whip" },
        { name: "Throwing Elbow Extension", min: 90, max: 180, unit: "degrees", note: "Dynamic extension toward 170-180 degrees; elbow leads hand" },
        { name: "Throwing Elbow Alignment", min: -5, max: 5, unit: "degrees from target line", note: "Throw straight" },
        { name: "Non-Throwing Elbow Flexion", min: 40, max: 90, unit: "degrees", note: "Pull torso through" },
        { name: "Wrist Flexion", min: 20, max: 40, unit: "degrees", note: "Tight spiral" }
      ]
    },
    {
      name: "Follow-Through",
      cueText: "Let the arm decelerate naturally across the body with the palm down, rotate the shoulders and back hip fully through, lean slightly forward, and finish with weight on the front foot.",
      instruction: "Let your arm naturally follow through across your body with your palm down as your shoulders and hips rotate fully, finishing your weight on the front foot with a relaxed forward lean.",
      approximateDuration: "0.30-0.45 sec",
      metrics: [
        { name: "Weight Distribution", min: 60, max: 80, unit: "percent on lead foot", note: "Complete transfer" },
        { name: "Lead Knee Extension", min: 170, max: 180, unit: "degrees", note: "Stable finish" },
        { name: "Back Knee Flexion", min: 150, max: 170, unit: "degrees", note: "Trail release" },
        { name: "Spine Angle", min: 5, max: 15, unit: "degrees forward", note: "Natural deceleration" },
        { name: "Shoulder Rotation", min: 60, max: 90, unit: "degrees", note: "Full rotation" },
        { name: "Throwing Elbow Extension", min: 170, max: 180, unit: "degrees", note: "Full release" },
        { name: "Non-Throwing Elbow Flexion", min: 30, max: 70, unit: "degrees", note: "Absorb rotation" }
      ]
    }
  ]
};

const footballPuntReference: ProfessionalReference = {
  motionName: "Punt",
  category: "sports",
  subcategory: "football",
  source: "Punting Biomechanics Research",
  verificationLevel: "unverified",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 45, optimalRange: { min: 35, max: 55 }, unit: "degrees", description: "Hip rotation during kicking motion" },
    { name: "Knee Flexion", professionalAverage: 130, optimalRange: { min: 115, max: 145 }, unit: "degrees", description: "Kicking leg knee extension at contact" },
    { name: "Spine Extension", professionalAverage: 15, optimalRange: { min: 8, max: 22 }, unit: "degrees", description: "Trunk lean at ball contact" },
    { name: "Foot Positioning", professionalAverage: 50, optimalRange: { min: 40, max: 60 }, unit: "degrees", description: "Plant foot angle relative to target" },
    { name: "Weight Transfer", professionalAverage: 75, optimalRange: { min: 65, max: 85 }, unit: "percent", description: "Weight shift to plant foot at contact" }
  ]
};

const footballFieldGoalReference: ProfessionalReference = {
  motionName: "Field Goal",
  category: "sports",
  subcategory: "football",
  source: "Placekicking Biomechanics",
  verificationLevel: "unverified",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 40, optimalRange: { min: 30, max: 50 }, unit: "degrees", description: "Hip rotation during approach" },
    { name: "Knee Flexion", professionalAverage: 140, optimalRange: { min: 125, max: 155 }, unit: "degrees", description: "Kicking leg extension at contact" },
    { name: "Spine Extension", professionalAverage: 12, optimalRange: { min: 5, max: 20 }, unit: "degrees", description: "Trunk lean at ball contact" },
    { name: "Foot Positioning", professionalAverage: 55, optimalRange: { min: 45, max: 65 }, unit: "degrees", description: "Plant foot positioning" },
    { name: "Weight Transfer", professionalAverage: 80, optimalRange: { min: 70, max: 90 }, unit: "percent", description: "Weight on plant foot at contact" }
  ]
};

// ============================================================
// SPORTS — BASKETBALL
// ============================================================

export const jumpShotReference: ProfessionalReference = {
  motionName: "Jump Shot",
  category: "sports",
  subcategory: "basketball",
  source: "Basketball Shooting Mechanics Analysis (Multi-Phase Model)",
  verificationLevel: "research-verified",
  metrics: [
    { name: "Elbow Flexion", professionalAverage: 95, optimalRange: { min: 60, max: 180 }, unit: "degrees", description: "Shooting elbow angle across the full shot" },
    { name: "Knee Flexion", professionalAverage: 135, optimalRange: { min: 90, max: 178 }, unit: "degrees", description: "Knee flexion through dip and extension" },
    { name: "Shoulder External Rotation", professionalAverage: 15, optimalRange: { min: 5, max: 25 }, unit: "degrees", description: "Mild open stance maintained throughout" },
    { name: "Spine Extension", professionalAverage: 8, optimalRange: { min: 0, max: 15 }, unit: "degrees", description: "Natural forward lean during dip" },
    { name: "Weight Transfer", professionalAverage: 10, optimalRange: { min: 0, max: 20 }, unit: "percent", description: "Centered to slight forward bias" },
    { name: "Foot Positioning", professionalAverage: 30, optimalRange: { min: 15, max: 45 }, unit: "degrees", description: "Shoulder-width stance with shooting foot slightly ahead" }
  ],
  phases: [
    {
      name: "Ready Pocket / Stance",
      cueText: "Start the ball in a true lower-to-mid-chest shooting pocket with both hands aligned, a comfortably bent shooting elbow, a tall or slightly forward spine, soft knees, centered weight, and the hips and ball connected.",
      instruction: "Start in a relaxed chest-level pocket with your elbow softly bent and your spine tall so your body feels connected and ready to flow smoothly into your dip.",
      approximateDuration: "Within 0.9-1.2 sec total motion",
      metrics: [
        { name: "Shooting Elbow Flexion", min: 60, max: 80, unit: "degrees", note: "True chest pocket" },
        { name: "Off-Hand Elbow Flexion", min: 60, max: 90, unit: "degrees", note: "Can be slightly looser than shooting elbow" },
        { name: "Shooting Knee Flexion", min: 160, max: 175, unit: "degrees", note: "Soft, athletic bend" },
        { name: "Non-Shooting Knee Flexion", min: 160, max: 175, unit: "degrees", note: "Should closely match shooting knee" },
        { name: "Shoulder Rotation", min: 5, max: 20, unit: "degrees", note: "Mild open stance toward shooting side" },
        { name: "Spine Lean", min: 0, max: 10, unit: "degrees", note: "Tall or slight forward lean" },
        { name: "Weight Transfer", min: -10, max: 10, unit: "percent", note: "Centered over both feet" },
        { name: "Elbow Height Index", min: 30, max: 50, unit: "index (0-100)", note: "Elbow at lower-mid chest level" }
      ]
    },
    {
      name: "Dip / Load",
      cueText: "Drop the hips and ball together to the lower chest or upper stomach, let the elbows extend only slightly, maintain a smooth rhythm, lean the spine naturally forward, bend both knees, and keep balance near center.",
      instruction: "Lower into your dip by dropping your hips and letting the ball move with them down to your lower chest or stomach, keeping a natural forward lean 15-20 degrees and elbows only slightly extended as everything stays connected.",
      approximateDuration: "Within 0.9-1.2 sec total motion",
      metrics: [
        { name: "Shooting Elbow Flexion", min: 80, max: 100, unit: "degrees", note: "Slight extension from pocket, never straight" },
        { name: "Off-Hand Elbow Flexion", min: 80, max: 110, unit: "degrees", note: "Can extend slightly more than shooting elbow" },
        { name: "Shooting Knee Flexion", min: 90, max: 120, unit: "degrees", note: "Strong loading bend" },
        { name: "Non-Shooting Knee Flexion", min: 90, max: 120, unit: "degrees", note: "Should be similar to shooting knee" },
        { name: "Shoulder Rotation", min: 10, max: 25, unit: "degrees", note: "Stable open stance" },
        { name: "Spine Lean", min: 10, max: 25, unit: "degrees", note: "Ideal lean is 15-20 degrees" },
        { name: "Weight Transfer", min: -10, max: 20, unit: "percent", note: "Slight front or shooting-side bias is acceptable" },
        { name: "Elbow Height Index", min: 20, max: 40, unit: "index (0-100)", note: "Elbow and ball around lower chest to upper stomach" },
        { name: "Hip-Ball Synch Score", min: 0.8, max: 1, unit: "score (0-1)", note: "Hip center and ball or wrist vertical motion are tightly synchronized" }
      ]
    },
    {
      name: "Rise to Set Point",
      cueText: "Drive straight up through the floor as the hips and ball rise together, bring the spine back toward vertical, slide the shooting elbow under the ball into a compact L-shape, and reach an upper-chest to forehead set point in one continuous flow.",
      instruction: "As you drive up, push through the floor so your body rises straight up. Drive up so your hips and the ball rise together into a strong set point near your forehead, lifting your chest back toward center and sliding your shooting elbow under the ball into a clean L-shape.",
      approximateDuration: "Within 0.9-1.2 sec total motion",
      metrics: [
        { name: "Shooting Elbow Flexion", min: 80, max: 110, unit: "degrees", note: "True compact L-shape pocket" },
        { name: "Off-Hand Elbow Flexion", min: 80, max: 120, unit: "degrees", note: "Supportive guide hand, slightly looser" },
        { name: "Shooting Knee Flexion", min: 120, max: 160, unit: "degrees", note: "Extending out of dip, not yet fully straight" },
        { name: "Non-Shooting Knee Flexion", min: 120, max: 160, unit: "degrees", note: "Should track shooting knee closely" },
        { name: "Shoulder Rotation", min: 10, max: 25, unit: "degrees", note: "Open stance maintained" },
        { name: "Spine Lean", min: 0, max: 10, unit: "degrees", note: "Chest returns toward vertical" },
        { name: "Weight Transfer", min: -10, max: 20, unit: "percent", note: "Mostly centered with a mild front bias" },
        { name: "Elbow Height Index", min: 50, max: 70, unit: "index (0-100)", note: "Elbow and ball around upper chest level" },
        { name: "Hip-Ball Synch Score", min: 0.8, max: 1, unit: "score (0-1)", note: "Hips and ball rise in sync" }
      ]
    },
    {
      name: "Release",
      cueText: "Release just before the top of the jump with nearly straight but unlocked legs, a fully extending shooting arm, a separating guide hand, an upright spine, a high release, and a relaxed wrist snap.",
      instruction: "Release the ball as you near the top of your jump, extending through your legs and shooting arm while keeping your spine tall so the ball flows out of the same smooth upward motion. Finish with a relaxed, high follow-through, wrist snapping down toward the rim.",
      approximateDuration: "Within 0.9-1.2 sec total motion",
      metrics: [
        { name: "Shooting Elbow Flexion", min: 160, max: 180, unit: "degrees", note: "Almost fully extended at release" },
        { name: "Off-Hand Elbow Flexion", min: 140, max: 180, unit: "degrees", note: "Guide hand releases and relaxes" },
        { name: "Shooting Knee Flexion", min: 150, max: 178, unit: "degrees", note: "Nearly straight without hyperextension" },
        { name: "Non-Shooting Knee Flexion", min: 150, max: 178, unit: "degrees", note: "Similar to shooting knee" },
        { name: "Shoulder Rotation", min: 10, max: 25, unit: "degrees", note: "No sudden twist" },
        { name: "Spine Lean", min: 0, max: 5, unit: "degrees", note: "Very upright at release" },
        { name: "Weight Transfer", min: -5, max: 20, unit: "percent", note: "Slight forward bias is acceptable" },
        { name: "Elbow Height Index", min: 70, max: 90, unit: "index (0-100)", note: "Elbow at chin-to-eye level with a high release point above the head" }
      ]
    },
    {
      name: "Flight, Landing & Follow-Through",
      cueText: "Hold the follow-through briefly with fingers toward the rim, land softly near the takeoff point with both knees absorbing force, and return to a balanced stance ready for the next play.",
      instruction: "Hold your follow-through with your fingers pointing at the rim, land softly near where you took off, and settle into a balanced stance so you're ready to move on the next play.",
      approximateDuration: "Within 0.9-1.2 sec total motion",
      metrics: [
        { name: "Shooting Elbow Flexion", min: 30, max: 180, unit: "degrees", note: "Begins at 160-180 degrees with fingers toward the rim, then relaxes to a 30-60 degree gooseneck" },
        { name: "Off-Hand Elbow Flexion", min: 60, max: 120, unit: "degrees", note: "Off-hand fully free and relaxed" },
        { name: "Shooting Knee Flexion", min: 110, max: 150, unit: "degrees", note: "Absorbing landing" },
        { name: "Non-Shooting Knee Flexion", min: 110, max: 150, unit: "degrees", note: "Similar absorption on both legs" },
        { name: "Shoulder Rotation", min: 5, max: 20, unit: "degrees", note: "Returns to a comfortable open stance" },
        { name: "Spine Lean", min: 0, max: 10, unit: "degrees", note: "Returns to mostly vertical" },
        { name: "Weight Transfer", min: -10, max: 10, unit: "percent", note: "Re-centered over both feet" }
      ]
    }
  ]
};

const basketballFreeThrowReference: ProfessionalReference = {
  ...jumpShotReference,
  motionName: "Free Throw",
  source: "Free Throw Mechanics Study",
  verificationLevel: "unverified",
  metrics: [
    { name: "Elbow Flexion", professionalAverage: 90, optimalRange: { min: 70, max: 170 }, unit: "degrees", description: "Shooting elbow angle" },
    { name: "Knee Flexion", professionalAverage: 140, optimalRange: { min: 100, max: 175 }, unit: "degrees", description: "Knee bend during set and release" },
    { name: "Spine Extension", professionalAverage: 5, optimalRange: { min: 0, max: 12 }, unit: "degrees", description: "Minimal trunk lean" },
    { name: "Weight Transfer", professionalAverage: 8, optimalRange: { min: 0, max: 18 }, unit: "percent", description: "Slight forward bias" },
    { name: "Foot Positioning", professionalAverage: 25, optimalRange: { min: 15, max: 40 }, unit: "degrees", description: "Comfortable stance width" }
  ],
  phases: [
    {
      name: "Set / Alignment",
      cueText: "Establish balance, alignment, and rhythm before motion begins.",
      instruction: "Stand relaxed and balanced at the line. The shooting hand is under the ball, guide hand on the side. Knees are soft, spine tall, eyes locked on the rim. No tension yet - this is a calm setup.",
      approximateDuration: "0.6-1.0 sec",
      metrics: [
        { name: "Weight Distribution", min: -5, max: 5, unit: "percent", note: "Balanced base" },
        { name: "Lead Knee Flexion", min: 150, max: 170, unit: "degrees", note: "Soft knees" },
        { name: "Back Knee Flexion", min: 150, max: 170, unit: "degrees", note: "Even stance" },
        { name: "Spine Angle", min: 0, max: 10, unit: "degrees", note: "Tall posture" },
        { name: "Hip Rotation", min: 0, max: 5, unit: "degrees", note: "Square hips" },
        { name: "Shoulder Rotation", min: 0, max: 5, unit: "degrees", note: "Square shoulders" },
        { name: "Shooting Elbow Flexion", min: 80, max: 100, unit: "degrees", note: "Ball supported" },
        { name: "Guide Elbow Flexion", min: 90, max: 120, unit: "degrees", note: "Gentle support" }
      ]
    },
    {
      name: "Dip / Load",
      cueText: "Load the legs and synchronize the ball and body.",
      instruction: "The knees and hips bend smoothly as the ball lowers slightly with the body. The torso stays upright. The shooting elbow remains under the ball while the guide hand stays passive.",
      approximateDuration: "0.6-1.0 sec",
      metrics: [
        { name: "Weight Distribution", min: 0, max: 10, unit: "percent", note: "Stay centered" },
        { name: "Lead Knee Flexion", min: 95, max: 150, unit: "degrees", note: "Dynamic load from about 150 degrees to 95-115 degrees" },
        { name: "Back Knee Flexion", min: 95, max: 150, unit: "degrees", note: "Dynamic even dip matching the lead knee" },
        { name: "Hip Flexion", min: 10, max: 25, unit: "degrees", note: "Controlled sit" },
        { name: "Spine Angle", min: 10, max: 20, unit: "degrees", note: "Slight lean only" },
        { name: "Shooting Elbow Flexion", min: 80, max: 100, unit: "degrees", note: "Compact pocket" },
        { name: "Guide Elbow Flexion", min: 90, max: 110, unit: "degrees", note: "Quiet guide" }
      ]
    },
    {
      name: "Rise / Upward Flow",
      cueText: "Transfer energy upward smoothly without breaking rhythm.",
      instruction: "As the legs extend, the ball rises with the body. The spine returns to vertical. The shooting elbow stays under the ball, forming a clean L-shape. No pause - this is one continuous motion.",
      approximateDuration: "0.5-0.8 sec",
      metrics: [
        { name: "Weight Distribution", min: 10, max: 20, unit: "percent", note: "Move upward" },
        { name: "Lead Knee Extension", min: 95, max: 180, unit: "degrees", note: "Dynamic leg drive from 95-115 degrees to 170-180 degrees" },
        { name: "Back Knee Extension", min: 95, max: 180, unit: "degrees", note: "Dynamic balanced rise matching the lead knee" },
        { name: "Hip Extension", min: 25, max: 180, unit: "degrees", note: "Dynamic extension toward 170-180 degrees; stand tall" },
        { name: "Spine Angle", min: 0, max: 20, unit: "degrees", note: "Dynamic return from 15-20 degrees to vertical" },
        { name: "Shooting Elbow Flexion", min: 80, max: 90, unit: "degrees", note: "Ready to release" },
        { name: "Guide Elbow Flexion", min: 90, max: 110, unit: "degrees", note: "Still passive" }
      ]
    },
    {
      name: "Release",
      cueText: "The supplied source defines this phase's timing but does not provide release cue text.",
      instruction: "The supplied source does not provide an instruction sentence for this phase.",
      approximateDuration: "0.15-0.25 sec",
      metrics: []
    },
    {
      name: "Hold / Follow-Through",
      cueText: "Stabilize and confirm shot mechanics.",
      instruction: "Hold the follow-through. Shooting arm stays extended, wrist relaxed. Body remains still and balanced until the ball reaches the rim.",
      approximateDuration: "0.5-0.9 sec",
      metrics: [
        { name: "Weight Distribution", min: 30, max: 40, unit: "percent", note: "Stable finish" },
        { name: "Shooting Elbow Extension", min: 170, max: 180, unit: "degrees", note: "Full follow-through" },
        { name: "Guide Elbow Flexion", min: 100, max: 130, unit: "degrees", note: "Relaxed release" },
        { name: "Shoulder Elevation", min: 160, max: 180, unit: "degrees", note: "Arm stays high" },
        { name: "Spine Angle", min: 0, max: 5, unit: "degrees", note: "Still and centered" },
        { name: "Hold Duration", min: 0.5, max: 0.9, unit: "seconds", note: "Discipline and consistency" }
      ]
    }
  ]
};

const basketballLayupReference: ProfessionalReference = {
  motionName: "Layup",
  category: "sports",
  subcategory: "basketball",
  source: "Basketball Layup Mechanics",
  verificationLevel: "unverified",
  metrics: [
    { name: "Knee Flexion", professionalAverage: 110, optimalRange: { min: 85, max: 140 }, unit: "degrees", description: "Takeoff leg knee bend" },
    { name: "Hip Rotation", professionalAverage: 25, optimalRange: { min: 15, max: 35 }, unit: "degrees", description: "Hip rotation during approach" },
    { name: "Elbow Flexion", professionalAverage: 100, optimalRange: { min: 80, max: 130 }, unit: "degrees", description: "Shooting arm elbow angle" },
    { name: "Spine Extension", professionalAverage: 10, optimalRange: { min: 0, max: 20 }, unit: "degrees", description: "Trunk lean during takeoff" },
    { name: "Weight Transfer", professionalAverage: 65, optimalRange: { min: 50, max: 80 }, unit: "percent", description: "Forward momentum at takeoff" }
  ]
};

const basketballDribblingReference: ProfessionalReference = {
  motionName: "Dribbling",
  category: "sports",
  subcategory: "basketball",
  source: "Ball Handling Mechanics",
  verificationLevel: "unverified",
  metrics: [
    { name: "Knee Flexion", professionalAverage: 130, optimalRange: { min: 110, max: 150 }, unit: "degrees", description: "Athletic stance knee bend" },
    { name: "Hip Rotation", professionalAverage: 15, optimalRange: { min: 5, max: 25 }, unit: "degrees", description: "Hip rotation during crossover" },
    { name: "Spine Extension", professionalAverage: 15, optimalRange: { min: 8, max: 25 }, unit: "degrees", description: "Forward lean in athletic stance" },
    { name: "Elbow Flexion", professionalAverage: 90, optimalRange: { min: 60, max: 120 }, unit: "degrees", description: "Dribbling arm elbow angle" },
    { name: "Weight Transfer", professionalAverage: 50, optimalRange: { min: 35, max: 65 }, unit: "percent", description: "Weight distribution during dribble" }
  ]
};

// ============================================================
// SPORTS — BASEBALL
// ============================================================

const baseballFastballReference: ProfessionalReference = {
  motionName: "Fastball",
  category: "sports",
  subcategory: "baseball",
  source: "MLB Pitching Biomechanics Research",
  verificationLevel: "unverified",
  metrics: [
    { name: "Shoulder External Rotation", professionalAverage: 170, optimalRange: { min: 155, max: 185 }, unit: "degrees", description: "Maximum shoulder external rotation at late cocking" },
    { name: "Elbow Flexion", professionalAverage: 95, optimalRange: { min: 80, max: 110 }, unit: "degrees", description: "Elbow angle at max external rotation" },
    { name: "Hip Rotation", professionalAverage: 55, optimalRange: { min: 45, max: 65 }, unit: "degrees", description: "Hip rotation at foot contact" },
    { name: "Spine Extension", professionalAverage: 20, optimalRange: { min: 12, max: 28 }, unit: "degrees", description: "Trunk tilt at ball release" },
    { name: "Knee Flexion", professionalAverage: 45, optimalRange: { min: 35, max: 60 }, unit: "degrees", description: "Stride leg knee flexion at foot contact" },
    { name: "Weight Transfer", professionalAverage: 75, optimalRange: { min: 65, max: 85 }, unit: "percent", description: "Weight on stride leg at release" }
  ]
};

const baseballCurveballReference: ProfessionalReference = { ...baseballFastballReference, motionName: "Curveball", source: "Breaking Ball Mechanics" };
const baseballSliderReference: ProfessionalReference = { ...baseballFastballReference, motionName: "Slider", source: "Slider Mechanics" };
const baseballKnuckleballReference: ProfessionalReference = { ...baseballFastballReference, motionName: "Knuckleball", source: "Knuckleball Mechanics" };

const baseballBattingReference: ProfessionalReference = {
  motionName: "Batting Swing",
  category: "sports",
  subcategory: "baseball",
  source: "MLB Hitting Mechanics Research",
  verificationLevel: "unverified",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 70, optimalRange: { min: 55, max: 85 }, unit: "degrees", description: "Hip rotation during swing" },
    { name: "Elbow Flexion", professionalAverage: 105, optimalRange: { min: 90, max: 120 }, unit: "degrees", description: "Lead arm elbow angle at contact" },
    { name: "Knee Flexion", professionalAverage: 130, optimalRange: { min: 115, max: 145 }, unit: "degrees", description: "Back leg knee bend at load" },
    { name: "Spine Extension", professionalAverage: 18, optimalRange: { min: 10, max: 25 }, unit: "degrees", description: "Trunk tilt at contact" },
    { name: "Weight Transfer", professionalAverage: 70, optimalRange: { min: 60, max: 80 }, unit: "percent", description: "Weight to front leg at contact" }
  ]
};

// ============================================================
// SPORTS — TENNIS
// ============================================================

const tennisForehandReference: ProfessionalReference = {
  motionName: "Forehand",
  category: "sports",
  subcategory: "tennis",
  source: "ATP Forehand Biomechanics",
  verificationLevel: "unverified",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 55, optimalRange: { min: 40, max: 70 }, unit: "degrees", description: "Hip rotation during stroke" },
    { name: "Shoulder External Rotation", professionalAverage: 90, optimalRange: { min: 75, max: 105 }, unit: "degrees", description: "Shoulder rotation at backswing" },
    { name: "Elbow Flexion", professionalAverage: 110, optimalRange: { min: 95, max: 130 }, unit: "degrees", description: "Elbow angle at contact" },
    { name: "Knee Flexion", professionalAverage: 135, optimalRange: { min: 120, max: 150 }, unit: "degrees", description: "Knee bend during load" },
    { name: "Spine Extension", professionalAverage: 12, optimalRange: { min: 5, max: 20 }, unit: "degrees", description: "Trunk rotation and lean" },
    { name: "Weight Transfer", professionalAverage: 65, optimalRange: { min: 55, max: 75 }, unit: "percent", description: "Weight to front foot at contact" }
  ]
};

const tennisBackhandReference: ProfessionalReference = { ...tennisForehandReference, motionName: "Backhand", source: "ATP Backhand Biomechanics" };

const tennisServeReference: ProfessionalReference = {
  motionName: "Serve",
  category: "sports",
  subcategory: "tennis",
  source: "ATP Serve Biomechanics",
  verificationLevel: "unverified",
  metrics: [
    { name: "Shoulder External Rotation", professionalAverage: 160, optimalRange: { min: 145, max: 175 }, unit: "degrees", description: "Maximum shoulder rotation in trophy position" },
    { name: "Elbow Flexion", professionalAverage: 100, optimalRange: { min: 85, max: 115 }, unit: "degrees", description: "Elbow angle at trophy position" },
    { name: "Hip Rotation", professionalAverage: 45, optimalRange: { min: 35, max: 55 }, unit: "degrees", description: "Hip rotation during serve" },
    { name: "Knee Flexion", professionalAverage: 120, optimalRange: { min: 100, max: 140 }, unit: "degrees", description: "Knee bend during loading" },
    { name: "Spine Extension", professionalAverage: 25, optimalRange: { min: 15, max: 35 }, unit: "degrees", description: "Back arch at trophy position" },
    { name: "Weight Transfer", professionalAverage: 70, optimalRange: { min: 60, max: 80 }, unit: "percent", description: "Weight transfer into court" }
  ]
};

// ============================================================
// SPORTS — GOLF
// ============================================================

const golfDriverReference: ProfessionalReference = {
  motionName: "Driver Swing",
  category: "sports",
  subcategory: "golf",
  source: "PGA Tour Swing Analysis",
  verificationLevel: "unverified",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 55, optimalRange: { min: 45, max: 65 }, unit: "degrees", description: "Hip rotation at impact" },
    { name: "Shoulder External Rotation", professionalAverage: 90, optimalRange: { min: 75, max: 105 }, unit: "degrees", description: "Shoulder turn at top of backswing" },
    { name: "Knee Flexion", professionalAverage: 140, optimalRange: { min: 125, max: 155 }, unit: "degrees", description: "Lead knee flexion at impact" },
    { name: "Spine Extension", professionalAverage: 30, optimalRange: { min: 20, max: 40 }, unit: "degrees", description: "Spine tilt at address and through impact" },
    { name: "Weight Transfer", professionalAverage: 80, optimalRange: { min: 70, max: 90 }, unit: "percent", description: "Weight to front foot at impact" },
    { name: "Foot Positioning", professionalAverage: 35, optimalRange: { min: 25, max: 45 }, unit: "degrees", description: "Stance width and foot flare" }
  ]
};

const golfIronReference: ProfessionalReference = { ...golfDriverReference, motionName: "Iron Shot", source: "Iron Play Biomechanics" };

const golfPuttingReference: ProfessionalReference = {
  motionName: "Putting",
  category: "sports",
  subcategory: "golf",
  source: "Putting Stroke Analysis",
  verificationLevel: "unverified",
  metrics: [
    { name: "Spine Extension", professionalAverage: 25, optimalRange: { min: 18, max: 35 }, unit: "degrees", description: "Forward bend at address" },
    { name: "Knee Flexion", professionalAverage: 155, optimalRange: { min: 140, max: 170 }, unit: "degrees", description: "Slight knee flex for stability" },
    { name: "Elbow Flexion", professionalAverage: 160, optimalRange: { min: 145, max: 175 }, unit: "degrees", description: "Near-straight arms in pendulum" },
    { name: "Hip Rotation", professionalAverage: 5, optimalRange: { min: 0, max: 10 }, unit: "degrees", description: "Minimal hip movement" },
    { name: "Weight Transfer", professionalAverage: 55, optimalRange: { min: 45, max: 65 }, unit: "percent", description: "Slight forward press" }
  ]
};

// ============================================================
// SPORTS — SOCCER
// ============================================================

const soccerPowerShotReference: ProfessionalReference = {
  motionName: "Power Shot",
  category: "sports",
  subcategory: "soccer",
  source: "Soccer Shooting Biomechanics",
  verificationLevel: "unverified",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 50, optimalRange: { min: 40, max: 60 }, unit: "degrees", description: "Hip rotation during kicking" },
    { name: "Knee Flexion", professionalAverage: 135, optimalRange: { min: 120, max: 155 }, unit: "degrees", description: "Kicking leg knee extension at contact" },
    { name: "Spine Extension", professionalAverage: 15, optimalRange: { min: 8, max: 22 }, unit: "degrees", description: "Trunk lean at contact" },
    { name: "Foot Positioning", professionalAverage: 50, optimalRange: { min: 40, max: 60 }, unit: "degrees", description: "Plant foot angle" },
    { name: "Weight Transfer", professionalAverage: 75, optimalRange: { min: 65, max: 85 }, unit: "percent", description: "Weight on plant foot" }
  ]
};

const soccerPassingReference: ProfessionalReference = {
  ...soccerPowerShotReference,
  motionName: "Passing",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 35, optimalRange: { min: 25, max: 45 }, unit: "degrees", description: "Hip rotation during pass" },
    { name: "Knee Flexion", professionalAverage: 140, optimalRange: { min: 125, max: 155 }, unit: "degrees", description: "Passing leg knee angle" },
    { name: "Spine Extension", professionalAverage: 10, optimalRange: { min: 3, max: 18 }, unit: "degrees", description: "Upright posture during pass" },
    { name: "Foot Positioning", professionalAverage: 40, optimalRange: { min: 30, max: 50 }, unit: "degrees", description: "Plant foot positioning" },
    { name: "Weight Transfer", professionalAverage: 60, optimalRange: { min: 50, max: 70 }, unit: "percent", description: "Weight distribution" }
  ]
};

// ============================================================
// SPORTS — ARCHERY
// ============================================================

const archeryStanceReference: ProfessionalReference = {
  motionName: "Stance",
  category: "sports",
  subcategory: "archery",
  source: "Olympic Archery Biomechanics",
  verificationLevel: "unverified",
  metrics: [
    { name: "Spine Extension", professionalAverage: 2, optimalRange: { min: 0, max: 5 }, unit: "degrees", description: "Perfectly upright posture" },
    { name: "Knee Flexion", professionalAverage: 170, optimalRange: { min: 160, max: 180 }, unit: "degrees", description: "Nearly straight legs" },
    { name: "Hip Rotation", professionalAverage: 5, optimalRange: { min: 0, max: 10 }, unit: "degrees", description: "Square to target" },
    { name: "Foot Positioning", professionalAverage: 30, optimalRange: { min: 20, max: 40 }, unit: "degrees", description: "Shoulder-width stance" },
    { name: "Weight Transfer", professionalAverage: 50, optimalRange: { min: 45, max: 55 }, unit: "percent", description: "Even weight distribution" }
  ]
};

const archeryDrawReference: ProfessionalReference = {
  motionName: "Draw",
  category: "sports",
  subcategory: "archery",
  source: "Olympic Archery Biomechanics",
  verificationLevel: "unverified",
  metrics: [
    { name: "Shoulder External Rotation", professionalAverage: 90, optimalRange: { min: 80, max: 100 }, unit: "degrees", description: "Drawing arm shoulder position" },
    { name: "Elbow Flexion", professionalAverage: 45, optimalRange: { min: 35, max: 55 }, unit: "degrees", description: "Drawing arm elbow angle at anchor" },
    { name: "Spine Extension", professionalAverage: 2, optimalRange: { min: 0, max: 5 }, unit: "degrees", description: "Upright posture maintained" },
    { name: "Hip Rotation", professionalAverage: 3, optimalRange: { min: 0, max: 8 }, unit: "degrees", description: "Minimal hip movement" },
    { name: "Weight Transfer", professionalAverage: 50, optimalRange: { min: 45, max: 55 }, unit: "percent", description: "Centered balance" }
  ]
};

// Future phase migration correction: use an arrow release velocity of
// 175-215 fps (53-65 m/s), not the source document's 200-230 fps range.
const archeryReleaseReference: ProfessionalReference = { ...archeryDrawReference, motionName: "Release", source: "Archery Release Mechanics" };

// ============================================================
// SPORTS — TRACK & FIELD
// ============================================================

const trackSprintStartReference: ProfessionalReference = {
  motionName: "Sprint Start",
  category: "sports",
  subcategory: "track-field",
  source: "Sprint Biomechanics Research",
  verificationLevel: "unverified",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 35, optimalRange: { min: 25, max: 45 }, unit: "degrees", description: "Hip extension at drive phase" },
    { name: "Knee Flexion", professionalAverage: 90, optimalRange: { min: 75, max: 110 }, unit: "degrees", description: "Front leg knee angle in blocks" },
    { name: "Spine Extension", professionalAverage: 45, optimalRange: { min: 35, max: 55 }, unit: "degrees", description: "Forward lean at first step" },
    { name: "Weight Transfer", professionalAverage: 80, optimalRange: { min: 70, max: 90 }, unit: "percent", description: "Weight forward at push-off" }
  ]
};

const trackLongJumpReference: ProfessionalReference = {
  motionName: "Long Jump",
  category: "sports",
  subcategory: "track-field",
  source: "Long Jump Biomechanics",
  verificationLevel: "unverified",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 40, optimalRange: { min: 30, max: 50 }, unit: "degrees", description: "Hip extension at takeoff" },
    { name: "Knee Flexion", professionalAverage: 155, optimalRange: { min: 140, max: 170 }, unit: "degrees", description: "Takeoff leg extension" },
    { name: "Spine Extension", professionalAverage: 10, optimalRange: { min: 3, max: 18 }, unit: "degrees", description: "Trunk position at takeoff" },
    { name: "Weight Transfer", professionalAverage: 85, optimalRange: { min: 75, max: 95 }, unit: "percent", description: "Forward momentum at board" }
  ]
};

const trackHighJumpReference: ProfessionalReference = {
  motionName: "High Jump",
  category: "sports",
  subcategory: "track-field",
  source: "High Jump Biomechanics",
  verificationLevel: "unverified",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 35, optimalRange: { min: 25, max: 45 }, unit: "degrees", description: "Hip rotation during curve approach" },
    { name: "Knee Flexion", professionalAverage: 145, optimalRange: { min: 130, max: 160 }, unit: "degrees", description: "Takeoff leg extension" },
    { name: "Spine Extension", professionalAverage: 20, optimalRange: { min: 12, max: 30 }, unit: "degrees", description: "Back arch over bar" },
    { name: "Weight Transfer", professionalAverage: 80, optimalRange: { min: 70, max: 90 }, unit: "percent", description: "Vertical force at takeoff" }
  ]
};

const trackShotPutReference: ProfessionalReference = {
  motionName: "Shot Put",
  category: "sports",
  subcategory: "track-field",
  source: "Shot Put Biomechanics",
  verificationLevel: "unverified",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 65, optimalRange: { min: 50, max: 80 }, unit: "degrees", description: "Hip rotation during delivery" },
    { name: "Elbow Flexion", professionalAverage: 95, optimalRange: { min: 80, max: 110 }, unit: "degrees", description: "Putting arm elbow angle" },
    { name: "Knee Flexion", professionalAverage: 130, optimalRange: { min: 115, max: 145 }, unit: "degrees", description: "Power position knee bend" },
    { name: "Spine Extension", professionalAverage: 25, optimalRange: { min: 15, max: 35 }, unit: "degrees", description: "Trunk extension at release" },
    { name: "Weight Transfer", professionalAverage: 75, optimalRange: { min: 65, max: 85 }, unit: "percent", description: "Weight to front foot" }
  ]
};

const trackDiscusReference: ProfessionalReference = {
  motionName: "Discus",
  category: "sports",
  subcategory: "track-field",
  source: "Discus Throw Biomechanics",
  verificationLevel: "unverified",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 70, optimalRange: { min: 55, max: 85 }, unit: "degrees", description: "Hip rotation during delivery" },
    { name: "Shoulder External Rotation", professionalAverage: 100, optimalRange: { min: 85, max: 115 }, unit: "degrees", description: "Shoulder separation from hips" },
    { name: "Knee Flexion", professionalAverage: 130, optimalRange: { min: 115, max: 145 }, unit: "degrees", description: "Power position knee bend" },
    { name: "Spine Extension", professionalAverage: 20, optimalRange: { min: 12, max: 28 }, unit: "degrees", description: "Trunk lean at release" },
    { name: "Weight Transfer", professionalAverage: 75, optimalRange: { min: 65, max: 85 }, unit: "percent", description: "Weight shift to front" }
  ]
};

const trackJavelinReference: ProfessionalReference = {
  motionName: "Javelin",
  category: "sports",
  subcategory: "track-field",
  source: "Javelin Throw Biomechanics",
  verificationLevel: "unverified",
  metrics: [
    { name: "Shoulder External Rotation", professionalAverage: 150, optimalRange: { min: 135, max: 165 }, unit: "degrees", description: "Shoulder rotation at release" },
    { name: "Hip Rotation", professionalAverage: 55, optimalRange: { min: 45, max: 65 }, unit: "degrees", description: "Hip rotation during delivery" },
    { name: "Elbow Flexion", professionalAverage: 160, optimalRange: { min: 145, max: 175 }, unit: "degrees", description: "Near-straight arm at release" },
    { name: "Knee Flexion", professionalAverage: 140, optimalRange: { min: 125, max: 155 }, unit: "degrees", description: "Block leg extension" },
    { name: "Spine Extension", professionalAverage: 25, optimalRange: { min: 15, max: 35 }, unit: "degrees", description: "Trunk extension at release" },
    { name: "Weight Transfer", professionalAverage: 80, optimalRange: { min: 70, max: 90 }, unit: "percent", description: "Weight to block leg" }
  ]
};

const trackPoleVaultReference: ProfessionalReference = {
  motionName: "Pole Vault",
  category: "sports",
  subcategory: "track-field",
  source: "Pole Vault Biomechanics",
  verificationLevel: "unverified",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 30, optimalRange: { min: 20, max: 40 }, unit: "degrees", description: "Hip drive during takeoff" },
    { name: "Knee Flexion", professionalAverage: 150, optimalRange: { min: 135, max: 165 }, unit: "degrees", description: "Takeoff leg extension" },
    { name: "Spine Extension", professionalAverage: 15, optimalRange: { min: 8, max: 22 }, unit: "degrees", description: "Trunk position at plant" },
    { name: "Elbow Flexion", professionalAverage: 170, optimalRange: { min: 155, max: 180 }, unit: "degrees", description: "Top arm nearly straight" },
    { name: "Weight Transfer", professionalAverage: 85, optimalRange: { min: 75, max: 95 }, unit: "percent", description: "Forward momentum at plant" }
  ]
};

const trackHurdlesReference: ProfessionalReference = {
  motionName: "Hurdles",
  category: "sports",
  subcategory: "track-field",
  source: "Hurdle Biomechanics",
  verificationLevel: "unverified",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 35, optimalRange: { min: 25, max: 45 }, unit: "degrees", description: "Hip rotation over hurdle" },
    { name: "Knee Flexion", professionalAverage: 155, optimalRange: { min: 140, max: 170 }, unit: "degrees", description: "Lead leg extension" },
    { name: "Spine Extension", professionalAverage: 20, optimalRange: { min: 12, max: 28 }, unit: "degrees", description: "Forward lean over hurdle" },
    { name: "Weight Transfer", professionalAverage: 80, optimalRange: { min: 70, max: 90 }, unit: "percent", description: "Forward momentum" }
  ]
};

// ============================================================
// WEIGHTLIFTING — POWERLIFTING
// ============================================================

const powerliftingSquatReference: ProfessionalReference = {
  motionName: "Back Squat",
  category: "weightlifting",
  subcategory: "powerlifting",
  source: alignedMetricsSource,
  verificationLevel: "research-verified",
  metrics: [
    { name: "Knee Flexion", professionalAverage: 85, optimalRange: { min: 70, max: 100 }, unit: "degrees", description: "Interior knee angle at parallel or just below" },
    { name: "Hip Flexion", professionalAverage: 80, optimalRange: { min: 60, max: 100 }, unit: "degrees", description: "Interior hip angle at the bottom position" },
    { name: "Spine Lean", professionalAverage: 25, optimalRange: { min: 15, max: 35 }, unit: "degrees", description: "Forward torso angle from vertical at depth" },
    { name: "Weight Transfer", professionalAverage: -10, optimalRange: { min: -20, max: 0 }, unit: "percent", description: "Mid-foot to heel pressure at depth" },
    { name: "Foot Angle", professionalAverage: 12.5, optimalRange: { min: 5, max: 20 }, unit: "degrees", description: "Toe-out angle in the setup" }
  ],
  phases: [
    referencePhase("Setup / Unrack", "Bar on upper traps; grip evenly; elbows slightly down and back; feet shoulder-width; toes 5-20 degrees out; spine tall; weight at mid-foot; shoulders level.", "Stand tall with the bar on your upper traps, your feet set evenly, your spine upright, and your shoulders level before stepping back into position.", "Within 2.5-4.0 seconds per rep", [
      ["Left Knee Flexion", 160, 175, "degrees", "Light athletic bend"], ["Hip Flexion", 160, 180, "degrees", "Near full extension"], ["Shoulder Height", -5, 5, "degrees difference", "Level shoulders"], ["Spine Lean", 0, 10, "degrees", "Upright posture"], ["Weight Transfer", -10, 10, "percent", "Mid-foot balance"], ["Foot Angle", 5, 20, "degrees", "Toes outward"],
    ]),
    referencePhase("Descent", "Break hips and knees together; keep the chest open; lean forward gradually; track knees over toes; stay from mid-foot to heel; keep shoulders level.", "Sit down and slightly back by bending your hips and knees together, keeping your chest open, shoulders level, and your weight centered through mid-foot to heel as you descend.", "Within 2.5-4.0 seconds per rep", [
      ["Knee Flexion", 90, 120, "degrees", "Smooth bend going down"], ["Left Hip Flexion", 80, 110, "degrees", "Increasing bend; symmetry is important"], ["Shoulder Height", -5, 5, "degrees difference", "Avoid tilt and keep the bar path stable"], ["Spine Lean", 10, 30, "degrees", "Gradual forward lean"], ["Weight Transfer", -20, 0, "percent", "Toward heels but not entirely on heels"],
    ]),
    referencePhase("Bottom Position", "Reach parallel or below; keep knees aligned with toes; maintain a neutral spine; stay at mid-foot to heel; keep shoulders level.", "Reach the bottom with your hips at or below knee level, your chest up, your spine neutral, your weight in the mid-foot to heel, and your shoulders square.", "Within 2.5-4.0 seconds per rep", [
      ["Knee Flexion", 70, 100, "degrees", "Parallel or just below; 100 degrees or more is above parallel"], ["Hip Flexion", 60, 100, "degrees", "Depends on torso length and stance; symmetry matters"], ["Shoulder Height", -5, 5, "degrees difference", "Detects lateral lean"], ["Spine Lean", 15, 35, "degrees", "Forward lean is acceptable without rounding"], ["Weight Transfer", -20, 0, "percent", "Mid-foot toward heel"], ["Knee Valgus Index", -5, 5, "degrees", "Knees tracking over toes"],
    ]),
    referencePhase("Ascent", "Drive straight up; raise chest and hips together; track knees over toes; stay at mid-foot to heel; keep shoulders level.", "Drive upward through your mid-foot so your chest and hips rise together, your knees track over your toes, and your shoulders stay level.", "Within 2.5-4.0 seconds per rep", [
      ["Knee Flexion", 90, 160, "degrees", "Extending from the bottom"], ["Hip Flexion", 80, 160, "degrees", "Hip extending"], ["Shoulder Height", -5, 5, "degrees difference", "Detects early rotation or lateral shift"], ["Spine Lean", 10, 20, "degrees", "Uprighting from the bottom"], ["Weight Transfer", -20, 5, "percent", "Should not shift toward the toes"],
    ]),
    referencePhase("Lockout / Reset", "Stand tall with hips and knees extended; return the spine upright; re-center over mid-foot; keep shoulders level; prepare for the next rep.", "Stand tall with your hips and knees straight, your spine upright, and your shoulders level as you re-center your weight over mid-foot.", "Within 2.5-4.0 seconds per rep", [
      ["Knee Flexion", 170, 180, "degrees", "Full extension"], ["Hip Flexion", 170, 180, "degrees", "Standing tall"], ["Shoulder Height", -5, 5, "degrees difference", "Level shoulders"], ["Spine Lean", 0, 10, "degrees", "Upright"], ["Weight Transfer", -10, 10, "percent", "Re-centered over mid-foot"],
    ]),
  ]
};

const powerliftingFrontSquatReference: ProfessionalReference = {
  motionName: "Front Squat",
  category: "weightlifting",
  subcategory: "powerlifting",
  source: alignedMetricsSource,
  verificationLevel: "coaching-standard",
  metrics: [
    { name: "Knee Flexion", professionalAverage: 95, optimalRange: { min: 80, max: 110 }, unit: "degrees", description: "Interior knee angle at bottom depth" },
    { name: "Hip Flexion", professionalAverage: 110, optimalRange: { min: 90, max: 130 }, unit: "degrees", description: "Upright bottom-position hip angle" },
    { name: "Spine Lean", professionalAverage: 17.5, optimalRange: { min: 10, max: 25 }, unit: "degrees", description: "Forward lean from vertical at depth" },
    { name: "Elbow Height Index", professionalAverage: 70, optimalRange: { min: 50, max: 90 }, unit: "index", description: "Elbows remain high in the rack" },
    { name: "Weight Transfer", professionalAverage: 5, optimalRange: { min: 0, max: 10 }, unit: "percent", description: "Mid-foot to slight toe bias" }
  ],
  phases: [
    referencePhase("Setup / Unrack", "Feet shoulder-width; toes slightly out; bar on front deltoids; loose fingertip grip; elbows high; chest tall; core braced.", "Stand with the bar resting on your shoulders, lift your elbows high, keep your chest tall, and brace your core before stepping back into position.", "Within 2.4-3.7 seconds per rep", [
      ["Knee Flexion", 160, 175, "degrees", "Soft setup knees"], ["Hip Flexion", 160, 180, "degrees", "Near full extension"], ["Spine Lean", 0, 10, "degrees", "Upright"], ["Elbow Height Index", 70, 100, "index", "Elbows high"], ["Weight Transfer", -5, 10, "percent", "Balanced"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
    referencePhase("Descent", "Sit straight down; track knees forward and outward; keep elbows high; maintain an open chest and neutral spine; stay at mid-foot with a slight toe bias.", "Descend by sitting straight down with your chest tall and elbows high, letting your knees track forward as you keep the weight centered over your mid-foot.", "Within 2.4-3.7 seconds per rep", [
      ["Knee Flexion", 90, 120, "degrees", "Controlled descent"], ["Hip Flexion", 110, 150, "degrees", "More upright than a back squat"], ["Spine Lean", 5, 20, "degrees", "Limited forward lean"], ["Elbow Height Index", 60, 100, "index", "Should not drop drastically"], ["Weight Transfer", 0, 10, "percent", "Slightly more forward than a back squat"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
    referencePhase("Bottom Position", "Reach parallel or below; keep chest and elbows high; maintain a neutral spine; keep the bar on the shoulders; align knees over toes.", "At the bottom, keep your elbows high, your chest lifted, and the bar stacked over the middle of your foot without letting your spine round.", "Within 2.4-3.7 seconds per rep", [
      ["Knee Flexion", 80, 110, "degrees", "Bottom depth"], ["Hip Flexion", 90, 130, "degrees", "Upright bottom position"], ["Spine Lean", 10, 25, "degrees", "More indicates compensation"], ["Elbow Height Index", 50, 90, "index", "Must remain high"], ["Weight Transfer", 0, 10, "percent", "Mid-foot to slight toe bias"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
    referencePhase("Ascent", "Drive straight up; keep elbows high; raise chest and hips together; push knees outward; maintain a vertical bar path over mid-foot.", "Drive upward by lifting your chest and elbows at the same time, keeping the bar over your mid-foot and preventing your hips from rising faster than your torso.", "Within 2.4-3.7 seconds per rep", [
      ["Knee Flexion", 80, 180, "degrees", "Dynamic extension from bottom to full standing"], ["Hip Flexion", 110, 170, "degrees", "Extending toward standing"], ["Spine Lean", 5, 20, "degrees", "Upright throughout"], ["Elbow Height Index", 60, 100, "index", "Elbows stay high"], ["Weight Transfer", 0, 10, "percent", "Centered"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
    referencePhase("Lockout / Reset", "Stand tall with knees and hips extended; keep elbows high until reracking; hold an upright chest; center the weight; rebrace.", "Finish by standing tall with your core braced, your elbows still high, and the bar stable on your shoulders before resetting for the next rep.", "Within 2.4-3.7 seconds per rep", [
      ["Knee Flexion", 170, 180, "degrees", "Full extension"], ["Hip Flexion", 170, 180, "degrees", "Full extension"], ["Spine Lean", 0, 10, "degrees", "Upright"], ["Elbow Height Index", 70, 100, "index", "Elbows high"], ["Weight Transfer", -5, 10, "percent", "Centered"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
  ]
};

const powerliftingDeadliftReference: ProfessionalReference = {
  motionName: "Conventional Deadlift",
  category: "weightlifting",
  subcategory: "powerlifting",
  source: alignedMetricsSource,
  verificationLevel: "research-verified",
  metrics: [
    { name: "Knee Flexion", professionalAverage: 140, optimalRange: { min: 130, max: 150 }, unit: "degrees", description: "Moderate setup bend with shins angled to the bar" },
    { name: "Hip Flexion", professionalAverage: 80, optimalRange: { min: 60, max: 100 }, unit: "degrees", description: "Strong setup hinge" },
    { name: "Spine Lean", professionalAverage: 35, optimalRange: { min: 25, max: 45 }, unit: "degrees", description: "Forward torso angle without rounding" },
    { name: "Spine Neutrality Index", professionalAverage: 0, optimalRange: { min: -5, max: 5 }, unit: "degrees", description: "Deviation from neutral spine" },
    { name: "Weight Transfer", professionalAverage: -10, optimalRange: { min: -20, max: 0 }, unit: "percent", description: "Mid-foot to heel pressure" }
  ],
  phases: [
    referencePhase("Setup / Starting Position", "Feet hip-width; toes slightly out; bar over mid-foot; hips back; chest open; shoulders slightly in front of bar; arms straight; spine neutral; weight mid-foot to heel.", "Set your feet under the bar and hinge your hips back as you reach down, keeping your spine neutral, chest open, and the bar directly over your mid-foot.", "Within 1.5-3.0 seconds per rep", [
      ["Knee Flexion", 130, 150, "degrees", "Moderate knee bend; shins angled to the bar"], ["Hip Flexion", 60, 100, "degrees", "Strong hip hinge"], ["Spine Lean", 25, 45, "degrees", "Forward torso angle without rounding"], ["Spine Neutrality Index", -5, 5, "degrees", "No rounding or overextension"], ["Shoulder Height Symmetry", -5, 5, "degrees", "Level shoulders"], ["Weight Transfer", -20, 0, "percent", "Slight heel bias"],
    ]),
    referencePhase("Initial Pull", "Push the floor away; move the bar vertically; raise hips and shoulders together; keep the spine neutral; keep the bar close to the shins.", "Push the floor away as the bar breaks off the ground, keeping your hips and shoulders rising together and the bar close to your shins.", "Within 1.5-3.0 seconds per rep", [
      ["Knee Flexion", 120, 160, "degrees", "Legs begin extending"], ["Hip Flexion", 60, 120, "degrees", "Hips rise with chest"], ["Spine Lean", 20, 40, "degrees", "Forward lean reduces gradually"], ["Spine Neutrality Index", -5, 5, "degrees", "No lumbar rounding"], ["Shoulder Height Symmetry", -5, 5, "degrees", "No tilt"], ["Weight Transfer", -20, 0, "percent", "Mid-foot to heel"],
    ]),
    referencePhase("Mid-Thigh Ascent", "Extend the hips as the chest rises; keep the bar close to the thighs; move shoulders upward; avoid backward lean or early lockout; keep a neutral spine.", "Keep extending your hips and knees as the bar moves past your knees, maintaining a neutral spine and keeping the bar close to your body.", "Within 1.5-3.0 seconds per rep", [
      ["Knee Flexion", 120, 170, "degrees", "Extending toward standing"], ["Hip Flexion", 100, 160, "degrees", "Hips extending"], ["Spine Lean", 10, 25, "degrees", "Torso becomes more upright"], ["Spine Neutrality Index", -5, 5, "degrees", "No rounding"], ["Shoulder Height Symmetry", -5, 5, "degrees", "Shoulders stay level"], ["Weight Transfer", -20, 5, "percent", "No shift to toes"],
    ]),
    referencePhase("Lockout", "Stand tall with hips and knees fully extended; keep the bar over mid-foot; place shoulders only slightly behind the bar; keep a tall neutral spine.", "Stand tall at the top with your hips and knees fully extended, your spine neutral, and the bar directly over your mid-foot.", "Within 1.5-3.0 seconds per rep", [
      ["Knee Flexion", 170, 180, "degrees", "Full extension"], ["Hip Flexion", 170, 180, "degrees", "Hips fully extended"], ["Spine Lean", 0, 10, "degrees", "Upright"], ["Spine Neutrality Index", -5, 5, "degrees", "No hyperextension"], ["Shoulder Height Symmetry", -5, 5, "degrees", "Level shoulders"], ["Weight Transfer", -10, 10, "percent", "Centered"],
    ]),
    referencePhase("Descent / Reset", "Push the hips back first; keep the bar close; bend knees after the hips clear; maintain a neutral spine and level shoulders; stay mid-foot to heel.", "Push your hips back first to guide the bar down your thighs, then bend your knees to return the bar to the floor while maintaining a neutral spine.", "Within 1.5-3.0 seconds per rep", [
      ["Knee Flexion", 120, 160, "degrees", "Knees bend after the hip hinge"], ["Hip Flexion", 60, 120, "degrees", "Strong hinge back down"], ["Spine Lean", 20, 45, "degrees", "Increasing forward angle without rounding"], ["Spine Neutrality Index", -5, 5, "degrees", "Neutral spine maintained"], ["Shoulder Height Symmetry", -5, 5, "degrees", "Detects asymmetry or bar drift"], ["Weight Transfer", -20, 0, "percent", "Heels or mid-foot"],
    ]),
  ]
};

const powerliftingSumoDeadliftReference: ProfessionalReference = {
  motionName: "Sumo Deadlift",
  category: "weightlifting",
  subcategory: "powerlifting",
  source: alignedMetricsSource,
  verificationLevel: "research-verified",
  metrics: [
    { name: "Knee Flexion", professionalAverage: 117.5, optimalRange: { min: 100, max: 135 }, unit: "degrees", description: "Deep sumo setup knee angle" },
    { name: "Hip Flexion", professionalAverage: 100, optimalRange: { min: 80, max: 120 }, unit: "degrees", description: "More upright setup hip angle" },
    { name: "Spine Lean", professionalAverage: 17.5, optimalRange: { min: 10, max: 25 }, unit: "degrees", description: "Upright setup torso angle" },
    { name: "Hip Width Index", professionalAverage: 190, optimalRange: { min: 160, max: 220 }, unit: "percent", description: "Stance relative to shoulder width" },
    { name: "Elbow Flexion", professionalAverage: 175, optimalRange: { min: 170, max: 180 }, unit: "degrees", description: "Straight arms" },
    { name: "Weight Transfer", professionalAverage: -10, optimalRange: { min: -15, max: -5 }, unit: "percent", description: "Slight heel bias" }
  ],
  phases: [
    referencePhase("Setup / Stance", "Wide stance; toes 30-45 degrees out; shins vertical and close to bar; hips lower than conventional without squatting; chest tall; arms straight inside knees; wedge into bar.", "Take a wide stance with your toes out, lower your hips until your chest rises tall, wedge yourself into the bar, and keep your arms straight inside your knees before initiating the pull.", "Within 1.4-2.4 seconds per rep", [
      ["Knee Flexion", 100, 135, "degrees", "Deep sumo knee bend"], ["Hip Flexion", 80, 120, "degrees", "More upright than conventional"], ["Spine Lean", 10, 25, "degrees", "Tall torso"], ["Hip Width Index", 160, 220, "percent", "Wide stance"], ["Elbow Flexion", 170, 180, "degrees", "Arms fully straight"], ["Weight Transfer", -15, -5, "percent", "Slight heel bias"], ["Shoulder Symmetry", -5, 5, "degrees", "Balanced shoulders"],
    ]),
    referencePhase("Wedge / Pre-Pull", "Pull slack from the bar; lift the chest as hips settle; push knees outward; engage lats; maintain vertical shins.", "Pull the slack out of the bar by lifting your chest and pushing your knees outward while keeping your lats tight and your shins vertical.", "Within 1.4-2.4 seconds per rep", [
      ["Knee Flexion", 95, 130, "degrees", "Knees remain deep with outward pressure"], ["Hip Flexion", 80, 110, "degrees", "Stable upright hinge"], ["Spine Lean", 10, 20, "degrees", "Neutral spine"], ["Hip Width Index", 160, 220, "percent", "Wide stance maintained"], ["Elbow Flexion", 170, 180, "degrees", "No arm bend"], ["Weight Transfer", -15, -5, "percent", "Pressure through heels"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
    referencePhase("Initial Pull", "Spread the floor; open the knees; keep the bar against the shins; raise hips and chest together; do not let hips shoot up.", "Drive the floor apart with your feet as your chest and hips rise together, keeping the bar tight against your shins without letting your hips shoot upward.", "Within 1.4-2.4 seconds per rep", [
      ["Knee Flexion", 90, 120, "degrees", "Knees remain engaged"], ["Hip Flexion", 70, 100, "degrees", "Torso rises gradually"], ["Spine Lean", 10, 25, "degrees", "Upright relative to conventional"], ["Hip Width Index", 160, 220, "percent", "Wide stance maintained"], ["Elbow Flexion", 170, 180, "degrees", "Arms stay straight"], ["Weight Transfer", -15, -5, "percent", "Heel dominant"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
    referencePhase("Mid Pull", "Drive hips forward; keep spreading the floor; maintain a vertical bar path; raise the torso to neutral; lead with the chest; keep arms straight.", "As the bar passes your knees, drive your hips forward while keeping the bar close, your chest tall, and your arms straight as you rise to standing.", "Within 1.4-2.4 seconds per rep", [
      ["Knee Flexion", 120, 170, "degrees", "Extending toward lockout"], ["Hip Flexion", 90, 160, "degrees", "Hips extend vertically"], ["Spine Lean", 5, 15, "degrees", "Very upright"], ["Hip Width Index", 160, 220, "percent", "Wide stance maintained"], ["Elbow Flexion", 170, 180, "degrees", "No biceps pull"], ["Weight Transfer", -5, 0, "percent", "Moves toward mid-foot"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
    referencePhase("Lockout / Reset", "Stand tall with hips and knees extended; shoulders over hips; arms straight and relaxed; bar close; brace before lowering.", "Finish tall with your hips and knees extended, your chest up, your arms straight, and the bar close to your body before lowering it under control.", "Within 1.4-2.4 seconds per rep", [
      ["Knee Flexion", 170, 180, "degrees", "Full extension"], ["Hip Flexion", 170, 180, "degrees", "Hips extended"], ["Spine Lean", 0, 10, "degrees", "Upright"], ["Hip Width Index", 160, 220, "percent", "Wide stance maintained"], ["Elbow Flexion", 170, 180, "degrees", "Arms straight"], ["Weight Transfer", -5, 5, "percent", "Balanced standing"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
  ]
};

const powerliftingBenchReference: ProfessionalReference = {
  motionName: "Bench Press",
  category: "weightlifting",
  subcategory: "powerlifting",
  source: alignedMetricsSource,
  verificationLevel: "research-verified",
  metrics: [
    { name: "Elbow Flexion", professionalAverage: 90, optimalRange: { min: 70, max: 110 }, unit: "degrees", description: "Interior elbow angle during descent" },
    { name: "Shoulder Abduction", professionalAverage: 45, optimalRange: { min: 30, max: 60 }, unit: "degrees", description: "Upper-arm angle from torso" },
    { name: "Wrist Stacking", professionalAverage: 0, optimalRange: { min: -5, max: 5 }, unit: "degrees", description: "Vertical wrist-to-elbow alignment" },
    { name: "Hip Elevation", professionalAverage: 1, optimalRange: { min: 0, max: 2 }, unit: "cm", description: "Hips remain on the bench" },
    { name: "Foot Contact", professionalAverage: 90, optimalRange: { min: 80, max: 100 }, unit: "percent", description: "Feet remain planted" }
  ],
  phases: [
    referencePhase("Setup", "Eyes under bar; feet planted; hips on bench; shoulder blades squeezed; ribcage slightly lifted; grip even and under 1.5 times bi-acromial width; wrists stacked.", "Lie with your eyes under the bar, plant your feet firmly, squeeze your shoulders together, lift your chest slightly, and keep your hips on the bench before unracking.", "Within 1.5-3.0 seconds per rep", [
      ["Elbow Flexion", 160, 180, "degrees", "Arms nearly straight"], ["Wrist Stacking", -5, 5, "degrees", "Vertical alignment"], ["Hip Elevation", 0, 2, "cm", "Hips stay down"], ["Foot Contact", 80, 100, "percent", "Feet planted"], ["Shoulder Symmetry", -5, 5, "degrees", "Shoulders level"],
    ]),
    referencePhase("Unrack / Start Position", "Press the bar up; pull it horizontally over the shoulders; lock shoulders into the bench; keep feet planted and hips down; stack wrists over elbows.", "Unrack by pressing the bar up and pulling it into position over your shoulders while keeping your feet planted, your hips down, and your shoulders tight to the bench.", "Within 1.5-3.0 seconds per rep", [
      ["Elbow Flexion", 160, 180, "degrees", "Arms extended"], ["Wrist Stacking", -5, 5, "degrees", "Vertical alignment"], ["Hip Elevation", 0, 2, "cm", "Hips stay down"], ["Foot Contact", 80, 100, "percent", "Feet planted"], ["Shoulder Symmetry", -5, 5, "degrees", "Shoulders level"],
    ]),
    referencePhase("Descent", "Lower under control toward the lower chest; keep elbows tucked, wrists neutral, shoulders pinned, hips down, feet planted, and grip under 1.5 times bi-acromial width.", "Lower the bar smoothly toward your lower chest with your elbows tucked, your shoulders locked to the bench, and your hips and feet firmly planted.", "Within 1.5-3.0 seconds per rep", [
      ["Elbow Flexion", 70, 110, "degrees", "Controlled lowering"], ["Wrist Stacking", -5, 5, "degrees", "Wrists remain stacked"], ["Hip Elevation", 0, 2, "cm", "Hips stay down"], ["Foot Contact", 80, 100, "percent", "Feet planted"], ["Shoulder Symmetry", -5, 5, "degrees", "Shoulders level"], ["Shoulder Abduction", 30, 60, "degrees", "Upper arm angle from torso; above 75 degrees sharply increases shoulder loading; keep constant through the rep"],
    ]),
    referencePhase("Press / Ascent", "Press upward and slightly back; drive feet down without lifting hips; keep wrists stacked and elbows under the bar; hold chest up; pin shoulders; keep grip under 1.5 times bi-acromial width.", "Press the bar upward and slightly back toward your shoulders, driving through your feet while keeping your hips down, your elbows under the bar, and your wrists stacked.", "Within 1.5-3.0 seconds per rep", [
      ["Elbow Flexion", 110, 160, "degrees", "Pressing upward"], ["Wrist Stacking", -5, 5, "degrees", "Wrists remain stacked"], ["Hip Elevation", 0, 2, "cm", "Hips stay down"], ["Foot Contact", 80, 100, "percent", "Feet planted"], ["Shoulder Symmetry", -5, 5, "degrees", "Shoulders level"], ["Shoulder Abduction", 30, 60, "degrees", "Upper arm angle from torso; above 75 degrees sharply increases shoulder loading; keep constant through the rep"],
    ]),
    referencePhase("Lockout / Reset", "Fully extend arms over shoulders; keep feet and hips still; pin shoulders; keep the ribcage elevated with a stable spine; maintain grip under 1.5 times bi-acromial width.", "Finish each rep with your arms locked out over your shoulders, your hips on the bench, your shoulders tight, and your feet planted before starting the next rep.", "Within 1.5-3.0 seconds per rep", [
      ["Elbow Flexion", 160, 180, "degrees", "Full extension"], ["Wrist Stacking", -5, 5, "degrees", "Wrists remain stacked"], ["Hip Elevation", 0, 2, "cm", "Hips stay down"], ["Foot Contact", 80, 100, "percent", "Feet planted"], ["Shoulder Symmetry", -5, 5, "degrees", "Shoulders level"], ["Shoulder Abduction", 30, 60, "degrees", "Upper arm angle from torso; above 75 degrees sharply increases shoulder loading; keep constant through the rep"],
    ]),
  ]
};

const powerliftingInclineBenchReference: ProfessionalReference = {
  motionName: "Incline Bench Press",
  category: "weightlifting",
  subcategory: "powerlifting",
  source: alignedMetricsSource,
  verificationLevel: "research-verified",
  metrics: [
    { name: "Elbow Flexion", professionalAverage: 90, optimalRange: { min: 70, max: 110 }, unit: "degrees", description: "Interior elbow angle during descent" },
    { name: "Wrist Stacking", professionalAverage: 0, optimalRange: { min: -5, max: 5 }, unit: "degrees", description: "Bar stacked over wrist" },
    { name: "Hip Elevation", professionalAverage: 1, optimalRange: { min: 0, max: 2 }, unit: "cm", description: "Hips remain down" },
    { name: "Foot Contact", professionalAverage: 90, optimalRange: { min: 80, max: 100 }, unit: "percent", description: "Stable planted feet" },
    { name: "Shoulder Symmetry", professionalAverage: 0, optimalRange: { min: -5, max: 5 }, unit: "degrees", description: "Level shoulders" }
  ],
  phases: [
    referencePhase("Setup / Positioning", "Set the bench to roughly 30 degrees; steeper than 45 degrees shifts work from the chest to the front delts. Place eyes just below the bar; plant feet; pin the upper back; grip slightly wider than shoulders; stack wrists; angle elbows about 45 degrees down.", "Set the bench to roughly 30 degrees, then lie back with your eyes slightly below the bar, plant your feet, drive your upper back into the bench, and grip the bar with your wrists stacked and elbows angled down at about 45 degrees; avoid settings steeper than 45 degrees.", "Within 2.2-3.6 seconds per rep", [
      ["Elbow Flexion", 160, 180, "degrees", "Arms nearly straight"], ["Wrist Stacking", -5, 5, "degrees", "Bar directly over wrist"], ["Hip Elevation", 0, 2, "cm", "Hips remain down"], ["Foot Contact", 80, 100, "percent", "Stable base"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
    referencePhase("Unrack / Start Position", "Press from the hooks; pull the bar horizontally above the upper chest; keep shoulders tight to the bench; keep hips and feet still.", "Unrack the bar and pull it into position above your upper chest while keeping your shoulders tight to the bench and your feet stable.", "Within 2.2-3.6 seconds per rep", [
      ["Elbow Flexion", 160, 180, "degrees", "Arms extended"], ["Wrist Stacking", -5, 5, "degrees", "Stacked wrists"], ["Hip Elevation", 0, 2, "cm", "Hips stay down"], ["Foot Contact", 80, 100, "percent", "Feet planted"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
    referencePhase("Descent", "Lower toward the upper chest or clavicle; hold elbows 35-55 degrees from the torso; keep wrists stacked and forearms vertical; pin the upper back; keep hips down; move smoothly.", "Lower the bar to your upper chest with your elbows angled 35-55 degrees, your wrists stacked, and your upper back tight to the bench while keeping your hips down.", "Within 2.2-3.6 seconds per rep", [
      ["Elbow Flexion", 70, 110, "degrees", "Controlled lowering"], ["Wrist Stacking", -5, 5, "degrees", "Forearms vertical"], ["Hip Elevation", 0, 2, "cm", "Hips stay down"], ["Foot Contact", 80, 100, "percent", "Feet planted"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
    referencePhase("Ascent / Press", "Drive the bar upward and slightly back; keep elbows under the bar and forearms vertical; pin shoulders; keep hips down; follow the incline path.", "Press the bar upward and slightly back toward your shoulder line, keeping your elbows under the bar, your shoulders tight to the bench, and your hips grounded.", "Within 2.2-3.6 seconds per rep", [
      ["Elbow Flexion", 110, 160, "degrees", "Pressing upward"], ["Wrist Stacking", -5, 5, "degrees", "Wrists remain stacked"], ["Hip Elevation", 0, 2, "cm", "Hips stay down"], ["Foot Contact", 80, 100, "percent", "Feet planted"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
    referencePhase("Lockout / Reset", "Lock elbows without hyperextension; finish above the shoulder line; keep shoulders pinned; hold feet and hips still; reset the breath.", "Lock the bar out above your shoulders with your elbows extended and your upper back tight before resetting for the next rep.", "Within 2.2-3.6 seconds per rep", [
      ["Elbow Flexion", 160, 180, "degrees", "Full extension"], ["Wrist Stacking", -5, 5, "degrees", "Wrists remain stacked"], ["Hip Elevation", 0, 2, "cm", "Hips stay down"], ["Foot Contact", 80, 100, "percent", "Feet planted"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
  ]
};

const powerliftingOverheadPressReference: ProfessionalReference = {
  motionName: "Overhead Press",
  category: "weightlifting",
  subcategory: "powerlifting",
  source: alignedMetricsSource,
  verificationLevel: "coaching-standard",
  metrics: [
    { name: "Shoulder External Rotation", professionalAverage: 90, optimalRange: { min: 75, max: 105 }, unit: "degrees", description: "Overhead lockout position" },
    { name: "Elbow Flexion", professionalAverage: 170, optimalRange: { min: 155, max: 180 }, unit: "degrees", description: "Full lockout" },
    { name: "Spine Extension", professionalAverage: 10, optimalRange: { min: 3, max: 18 }, unit: "degrees", description: "Slight lean back" },
    { name: "Hip Rotation", professionalAverage: 10, optimalRange: { min: 0, max: 20 }, unit: "degrees", description: "Hip push-through at lockout" },
    { name: "Knee Flexion", professionalAverage: 170, optimalRange: { min: 160, max: 180 }, unit: "degrees", description: "Straight legs at lockout" }
  ],
  phases: [
    referencePhase("Setup / Racked Position", "Feet hip-width; hands just outside shoulders; bar on upper chest; elbows slightly in front; wrists stacked; spine tall; ribs down; glutes tight.", "Stand tall with the bar on your upper chest, your elbows just in front of the bar, your wrists stacked, and your feet firm and balanced to create a strong pressing base.", "Within 1.6-2.8 seconds per rep", [
      ["Elbow Flexion", 70, 100, "degrees", "Front rack position"], ["Shoulder Angle", 40, 70, "degrees", "Arms forward"], ["Wrist Stacking", -5, 5, "degrees", "Wrists over elbows"], ["Spine Lean", -5, 5, "degrees", "Neutral"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"], ["Hip Elevation", 0, 2, "cm", "No dip"],
    ]),
    referencePhase("Initial Drive / Start of Press", "Press straight up; keep head neutral with a slight chin pullback; drive elbows under the bar; stack wrists; keep torso tall; keep feet planted.", "Begin pressing the bar straight up by driving your elbows under it, keeping your torso tall, your wrists stacked, and your head slightly back to let the bar travel upward.", "Within 1.6-2.8 seconds per rep", [
      ["Elbow Flexion", 100, 140, "degrees", "Pressing upward"], ["Shoulder Angle", 70, 120, "degrees", "Upper arms rising"], ["Wrist Stacking", -5, 5, "degrees", "Wrists stacked"], ["Spine Lean", -5, 10, "degrees", "Minimal lean"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"], ["Hip Elevation", 0, 2, "cm", "No knee dip"],
    ]),
    referencePhase("Mid-Press / Transition", "Clear the forehead; move the torso slightly under the bar; elevate and rotate shoulders upward; align elbows under the bar; stack wrists; keep spine stable.", "As the bar clears your head, continue pressing upward, letting your chest and torso move slightly under the bar while keeping your elbows stacked and your spine stable.", "Within 1.6-2.8 seconds per rep", [
      ["Elbow Flexion", 140, 160, "degrees", "Approaching lockout"], ["Shoulder Angle", 120, 160, "degrees", "Approaching overhead"], ["Wrist Stacking", -5, 5, "degrees", "Wrists stacked"], ["Spine Lean", 0, 10, "degrees", "Minimal backward lean"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"], ["Hip Elevation", 0, 2, "cm", "No dip"],
    ]),
    referencePhase("Lockout", "Fully extend arms overhead; avoid elbow hyperextension; stack bar over mid-foot; elevate shoulders; keep spine neutral; stabilize feet; keep ribs down.", "Finish with your arms locked out, the bar directly over your mid-foot, your shoulders elevated, and your torso tall without leaning back.", "Within 1.6-2.8 seconds per rep", [
      ["Elbow Flexion", 160, 180, "degrees", "Full extension"], ["Shoulder Angle", 170, 180, "degrees", "Fully overhead"], ["Wrist Stacking", -5, 5, "degrees", "Wrists stacked"], ["Spine Lean", -5, 10, "degrees", "Avoid backward lean"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"], ["Hip Elevation", 0, 2, "cm", "No dip"],
    ]),
    referencePhase("Descent / Reset", "Lower along the same straight path; move head slightly back; control elbows without flaring; stack wrists; keep torso tall; keep hips still.", "Lower the bar in a straight path back to your upper chest, keeping your elbows controlled, your wrists stacked, and your torso tall as you reset for the next rep.", "Within 1.6-2.8 seconds per rep", [
      ["Elbow Flexion", 70, 140, "degrees", "Descending"], ["Shoulder Angle", 40, 120, "degrees", "Arms lowering"], ["Wrist Stacking", -5, 5, "degrees", "Wrists stacked"], ["Spine Lean", -5, 10, "degrees", "Torso tall"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"], ["Hip Elevation", 0, 2, "cm", "No dip"],
    ]),
  ]
};

// ============================================================
// WEIGHTLIFTING — OLYMPIC LIFTING
// ============================================================

const olympicCleanJerkReference: ProfessionalReference = {
  motionName: "Clean & Jerk",
  category: "weightlifting",
  subcategory: "olympic-lifting",
  source: "Olympic Weightlifting Biomechanics",
  verificationLevel: "unverified",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 55, optimalRange: { min: 40, max: 70 }, unit: "degrees", description: "Hip extension during second pull" },
    { name: "Knee Flexion", professionalAverage: 90, optimalRange: { min: 70, max: 110 }, unit: "degrees", description: "Catch position knee angle" },
    { name: "Spine Extension", professionalAverage: 10, optimalRange: { min: 3, max: 18 }, unit: "degrees", description: "Upright torso in catch" },
    { name: "Elbow Flexion", professionalAverage: 90, optimalRange: { min: 70, max: 110 }, unit: "degrees", description: "Rack position elbows" },
    { name: "Weight Transfer", professionalAverage: 50, optimalRange: { min: 40, max: 60 }, unit: "percent", description: "Centered balance in catch" }
  ]
};

const olympicSnatchReference: ProfessionalReference = { ...olympicCleanJerkReference, motionName: "Snatch" };
const olympicHangCleanReference: ProfessionalReference = { ...olympicCleanJerkReference, motionName: "Hang Clean" };
const olympicPowerCleanReference: ProfessionalReference = { ...olympicCleanJerkReference, motionName: "Power Clean" };

// ============================================================
// WEIGHTLIFTING — KETTLEBELL
// ============================================================

const kettlebellSwingReference: ProfessionalReference = {
  motionName: "Kettlebell Swing",
  category: "weightlifting",
  subcategory: "kettlebell",
  source: alignedMetricsSource,
  verificationLevel: "research-verified",
  metrics: [
    { name: "Hip Flexion", professionalAverage: 105, optimalRange: { min: 90, max: 120 }, unit: "degrees", description: "Interior hip angle in the hinge" },
    { name: "Knee Flexion", professionalAverage: 150, optimalRange: { min: 135, max: 165 }, unit: "degrees", description: "Hinge knee angle, not a squat" },
    { name: "Spine Angle", professionalAverage: 32.5, optimalRange: { min: 25, max: 40 }, unit: "degrees", description: "Neutral forward hinge from vertical" },
    { name: "Elbow Flexion", professionalAverage: 170, optimalRange: { min: 160, max: 180 }, unit: "degrees", description: "Straight hook-like arms" },
    { name: "Weight Transfer", professionalAverage: -15, optimalRange: { min: -20, max: -10 }, unit: "percent", description: "Heel-biased hinge pressure" }
  ],
  phases: [
    referencePhase("Start / Hike Position", "Feet just outside shoulder-width; bell 8-12 inches ahead; hinge without squatting; chest up; spine flat; shoulders packed; tip the bell toward you.", "Hinge at the hips with a flat spine, grip the kettlebell, and tip it toward you to prepare for a powerful hike through your legs.", "Within 0.8-1.2 seconds per cycle", [
      ["Hip Flexion", 90, 120, "degrees", "Deep hinge"], ["Knee Flexion", 135, 165, "degrees", "Hinge, not squat; some knee bend is correct. Below about 130 degrees with spine angle under 25 degrees indicates a squatted swing"], ["Spine Angle", 25, 40, "degrees", "Forward lean with neutral spine"], ["Elbow Flexion", 160, 180, "degrees", "Arms straight"], ["Bell Height Index", 0, 10, "index", "Bell below hips"], ["Weight Transfer", -20, -10, "percent", "Toward heels"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
    referencePhase("Hike / Load", "Hike the bell high between the thighs; keep lats tight; load the hips like a spring; preserve the hinge shape.", "Explosively hike the kettlebell high between your legs while keeping your lats tight and your hips loaded like a compressed spring.", "Within 0.8-1.2 seconds per cycle", [
      ["Hip Flexion", 90, 120, "degrees", "Deep hinge maintained"], ["Knee Flexion", 150, 170, "degrees", "Minimal knee bend"], ["Spine Angle", 25, 40, "degrees", "Neutral hinge"], ["Elbow Flexion", 160, 180, "degrees", "Straight arms"], ["Bell Height Index", -10, 0, "index", "Bell behind hips"], ["Weight Transfer", -20, -10, "percent", "Heels"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
    referencePhase("Hip Drive / Acceleration", "Snap hips forward; straighten knees quickly; project rather than lift the bell; use glutes and hamstrings; keep the spine neutral.", "Snap your hips forward explosively, projecting the kettlebell upward with your glutes while keeping your arms straight and your spine neutral.", "Within 0.8-1.2 seconds per cycle", [
      ["Hip Flexion", 120, 180, "degrees", "Rapid hip extension"], ["Knee Flexion", 170, 180, "degrees", "Knees straighten"], ["Spine Angle", 0, 10, "degrees", "Torso upright"], ["Elbow Flexion", 160, 180, "degrees", "No arm pull"], ["Bell Height Index", 30, 60, "index", "Rising from hip drive"], ["Weight Transfer", 0, 10, "percent", "Toward mid-foot"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
    referencePhase("Float", "Let momentum raise the bell; keep arms straight and shoulders packed; stand tall; stop at chest height.", "Allow the kettlebell to float up to chest height on its own momentum while keeping your arms straight and your torso tall.", "Within 0.8-1.2 seconds per cycle", [
      ["Hip Flexion", 175, 180, "degrees", "Standing tall"], ["Knee Flexion", 170, 180, "degrees", "Nearly straight"], ["Spine Angle", 0, 10, "degrees", "Upright"], ["Elbow Flexion", 160, 180, "degrees", "Straight arms"], ["Bell Height Index", 80, 100, "index", "Chest height"], ["Weight Transfer", 0, 5, "percent", "Centered"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
    referencePhase("Drop / Return", "Let the bell fall; hinge to meet it; keep chest proud and spine neutral; let the arms act as hooks.", "Let the kettlebell fall and hinge back to meet it, catching the momentum with a strong hip hinge and straight arms.", "Within 0.8-1.2 seconds per cycle", [
      ["Hip Flexion", 90, 120, "degrees", "Re-form the hinge"], ["Knee Flexion", 150, 170, "degrees", "Minimal bend"], ["Spine Angle", 25, 40, "degrees", "Neutral hinge"], ["Elbow Flexion", 160, 180, "degrees", "Arms act as hooks"], ["Bell Height Index", 0, 20, "index", "Descending"], ["Weight Transfer", -20, -10, "percent", "Shift back into hinge"], ["Shoulder Symmetry", -5, 5, "degrees", "Level shoulders"],
    ]),
  ]
};

const kettlebellSnatchReference: ProfessionalReference = {
  motionName: "Kettlebell Snatch",
  category: "weightlifting",
  subcategory: "kettlebell",
  source: alignedMetricsSource,
  verificationLevel: "coaching-standard",
  metrics: [
    { name: "Hip Flexion", professionalAverage: 150, optimalRange: { min: 120, max: 180 }, unit: "degrees", description: "Dynamic hip extension during acceleration" },
    { name: "Knee Flexion", professionalAverage: 175, optimalRange: { min: 170, max: 180 }, unit: "degrees", description: "Leg extension during acceleration and lockout" },
    { name: "Spine Angle", professionalAverage: 5, optimalRange: { min: 0, max: 10 }, unit: "degrees", description: "Upright torso at lockout" },
    { name: "Elbow Flexion", professionalAverage: 175, optimalRange: { min: 170, max: 180 }, unit: "degrees", description: "Straight overhead arm" },
    { name: "Shoulder Angle", professionalAverage: 175, optimalRange: { min: 170, max: 180 }, unit: "degrees", description: "Overhead lockout" }
  ],
  phases: [
    referencePhase("Setup / Hike Position", "Feet hip-width; bell one foot ahead; hinge with vertical shins; shoulders packed; spine neutral; working arm slightly inward; tip the bell.", "Hinge with a flat spine, grip the kettlebell, and tip it toward you so you can explosively hike it back between your legs.", "Within 0.8-1.3 seconds per cycle", [["Hip Flexion",90,120,"degrees","Deep hinge"],["Knee Flexion",150,170,"degrees","Slight bend, not a squat"],["Spine Angle",25,40,"degrees","Neutral forward lean"],["Elbow Flexion",160,180,"degrees","Arm straight"],["Bell Height Index",0,10,"index","Bell below hips"],["Weight Transfer",-20,-10,"percent","Heel emphasis"],["Shoulder Symmetry",-5,5,"degrees","Level shoulders"]]),
    referencePhase("Hike / Load", "Hike the bell high between the thighs; engage lats; keep the bell close; load the hips; preserve the hinge.", "Hike the kettlebell forcefully between your legs while keeping your lats tight and your hips loaded like a coiled spring.", "Within 0.8-1.3 seconds per cycle", [["Hip Flexion",90,120,"degrees","Hinge maintained"],["Knee Flexion",150,170,"degrees","Minimal bend"],["Spine Angle",25,40,"degrees","Neutral hinge"],["Elbow Flexion",160,180,"degrees","Arm stays long"],["Bell Height Index",-10,0,"index","Bell behind hips"],["Weight Transfer",-20,-10,"percent","Heel bias"],["Shoulder Symmetry",-5,5,"degrees","Level shoulders"]]),
    referencePhase("Acceleration Pull / Hip Drive", "Extend hips explosively; keep the arm relaxed; let the bell rise vertically; allow a slight high-pull elbow bend; finish tall without leaning back.", "Snap your hips forward explosively, letting the kettlebell rise from momentum while keeping your arm relaxed and allowing a natural high-pull bend.", "Within 0.8-1.3 seconds per cycle", [["Hip Flexion",120,180,"degrees","Rapid hip extension"],["Knee Flexion",170,180,"degrees","Knees straighten"],["Spine Angle",0,10,"degrees","Torso upright"],["Elbow Flexion",120,160,"degrees","High-pull bend"],["Bell Height Index",40,80,"index","Rising toward chest"],["Weight Transfer",0,10,"percent","Toward mid-foot"],["Shoulder Symmetry",-5,5,"degrees","Level shoulders"]]),
    referencePhase("Punch Through / Lockout", "Punch through the handle at chest height; rotate the forearm; settle the bell softly overhead; straighten the arm; keep bicep near ear and ribs down.", "As the kettlebell rises, punch your hand through the handle to let it settle softly overhead with your arm straight and your ribs down.", "Within 0.8-1.3 seconds per cycle", [["Hip Flexion",175,180,"degrees","Standing tall"],["Knee Flexion",170,180,"degrees","Standing tall"],["Spine Angle",0,10,"degrees","Neutral lockout"],["Elbow Flexion",170,180,"degrees","Arm straight"],["Shoulder Angle",120,180,"degrees","Dynamic rise to 170-180 degree overhead lockout"],["Bell Height Index",130,150,"index","Full overhead"],["Weight Transfer",0,5,"percent","Centered"],["Shoulder Symmetry",5,15,"degrees","Expected working-side offset"]]),
    referencePhase("Drop / Overspeed Return", "Guide the bell forward and down; keep its path close; time the hinge; preserve a neutral spine and open chest; lengthen the arm.", "Guide the kettlebell forward and let it fall, meeting it with a hinge to absorb the momentum while keeping your spine neutral and your arm straight.", "Within 0.8-1.3 seconds per cycle", [["Hip Flexion",90,120,"degrees","Reformed hinge"],["Knee Flexion",150,170,"degrees","Minimal bend"],["Spine Angle",25,40,"degrees","Neutral hinge"],["Elbow Flexion",160,180,"degrees","Arm long again"],["Bell Height Index",0,20,"index","Descending"],["Weight Transfer",-20,-10,"percent","Shift into hinge"],["Shoulder Symmetry",-5,5,"degrees","Level shoulders"]]),
  ]
};

const kettlebellCleanReference: ProfessionalReference = {
  motionName: "Kettlebell Clean", category: "weightlifting", subcategory: "kettlebell", source: alignedMetricsSource, verificationLevel: "coaching-standard",
  metrics: [
    { name: "Elbow Flexion", professionalAverage: 75, optimalRange: { min: 60, max: 90 }, unit: "degrees", description: "Strong rack position" },
    { name: "Shoulder Angle", professionalAverage: 37.5, optimalRange: { min: 30, max: 45 }, unit: "degrees", description: "Bell supported in rack" },
    { name: "Spine Angle", professionalAverage: 5, optimalRange: { min: 0, max: 10 }, unit: "degrees", description: "Upright rack posture" },
    { name: "Knee Flexion", professionalAverage: 175, optimalRange: { min: 170, max: 180 }, unit: "degrees", description: "Standing rack position" }
  ],
  phases: [
    referencePhase("Start Position / Hike Setup", "Feet hip-width; bell slightly ahead; hinge back; arm relaxed; shoulder packed; eyes forward and down; weight in heels.", "Set up in a strong hip hinge with the kettlebell in front of you, your arm relaxed, shoulder packed, and weight anchored through your heels.", "Within 1.5-2.5 seconds per rep", [["Hip Flexion",40,60,"degrees","Hinge depth"],["Knee Flexion",150,170,"degrees","Soft knees"],["Spine Angle",30,45,"degrees","Neutral hinge"],["Elbow Flexion",160,180,"degrees","Long arm"],["Shoulder Angle",10,20,"degrees","Arm slightly forward"],["Spine Rotation",-3,3,"degrees","Square torso"]]),
    referencePhase("Hike Pass", "Hike the bell high; keep the forearm near the inner thigh and wrist high; engage lats; hinge rather than squat.", "Hike the kettlebell back high between your legs, loading your hips while keeping your arm long and your torso stable.", "Within 1.5-2.5 seconds per rep", [["Hip Flexion",60,80,"degrees","Load hips"],["Knee Flexion",140,160,"degrees","Hinge, not squat"],["Spine Angle",35,50,"degrees","Neutral hinge"],["Elbow Flexion",160,180,"degrees","Stay long"],["Shoulder Angle",0,10,"degrees","Arm close to torso"],["Spine Rotation",-5,5,"degrees","No twist"]]),
    referencePhase("Hip Drive / Float", "Snap hips forward; stand tall; keep the arm relaxed; let the bell float; do not pull early.", "Explosively extend your hips to stand tall and let the kettlebell float upward without pulling with your arm.", "Within 1.5-2.5 seconds per rep", [["Hip Flexion",80,180,"degrees","Dynamic hip snap to 170-180 degrees"],["Knee Flexion",150,180,"degrees","Dynamic extension to 170-180 degrees"],["Spine Angle",0,40,"degrees","Dynamic return to 0-10 degrees upright"],["Elbow Flexion",140,160,"degrees","Minimal bend"],["Shoulder Angle",10,30,"degrees","Bell rising"],["Spine Rotation",-5,5,"degrees","Stay square"]]),
    referencePhase("Pull-In / Turnover", "Keep the elbow close; insert the hand; roll the bell around the wrist; avoid looping; keep the shoulder down.", "Guide your elbow close to your body and quickly rotate your hand so the kettlebell rolls smoothly into the rack.", "Within 1.5-2.5 seconds per rep", [["Elbow Flexion",70,140,"degrees","Dynamic guide into a 70-90 degree rack"],["Shoulder Angle",30,60,"degrees","Arm in front of torso"],["Spine Angle",0,10,"degrees","Upright"],["Spine Rotation",-5,5,"degrees","Stay square"]]),
    referencePhase("Rack Position", "Rest the bell on the forearm; keep wrist neutral, elbow near ribs, shoulder packed, and body tall.", "Finish in a stable rack position with the kettlebell resting on your forearm, elbow close to your body, and your posture tall.", "Within 1.5-2.5 seconds per rep", [["Elbow Flexion",60,90,"degrees","Strong rack"],["Shoulder Angle",30,45,"degrees","Bell supported"],["Spine Angle",0,10,"degrees","Upright"],["Knee Flexion",170,180,"degrees","Standing"],["Spine Rotation",-3,3,"degrees","Square torso"]]),
    referencePhase("Reset / Drop to Hinge", "Push the bell away; re-hinge; catch with the hips; stay controlled.", "Push the kettlebell slightly forward and re-hinge at the hips to catch it smoothly for the next repetition.", "Within 1.5-2.5 seconds per rep", [["Hip Flexion",0,60,"degrees","Dynamic return from 0-10 to 40-60 degrees"],["Knee Flexion",150,170,"degrees","Dynamic softening from standing"],["Spine Angle",0,45,"degrees","Dynamic return to a 30-45 degree hinge"],["Elbow Flexion",90,180,"degrees","Dynamic lengthening to 160-180 degrees"],["Spine Rotation",-5,5,"degrees","Stay square"]]),
  ]
};
const kettlebellPressReference: ProfessionalReference = {
  motionName: "Kettlebell Press", category: "weightlifting", subcategory: "kettlebell", source: alignedMetricsSource, verificationLevel: "coaching-standard",
  metrics: [
    { name: "Elbow Flexion", professionalAverage: 175, optimalRange: { min: 170, max: 180 }, unit: "degrees", description: "Full overhead extension" },
    { name: "Shoulder Angle", professionalAverage: 175, optimalRange: { min: 170, max: 180 }, unit: "degrees", description: "Stacked overhead arm" },
    { name: "Spine Angle", professionalAverage: 5, optimalRange: { min: 0, max: 10 }, unit: "degrees", description: "Upright torso without arch" },
    { name: "Knee Flexion", professionalAverage: 175, optimalRange: { min: 170, max: 180 }, unit: "degrees", description: "Straight legs at lockout" }
  ],
  phases: [
    referencePhase("Start Position / Rack", "Bell in rack; wrist neutral; elbow near ribs; shoulder packed; glutes lightly engaged; knees soft; weight balanced.", "Stand tall with the kettlebell racked on your forearm, elbow close to your body, shoulder packed, and weight evenly grounded through your feet.", "Static setup within 2.0-3.5 seconds per rep", [["Elbow Flexion",60,90,"degrees","Strong rack"],["Shoulder Angle",30,45,"degrees","Bell supported"],["Spine Angle",0,10,"degrees","Upright torso"],["Spine Rotation",-3,3,"degrees","Square"],["Knee Flexion",160,175,"degrees","Soft knees"]]),
    referencePhase("Press Initiation", "Press straight up; move elbow under wrist; avoid knee bend and torso lean.", "Begin pressing the kettlebell straight upward, keeping your torso tall and your legs quiet.", "0.4-0.7 seconds", [["Elbow Flexion",90,130,"degrees","Start pressing"],["Shoulder Angle",45,90,"degrees","Arm rising"],["Spine Angle",0,10,"degrees","No lean"],["Spine Rotation",-5,5,"degrees","Stay square"],["Knee Flexion",160,175,"degrees","No dip"]]),
    referencePhase("Mid-Press", "Move the head slightly back then through; keep arm near ear; pack the shoulder; keep body vertical.", "As the kettlebell passes eye level, move your head slightly back and then through while keeping your body tall and stable.", "0.4-0.8 seconds", [["Elbow Flexion",130,160,"degrees","Finishing press"],["Shoulder Angle",90,150,"degrees","Approaching overhead"],["Spine Angle",0,10,"degrees","Upright"],["Spine Rotation",-5,5,"degrees","Stay square"],["Knee Flexion",160,175,"degrees","No leg drive"]]),
    referencePhase("Lockout", "Straighten arm; place bicep near ear; keep ribs down and glutes engaged; hold the bell quiet.", "Finish with your arm fully extended overhead, ribs down, and the kettlebell stacked quietly over your shoulder.", "0.3-0.6 seconds", [["Elbow Flexion",170,180,"degrees","Full extension"],["Shoulder Angle",170,180,"degrees","Overhead"],["Spine Angle",0,10,"degrees","No arch"],["Spine Rotation",-3,3,"degrees","Square"],["Knee Flexion",170,180,"degrees","Standing tall"]]),
    referencePhase("Controlled Descent", "Lead with the elbow; control the weight; do not drop; keep torso tall.", "Lower the kettlebell under control back into the rack position while keeping your posture tall and stable.", "0.6-1.2 seconds", [["Elbow Flexion",60,180,"degrees","Dynamic descent to a 60-90 degree rack"],["Shoulder Angle",30,180,"degrees","Dynamic descent to 30-45 degrees"],["Spine Angle",0,10,"degrees","Upright"],["Spine Rotation",-5,5,"degrees","Stay square"],["Knee Flexion",160,175,"degrees","Soft knees"]]),
    referencePhase("Reset", "Settle the bell; reset breath; ground the feet.", "Let the kettlebell settle in the rack, re-ground your feet, and prepare for the next repetition.", "Within 2.0-3.5 seconds per rep", [["Elbow Flexion",60,90,"degrees","Rack"],["Shoulder Angle",30,45,"degrees","Bell supported"],["Spine Angle",0,10,"degrees","Upright"],["Spine Rotation",-3,3,"degrees","Square"],["Knee Flexion",160,175,"degrees","Soft knees"]]),
  ]
};
const kettlebellDeadliftReference: ProfessionalReference = {
  motionName: "Kettlebell Deadlift", category: "weightlifting", subcategory: "kettlebell", source: alignedMetricsSource, verificationLevel: "coaching-standard",
  metrics: [
    { name: "Hip Flexion", professionalAverage: 50, optimalRange: { min: 40, max: 60 }, unit: "degrees", description: "Setup hinge depth" }, { name: "Knee Flexion", professionalAverage: 150, optimalRange: { min: 140, max: 160 }, unit: "degrees", description: "Soft setup knee bend" }, { name: "Spine Angle", professionalAverage: 37.5, optimalRange: { min: 30, max: 45 }, unit: "degrees", description: "Neutral setup hinge" }, { name: "Elbow Flexion", professionalAverage: 175, optimalRange: { min: 170, max: 180 }, unit: "degrees", description: "Long arms" }
  ],
  phases: [
    referencePhase("Start Position / Setup", "Feet hip-width; bell centered; hips back; shins nearly vertical; chest proud; arms straight; weight in heels.", "Set up by pushing your hips back, keeping your chest tall and arms long, with the kettlebell centered between your feet and your weight anchored through your heels.", "Static setup within 2.5-4.0 seconds per rep", [["Hip Flexion",40,60,"degrees","Hinge back"],["Knee Flexion",140,160,"degrees","Soft bend"],["Spine Angle",30,45,"degrees","Flat back"],["Spine Rotation",-3,3,"degrees","Square torso"],["Shoulder Angle",0,10,"degrees","Arms vertical"],["Elbow Flexion",170,180,"degrees","Long arms"]]),
    referencePhase("Initial Pull", "Push the floor away; raise hips and shoulders together; avoid arm pull; keep bell close.", "Drive through your heels and push the floor away, lifting the kettlebell while keeping your arms straight and your back flat.", "0.5-0.8 seconds", [["Hip Flexion",45,60,"degrees","Hips begin extending"],["Knee Flexion",150,160,"degrees","Knees extend slightly"],["Spine Angle",30,45,"degrees","Unchanged neutral angle"],["Spine Rotation",-5,5,"degrees","Stay square"],["Shoulder Angle",0,10,"degrees","Arms hang"],["Elbow Flexion",170,180,"degrees","No arm pull"]]),
    referencePhase("Mid-Lift", "Stand taller; keep the bell close past the knees; avoid rounding and backward lean.", "Continue extending your hips as the kettlebell passes your knees, keeping your torso stable and your arms relaxed.", "0.5-0.8 seconds", [["Hip Flexion",15,45,"degrees","Continue extending"],["Knee Flexion",160,170,"degrees","Continue extending"],["Spine Angle",25,40,"degrees","Neutral"],["Spine Rotation",-5,5,"degrees","Stay square"],["Shoulder Angle",0,10,"degrees","Arms hang"],["Elbow Flexion",170,180,"degrees","Long arms"]]),
    referencePhase("Lockout", "Stand tall; tighten glutes; keep ribs down; do not lean back.", "Finish standing tall with your hips and knees fully extended, glutes engaged, and ribs down.", "0.3-0.6 seconds", [["Hip Flexion",170,180,"degrees","Full extension"],["Knee Flexion",170,180,"degrees","Standing tall"],["Spine Angle",0,10,"degrees","Upright"],["Spine Rotation",-3,3,"degrees","Square"],["Shoulder Angle",0,10,"degrees","Arms vertical"],["Elbow Flexion",170,180,"degrees","Long arms"]]),
    referencePhase("Controlled Descent", "Push hips back first; lower the bell vertically; bend knees after hips; stay controlled.", "Lower the kettlebell by pushing your hips back first, keeping your back flat and controlling the descent all the way to the floor.", "1.0-1.8 seconds", [["Hip Flexion",40,180,"degrees","Dynamic hinge from standing to 40-60 degrees"],["Knee Flexion",140,170,"degrees","Dynamic bend to 140-160 degrees"],["Spine Angle",0,45,"degrees","Dynamic return to 30-45 degree hinge"],["Spine Rotation",-5,5,"degrees","Stay square"],["Shoulder Angle",0,10,"degrees","Arms hang"],["Elbow Flexion",170,180,"degrees","Long arms"]]),
    referencePhase("Reset", "Settle the bell; reset breath; re-brace core.", "Let the kettlebell settle on the floor, reset your breath and posture, and prepare for the next repetition.", "Within 2.5-4.0 seconds per rep", [["Hip Flexion",40,60,"degrees","Setup hinge"],["Knee Flexion",140,160,"degrees","Soft bend"],["Spine Angle",30,45,"degrees","Neutral hinge"],["Spine Rotation",-3,3,"degrees","Square"],["Shoulder Angle",0,10,"degrees","Arms vertical"],["Elbow Flexion",170,180,"degrees","Long arms"]]),
  ]
};
const kettlebellGobletSquatReference: ProfessionalReference = {
  motionName: "Goblet Squat", category: "weightlifting", subcategory: "kettlebell", source: alignedMetricsSource, verificationLevel: "coaching-standard",
  metrics: [
    { name: "Knee Flexion", professionalAverage: 65, optimalRange: { min: 55, max: 75 }, unit: "degrees", description: "Deep bottom-position interior knee angle" }, { name: "Hip Flexion", professionalAverage: 90, optimalRange: { min: 70, max: 110 }, unit: "degrees", description: "Bottom-position hip angle" }, { name: "Spine Angle", professionalAverage: 20, optimalRange: { min: 10, max: 30 }, unit: "degrees", description: "Upright bottom-position torso" }, { name: "Load Distance", professionalAverage: 5, optimalRange: { min: 0, max: 10 }, unit: "cm", description: "Load distance from chest" }
  ],
  phases: [
    referencePhase("Setup / Ready Position", "Feet shoulder-width; toes slightly out; load close to chest; elbows tucked; chest tall; ribs stacked; weight at mid-foot.", "Stand tall with the weight held close to your chest, elbows tucked evenly, feet set shoulder-width, and your weight balanced over the middle of your feet.", "Within 2.5-4.0 seconds per rep", [["Left Knee Flexion",170,180,"degrees","Standing"],["Right Knee Flexion",170,180,"degrees","Standing"],["Hip Flexion",170,180,"degrees","Standing"],["Spine Angle",0,10,"degrees","Upright"],["Left Elbow Flexion",70,100,"degrees","Tucked"],["Right Elbow Flexion",70,100,"degrees","Tucked"],["Load Distance",0,5,"cm","Close to chest"],["Shoulder Height Symmetry",-3,3,"degrees","Level"],["Weight Transfer",-5,5,"percent","Centered"]]),
    referencePhase("Descent", "Sit straight down; track both knees evenly forward and outward; keep elbows near ribs; keep load close; maintain a neutral spine.", "Lower yourself by sitting straight down, allowing both knees to track evenly while keeping the weight close to your chest and your torso tall.", "Within 2.5-4.0 seconds per rep", [["Left Knee Flexion",90,120,"degrees","Controlled bend"],["Right Knee Flexion",90,120,"degrees","Controlled bend"],["Hip Flexion",110,150,"degrees","Descending"],["Spine Angle",5,20,"degrees","Upright"],["Left Elbow Flexion",70,110,"degrees","Tucked"],["Right Elbow Flexion",70,110,"degrees","Tucked"],["Load Distance",0,8,"cm","Close to chest"],["Shoulder Height Symmetry",-3,3,"degrees","Level"],["Weight Transfer",0,10,"percent","Mid-foot to slight forefoot"]]),
    referencePhase("Bottom Position", "Keep knees open and stable; elbows under the weight; chest tall; spine neutral; load close.", "At the bottom, keep your knees stable and open, your elbows tucked under the weight, and your chest lifted without rounding your spine.", "Within 2.5-4.0 seconds per rep", [["Knee Flexion",55,75,"degrees","Deep target; 80-90 degrees is acceptable parallel depth"],["Hip Flexion",70,110,"degrees","Bottom depth"],["Spine Angle",10,30,"degrees","Upright relative to back squat"],["Elbow Flexion",80,120,"degrees","Bent and tucked"],["Load Distance",0,10,"cm","Close for counterbalance"],["Shoulder Height Symmetry",-3,3,"degrees","No lateral lean"],["Weight Transfer",0,10,"percent","Mid-foot to slight forefoot"]]),
    referencePhase("Ascent", "Drive through mid-foot; extend knees evenly; raise hips and chest together; keep elbows tucked and load close.", "Press evenly through both feet to stand up, extending your knees and hips together while keeping the weight close and your elbows tucked.", "Within 2.5-4.0 seconds per rep", [["Left Knee Flexion",90,180,"degrees","Dynamic extension to 170-180 degrees"],["Right Knee Flexion",90,180,"degrees","Dynamic extension to 170-180 degrees"],["Hip Flexion",110,180,"degrees","Dynamic extension to 170-180 degrees"],["Spine Angle",0,20,"degrees","Returns toward 0-10 degrees"],["Left Elbow Flexion",80,110,"degrees","Tucked"],["Right Elbow Flexion",80,110,"degrees","Tucked"],["Load Distance",0,8,"cm","Close"],["Shoulder Height Symmetry",-3,3,"degrees","Level"],["Weight Transfer",0,5,"percent","Centered"]]),
    referencePhase("Lockout / Reset", "Stand tall; fully extend knees and hips; keep elbows tucked; steady the load at chest; rebrace.", "Finish standing tall with both knees and hips fully extended, the weight steady at your chest, and your posture balanced before the next repetition.", "Within 2.5-4.0 seconds per rep", [["Left Knee Flexion",170,180,"degrees","Full extension"],["Right Knee Flexion",170,180,"degrees","Full extension"],["Hip Flexion",170,180,"degrees","Full extension"],["Spine Angle",0,10,"degrees","Upright"],["Left Elbow Flexion",70,100,"degrees","Tucked"],["Right Elbow Flexion",70,100,"degrees","Tucked"],["Load Distance",0,5,"cm","Close"],["Shoulder Height Symmetry",-3,3,"degrees","Level"],["Weight Transfer",-5,5,"percent","Centered"]]),
  ]
};
const kettlebellTurkishGetUpReference: ProfessionalReference = {
  motionName: "Turkish Get-Up",
  category: "weightlifting",
  subcategory: "kettlebell",
  source: alignedMetricsSource,
  verificationLevel: "coaching-standard",
  metrics: [
    { name: "Shoulder External Rotation", professionalAverage: 170, optimalRange: { min: 155, max: 180 }, unit: "degrees", description: "Overhead stability" },
    { name: "Hip Rotation", professionalAverage: 30, optimalRange: { min: 20, max: 40 }, unit: "degrees", description: "Hip hinge during transitions" },
    { name: "Spine Extension", professionalAverage: 5, optimalRange: { min: 0, max: 12 }, unit: "degrees", description: "Neutral trunk throughout" },
    { name: "Knee Flexion", professionalAverage: 90, optimalRange: { min: 70, max: 110 }, unit: "degrees", description: "Half-kneeling position" }
  ],
  phases: [
    referencePhase("Supine Start Position", "Lie flat; stack the loaded arm over the shoulder; bend the same-side knee with foot planted; extend the opposite leg; set the free arm about 45 degrees out; pack the shoulder; watch the bell. The source provides no numeric metrics for this phase.", "Lie flat with the kettlebell stacked over your shoulder, your loaded arm straight, your same-side knee bent with the foot planted, and your free arm angled out for support as you keep your eyes on the bell.", "Within 8-14 seconds per side", []),
    referencePhase("Roll to Elbow", "Drive through the planted heel; roll chest toward bell; place elbow under shoulder; keep eyes on bell.", "Drive through your planted foot and roll onto your elbow, using your bent knee to create leverage while keeping the kettlebell stacked overhead.", "Within 8-14 seconds per side", [["Lead Knee Flexion",80,110,"degrees","Active leverage"],["Trail Knee Flexion",160,180,"degrees","Extended and relaxed"],["Shoulder Angle",160,180,"degrees","Bell stacked"],["Elbow Flexion",170,180,"degrees","Loaded arm straight"],["Spine Angle",10,30,"degrees","Torso rotation"]]),
    referencePhase("Post to Hand", "Post tall on the hand; keep chest proud; pack shoulder; keep bell quiet overhead.", "Press into your hand and stabilize your base, keeping your bent knee grounded and aligned as your torso rises tall.", "Within 8-14 seconds per side", [["Lead Knee Flexion",80,110,"degrees","Stable base"],["Trail Knee Flexion",160,180,"degrees","Extended"],["Shoulder Angle",170,180,"degrees","Overhead"],["Elbow Flexion",170,180,"degrees","Loaded arm straight"],["Spine Angle",5,20,"degrees","Tall post"]]),
    referencePhase("Bridge / Hip Lift", "Drive hips high; engage glute; keep lead knee stable; keep bell stacked.", "Drive through your planted foot to lift your hips, keeping your knee stable and your kettlebell vertical.", "Within 8-14 seconds per side", [["Lead Knee Flexion",60,100,"degrees","Drives hip extension"],["Trail Knee Flexion",160,180,"degrees","Extended"],["Shoulder Angle",170,180,"degrees","Overhead"],["Elbow Flexion",170,180,"degrees","Loaded arm straight"]]),
    referencePhase("Leg Sweep to Half Kneel", "Sweep the straight leg back; place knee under hip; keep torso tall; watch bell.", "Sweep your leg underneath into a stable half-kneeling position, placing your knee under your hip while keeping the kettlebell stacked overhead.", "Within 8-14 seconds per side", [["Lead Knee Flexion",70,120,"degrees","Front leg base"],["Trail Knee Flexion",90,120,"degrees","Kneeling support"],["Spine Angle",0,15,"degrees","Tall torso"],["Shoulder Angle",170,180,"degrees","Overhead"],["Elbow Flexion",170,180,"degrees","Loaded arm straight"]]),
    referencePhase("Lunge to Stand", "Drive through front foot; track knee over toes; stand tall; keep bell overhead.", "Press through your front foot to stand, keeping your knee aligned and your torso tall as the kettlebell remains stacked overhead.", "Within 8-14 seconds per side", [["Lead Knee Flexion",80,180,"degrees","Dynamic extension to 170-180 degrees"],["Trail Knee Flexion",90,180,"degrees","Dynamic extension to 170-180 degrees"],["Spine Angle",0,10,"degrees","Tall torso"],["Shoulder Angle",170,180,"degrees","Overhead"],["Elbow Flexion",170,180,"degrees","Loaded arm straight"]]),
    referencePhase("Controlled Descent", "Reverse each position deliberately; return to a lunge; place knee and hand; hinge hips down; roll to elbow and back; keep bell stacked. The source provides timing and qualitative control criteria but no numeric metrics for this phase.", "Reverse each step under control by returning to a lunge, placing the knee and hand deliberately, hinging your hips down, and rolling back to the floor while keeping the kettlebell stacked overhead.", "3.0-5.0 seconds", []),
  ]
};
const kettlebellWindmillReference: ProfessionalReference = {
  motionName: "Kettlebell Windmill", category: "weightlifting", subcategory: "kettlebell", source: alignedMetricsSource, verificationLevel: "coaching-standard",
  metrics: [
    { name: "Hip Flexion", professionalAverage: 85, optimalRange: { min: 70, max: 100 }, unit: "degrees", description: "Bottom-position hinge" }, { name: "Spine Rotation", professionalAverage: 65, optimalRange: { min: 55, max: 75 }, unit: "degrees", description: "Controlled bottom-position rotation" }, { name: "Shoulder Angle", professionalAverage: 175, optimalRange: { min: 170, max: 180 }, unit: "degrees", description: "Stacked overhead arm" }, { name: "Elbow Flexion", professionalAverage: 175, optimalRange: { min: 170, max: 180 }, unit: "degrees", description: "Straight loaded arm" }
  ],
  phases: [
    referencePhase("Start Position / Overhead Setup", "Feet wider than shoulders; toes angled away from bell side; bell locked overhead; wrist neutral; eyes on bell; chest open; weight in heels.", "Stand tall with the kettlebell locked overhead, your arm straight, chest open, and weight anchored through your heels.", "Static setup within 4.0-6.5 seconds per rep", [["Shoulder Angle",170,180,"degrees","Stacked overhead"],["Elbow Flexion",170,180,"degrees","Locked arm"],["Spine Angle",0,10,"degrees","Upright"],["Spine Rotation",0,10,"degrees","Pre-rotation"],["Knee Flexion",160,175,"degrees","Soft knees"]]),
    referencePhase("Rotational Hinge Initiation", "Push hips back; rotate chest toward floor; watch bell; keep arm vertical; prevent knee collapse.", "Push your hips back and rotate your chest downward while keeping your arm vertical and your weight anchored through your heels.", "Within 1.8-3.0 second descent", [["Hip Flexion",30,50,"degrees","Hinge back"],["Spine Angle",15,30,"degrees","Long spine"],["Spine Rotation",20,40,"degrees","Controlled rotation"],["Shoulder Angle",170,180,"degrees","Arm stacked"],["Elbow Flexion",170,180,"degrees","Straight arm"],["Knee Flexion",150,170,"degrees","Stable knees"]]),
    referencePhase("Mid-Descent / Rotational Control", "Move hips back rather than down; open chest toward side wall; slide bottom hand down leg; keep bell quiet overhead.", "Continue hinging back and rotating your torso while keeping the kettlebell stacked overhead and your hips moving away from the bell.", "Within 1.8-3.0 second descent", [["Hip Flexion",50,80,"degrees","Deeper hinge"],["Spine Angle",30,45,"degrees","Neutral spine"],["Spine Rotation",40,65,"degrees","Open chest"],["Shoulder Angle",170,180,"degrees","Overhead"],["Elbow Flexion",170,180,"degrees","Straight arm"],["Knee Flexion",140,165,"degrees","Stable knees"]]),
    referencePhase("Bottom Position", "Reach toward shin or ankle; fully open chest; load hips; avoid rounding; keep bell stacked.", "Pause briefly at the bottom with your hips loaded, chest open, and the kettlebell still stacked overhead.", "0.4-0.8 seconds", [["Hip Flexion",70,100,"degrees","Maximum hinge"],["Spine Angle",35,55,"degrees","Long spine"],["Spine Rotation",55,75,"degrees","Full rotation"],["Shoulder Angle",170,180,"degrees","Overhead"],["Elbow Flexion",170,180,"degrees","Straight arm"],["Knee Flexion",140,165,"degrees","Stable knees"]]),
    referencePhase("Ascent / Unwind", "Drive hips forward; unwind chest upward; keep arm vertical; keep eyes on bell.", "Drive your hips forward and unwind your torso back to standing while keeping the kettlebell stacked overhead.", "1.5-2.5 seconds", [["Hip Flexion",0,100,"degrees","Dynamic return to 0-10 degrees"],["Spine Angle",0,45,"degrees","Dynamic return to 0-10 degrees"],["Spine Rotation",0,75,"degrees","Dynamic unwind to 0-10 degrees"],["Shoulder Angle",170,180,"degrees","Overhead"],["Elbow Flexion",170,180,"degrees","Straight arm"],["Knee Flexion",165,180,"degrees","Extends to standing"]]),
    referencePhase("Reset / Finish", "Stand tall; look forward; hold the bell quiet; reset breath.", "Finish standing tall with the kettlebell steady overhead before resetting for the next repetition.", "0.3-0.6 seconds", [["Shoulder Angle",170,180,"degrees","Overhead"],["Elbow Flexion",170,180,"degrees","Straight arm"],["Spine Angle",0,10,"degrees","Upright"],["Spine Rotation",0,10,"degrees","Square"],["Knee Flexion",170,180,"degrees","Standing"]]),
  ]
};
const kettlebellRowReference: ProfessionalReference = {
  motionName: "Kettlebell Row", category: "weightlifting", subcategory: "kettlebell", source: alignedMetricsSource, verificationLevel: "coaching-standard",
  metrics: [
    { name: "Elbow Flexion", professionalAverage: 80, optimalRange: { min: 70, max: 90 }, unit: "degrees", description: "Top-position elbow angle" }, { name: "Shoulder Extension Angle", professionalAverage: 52.5, optimalRange: { min: 45, max: 60 }, unit: "degrees", description: "Upper arm behind torso at peak contraction" }, { name: "Spine Angle", professionalAverage: 37.5, optimalRange: { min: 30, max: 45 }, unit: "degrees", description: "Stable hinge angle" }, { name: "Spine Rotation", professionalAverage: 0, optimalRange: { min: -5, max: 5 }, unit: "degrees", description: "Square torso during row" }
  ],
  phases: [
    referencePhase("Start Position / Setup", "Feet shoulder-width; hinge torso; soften knees; keep spine neutral; hang bell beneath shoulder; keep chest square and shoulders level; anchor heels.", "Set up in a stable hip hinge with a neutral spine, soft knees, and the kettlebell hanging straight down beneath your shoulder before initiating the pull and your weight anchored through your heels.", "Static setup within 1.6-2.6 seconds per rep", [["Hip Flexion",30,50,"degrees","Stable hinge"],["Knee Flexion",150,170,"degrees","Soft knees"],["Spine Angle",30,45,"degrees","Forward lean"],["Spine Rotation",-3,3,"degrees","Square torso"],["Elbow Flexion",160,180,"degrees","Arm long"],["Shoulder Height Differential",5,10,"degrees","Expected loaded-side offset"],["Load Path Distance",0,5,"cm","Bell under shoulder"]]),
    referencePhase("Initiation of Pull", "Drive elbow back and in; retract shoulder blade; keep bell close; hold torso still; avoid rotation.", "Initiate the row by driving your elbow back while keeping your torso still and the kettlebell close to your body. Your weight should remain anchored through your heels without shifting forward or side-to-side as you pull and lower the kettlebell.", "Within 1.6-2.6 seconds per rep", [["Elbow Flexion",120,160,"degrees","Dynamic pull from 160 to 120 degrees"],["Shoulder Extension Angle",10,30,"degrees","Elbow begins moving behind torso"],["Spine Angle",30,45,"degrees","Stable"],["Spine Rotation",-5,5,"degrees","No twist"],["Hip Flexion",30,50,"degrees","Stable hinge"],["Knee Flexion",150,170,"degrees","Stable base"]]),
    referencePhase("Mid-Pull", "Continue elbow past torso; keep shoulder packed; hold chest square; keep hips and knees unchanged.", "Continue pulling your elbow past your torso while keeping your shoulders packed and your hips and spine completely stable.", "Within 1.6-2.6 seconds per rep", [["Elbow Flexion",80,120,"degrees","Dynamic pull from 120 to 80 degrees"],["Shoulder Extension Angle",30,50,"degrees","Upper arm moves behind torso"],["Spine Angle",30,45,"degrees","Stable"],["Spine Rotation",-5,5,"degrees","No twist"],["Shoulder Height Differential",5,15,"degrees","Expected loaded-side offset"]]),
    referencePhase("Peak Contraction / Top", "Keep elbow near ribs; place upper arm just behind torso; squeeze shoulder blade without shrugging; bring bell near lower ribs or hip; keep torso square.", "Finish the row by pulling your elbow close to your ribs, squeezing your shoulder blade without lifting or twisting your torso.", "Within 1.6-2.6 seconds per rep", [["Elbow Flexion",70,90,"degrees","Peak contraction"],["Shoulder Extension Angle",45,60,"degrees","Upper arm behind torso"],["Spine Angle",30,45,"degrees","Stable"],["Spine Rotation",-5,5,"degrees","No twist"],["Shoulder Height Differential",5,15,"degrees","Expected loaded-side offset"]]),
    referencePhase("Controlled Descent", "Extend elbow slowly; lower bell vertically; keep torso still; avoid dropping or swinging.", "Lower the kettlebell slowly back to the start position, keeping your spine stable and the weight close to your body.", "Within 1.6-2.6 seconds per rep", [["Elbow Flexion",80,180,"degrees","Dynamic extension to 160-180 degrees"],["Shoulder Extension Angle",10,50,"degrees","Dynamic return toward 10 degrees"],["Spine Angle",30,45,"degrees","Stable"],["Spine Rotation",-5,5,"degrees","No twist"],["Hip Flexion",30,50,"degrees","Stable hinge"],["Knee Flexion",150,170,"degrees","Stable base"]]),
    referencePhase("Reset / Hang", "Let bell settle; keep spine neutral and shoulders square; reset breath; re-anchor heels.", "Let the kettlebell come to a complete stop beneath your shoulder, reset your posture, and prepare for the next repetition. Re-anchor heels before the next rep.", "Within 1.6-2.6 seconds per rep", [["Elbow Flexion",160,180,"degrees","Arm long"],["Hip Flexion",30,50,"degrees","Stable hinge"],["Knee Flexion",150,170,"degrees","Soft knees"],["Spine Angle",30,45,"degrees","Stable"],["Spine Rotation",-3,3,"degrees","Square torso"]]),
  ]
};

// ============================================================
// RECOVERY — PHYSICAL THERAPY
// ============================================================

const ptGenericReference: ProfessionalReference = {
  motionName: "Physical Therapy Exercise",
  category: "recovery",
  subcategory: "physical-therapy",
  source: "Physical Therapy Guidelines",
  verificationLevel: "unverified",
  metrics: [
    { name: "Spine Extension", professionalAverage: 5, optimalRange: { min: 0, max: 12 }, unit: "degrees", description: "Neutral spine position" },
    { name: "Knee Flexion", professionalAverage: 140, optimalRange: { min: 100, max: 170 }, unit: "degrees", description: "Controlled range of motion" },
    { name: "Hip Rotation", professionalAverage: 20, optimalRange: { min: 10, max: 35 }, unit: "degrees", description: "Controlled hip movement" },
    { name: "Weight Transfer", professionalAverage: 50, optimalRange: { min: 40, max: 60 }, unit: "percent", description: "Balanced weight distribution" }
  ]
};

// ============================================================
// RECOVERY — STRETCHING
// ============================================================

const stretchingGenericReference: ProfessionalReference = {
  motionName: "Stretching",
  category: "recovery",
  subcategory: "stretching",
  source: "Flexibility Training Guidelines",
  verificationLevel: "unverified",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 40, optimalRange: { min: 25, max: 60 }, unit: "degrees", description: "Hip flexibility range" },
    { name: "Knee Flexion", professionalAverage: 130, optimalRange: { min: 90, max: 170 }, unit: "degrees", description: "Knee range of motion" },
    { name: "Spine Extension", professionalAverage: 15, optimalRange: { min: 5, max: 30 }, unit: "degrees", description: "Spinal mobility" },
    { name: "Weight Transfer", professionalAverage: 50, optimalRange: { min: 40, max: 60 }, unit: "percent", description: "Balance during stretch" }
  ]
};

// ============================================================
// RECOVERY — MOBILITY
// ============================================================

const mobilityGenericReference: ProfessionalReference = {
  motionName: "Mobility Exercise",
  category: "recovery",
  subcategory: "mobility",
  source: "Mobility Training Guidelines",
  verificationLevel: "unverified",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 35, optimalRange: { min: 20, max: 55 }, unit: "degrees", description: "Hip range of motion" },
    { name: "Knee Flexion", professionalAverage: 140, optimalRange: { min: 100, max: 170 }, unit: "degrees", description: "Knee mobility" },
    { name: "Spine Extension", professionalAverage: 10, optimalRange: { min: 0, max: 25 }, unit: "degrees", description: "Spinal mobility" },
    { name: "Shoulder External Rotation", professionalAverage: 90, optimalRange: { min: 60, max: 120 }, unit: "degrees", description: "Shoulder mobility" },
    { name: "Weight Transfer", professionalAverage: 50, optimalRange: { min: 40, max: 60 }, unit: "percent", description: "Balance" }
  ]
};

// ============================================================
// MASTER LOOKUP TABLE
// ============================================================

export const professionalReferences: Record<string, ProfessionalReference> = {
  // Sports — Football
  "football-throw": footballThrowReference,
  "football-punt": footballPuntReference,
  "football-field-goal": footballFieldGoalReference,
  
  // Sports — Basketball
  "basketball-jump-shot": jumpShotReference,
  "basketball-jumpshot": jumpShotReference,
  "basketball-free-throw": basketballFreeThrowReference,
  "basketball-layup": basketballLayupReference,
  "basketball-dribbling": basketballDribblingReference,
  
  // Sports — Baseball
  "baseball-fastball": baseballFastballReference,
  "baseball-curveball": baseballCurveballReference,
  "baseball-slider": baseballSliderReference,
  "baseball-knuckleball": baseballKnuckleballReference,
  "baseball-batting-swing": baseballBattingReference,
  
  // Sports — Tennis
  "tennis-forehand": tennisForehandReference,
  "tennis-backhand": tennisBackhandReference,
  "tennis-serve": tennisServeReference,
  
  // Sports — Golf
  "golf-driver-swing": golfDriverReference,
  "golf-swing": golfDriverReference,
  "golf-iron-shot": golfIronReference,
  "golf-putting": golfPuttingReference,
  
  // Sports — Soccer
  "soccer-power-shot": soccerPowerShotReference,
  "soccer-passing": soccerPassingReference,
  
  // Sports — Archery
  "archery-stance": archeryStanceReference,
  "archery-draw": archeryDrawReference,
  "archery-release": archeryReleaseReference,
  
  // Sports — Track & Field
  "track-field-sprint-start": trackSprintStartReference,
  "track-field-long-jump": trackLongJumpReference,
  "track-field-high-jump": trackHighJumpReference,
  "track-field-shot-put": trackShotPutReference,
  "track-field-discus": trackDiscusReference,
  "track-field-javelin": trackJavelinReference,
  "track-field-pole-vault": trackPoleVaultReference,
  "track-field-hurdles": trackHurdlesReference,
  
  // Weightlifting — Powerlifting
  "powerlifting-back-squat": powerliftingSquatReference,
  "powerlifting-front-squat": powerliftingFrontSquatReference,
  "powerlifting-deadlift": powerliftingDeadliftReference,
  "powerlifting-sumo-deadlift": powerliftingSumoDeadliftReference,
  "powerlifting-bench-press": powerliftingBenchReference,
  "powerlifting-incline-bench": powerliftingInclineBenchReference,
  "powerlifting-overhead-press": powerliftingOverheadPressReference,
  
  // Weightlifting — Olympic Lifting
  "olympic-lifting-clean-jerk": olympicCleanJerkReference,
  "olympic-lifting-snatch": olympicSnatchReference,
  "olympic-lifting-hang-clean": olympicHangCleanReference,
  "olympic-lifting-power-clean": olympicPowerCleanReference,
  
  // Weightlifting — Kettlebell
  "kettlebell-kb-swing": kettlebellSwingReference,
  "kettlebell-swing": kettlebellSwingReference,
  "kettlebell-kb-snatch": kettlebellSnatchReference,
  "kettlebell-snatch": kettlebellSnatchReference,
  "kettlebell-kb-clean": kettlebellCleanReference,
  "kettlebell-clean": kettlebellCleanReference,
  "kettlebell-kb-press": kettlebellPressReference,
  "kettlebell-press": kettlebellPressReference,
  "kettlebell-turkish-getup": kettlebellTurkishGetUpReference,
  "kettlebell-turkish-get-up": kettlebellTurkishGetUpReference,
  "kettlebell-kb-windmill": kettlebellWindmillReference,
  "kettlebell-windmill": kettlebellWindmillReference,
  "kettlebell-goblet-squat": kettlebellGobletSquatReference,
  "kettlebell-kb-deadlift": kettlebellDeadliftReference,
  "kettlebell-deadlift": kettlebellDeadliftReference,
  "kettlebell-kb-row": kettlebellRowReference,
  "kettlebell-row": kettlebellRowReference,
  
  // Recovery — Physical Therapy (all map to generic PT reference)
  "physical-therapy-glute-bridge": ptGenericReference,
  "physical-therapy-clamshells": ptGenericReference,
  "physical-therapy-bird-dog": ptGenericReference,
  "physical-therapy-wall-slides": ptGenericReference,
  "physical-therapy-heel-raises": ptGenericReference,
  "physical-therapy-side-leg-raises": ptGenericReference,
  "physical-therapy-marching": ptGenericReference,
  "physical-therapy-single-leg-stand": ptGenericReference,
  "physical-therapy-step-ups": ptGenericReference,
  "physical-therapy-resistance-rows": ptGenericReference,
  
  // Recovery — Stretching
  "stretching-hip-flexor-stretch": stretchingGenericReference,
  "stretching-hamstring-stretch": stretchingGenericReference,
  "stretching-calf-stretch": stretchingGenericReference,
  "stretching-quad-stretch": stretchingGenericReference,
  "stretching-shoulder-crossbody": stretchingGenericReference,
  
  // Recovery — Mobility
  "mobility-thoracic-rotation": mobilityGenericReference,
  "mobility-hip-circles": mobilityGenericReference,
  "mobility-ankle-circles": mobilityGenericReference,
  "mobility-neck-rolls": mobilityGenericReference,
  "mobility-arm-circles": mobilityGenericReference,
};

// Helper function to get reference by motion
export function getProfessionalReference(
  category: string, 
  subcategory: string, 
  motionName: string
): ProfessionalReference | null {
  const formattedMotion = motionName.toLowerCase().replace(/\s+/g, '-');
  const key = `${subcategory.toLowerCase()}-${formattedMotion}`;
  console.log('🔑 Looking for professional reference with key:', key);
  
  // Try exact match
  if (professionalReferences[key]) return professionalReferences[key];
  
  // Try without subcategory prefix
  if (professionalReferences[formattedMotion]) return professionalReferences[formattedMotion];
  
  // Try category-based match
  const catKey = `${category.toLowerCase()}-${formattedMotion}`;
  if (professionalReferences[catKey]) return professionalReferences[catKey];
  
  // Fuzzy match: find any key that contains the motion slug
  for (const [refKey, ref] of Object.entries(professionalReferences)) {
    if (refKey.includes(formattedMotion) || formattedMotion.includes(refKey.split('-').slice(1).join('-'))) {
      return ref;
    }
  }
  
  // Category fallback: use generic reference for the category
  const categoryLower = category.toLowerCase();
  const subcategoryLower = subcategory.toLowerCase();
  
  if (subcategoryLower.includes('physical-therapy') || subcategoryLower.includes('pt')) return ptGenericReference;
  if (subcategoryLower.includes('stretching')) return stretchingGenericReference;
  if (subcategoryLower.includes('mobility')) return mobilityGenericReference;
  if (categoryLower === 'recovery') return ptGenericReference;
  
  // Last resort: return a generic athletic reference
  console.warn(`⚠️ No professional reference found for: ${key}. Using generic reference.`);
  return {
    motionName: motionName,
    category: category,
    subcategory: subcategory,
    source: "General Athletic Biomechanics",
    verificationLevel: "unverified",
    metrics: [
      { name: "Hip Rotation", professionalAverage: 40, optimalRange: { min: 25, max: 55 }, unit: "degrees", description: "Hip movement" },
      { name: "Knee Flexion", professionalAverage: 135, optimalRange: { min: 100, max: 165 }, unit: "degrees", description: "Knee angle" },
      { name: "Spine Extension", professionalAverage: 15, optimalRange: { min: 5, max: 25 }, unit: "degrees", description: "Trunk position" },
      { name: "Elbow Flexion", professionalAverage: 100, optimalRange: { min: 70, max: 140 }, unit: "degrees", description: "Arm position" },
      { name: "Weight Transfer", professionalAverage: 50, optimalRange: { min: 35, max: 65 }, unit: "percent", description: "Balance" }
    ]
  };
}

// Helper function to calculate alignment score based on distance from optimal
export function calculateMetricScore(
  userValue: number,
  metric: BiomechanicalMetric
): number {
  const { professionalAverage, optimalRange } = metric;
  
  // If value is 0 or very close to 0, it likely wasn't detected
  // Return -1 to signal "not detected"
  if (Math.abs(userValue) < 0.5) {
    return -1;
  }
  
  const distanceFromOptimal = Math.abs(userValue - professionalAverage);
  
  // If within optimal range, score 90-100 based on closeness to average
  if (userValue >= optimalRange.min && userValue <= optimalRange.max) {
    const rangeSize = (optimalRange.max - optimalRange.min) / 2;
    const score = 100 - (distanceFromOptimal / Math.max(rangeSize, 1)) * 10;
    return Math.max(90, Math.min(100, score));
  }
  
  // If outside optimal range, calculate alignment score (0-90)
  const distanceFromRange = userValue < optimalRange.min 
    ? optimalRange.min - userValue 
    : userValue - optimalRange.max;
  
  // Alignment score: 90 at edge of range, decreasing by 5 points per 5° away
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
  
  if (Math.abs(userValue) < 0.5) {
    return "Not detected";
  }
  
  const distanceFromOptimal = Math.abs(userValue - professionalAverage);
  
  if (userValue >= optimalRange.min && userValue <= optimalRange.max) {
    if (distanceFromOptimal < 2) {
      return "Perfect alignment with professional average";
    }
    return "Within professional range";
  }
  
  const direction = userValue < professionalAverage ? "below" : "above";
  return `${distanceFromOptimal.toFixed(1)}° ${direction} professional average`;
}
