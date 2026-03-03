/**
 * Phase-Aware Coaching System
 * 
 * Analyzes recorded frames from a rep to identify which biomechanical phase
 * had the biggest issues, then provides contextual coaching cues like:
 *   "During the cocking phase, tuck your elbow tighter"
 *   "As you release, snap your wrist through the target"
 *   "In your setup, widen your stance for a stronger base"
 * 
 * Each motion type defines its own phases with:
 *   - Phase name and spoken prefix ("During the backswing…", "As you release…")
 *   - Expected metric ranges per phase
 *   - Phase-specific coaching cues when metrics deviate
 * 
 * Phase detection uses the per-frame metric snapshots already recorded
 * during capture (recordedFrames[].metrics) to segment the rep into phases
 * based on metric thresholds and velocity patterns.
 */

// ============================================================
// TYPES
// ============================================================

export interface FrameMetrics {
  hipRotation: number;
  shoulderRotation: number;
  rightElbowAngle: number;
  leftElbowAngle: number;
  rightKneeFlexion: number;
  leftKneeFlexion: number;
  spineAngle: number;
  rightShoulderAngle: number;
  leftShoulderAngle: number;
  footPositioning: number;
  weightTransfer: number;
}

export interface PhaseMetricExpectation {
  /** Optimal range for this metric during this phase */
  optimalRange: [number, number];
  /** Priority within this phase (1 = most important) */
  priority: number;
  /** Coaching cue when the metric is too low during this phase */
  tooLow: string;
  /** Short speech version */
  tooLowSpeech: string;
  /** Coaching cue when the metric is too high during this phase */
  tooHigh: string;
  /** Short speech version */
  tooHighSpeech: string;
  /** Positive cue when in range */
  positive: string;
  positiveSpeech: string;
}

export interface MotionPhase {
  /** Phase name (e.g., "Cocking Phase", "Release") */
  name: string;
  /** Spoken prefix for coaching cues (e.g., "During the cocking phase,") */
  spokenPrefix: string;
  /** Display prefix for written cues (e.g., "During the cocking phase,") */
  displayPrefix: string;
  /** How to detect this phase from frame data */
  detection: PhaseDetectionRule;
  /** Expected metric values during this phase */
  expectations: Partial<Record<keyof FrameMetrics, PhaseMetricExpectation>>;
}

export interface PhaseDetectionRule {
  /** 
   * Which metric to use as the primary phase indicator.
   * The phase is detected by watching this metric cross thresholds.
   */
  primaryMetric: keyof FrameMetrics;
  /** 
   * Phase is active when the primary metric is within this range.
   * For velocity-based detection, this represents the velocity range.
   */
  range: [number, number];
  /** 
   * Optional: require this metric to also be in range.
   * Helps disambiguate phases that overlap on the primary metric.
   */
  secondaryMetric?: keyof FrameMetrics;
  secondaryRange?: [number, number];
  /**
   * Approximate position in the rep (0.0 = start, 1.0 = end).
   * Used as a fallback when metric-based detection is ambiguous.
   */
  temporalRange: [number, number];
}

export interface MotionPhaseProfile {
  /** The motion this profile applies to */
  motionName: string;
  /** Ordered list of phases in this motion */
  phases: MotionPhase[];
}

export interface PhaseEvaluation {
  /** Which phase this feedback is about */
  phaseName: string;
  /** The display prefix (e.g., "During the cocking phase,") */
  displayPrefix: string;
  /** The spoken prefix */
  spokenPrefix: string;
  /** The metric that was off */
  metricKey: string;
  /** positive or correction */
  type: 'positive' | 'correction';
  /** The full coaching cue */
  message: string;
  /** Short speech version */
  speech: string;
  /** Detail with numbers */
  detail: string;
  /** Priority (lower = more important) */
  priority: number;
}

// ============================================================
// MOTION PHASE DEFINITIONS
// ============================================================

/**
 * Football Throw Phases
 * Based on QB throwing mechanics:
 * 1. Setup/Stance → 2. Cocking (arm back, hips loaded) → 3. Acceleration (hip drive) → 4. Release → 5. Follow-through
 */
