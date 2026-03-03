/**
 * Sports-Science-Based Coaching Cues
 * 
 * Provides actionable, external-focus coaching cues for all tracked metrics.
 * Based on motor learning research showing that external-focus cues
 * (action verbs, analogies, outcome-oriented language) produce better
 * athletic performance than internal-focus cues ("fix your elbow").
 * 
 * Each metric has:
 * - positive: Short praise when the metric is in the optimal range
 * - tooLow: Actionable cue when the value is below optimal
 * - tooHigh: Actionable cue when the value is above optimal
 * - speech: Even shorter version for text-to-speech (keeps audio concise)
 */

export interface CoachingCue {
  positive: string;
  positiveSpeech: string;
  tooLow: string;
  tooLowSpeech: string;
  tooHigh: string;
  tooHighSpeech: string;
}

export interface MetricCoachingConfig {
  /** Display name for the metric */
  label: string;
  /** Optimal range [min, max] — values within this range get positive feedback */
  optimalRange: [number, number];
  /** The coaching cues for this metric */
  cues: CoachingCue;
  /** Priority (1 = highest). Lower numbers are shown first. */
  priority: number;
}

export type MetricKey = 
  | 'hipRotation'
  | 'shoulderRotation'
  | 'rightElbowAngle'
  | 'leftElbowAngle'
  | 'rightKneeFlexion'
  | 'leftKneeFlexion'
  | 'spineAngle'
  | 'rightShoulderAngle'
  | 'leftShoulderAngle'
  | 'footPositioning'
  | 'weightTransfer';

export type MotionCoachingProfile = Partial<Record<MetricKey, MetricCoachingConfig>>;

/**
 * Football Throw coaching cues
 * Based on QB mechanics research — external-focus, action-verb cues
 */
const footballThrow: MotionCoachingProfile = {
  hipRotation: {
    label: "Hip Drive",
    optimalRange: [30, 90],
    priority: 1,
    cues: {
      positive: "Great hip drive — power from the ground up!",
      positiveSpeech: "Great hip drive!",
      tooLow: "Snap your hips through the target — lead with the belt buckle",
      tooLowSpeech: "Snap hips through the target!",
      tooHigh: "Control the hip turn — stay connected to your back leg longer",
      tooHighSpeech: "Stay connected to back leg longer",
    }
  },
  shoulderRotation: {
    label: "Shoulder Separation",
    optimalRange: [30, 90],
    priority: 2,
    cues: {
      positive: "Nice shoulder separation — great torque!",
      positiveSpeech: "Nice shoulder separation!",
      tooLow: "Pull your front shoulder toward the target — let your chest rip open",
      tooLowSpeech: "Pull front shoulder to target!",
      tooHigh: "Keep your shoulders closed longer — let your hips lead",
      tooHighSpeech: "Keep shoulders closed, hips lead!",
    }
  },
  rightElbowAngle: {
    label: "Throwing Elbow",
    optimalRange: [80, 110],
    priority: 3,
    cues: {
      positive: "Elbow is locked in — clean L-shape!",
      positiveSpeech: "Elbow locked in!",
      tooLow: "Tuck your elbow tight to your ear — keep a sharp L",
      tooLowSpeech: "Tuck elbow tight, sharp L!",
      tooHigh: "Bring the elbow forward faster — whip it past your ear",
      tooHighSpeech: "Whip elbow forward faster!",
    }
  },
  leftElbowAngle: {
    label: "Guide Arm",
    optimalRange: [30, 90],
    priority: 7,
    cues: {
      positive: "Good guide arm — pulling you through!",
      positiveSpeech: "Good guide arm!",
      tooLow: "Punch your lead elbow down and back — pull yourself through the throw",
      tooLowSpeech: "Punch lead elbow down and back!",
      tooHigh: "Tighten up your lead arm — tuck it into your ribs",
      tooHighSpeech: "Tuck lead arm into ribs!",
    }
  },
  rightKneeFlexion: {
    label: "Back Leg Drive",
    optimalRange: [140, 175],
    priority: 5,
    cues: {
      positive: "Strong leg drive — great power base!",
      positiveSpeech: "Strong leg drive!",
      tooLow: "Push off the back foot harder — drive the ground away",
      tooLowSpeech: "Push off back foot harder!",
      tooHigh: "Bend your back knee more — load the spring before you throw",
      tooHighSpeech: "Bend back knee, load the spring!",
    }
  },
  leftKneeFlexion: {
    label: "Front Leg Brace",
    optimalRange: [150, 180],
    priority: 6,
    cues: {
      positive: "Solid front leg brace — great energy transfer!",
      positiveSpeech: "Solid front leg brace!",
      tooLow: "Stiffen your front leg on landing — be a firm post to throw over",
      tooLowSpeech: "Stiffen front leg, firm post!",
      tooHigh: "Soften the front knee slightly — absorb the landing",
      tooHighSpeech: "Soften front knee on landing!",
    }
  },
  spineAngle: {
    label: "Posture",
    optimalRange: [0, 15],
    priority: 4,
    cues: {
      positive: "Tall posture — throwing from a strong column!",
      positiveSpeech: "Great posture!",
      tooLow: "Stay tall through the throw — imagine a string pulling your head up",
      tooLowSpeech: "Stay tall through the throw!",
      tooHigh: "You're leaning too far — stay stacked over your hips",
      tooHighSpeech: "Stay stacked over your hips!",
    }
  },
  weightTransfer: {
    label: "Weight Shift",
    optimalRange: [20, 80],
    priority: 8,
    cues: {
      positive: "Smooth weight transfer — great momentum!",
      positiveSpeech: "Smooth weight transfer!",
      tooLow: "Drive your chest toward the target — shift your weight forward",
      tooLowSpeech: "Drive chest toward target!",
      tooHigh: "You're falling forward — stay balanced through the release",
      tooHighSpeech: "Stay balanced through release!",
    }
  },
};

