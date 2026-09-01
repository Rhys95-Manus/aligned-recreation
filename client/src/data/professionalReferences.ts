
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

export interface ProfessionalReference {
  motionName: string;
  category: string;
  subcategory: string;
  metrics: BiomechanicalMetric[];
  source: string;
  phases?: ProfessionalReferencePhase[];
}

// ============================================================
// SPORTS — FOOTBALL
// ============================================================

export const footballThrowReference: ProfessionalReference = {
  motionName: "Throw",
  category: "sports",
  subcategory: "football",
  source: "Professional QB Biomechanics Study (IJSPT 2025)",
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
  source: "Powerlifting Squat Biomechanics",
  metrics: [
    { name: "Knee Flexion", professionalAverage: 90, optimalRange: { min: 70, max: 110 }, unit: "degrees", description: "Knee angle at bottom of squat" },
    { name: "Hip Rotation", professionalAverage: 35, optimalRange: { min: 25, max: 50 }, unit: "degrees", description: "Hip hinge depth" },
    { name: "Spine Extension", professionalAverage: 20, optimalRange: { min: 10, max: 30 }, unit: "degrees", description: "Forward lean of torso" },
    { name: "Weight Transfer", professionalAverage: 10, optimalRange: { min: 0, max: 20 }, unit: "percent", description: "Mid-foot balance" },
    { name: "Foot Positioning", professionalAverage: 35, optimalRange: { min: 25, max: 45 }, unit: "degrees", description: "Stance width" }
  ]
};

const powerliftingFrontSquatReference: ProfessionalReference = {
  ...powerliftingSquatReference,
  motionName: "Front Squat",
  metrics: [
    { name: "Knee Flexion", professionalAverage: 85, optimalRange: { min: 65, max: 105 }, unit: "degrees", description: "Knee angle at depth" },
    { name: "Hip Rotation", professionalAverage: 30, optimalRange: { min: 20, max: 40 }, unit: "degrees", description: "Hip hinge (more upright)" },
    { name: "Spine Extension", professionalAverage: 12, optimalRange: { min: 5, max: 20 }, unit: "degrees", description: "More upright torso" },
    { name: "Elbow Flexion", professionalAverage: 90, optimalRange: { min: 70, max: 110 }, unit: "degrees", description: "Rack position elbows" },
    { name: "Weight Transfer", professionalAverage: 8, optimalRange: { min: 0, max: 18 }, unit: "percent", description: "Mid-foot balance" }
  ]
};

const powerliftingDeadliftReference: ProfessionalReference = {
  motionName: "Deadlift",
  category: "weightlifting",
  subcategory: "powerlifting",
  source: "Powerlifting Deadlift Biomechanics",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 45, optimalRange: { min: 35, max: 60 }, unit: "degrees", description: "Hip hinge angle" },
    { name: "Knee Flexion", professionalAverage: 140, optimalRange: { min: 125, max: 155 }, unit: "degrees", description: "Knee angle at start" },
    { name: "Spine Extension", professionalAverage: 15, optimalRange: { min: 5, max: 25 }, unit: "degrees", description: "Back angle (neutral spine)" },
    { name: "Weight Transfer", professionalAverage: 5, optimalRange: { min: 0, max: 15 }, unit: "percent", description: "Mid-foot pressure" },
    { name: "Shoulder External Rotation", professionalAverage: 20, optimalRange: { min: 10, max: 30 }, unit: "degrees", description: "Lat engagement" }
  ]
};

const powerliftingSumoDeadliftReference: ProfessionalReference = { ...powerliftingDeadliftReference, motionName: "Sumo Deadlift" };

const powerliftingBenchReference: ProfessionalReference = {
  motionName: "Bench Press",
  category: "weightlifting",
  subcategory: "powerlifting",
  source: "Powerlifting Bench Press Biomechanics",
  metrics: [
    { name: "Elbow Flexion", professionalAverage: 90, optimalRange: { min: 75, max: 105 }, unit: "degrees", description: "Elbow angle at chest" },
    { name: "Shoulder External Rotation", professionalAverage: 45, optimalRange: { min: 35, max: 55 }, unit: "degrees", description: "Shoulder retraction angle" },
    { name: "Spine Extension", professionalAverage: 15, optimalRange: { min: 8, max: 22 }, unit: "degrees", description: "Upper back arch" },
    { name: "Foot Positioning", professionalAverage: 40, optimalRange: { min: 30, max: 50 }, unit: "degrees", description: "Foot placement for leg drive" }
  ]
};

const powerliftingInclineBenchReference: ProfessionalReference = { ...powerliftingBenchReference, motionName: "Incline Bench Press" };