const footballThrowPhases: MotionPhaseProfile = {
  motionName: "Football Throw",
  phases: [
    {
      name: "Setup",
      spokenPrefix: "In your setup,",
      displayPrefix: "In your setup,",
      detection: {
        primaryMetric: "hipRotation",
        range: [0, 15],
        temporalRange: [0.0, 0.15],
      },
      expectations: {
        rightKneeFlexion: {
          optimalRange: [140, 165],
          priority: 1,
          tooLow: "bend your knees more — get into an athletic stance",
          tooLowSpeech: "Bend knees, athletic stance!",
          tooHigh: "don't stand so stiff — soften your knees",
          tooHighSpeech: "Soften your knees!",
          positive: "solid athletic base",
          positiveSpeech: "Good base!",
        },
        spineAngle: {
          optimalRange: [0, 10],
          priority: 2,
          tooLow: "stay tall — chest up, eyes on target",
          tooLowSpeech: "Chest up, eyes on target!",
          tooHigh: "you're leaning forward — stack your shoulders over your hips",
          tooHighSpeech: "Stack shoulders over hips!",
          positive: "great posture",
          positiveSpeech: "Great posture!",
        },
        footPositioning: {
          optimalRange: [20, 60],
          priority: 3,
          tooLow: "widen your stance for a stronger base",
          tooLowSpeech: "Widen your stance!",
          tooHigh: "bring your feet in — too wide reduces power transfer",
          tooHighSpeech: "Feet too wide, bring them in!",
          positive: "good foot width",
          positiveSpeech: "Good stance!",
        },
      },
    },
    {
      name: "Cocking Phase",
      spokenPrefix: "During the cocking phase,",
      displayPrefix: "During the cocking phase,",
      detection: {
        primaryMetric: "rightElbowAngle",
        range: [60, 110],
        secondaryMetric: "hipRotation",
        secondaryRange: [5, 40],
        temporalRange: [0.15, 0.40],
      },
      expectations: {
        rightElbowAngle: {
          optimalRange: [80, 105],
          priority: 1,
          tooLow: "keep your elbow at a sharp L — don't let it collapse",
          tooLowSpeech: "Keep a sharp L with your elbow!",
          tooHigh: "bring the ball higher — cock your arm back with elbow at 90°",
          tooHighSpeech: "Cock arm back, elbow at 90!",
          positive: "perfect L-shape with your throwing arm",
          positiveSpeech: "Perfect arm position!",
        },
        shoulderRotation: {
          optimalRange: [15, 50],
          priority: 2,
          tooLow: "load your shoulders more — turn away from the target",
          tooLowSpeech: "Turn shoulders away from target!",
          tooHigh: "you're over-rotating — keep your front shoulder pointed at the target",
          tooHighSpeech: "Front shoulder to target!",
          positive: "great shoulder load",
          positiveSpeech: "Good shoulder load!",
        },
        hipRotation: {
          optimalRange: [10, 40],
          priority: 3,
          tooLow: "coil your hips back — load the spring before you throw",
          tooLowSpeech: "Coil hips back, load the spring!",
          tooHigh: "don't open your hips yet — keep them closed and loaded",
          tooHighSpeech: "Keep hips closed and loaded!",
          positive: "hips are loaded and ready",
          positiveSpeech: "Hips loaded!",
        },
      },
    },
    {
      name: "Acceleration",
      spokenPrefix: "As you accelerate,",
      displayPrefix: "As you accelerate,",
      detection: {
        primaryMetric: "hipRotation",
        range: [30, 70],
        temporalRange: [0.40, 0.65],
      },
      expectations: {
        hipRotation: {
          optimalRange: [35, 75],
          priority: 1,
          tooLow: "drive your hips harder — lead with your belt buckle toward the target",
          tooLowSpeech: "Drive hips, belt buckle to target!",
          tooHigh: "you're spinning out — stay connected to the ground through your back foot",
          tooHighSpeech: "Stay connected to the ground!",
          positive: "explosive hip drive",
          positiveSpeech: "Explosive hips!",
        },
        weightTransfer: {
          optimalRange: [30, 70],
          priority: 2,
          tooLow: "shift your weight forward — push off your back foot",
          tooLowSpeech: "Push off back foot!",
          tooHigh: "you're falling forward — stay balanced as you throw",
          tooHighSpeech: "Stay balanced!",
          positive: "smooth weight transfer",
          positiveSpeech: "Smooth transfer!",
        },
        leftKneeFlexion: {
          optimalRange: [155, 180],
          priority: 3,
          tooLow: "stiffen your front leg — be a firm post to throw over",
          tooLowSpeech: "Stiffen front leg, firm post!",
          tooHigh: "good front leg brace",
          tooHighSpeech: "Good brace!",
          positive: "solid front leg brace",
          positiveSpeech: "Solid brace!",
        },
      },
    },
    {
      name: "Release",
      spokenPrefix: "As you release,",
      displayPrefix: "As you release,",
      detection: {
        primaryMetric: "hipRotation",
        range: [50, 90],
        secondaryMetric: "rightElbowAngle",
        secondaryRange: [100, 170],
        temporalRange: [0.55, 0.75],
      },
      expectations: {
        rightElbowAngle: {
          optimalRange: [120, 170],
          priority: 1,
          tooLow: "extend your arm fully — snap the ball out in front",
          tooLowSpeech: "Extend arm, snap ball out!",
          tooHigh: "good arm extension on release",
          tooHighSpeech: "Good extension!",
          positive: "clean release point",
          positiveSpeech: "Clean release!",
        },
        spineAngle: {
          optimalRange: [0, 18],
          priority: 2,
          tooLow: "stay tall through the release — don't drop your shoulder",
          tooLowSpeech: "Stay tall through release!",
          tooHigh: "you're lunging forward — throw from a tall column",
          tooHighSpeech: "Throw from a tall column!",
          positive: "great posture through release",
          positiveSpeech: "Great posture!",
        },
      },
    },
    {
      name: "Follow-Through",
      spokenPrefix: "On your follow-through,",
      displayPrefix: "On your follow-through,",
      detection: {
        primaryMetric: "hipRotation",
        range: [60, 120],
        temporalRange: [0.75, 1.0],
      },
      expectations: {
        hipRotation: {
          optimalRange: [60, 100],
          priority: 1,
          tooLow: "let your hips finish the rotation — don't cut it short",
          tooLowSpeech: "Let hips finish rotating!",
          tooHigh: "good full rotation",
          tooHighSpeech: "Full rotation!",
          positive: "complete hip rotation",
          positiveSpeech: "Complete rotation!",
        },
        weightTransfer: {
          optimalRange: [50, 90],
          priority: 2,
          tooLow: "commit to the throw — finish with your weight on your front foot",
          tooLowSpeech: "Weight to front foot!",
          tooHigh: "you're falling forward — decelerate with control",
          tooHighSpeech: "Decelerate with control!",
          positive: "balanced finish",
          positiveSpeech: "Balanced finish!",
        },
      },
    },
  ],
};

/**
 * Kettlebell Swing Phases
 * 1. Hike/Backswing → 2. Hip Drive → 3. Float/Peak → 4. Downswing/Return
 */
const kettlebellSwingPhases: MotionPhaseProfile = {
  motionName: "Kettlebell Swing",
  phases: [
    {
      name: "Backswing",
      spokenPrefix: "During the backswing,",
      displayPrefix: "During the backswing,",
      detection: {
        primaryMetric: "hipRotation",
        range: [0, 20],
        temporalRange: [0.0, 0.30],
      },
      expectations: {
        spineAngle: {
          optimalRange: [0, 20],
          priority: 1,
          tooLow: "keep your back flat — proud chest as you hinge",
          tooLowSpeech: "Flat back, proud chest!",
          tooHigh: "you're rounding — push your hips back, not your shoulders down",
          tooHighSpeech: "Push hips back, not shoulders down!",
          positive: "great flat back position",
          positiveSpeech: "Great back position!",
        },
        rightKneeFlexion: {
          optimalRange: [130, 165],
          priority: 2,
          tooLow: "don't squat the swing — push your hips back with straighter legs",
          tooLowSpeech: "Push hips back, straighter legs!",
          tooHigh: "soften your knees slightly — don't lock them out",
          tooHighSpeech: "Soften knees slightly!",
          positive: "good hinge, not a squat",
          positiveSpeech: "Good hinge!",
        },
        shoulderRotation: {
          optimalRange: [0, 30],
          priority: 3,
          tooLow: "pack your shoulders — pull them into your back pockets",
          tooLowSpeech: "Pack shoulders back!",
          tooHigh: "don't shrug — keep your shoulders away from your ears",
          tooHighSpeech: "Shoulders away from ears!",
          positive: "shoulders packed nicely",
          positiveSpeech: "Shoulders packed!",
        },
      },
    },
    {
      name: "Hip Drive",
      spokenPrefix: "At the hip snap,",
      displayPrefix: "At the hip snap,",
      detection: {
        primaryMetric: "hipRotation",
        range: [20, 70],
        temporalRange: [0.25, 0.55],
      },
      expectations: {
        hipRotation: {
          optimalRange: [30, 80],
          priority: 1,
          tooLow: "snap your hips harder — imagine slamming a car door with your butt",
          tooLowSpeech: "Snap hips harder!",
          tooHigh: "don't over-extend — lock out tall, don't lean back",
          tooHighSpeech: "Lock out tall, don't lean back!",
          positive: "powerful hip snap",
          positiveSpeech: "Powerful snap!",
        },
        rightElbowAngle: {
          optimalRange: [155, 180],
          priority: 2,
          tooLow: "keep your arms straight — the bell swings from your hips, not your arms",
          tooLowSpeech: "Arms straight, swing from hips!",
          tooHigh: "good straight arms",
          tooHighSpeech: "Good arms!",
          positive: "arms are connected, hips doing the work",
          positiveSpeech: "Hips doing the work!",
        },
        spineAngle: {
          optimalRange: [0, 12],
          priority: 3,
          tooLow: "stand tall at the top — stack ribs over hips",
          tooLowSpeech: "Stand tall, ribs over hips!",
          tooHigh: "you're leaning back — finish tall, not arched",
          tooHighSpeech: "Finish tall, not arched!",
          positive: "tall finish position",
          positiveSpeech: "Tall finish!",
        },
      },
    },
    {
      name: "Float",
      spokenPrefix: "At the top of the swing,",
      displayPrefix: "At the top of the swing,",
      detection: {
        primaryMetric: "hipRotation",
        range: [40, 90],
        temporalRange: [0.45, 0.65],
      },
      expectations: {
        rightKneeFlexion: {
          optimalRange: [165, 180],
          priority: 1,
          tooLow: "stand fully tall at the top — squeeze your quads and glutes",
          tooLowSpeech: "Stand tall, squeeze glutes!",
          tooHigh: "good lockout",
          tooHighSpeech: "Good lockout!",
          positive: "full lockout at the top",
          positiveSpeech: "Full lockout!",
        },
        spineAngle: {
          optimalRange: [0, 8],
          priority: 2,
          tooLow: "brace your core at the top — own the position",
          tooLowSpeech: "Brace core at the top!",
          tooHigh: "don't lean back at the top — stay stacked",
          tooHighSpeech: "Stay stacked at the top!",
          positive: "strong top position",
          positiveSpeech: "Strong position!",
        },
      },
    },
    {
      name: "Downswing",
      spokenPrefix: "On the way down,",
      displayPrefix: "On the way down,",
      detection: {
        primaryMetric: "hipRotation",
        range: [0, 40],
        temporalRange: [0.65, 1.0],
      },
      expectations: {
        spineAngle: {
          optimalRange: [0, 20],
          priority: 1,
          tooLow: "keep your back flat as the bell drops — don't let it pull you forward",
          tooLowSpeech: "Flat back as bell drops!",
          tooHigh: "you're rounding on the way down — hinge at your hips, not your back",
          tooHighSpeech: "Hinge at hips, not back!",
          positive: "controlled descent",
          positiveSpeech: "Controlled descent!",
        },
        rightElbowAngle: {
          optimalRange: [155, 180],
          priority: 2,
          tooLow: "keep arms straight on the downswing — wait for the bell to pull you",
          tooLowSpeech: "Arms straight, let bell pull!",
          tooHigh: "good arm connection",
          tooHighSpeech: "Good connection!",
          positive: "arms connected to the body",
          positiveSpeech: "Arms connected!",
        },
      },
    },
  ],
};