/**
 * Kettlebell Swing coaching cues
 * Based on hip hinge mechanics and hardstyle kettlebell training principles
 */
const kettlebellSwing: MotionCoachingProfile = {
  hipRotation: {
    label: "Hip Snap",
    optimalRange: [30, 90],
    priority: 1,
    cues: {
      positive: "Explosive hip snap — great power!",
      positiveSpeech: "Explosive hip snap!",
      tooLow: "Snap your hips forward like you're closing a car door with your butt",
      tooLowSpeech: "Snap hips forward harder!",
      tooHigh: "Don't over-extend — lock out tall, squeeze your glutes at the top",
      tooHighSpeech: "Lock out tall, squeeze glutes!",
    }
  },
  spineAngle: {
    label: "Spine Neutral",
    optimalRange: [0, 20],
    priority: 2,
    cues: {
      positive: "Flat back — perfect hinge!",
      positiveSpeech: "Perfect hinge!",
      tooLow: "Pack your shoulders back — proud chest, flat back",
      tooLowSpeech: "Proud chest, flat back!",
      tooHigh: "You're rounding — push your chest out and hinge at the hips, not the back",
      tooHighSpeech: "Hinge at hips, not back!",
    }
  },
  rightKneeFlexion: {
    label: "Knee Bend",
    optimalRange: [140, 170],
    priority: 3,
    cues: {
      positive: "Good knee position — hinge not squat!",
      positiveSpeech: "Good knee position!",
      tooLow: "Straighten your legs more — this is a hinge, not a squat",
      tooLowSpeech: "Straighten legs, hinge not squat!",
      tooHigh: "Soften your knees slightly — don't lock them out",
      tooHighSpeech: "Soften knees slightly!",
    }
  },
  leftKneeFlexion: {
    label: "Knee Symmetry",
    optimalRange: [140, 170],
    priority: 6,
    cues: {
      positive: "Even knee bend — balanced stance!",
      positiveSpeech: "Balanced stance!",
      tooLow: "Match your knee bend — keep both legs even",
      tooLowSpeech: "Keep both legs even!",
      tooHigh: "Soften the left knee to match the right",
      tooHighSpeech: "Soften left knee!",
    }
  },
  shoulderRotation: {
    label: "Shoulder Pack",
    optimalRange: [0, 45],
    priority: 4,
    cues: {
      positive: "Shoulders packed — strong connection!",
      positiveSpeech: "Shoulders packed!",
      tooLow: "Pull your shoulders into your back pockets — stay connected",
      tooLowSpeech: "Pull shoulders back and down!",
      tooHigh: "Don't shrug — keep shoulders away from your ears",
      tooHighSpeech: "Keep shoulders away from ears!",
    }
  },
  rightElbowAngle: {
    label: "Arm Position",
    optimalRange: [160, 180],
    priority: 5,
    cues: {
      positive: "Arms straight — letting the hips do the work!",
      positiveSpeech: "Arms straight, hips working!",
      tooLow: "Straighten your arms — the bell swings from your hips, not your arms",
      tooLowSpeech: "Straighten arms, swing from hips!",
      tooHigh: "Good arm extension!",
      tooHighSpeech: "Good extension!",
    }
  },
  weightTransfer: {
    label: "Weight Distribution",
    optimalRange: [-10, 30],
    priority: 7,
    cues: {
      positive: "Balanced weight — rooted to the ground!",
      positiveSpeech: "Balanced and rooted!",
      tooLow: "Sit back into your heels more — load the hips",
      tooLowSpeech: "Sit back into heels!",
      tooHigh: "Don't lean forward — keep weight in your mid-foot to heels",
      tooHighSpeech: "Weight in mid-foot to heels!",
    }
  },
};

/**
 * Kettlebell Snatch coaching cues
 * Combines hip hinge power with overhead lockout mechanics
 */