const powerliftingOverheadPressReference: ProfessionalReference = {
  motionName: "Overhead Press",
  category: "weightlifting",
  subcategory: "powerlifting",
  source: "Overhead Press Biomechanics",
  metrics: [
    { name: "Shoulder External Rotation", professionalAverage: 90, optimalRange: { min: 75, max: 105 }, unit: "degrees", description: "Overhead lockout position" },
    { name: "Elbow Flexion", professionalAverage: 170, optimalRange: { min: 155, max: 180 }, unit: "degrees", description: "Full lockout" },
    { name: "Spine Extension", professionalAverage: 10, optimalRange: { min: 3, max: 18 }, unit: "degrees", description: "Slight lean back" },
    { name: "Hip Rotation", professionalAverage: 10, optimalRange: { min: 0, max: 20 }, unit: "degrees", description: "Hip push-through at lockout" },
    { name: "Knee Flexion", professionalAverage: 170, optimalRange: { min: 160, max: 180 }, unit: "degrees", description: "Straight legs at lockout" }
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
  source: "Kettlebell Swing Biomechanics",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 55, optimalRange: { min: 40, max: 70 }, unit: "degrees", description: "Hip snap angle" },
    { name: "Knee Flexion", professionalAverage: 145, optimalRange: { min: 130, max: 160 }, unit: "degrees", description: "Knee angle (hinge not squat)" },
    { name: "Spine Extension", professionalAverage: 8, optimalRange: { min: 0, max: 15 }, unit: "degrees", description: "Neutral spine maintained" },
    { name: "Weight Transfer", professionalAverage: 50, optimalRange: { min: 40, max: 60 }, unit: "percent", description: "Balanced at top" }
  ]
};

const kettlebellSnatchReference: ProfessionalReference = {
  motionName: "Kettlebell Snatch",
  category: "weightlifting",
  subcategory: "kettlebell",
  source: "Kettlebell Snatch Biomechanics",
  metrics: [
    { name: "Hip Rotation", professionalAverage: 55, optimalRange: { min: 40, max: 70 }, unit: "degrees", description: "Hip drive" },
    { name: "Shoulder External Rotation", professionalAverage: 160, optimalRange: { min: 145, max: 175 }, unit: "degrees", description: "Overhead lockout" },
    { name: "Knee Flexion", professionalAverage: 150, optimalRange: { min: 135, max: 165 }, unit: "degrees", description: "Near-straight legs at lockout" },
    { name: "Spine Extension", professionalAverage: 5, optimalRange: { min: 0, max: 12 }, unit: "degrees", description: "Neutral spine at lockout" },
    { name: "Weight Transfer", professionalAverage: 50, optimalRange: { min: 40, max: 60 }, unit: "percent", description: "Centered at lockout" }
  ]
};

const kettlebellCleanReference: ProfessionalReference = { ...kettlebellSwingReference, motionName: "Kettlebell Clean" };
const kettlebellPressReference: ProfessionalReference = { ...powerliftingOverheadPressReference, motionName: "Kettlebell Press", subcategory: "kettlebell" };
const kettlebellDeadliftReference: ProfessionalReference = { ...powerliftingDeadliftReference, motionName: "Kettlebell Deadlift", subcategory: "kettlebell" };
const kettlebellGobletSquatReference: ProfessionalReference = { ...powerliftingSquatReference, motionName: "Goblet Squat", subcategory: "kettlebell" };
const kettlebellTurkishGetUpReference: ProfessionalReference = {
  motionName: "Turkish Get-Up",
  category: "weightlifting",
  subcategory: "kettlebell",
  source: "Turkish Get-Up Biomechanics",
  metrics: [
    { name: "Shoulder External Rotation", professionalAverage: 170, optimalRange: { min: 155, max: 180 }, unit: "degrees", description: "Overhead stability" },
    { name: "Hip Rotation", professionalAverage: 30, optimalRange: { min: 20, max: 40 }, unit: "degrees", description: "Hip hinge during transitions" },
    { name: "Spine Extension", professionalAverage: 5, optimalRange: { min: 0, max: 12 }, unit: "degrees", description: "Neutral trunk throughout" },
    { name: "Knee Flexion", professionalAverage: 90, optimalRange: { min: 70, max: 110 }, unit: "degrees", description: "Half-kneeling position" }
  ]
};
const kettlebellWindmillReference: ProfessionalReference = { ...kettlebellTurkishGetUpReference, motionName: "Kettlebell Windmill" };
const kettlebellRowReference: ProfessionalReference = { ...powerliftingDeadliftReference, motionName: "Kettlebell Row", subcategory: "kettlebell" };

// ============================================================
// RECOVERY — PHYSICAL THERAPY
// ============================================================

const ptGenericReference: ProfessionalReference = {
  motionName: "Physical Therapy Exercise",
  category: "recovery",
  subcategory: "physical-therapy",
  source: "Physical Therapy Guidelines",
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