/**
 * Kettlebell Snatch Phases
 * 1. Backswing → 2. Pull → 3. Punch-Through/Lockout → 4. Descent
 */
const kettlebellSnatchPhases: MotionPhaseProfile = {
  motionName: "Kettlebell Snatch",
  phases: [
    {
      name: "Backswing",
      spokenPrefix: "During the backswing,",
      displayPrefix: "During the backswing,",
      detection: {
        primaryMetric: "hipRotation",
        range: [0, 20],
        temporalRange: [0.0, 0.25],
      },
      expectations: {
        spineAngle: {
          optimalRange: [0, 18],
          priority: 1,
          tooLow: "keep your back flat — proud chest as you load",
          tooLowSpeech: "Flat back, proud chest!",
          tooHigh: "you're rounding — push hips back, keep chest up",
          tooHighSpeech: "Push hips back, chest up!",
          positive: "great hinge position",
          positiveSpeech: "Great hinge!",
        },
        hipRotation: {
          optimalRange: [0, 25],
          priority: 2,
          tooLow: "load your hips deeper — sit back into the hinge",
          tooLowSpeech: "Sit back into the hinge!",
          tooHigh: "don't open your hips yet — stay loaded",
          tooHighSpeech: "Stay loaded!",
          positive: "hips loaded",
          positiveSpeech: "Hips loaded!",
        },
      },
    },
    {
      name: "High Pull",
      spokenPrefix: "During the pull,",
      displayPrefix: "During the pull,",
      detection: {
        primaryMetric: "rightElbowAngle",
        range: [70, 140],
        temporalRange: [0.25, 0.55],
      },
      expectations: {
        rightElbowAngle: {
          optimalRange: [80, 130],
          priority: 1,
          tooLow: "pull the bell close — elbow high, zip it up like a jacket",
          tooLowSpeech: "Elbow high, zip it up!",
          tooHigh: "keep the bell closer to your body — don't let it arc away",
          tooHighSpeech: "Keep bell close to body!",
          positive: "tight pull path",
          positiveSpeech: "Tight pull!",
        },
        hipRotation: {
          optimalRange: [30, 75],
          priority: 2,
          tooLow: "drive your hips harder — the pull starts from the hips",
          tooLowSpeech: "Drive hips, pull starts from hips!",
          tooHigh: "good hip drive",
          tooHighSpeech: "Good hip drive!",
          positive: "explosive hip drive into the pull",
          positiveSpeech: "Explosive pull!",
        },
      },
    },
    {
      name: "Punch-Through",
      spokenPrefix: "As you punch through,",
      displayPrefix: "As you punch through,",
      detection: {
        primaryMetric: "rightElbowAngle",
        range: [140, 180],
        temporalRange: [0.50, 0.75],
      },
      expectations: {
        rightElbowAngle: {
          optimalRange: [160, 180],
          priority: 1,
          tooLow: "punch your hand through the handle — lock out strong overhead",
          tooLowSpeech: "Punch through, lock out overhead!",
          tooHigh: "great lockout",
          tooHighSpeech: "Great lockout!",
          positive: "strong overhead lockout",
          positiveSpeech: "Strong lockout!",
        },
        spineAngle: {
          optimalRange: [0, 10],
          priority: 2,
          tooLow: "stand tall at lockout — stack your ribs over your hips",
          tooLowSpeech: "Stand tall at lockout!",
          tooHigh: "don't lean back — stay stacked and tight",
          tooHighSpeech: "Stay stacked and tight!",
          positive: "tall, stacked lockout",
          positiveSpeech: "Stacked lockout!",
        },
      },
    },
    {
      name: "Descent",
      spokenPrefix: "As you bring it down,",
      displayPrefix: "As you bring it down,",
      detection: {
        primaryMetric: "rightElbowAngle",
        range: [80, 160],
        temporalRange: [0.75, 1.0],
      },
      expectations: {
        spineAngle: {
          optimalRange: [0, 18],
          priority: 1,
          tooLow: "control the descent — keep your back flat as you absorb",
          tooLowSpeech: "Control descent, flat back!",
          tooHigh: "don't let the bell pull you forward — hinge, don't round",
          tooHighSpeech: "Hinge, don't round!",
          positive: "controlled return",
          positiveSpeech: "Controlled return!",
        },
      },
    },
  ],
};

/**
 * Golf Swing Phases
 * 1. Address/Setup → 2. Backswing → 3. Downswing → 4. Impact → 5. Follow-Through
 */