const kettlebellSnatch: MotionCoachingProfile = {
  hipRotation: {
    label: "Hip Drive",
    optimalRange: [30, 90],
    priority: 1,
    cues: {
      positive: "Powerful hip drive — great explosion!",
      positiveSpeech: "Powerful hip drive!",
      tooLow: "Pop your hips harder — throw the bell with your hips, not your arm",
      tooLowSpeech: "Pop hips harder, throw with hips!",
      tooHigh: "Control the hip snap — don't over-extend at the top",
      tooHighSpeech: "Control the hip snap!",
    }
  },
  rightElbowAngle: {
    label: "High Pull",
    optimalRange: [80, 180],
    priority: 2,
    cues: {
      positive: "Clean pull — smooth path overhead!",
      positiveSpeech: "Clean pull overhead!",
      tooLow: "Pull the bell close — elbow high, zip it up like a jacket",
      tooLowSpeech: "Elbow high, zip it up!",
      tooHigh: "Good lockout overhead!",
      tooHighSpeech: "Good lockout!",
    }
  },
  spineAngle: {
    label: "Spine Position",
    optimalRange: [0, 15],
    priority: 3,
    cues: {
      positive: "Strong spine — great stability!",
      positiveSpeech: "Strong spine!",
      tooLow: "Stand tall at lockout — stack your ribs over your hips",
      tooLowSpeech: "Stand tall, ribs over hips!",
      tooHigh: "Don't lean back — punch straight up, not behind you",
      tooHighSpeech: "Punch straight up, not back!",
    }
  },
  shoulderRotation: {
    label: "Shoulder Stability",
    optimalRange: [0, 60],
    priority: 4,
    cues: {
      positive: "Shoulder is packed and stable!",
      positiveSpeech: "Shoulder packed and stable!",
      tooLow: "Pull your shoulder blade down into your back pocket",
      tooLowSpeech: "Shoulder blade down and back!",
      tooHigh: "Don't let the bell pull you — own the lockout position",
      tooHighSpeech: "Own the lockout position!",
    }
  },
  rightKneeFlexion: {
    label: "Leg Drive",
    optimalRange: [140, 175],
    priority: 5,
    cues: {
      positive: "Great leg drive — explosive from the ground!",
      positiveSpeech: "Great leg drive!",
      tooLow: "Drive through your legs — push the floor away",
      tooLowSpeech: "Push the floor away!",
      tooHigh: "Soften your knees in the hinge — load before you explode",
      tooHighSpeech: "Load knees before you explode!",
    }
  },
  weightTransfer: {
    label: "Balance",
    optimalRange: [-10, 30],
    priority: 6,
    cues: {
      positive: "Balanced and controlled!",
      positiveSpeech: "Balanced!",
      tooLow: "Stay rooted — grip the ground with your toes",
      tooLowSpeech: "Grip the ground with toes!",
      tooHigh: "Don't chase the bell forward — stay centered",
      tooHighSpeech: "Stay centered, don't chase!",
    }
  },
};

/**
 * Golf Swing coaching cues
 * Based on modern golf instruction with external-focus principles
 */
const golfSwing: MotionCoachingProfile = {
  hipRotation: {
    label: "Hip Turn",
    optimalRange: [30, 70],
    priority: 1,
    cues: {
      positive: "Full hip turn — great coil!",
      positiveSpeech: "Great hip turn!",
      tooLow: "Turn your belt buckle toward the target — let your hips lead the downswing",
      tooLowSpeech: "Turn belt buckle to target!",
      tooHigh: "Quiet your hips in the backswing — coil against a stable lower body",
      tooHighSpeech: "Quiet hips in backswing!",
    }
  },
  shoulderRotation: {
    label: "Shoulder Turn",
    optimalRange: [30, 90],
    priority: 2,
    cues: {
      positive: "Great shoulder turn — loaded and ready!",
      positiveSpeech: "Great shoulder turn!",
      tooLow: "Turn your back to the target — get your lead shoulder under your chin",
      tooLowSpeech: "Turn back to target!",
      tooHigh: "Don't over-rotate — maintain your spine angle",
      tooHighSpeech: "Maintain spine angle!",
    }
  },
  rightElbowAngle: {
    label: "Trail Elbow",
    optimalRange: [80, 120],
    priority: 3,
    cues: {
      positive: "Trail elbow tucked — on plane!",
      positiveSpeech: "Trail elbow on plane!",
      tooLow: "Keep your trail elbow close to your body — imagine holding a towel under your arm",
      tooLowSpeech: "Keep trail elbow close to body!",
      tooHigh: "Tuck your trail elbow down — point it at your hip",
      tooHighSpeech: "Tuck trail elbow toward hip!",
    }
  },
  spineAngle: {
    label: "Spine Tilt",
    optimalRange: [5, 25],
    priority: 4,
    cues: {
      positive: "Great spine angle — consistent through the swing!",
      positiveSpeech: "Great spine angle!",
      tooLow: "Maintain your forward tilt — stay in your posture",
      tooLowSpeech: "Stay in your posture!",
      tooHigh: "You're dipping — keep your head level, rotate around your spine",
      tooHighSpeech: "Keep head level, rotate around spine!",
    }
  },
  rightKneeFlexion: {
    label: "Trail Knee",
    optimalRange: [140, 170],
    priority: 5,
    cues: {
      positive: "Stable trail knee — great resistance!",
      positiveSpeech: "Stable trail knee!",
      tooLow: "Keep flex in your trail knee — resist the hip turn for more power",
      tooLowSpeech: "Resist with trail knee!",
      tooHigh: "Don't straighten the trail leg — keep it flexed to store power",
      tooHighSpeech: "Keep trail leg flexed!",
    }
  },
  leftKneeFlexion: {
    label: "Lead Knee",
    optimalRange: [150, 180],
    priority: 6,
    cues: {
      positive: "Strong lead leg — great post to rotate around!",
      positiveSpeech: "Strong lead leg!",
      tooLow: "Straighten your lead leg through impact — post up and rotate",
      tooLowSpeech: "Post up on lead leg!",
      tooHigh: "Soften your lead knee slightly at address",
      tooHighSpeech: "Soften lead knee!",
    }
  },
  weightTransfer: {
    label: "Weight Shift",
    optimalRange: [20, 80],
    priority: 7,
    cues: {
      positive: "Great weight shift — power through the ball!",
      positiveSpeech: "Great weight shift!",
      tooLow: "Shift toward the target — feel pressure move to your front foot",
      tooLowSpeech: "Shift to front foot!",
      tooHigh: "Don't slide — rotate over a stable front side",
      tooHighSpeech: "Rotate, don't slide!",
    }
  },
};