const golfSwingPhases: MotionPhaseProfile = {
  motionName: "Golf Swing",
  phases: [
    {
      name: "Address",
      spokenPrefix: "At address,",
      displayPrefix: "At address,",
      detection: {
        primaryMetric: "hipRotation",
        range: [0, 10],
        temporalRange: [0.0, 0.12],
      },
      expectations: {
        rightKneeFlexion: {
          optimalRange: [140, 165],
          priority: 1,
          tooLow: "flex your knees more — get into an athletic position",
          tooLowSpeech: "Flex knees, athletic position!",
          tooHigh: "soften your knees — don't stand rigid",
          tooHighSpeech: "Soften knees!",
          positive: "athletic setup position",
          positiveSpeech: "Athletic setup!",
        },
        spineAngle: {
          optimalRange: [10, 30],
          priority: 2,
          tooLow: "tilt forward from your hips — let your arms hang naturally",
          tooLowSpeech: "Tilt from hips, arms hang!",
          tooHigh: "you're bent over too much — stand a bit taller",
          tooHighSpeech: "Stand a bit taller!",
          positive: "good spine tilt at address",
          positiveSpeech: "Good spine tilt!",
        },
      },
    },
    {
      name: "Backswing",
      spokenPrefix: "During the backswing,",
      displayPrefix: "During the backswing,",
      detection: {
        primaryMetric: "shoulderRotation",
        range: [15, 60],
        temporalRange: [0.10, 0.40],
      },
      expectations: {
        shoulderRotation: {
          optimalRange: [30, 70],
          priority: 1,
          tooLow: "turn your shoulders more — get your back facing the target",
          tooLowSpeech: "Turn shoulders, back to target!",
          tooHigh: "you're over-rotating — keep your lower body stable",
          tooHighSpeech: "Keep lower body stable!",
          positive: "full shoulder turn",
          positiveSpeech: "Full shoulder turn!",
        },
        hipRotation: {
          optimalRange: [15, 45],
          priority: 2,
          tooLow: "let your hips coil — resist with your lower body to build torque",
          tooLowSpeech: "Coil hips, build torque!",
          tooHigh: "restrict your hip turn — the power comes from the X-factor between hips and shoulders",
          tooHighSpeech: "Restrict hip turn for power!",
          positive: "great hip-shoulder separation",
          positiveSpeech: "Great separation!",
        },
        rightKneeFlexion: {
          optimalRange: [135, 165],
          priority: 3,
          tooLow: "maintain your knee flex — don't sway off the ball",
          tooLowSpeech: "Maintain knee flex!",
          tooHigh: "keep some flex in your trail knee — don't straighten it",
          tooHighSpeech: "Keep flex in trail knee!",
          positive: "stable lower body",
          positiveSpeech: "Stable base!",
        },
      },
    },
    {
      name: "Downswing",
      spokenPrefix: "On the downswing,",
      displayPrefix: "On the downswing,",
      detection: {
        primaryMetric: "hipRotation",
        range: [30, 65],
        temporalRange: [0.40, 0.60],
      },
      expectations: {
        hipRotation: {
          optimalRange: [35, 70],
          priority: 1,
          tooLow: "fire your hips first — start the downswing from the ground up",
          tooLowSpeech: "Fire hips first, ground up!",
          tooHigh: "don't spin out — keep your head behind the ball",
          tooHighSpeech: "Head behind the ball!",
          positive: "hips leading the downswing",
          positiveSpeech: "Hips leading!",
        },
        weightTransfer: {
          optimalRange: [30, 70],
          priority: 2,
          tooLow: "shift to your front foot — bump your hip toward the target",
          tooLowSpeech: "Shift to front foot!",
          tooHigh: "you're sliding too much — rotate, don't slide",
          tooHighSpeech: "Rotate, don't slide!",
          positive: "smooth weight shift",
          positiveSpeech: "Smooth shift!",
        },
      },
    },
    {
      name: "Impact",
      spokenPrefix: "At impact,",
      displayPrefix: "At impact,",
      detection: {
        primaryMetric: "hipRotation",
        range: [50, 80],
        temporalRange: [0.55, 0.70],
      },
      expectations: {
        leftKneeFlexion: {
          optimalRange: [155, 180],
          priority: 1,
          tooLow: "straighten your lead leg at impact — post up for power",
          tooLowSpeech: "Straighten lead leg, post up!",
          tooHigh: "good lead leg post",
          tooHighSpeech: "Good post!",
          positive: "strong lead leg at impact",
          positiveSpeech: "Strong impact!",
        },
        spineAngle: {
          optimalRange: [8, 25],
          priority: 2,
          tooLow: "maintain your spine angle through impact — don't stand up",
          tooLowSpeech: "Maintain spine angle!",
          tooHigh: "you're diving into the ball — stay in your posture",
          tooHighSpeech: "Stay in your posture!",
          positive: "maintained spine angle",
          positiveSpeech: "Great posture!",
        },
      },
    },
    {
      name: "Follow-Through",
      spokenPrefix: "On the follow-through,",
      displayPrefix: "On the follow-through,",
      detection: {
        primaryMetric: "hipRotation",
        range: [70, 120],
        temporalRange: [0.70, 1.0],
      },
      expectations: {
        hipRotation: {
          optimalRange: [75, 110],
          priority: 1,
          tooLow: "let your body fully rotate — finish facing the target",
          tooLowSpeech: "Fully rotate, face the target!",
          tooHigh: "good full rotation",
          tooHighSpeech: "Full rotation!",
          positive: "complete rotation to the target",
          positiveSpeech: "Complete rotation!",
        },
        weightTransfer: {
          optimalRange: [60, 95],
          priority: 2,
          tooLow: "finish on your front foot — commit to the swing",
          tooLowSpeech: "Finish on front foot!",
          tooHigh: "balanced finish",
          tooHighSpeech: "Balanced!",
          positive: "balanced finish on front foot",
          positiveSpeech: "Balanced finish!",
        },
      },
    },
  ],
};

/**
 * Baseball Pitch Phases
 * 1. Windup → 2. Stride/Cocking → 3. Acceleration → 4. Release → 5. Deceleration
 */