/**
 * Baseball Pitching coaching cues
 */
const baseballPitch: MotionCoachingProfile = {
  hipRotation: {
    label: "Hip Lead",
    optimalRange: [30, 70],
    priority: 1,
    cues: {
      positive: "Hips leading — great separation!",
      positiveSpeech: "Great hip lead!",
      tooLow: "Fire your hips first — drive your front hip toward the catcher",
      tooLowSpeech: "Fire hips toward catcher!",
      tooHigh: "Don't fly open — stay closed longer to build torque",
      tooHighSpeech: "Stay closed longer!",
    }
  },
  shoulderRotation: {
    label: "Trunk Rotation",
    optimalRange: [30, 80],
    priority: 2,
    cues: {
      positive: "Explosive trunk rotation — great velocity!",
      positiveSpeech: "Explosive rotation!",
      tooLow: "Rip your chest open toward the target — let your trunk whip through",
      tooLowSpeech: "Rip chest open to target!",
      tooHigh: "Stay closed longer — let your hips create the separation",
      tooHighSpeech: "Stay closed, let hips lead!",
    }
  },
  rightElbowAngle: {
    label: "Arm Slot",
    optimalRange: [80, 110],
    priority: 3,
    cues: {
      positive: "Clean arm slot — efficient path!",
      positiveSpeech: "Clean arm slot!",
      tooLow: "Get your elbow up to shoulder height — throw from a high slot",
      tooLowSpeech: "Get elbow up to shoulder height!",
      tooHigh: "Don't overthrow — let the arm lay back naturally",
      tooHighSpeech: "Let arm lay back naturally!",
    }
  },
  spineAngle: {
    label: "Trunk Tilt",
    optimalRange: [0, 20],
    priority: 4,
    cues: {
      positive: "Great posture — throwing from a strong position!",
      positiveSpeech: "Strong throwing posture!",
      tooLow: "Stay tall and firm — don't collapse your chest",
      tooLowSpeech: "Stay tall, don't collapse!",
      tooHigh: "You're leaning too much — stay stacked over your hips",
      tooHighSpeech: "Stay stacked over hips!",
    }
  },
  leftKneeFlexion: {
    label: "Front Leg Block",
    optimalRange: [155, 180],
    priority: 5,
    cues: {
      positive: "Firm front leg — great energy transfer!",
      positiveSpeech: "Firm front leg!",
      tooLow: "Brace your front leg — be a firm wall to throw against",
      tooLowSpeech: "Brace front leg, firm wall!",
      tooHigh: "Good leg extension!",
      tooHighSpeech: "Good extension!",
    }
  },
  weightTransfer: {
    label: "Momentum",
    optimalRange: [20, 70],
    priority: 6,
    cues: {
      positive: "Great momentum toward the plate!",
      positiveSpeech: "Great momentum!",
      tooLow: "Drive down the mound — lead with your hip toward home plate",
      tooLowSpeech: "Drive down the mound!",
      tooHigh: "Don't fall off — stay balanced through your finish",
      tooHighSpeech: "Stay balanced through finish!",
    }
  },
};

/**
 * Basketball Jump Shot coaching cues
 */
const basketballShot: MotionCoachingProfile = {
  rightElbowAngle: {
    label: "Shooting Elbow",
    optimalRange: [80, 110],
    priority: 1,
    cues: {
      positive: "Elbow under the ball — textbook form!",
      positiveSpeech: "Textbook elbow position!",
      tooLow: "Get your elbow under the ball — form an L-shape at your ear",
      tooLowSpeech: "Elbow under ball, L-shape!",
      tooHigh: "Tuck your elbow in — keep it aligned with the rim",
      tooHighSpeech: "Tuck elbow, align with rim!",
    }
  },
  rightKneeFlexion: {
    label: "Leg Power",
    optimalRange: [130, 165],
    priority: 2,
    cues: {
      positive: "Great knee bend — power from the legs!",
      positiveSpeech: "Great leg power!",
      tooLow: "Bend your knees more — your legs are your engine",
      tooLowSpeech: "Bend knees more, legs are engine!",
      tooHigh: "Dip a little deeper — load your legs before the shot",
      tooHighSpeech: "Dip deeper, load legs!",
    }
  },
  spineAngle: {
    label: "Alignment",
    optimalRange: [0, 10],
    priority: 3,
    cues: {
      positive: "Straight up and down — clean release!",
      positiveSpeech: "Clean alignment!",
      tooLow: "Stay vertical — shoot straight up, not forward",
      tooLowSpeech: "Shoot straight up!",
      tooHigh: "Don't lean back — stay balanced and go straight up",
      tooHighSpeech: "Don't lean, go straight up!",
    }
  },
  shoulderRotation: {
    label: "Square Up",
    optimalRange: [0, 30],
    priority: 4,
    cues: {
      positive: "Squared to the basket — great alignment!",
      positiveSpeech: "Squared to basket!",
      tooLow: "Turn your shooting shoulder toward the rim",
      tooLowSpeech: "Shoulder toward rim!",
      tooHigh: "Don't over-rotate — keep your feet and shoulders aimed at the basket",
      tooHighSpeech: "Aim shoulders at basket!",
    }
  },
  weightTransfer: {
    label: "Lift",
    optimalRange: [10, 50],
    priority: 5,
    cues: {
      positive: "Great lift — smooth one-motion shot!",
      positiveSpeech: "Smooth one-motion shot!",
      tooLow: "Use your legs — push the floor away as you release",
      tooLowSpeech: "Push floor away on release!",
      tooHigh: "Don't jump forward — go straight up",
      tooHighSpeech: "Go straight up!",
    }
  },
};