const baseballPitchPhases: MotionPhaseProfile = {
  motionName: "Baseball Pitch",
  phases: [
    {
      name: "Windup",
      spokenPrefix: "During the windup,",
      displayPrefix: "During the windup,",
      detection: {
        primaryMetric: "hipRotation",
        range: [0, 15],
        temporalRange: [0.0, 0.20],
      },
      expectations: {
        spineAngle: {
          optimalRange: [0, 12],
          priority: 1,
          tooLow: "stay tall and balanced — control your center of gravity",
          tooLowSpeech: "Stay tall and balanced!",
          tooHigh: "you're leaning — stay stacked during the windup",
          tooHighSpeech: "Stay stacked in the windup!",
          positive: "controlled windup",
          positiveSpeech: "Controlled windup!",
        },
        rightKneeFlexion: {
          optimalRange: [100, 160],
          priority: 2,
          tooLow: "drive your knee up higher — load more energy",
          tooLowSpeech: "Drive knee higher!",
          tooHigh: "good leg lift",
          tooHighSpeech: "Good leg lift!",
          positive: "strong leg lift",
          positiveSpeech: "Strong leg lift!",
        },
      },
    },
    {
      name: "Stride & Cocking",
      spokenPrefix: "During the stride,",
      displayPrefix: "During the stride,",
      detection: {
        primaryMetric: "rightElbowAngle",
        range: [60, 110],
        temporalRange: [0.20, 0.45],
      },
      expectations: {
        rightElbowAngle: {
          optimalRange: [80, 105],
          priority: 1,
          tooLow: "get your arm up — elbow at shoulder height, forearm vertical",
          tooLowSpeech: "Arm up, elbow at shoulder height!",
          tooHigh: "cock your arm back more — load the throwing position",
          tooHighSpeech: "Cock arm back more!",
          positive: "perfect arm slot",
          positiveSpeech: "Perfect arm slot!",
        },
        shoulderRotation: {
          optimalRange: [20, 55],
          priority: 2,
          tooLow: "separate your shoulders from your hips — build that torque",
          tooLowSpeech: "Separate shoulders from hips!",
          tooHigh: "keep your front shoulder closed longer",
          tooHighSpeech: "Front shoulder closed longer!",
          positive: "great shoulder-hip separation",
          positiveSpeech: "Great separation!",
        },
      },
    },
    {
      name: "Acceleration",
      spokenPrefix: "As you accelerate,",
      displayPrefix: "As you accelerate,",
      detection: {
        primaryMetric: "hipRotation",
        range: [30, 70],
        temporalRange: [0.45, 0.65],
      },
      expectations: {
        hipRotation: {
          optimalRange: [35, 75],
          priority: 1,
          tooLow: "lead with your hips — let them pull your arm through",
          tooLowSpeech: "Lead with hips!",
          tooHigh: "don't spin open — stay connected",
          tooHighSpeech: "Stay connected!",
          positive: "hips leading the arm",
          positiveSpeech: "Hips leading!",
        },
        leftKneeFlexion: {
          optimalRange: [155, 180],
          priority: 2,
          tooLow: "brace your front leg — firm up to throw over",
          tooLowSpeech: "Brace front leg!",
          tooHigh: "good front leg brace",
          tooHighSpeech: "Good brace!",
          positive: "solid front leg brace",
          positiveSpeech: "Solid brace!",
        },
      },
    },
    {
      name: "Release",
      spokenPrefix: "At release,",
      displayPrefix: "At release,",
      detection: {
        primaryMetric: "rightElbowAngle",
        range: [120, 175],
        temporalRange: [0.60, 0.80],
      },
      expectations: {
        rightElbowAngle: {
          optimalRange: [140, 175],
          priority: 1,
          tooLow: "extend fully through the release — get out front",
          tooLowSpeech: "Extend fully, get out front!",
          tooHigh: "great arm extension",
          tooHighSpeech: "Great extension!",
          positive: "full extension at release",
          positiveSpeech: "Full extension!",
        },
        spineAngle: {
          optimalRange: [5, 22],
          priority: 2,
          tooLow: "stay over the rubber — don't pull off",
          tooLowSpeech: "Stay over the rubber!",
          tooHigh: "you're falling off — maintain your posture",
          tooHighSpeech: "Maintain posture!",
          positive: "great release posture",
          positiveSpeech: "Great posture!",
        },
      },
    },
    {
      name: "Deceleration",
      spokenPrefix: "As you decelerate,",
      displayPrefix: "As you decelerate,",
      detection: {
        primaryMetric: "hipRotation",
        range: [60, 120],
        temporalRange: [0.80, 1.0],
      },
      expectations: {
        hipRotation: {
          optimalRange: [65, 100],
          priority: 1,
          tooLow: "let your body finish rotating — don't fight the momentum",
          tooLowSpeech: "Let body finish rotating!",
          tooHigh: "good deceleration",
          tooHighSpeech: "Good deceleration!",
          positive: "smooth deceleration",
          positiveSpeech: "Smooth deceleration!",
        },
      },
    },
  ],
};

/**
 * Basketball Shot Phases
 * 1. Catch/Setup → 2. Loading/Dip → 3. Rise/Extension → 4. Release/Flick
 */
const basketballShotPhases: MotionPhaseProfile = {
  motionName: "Basketball Shot",
  phases: [
    {
      name: "Catch & Setup",
      spokenPrefix: "On the catch,",
      displayPrefix: "On the catch,",
      detection: {
        primaryMetric: "rightKneeFlexion",
        range: [140, 175],
        temporalRange: [0.0, 0.20],
      },
      expectations: {
        footPositioning: {
          optimalRange: [15, 45],
          priority: 1,
          tooLow: "get your feet set — shoulder width, shooting foot slightly ahead",
          tooLowSpeech: "Get feet set!",
          tooHigh: "bring your feet in — too wide slows your shot",
          tooHighSpeech: "Feet too wide!",
          positive: "feet are set",
          positiveSpeech: "Feet set!",
        },
        spineAngle: {
          optimalRange: [0, 10],
          priority: 2,
          tooLow: "stay upright — don't lean back on the catch",
          tooLowSpeech: "Stay upright on catch!",
          tooHigh: "don't lean forward — stay balanced",
          tooHighSpeech: "Stay balanced!",
          positive: "balanced catch",
          positiveSpeech: "Balanced!",
        },
      },
    },
    {
      name: "Loading Dip",
      spokenPrefix: "As you load,",
      displayPrefix: "As you load,",
      detection: {
        primaryMetric: "rightKneeFlexion",
        range: [110, 155],
        temporalRange: [0.15, 0.40],
      },
      expectations: {
        rightKneeFlexion: {
          optimalRange: [120, 155],
          priority: 1,
          tooLow: "dip deeper — your legs are your power source",
          tooLowSpeech: "Dip deeper, legs are power!",
          tooHigh: "bend your knees more — load the spring",
          tooHighSpeech: "Bend knees, load the spring!",
          positive: "good leg load",
          positiveSpeech: "Good load!",
        },
        rightElbowAngle: {
          optimalRange: [60, 100],
          priority: 2,
          tooLow: "bring the ball to your shot pocket — elbow under the ball",
          tooLowSpeech: "Ball to shot pocket!",
          tooHigh: "tuck your elbow in — keep it under the ball",
          tooHighSpeech: "Elbow under the ball!",
          positive: "ball in the pocket",
          positiveSpeech: "Ball in pocket!",
        },
      },
    },
    {
      name: "Rise & Extension",
      spokenPrefix: "As you rise,",
      displayPrefix: "As you rise,",
      detection: {
        primaryMetric: "rightKneeFlexion",
        range: [150, 180],
        temporalRange: [0.40, 0.70],
      },
      expectations: {
        rightKneeFlexion: {
          optimalRange: [160, 180],
          priority: 1,
          tooLow: "extend your legs fully — power comes from the ground up",
          tooLowSpeech: "Extend legs fully!",
          tooHigh: "good leg extension",
          tooHighSpeech: "Good extension!",
          positive: "full leg drive into the shot",
          positiveSpeech: "Full leg drive!",
        },
        rightElbowAngle: {
          optimalRange: [90, 150],
          priority: 2,
          tooLow: "extend your shooting arm — push the ball up and out",
          tooLowSpeech: "Extend shooting arm!",
          tooHigh: "good arm extension",
          tooHighSpeech: "Good extension!",
          positive: "smooth arm extension",
          positiveSpeech: "Smooth extension!",
        },
      },
    },
    {
      name: "Release & Flick",
      spokenPrefix: "On the release,",
      displayPrefix: "On the release,",
      detection: {
        primaryMetric: "rightElbowAngle",
        range: [150, 180],
        temporalRange: [0.65, 1.0],
      },
      expectations: {
        rightElbowAngle: {
          optimalRange: [160, 180],
          priority: 1,
          tooLow: "extend fully — reach into the cookie jar on the top shelf",
          tooLowSpeech: "Extend fully, cookie jar!",
          tooHigh: "great full extension",
          tooHighSpeech: "Great extension!",
          positive: "full extension with a clean release",
          positiveSpeech: "Clean release!",
        },
        spineAngle: {
          optimalRange: [0, 12],
          priority: 2,
          tooLow: "stay tall on the release — don't fade away",
          tooLowSpeech: "Stay tall, don't fade!",
          tooHigh: "you're leaning forward — shoot straight up",
          tooHighSpeech: "Shoot straight up!",
          positive: "balanced release",
          positiveSpeech: "Balanced release!",
        },
      },
    },
  ],
};

/**
 * Squat Phases
 * 1. Setup → 2. Descent → 3. Hole/Bottom → 4. Ascent
 */