/**
 * Soccer Power Shot coaching cues
 */
const soccerShot: MotionCoachingProfile = {
  hipRotation: {
    label: "Hip Opening",
    optimalRange: [30, 70],
    priority: 1,
    cues: {
      positive: "Hips open — great power angle!",
      positiveSpeech: "Great hip opening!",
      tooLow: "Open your hips to the target — point your plant foot where you want the ball to go",
      tooLowSpeech: "Open hips, plant foot to target!",
      tooHigh: "Don't over-rotate — keep your body over the ball",
      tooHighSpeech: "Stay over the ball!",
    }
  },
  rightKneeFlexion: {
    label: "Kicking Leg",
    optimalRange: [130, 170],
    priority: 2,
    cues: {
      positive: "Great knee drive — powerful strike!",
      positiveSpeech: "Powerful strike!",
      tooLow: "Snap your knee through the ball — whip your shin forward",
      tooLowSpeech: "Snap knee through the ball!",
      tooHigh: "Lock your ankle and drive through — don't just tap it",
      tooHighSpeech: "Lock ankle, drive through!",
    }
  },
  leftKneeFlexion: {
    label: "Plant Leg",
    optimalRange: [150, 175],
    priority: 3,
    cues: {
      positive: "Solid plant leg — stable base!",
      positiveSpeech: "Solid plant leg!",
      tooLow: "Firm up your plant leg — be a strong base to kick from",
      tooLowSpeech: "Firm up plant leg!",
      tooHigh: "Slight bend in your plant knee for balance",
      tooHighSpeech: "Slight bend in plant knee!",
    }
  },
  spineAngle: {
    label: "Body Position",
    optimalRange: [0, 15],
    priority: 4,
    cues: {
      positive: "Great body position over the ball!",
      positiveSpeech: "Great body position!",
      tooLow: "Lean over the ball — keep it low and driven",
      tooLowSpeech: "Lean over the ball!",
      tooHigh: "Don't lean back — that sends the ball high, stay over it",
      tooHighSpeech: "Stay over the ball, don't lean back!",
    }
  },
};

/**
 * Tennis Serve coaching cues
 */
const tennisServe: MotionCoachingProfile = {
  hipRotation: {
    label: "Hip Rotation",
    optimalRange: [30, 70],
    priority: 1,
    cues: {
      positive: "Great hip rotation — kinetic chain firing!",
      positiveSpeech: "Great hip rotation!",
      tooLow: "Drive your hips up and forward — launch from the ground",
      tooLowSpeech: "Drive hips up and forward!",
      tooHigh: "Don't spin out — channel your rotation upward",
      tooHighSpeech: "Channel rotation upward!",
    }
  },
  shoulderRotation: {
    label: "Shoulder Turn",
    optimalRange: [30, 80],
    priority: 2,
    cues: {
      positive: "Full shoulder turn — loaded and explosive!",
      positiveSpeech: "Full shoulder turn!",
      tooLow: "Turn your shoulders away from the net — coil like a spring",
      tooLowSpeech: "Coil shoulders like a spring!",
      tooHigh: "Stay sideways longer — don't open up too early",
      tooHighSpeech: "Stay sideways longer!",
    }
  },
  rightElbowAngle: {
    label: "Racquet Drop",
    optimalRange: [70, 120],
    priority: 3,
    cues: {
      positive: "Great racquet drop — ready to accelerate!",
      positiveSpeech: "Great racquet drop!",
      tooLow: "Let the racquet drop behind your back — scratch your back with it",
      tooLowSpeech: "Drop racquet behind back!",
      tooHigh: "Bend your elbow more — create a deeper racquet drop for more snap",
      tooHighSpeech: "Deeper racquet drop for snap!",
    }
  },
  rightKneeFlexion: {
    label: "Leg Drive",
    optimalRange: [130, 170],
    priority: 4,
    cues: {
      positive: "Explosive leg drive — great launch!",
      positiveSpeech: "Explosive leg drive!",
      tooLow: "Bend your knees deeper — load up before you launch",
      tooLowSpeech: "Bend knees, load before launch!",
      tooHigh: "Push up through your legs — jump into the serve",
      tooHighSpeech: "Jump into the serve!",
    }
  },
  spineAngle: {
    label: "Trophy Position",
    optimalRange: [5, 25],
    priority: 5,
    cues: {
      positive: "Great trophy position — arched and loaded!",
      positiveSpeech: "Great trophy position!",
      tooLow: "Arch your back slightly — create a bow shape to snap from",
      tooLowSpeech: "Arch back, create bow shape!",
      tooHigh: "Don't over-arch — protect your back, stay controlled",
      tooHighSpeech: "Don't over-arch, stay controlled!",
    }
  },
};

/**
 * Generic / Default coaching cues (used when no motion-specific profile exists)
 * These are general athletic movement cues that apply broadly
 */
const genericMotion: MotionCoachingProfile = {
  hipRotation: {
    label: "Hip Movement",
    optimalRange: [20, 80],
    priority: 1,
    cues: {
      positive: "Great hip action!",
      positiveSpeech: "Great hip action!",
      tooLow: "Drive more from your hips — they're your power center",
      tooLowSpeech: "Drive more from hips!",
      tooHigh: "Control your hip rotation — stay connected",
      tooHighSpeech: "Control hip rotation!",
    }
  },
  shoulderRotation: {
    label: "Upper Body",
    optimalRange: [20, 80],
    priority: 2,
    cues: {
      positive: "Good upper body rotation!",
      positiveSpeech: "Good rotation!",
      tooLow: "Rotate your upper body more — create torque",
      tooLowSpeech: "Rotate upper body more!",
      tooHigh: "Control your rotation — stay balanced",
      tooHighSpeech: "Stay balanced!",
    }
  },
  rightElbowAngle: {
    label: "Right Arm",
    optimalRange: [80, 160],
    priority: 3,
    cues: {
      positive: "Good arm position!",
      positiveSpeech: "Good arm position!",
      tooLow: "Extend your arm more through the movement",
      tooLowSpeech: "Extend arm more!",
      tooHigh: "Control your arm path — stay compact",
      tooHighSpeech: "Stay compact!",
    }
  },
  spineAngle: {
    label: "Posture",
    optimalRange: [0, 20],
    priority: 4,
    cues: {
      positive: "Great posture!",
      positiveSpeech: "Great posture!",
      tooLow: "Stay tall — imagine a string pulling you up from the top of your head",
      tooLowSpeech: "Stay tall!",
      tooHigh: "Don't lean — stay stacked and balanced",
      tooHighSpeech: "Stay stacked and balanced!",
    }
  },
  rightKneeFlexion: {
    label: "Leg Position",
    optimalRange: [130, 175],
    priority: 5,
    cues: {
      positive: "Good leg position!",
      positiveSpeech: "Good leg position!",
      tooLow: "Drive through your legs — push the ground away",
      tooLowSpeech: "Push the ground away!",
      tooHigh: "Bend your knees more — stay athletic",
      tooHighSpeech: "Stay athletic, bend knees!",
    }
  },
  weightTransfer: {
    label: "Balance",
    optimalRange: [-10, 50],
    priority: 6,
    cues: {
      positive: "Great balance!",
      positiveSpeech: "Great balance!",
      tooLow: "Shift your weight into the movement — commit to it",
      tooLowSpeech: "Commit to the movement!",
      tooHigh: "Stay centered — don't fall forward",
      tooHighSpeech: "Stay centered!",
    }
  },
};

/**
 * Squat coaching cues (powerlifting / goblet squat)
 */
const squat: MotionCoachingProfile = {
  rightKneeFlexion: {
    label: "Depth",
    optimalRange: [70, 120],
    priority: 1,
    cues: {
      positive: "Great depth — below parallel!",
      positiveSpeech: "Great depth!",
      tooLow: "You're too deep — control the bottom, don't dive bomb",
      tooLowSpeech: "Control the bottom!",
      tooHigh: "Sit deeper — push your knees out and sink your hips between your heels",
      tooHighSpeech: "Sink hips between heels!",
    }
  },
  leftKneeFlexion: {
    label: "Knee Symmetry",
    optimalRange: [70, 120],
    priority: 4,
    cues: {
      positive: "Even depth — balanced squat!",
      positiveSpeech: "Balanced squat!",
      tooLow: "Even out your depth — both knees should track equally",
      tooLowSpeech: "Even out both knees!",
      tooHigh: "Match your left knee to your right — stay symmetrical",
      tooHighSpeech: "Stay symmetrical!",
    }
  },
  spineAngle: {
    label: "Torso Position",
    optimalRange: [5, 30],
    priority: 2,
    cues: {
      positive: "Chest up — great torso angle!",
      positiveSpeech: "Chest up, great angle!",
      tooLow: "Drive your chest up — lead with your chest out of the hole",
      tooLowSpeech: "Lead with chest out of hole!",
      tooHigh: "You're folding forward — push your elbows under the bar, chest up",
      tooHighSpeech: "Elbows under bar, chest up!",
    }
  },
  hipRotation: {
    label: "Hip Drive",
    optimalRange: [10, 50],
    priority: 3,
    cues: {
      positive: "Strong hip drive!",
      positiveSpeech: "Strong hip drive!",
      tooLow: "Drive your hips forward — squeeze your glutes at the top",
      tooLowSpeech: "Squeeze glutes at top!",
      tooHigh: "Don't over-extend — finish tall, don't lean back",
      tooHighSpeech: "Finish tall, don't lean back!",
    }
  },
  weightTransfer: {
    label: "Balance",
    optimalRange: [-10, 20],
    priority: 5,
    cues: {
      positive: "Balanced — weight in mid-foot!",
      positiveSpeech: "Great balance!",
      tooLow: "Keep weight in your mid-foot — don't rock onto your heels",
      tooLowSpeech: "Weight in mid-foot!",
      tooHigh: "Don't shift forward onto your toes — sit back more",
      tooHighSpeech: "Sit back, off your toes!",
    }
  },
};