const squatPhases: MotionPhaseProfile = {
  motionName: "Squat",
  phases: [
    {
      name: "Setup",
      spokenPrefix: "In your setup,",
      displayPrefix: "In your setup,",
      detection: {
        primaryMetric: "rightKneeFlexion",
        range: [160, 180],
        temporalRange: [0.0, 0.15],
      },
      expectations: {
        spineAngle: {
          optimalRange: [0, 12],
          priority: 1,
          tooLow: "brace your core — big breath, push belly into your belt",
          tooLowSpeech: "Brace core, big breath!",
          tooHigh: "stand taller — don't lean forward before you start",
          tooHighSpeech: "Stand taller!",
          positive: "braced and ready",
          positiveSpeech: "Braced and ready!",
        },
        footPositioning: {
          optimalRange: [25, 55],
          priority: 2,
          tooLow: "widen your stance — feet shoulder width or slightly wider",
          tooLowSpeech: "Widen stance!",
          tooHigh: "bring your feet in slightly",
          tooHighSpeech: "Feet in slightly!",
          positive: "good stance width",
          positiveSpeech: "Good stance!",
        },
      },
    },
    {
      name: "Descent",
      spokenPrefix: "On the way down,",
      displayPrefix: "On the way down,",
      detection: {
        primaryMetric: "rightKneeFlexion",
        range: [100, 165],
        temporalRange: [0.10, 0.45],
      },
      expectations: {
        rightKneeFlexion: {
          optimalRange: [90, 140],
          priority: 1,
          tooLow: "control the descent — don't dive bomb into the hole",
          tooLowSpeech: "Control the descent!",
          tooHigh: "sit deeper — push your knees out and sit between your legs",
          tooHighSpeech: "Sit deeper, knees out!",
          positive: "controlled descent",
          positiveSpeech: "Controlled descent!",
        },
        spineAngle: {
          optimalRange: [5, 25],
          priority: 2,
          tooLow: "keep your chest up — don't let the bar pull you forward",
          tooLowSpeech: "Chest up!",
          tooHigh: "you're tipping forward — sit back more, chest up",
          tooHighSpeech: "Sit back, chest up!",
          positive: "chest is up, back is flat",
          positiveSpeech: "Chest up, flat back!",
        },
      },
    },
    {
      name: "Bottom Position",
      spokenPrefix: "In the hole,",
      displayPrefix: "In the hole,",
      detection: {
        primaryMetric: "rightKneeFlexion",
        range: [80, 120],
        temporalRange: [0.35, 0.60],
      },
      expectations: {
        rightKneeFlexion: {
          optimalRange: [80, 110],
          priority: 1,
          tooLow: "you went too deep — control your depth",
          tooLowSpeech: "Control your depth!",
          tooHigh: "get deeper — break parallel, crease of hip below knee",
          tooHighSpeech: "Break parallel!",
          positive: "good depth — at or below parallel",
          positiveSpeech: "Good depth!",
        },
        spineAngle: {
          optimalRange: [8, 28],
          priority: 2,
          tooLow: "keep your chest up in the hole — fight the butt wink",
          tooLowSpeech: "Chest up, fight butt wink!",
          tooHigh: "you're folding over — stay tight in the hole",
          tooHighSpeech: "Stay tight in the hole!",
          positive: "strong bottom position",
          positiveSpeech: "Strong bottom!",
        },
      },
    },
    {
      name: "Ascent",
      spokenPrefix: "On the way up,",
      displayPrefix: "On the way up,",
      detection: {
        primaryMetric: "rightKneeFlexion",
        range: [110, 175],
        temporalRange: [0.55, 1.0],
      },
      expectations: {
        spineAngle: {
          optimalRange: [5, 22],
          priority: 1,
          tooLow: "drive your chest up first — don't let your hips rise faster than your shoulders",
          tooLowSpeech: "Drive chest up first!",
          tooHigh: "you're doing a good morning — push your back into the bar",
          tooHighSpeech: "Push back into the bar!",
          positive: "hips and shoulders rising together",
          positiveSpeech: "Rising together!",
        },
        hipRotation: {
          optimalRange: [0, 20],
          priority: 2,
          tooLow: "drive your hips through — squeeze your glutes at the top",
          tooLowSpeech: "Drive hips, squeeze glutes!",
          tooHigh: "don't over-extend — lock out tall",
          tooHighSpeech: "Lock out tall!",
          positive: "strong lockout",
          positiveSpeech: "Strong lockout!",
        },
      },
    },
  ],
};

/**
 * Deadlift Phases
 * 1. Setup → 2. Initial Pull → 3. Lockout → 4. Descent
 */
const deadliftPhases: MotionPhaseProfile = {
  motionName: "Deadlift",
  phases: [
    {
      name: "Setup",
      spokenPrefix: "In your setup,",
      displayPrefix: "In your setup,",
      detection: {
        primaryMetric: "rightKneeFlexion",
        range: [120, 160],
        temporalRange: [0.0, 0.15],
      },
      expectations: {
        spineAngle: {
          optimalRange: [10, 30],
          priority: 1,
          tooLow: "get your hips lower — pull the slack out of the bar",
          tooLowSpeech: "Hips lower, pull slack out!",
          tooHigh: "you're too bent over — sit back, chest up",
          tooHighSpeech: "Sit back, chest up!",
          positive: "strong setup position",
          positiveSpeech: "Strong setup!",
        },
        shoulderRotation: {
          optimalRange: [0, 25],
          priority: 2,
          tooLow: "engage your lats — pull the bar into your body",
          tooLowSpeech: "Engage lats, bar into body!",
          tooHigh: "don't shrug — pack your shoulders down",
          tooHighSpeech: "Pack shoulders down!",
          positive: "lats engaged",
          positiveSpeech: "Lats engaged!",
        },
      },
    },
    {
      name: "Initial Pull",
      spokenPrefix: "Off the floor,",
      displayPrefix: "Off the floor,",
      detection: {
        primaryMetric: "rightKneeFlexion",
        range: [140, 170],
        temporalRange: [0.15, 0.50],
      },
      expectations: {
        spineAngle: {
          optimalRange: [8, 28],
          priority: 1,
          tooLow: "keep your back angle constant — push the floor away",
          tooLowSpeech: "Push the floor away!",
          tooHigh: "your hips shot up too fast — push through the floor, don't pull with your back",
          tooHighSpeech: "Push through floor, not back!",
          positive: "back angle maintained off the floor",
          positiveSpeech: "Back angle maintained!",
        },
        rightKneeFlexion: {
          optimalRange: [145, 170],
          priority: 2,
          tooLow: "push your knees out of the way — make room for the bar",
          tooLowSpeech: "Knees out, room for bar!",
          tooHigh: "good knee extension",
          tooHighSpeech: "Good extension!",
          positive: "smooth knee extension",
          positiveSpeech: "Smooth extension!",
        },
      },
    },
    {
      name: "Lockout",
      spokenPrefix: "At lockout,",
      displayPrefix: "At lockout,",
      detection: {
        primaryMetric: "rightKneeFlexion",
        range: [165, 180],
        temporalRange: [0.45, 0.70],
      },
      expectations: {
        hipRotation: {
          optimalRange: [0, 15],
          priority: 1,
          tooLow: "drive your hips through — squeeze your glutes to finish",
          tooLowSpeech: "Drive hips, squeeze glutes!",
          tooHigh: "don't over-extend — stand tall, don't lean back",
          tooHighSpeech: "Stand tall, don't lean back!",
          positive: "strong lockout",
          positiveSpeech: "Strong lockout!",
        },
        spineAngle: {
          optimalRange: [0, 8],
          priority: 2,
          tooLow: "stand fully upright — proud chest at the top",
          tooLowSpeech: "Stand fully upright!",
          tooHigh: "you're leaning back — just stand tall",
          tooHighSpeech: "Just stand tall!",
          positive: "tall, proud finish",
          positiveSpeech: "Proud finish!",
        },
      },
    },
    {
      name: "Descent",
      spokenPrefix: "On the way down,",
      displayPrefix: "On the way down,",
      detection: {
        primaryMetric: "rightKneeFlexion",
        range: [130, 170],
        temporalRange: [0.70, 1.0],
      },
      expectations: {
        spineAngle: {
          optimalRange: [8, 28],
          priority: 1,
          tooLow: "hinge at your hips first — push your butt back",
          tooLowSpeech: "Hinge hips first!",
          tooHigh: "control the descent — don't just drop it",
          tooHighSpeech: "Control the descent!",
          positive: "controlled return to the floor",
          positiveSpeech: "Controlled return!",
        },
      },
    },
  ],
};