/**
 * Deadlift coaching cues
 */
const deadlift: MotionCoachingProfile = {
  hipRotation: {
    label: "Hip Hinge",
    optimalRange: [20, 70],
    priority: 1,
    cues: {
      positive: "Great hip hinge — powerful lockout!",
      positiveSpeech: "Great hip hinge!",
      tooLow: "Push your hips back further — reach your butt to the wall behind you",
      tooLowSpeech: "Push hips back further!",
      tooHigh: "Drive your hips through the bar — squeeze your glutes to lock out",
      tooHighSpeech: "Drive hips through, squeeze glutes!",
    }
  },
  spineAngle: {
    label: "Back Position",
    optimalRange: [0, 25],
    priority: 2,
    cues: {
      positive: "Flat back — strong position!",
      positiveSpeech: "Flat back, strong!",
      tooLow: "Brace your core harder — take a big breath and push your belly out",
      tooLowSpeech: "Brace core, big breath!",
      tooHigh: "You're rounding — pull your chest up, proud chest, flat back",
      tooHighSpeech: "Proud chest, flat back!",
    }
  },
  rightKneeFlexion: {
    label: "Knee Position",
    optimalRange: [130, 170],
    priority: 3,
    cues: {
      positive: "Good knee angle — efficient pull!",
      positiveSpeech: "Efficient pull!",
      tooLow: "Push your knees out over your toes — make room for the bar",
      tooLowSpeech: "Knees out, make room for bar!",
      tooHigh: "Bend your knees more at the start — don't stiff-leg it",
      tooHighSpeech: "Bend knees more at start!",
    }
  },
  shoulderRotation: {
    label: "Lat Engagement",
    optimalRange: [0, 40],
    priority: 4,
    cues: {
      positive: "Lats engaged — bar stays close!",
      positiveSpeech: "Lats engaged!",
      tooLow: "Pull the bar into your body — bend the bar around your legs",
      tooLowSpeech: "Pull bar into body!",
      tooHigh: "Don't shrug — keep your shoulders packed down",
      tooHighSpeech: "Shoulders packed down!",
    }
  },
  weightTransfer: {
    label: "Balance",
    optimalRange: [-5, 30],
    priority: 5,
    cues: {
      positive: "Balanced pull — mid-foot pressure!",
      positiveSpeech: "Balanced pull!",
      tooLow: "Keep the weight over mid-foot — don't rock back on your heels",
      tooLowSpeech: "Weight over mid-foot!",
      tooHigh: "Don't let the bar pull you forward — sit back into the pull",
      tooHighSpeech: "Sit back into the pull!",
    }
  },
};

// ============================================================
// MOTION PROFILE REGISTRY
// ============================================================

/**
 * Maps motion identifiers to their coaching profiles.
 * The key matching is flexible — it checks subcategory + motion, 
 * category keywords, and motion name keywords.
 */
const motionProfiles: Record<string, MotionCoachingProfile> = {
  // Football
  "football-throw": footballThrow,
  "football-punt": footballThrow, // Similar mechanics
  "football-field-goal": soccerShot, // Kicking motion
  
  // Baseball
  "baseball-fastball": baseballPitch,
  "baseball-curveball": baseballPitch,
  "baseball-slider": baseballPitch,
  "baseball-knuckleball": baseballPitch,
  "baseball-batting-swing": golfSwing, // Similar rotational mechanics
  
  // Basketball
  "basketball-jump-shot": basketballShot,
  "basketball-free-throw": basketballShot,
  "basketball-layup": genericMotion,
  
  // Golf
  "golf-driver-swing": golfSwing,
  "golf-swing": golfSwing,
  "golf-iron-shot": golfSwing,
  "golf-putting": genericMotion,
  
  // Tennis
  "tennis-serve": tennisServe,
  "tennis-forehand": golfSwing, // Similar rotational pattern
  "tennis-backhand": golfSwing,
  
  // Soccer
  "soccer-power-shot": soccerShot,
  "soccer-passing": soccerShot,
  
  // Kettlebell
  "kettlebell-swing": kettlebellSwing,
  "kettlebell-kb-swing": kettlebellSwing,
  "kettlebell-snatch": kettlebellSnatch,
  "kettlebell-kb-snatch": kettlebellSnatch,
  "kettlebell-clean": kettlebellSnatch,
  "kettlebell-kb-clean": kettlebellSnatch,
  "kettlebell-kb-press": genericMotion,
  "kettlebell-kb-deadlift": deadlift,
  "kettlebell-goblet-squat": squat,
  
  // Powerlifting
  "powerlifting-back-squat": squat,
  "powerlifting-front-squat": squat,
  "powerlifting-deadlift": deadlift,
  "powerlifting-sumo-deadlift": deadlift,
  "powerlifting-bench-press": genericMotion,
  "powerlifting-overhead-press": genericMotion,
  
  // Olympic Lifting
  "olympic-lifting-clean-jerk": kettlebellSnatch, // Similar explosive pattern
  "olympic-lifting-snatch": kettlebellSnatch,
  "olympic-lifting-hang-clean": kettlebellSnatch,
  "olympic-lifting-power-clean": kettlebellSnatch,
  
  // Track & Field
  "track-field-shot-put": footballThrow, // Similar rotational throw
  "track-field-discus": golfSwing, // Rotational
  "track-field-javelin": footballThrow, // Overhead throw
  
  // Default
  "default": genericMotion,
};