/**
 * Generic fallback phases for any motion
 */
const genericPhases: MotionPhaseProfile = {
  motionName: "Generic",
  phases: [
    {
      name: "Setup",
      spokenPrefix: "In your setup,",
      displayPrefix: "In your setup,",
      detection: {
        primaryMetric: "hipRotation",
        range: [0, 15],
        temporalRange: [0.0, 0.20],
      },
      expectations: {
        spineAngle: {
          optimalRange: [0, 15],
          priority: 1,
          tooLow: "stand tall and balanced before you start",
          tooLowSpeech: "Stand tall and balanced!",
          tooHigh: "straighten up — don't lean forward in your setup",
          tooHighSpeech: "Straighten up!",
          positive: "good starting position",
          positiveSpeech: "Good start!",
        },
        rightKneeFlexion: {
          optimalRange: [135, 170],
          priority: 2,
          tooLow: "get into an athletic stance — knees slightly bent",
          tooLowSpeech: "Athletic stance!",
          tooHigh: "soften your knees",
          tooHighSpeech: "Soften knees!",
          positive: "athletic stance",
          positiveSpeech: "Athletic stance!",
        },
      },
    },
    {
      name: "Execution",
      spokenPrefix: "During the movement,",
      displayPrefix: "During the movement,",
      detection: {
        primaryMetric: "hipRotation",
        range: [10, 80],
        temporalRange: [0.20, 0.65],
      },
      expectations: {
        hipRotation: {
          optimalRange: [20, 80],
          priority: 1,
          tooLow: "commit to the movement — use your whole body",
          tooLowSpeech: "Commit, use whole body!",
          tooHigh: "control the range of motion — don't over-rotate",
          tooHighSpeech: "Control range of motion!",
          positive: "good range of motion",
          positiveSpeech: "Good range!",
        },
        spineAngle: {
          optimalRange: [0, 20],
          priority: 2,
          tooLow: "keep your core engaged throughout",
          tooLowSpeech: "Core engaged!",
          tooHigh: "maintain your posture — don't let your form break down",
          tooHighSpeech: "Maintain posture!",
          positive: "strong core throughout",
          positiveSpeech: "Strong core!",
        },
      },
    },
    {
      name: "Follow-Through",
      spokenPrefix: "On the follow-through,",
      displayPrefix: "On the follow-through,",
      detection: {
        primaryMetric: "hipRotation",
        range: [40, 120],
        temporalRange: [0.65, 1.0],
      },
      expectations: {
        hipRotation: {
          optimalRange: [40, 100],
          priority: 1,
          tooLow: "finish the movement completely — don't cut it short",
          tooLowSpeech: "Finish completely!",
          tooHigh: "good follow-through",
          tooHighSpeech: "Good follow-through!",
          positive: "complete follow-through",
          positiveSpeech: "Complete!",
        },
        weightTransfer: {
          optimalRange: [20, 80],
          priority: 2,
          tooLow: "transfer your weight through the movement",
          tooLowSpeech: "Transfer weight!",
          tooHigh: "stay balanced as you finish",
          tooHighSpeech: "Stay balanced!",
          positive: "balanced finish",
          positiveSpeech: "Balanced!",
        },
      },
    },
  ],
};

// ============================================================
// PHASE PROFILE REGISTRY
// ============================================================

const phaseProfiles: Record<string, MotionPhaseProfile> = {
  "football-throw": footballThrowPhases,
  "football-punt": footballThrowPhases,
  "baseball-fastball": baseballPitchPhases,
  "baseball-curveball": baseballPitchPhases,
  "baseball-pitch": baseballPitchPhases,
  "basketball-jump-shot": basketballShotPhases,
  "basketball-free-throw": basketballShotPhases,
  "basketball-shot": basketballShotPhases,
  "golf-driver-swing": golfSwingPhases,
  "golf-swing": golfSwingPhases,
  "golf-iron-shot": golfSwingPhases,
  "kettlebell-swing": kettlebellSwingPhases,
  "kettlebell-kb-swing": kettlebellSwingPhases,
  "kettlebell-snatch": kettlebellSnatchPhases,
  "kettlebell-kb-snatch": kettlebellSnatchPhases,
  "powerlifting-back-squat": squatPhases,
  "powerlifting-front-squat": squatPhases,
  "powerlifting-deadlift": deadliftPhases,
  "powerlifting-sumo-deadlift": deadliftPhases,
  "default": genericPhases,
};

/**
 * Get the phase profile for a given motion.
 */
export function getPhaseProfile(
  category: string,
  subcategory: string,
  motionName: string
): MotionPhaseProfile {
  const motionSlug = motionName.toLowerCase().replace(/\s+/g, '-');
  const keys = [
    `${subcategory.toLowerCase()}-${motionSlug}`,
    `${category.toLowerCase()}-${motionSlug}`,
    motionSlug,
  ];

  for (const key of keys) {
    if (phaseProfiles[key]) return phaseProfiles[key];
  }

  // Partial match on subcategory
  const subcatLower = subcategory.toLowerCase();
  for (const [profileKey, profile] of Object.entries(phaseProfiles)) {
    if (profileKey.startsWith(subcatLower)) return profile;
  }

  // Keyword matching
  const combined = `${category} ${subcategory} ${motionName}`.toLowerCase();
  if (combined.includes('kettlebell') && combined.includes('swing')) return kettlebellSwingPhases;
  if (combined.includes('kettlebell') && combined.includes('snatch')) return kettlebellSnatchPhases;
  if (combined.includes('football') || combined.includes('throw')) return footballThrowPhases;
  if (combined.includes('golf') || combined.includes('swing')) return golfSwingPhases;
  if (combined.includes('baseball') || combined.includes('pitch')) return baseballPitchPhases;
  if (combined.includes('basketball') || combined.includes('shot')) return basketballShotPhases;
  if (combined.includes('squat')) return squatPhases;
  if (combined.includes('deadlift')) return deadliftPhases;

  return genericPhases;
}

// ============================================================
// PHASE DETECTION & EVALUATION
// ============================================================

/**
 * Detect which phase a frame belongs to based on the phase profile.
 * Uses both metric-based detection and temporal position as fallback.
 * 
 * @param phase The phase definition
 * @param frameMetrics The metrics for this frame
 * @param normalizedTime Position in the rep (0.0 to 1.0)
 * @returns Confidence score (0-1) that this frame belongs to this phase
 */
function phaseConfidence(
  phase: MotionPhase,
  frameMetrics: FrameMetrics,
  normalizedTime: number
): number {
  const { detection } = phase;
  let score = 0;

  // Temporal match (0.0 - 0.4 weight)
  const [tStart, tEnd] = detection.temporalRange;
  if (normalizedTime >= tStart && normalizedTime <= tEnd) {
    // Higher score for being in the center of the temporal range
    const center = (tStart + tEnd) / 2;
    const dist = Math.abs(normalizedTime - center) / ((tEnd - tStart) / 2);
    score += 0.4 * (1 - dist * 0.5);
  }

  // Primary metric match (0.0 - 0.4 weight)
  const primaryValue = frameMetrics[detection.primaryMetric];
  if (primaryValue !== undefined) {
    const [pMin, pMax] = detection.range;
    if (primaryValue >= pMin && primaryValue <= pMax) {
      score += 0.4;
    } else {
      // Partial credit for being close
      const dist = primaryValue < pMin ? pMin - primaryValue : primaryValue - pMax;
      const range = pMax - pMin;
      score += 0.4 * Math.max(0, 1 - dist / (range * 0.5));
    }
  }

  // Secondary metric match (0.0 - 0.2 weight)
  if (detection.secondaryMetric && detection.secondaryRange) {
    const secValue = frameMetrics[detection.secondaryMetric];
    if (secValue !== undefined) {
      const [sMin, sMax] = detection.secondaryRange;
      if (secValue >= sMin && secValue <= sMax) {
        score += 0.2;
      }
    }
  } else {
    // No secondary metric — redistribute weight to primary
    score += 0.1;
  }

  return Math.min(1, score);
}

/**
 * Segment a rep's frames into phases and compute average metrics per phase.
 * 
 * @param phaseProfile The motion's phase profile
 * @param frames Array of frame metrics for the rep
 * @returns Map of phase name → { avgMetrics, frameCount, bestConfidence }
 */
export function segmentRepIntoPhases(
  phaseProfile: MotionPhaseProfile,
  frames: FrameMetrics[]
): Map<string, { phase: MotionPhase; avgMetrics: Partial<FrameMetrics>; frameCount: number }> {
  const totalFrames = frames.length;
  if (totalFrames === 0) return new Map();

  // For each frame, assign it to the phase with highest confidence
  const phaseFrames = new Map<string, { phase: MotionPhase; metrics: FrameMetrics[] }>();
  
  for (const phase of phaseProfile.phases) {
    phaseFrames.set(phase.name, { phase, metrics: [] });
  }

  for (let i = 0; i < totalFrames; i++) {
    const normalizedTime = i / (totalFrames - 1 || 1);
    const frame = frames[i];

    let bestPhase = phaseProfile.phases[0];
    let bestScore = -1;

    for (const phase of phaseProfile.phases) {
      const score = phaseConfidence(phase, frame, normalizedTime);
      if (score > bestScore) {
        bestScore = score;
        bestPhase = phase;
      }
    }

    phaseFrames.get(bestPhase.name)!.metrics.push(frame);
  }

  // Compute averages per phase
  const result = new Map<string, { phase: MotionPhase; avgMetrics: Partial<FrameMetrics>; frameCount: number }>();

  phaseFrames.forEach((data, phaseName) => {
    if (data.metrics.length === 0) return;

    const avgMetrics: Partial<FrameMetrics> = {};
    const metricKeys: (keyof FrameMetrics)[] = [
      'hipRotation', 'shoulderRotation', 'rightElbowAngle', 'leftElbowAngle',
      'rightKneeFlexion', 'leftKneeFlexion', 'spineAngle',
      'rightShoulderAngle', 'leftShoulderAngle', 'footPositioning', 'weightTransfer'
    ];

    for (const key of metricKeys) {
      const values: number[] = data.metrics.map((m: FrameMetrics) => m[key]).filter((v: number | undefined | null): v is number => v !== undefined && v !== null);
      if (values.length > 0) {
        (avgMetrics as any)[key] = values.reduce((a: number, b: number) => a + b, 0) / values.length;
      }
    }

    result.set(phaseName, {
      phase: data.phase,
      avgMetrics,
      frameCount: data.metrics.length,
    });
  });

  return result;
}

/**
 * Evaluate a rep's frames and generate phase-aware coaching feedback.
 * 
 * This is the main entry point for the phase-aware coaching system.
 * It segments the rep into phases, evaluates each phase's metrics against
 * expectations, and returns the top coaching cues with phase context.
 * 
 * @param category Motion category
 * @param subcategory Motion subcategory
 * @param motionName Motion name
 * @param frames Array of per-frame metrics for the completed rep
 * @param maxItems Maximum feedback items to return (default 3)
 * @returns Prioritized array of phase-aware coaching feedback
 */
export function evaluateRepPhases(
  category: string,
  subcategory: string,
  motionName: string,
  frames: FrameMetrics[],
  maxItems: number = 3
): PhaseEvaluation[] {
  const profile = getPhaseProfile(category, subcategory, motionName);
  const phaseData = segmentRepIntoPhases(profile, frames);

  const allEvaluations: PhaseEvaluation[] = [];

  phaseData.forEach((data, phaseName) => {
    const { phase, avgMetrics } = data;

    for (const [metricKey, _expectation] of Object.entries(phase.expectations)) {
      const expectation = _expectation as PhaseMetricExpectation;
      const value = (avgMetrics as any)[metricKey];
      if (value === undefined || value === null) continue;

      const [min, max] = expectation.optimalRange;
      let type: 'positive' | 'correction';
      let message: string;
      let speech: string;

      if (value >= min && value <= max) {
        type = 'positive';
        message = `${phase.displayPrefix} ${expectation.positive}`;
        speech = `${phase.spokenPrefix} ${expectation.positiveSpeech}`;
      } else if (value < min) {
        type = 'correction';
        message = `${phase.displayPrefix} ${expectation.tooLow}`;
        speech = `${phase.spokenPrefix} ${expectation.tooLowSpeech}`;
      } else {
        type = 'correction';
        message = `${phase.displayPrefix} ${expectation.tooHigh}`;
        speech = `${phase.spokenPrefix} ${expectation.tooHighSpeech}`;
      }

      const detail = `${phaseName} · ${metricKey}: ${value.toFixed(0)}° (target: ${min}–${max}°)`;

      allEvaluations.push({
        phaseName,
        displayPrefix: phase.displayPrefix,
        spokenPrefix: phase.spokenPrefix,
        metricKey,
        type,
        message,
        speech,
        detail,
        priority: expectation.priority,
      });
    }
  });

  // Sort: corrections first (by priority), then positives
  allEvaluations.sort((a, b) => {
    if (a.type === 'correction' && b.type === 'positive') return -1;
    if (a.type === 'positive' && b.type === 'correction') return 1;
    return a.priority - b.priority;
  });

  // Select top items, ensuring at least 1 positive if available
  const corrections = allEvaluations.filter(e => e.type === 'correction');
  const positives = allEvaluations.filter(e => e.type === 'positive');

  const selected: PhaseEvaluation[] = [];
  const maxCorrections = positives.length > 0 ? maxItems - 1 : maxItems;
  selected.push(...corrections.slice(0, maxCorrections));

  const remaining = maxItems - selected.length;
  if (remaining > 0) {
    selected.push(...positives.slice(0, remaining));
  }

  return selected;
}