/**
 * Get the coaching profile for a given motion.
 * Tries exact match first, then fuzzy matching on keywords.
 */
export function getCoachingProfile(
  category: string,
  subcategory: string,
  motionName: string
): MotionCoachingProfile {
  // Build possible keys
  const motionSlug = motionName.toLowerCase().replace(/\s+/g, '-');
  const keys = [
    `${subcategory.toLowerCase()}-${motionSlug}`,
    `${category.toLowerCase()}-${motionSlug}`,
    motionSlug,
  ];
  
  // Try exact match
  for (const key of keys) {
    if (motionProfiles[key]) {
      return motionProfiles[key];
    }
  }
  
  // Try partial match on subcategory
  const subcatLower = subcategory.toLowerCase();
  for (const [profileKey, profile] of Object.entries(motionProfiles)) {
    if (profileKey.startsWith(subcatLower)) {
      return profile;
    }
  }
  
  // Keyword matching
  const combined = `${category} ${subcategory} ${motionName}`.toLowerCase();
  if (combined.includes('kettlebell') && combined.includes('swing')) return kettlebellSwing;
  if (combined.includes('kettlebell') && combined.includes('snatch')) return kettlebellSnatch;
  if (combined.includes('football') || combined.includes('throw')) return footballThrow;
  if (combined.includes('golf') || combined.includes('swing')) return golfSwing;
  if (combined.includes('baseball') || combined.includes('pitch')) return baseballPitch;
  if (combined.includes('basketball') || combined.includes('shot')) return basketballShot;
  if (combined.includes('soccer') || combined.includes('kick')) return soccerShot;
  if (combined.includes('tennis') || combined.includes('serve')) return tennisServe;
  if (combined.includes('squat')) return squat;
  if (combined.includes('deadlift')) return deadlift;
  
  return genericMotion;
}

/**
 * Evaluate a single metric and return the appropriate coaching cue.
 */
export function evaluateMetric(
  config: MetricCoachingConfig,
  value: number
): { type: 'positive' | 'correction'; message: string; detail: string; speech: string } {
  const { optimalRange, cues, label } = config;
  const [min, max] = optimalRange;
  
  if (value >= min && value <= max) {
    return {
      type: 'positive',
      message: cues.positive,
      detail: `${label}: ${value.toFixed(0)}° — in the zone!`,
      speech: cues.positiveSpeech,
    };
  }
  
  if (value < min) {
    return {
      type: 'correction',
      message: cues.tooLow,
      detail: `${label}: ${value.toFixed(0)}° (aim for ${min}–${max}°)`,
      speech: cues.tooLowSpeech,
    };
  }
  
  return {
    type: 'correction',
    message: cues.tooHigh,
    detail: `${label}: ${value.toFixed(0)}° (aim for ${min}–${max}°)`,
    speech: cues.tooHighSpeech,
  };
}

/**
 * Evaluate all available metrics and return prioritized feedback.
 * Returns the top N items (corrections first, then positives).
 * 
 * @param profile The motion-specific coaching profile
 * @param metrics The current metric values from pose detection
 * @param maxItems Maximum number of feedback items to return (default 3)
 */
export function evaluateAllMetrics(
  profile: MotionCoachingProfile,
  metrics: Record<string, number>,
  maxItems: number = 3
): Array<{ type: 'positive' | 'correction'; message: string; detail: string; speech: string; priority: number }> {
  const results: Array<{ type: 'positive' | 'correction'; message: string; detail: string; speech: string; priority: number }> = [];
  
  for (const [key, config] of Object.entries(profile)) {
    const value = metrics[key];
    if (value === undefined || value === null) continue;
    
    const result = evaluateMetric(config, value);
    results.push({ ...result, priority: config.priority });
  }
  
  // Sort: corrections first (by priority), then positives (by priority)
  results.sort((a, b) => {
    if (a.type === 'correction' && b.type === 'positive') return -1;
    if (a.type === 'positive' && b.type === 'correction') return 1;
    return a.priority - b.priority;
  });
  
  // Return top N, but ensure at least 1 positive if available
  const corrections = results.filter(r => r.type === 'correction');
  const positives = results.filter(r => r.type === 'positive');
  
  const selected: typeof results = [];
  
  // Add top corrections (up to maxItems - 1 to leave room for a positive)
  const maxCorrections = positives.length > 0 ? maxItems - 1 : maxItems;
  selected.push(...corrections.slice(0, maxCorrections));
  
  // Fill remaining slots with positives
  const remaining = maxItems - selected.length;
  if (remaining > 0) {
    selected.push(...positives.slice(0, remaining));
  }
  
  return selected;
}
