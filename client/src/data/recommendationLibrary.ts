/**
 * Motion-Specific Recommendation Library
 * 
 * Provides targeted drills and improvement cues for every motion in the app.
 * Recommendations are tied to specific metrics and only surface when a user
 * scores poorly on the relevant metric.
 * 
 * Structure:
 * - Each motion has a set of metric-specific recommendations
 * - Each metric has 3+ drills/cues for common failure points
 * - Recommendations are selected dynamically based on the user's lowest-scoring metrics
 */

export interface DrillRecommendation {
  /** Short title of the drill */
  title: string;
  /** Detailed description of how to perform the drill */
  description: string;
  /** Sets/reps or duration */
  prescription: string;
}

export interface MetricRecommendations {
  /** The metric this set of recommendations addresses */
  metricName: string;
  /** Display-friendly label */
  label: string;
  /** Recommendations when the user's value is too LOW */
  tooLow: DrillRecommendation[];
  /** Recommendations when the user's value is too HIGH */
  tooHigh: DrillRecommendation[];
  /** General improvement drills regardless of direction */
  general: DrillRecommendation[];
}

export interface MotionRecommendationSet {
  motionKey: string;
  motionName: string;
  metrics: MetricRecommendations[];
}

// ============================================================
// SPORTS — FOOTBALL
// ============================================================

const footballThrowRecs: MotionRecommendationSet = {
  motionKey: "football-throw",
  motionName: "QB Throw",
  metrics: [
    {
      metricName: "Hip Rotation",
      label: "Hip Drive",
      tooLow: [
        { title: "Medicine Ball Rotational Throws", description: "Stand sideways to wall, rotate hips explosively to throw ball into wall. Focus on initiating from hips, not arms.", prescription: "3 sets of 10 each side" },
        { title: "Band-Resisted Hip Turns", description: "Attach resistance band at hip level, practice rotating hips against resistance while keeping upper body closed.", prescription: "3 sets of 12 reps" },
        { title: "Step-Behind Throws", description: "From throwing stance, step behind with back foot to force hip rotation before arm action.", prescription: "20 reps at 50% effort" },
      ],
      tooHigh: [
        { title: "Controlled Hip Stops", description: "Practice throwing motion but pause at 60° hip rotation. Build awareness of over-rotation.", prescription: "15 reps with pause" },
        { title: "Wall Alignment Drill", description: "Stand with back hip touching wall, throw without losing wall contact until release.", prescription: "3 sets of 10" },
        { title: "Tempo Throws", description: "Slow-motion throws focusing on sequential hip-to-shoulder timing.", prescription: "10 reps at 25% speed" },
      ],
      general: [
        { title: "Hip Mobility Circles", description: "Standing hip circles in both directions to improve range of motion.", prescription: "2 sets of 15 each direction" },
        { title: "Pallof Press with Rotation", description: "Anti-rotation core exercise that builds rotational power and control.", prescription: "3 sets of 10 each side" },
        { title: "Single-Leg RDL to Rotation", description: "Hinge on one leg, then rotate torso. Builds hip stability and rotational power.", prescription: "3 sets of 8 each side" },
      ]
    },
    {
      metricName: "Elbow Flexion",
      label: "Throwing Elbow",
      tooLow: [
        { title: "Wall Angels with Elbow Focus", description: "Back against wall, slide arms up maintaining 90° elbow bend throughout.", prescription: "3 sets of 15 reps" },
        { title: "Towel Snap Drill", description: "Hold towel behind head at 90° elbow angle, snap forward. Builds muscle memory for proper arm slot.", prescription: "20 reps" },
        { title: "Seated Elbow-Up Throws", description: "Sit on bench, throw with elbow forced above shoulder. Eliminates lower body compensation.", prescription: "15 light throws" },
      ],
      tooHigh: [
        { title: "Elbow-Lead Drill", description: "Practice leading with elbow rather than hand. Throw from compact position.", prescription: "15 reps focusing on compact arm action" },
        { title: "Short-Arm Flicks", description: "Throw from shortened arm position (elbow closer to body) to reduce over-extension.", prescription: "20 reps at short distance" },
        { title: "Partner Mirror Drill", description: "Partner holds arm at correct angle, you match their position before each throw.", prescription: "10 reps with visual feedback" },
      ],
      general: [
        { title: "Band Pull-Aparts", description: "Hold resistance band at arm's length, pull apart focusing on shoulder blade squeeze.", prescription: "3 sets of 15" },
        { title: "Prone Y-T-W Raises", description: "Lie face down, perform Y, T, and W arm positions to strengthen rotator cuff.", prescription: "2 sets of 10 each position" },
        { title: "Wrist Flicks with Football", description: "Hold ball at ear, flick wrist only to build release mechanics.", prescription: "30 reps" },
      ]
    },
    {
      metricName: "Knee Flexion",
      label: "Stride Knee Bend",
      tooLow: [
        { title: "Drop Step Lunges", description: "From throwing stance, drop into deep lunge on stride leg. Build comfort in deeper knee bend.", prescription: "3 sets of 10 each leg" },
        { title: "Wall Sit Holds", description: "Hold wall sit at 90° to build quad endurance for maintaining knee bend during throw.", prescription: "3 sets of 30-45 seconds" },
        { title: "Stride-and-Hold Drill", description: "Take stride, freeze at landing with deep knee bend. Hold 3 seconds before throwing.", prescription: "15 reps" },
      ],
      tooHigh: [
        { title: "Stiff-Front-Leg Throws", description: "Practice throwing with slightly stiffer front leg to find optimal bend.", prescription: "15 reps" },
        { title: "Box Step-Up Throws", description: "Step onto low box with front foot, throw from elevated position. Reduces excessive knee collapse.", prescription: "10 reps each side" },
        { title: "Single-Leg Balance Throws", description: "Stand on front leg only, throw light ball. Builds stability without over-bending.", prescription: "10 reps" },
      ],
      general: [
        { title: "Bodyweight Squats", description: "Focus on controlled descent and depth. Build leg strength for stable base.", prescription: "3 sets of 15" },
        { title: "Split Squat Holds", description: "Hold split squat position matching your throwing stride for time.", prescription: "3 sets of 20 seconds each side" },
        { title: "Lateral Lunges", description: "Step laterally into lunge, push back. Builds lateral stability for throwing platform.", prescription: "3 sets of 10 each side" },
      ]
    },
    {
      metricName: "Spine Extension",
      label: "Spine Angle",
      tooLow: [
        { title: "Cat-Cow with Pause", description: "Perform cat-cow stretches, pausing in extension (cow) to build thoracic mobility.", prescription: "2 sets of 15 reps" },
        { title: "Foam Roller Extensions", description: "Lie on foam roller at mid-back, extend over it to improve thoracic extension.", prescription: "2 sets of 10 extensions" },
        { title: "Tall Kneeling Throws", description: "Kneel upright and throw. Forces proper spine extension without lower body compensation.", prescription: "15 reps" },
      ],
      tooHigh: [
        { title: "Dead Bug Core Holds", description: "Lie on back, extend opposite arm/leg while maintaining flat back. Builds anti-extension strength.", prescription: "3 sets of 10 each side" },
        { title: "Plank with Arm Reach", description: "From plank, reach one arm forward without arching back. Builds core stability.", prescription: "3 sets of 8 each arm" },
        { title: "Neutral Spine Throws", description: "Place dowel along spine, throw without losing contact at head, mid-back, and tailbone.", prescription: "10 reps" },
      ],
      general: [
        { title: "Thoracic Spine Rotations", description: "On all fours, place hand behind head and rotate to open chest. Improves rotational mobility.", prescription: "2 sets of 12 each side" },
        { title: "Bird Dog Holds", description: "Extend opposite arm and leg from all-fours position. Builds spinal stability.", prescription: "3 sets of 10 each side, 3-second holds" },
        { title: "Half-Kneeling Chops", description: "Cable or band chop from high to low in half-kneeling. Builds rotational core strength.", prescription: "3 sets of 10 each side" },
      ]
    },
    {
      metricName: "Weight Transfer",
      label: "Weight Shift",
      tooLow: [
        { title: "Rocker Throws", description: "Rock weight from back foot to front foot before each throw. Exaggerate the shift.", prescription: "20 reps" },
        { title: "Step-Through Drill", description: "Take an exaggerated step forward during throw to force weight transfer.", prescription: "15 reps" },
        { title: "Single-Leg Finish", description: "After each throw, finish balanced on front foot only. Forces full transfer.", prescription: "15 reps" },
      ],
      tooHigh: [
        { title: "Back-Foot Anchor Drill", description: "Keep back foot planted and heavy during throw. Prevents lunging forward.", prescription: "15 reps" },
        { title: "Narrow-Base Throws", description: "Throw from narrow stance to reduce forward momentum.", prescription: "10 reps" },
        { title: "Balance Board Throws", description: "Stand on balance board, throw light ball. Forces controlled weight distribution.", prescription: "10 reps" },
      ],
      general: [
        { title: "Single-Leg Balance Holds", description: "Stand on each leg for time. Builds proprioception for weight transfer.", prescription: "3 sets of 30 seconds each leg" },
        { title: "Lateral Weight Shifts", description: "Stand wide, shift weight side to side. Build awareness of center of mass.", prescription: "2 sets of 20 shifts" },
        { title: "Forward-Backward Hops", description: "Hop forward and back on one leg. Builds dynamic balance for throwing.", prescription: "3 sets of 10 each leg" },
      ]
    },
    {
      metricName: "Foot Positioning",
      label: "Foot Alignment",
      tooLow: [
        { title: "Tape Line Stride Drill", description: "Place tape on ground at 45°, practice striding to land on the line consistently.", prescription: "20 reps" },
        { title: "Cone Target Steps", description: "Place cone at proper stride angle, step to cone before each throw.", prescription: "15 reps" },
        { title: "Closed-Eyes Stride", description: "Close eyes, take stride, open eyes to check foot angle. Builds proprioception.", prescription: "10 reps" },
      ],
      tooHigh: [
        { title: "Narrow Lane Throws", description: "Place two lines close together, stride between them to reduce foot splay.", prescription: "15 reps" },
        { title: "Wall-Guided Stride", description: "Stride along a wall to prevent foot from opening too far.", prescription: "10 reps" },
        { title: "Heel-First Landing Drill", description: "Focus on landing heel first with toes pointing toward target.", prescription: "15 reps" },
      ],
      general: [
        { title: "Agility Ladder Footwork", description: "Quick feet through agility ladder. Builds foot coordination and placement awareness.", prescription: "5 minutes" },
        { title: "Stride Length Markers", description: "Mark optimal stride length on ground, practice hitting the mark consistently.", prescription: "20 reps" },
        { title: "Barefoot Balance Work", description: "Stand barefoot on varied surfaces. Builds foot proprioception.", prescription: "3 sets of 30 seconds" },
      ]
    },
    {
      metricName: "Shoulder External Rotation",
      label: "Shoulder Rotation",
      tooLow: [
        { title: "Sleeper Stretch", description: "Lie on throwing side, use opposite hand to internally rotate shoulder. Hold for stretch.", prescription: "3 sets of 30-second holds" },
        { title: "External Rotation with Band", description: "Elbow at side, rotate forearm outward against band resistance.", prescription: "3 sets of 15" },
        { title: "Arm Cocking Drill", description: "Practice bringing arm to full cocked position slowly, hold 2 seconds.", prescription: "15 reps" },
      ],
      tooHigh: [
        { title: "Controlled Arm Path", description: "Throw with shortened arm path, focusing on compact motion.", prescription: "15 reps at 50% effort" },
        { title: "Internal Rotation Strengthening", description: "Band internal rotation to balance shoulder muscles.", prescription: "3 sets of 15" },
        { title: "Deceleration Eccentrics", description: "Slow down arm after release. Builds control for excessive rotation.", prescription: "10 reps" },
      ],
      general: [
        { title: "Shoulder CARs", description: "Controlled Articular Rotations — full circles with arm at various angles.", prescription: "2 sets of 5 each direction" },
        { title: "90/90 External Rotation", description: "Arm at 90° abduction, 90° elbow bend, rotate forearm up and down.", prescription: "3 sets of 12" },
        { title: "Crossover Symmetry Protocol", description: "Band exercises targeting all rotator cuff muscles in throwing pattern.", prescription: "Full protocol, 2 sets" },
      ]
    }
  ]
};

const footballPuntRecs: MotionRecommendationSet = {
  motionKey: "football-punt",
  motionName: "Punt",
  metrics: [
    {
      metricName: "Hip Rotation", label: "Hip Drive",
      tooLow: [
        { title: "Standing Hip Flexor Kicks", description: "Hold support, swing kicking leg forward with hip drive. Focus on hip extension before kick.", prescription: "3 sets of 12 each leg" },
        { title: "Resistance Band Leg Swings", description: "Attach band to ankle, practice full leg swing against resistance.", prescription: "3 sets of 10" },
        { title: "Drop-Step to Kick", description: "Practice the approach steps emphasizing hip opening before contact.", prescription: "15 reps" },
      ],
      tooHigh: [
        { title: "Controlled Approach Drill", description: "Slow down approach to maintain hip alignment through contact.", prescription: "10 reps at 50% speed" },
        { title: "Wall Hip Stops", description: "Practice swing stopping at optimal hip angle using wall as reference.", prescription: "15 reps" },
        { title: "Partner-Guided Kicks", description: "Partner holds leg at optimal angle, you match the position.", prescription: "10 reps" },
      ],
      general: [
        { title: "Hip Flexor Stretch Series", description: "Kneeling hip flexor stretch, pigeon pose, and 90/90 stretch.", prescription: "Hold each 30 seconds, 2 rounds" },
        { title: "Single-Leg RDL", description: "Romanian deadlift on one leg to build hip stability and hamstring flexibility.", prescription: "3 sets of 10 each leg" },
        { title: "Leg Swing Progressions", description: "Forward/back and side-to-side leg swings with increasing range.", prescription: "2 sets of 15 each direction" },
      ]
    },
    {
      metricName: "Knee Flexion", label: "Plant Leg Stability",
      tooLow: [
        { title: "Single-Leg Squat to Box", description: "Lower on plant leg to box, build strength in bent-knee position.", prescription: "3 sets of 8 each leg" },
        { title: "Lunge-to-Kick Drill", description: "Step into lunge on plant leg, then kick from that position.", prescription: "10 reps each side" },
        { title: "Isometric Wall Sit (Single Leg)", description: "Wall sit on plant leg only to build endurance in knee bend.", prescription: "3 sets of 20 seconds" },
      ],
      tooHigh: [
        { title: "Stiff-Leg Plant Drill", description: "Practice planting with slightly less knee bend for stability.", prescription: "15 reps" },
        { title: "Quick-Plant Kicks", description: "Minimize time on plant foot — quick plant and kick.", prescription: "10 reps" },
        { title: "Elevated Plant Foot", description: "Plant on small platform to reduce excessive knee collapse.", prescription: "10 reps" },
      ],
      general: [
        { title: "Bulgarian Split Squats", description: "Rear foot elevated, lower on front leg. Builds single-leg strength.", prescription: "3 sets of 10 each leg" },
        { title: "Calf Raises (Single Leg)", description: "Build ankle stability for plant foot contact.", prescription: "3 sets of 15 each leg" },
        { title: "Lateral Hops", description: "Hop side to side on plant leg. Builds dynamic stability.", prescription: "3 sets of 10 each direction" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Trunk Position",
      tooLow: [
        { title: "Tall Posture Kicks", description: "Focus on staying upright through the kick. Place hand on head as reminder.", prescription: "15 reps" },
        { title: "Thoracic Extension Drill", description: "Foam roller extensions before kicking to open up chest.", prescription: "2 sets of 10" },
        { title: "Overhead Reach Kicks", description: "Reach opposite arm overhead during kick to promote extension.", prescription: "10 reps" },
      ],
      tooHigh: [
        { title: "Core Bracing Kicks", description: "Brace core before each kick to prevent excessive lean-back.", prescription: "15 reps" },
        { title: "Eyes-Forward Drill", description: "Fix gaze on target at eye level to prevent looking up and arching.", prescription: "10 reps" },
        { title: "Band-Resisted Trunk", description: "Light band around torso pulling backward — resist it during kick.", prescription: "10 reps" },
      ],
      general: [
        { title: "Dead Bug Variations", description: "Anti-extension core work to build trunk stability during dynamic movement.", prescription: "3 sets of 10 each side" },
        { title: "Pallof Press", description: "Anti-rotation core exercise for trunk stability.", prescription: "3 sets of 10 each side" },
        { title: "Plank to Pike", description: "From plank, pike hips up and return. Builds core control.", prescription: "3 sets of 8" },
      ]
    }
  ]
};

const footballFieldGoalRecs: MotionRecommendationSet = {
  motionKey: "football-field-goal",
  motionName: "Field Goal",
  metrics: [
    {
      metricName: "Hip Rotation", label: "Hip Drive",
      tooLow: [
        { title: "Hip Opener Kicks", description: "Practice approach with exaggerated hip opening before contact.", prescription: "15 reps" },
        { title: "Resistance Band Hip Drive", description: "Band around thigh, practice driving hip through the ball.", prescription: "3 sets of 10" },
        { title: "Standing Hip CARs", description: "Full controlled hip circles to improve range of motion.", prescription: "2 sets of 8 each direction" },
      ],
      tooHigh: [
        { title: "Straight-Line Approach", description: "Approach in straight line to reduce hip over-rotation.", prescription: "10 reps" },
        { title: "Plant Foot Alignment", description: "Focus on plant foot pointing at target to control hip rotation.", prescription: "15 reps" },
        { title: "Slow-Motion Kicks", description: "Kick at 25% speed focusing on controlled hip movement.", prescription: "10 reps" },
      ],
      general: [
        { title: "Hip Flexor Mobility", description: "Deep lunge stretches and hip circles before kicking.", prescription: "5 minutes" },
        { title: "Leg Swings", description: "Forward/back leg swings to warm up hip joint.", prescription: "2 sets of 15 each leg" },
        { title: "Single-Leg Glute Bridge", description: "Build hip extension power for kicking.", prescription: "3 sets of 12 each leg" },
      ]
    },
    {
      metricName: "Knee Flexion", label: "Kicking Knee",
      tooLow: [
        { title: "Knee Drive Drill", description: "Practice driving knee through before extending to kick.", prescription: "15 reps" },
        { title: "High-Knee March to Kick", description: "March with high knees, then kick on last step.", prescription: "10 reps" },
        { title: "Seated Knee Extensions", description: "Build quad strength for powerful knee extension.", prescription: "3 sets of 12" },
      ],
      tooHigh: [
        { title: "Compact Swing Drill", description: "Shorten backswing to reduce excessive knee bend.", prescription: "15 reps" },
        { title: "Quick-Lock Kicks", description: "Focus on locking knee at contact — no excessive follow-through bend.", prescription: "10 reps" },
        { title: "Wall Kick Stops", description: "Kick toward wall pad, stopping at contact to feel locked position.", prescription: "10 reps" },
      ],
      general: [
        { title: "Quad Strengthening", description: "Leg extensions and squats to build kicking power.", prescription: "3 sets of 12" },
        { title: "Hamstring Flexibility", description: "Straight-leg stretches to allow full knee extension.", prescription: "3 sets of 30-second holds" },
        { title: "Approach Rhythm Drill", description: "Practice 3-step approach focusing on consistent rhythm.", prescription: "20 reps" },
      ]
    },
    {
      metricName: "Weight Transfer", label: "Balance Through Contact",
      tooLow: [
        { title: "Follow-Through Step", description: "After kick, take a step forward with plant foot. Forces weight transfer.", prescription: "15 reps" },
        { title: "Momentum Kicks", description: "Jog into kick to build forward momentum.", prescription: "10 reps" },
        { title: "Lean-Forward Drill", description: "Slight forward lean at contact to shift weight through ball.", prescription: "15 reps" },
      ],
      tooHigh: [
        { title: "Balanced Finish", description: "Hold finish position on plant leg for 3 seconds after kick.", prescription: "10 reps" },
        { title: "Narrow Approach", description: "Shorten approach to reduce forward momentum.", prescription: "10 reps" },
        { title: "Eyes on Contact Point", description: "Keep eyes down on ball through contact to prevent lunging.", prescription: "15 reps" },
      ],
      general: [
        { title: "Single-Leg Balance", description: "Stand on plant leg with eyes closed. Build proprioception.", prescription: "3 sets of 30 seconds" },
        { title: "Approach Consistency", description: "Mark steps with cones, hit same marks every time.", prescription: "20 reps" },
        { title: "Core Anti-Rotation", description: "Pallof press and bird dogs to stabilize trunk during kick.", prescription: "3 sets of 10 each side" },
      ]
    }
  ]
};

// ============================================================
// SPORTS — BASKETBALL
// ============================================================

const basketballJumpShotRecs: MotionRecommendationSet = {
  motionKey: "basketball-jump-shot",
  motionName: "Jump Shot",
  metrics: [
    {
      metricName: "Elbow Flexion", label: "Shooting Elbow",
      tooLow: [
        { title: "Form Shooting (Close Range)", description: "Stand 3 feet from basket, shoot one-handed focusing on full elbow extension at release.", prescription: "50 reps" },
        { title: "Wall Flick Drill", description: "Face wall at arm's length, flick ball up using only elbow extension.", prescription: "3 sets of 20" },
        { title: "Lying Elbow Extensions", description: "Lie on back, extend ball straight up using elbow only. Builds muscle memory.", prescription: "3 sets of 15" },
      ],
      tooHigh: [
        { title: "Guide Hand Focus", description: "Shoot with guide hand only touching ball lightly. Prevents pushing.", prescription: "20 reps" },
        { title: "One-Knee Shooting", description: "Kneel on shooting-side knee, shoot with compact motion.", prescription: "30 reps" },
        { title: "Elbow-In Drill", description: "Place tennis ball between elbow and body, shoot without dropping it.", prescription: "15 reps" },
      ],
      general: [
        { title: "BEEF Fundamentals", description: "Balance, Eyes, Elbow, Follow-through. Practice each element separately.", prescription: "10 reps focusing on each element" },
        { title: "Catch-and-Shoot Rhythm", description: "Partner passes, catch in shooting pocket, shoot in one motion.", prescription: "3 sets of 10" },
        { title: "Free Throw Routine", description: "Develop consistent pre-shot routine. Same motion every time.", prescription: "25 free throws" },
      ]
    },
    {
      metricName: "Knee Flexion", label: "Leg Power",
      tooLow: [
        { title: "Deep Dip Shooting", description: "Exaggerate knee bend before shooting. Dip lower than normal.", prescription: "20 reps" },
        { title: "Squat-to-Shot Drill", description: "Full squat, stand up into shooting motion. Builds leg-to-shot connection.", prescription: "15 reps" },
        { title: "Chair Drill", description: "Sit in chair, stand up into jump shot. Forces leg engagement.", prescription: "15 reps" },
      ],
      tooHigh: [
        { title: "Quick-Release Shooting", description: "Minimize dip time — catch and shoot quickly with less knee bend.", prescription: "20 reps" },
        { title: "Elevated Shooting", description: "Stand on small platform, shoot without jumping down. Reduces over-dipping.", prescription: "15 reps" },
        { title: "Rhythm Shooting", description: "Focus on smooth, quick rhythm rather than deep loading.", prescription: "20 reps" },
      ],
      general: [
        { title: "Box Jumps", description: "Explosive jump onto box. Builds leg power for jump shot.", prescription: "3 sets of 8" },
        { title: "Jump Squats", description: "Bodyweight squat into explosive jump. Builds shooting power.", prescription: "3 sets of 10" },
        { title: "Calf Raises", description: "Build ankle power for consistent jump height.", prescription: "3 sets of 15" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Body Alignment",
      tooLow: [
        { title: "Upright Shooting Drill", description: "Place hand on top of head before each shot — forces upright posture.", prescription: "15 reps" },
        { title: "Back-to-Wall Shots", description: "Stand with back near wall, shoot without touching wall. Prevents lean.", prescription: "15 reps" },
        { title: "Eyes-on-Rim Focus", description: "Lock eyes on front of rim throughout shot. Promotes upright alignment.", prescription: "20 reps" },
      ],
      tooHigh: [
        { title: "Neutral Spine Shooting", description: "Focus on shooting straight up, not fading backward.", prescription: "20 reps" },
        { title: "Landing-Spot Drill", description: "Land in same spot you jumped from. Prevents backward fade.", prescription: "15 reps" },
        { title: "Core Engagement Shots", description: "Brace core before each shot to maintain neutral spine.", prescription: "15 reps" },
      ],
      general: [
        { title: "Plank Holds", description: "Build core stability for maintaining alignment during shot.", prescription: "3 sets of 30 seconds" },
        { title: "Balance Board Shooting", description: "Stand on balance board, practice shooting form (no ball needed).", prescription: "2 sets of 10" },
        { title: "Mirror Work", description: "Practice shooting form in front of mirror. Check alignment.", prescription: "5 minutes" },
      ]
    }
  ]
};

const basketballFreeThrowRecs: MotionRecommendationSet = {
  motionKey: "basketball-free-throw",
  motionName: "Free Throw",
  metrics: [
    {
      metricName: "Elbow Flexion", label: "Shooting Arm",
      tooLow: [
        { title: "One-Hand Form Shots", description: "Shoot free throws with shooting hand only. Focus on full extension.", prescription: "30 reps" },
        { title: "Finger Roll Drill", description: "Roll ball off fingertips with full arm extension. Build release feel.", prescription: "20 reps" },
        { title: "Target Shooting", description: "Aim for front of rim, focus on high arc requiring full extension.", prescription: "25 reps" },
      ],
      tooHigh: [{ title: "Compact Release", description: "Shorten follow-through, release earlier in motion.", prescription: "20 reps" },
        { title: "Low Arc Practice", description: "Shoot with flatter arc to reduce over-extension.", prescription: "15 reps" },
        { title: "Elbow Alignment Check", description: "Partner checks elbow position at release — should be at forehead height.", prescription: "15 reps" },
      ],
      general: [
        { title: "Pre-Shot Routine", description: "Develop exact same routine before every free throw. Builds consistency.", prescription: "50 free throws with routine" },
        { title: "Eyes-Closed Free Throws", description: "Shoot with eyes closed to build kinesthetic awareness.", prescription: "10 reps" },
        { title: "Pressure Free Throws", description: "Must make 2 in a row before moving on. Builds mental toughness.", prescription: "Until 10 sets of 2 made" },
      ]
    },
    {
      metricName: "Knee Flexion", label: "Leg Rhythm",
      tooLow: [
        { title: "Dip-and-Shoot Rhythm", description: "Exaggerate the dip — bend knees, pause, then shoot in one motion.", prescription: "20 reps" },
        { title: "Squat Hold to Shot", description: "Hold slight squat for 2 seconds, then rise into shot.", prescription: "15 reps" },
        { title: "Bounce-Bounce-Shoot", description: "Bounce ball twice (your routine), dip, shoot. Same rhythm every time.", prescription: "25 reps" },
      ],
      tooHigh: [
        { title: "Minimal Dip Shooting", description: "Reduce knee bend — just a slight flex before shooting.", prescription: "20 reps" },
        { title: "Quick Rhythm Shots", description: "Catch and shoot quickly without deep loading.", prescription: "15 reps" },
        { title: "Upper Body Focus", description: "Consciously focus on arm mechanics, let legs follow naturally.", prescription: "20 reps" },
      ],
      general: [
        { title: "Rhythm Consistency", description: "Count tempo: 1 (dip) 2 (rise) 3 (release). Same every time.", prescription: "30 free throws" },
        { title: "Fatigue Free Throws", description: "Sprint baseline to baseline, then shoot 2 free throws. Repeat.", prescription: "10 rounds" },
        { title: "Visualization", description: "Close eyes, visualize perfect free throw 5 times before shooting.", prescription: "Before each set" },
      ]
    },
    {
      metricName: "Weight Transfer", label: "Balance",
      tooLow: [
        { title: "Forward Lean Drill", description: "Shift weight slightly forward onto toes before shooting.", prescription: "15 reps" },
        { title: "Step-Into Free Throw", description: "Take small step forward into shooting position. Builds momentum.", prescription: "15 reps" },
        { title: "Toe Raise Shots", description: "Rise onto toes during shot to ensure forward energy.", prescription: "20 reps" },
      ],
      tooHigh: [
        { title: "Flat-Foot Shooting", description: "Keep feet flat through entire shot. No jumping or lunging.", prescription: "20 reps" },
        { title: "Line Drill", description: "Stand behind free throw line, shoot without stepping over.", prescription: "25 reps" },
        { title: "Balanced Finish", description: "Hold follow-through for 3 seconds after release. Check balance.", prescription: "15 reps" },
      ],
      general: [
        { title: "Single-Leg Balance", description: "Stand on each foot for 30 seconds. Build proprioception.", prescription: "3 sets each leg" },
        { title: "Consistent Foot Placement", description: "Mark exact foot position with tape. Same spot every time.", prescription: "30 reps" },
        { title: "Deep Breathing Routine", description: "3 deep breaths before each free throw. Calms body for consistent motion.", prescription: "Every free throw" },
      ]
    }
  ]
};

const basketballLayupRecs: MotionRecommendationSet = {
  motionKey: "basketball-layup",
  motionName: "Layup",
  metrics: [
    {
      metricName: "Knee Flexion", label: "Takeoff Power",
      tooLow: [
        { title: "Power Skip Drill", description: "Skip with exaggerated knee drive. Builds explosive takeoff.", prescription: "3 sets of 10 each leg" },
        { title: "One-Foot Box Jumps", description: "Jump onto box from one foot. Builds single-leg power.", prescription: "3 sets of 8 each leg" },
        { title: "Approach-and-Jump", description: "Practice 2-step approach with maximum knee drive on takeoff.", prescription: "15 reps each side" },
      ],
      tooHigh: [
        { title: "Speed Layups", description: "Full-speed layups focusing on quick, efficient takeoff.", prescription: "10 reps each side" },
        { title: "Floater Practice", description: "Release ball earlier with less jump. Builds soft touch.", prescription: "15 reps" },
        { title: "Euro-Step Layups", description: "Change direction on approach — reduces over-jumping.", prescription: "10 reps each side" },
      ],
      general: [
        { title: "Mikan Drill", description: "Alternating layups from each side without dribbling.", prescription: "2 sets of 20 (10 each side)" },
        { title: "Reverse Layups", description: "Practice from opposite side of basket. Builds ambidexterity.", prescription: "10 reps each side" },
        { title: "Contact Layups", description: "Partner provides light contact during layup. Builds body control.", prescription: "10 reps" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Body Control",
      tooLow: [
        { title: "Chin-Up Layups", description: "Keep chin up and eyes on target throughout layup.", prescription: "15 reps" },
        { title: "Extended Arm Finish", description: "Reach ball as high as possible at release point.", prescription: "15 reps" },
        { title: "Wall Touch Drill", description: "Jump and touch highest point on wall with ball. Builds extension.", prescription: "3 sets of 10" },
      ],
      tooHigh: [
        { title: "Controlled Finish", description: "Focus on soft touch rather than maximum height.", prescription: "15 reps" },
        { title: "Backboard Target", description: "Aim for specific spot on backboard. Requires controlled approach.", prescription: "20 reps" },
        { title: "Slow-Motion Layups", description: "Walk through layup at half speed focusing on body position.", prescription: "10 reps" },
      ],
      general: [
        { title: "Core Stability Work", description: "Planks and hollow holds to maintain body control in air.", prescription: "3 sets of 30 seconds" },
        { title: "Footwork Patterns", description: "Practice 1-2 step pattern from various angles.", prescription: "10 reps from 5 angles" },
        { title: "Off-Hand Layups", description: "Practice with non-dominant hand to build coordination.", prescription: "15 reps" },
      ]
    },
    {
      metricName: "Weight Transfer", label: "Momentum",
      tooLow: [
        { title: "Full-Speed Approaches", description: "Drive at full speed into layup. Build momentum.", prescription: "10 reps" },
        { title: "Long Stride Layups", description: "Take longer final stride to build forward momentum.", prescription: "10 reps" },
        { title: "Dribble Drive Layups", description: "2-3 hard dribbles into layup. Builds approach speed.", prescription: "10 reps each side" },
      ],
      tooHigh: [
        { title: "Controlled Approach", description: "Slow down final 2 steps for controlled finish.", prescription: "15 reps" },
        { title: "Jump Stop to Layup", description: "Jump stop, then go up. Reduces forward momentum.", prescription: "10 reps" },
        { title: "Balanced Landing", description: "Focus on landing under control after layup.", prescription: "15 reps" },
      ],
      general: [
        { title: "Cone Weave Layups", description: "Weave through cones, finish with layup. Builds change of direction.", prescription: "10 reps" },
        { title: "Transition Layups", description: "Sprint from half court into layup. Game-speed practice.", prescription: "10 reps" },
        { title: "Contested Layups", description: "Partner stands near basket (no blocking). Finish through traffic.", prescription: "10 reps" },
      ]
    }
  ]
};

const basketballDribblingRecs: MotionRecommendationSet = {
  motionKey: "basketball-dribbling",
  motionName: "Dribbling",
  metrics: [
    {
      metricName: "Knee Flexion", label: "Athletic Stance",
      tooLow: [
        { title: "Low Dribble Drill", description: "Dribble at knee height, forcing low athletic stance.", prescription: "30 seconds each hand" },
        { title: "Chair Sits While Dribbling", description: "Sit in invisible chair while dribbling. Builds low stance.", prescription: "3 sets of 20 seconds" },
        { title: "Defensive Slide Dribble", description: "Slide laterally while dribbling. Forces low position.", prescription: "3 sets of 10 slides" },
      ],
      tooHigh: [
        { title: "Upright Speed Dribble", description: "Practice pushing ball ahead at full speed. Less knee bend needed.", prescription: "10 full-court reps" },
        { title: "Transition Dribbling", description: "Focus on covering ground quickly with taller posture.", prescription: "10 reps" },
        { title: "Head-Up Dribbling", description: "Keep eyes up, natural athletic stance without over-crouching.", prescription: "2 minutes continuous" },
      ],
      general: [
        { title: "Stationary Ball Handling", description: "Crossovers, between legs, behind back while stationary.", prescription: "2 minutes each move" },
        { title: "Two-Ball Dribbling", description: "Dribble two balls simultaneously. Builds coordination.", prescription: "3 sets of 30 seconds" },
        { title: "Tennis Ball Reaction", description: "Dribble with one hand, catch/throw tennis ball with other.", prescription: "2 sets of 30 seconds" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Posture",
      tooLow: [
        { title: "Eyes-Up Dribbling", description: "Focus on target on wall while dribbling. Forces upright posture.", prescription: "2 minutes" },
        { title: "Partner Number Call", description: "Partner holds up fingers, call out number while dribbling.", prescription: "2 sets of 1 minute" },
        { title: "Head-Up Cone Weave", description: "Weave through cones while looking ahead, not at ball.", prescription: "10 reps" },
      ],
      tooHigh: [
        { title: "Protective Dribble", description: "Practice shielding ball with body — requires slight forward lean.", prescription: "1 minute each side" },
        { title: "Low-and-Tight Drill", description: "Keep ball below waist with slight forward lean for protection.", prescription: "30 seconds each hand" },
        { title: "Change of Pace", description: "Alternate between upright speed dribble and low protective dribble.", prescription: "2 minutes" },
      ],
      general: [
        { title: "Full-Court Dribbling", description: "Dribble full court with different moves at each cone.", prescription: "5 full-court trips" },
        { title: "1-on-1 Dribbling", description: "Practice against defender to build game-speed habits.", prescription: "5 possessions" },
        { title: "Dribble Tag", description: "Everyone dribbles, try to knock others' ball away. Builds awareness.", prescription: "3 rounds of 1 minute" },
      ]
    },
    {
      metricName: "Hip Rotation", label: "Change of Direction",
      tooLow: [
        { title: "Crossover Step Drill", description: "Practice explosive crossover with hip rotation to change direction.", prescription: "3 sets of 10 each direction" },
        { title: "Cone Zig-Zag", description: "Dribble through cones with sharp direction changes.", prescription: "10 reps" },
        { title: "Hip Turn Crossovers", description: "Focus on turning hips during crossover for deception.", prescription: "20 reps each direction" },
      ],
      tooHigh: [
        { title: "Straight-Line Speed", description: "Practice pushing ball ahead in straight line. Minimize rotation.", prescription: "10 full-court reps" },
        { title: "Controlled Changes", description: "Slow down direction changes for better ball control.", prescription: "15 reps" },
        { title: "Hesitation Moves", description: "Use hesitation instead of full hip turn to create space.", prescription: "15 reps" },
      ],
      general: [
        { title: "Agility Ladder", description: "Quick feet through ladder while dribbling.", prescription: "5 trips through" },
        { title: "Reaction Dribbling", description: "Partner points direction, you change direction immediately.", prescription: "2 sets of 1 minute" },
        { title: "Game-Speed Moves", description: "Practice your go-to moves at full speed.", prescription: "10 reps of each move" },
      ]
    }
  ]
};

// ============================================================
// SPORTS — BASEBALL
// ============================================================

const baseballFastballRecs: MotionRecommendationSet = {
  motionKey: "baseball-fastball",
  motionName: "Fastball",
  metrics: [
    {
      metricName: "Hip Rotation", label: "Hip Drive",
      tooLow: [
        { title: "Pivot Pickoffs", description: "Practice explosive hip rotation from stretch position.", prescription: "3 sets of 10" },
        { title: "Medicine Ball Rotational Throws", description: "Side-facing wall, rotate hips to throw med ball. Lead with hips.", prescription: "3 sets of 10 each side" },
        { title: "Towel Drill with Hip Lead", description: "Snap towel focusing on hip rotation initiating the motion.", prescription: "20 reps" },
      ],
      tooHigh: [
        { title: "Controlled Rotation Drill", description: "Throw at 75% focusing on hip-shoulder separation timing.", prescription: "15 reps" },
        { title: "Balance Point Holds", description: "Hold balance point for 3 seconds before throwing. Controls tempo.", prescription: "10 reps" },
        { title: "Flat Ground Work", description: "Throw from flat ground focusing on controlled mechanics.", prescription: "20 reps" },
      ],
      general: [
        { title: "Hip Mobility Series", description: "90/90 stretch, hip CARs, and pigeon pose before throwing.", prescription: "5 minutes" },
        { title: "Rotational Power Exercises", description: "Cable rotations, landmine rotations, and Russian twists.", prescription: "3 sets of 10 each" },
        { title: "Long Toss", description: "Progressive distance throwing to build arm strength and mechanics.", prescription: "10 minutes, building to max distance" },
      ]
    },
    {
      metricName: "Elbow Flexion", label: "Arm Slot",
      tooLow: [
        { title: "High Elbow Cue", description: "Focus on getting elbow above shoulder before acceleration.", prescription: "15 reps at 50%" },
        { title: "Fence Drill", description: "Stand next to fence, throw without hitting fence. Forces high elbow.", prescription: "15 reps" },
        { title: "Knee Throws", description: "Throw from one knee focusing on arm path and elbow height.", prescription: "20 reps" },
      ],
      tooHigh: [
        { title: "Arm Circle Throws", description: "Full arm circle before throw to find natural slot.", prescription: "10 reps" },
        { title: "Connection Ball Drill", description: "Hold small ball between bicep and torso during wind-up.", prescription: "10 reps" },
        { title: "Three-Quarter Slot Work", description: "Consciously throw from 3/4 slot rather than directly overhead.", prescription: "15 reps" },
      ],
      general: [
        { title: "Band Arm Care", description: "J-bands or Crossover Symmetry for shoulder health.", prescription: "Full protocol" },
        { title: "Wrist Flicks", description: "Seated wrist flicks to build release mechanics.", prescription: "3 sets of 20" },
        { title: "Weighted Ball Throws", description: "Underload/overload throwing with varied ball weights.", prescription: "10 reps each weight" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Trunk Tilt",
      tooLow: [
        { title: "Lateral Trunk Lean Drill", description: "Practice leaning toward glove side during delivery.", prescription: "15 reps" },
        { title: "Tall-and-Fall Drill", description: "Start tall, fall toward plate with slight trunk tilt.", prescription: "10 reps" },
        { title: "Downhill Mound Work", description: "Use mound slope to promote natural trunk tilt.", prescription: "15 reps" },
      ],
      tooHigh: [
        { title: "Upright Delivery Drill", description: "Focus on staying more upright through release.", prescription: "15 reps" },
        { title: "Core Bracing Throws", description: "Brace core to prevent excessive lean during delivery.", prescription: "10 reps" },
        { title: "Eyes-on-Target", description: "Keep eyes level with target throughout delivery.", prescription: "15 reps" },
      ],
      general: [
        { title: "Anti-Lateral Flexion", description: "Side planks and suitcase carries for trunk stability.", prescription: "3 sets of 30 seconds each side" },
        { title: "Thoracic Mobility", description: "Open books and thread-the-needle for upper back mobility.", prescription: "2 sets of 10 each side" },
        { title: "Plank Variations", description: "Front, side, and rotating planks for core stability.", prescription: "3 sets of 20 seconds each" },
      ]
    }
  ]
};

// Use fastball recs as base for other pitches (similar mechanics)
const baseballCurveballRecs: MotionRecommendationSet = { ...baseballFastballRecs, motionKey: "baseball-curveball", motionName: "Curveball" };
const baseballSliderRecs: MotionRecommendationSet = { ...baseballFastballRecs, motionKey: "baseball-slider", motionName: "Slider" };
const baseballKnuckleballRecs: MotionRecommendationSet = { ...baseballFastballRecs, motionKey: "baseball-knuckleball", motionName: "Knuckleball" };

const baseballBattingRecs: MotionRecommendationSet = {
  motionKey: "baseball-batting-swing",
  motionName: "Batting Swing",
  metrics: [
    {
      metricName: "Hip Rotation", label: "Hip Rotation",
      tooLow: [
        { title: "Tee Work with Hip Focus", description: "Hit off tee focusing on full hip rotation through contact.", prescription: "3 sets of 15 swings" },
        { title: "Medicine Ball Rotational Slam", description: "Rotate and slam med ball into ground. Builds rotational power.", prescription: "3 sets of 10" },
        { title: "Resistance Band Swings", description: "Attach band to bat, swing against resistance to build hip drive.", prescription: "3 sets of 10" },
      ],
      tooHigh: [
        { title: "Stay-Back Drill", description: "Focus on keeping weight back longer before rotating.", prescription: "15 swings" },
        { title: "Opposite Field Hitting", description: "Hit to opposite field — requires staying closed longer.", prescription: "15 swings" },
        { title: "Soft Toss Inside", description: "Hit inside pitches to practice controlled rotation.", prescription: "15 swings" },
      ],
      general: [
        { title: "Dry Swings", description: "50 quality dry swings focusing on mechanics.", prescription: "50 reps" },
        { title: "Heavy Bat Swings", description: "Swing weighted bat to build rotational strength.", prescription: "3 sets of 10" },
        { title: "Tee Work (All Zones)", description: "Hit off tee at inside, middle, and outside locations.", prescription: "10 reps each zone" },
      ]
    },
    {
      metricName: "Knee Flexion", label: "Load & Drive",
      tooLow: [
        { title: "Load Drill", description: "Practice loading back leg (slight knee bend) before swing.", prescription: "20 reps (no swing)" },
        { title: "Squat-to-Swing", description: "Start in slight squat, drive up into swing.", prescription: "15 swings" },
        { title: "Back Leg Drive", description: "Focus on pushing off back leg into rotation.", prescription: "15 swings" },
      ],
      tooHigh: [
        { title: "Tall Stance Hitting", description: "Start with less knee bend, more upright stance.", prescription: "15 swings" },
        { title: "Quick Hands Drill", description: "Focus on hand speed rather than leg drive.", prescription: "15 swings" },
        { title: "No-Stride Hitting", description: "Hit without striding — reduces excessive knee bend.", prescription: "15 swings" },
      ],
      general: [
        { title: "Front Toss", description: "Partner tosses from front, focus on timing and mechanics.", prescription: "3 sets of 10" },
        { title: "Batting Practice", description: "Live BP focusing on driving ball to all fields.", prescription: "3 rounds of 10 pitches" },
        { title: "Leg Strength Work", description: "Squats and lunges to build lower body power.", prescription: "3 sets of 10 each" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Posture",
      tooLow: [
        { title: "Tall Posture Swings", description: "Keep head and chest up throughout swing.", prescription: "15 swings" },
        { title: "Mirror Swings", description: "Watch yourself swing in mirror, check for posture collapse.", prescription: "20 dry swings" },
        { title: "Chin-to-Shoulder Drill", description: "Keep chin on front shoulder at start, back shoulder at finish.", prescription: "15 swings" },
      ],
      tooHigh: [
        { title: "Level Swing Path", description: "Focus on level bat path rather than uppercut.", prescription: "15 swings" },
        { title: "Top-Hand Drill", description: "Swing with top hand only to reduce lean-back.", prescription: "10 swings" },
        { title: "Line Drive Focus", description: "Hit line drives — requires staying through the ball.", prescription: "15 swings" },
      ],
      general: [
        { title: "Core Rotational Work", description: "Russian twists, cable rotations for trunk stability.", prescription: "3 sets of 12 each" },
        { title: "Balance Beam Swings", description: "Stand on narrow surface, take dry swings. Builds balance.", prescription: "10 swings" },
        { title: "Slow-Motion Swings", description: "Full swing at 25% speed checking each position.", prescription: "10 reps" },
      ]
    }
  ]
};

// ============================================================
// SPORTS — TENNIS
// ============================================================

const tennisForehandRecs: MotionRecommendationSet = {
  motionKey: "tennis-forehand",
  motionName: "Forehand",
  metrics: [
    {
      metricName: "Hip Rotation", label: "Hip Rotation",
      tooLow: [
        { title: "Shadow Swings with Hip Lead", description: "Practice forehand motion leading with hip rotation.", prescription: "3 sets of 15" },
        { title: "Medicine Ball Side Throws", description: "Rotate and throw med ball sideways. Builds rotational power.", prescription: "3 sets of 10 each side" },
        { title: "Closed-to-Open Drill", description: "Start fully closed (sideways), rotate hips to open position.", prescription: "20 reps" },
      ],
      tooHigh: [
        { title: "Controlled Follow-Through", description: "Focus on finishing with racquet over shoulder, not spinning.", prescription: "15 reps" },
        { title: "Front-Foot Anchor", description: "Keep front foot planted to limit over-rotation.", prescription: "15 reps" },
        { title: "Target Practice", description: "Hit to specific target — requires controlled rotation.", prescription: "20 balls" },
      ],
      general: [
        { title: "Split-Step Drill", description: "Practice split step timing before each forehand.", prescription: "20 reps" },
        { title: "Rally Consistency", description: "Rally 20 balls in a row focusing on consistent mechanics.", prescription: "3 sets of 20" },
        { title: "Footwork Patterns", description: "Practice open, semi-open, and neutral stance forehands.", prescription: "10 reps each stance" },
      ]
    },
    {
      metricName: "Elbow Flexion", label: "Arm Extension",
      tooLow: [
        { title: "Extended Contact Drill", description: "Focus on making contact with arm extended away from body.", prescription: "20 reps" },
        { title: "Fence Drill", description: "Stand arm's length from fence, swing without hitting it.", prescription: "15 reps" },
        { title: "Reach-and-Hit", description: "Partner feeds wide balls requiring full arm extension.", prescription: "15 reps" },
      ],
      tooHigh: [
        { title: "Compact Swing", description: "Shorten backswing and focus on compact forward swing.", prescription: "20 reps" },
        { title: "Close-Range Rallies", description: "Rally from service line — requires compact motion.", prescription: "3 sets of 20 balls" },
        { title: "Elbow-In Drill", description: "Keep elbow closer to body through contact zone.", prescription: "15 reps" },
      ],
      general: [
        { title: "Wall Rallies", description: "Hit against wall continuously. Builds timing and consistency.", prescription: "5 minutes" },
        { title: "Drop-Feed Practice", description: "Drop ball yourself, hit forehand. Control the setup.", prescription: "30 reps" },
        { title: "Cross-Court Rallies", description: "Rally cross-court only. Builds consistent swing path.", prescription: "3 sets of 20 balls" },
      ]
    },
    {
      metricName: "Weight Transfer", label: "Weight Transfer",
      tooLow: [
        { title: "Step-Into Forehands", description: "Take clear step forward into each forehand.", prescription: "20 reps" },
        { title: "Momentum Drill", description: "Start moving forward, hit forehand while moving into court.", prescription: "15 reps" },
        { title: "Front-Foot Finish", description: "Finish balanced on front foot after every forehand.", prescription: "20 reps" },
      ],
      tooHigh: [
        { title: "Balanced Finish", description: "Hold finish position for 2 seconds. Check balance.", prescription: "15 reps" },
        { title: "Recovery Step", description: "After each shot, recover to ready position. Prevents over-commitment.", prescription: "20 reps" },
        { title: "Open Stance Practice", description: "Hit from open stance to reduce forward weight shift.", prescription: "15 reps" },
      ],
      general: [
        { title: "Agility Ladder", description: "Quick feet through ladder. Builds footwork for weight transfer.", prescription: "5 trips" },
        { title: "Approach Shot Drill", description: "Hit and move forward to net. Practices weight transfer in motion.", prescription: "10 reps" },
        { title: "Shadow Footwork", description: "Practice footwork patterns without ball.", prescription: "3 sets of 1 minute" },
      ]
    }
  ]
};

const tennisBackhandRecs: MotionRecommendationSet = {
  motionKey: "tennis-backhand",
  motionName: "Backhand",
  metrics: [
    {
      metricName: "Hip Rotation", label: "Hip Rotation",
      tooLow: [
        { title: "Hip-Lead Backhands", description: "Initiate backhand with hip rotation before arms.", prescription: "20 reps" },
        { title: "Resistance Band Rotations", description: "Band around waist, rotate against resistance.", prescription: "3 sets of 10" },
        { title: "Closed Stance Practice", description: "Hit from fully closed stance to maximize rotation.", prescription: "15 reps" },
      ],
      tooHigh: [
        { title: "Compact Backhand", description: "Shorter backswing with controlled rotation.", prescription: "20 reps" },
        { title: "Slice Backhands", description: "Practice slice — requires less rotation.", prescription: "15 reps" },
        { title: "Contact Point Focus", description: "Focus on making contact in front of body.", prescription: "20 reps" },
      ],
      general: [
        { title: "Two-Hand Coordination", description: "Practice syncing both hands through the swing.", prescription: "30 reps" },
        { title: "Backhand Rallies", description: "Rally backhand-only to build consistency.", prescription: "3 sets of 20 balls" },
        { title: "Drop-Feed Backhands", description: "Self-feed and hit backhands for controlled practice.", prescription: "30 reps" },
      ]
    },
    {
      metricName: "Elbow Flexion", label: "Arm Position",
      tooLow: [
        { title: "Extended Follow-Through", description: "Focus on extending arms fully through contact.", prescription: "20 reps" },
        { title: "High Finish Drill", description: "Finish with racquet high over opposite shoulder.", prescription: "15 reps" },
        { title: "Reach Drill", description: "Hit balls fed slightly away to force extension.", prescription: "15 reps" },
      ],
      tooHigh: [
        { title: "Compact Backswing", description: "Minimize backswing length for better timing.", prescription: "20 reps" },
        { title: "Close-Range Practice", description: "Rally from service line with compact motion.", prescription: "3 sets of 20" },
        { title: "Wrist-Lag Drill", description: "Focus on wrist lag rather than arm extension for power.", prescription: "15 reps" },
      ],
      general: [
        { title: "Wall Practice", description: "Hit backhands against wall continuously.", prescription: "5 minutes" },
        { title: "Down-the-Line Backhands", description: "Hit down the line — requires precise arm path.", prescription: "15 reps" },
        { title: "Approach Backhands", description: "Hit backhand and follow to net.", prescription: "10 reps" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Posture",
      tooLow: [
        { title: "Upright Stance Drill", description: "Focus on staying tall through the backhand.", prescription: "20 reps" },
        { title: "Head Still Drill", description: "Keep head still and eyes on contact point.", prescription: "15 reps" },
        { title: "Balance Check", description: "Hold finish position, check you're not hunched.", prescription: "15 reps" },
      ],
      tooHigh: [
        { title: "Athletic Bend", description: "Maintain slight athletic bend in knees and waist.", prescription: "20 reps" },
        { title: "Low Ball Practice", description: "Hit low balls requiring you to bend, not lean back.", prescription: "15 reps" },
        { title: "Neutral Spine Focus", description: "Keep spine neutral, not arched, through swing.", prescription: "15 reps" },
      ],
      general: [
        { title: "Core Stability Work", description: "Planks and anti-rotation exercises.", prescription: "3 sets of 30 seconds" },
        { title: "Footwork First", description: "Get feet set before swinging — better posture follows.", prescription: "20 reps" },
        { title: "Video Review", description: "Record yourself and check posture at contact point.", prescription: "5 minutes review" },
      ]
    }
  ]
};

const tennisServeRecs: MotionRecommendationSet = {
  motionKey: "tennis-serve",
  motionName: "Serve",
  metrics: [
    {
      metricName: "Shoulder External Rotation", label: "Shoulder Rotation",
      tooLow: [
        { title: "Trophy Position Holds", description: "Hold trophy position (racquet behind head) for 3 seconds.", prescription: "15 reps" },
        { title: "Shoulder Stretches", description: "Sleeper stretch and doorway stretch for external rotation.", prescription: "3 sets of 30 seconds each" },
        { title: "Racquet Drop Drill", description: "Focus on letting racquet drop behind back before acceleration.", prescription: "15 reps" },
      ],
      tooHigh: [
        { title: "Abbreviated Motion", description: "Serve with shorter motion to reduce excessive rotation.", prescription: "15 reps" },
        { title: "Controlled Toss", description: "Lower toss to reduce time for excessive rotation.", prescription: "15 reps" },
        { title: "Flat Serve Focus", description: "Hit flat serves requiring more direct path to ball.", prescription: "15 reps" },
      ],
      general: [
        { title: "Toss Consistency", description: "Practice toss only — same height and location every time.", prescription: "30 tosses" },
        { title: "Knee Bend Serves", description: "Focus on leg drive to add power without arm strain.", prescription: "15 reps" },
        { title: "Target Serving", description: "Aim for specific targets in service box.", prescription: "20 serves" },
      ]
    },
    {
      metricName: "Hip Rotation", label: "Hip Drive",
      tooLow: [
        { title: "Coil-and-Uncoil", description: "Practice turning sideways (coiling) then exploding up and forward.", prescription: "15 reps" },
        { title: "Medicine Ball Overhead Throws", description: "Throw med ball overhead using hip and trunk rotation.", prescription: "3 sets of 8" },
        { title: "Pinpoint Stance Practice", description: "Use pinpoint stance to maximize hip coil.", prescription: "15 serves" },
      ],
      tooHigh: [
        { title: "Platform Stance", description: "Use platform stance for more controlled rotation.", prescription: "15 serves" },
        { title: "Toss-and-Hold", description: "Toss, hold trophy position 2 seconds, then serve. Controls tempo.", prescription: "10 serves" },
        { title: "Slow-Motion Serves", description: "Serve at 50% speed focusing on controlled rotation.", prescription: "10 serves" },
      ],
      general: [
        { title: "Serve Progressions", description: "Start from trophy position, add steps backward to full motion.", prescription: "5 reps at each stage" },
        { title: "Second Serve Practice", description: "Hit 20 second serves — builds control and spin.", prescription: "20 serves" },
        { title: "Serve and Volley", description: "Serve and follow to net. Builds forward momentum.", prescription: "10 reps" },
      ]
    },
    {
      metricName: "Knee Flexion", label: "Leg Drive",
      tooLow: [
        { title: "Deep Knee Bend Serves", description: "Exaggerate knee bend before jumping into serve.", prescription: "15 reps" },
        { title: "Jump Serves", description: "Focus on maximum jump height during serve.", prescription: "10 reps" },
        { title: "Squat-to-Serve", description: "Start in squat, explode up into serve motion.", prescription: "10 reps" },
      ],
      tooHigh: [
        { title: "Quick Serve Motion", description: "Reduce loading time — quicker motion with less knee bend.", prescription: "15 reps" },
        { title: "Flat-Foot Serves", description: "Serve without jumping to focus on arm mechanics.", prescription: "10 reps" },
        { title: "Rhythm Serves", description: "Focus on smooth rhythm rather than explosive jump.", prescription: "15 reps" },
      ],
      general: [
        { title: "Box Jumps", description: "Build explosive leg power for serve.", prescription: "3 sets of 8" },
        { title: "Calf Raises", description: "Build ankle power for push-off.", prescription: "3 sets of 15" },
        { title: "Serve Routine", description: "Develop consistent pre-serve routine.", prescription: "20 serves with routine" },
      ]
    }
  ]
};

// ============================================================
// SPORTS — GOLF
// ============================================================

const golfDriverRecs: MotionRecommendationSet = {
  motionKey: "golf-driver-swing",
  motionName: "Driver Swing",
  metrics: [
    {
      metricName: "Hip Rotation", label: "Hip Turn",
      tooLow: [
        { title: "Chair Drill", description: "Place chair against back hip, rotate until hip pushes chair away.", prescription: "20 reps" },
        { title: "Feet-Together Swings", description: "Swing with feet together to isolate rotation.", prescription: "15 swings" },
        { title: "Resistance Band Hip Turns", description: "Band around knees, practice full hip rotation against resistance.", prescription: "3 sets of 10" },
      ],
      tooHigh: [
        { title: "Stable Lower Body Drill", description: "Focus on restricting hip turn in backswing for more coil.", prescription: "15 swings" },
        { title: "Right Knee Flex Maintenance", description: "Keep trail knee flexed to limit over-rotation.", prescription: "15 swings" },
        { title: "Alignment Stick Drill", description: "Place stick across hips, check rotation doesn't exceed 45° in backswing.", prescription: "10 reps" },
      ],
      general: [
        { title: "Hip Mobility Routine", description: "Hip circles, 90/90 stretches, and pigeon pose.", prescription: "5 minutes before practice" },
        { title: "Slow-Motion Swings", description: "Full swing at 25% speed checking positions.", prescription: "10 reps" },
        { title: "Impact Bag Drill", description: "Hit impact bag focusing on hip clearing at impact.", prescription: "20 reps" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Spine Angle",
      tooLow: [
        { title: "Maintain Tilt Drill", description: "Practice maintaining spine tilt throughout swing.", prescription: "15 swings" },
        { title: "Head Cover Under Arm", description: "Keep head cover under trail arm to maintain posture.", prescription: "10 swings" },
        { title: "Mirror Setup Check", description: "Check spine angle in mirror at address and maintain through swing.", prescription: "10 reps" },
      ],
      tooHigh: [
        { title: "Posture Reset Drill", description: "After each swing, return to address position. Check spine angle.", prescription: "10 swings" },
        { title: "Wall Drill", description: "Butt against wall at address, maintain contact during backswing.", prescription: "15 reps" },
        { title: "Flat Back Swings", description: "Focus on flatter shoulder turn to reduce spine extension.", prescription: "10 swings" },
      ],
      general: [
        { title: "Address Position Practice", description: "Set up to ball 20 times. Same posture every time.", prescription: "20 reps" },
        { title: "Thoracic Mobility", description: "Open books and thoracic rotations for upper back mobility.", prescription: "2 sets of 10 each side" },
        { title: "Core Stability Work", description: "Planks and bird dogs to maintain spine angle under load.", prescription: "3 sets of 30 seconds" },
      ]
    },
    {
      metricName: "Weight Transfer", label: "Weight Shift",
      tooLow: [
        { title: "Step Drill", description: "Step toward target during downswing. Forces weight transfer.", prescription: "15 swings" },
        { title: "Pressure Board Training", description: "Practice shifting pressure to lead foot in downswing.", prescription: "20 reps" },
        { title: "Finish on Front Foot", description: "Hold finish balanced on front foot for 3 seconds.", prescription: "15 swings" },
      ],
      tooHigh: [
        { title: "Centered Pivot Drill", description: "Keep head centered over ball — no lateral sway.", prescription: "15 swings" },
        { title: "Narrow Stance Swings", description: "Narrow stance to reduce lateral movement.", prescription: "10 swings" },
        { title: "Feet-Together Swings", description: "Swing with feet together — forces centered rotation.", prescription: "10 swings" },
      ],
      general: [
        { title: "Balance Finish", description: "Hold finish for 5 seconds after every swing.", prescription: "Every swing" },
        { title: "Tempo Training", description: "Swing with 3:1 backswing-to-downswing tempo.", prescription: "20 swings" },
        { title: "One-Arm Swings", description: "Swing with lead arm only to build proper sequencing.", prescription: "10 reps" },
      ]
    }
  ]
};

const golfIronRecs: MotionRecommendationSet = { ...golfDriverRecs, motionKey: "golf-iron-shot", motionName: "Iron Shot" };

const golfPuttingRecs: MotionRecommendationSet = {
  motionKey: "golf-putting",
  motionName: "Putting",
  metrics: [
    {
      metricName: "Spine Extension", label: "Posture",
      tooLow: [
        { title: "Eyes Over Ball", description: "Set up with eyes directly over ball. Promotes proper bend.", prescription: "20 putts" },
        { title: "Alignment Stick Spine", description: "Place stick along spine, maintain angle throughout stroke.", prescription: "15 putts" },
        { title: "Mirror Setup", description: "Check posture in mirror — slight forward bend from hips.", prescription: "10 setups" },
      ],
      tooHigh: [
        { title: "Relaxed Setup", description: "Soften knees and let arms hang naturally.", prescription: "20 putts" },
        { title: "Arm Hang Check", description: "Arms should hang straight down from shoulders.", prescription: "15 putts" },
        { title: "Comfortable Bend", description: "Find natural bend where arms hang freely.", prescription: "10 setups" },
      ],
      general: [
        { title: "Gate Drill", description: "Place two tees just wider than putter head. Stroke through gate.", prescription: "30 putts" },
        { title: "Distance Control", description: "Putt to various distances without a hole. Build feel.", prescription: "20 putts" },
        { title: "Clock Drill", description: "Place balls in circle around hole at 3 feet. Make all 12.", prescription: "Until complete" },
      ]
    },
    {
      metricName: "Hip Rotation", label: "Lower Body Stability",
      tooLow: [
        { title: "Stable Base Putts", description: "Focus on zero lower body movement during stroke.", prescription: "20 putts" },
        { title: "Feet-Together Putts", description: "Putt with feet together to feel stable base.", prescription: "15 putts" },
        { title: "Knee Flex Hold", description: "Maintain consistent knee flex throughout stroke.", prescription: "20 putts" },
      ],
      tooHigh: [
        { title: "Lower Body Lock", description: "Consciously lock lower body — only shoulders move.", prescription: "20 putts" },
        { title: "Wall Drill", description: "Putt with back against wall to prevent body movement.", prescription: "15 putts" },
        { title: "Pendulum Focus", description: "Think of stroke as pendulum from shoulders only.", prescription: "20 putts" },
      ],
      general: [
        { title: "Metronome Putting", description: "Use metronome app for consistent tempo.", prescription: "20 putts" },
        { title: "One-Hand Putts", description: "Putt with dominant hand only. Builds feel.", prescription: "15 putts each hand" },
        { title: "Ladder Drill", description: "Putt to 3, 6, 9, 12 feet. Build distance control.", prescription: "3 rounds" },
      ]
    },
    {
      metricName: "Weight Transfer", label: "Balance",
      tooLow: [
        { title: "Centered Weight", description: "Keep weight 50/50 between feet throughout stroke.", prescription: "20 putts" },
        { title: "Quiet Feet", description: "No foot movement during stroke. Stable platform.", prescription: "20 putts" },
        { title: "Pressure Check", description: "Feel equal pressure in both feet at all times.", prescription: "15 putts" },
      ],
      tooHigh: [
        { title: "Stable Platform", description: "Focus on keeping weight distribution constant.", prescription: "20 putts" },
        { title: "No Sway Drill", description: "Partner places hands on hips — no lateral movement.", prescription: "10 putts" },
        { title: "Narrow Stance", description: "Narrower stance to reduce weight shift opportunity.", prescription: "15 putts" },
      ],
      general: [
        { title: "Pre-Putt Routine", description: "Same routine before every putt. Builds consistency.", prescription: "Every putt" },
        { title: "Pressure Putting", description: "Must make 5 in a row from 4 feet. Start over on miss.", prescription: "Until complete" },
        { title: "Green Reading Practice", description: "Read break before each putt. Builds course management.", prescription: "20 putts on breaking putts" },
      ]
    }
  ]
};

// ============================================================
// SPORTS — SOCCER
// ============================================================

const soccerPowerShotRecs: MotionRecommendationSet = {
  motionKey: "soccer-power-shot",
  motionName: "Power Shot",
  metrics: [
    {
      metricName: "Hip Rotation", label: "Hip Drive",
      tooLow: [
        { title: "Hip Opener Kicks", description: "Practice opening hips fully before striking ball.", prescription: "15 reps" },
        { title: "Resistance Band Kicks", description: "Band around thigh, kick against resistance.", prescription: "3 sets of 10" },
        { title: "Approach Angle Drill", description: "Approach at 45° to force hip opening.", prescription: "15 reps" },
      ],
      tooHigh: [
        { title: "Straight Approach", description: "Approach straight on to reduce excessive hip rotation.", prescription: "15 reps" },
        { title: "Plant Foot Focus", description: "Point plant foot at target to control hip rotation.", prescription: "15 reps" },
        { title: "Controlled Power", description: "Kick at 75% power focusing on accuracy over rotation.", prescription: "15 reps" },
      ],
      general: [
        { title: "Dead Ball Practice", description: "Practice striking stationary ball from various distances.", prescription: "20 reps" },
        { title: "Wall Passes", description: "One-touch passing against wall. Builds striking technique.", prescription: "3 sets of 20" },
        { title: "Target Shooting", description: "Aim for corners of goal. Builds accuracy with power.", prescription: "20 shots" },
      ]
    },
    {
      metricName: "Knee Flexion", label: "Striking Knee",
      tooLow: [
        { title: "Knee Drive Drill", description: "Practice driving knee through before extending to strike.", prescription: "15 reps" },
        { title: "Backswing Practice", description: "Exaggerate backswing to load kicking leg.", prescription: "15 reps" },
        { title: "Seated Knee Extensions", description: "Build quad power for explosive knee extension.", prescription: "3 sets of 12" },
      ],
      tooHigh: [
        { title: "Compact Strike", description: "Shorter backswing, focus on contact quality.", prescription: "15 reps" },
        { title: "Lock-and-Strike", description: "Lock ankle and knee at contact for clean strike.", prescription: "15 reps" },
        { title: "Quick Shots", description: "One-touch shots requiring quick, compact motion.", prescription: "15 reps" },
      ],
      general: [
        { title: "Instep Striking", description: "Practice laces/instep contact for power shots.", prescription: "20 reps" },
        { title: "Moving Ball Strikes", description: "Strike ball while it's rolling toward you.", prescription: "15 reps" },
        { title: "Leg Strength Work", description: "Squats, lunges, and leg press for kicking power.", prescription: "3 sets of 10 each" },
      ]
    },
    {
      metricName: "Weight Transfer", label: "Follow-Through",
      tooLow: [
        { title: "Step-Through Kicks", description: "Take a step forward after each kick. Forces follow-through.", prescription: "15 reps" },
        { title: "Running Shots", description: "Shoot while running to build forward momentum.", prescription: "10 reps" },
        { title: "Landing Forward", description: "Land on kicking foot after shot. Full follow-through.", prescription: "15 reps" },
      ],
      tooHigh: [
        { title: "Balanced Finish", description: "Hold finish on plant leg for 3 seconds.", prescription: "10 reps" },
        { title: "Controlled Approach", description: "Shorter approach to reduce forward momentum.", prescription: "10 reps" },
        { title: "Plant Foot Stability", description: "Focus on stable plant foot throughout kick.", prescription: "15 reps" },
      ],
      general: [
        { title: "Volleys", description: "Practice striking ball out of air. Builds timing.", prescription: "15 reps" },
        { title: "Penalty Practice", description: "Practice penalties — consistent approach and strike.", prescription: "10 penalties" },
        { title: "Weak Foot Practice", description: "Practice with non-dominant foot. Builds overall technique.", prescription: "15 reps" },
      ]
    }
  ]
};

const soccerPassingRecs: MotionRecommendationSet = {
  motionKey: "soccer-passing",
  motionName: "Passing",
  metrics: [
    {
      metricName: "Hip Rotation", label: "Body Position",
      tooLow: [
        { title: "Open Body Passes", description: "Practice opening body to see field while passing.", prescription: "20 reps" },
        { title: "Side-On Passing", description: "Position sideways to target for better hip rotation.", prescription: "15 reps" },
        { title: "Scanning Before Pass", description: "Look up, scan, then pass. Forces body opening.", prescription: "15 reps" },
      ],
      tooHigh: [
        { title: "Square Passes", description: "Face target directly for simple square passes.", prescription: "20 reps" },
        { title: "Inside-Foot Focus", description: "Use inside of foot with minimal rotation.", prescription: "20 reps" },
        { title: "Short Passes", description: "Practice 5-10 yard passes with controlled motion.", prescription: "30 reps" },
      ],
      general: [
        { title: "Wall Passing", description: "Pass against wall, receive, pass again. Builds rhythm.", prescription: "3 sets of 30 seconds" },
        { title: "Triangle Passing", description: "Pass in triangle with partners. Move after passing.", prescription: "5 minutes" },
        { title: "Long Passes", description: "Practice 20-30 yard passes for range.", prescription: "15 reps" },
      ]
    },
    {
      metricName: "Knee Flexion", label: "Plant Leg",
      tooLow: [
        { title: "Bent Knee Passes", description: "Maintain slight knee bend on plant leg for stability.", prescription: "20 reps" },
        { title: "Low Center of Gravity", description: "Stay low when passing for better balance.", prescription: "20 reps" },
        { title: "Athletic Stance Passes", description: "Set up in athletic stance before each pass.", prescription: "15 reps" },
      ],
      tooHigh: [
        { title: "Quick Passes", description: "One-touch passes requiring less setup time.", prescription: "20 reps" },
        { title: "Standing Tall", description: "Pass from more upright position for quick release.", prescription: "15 reps" },
        { title: "First-Time Passes", description: "Pass without controlling ball first.", prescription: "15 reps" },
      ],
      general: [
        { title: "Rondo", description: "Keep-away game. Builds quick passing under pressure.", prescription: "5 minutes" },
        { title: "Passing Accuracy", description: "Pass through cones at various distances.", prescription: "20 reps" },
        { title: "Both Feet Practice", description: "Alternate passing with left and right foot.", prescription: "15 reps each foot" },
      ]
    },
    {
      metricName: "Weight Transfer", label: "Pass Weight",
      tooLow: [
        { title: "Follow-Through Passes", description: "Extend kicking foot toward target after contact.", prescription: "20 reps" },
        { title: "Firm Passes", description: "Practice passing with more pace to partner.", prescription: "15 reps" },
        { title: "Long-Range Passes", description: "Increase distance to force more weight into pass.", prescription: "10 reps" },
      ],
      tooHigh: [
        { title: "Soft Touch Passes", description: "Practice gentle passes that arrive at partner's feet.", prescription: "20 reps" },
        { title: "Cushioned Passes", description: "Reduce follow-through for softer pass weight.", prescription: "15 reps" },
        { title: "Short Distance Focus", description: "5-yard passes requiring delicate touch.", prescription: "20 reps" },
      ],
      general: [
        { title: "Varied Distance Passing", description: "Alternate between short, medium, and long passes.", prescription: "10 reps at each distance" },
        { title: "Moving Target Passes", description: "Pass to partner who is running. Builds weight judgment.", prescription: "15 reps" },
        { title: "First Touch to Pass", description: "Control ball with first touch, pass with second.", prescription: "20 reps" },
      ]
    }
  ]
};

// ============================================================
// SPORTS — ARCHERY
// ============================================================

const archeryStanceRecs: MotionRecommendationSet = {
  motionKey: "archery-stance",
  motionName: "Stance",
  metrics: [
    {
      metricName: "Hip Rotation", label: "Body Alignment",
      tooLow: [{ title: "Open Stance Practice", description: "Practice slight open stance (front foot angled toward target).", prescription: "Hold 30 seconds, 10 reps" }, { title: "T-Position Drill", description: "Stand in T-position, arms extended, check hip alignment.", prescription: "10 reps" }, { title: "Mirror Alignment", description: "Check stance alignment in mirror from side view.", prescription: "10 setups" }],
      tooHigh: [{ title: "Square Stance", description: "Practice perfectly square stance to target.", prescription: "10 setups" }, { title: "Foot Line Drill", description: "Place tape on ground, align both feet parallel to it.", prescription: "15 reps" }, { title: "Closed Stance Practice", description: "Slightly close stance to reduce over-rotation.", prescription: "10 reps" }],
      general: [{ title: "Consistent Foot Placement", description: "Mark foot positions, same setup every time.", prescription: "20 setups" }, { title: "Balance Hold", description: "Hold stance position for 30 seconds with eyes closed.", prescription: "5 reps" }, { title: "Weight Distribution Check", description: "Feel 60/40 weight distribution (slightly forward).", prescription: "10 setups" }]
    },
    {
      metricName: "Spine Extension", label: "Posture",
      tooLow: [{ title: "Tall Stance Drill", description: "Imagine string pulling crown of head up. Stand tall.", prescription: "Hold 30 seconds, 10 reps" }, { title: "Wall Posture Check", description: "Stand against wall, check head, shoulders, hips touch.", prescription: "10 reps" }, { title: "Core Engagement", description: "Engage core to support upright posture.", prescription: "Hold 20 seconds, 10 reps" }],
      tooHigh: [{ title: "Relaxed Posture", description: "Soften shoulders and relax upper body while maintaining alignment.", prescription: "10 reps" }, { title: "Natural Stand", description: "Find natural comfortable upright position without forcing.", prescription: "10 setups" }, { title: "Breathing Relaxation", description: "Deep breaths to release tension in upper back.", prescription: "5 breaths per setup" }],
      general: [{ title: "Posture Awareness", description: "Check posture at address, at full draw, and at release.", prescription: "10 full sequences" }, { title: "Core Stability", description: "Planks and bird dogs for postural endurance.", prescription: "3 sets of 30 seconds" }, { title: "Shoulder Setting", description: "Set shoulders down and back before each shot.", prescription: "Every shot" }]
    },
    {
      metricName: "Weight Transfer", label: "Balance",
      tooLow: [{ title: "Centered Weight", description: "Feel weight evenly distributed between both feet.", prescription: "10 setups" }, { title: "Heel-Toe Rock", description: "Rock forward and back to find center balance point.", prescription: "10 reps" }, { title: "Stable Base", description: "Shoulder-width stance, feel grounded through feet.", prescription: "Hold 30 seconds, 5 reps" }],
      tooHigh: [{ title: "Quiet Feet", description: "No weight shifting during draw or release.", prescription: "10 shots" }, { title: "Balance Board Practice", description: "Stand on balance board in shooting stance.", prescription: "3 sets of 30 seconds" }, { title: "Eyes Closed Balance", description: "Hold stance with eyes closed. Build proprioception.", prescription: "5 reps of 20 seconds" }],
      general: [{ title: "Single-Leg Balance", description: "Stand on each leg in shooting posture.", prescription: "3 sets of 20 seconds each" }, { title: "Wind Resistance", description: "Practice holding stance in light wind or with partner pushing gently.", prescription: "10 reps" }, { title: "Consistent Setup Routine", description: "Same foot placement, weight check, posture check every time.", prescription: "Every shot" }]
    }
  ]
};

const archeryDrawRecs: MotionRecommendationSet = {
  motionKey: "archery-draw",
  motionName: "Draw",
  metrics: [
    {
      metricName: "Shoulder External Rotation", label: "Back Tension",
      tooLow: [{ title: "Resistance Band Draws", description: "Practice draw motion with resistance band, focus on squeezing shoulder blades.", prescription: "3 sets of 12" }, { title: "Wall Slide Draws", description: "Face wall, slide hands up while squeezing back muscles.", prescription: "3 sets of 10" }, { title: "Scapular Retraction", description: "Squeeze shoulder blades together at full draw position.", prescription: "Hold 5 seconds, 10 reps" }],
      tooHigh: [{ title: "Controlled Draw", description: "Draw slowly, stop at anchor point without over-pulling.", prescription: "10 reps" }, { title: "Light Bow Practice", description: "Use lighter draw weight to practice proper form.", prescription: "20 shots" }, { title: "Mirror Draw Check", description: "Watch draw in mirror to check for over-rotation.", prescription: "10 reps" }],
      general: [{ title: "Back Strengthening", description: "Rows, face pulls, and reverse flies for draw muscles.", prescription: "3 sets of 12 each" }, { title: "Anchor Point Consistency", description: "Touch same spot on face every draw.", prescription: "20 draws" }, { title: "Draw Length Check", description: "Verify consistent draw length with measuring tool.", prescription: "5 checks per session" }]
    },
    {
      metricName: "Elbow Flexion", label: "Draw Arm",
      tooLow: [{ title: "Full Draw Practice", description: "Focus on achieving full draw length every shot.", prescription: "15 shots" }, { title: "Elbow High Cue", description: "Keep draw elbow high and behind the arrow line.", prescription: "15 shots" }, { title: "String Walking", description: "Practice drawing to full anchor with consistent elbow position.", prescription: "10 reps" }],
      tooHigh: [{ title: "Consistent Anchor", description: "Draw to anchor point and stop — no over-drawing.", prescription: "15 shots" }, { title: "Clicker Training", description: "Use clicker to ensure consistent draw length.", prescription: "20 shots" }, { title: "Relaxed Draw", description: "Draw with relaxed hand, let back muscles do the work.", prescription: "10 shots" }],
      general: [{ title: "Blank Bale Practice", description: "Shoot at close range blank target focusing only on form.", prescription: "30 shots" }, { title: "SPT (Specific Physical Training)", description: "Hold at full draw for increasing durations.", prescription: "Hold 5, 10, 15, 20 seconds" }, { title: "Reversals", description: "Draw to full, let down slowly. Builds control.", prescription: "10 reps" }]
    },
    {
      metricName: "Spine Extension", label: "Trunk Stability",
      tooLow: [{ title: "Upright Draw", description: "Maintain tall posture throughout draw — no collapsing.", prescription: "15 shots" }, { title: "Core Bracing", description: "Engage core before and during draw to support posture.", prescription: "Every shot" }, { title: "Chin Level", description: "Keep chin level throughout draw. Prevents forward lean.", prescription: "15 shots" }],
      tooHigh: [{ title: "Neutral Spine", description: "Avoid leaning back during draw. Stay neutral.", prescription: "15 shots" }, { title: "Hip Alignment", description: "Keep hips under shoulders — no backward lean.", prescription: "10 shots" }, { title: "Partner Check", description: "Have partner check your posture from side view.", prescription: "10 shots" }],
      general: [{ title: "Plank Holds", description: "Build core endurance for maintaining posture under load.", prescription: "3 sets of 45 seconds" }, { title: "Anti-Extension Work", description: "Dead bugs and hollow holds to resist spine extension.", prescription: "3 sets of 10" }, { title: "Breathing Pattern", description: "Inhale before draw, exhale at anchor, release on respiratory pause.", prescription: "Every shot" }]
    }
  ]
};

const archeryReleaseRecs: MotionRecommendationSet = {
  motionKey: "archery-release",
  motionName: "Release",
  metrics: [
    {
      metricName: "Shoulder External Rotation", label: "Back Tension Release",
      tooLow: [{ title: "Expansion Drill", description: "At full draw, focus on continuing to expand through back muscles.", prescription: "10 shots" }, { title: "Surprise Release", description: "Let release happen as result of back tension, not finger opening.", prescription: "15 shots" }, { title: "Holding Exercises", description: "Hold at full draw 3-5 extra seconds before releasing.", prescription: "10 shots" }],
      tooHigh: [{ title: "Relaxed Release", description: "Focus on relaxing fingers rather than pulling through.", prescription: "15 shots" }, { title: "Smooth Follow-Through", description: "Let draw hand move naturally back after release.", prescription: "15 shots" }, { title: "Tempo Control", description: "Consistent timing from anchor to release.", prescription: "10 shots" }],
      general: [{ title: "Blank Bale Close Range", description: "Shoot at 3 yards focusing only on release execution.", prescription: "30 shots" }, { title: "Eyes Closed Shots", description: "Close eyes at full draw, release. Builds feel.", prescription: "10 shots (close range only)" }, { title: "Follow-Through Hold", description: "Hold follow-through position for 3 seconds after release.", prescription: "Every shot" }]
    },
    {
      metricName: "Elbow Flexion", label: "Follow-Through",
      tooLow: [{ title: "Elbow Back Cue", description: "After release, draw elbow should move straight back.", prescription: "15 shots" }, { title: "Wall Touch Drill", description: "After release, draw hand should touch back of shoulder.", prescription: "10 shots" }, { title: "Active Follow-Through", description: "Consciously pull elbow back after release.", prescription: "15 shots" }],
      tooHigh: [{ title: "Relaxed Follow-Through", description: "Let hand fall naturally after release — don't force position.", prescription: "15 shots" }, { title: "Natural Recoil", description: "Allow natural hand movement after string leaves fingers.", prescription: "10 shots" }, { title: "Consistent End Position", description: "Same hand position after every shot.", prescription: "15 shots" }],
      general: [{ title: "Release Trainer", description: "Use release trainer device to practice clean releases.", prescription: "50 releases" }, { title: "String Picture", description: "Focus on consistent string alignment before release.", prescription: "15 shots" }, { title: "Shot Routine", description: "Same mental and physical routine for every shot.", prescription: "Every shot" }]
    },
    {
      metricName: "Spine Extension", label: "Body Stability",
      tooLow: [{ title: "Stable Platform", description: "No body movement during or after release.", prescription: "15 shots" }, { title: "Core Lock", description: "Brace core through release to prevent collapse.", prescription: "Every shot" }, { title: "Head Still", description: "Keep head perfectly still through release and follow-through.", prescription: "15 shots" }],
      tooHigh: [{ title: "Relaxed Upper Body", description: "Release tension in shoulders while maintaining posture.", prescription: "10 shots" }, { title: "Breathing Release", description: "Exhale gently during release to prevent body tension.", prescription: "Every shot" }, { title: "Natural Posture", description: "Don't force posture — find comfortable upright position.", prescription: "10 setups" }],
      general: [{ title: "Post-Shot Routine", description: "Evaluate each shot: did body stay still? Was release clean?", prescription: "Every shot" }, { title: "Scoring Rounds", description: "Shoot scored rounds to practice under pressure.", prescription: "3 ends of 6 arrows" }, { title: "Mental Rehearsal", description: "Visualize perfect release before each shot.", prescription: "Every shot" }]
    }
  ]
};

// ============================================================
// SPORTS — TRACK & FIELD
// ============================================================

const trackSprintStartRecs: MotionRecommendationSet = {
  motionKey: "track-field-sprint-start",
  motionName: "Sprint Start",
  metrics: [
    { metricName: "Hip Rotation", label: "Drive Phase", tooLow: [{ title: "Block Starts", description: "Practice explosive starts from blocks focusing on hip extension.", prescription: "10 reps" }, { title: "Wall Drives", description: "Lean against wall, drive knees up explosively.", prescription: "3 sets of 10 each leg" }, { title: "Sled Pushes", description: "Push weighted sled to build drive phase power.", prescription: "5 reps of 20 yards" }], tooHigh: [{ title: "Controlled Acceleration", description: "Focus on gradual rise from blocks rather than popping up.", prescription: "10 reps" }, { title: "Low Start Drill", description: "Stay low for first 10 meters. Count steps before rising.", prescription: "10 reps" }, { title: "Patience Drill", description: "Hold low position longer before transitioning to upright.", prescription: "10 reps" }], general: [{ title: "Reaction Drills", description: "Practice reacting to various start signals.", prescription: "15 reps" }, { title: "First 3 Steps", description: "Focus only on first 3 steps from blocks. Perfect them.", prescription: "10 reps" }, { title: "Video Analysis", description: "Record starts from side view. Check body angle.", prescription: "5 recorded starts" }] },
    { metricName: "Knee Flexion", label: "Knee Drive", tooLow: [{ title: "High Knee Drives", description: "Exaggerate knee lift in first 5 steps.", prescription: "10 reps" }, { title: "A-Skip Drill", description: "Marching A-skips focusing on knee height.", prescription: "3 sets of 20 meters" }, { title: "Hurdle Step-Overs", description: "Step over low hurdles to build knee lift.", prescription: "3 sets of 10" }], tooHigh: [{ title: "Quick Turnover", description: "Focus on fast foot contact rather than high knees.", prescription: "10 reps" }, { title: "Short Steps", description: "Take shorter, quicker steps in drive phase.", prescription: "10 reps" }, { title: "Ground Contact Drill", description: "Focus on pushing ground away rather than lifting knees.", prescription: "10 reps" }], general: [{ title: "Acceleration Ladder", description: "Gradually increase stride length over 30 meters.", prescription: "5 reps" }, { title: "Hill Sprints", description: "Sprint uphill to build drive phase mechanics.", prescription: "8 reps of 30 meters" }, { title: "Plyometric Bounds", description: "Bounding for distance to build explosive power.", prescription: "3 sets of 6 bounds" }] },
    { metricName: "Spine Extension", label: "Body Angle", tooLow: [{ title: "45-Degree Hold", description: "Hold 45° body angle from blocks for 3 seconds.", prescription: "10 reps" }, { title: "Wall Lean Drives", description: "Lean at 45° against wall, drive knees.", prescription: "3 sets of 10" }, { title: "Falling Starts", description: "Fall forward from standing, catch yourself into sprint.", prescription: "10 reps" }], tooHigh: [{ title: "Stay Low Cue", description: "Count to 5 before allowing body to rise.", prescription: "10 reps" }, { title: "Ceiling Drill", description: "Imagine low ceiling — stay under it for first 10 meters.", prescription: "10 reps" }, { title: "Partner Push", description: "Partner provides light resistance to keep you low.", prescription: "10 reps" }], general: [{ title: "Transition Zone Work", description: "Practice smooth transition from drive to upright running.", prescription: "10 reps over 30 meters" }, { title: "Block Settings", description: "Experiment with block spacing for optimal angles.", prescription: "10 starts with varied settings" }, { title: "Arm Action", description: "Practice powerful arm drive matching leg action.", prescription: "10 reps" }] }
  ]
};

const trackLongJumpRecs: MotionRecommendationSet = {
  motionKey: "track-field-long-jump", motionName: "Long Jump",
  metrics: [
    { metricName: "Hip Rotation", label: "Takeoff", tooLow: [{ title: "Penultimate Step Drill", description: "Practice lowering on second-to-last step for explosive takeoff.", prescription: "10 reps" }, { title: "Bounding", description: "Alternating bounds for distance. Builds takeoff power.", prescription: "3 sets of 6" }, { title: "Box Jumps (Single Leg)", description: "Jump onto box from one foot.", prescription: "3 sets of 6 each leg" }], tooHigh: [{ title: "Controlled Approach", description: "Slow approach to focus on consistent takeoff.", prescription: "10 reps" }, { title: "Short Approach Jumps", description: "6-step approach to focus on technique over speed.", prescription: "10 reps" }, { title: "Pop-Up Drill", description: "Focus on vertical lift rather than forward rotation.", prescription: "10 reps" }], general: [{ title: "Full Approach Runs", description: "Practice full approach without jumping. Build consistency.", prescription: "10 reps" }, { title: "Takeoff Foot Placement", description: "Hit board consistently with correct foot.", prescription: "15 reps" }, { title: "Flight Phase Practice", description: "Practice hang or hitch-kick technique in air.", prescription: "10 jumps" }] },
    { metricName: "Knee Flexion", label: "Landing", tooLow: [{ title: "Seated Landing Drill", description: "Practice reaching legs forward for landing.", prescription: "10 reps into sand" }, { title: "Hurdle Seat Drill", description: "Sit on ground with legs extended, practice reaching forward.", prescription: "10 reps" }, { title: "Standing Long Jumps", description: "Practice landing position from standing jumps.", prescription: "10 reps" }], tooHigh: [{ title: "Extended Landing", description: "Focus on keeping legs extended longer before landing.", prescription: "10 reps" }, { title: "Reach Drill", description: "Try to reach feet as far forward as possible at landing.", prescription: "10 reps" }, { title: "Video Landing Check", description: "Record and check landing position.", prescription: "5 recorded jumps" }], general: [{ title: "Sand Pit Work", description: "Practice full jumps into sand pit.", prescription: "8 jumps" }, { title: "Approach Consistency", description: "Same number of steps, same marks every time.", prescription: "10 approach runs" }, { title: "Plyometric Training", description: "Depth jumps, box jumps, and bounds for power.", prescription: "3 sets of 6 each" }] },
    { metricName: "Spine Extension", label: "Flight Posture", tooLow: [{ title: "Chest Up at Takeoff", description: "Drive chest up and forward at takeoff.", prescription: "10 reps" }, { title: "Arm Drive", description: "Drive arms up at takeoff to promote upright flight.", prescription: "10 reps" }, { title: "Head Position", description: "Keep head up and eyes forward during flight.", prescription: "10 reps" }], tooHigh: [{ title: "Neutral Flight", description: "Maintain neutral spine during flight — no arching.", prescription: "10 reps" }, { title: "Core Engagement", description: "Brace core during flight to prevent over-extension.", prescription: "10 reps" }, { title: "Tuck Practice", description: "Practice bringing knees to chest in flight.", prescription: "10 reps" }], general: [{ title: "Hang Technique", description: "Practice hang position in flight phase.", prescription: "10 jumps" }, { title: "Hitch-Kick Practice", description: "Practice cycling legs in air.", prescription: "10 jumps" }, { title: "Competition Simulation", description: "Full approach, full effort jumps with measurement.", prescription: "6 jumps" }] }
  ]
};

// Simplified entries for remaining track & field events
const trackHighJumpRecs: MotionRecommendationSet = { ...trackLongJumpRecs, motionKey: "track-field-high-jump", motionName: "High Jump" };
const trackShotPutRecs: MotionRecommendationSet = { ...footballThrowRecs, motionKey: "track-field-shot-put", motionName: "Shot Put" };
const trackDiscusRecs: MotionRecommendationSet = { ...golfDriverRecs, motionKey: "track-field-discus", motionName: "Discus" };
const trackJavelinRecs: MotionRecommendationSet = { ...footballThrowRecs, motionKey: "track-field-javelin", motionName: "Javelin" };
const trackPoleVaultRecs: MotionRecommendationSet = { ...trackLongJumpRecs, motionKey: "track-field-pole-vault", motionName: "Pole Vault" };
const trackHurdlesRecs: MotionRecommendationSet = { ...trackSprintStartRecs, motionKey: "track-field-hurdles", motionName: "Hurdles" };

// ============================================================
// WEIGHTLIFTING — POWERLIFTING
// ============================================================

const powerliftingSquatRecs: MotionRecommendationSet = {
  motionKey: "powerlifting-back-squat",
  motionName: "Back Squat",
  metrics: [
    {
      metricName: "Knee Flexion", label: "Depth",
      tooLow: [
        { title: "Box Squats to Depth", description: "Squat to box set at parallel. Touch and stand.", prescription: "3 sets of 8" },
        { title: "Goblet Squat Holds", description: "Hold bottom of goblet squat for 10 seconds. Build comfort at depth.", prescription: "3 sets of 10-second holds" },
        { title: "Ankle Mobility Work", description: "Banded ankle distractions and calf stretches to allow deeper squat.", prescription: "2 minutes each ankle" },
      ],
      tooHigh: [
        { title: "Pause Squats", description: "Pause at parallel for 2 seconds. Build control at depth.", prescription: "3 sets of 5" },
        { title: "Tempo Squats", description: "3-second descent, pause at bottom, stand. Builds control.", prescription: "3 sets of 5" },
        { title: "Pin Squats", description: "Set pins at parallel, squat to pins and stand.", prescription: "3 sets of 5" },
      ],
      general: [
        { title: "Hip Mobility Series", description: "90/90, pigeon pose, and deep squat holds.", prescription: "5 minutes" },
        { title: "Warm-Up Sets", description: "Progressive warm-up: bar, 40%, 60%, 80% before working sets.", prescription: "4 warm-up sets" },
        { title: "Video Side View", description: "Record from side to check depth on every set.", prescription: "Every working set" },
      ]
    },
    {
      metricName: "Hip Rotation", label: "Hip Hinge",
      tooLow: [
        { title: "Hip Hinge Pattern", description: "Practice hip hinge with dowel on back (head, mid-back, tailbone contact).", prescription: "3 sets of 10" },
        { title: "Good Mornings", description: "Light good mornings to build hip hinge awareness.", prescription: "3 sets of 10" },
        { title: "Sit-Back Drill", description: "Practice sitting back into squat rather than dropping straight down.", prescription: "10 reps" },
      ],
      tooHigh: [
        { title: "Upright Squat Focus", description: "Focus on staying more upright — less forward lean.", prescription: "3 sets of 8" },
        { title: "Front Squat Assistance", description: "Front squats force more upright torso position.", prescription: "3 sets of 5" },
        { title: "High Bar Position", description: "Move bar higher on traps to promote upright posture.", prescription: "3 sets of 5" },
      ],
      general: [
        { title: "Breathing and Bracing", description: "Big breath, brace core hard before each rep.", prescription: "Every rep" },
        { title: "Belt Squats", description: "Belt squat variation to build leg strength without back load.", prescription: "3 sets of 10" },
        { title: "Competition Pause Squats", description: "Practice with competition-style pause at bottom.", prescription: "3 sets of 3" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Back Position",
      tooLow: [
        { title: "Upper Back Tightness", description: "Squeeze shoulder blades together, pull bar into traps.", prescription: "Every set" },
        { title: "Chest-Up Cue", description: "Drive chest up throughout squat. Prevents rounding.", prescription: "Every rep" },
        { title: "Front Squat Carry-Over", description: "Front squats build upper back strength for back squat.", prescription: "3 sets of 5" },
      ],
      tooHigh: [
        { title: "Neutral Spine Focus", description: "Avoid excessive arch — maintain neutral spine.", prescription: "3 sets of 8" },
        { title: "Core Bracing", description: "Brace core 360° to prevent over-extension.", prescription: "Every rep" },
        { title: "Rib Tuck Cue", description: "Tuck ribs down slightly to prevent excessive arch.", prescription: "Every rep" },
      ],
      general: [
        { title: "Back Extensions", description: "Weighted back extensions to build spinal erector strength.", prescription: "3 sets of 12" },
        { title: "Rows", description: "Barbell or dumbbell rows for upper back strength.", prescription: "3 sets of 10" },
        { title: "Plank Holds", description: "Build core endurance to maintain position under load.", prescription: "3 sets of 45 seconds" },
      ]
    }
  ]
};

const powerliftingFrontSquatRecs: MotionRecommendationSet = { ...powerliftingSquatRecs, motionKey: "powerlifting-front-squat", motionName: "Front Squat" };

const powerliftingDeadliftRecs: MotionRecommendationSet = {
  motionKey: "powerlifting-deadlift",
  motionName: "Deadlift",
  metrics: [
    {
      metricName: "Hip Rotation", label: "Hip Hinge",
      tooLow: [
        { title: "Romanian Deadlifts", description: "Practice hip hinge pattern with lighter weight.", prescription: "3 sets of 10" },
        { title: "Pull-Through", description: "Cable pull-through to pattern hip hinge.", prescription: "3 sets of 12" },
        { title: "Kettlebell Swings", description: "Build explosive hip extension pattern.", prescription: "3 sets of 15" },
      ],
      tooHigh: [
        { title: "Deficit Deadlifts", description: "Stand on plate to increase range of motion.", prescription: "3 sets of 5" },
        { title: "Slow Eccentrics", description: "3-second lowering to build control.", prescription: "3 sets of 5" },
        { title: "Pause at Knee", description: "Pause when bar reaches knees. Build position awareness.", prescription: "3 sets of 3" },
      ],
      general: [
        { title: "Hip Mobility", description: "Hip circles, 90/90 stretches before pulling.", prescription: "5 minutes" },
        { title: "Glute Activation", description: "Glute bridges and clamshells before deadlifting.", prescription: "2 sets of 15 each" },
        { title: "Sumo vs Conventional", description: "Try both stances to find strongest position.", prescription: "3 sets of 3 each" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Back Position",
      tooLow: [
        { title: "Lat Engagement", description: "Pull slack out of bar by engaging lats before lifting.", prescription: "Every rep" },
        { title: "Chest-Up Cue", description: "Drive chest up to prevent upper back rounding.", prescription: "Every rep" },
        { title: "Deficit Pulls", description: "Pull from deficit to build strength in weakest position.", prescription: "3 sets of 5" },
      ],
      tooHigh: [
        { title: "Neutral Spine", description: "Avoid hyperextending at lockout. Stand tall, don't lean back.", prescription: "Every rep" },
        { title: "Hip Lock Cue", description: "Lock hips at top without over-extending spine.", prescription: "Every rep" },
        { title: "Glute Squeeze Finish", description: "Squeeze glutes at top rather than arching back.", prescription: "Every rep" },
      ],
      general: [
        { title: "Back Strengthening", description: "Rows, pull-ups, and back extensions.", prescription: "3 sets of 10 each" },
        { title: "Core Work", description: "Planks, dead bugs, and Pallof press.", prescription: "3 sets of 30 seconds each" },
        { title: "Progressive Overload", description: "Add weight gradually. Don't sacrifice form for load.", prescription: "5lb increases" },
      ]
    },
    {
      metricName: "Knee Flexion", label: "Knee Position",
      tooLow: [
        { title: "Knee Tracking Drill", description: "Push knees out over toes during setup.", prescription: "10 reps" },
        { title: "Wider Stance", description: "Try slightly wider stance to allow more knee bend.", prescription: "3 sets of 5" },
        { title: "Block Pulls", description: "Pull from blocks to practice knee position at different heights.", prescription: "3 sets of 5" },
      ],
      tooHigh: [
        { title: "Stiff-Leg Deadlifts", description: "Practice with less knee bend to find optimal position.", prescription: "3 sets of 8" },
        { title: "Hip-First Cue", description: "Initiate lift with hips, not knees.", prescription: "Every rep" },
        { title: "Bar Path Check", description: "Bar should travel straight up — knees shouldn't push it forward.", prescription: "Video check" },
      ],
      general: [
        { title: "Setup Routine", description: "Same setup every rep: feet, grip, breath, brace, pull.", prescription: "Every rep" },
        { title: "Warm-Up Progression", description: "Bar, 135, 225, working weight. Build to heavy sets.", prescription: "4-5 warm-up sets" },
        { title: "Accessory Work", description: "Leg press, leg curls, and back extensions.", prescription: "3 sets of 10 each" },
      ]
    }
  ]
};

const powerliftingSumoDeadliftRecs: MotionRecommendationSet = { ...powerliftingDeadliftRecs, motionKey: "powerlifting-sumo-deadlift", motionName: "Sumo Deadlift" };

const powerliftingBenchRecs: MotionRecommendationSet = {
  motionKey: "powerlifting-bench-press",
  motionName: "Bench Press",
  metrics: [
    {
      metricName: "Elbow Flexion", label: "Elbow Angle",
      tooLow: [
        { title: "Full Range Reps", description: "Touch chest on every rep. Full range of motion.", prescription: "3 sets of 8" },
        { title: "Pause Reps", description: "Pause on chest for 2 seconds before pressing.", prescription: "3 sets of 5" },
        { title: "Spoto Press", description: "Pause 1 inch above chest. Builds bottom-end strength.", prescription: "3 sets of 5" },
      ],
      tooHigh: [
        { title: "Board Press", description: "Press from boards to limit range and build lockout.", prescription: "3 sets of 5" },
        { title: "Floor Press", description: "Press from floor to limit elbow travel.", prescription: "3 sets of 8" },
        { title: "Pin Press", description: "Press from pins at sticking point.", prescription: "3 sets of 5" },
      ],
      general: [
        { title: "Shoulder Warm-Up", description: "Band pull-aparts, face pulls, and arm circles.", prescription: "2 sets of 15 each" },
        { title: "Grip Width Check", description: "Experiment with grip width for optimal elbow angle.", prescription: "3 sets at different widths" },
        { title: "Arch and Leg Drive", description: "Set up with proper arch and leg drive for stability.", prescription: "Every set" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Back Arch",
      tooLow: [
        { title: "Arch Practice", description: "Practice setting up with thoracic arch on bench.", prescription: "10 setups" },
        { title: "Foam Roller Extensions", description: "Improve thoracic extension for better arch.", prescription: "2 sets of 10" },
        { title: "Shoulder Blade Retraction", description: "Squeeze shoulder blades together and down before unracking.", prescription: "Every set" },
      ],
      tooHigh: [
        { title: "Controlled Arch", description: "Maintain arch without excessive lumbar extension.", prescription: "Every set" },
        { title: "Feet Flat", description: "Keep feet flat on floor to limit excessive arch.", prescription: "3 sets of 8" },
        { title: "Core Engagement", description: "Brace core to prevent over-arching.", prescription: "Every rep" },
      ],
      general: [
        { title: "Setup Routine", description: "Same setup every time: feet, arch, grip, unrack.", prescription: "Every set" },
        { title: "Dumbbell Bench", description: "Dumbbells for greater range and stability work.", prescription: "3 sets of 10" },
        { title: "Tricep Work", description: "Close-grip bench, dips, and skull crushers.", prescription: "3 sets of 10 each" },
      ]
    },
    {
      metricName: "Weight Transfer", label: "Leg Drive",
      tooLow: [
        { title: "Leg Drive Practice", description: "Push feet into floor during press. Feel legs engage.", prescription: "Every rep" },
        { title: "Heels-Down Press", description: "Drive heels into floor for maximum leg drive.", prescription: "3 sets of 5" },
        { title: "Feet Position", description: "Experiment with foot position for best leg drive.", prescription: "3 sets at different positions" },
      ],
      tooHigh: [
        { title: "Stable Base", description: "Keep hips on bench — no excessive drive lifting hips.", prescription: "Every rep" },
        { title: "Controlled Press", description: "Focus on upper body pressing rather than leg push.", prescription: "3 sets of 8" },
        { title: "Feet-Up Bench", description: "Bench with feet up to isolate upper body.", prescription: "3 sets of 8 (lighter weight)" },
      ],
      general: [
        { title: "Competition Pause", description: "Practice with competition-style pause on chest.", prescription: "3 sets of 3" },
        { title: "Tempo Bench", description: "3-second descent, pause, press. Builds control.", prescription: "3 sets of 5" },
        { title: "Accessory Pressing", description: "Incline, overhead, and close-grip variations.", prescription: "3 sets of 8 each" },
      ]
    }
  ]
};

const powerliftingInclineBenchRecs: MotionRecommendationSet = { ...powerliftingBenchRecs, motionKey: "powerlifting-incline-bench", motionName: "Incline Bench Press" };
const powerliftingOverheadPressRecs: MotionRecommendationSet = { ...powerliftingBenchRecs, motionKey: "powerlifting-overhead-press", motionName: "Overhead Press" };

// ============================================================
// WEIGHTLIFTING — OLYMPIC LIFTING
// ============================================================

const olympicCleanJerkRecs: MotionRecommendationSet = {
  motionKey: "olympic-lifting-clean-jerk",
  motionName: "Clean & Jerk",
  metrics: [
    {
      metricName: "Hip Rotation", label: "Hip Extension",
      tooLow: [
        { title: "Hang Cleans", description: "Practice explosive hip extension from hang position.", prescription: "5 sets of 3" },
        { title: "Hip Pop Drill", description: "Bar at hip, pop hips forward explosively.", prescription: "3 sets of 5" },
        { title: "Kettlebell Swings", description: "Build hip extension power and timing.", prescription: "3 sets of 10" },
      ],
      tooHigh: [
        { title: "Segment Pulls", description: "Pull to knee, pause, then extend. Builds control.", prescription: "3 sets of 3" },
        { title: "Slow Pulls", description: "First pull at half speed to maintain position.", prescription: "3 sets of 3" },
        { title: "Muscle Cleans", description: "Clean without jumping — pure arm pull. Builds timing.", prescription: "3 sets of 5" },
      ],
      general: [
        { title: "Clean Pulls", description: "Heavy clean pulls to build pulling strength.", prescription: "3 sets of 3 at 100-110%" },
        { title: "Front Squat", description: "Build receiving position strength.", prescription: "3 sets of 3" },
        { title: "Jerk Drives", description: "Practice dip-and-drive without splitting.", prescription: "3 sets of 3" },
      ]
    },
    {
      metricName: "Knee Flexion", label: "Catch Position",
      tooLow: [
        { title: "Front Squat Holds", description: "Hold bottom of front squat for 5 seconds.", prescription: "3 sets of 5-second holds" },
        { title: "Tall Cleans", description: "Clean from standing tall — forces fast drop under bar.", prescription: "3 sets of 3" },
        { title: "Pause Front Squats", description: "Pause at bottom to build comfort in deep position.", prescription: "3 sets of 3" },
      ],
      tooHigh: [
        { title: "Power Cleans", description: "Catch in power position (quarter squat).", prescription: "3 sets of 3" },
        { title: "Hang Power Cleans", description: "Catch high to build confidence.", prescription: "3 sets of 3" },
        { title: "Block Cleans", description: "Clean from blocks to practice catch at various heights.", prescription: "3 sets of 3" },
      ],
      general: [
        { title: "Mobility Work", description: "Ankle, hip, and thoracic mobility for deep catch.", prescription: "10 minutes" },
        { title: "Complexes", description: "Clean pull + hang clean + front squat.", prescription: "3 sets" },
        { title: "Jerk Recovery", description: "Practice split jerk and recovery to standing.", prescription: "3 sets of 3" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Back Position",
      tooLow: [
        { title: "Lat Engagement", description: "Keep lats tight throughout pull to maintain back position.", prescription: "Every rep" },
        { title: "Clean Deadlifts", description: "Practice maintaining back angle during first pull.", prescription: "3 sets of 5"
 },
        { title: "Snatch Grip Deadlifts", description: "Wide grip deadlifts to build upper back strength.", prescription: "3 sets of 5" },
      ],
      tooHigh: [
        { title: "Controlled First Pull", description: "Slow first pull maintaining neutral spine.", prescription: "3 sets of 3" },
        { title: "Segment Pulls", description: "Pause at knee to check back position.", prescription: "3 sets of 3" },
        { title: "Core Bracing", description: "Big breath and brace before every rep.", prescription: "Every rep" },
      ],
      general: [
        { title: "Back Extensions", description: "Weighted back extensions for spinal erector strength.", prescription: "3 sets of 12" },
        { title: "Good Mornings", description: "Light good mornings for back position awareness.", prescription: "3 sets of 10" },
        { title: "Plank Holds", description: "Build core endurance for maintaining position.", prescription: "3 sets of 45 seconds" },
      ]
    }
  ]
};

const olympicSnatchRecs: MotionRecommendationSet = { ...olympicCleanJerkRecs, motionKey: "olympic-lifting-snatch", motionName: "Snatch" };
const olympicHangCleanRecs: MotionRecommendationSet = { ...olympicCleanJerkRecs, motionKey: "olympic-lifting-hang-clean", motionName: "Hang Clean" };
const olympicPowerCleanRecs: MotionRecommendationSet = { ...olympicCleanJerkRecs, motionKey: "olympic-lifting-power-clean", motionName: "Power Clean" };

// ============================================================
// WEIGHTLIFTING — KETTLEBELL
// ============================================================

const kettlebellSwingRecs: MotionRecommendationSet = {
  motionKey: "kettlebell-swing",
  motionName: "Kettlebell Swing",
  metrics: [
    {
      metricName: "Hip Rotation", label: "Hip Snap",
      tooLow: [
        { title: "Hike Pass Drill", description: "Practice the hike-back position with explosive hip snap forward.", prescription: "3 sets of 10" },
        { title: "Band-Assisted Hip Snaps", description: "Band around hips pulling backward — snap against resistance.", prescription: "3 sets of 10" },
        { title: "Dead-Stop Swings", description: "Let bell stop between reps. Rebuild hip snap each time.", prescription: "3 sets of 8" },
      ],
      tooHigh: [
        { title: "Controlled Swings", description: "Focus on crisp hip snap without over-extending.", prescription: "3 sets of 10" },
        { title: "Plank at Top", description: "Finish each swing in standing plank — don't lean back.", prescription: "3 sets of 10" },
        { title: "Glute Squeeze Finish", description: "Squeeze glutes hard at top without hyperextending.", prescription: "3 sets of 10" },
      ],
      general: [
        { title: "Deadlift Pattern", description: "Practice kettlebell deadlift to reinforce hip hinge.", prescription: "3 sets of 10" },
        { title: "Single-Arm Swings", description: "Build unilateral hip power and anti-rotation.", prescription: "3 sets of 8 each arm" },
        { title: "Swing Intervals", description: "30 seconds on, 30 seconds off. Build conditioning.", prescription: "10 rounds" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Spine Neutral",
      tooLow: [
        { title: "Dowel Spine Check", description: "Place dowel on back, maintain contact at head, mid-back, tailbone.", prescription: "10 reps" },
        { title: "Chest-Up Cue", description: "Keep chest proud during backswing — no rounding.", prescription: "3 sets of 10" },
        { title: "Lat Engagement", description: "Pack lats before each swing to protect spine.", prescription: "Every rep" },
      ],
      tooHigh: [
        { title: "Anti-Extension Focus", description: "Brace core to prevent hyperextension at top.", prescription: "3 sets of 10" },
        { title: "Eyes Forward", description: "Keep gaze forward, not up. Prevents neck/back extension.", prescription: "3 sets of 10" },
        { title: "Rib Tuck", description: "Tuck ribs down at top of swing. Maintain neutral.", prescription: "3 sets of 10" },
      ],
      general: [
        { title: "Core Strengthening", description: "Planks, dead bugs, and hollow holds.", prescription: "3 sets of 30 seconds each" },
        { title: "Hip Hinge Pattern", description: "Practice hip hinge without weight. Perfect the pattern.", prescription: "20 reps" },
        { title: "Breathing Pattern", description: "Exhale sharply at top (hip snap), inhale on backswing.", prescription: "Every rep" },
      ]
    },
    {
      metricName: "Knee Flexion", label: "Knee Bend",
      tooLow: [
        { title: "Hinge Not Squat Cue", description: "Push hips back rather than bending knees. Slight knee bend only.", prescription: "3 sets of 10" },
        { title: "Wall Touch Drill", description: "Stand facing away from wall, push hips back to touch wall.", prescription: "10 reps" },
        { title: "Towel Drill", description: "Place towel between thighs and torso — hinge to squeeze it.", prescription: "10 reps" },
      ],
      tooHigh: [
        { title: "Squat-Swing Correction", description: "If squatting the swing, focus on hips going BACK not DOWN.", prescription: "3 sets of 10" },
        { title: "High Hike", description: "Keep bell higher in backswing — closer to groin, not knees.", prescription: "3 sets of 10" },
        { title: "Timing Drill", description: "Knees should only bend slightly AFTER hips hinge back.", prescription: "10 slow reps" },
      ],
      general: [
        { title: "Romanian Deadlifts", description: "Build hip hinge pattern with minimal knee bend.", prescription: "3 sets of 10" },
        { title: "Glute Bridges", description: "Build glute activation for hip extension.", prescription: "3 sets of 15" },
        { title: "Hamstring Flexibility", description: "Stretch hamstrings to allow proper hip hinge depth.", prescription: "3 sets of 30-second holds" },
      ]
    }
  ]
};

const kettlebellSnatchRecs: MotionRecommendationSet = {
  motionKey: "kettlebell-snatch",
  motionName: "Kettlebell Snatch",
  metrics: [
    {
      metricName: "Hip Rotation", label: "Hip Drive",
      tooLow: [
        { title: "High Pull Drill", description: "Practice explosive hip drive pulling bell to shoulder height.", prescription: "3 sets of 8 each arm" },
        { title: "Swing to Snatch", description: "Build from swing — add the punch-through at top.", prescription: "3 sets of 5 each arm" },
        { title: "Dead-Stop Snatches", description: "Start from dead stop to rebuild hip drive each rep.", prescription: "3 sets of 5 each arm" },
      ],
      tooHigh: [
        { title: "Controlled Snatches", description: "Focus on smooth arc rather than explosive pop.", prescription: "3 sets of 5 each arm" },
        { title: "Half Snatch", description: "Snatch to rack position first, then press overhead.", prescription: "3 sets of 5 each arm" },
        { title: "Tempo Snatches", description: "Slow the movement down to build control.", prescription: "3 sets of 5 each arm" },
      ],
      general: [
        { title: "Snatch Test Practice", description: "Practice snatch test pace (100 reps in 5 minutes).", prescription: "Timed sets" },
        { title: "Hand Care", description: "Proper grip to prevent tearing. Fingers, not palm.", prescription: "Every rep" },
        { title: "Overhead Lockout", description: "Practice solid overhead lockout position.", prescription: "Hold 5 seconds, 10 reps" },
      ]
    },
    {
      metricName: "Shoulder External Rotation", label: "Overhead Position",
      tooLow: [
        { title: "Overhead Holds", description: "Hold kettlebell overhead for time. Build stability.", prescription: "3 sets of 20 seconds each arm" },
        { title: "Turkish Get-Up", description: "Build overhead stability through full range of motion.", prescription: "3 reps each side" },
        { title: "Arm Bar", description: "Lie on side with KB overhead, rotate to face up. Builds shoulder stability.", prescription: "3 sets of 30 seconds each side" },
      ],
      tooHigh: [
        { title: "Soft Lockout", description: "Don't hyperextend elbow at top. Firm but not locked.", prescription: "3 sets of 5 each arm" },
        { title: "Controlled Descent", description: "Lower bell smoothly from top — don't just drop.", prescription: "3 sets of 5 each arm" },
        { title: "Rack Position Catches", description: "Catch in rack position instead of overhead to build control.", prescription: "3 sets of 5 each arm" },
      ],
      general: [
        { title: "Shoulder Mobility", description: "Wall slides, shoulder CARs, and band pull-aparts.", prescription: "5 minutes" },
        { title: "Windmill", description: "Kettlebell windmill for shoulder stability and flexibility.", prescription: "3 sets of 5 each side" },
        { title: "Bottoms-Up Press", description: "Press KB bottoms-up for grip and shoulder stability.", prescription: "3 sets of 5 each arm" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Back Position",
      tooLow: [
        { title: "Lat Pack Cue", description: "Pack lats before each snatch to protect spine.", prescription: "Every rep" },
        { title: "Chest Proud", description: "Keep chest up during backswing phase.", prescription: "3 sets of 8" },
        { title: "Core Bracing", description: "Brace core throughout movement.", prescription: "Every rep" },
      ],
      tooHigh: [
        { title: "Neutral Finish", description: "Stand tall at top without leaning back.", prescription: "3 sets of 8" },
        { title: "Rib Tuck", description: "Keep ribs down at lockout.", prescription: "Every rep" },
        { title: "Plank Position", description: "Finish each rep in standing plank position.", prescription: "3 sets of 8" },
      ],
      general: [
        { title: "Swing Foundation", description: "Perfect your swing before progressing to snatch.", prescription: "3 sets of 15 swings" },
        { title: "Core Work", description: "Planks, hollow holds, and anti-rotation exercises.", prescription: "3 sets of 30 seconds each" },
        { title: "Breathing", description: "Exhale at top, inhale on descent. Consistent pattern.", prescription: "Every rep" },
      ]
    }
  ]
};

const kettlebellCleanRecs: MotionRecommendationSet = { ...kettlebellSnatchRecs, motionKey: "kettlebell-clean", motionName: "Kettlebell Clean" };
const kettlebellPressRecs: MotionRecommendationSet = { ...kettlebellSnatchRecs, motionKey: "kettlebell-press", motionName: "Kettlebell Press" };
const kettlebellDeadliftRecs: MotionRecommendationSet = { ...powerliftingDeadliftRecs, motionKey: "kettlebell-deadlift", motionName: "Kettlebell Deadlift" };
const kettlebellGobletSquatRecs: MotionRecommendationSet = { ...powerliftingSquatRecs, motionKey: "kettlebell-goblet-squat", motionName: "Goblet Squat" };

const kettlebellTurkishGetUpRecs: MotionRecommendationSet = {
  motionKey: "kettlebell-turkish-get-up",
  motionName: "Turkish Get-Up",
  metrics: [
    {
      metricName: "Shoulder External Rotation", label: "Overhead Stability",
      tooLow: [
        { title: "Arm Bar", description: "Lie on side with KB overhead, rotate to face up.", prescription: "3 sets of 30 seconds each side" },
        { title: "Overhead Carry", description: "Walk with KB overhead. Build stability.", prescription: "3 sets of 30 seconds each arm" },
        { title: "Bottoms-Up Hold", description: "Hold KB bottoms-up overhead for stability.", prescription: "3 sets of 15 seconds each arm" },
      ],
      tooHigh: [
        { title: "Controlled Transitions", description: "Move slowly between positions. No rushing.", prescription: "1 rep per minute each side" },
        { title: "Shoe Balance", description: "Balance shoe on fist instead of KB. Forces control.", prescription: "3 reps each side" },
        { title: "Partial Get-Ups", description: "Practice first 3 steps only until perfect.", prescription: "5 reps each side" },
      ],
      general: [
        { title: "Step-by-Step Practice", description: "Practice each of the 7 steps separately.", prescription: "3 reps at each step" },
        { title: "Naked Get-Ups", description: "Practice without weight first. Perfect the pattern.", prescription: "5 reps each side" },
        { title: "Heavy Get-Ups", description: "Use heavier weight for fewer reps. Build strength.", prescription: "1-2 reps each side" },
      ]
    },
    {
      metricName: "Hip Rotation", label: "Hip Hinge",
      tooLow: [
        { title: "Half-Kneeling to Stand", description: "Practice the hip hinge from half-kneeling to standing.", prescription: "5 reps each side" },
        { title: "Windmill Prep", description: "Practice hip hinge with arm overhead.", prescription: "5 reps each side" },
        { title: "Sweep-the-Leg Drill", description: "Practice sweeping leg through to half-kneeling.", prescription: "5 reps each side" },
      ],
      tooHigh: [
        { title: "Controlled Transitions", description: "Slow down the hip hinge portion.", prescription: "5 reps each side" },
        { title: "Pause at Each Position", description: "Hold each position for 3 seconds.", prescription: "3 reps each side" },
        { title: "Eyes on Bell", description: "Keep eyes on KB throughout. Prevents rushing.", prescription: "Every rep" },
      ],
      general: [
        { title: "Mobility Work", description: "Hip openers, thoracic rotation, and shoulder mobility.", prescription: "5 minutes" },
        { title: "Loaded Carries", description: "Farmer walks, overhead carries, and rack carries.", prescription: "3 sets of 30 seconds each" },
        { title: "Core Integration", description: "The get-up IS core work. Focus on bracing throughout.", prescription: "Every rep" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Trunk Stability",
      tooLow: [
        { title: "Tall Spine Cue", description: "Stay tall through every transition. No collapsing.", prescription: "Every rep" },
        { title: "Core Bracing", description: "Brace core before each transition.", prescription: "Every transition" },
        { title: "Slow Transitions", description: "Move slowly to maintain spinal position.", prescription: "1 minute per rep" },
      ],
      tooHigh: [
        { title: "Neutral Spine", description: "Avoid arching back — maintain neutral throughout.", prescription: "Every rep" },
        { title: "Rib Tuck", description: "Keep ribs down, especially during overhead portions.", prescription: "Every rep" },
        { title: "Breathing", description: "Breathe at each position. Don't hold breath and arch.", prescription: "Every transition" },
      ],
      general: [
        { title: "Plank Variations", description: "Front, side, and rotating planks for trunk stability.", prescription: "3 sets of 20 seconds each" },
        { title: "Dead Bug", description: "Anti-extension core work.", prescription: "3 sets of 10 each side" },
        { title: "Rolling Patterns", description: "Practice rolling from back to front and back. Builds coordination.", prescription: "5 reps each direction" },
      ]
    }
  ]
};

const kettlebellWindmillRecs: MotionRecommendationSet = { ...kettlebellTurkishGetUpRecs, motionKey: "kettlebell-windmill", motionName: "Kettlebell Windmill" };
const kettlebellRowRecs: MotionRecommendationSet = { ...powerliftingDeadliftRecs, motionKey: "kettlebell-row", motionName: "Kettlebell Row" };

// ============================================================
// RECOVERY — PHYSICAL THERAPY
// ============================================================

const ptShoulderRecs: MotionRecommendationSet = {
  motionKey: "pt-shoulder-rehabilitation",
  motionName: "Shoulder Rehabilitation",
  metrics: [
    {
      metricName: "Shoulder External Rotation", label: "Range of Motion",
      tooLow: [
        { title: "Pendulum Swings", description: "Lean forward, let arm hang and swing gently in circles.", prescription: "2 sets of 30 seconds each direction" },
        { title: "Towel Stretch", description: "Hold towel behind back, gently pull to increase range.", prescription: "3 sets of 15-second holds" },
        { title: "Wall Crawl", description: "Face wall, walk fingers up to increase overhead range.", prescription: "3 sets of 10 reps" },
      ],
      tooHigh: [
        { title: "Controlled Range", description: "Stay within pain-free range. Don't push into pain.", prescription: "All exercises" },
        { title: "Isometric Holds", description: "Hold positions without moving to build strength in range.", prescription: "3 sets of 10-second holds" },
        { title: "Eccentric Lowering", description: "Slowly lower from elevated position. Builds control.", prescription: "3 sets of 8" },
      ],
      general: [
        { title: "Ice After Exercise", description: "Apply ice for 15 minutes after rehab exercises.", prescription: "After each session" },
        { title: "Scapular Stability", description: "Shoulder blade squeezes and wall push-ups.", prescription: "3 sets of 10" },
        { title: "Posture Awareness", description: "Maintain good posture throughout day. Shoulders back and down.", prescription: "Hourly checks" },
      ]
    },
    {
      metricName: "Elbow Flexion", label: "Arm Strength",
      tooLow: [
        { title: "Light Band Curls", description: "Very light resistance band bicep curls.", prescription: "3 sets of 15" },
        { title: "Isometric Holds", description: "Hold arm at 90° for time. Build endurance.", prescription: "3 sets of 15 seconds" },
        { title: "Assisted Lifts", description: "Use good arm to help lift affected arm.", prescription: "3 sets of 10" },
      ],
      tooHigh: [
        { title: "Controlled Lowering", description: "Focus on slow, controlled lowering (eccentric).", prescription: "3 sets of 8" },
        { title: "Partial Range", description: "Work in comfortable range only.", prescription: "3 sets of 10" },
        { title: "Rest Days", description: "Allow adequate rest between sessions.", prescription: "48 hours between sessions" },
      ],
      general: [
        { title: "Progressive Loading", description: "Gradually increase resistance as strength improves.", prescription: "Increase every 1-2 weeks" },
        { title: "Pain Monitoring", description: "Keep pain below 3/10 during all exercises.", prescription: "Every exercise" },
        { title: "Consistency", description: "Do exercises daily for best recovery.", prescription: "Daily" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Posture",
      tooLow: [
        { title: "Thoracic Extensions", description: "Gentle upper back extensions over foam roller.", prescription: "2 sets of 10" },
        { title: "Chin Tucks", description: "Pull chin back to align head over shoulders.", prescription: "3 sets of 10" },
        { title: "Chest Stretches", description: "Doorway chest stretch to open up front of shoulders.", prescription: "3 sets of 30-second holds" },
      ],
      tooHigh: [
        { title: "Neutral Spine", description: "Find comfortable neutral position. Don't force extension.", prescription: "Awareness throughout day" },
        { title: "Relaxation", description: "Relax shoulders and upper back. Release tension.", prescription: "Every hour" },
        { title: "Breathing", description: "Deep diaphragmatic breathing to release back tension.", prescription: "5 breaths every hour" },
      ],
      general: [
        { title: "Ergonomic Setup", description: "Ensure workstation promotes good posture.", prescription: "Check daily" },
        { title: "Movement Breaks", description: "Stand and move every 30 minutes.", prescription: "Every 30 minutes" },
        { title: "Sleep Position", description: "Sleep on back or side with proper pillow support.", prescription: "Every night" },
      ]
    }
  ]
};

const ptKneeRecs: MotionRecommendationSet = { ...ptShoulderRecs, motionKey: "pt-knee-rehabilitation", motionName: "Knee Rehabilitation" };
const ptHipRecs: MotionRecommendationSet = { ...ptShoulderRecs, motionKey: "pt-hip-rehabilitation", motionName: "Hip Rehabilitation" };
const ptAnkleRecs: MotionRecommendationSet = { ...ptShoulderRecs, motionKey: "pt-ankle-rehabilitation", motionName: "Ankle Rehabilitation" };
const ptBackRecs: MotionRecommendationSet = { ...ptShoulderRecs, motionKey: "pt-back-rehabilitation", motionName: "Back Rehabilitation" };
const ptNeckRecs: MotionRecommendationSet = { ...ptShoulderRecs, motionKey: "pt-neck-rehabilitation", motionName: "Neck Rehabilitation" };
const ptElbowRecs: MotionRecommendationSet = { ...ptShoulderRecs, motionKey: "pt-elbow-rehabilitation", motionName: "Elbow Rehabilitation" };
const ptWristRecs: MotionRecommendationSet = { ...ptShoulderRecs, motionKey: "pt-wrist-rehabilitation", motionName: "Wrist Rehabilitation" };
const ptPosturalRecs: MotionRecommendationSet = { ...ptShoulderRecs, motionKey: "pt-postural-correction", motionName: "Postural Correction" };
const ptBalanceRecs: MotionRecommendationSet = { ...ptShoulderRecs, motionKey: "pt-balance-training", motionName: "Balance Training" };

// ============================================================
// RECOVERY — STRETCHING
// ============================================================

const stretchHamstringRecs: MotionRecommendationSet = {
  motionKey: "stretching-hamstring-stretch",
  motionName: "Hamstring Stretch",
  metrics: [
    {
      metricName: "Hip Rotation", label: "Hip Hinge",
      tooLow: [
        { title: "Seated Forward Fold", description: "Sit with legs extended, reach toward toes. Hold at comfortable stretch.", prescription: "3 sets of 30-second holds" },
        { title: "Standing Toe Touch", description: "Stand and reach toward toes. Bend from hips, not back.", prescription: "3 sets of 20-second holds" },
        { title: "Single-Leg Stretch", description: "One leg on elevated surface, hinge forward.", prescription: "3 sets of 20 seconds each leg" },
      ],
      tooHigh: [
        { title: "Controlled Range", description: "Don't push past comfortable stretch. Hold at first resistance.", prescription: "30-second holds" },
        { title: "PNF Stretching", description: "Contract muscle 5 seconds, then stretch further.", prescription: "3 cycles" },
        { title: "Gradual Progression", description: "Increase range by 1-2° per session. No forcing.", prescription: "Track weekly" },
      ],
      general: [
        { title: "Warm Up First", description: "5 minutes of walking before stretching.", prescription: "Before every session" },
        { title: "Consistency", description: "Stretch daily for best results.", prescription: "Daily, 5-10 minutes" },
        { title: "Breathing", description: "Deep breathing during holds. Exhale to deepen stretch.", prescription: "Every hold" },
      ]
    },
    {
      metricName: "Knee Flexion", label: "Knee Position",
      tooLow: [
        { title: "Straight Leg Focus", description: "Keep knee straight (not locked) during hamstring stretches.", prescription: "Every stretch" },
        { title: "Quad Engagement", description: "Gently engage quad to straighten knee during stretch.", prescription: "Every stretch" },
        { title: "Strap Assisted", description: "Use strap around foot to maintain straight leg.", prescription: "3 sets of 30 seconds" },
      ],
      tooHigh: [
        { title: "Soft Knee", description: "Keep slight bend in knee. Don't hyperextend.", prescription: "Every stretch" },
        { title: "Micro-Bend", description: "Maintain micro-bend to protect joint.", prescription: "Every stretch" },
        { title: "Comfort First", description: "Stretch should feel like a pull, not pain.", prescription: "Every stretch" },
      ],
      general: [
        { title: "Dynamic Stretching", description: "Leg swings before static holds.", prescription: "2 sets of 10 each leg" },
        { title: "Foam Rolling", description: "Roll hamstrings before stretching.", prescription: "1 minute each leg" },
        { title: "Progressive Holds", description: "Start with 15 seconds, build to 60 seconds.", prescription: "Progress weekly" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Back Position",
      tooLow: [
        { title: "Flat Back Stretch", description: "Hinge from hips with flat back, not rounded.", prescription: "3 sets of 20 seconds" },
        { title: "Chest Up Cue", description: "Keep chest lifted while hinging forward.", prescription: "Every stretch" },
        { title: "Wall Hinge", description: "Back against wall, slide down maintaining flat back.", prescription: "3 sets of 10" },
      ],
      tooHigh: [
        { title: "Relaxed Stretch", description: "Let back round naturally for deeper hamstring stretch.", prescription: "30-second holds" },
        { title: "Gravity Stretch", description: "Hang forward and let gravity do the work.", prescription: "30-60 seconds" },
        { title: "Supine Stretch", description: "Lie on back, pull leg toward chest. Spine stays neutral.", prescription: "3 sets of 30 seconds each leg" },
      ],
      general: [
        { title: "Morning Routine", description: "Gentle stretching first thing in morning.", prescription: "5 minutes daily" },
        { title: "Post-Workout Stretching", description: "Stretch after exercise when muscles are warm.", prescription: "5-10 minutes" },
        { title: "Yoga Integration", description: "Downward dog and forward fold for hamstring flexibility.", prescription: "Hold each 30 seconds" },
      ]
    }
  ]
};

const stretchHipFlexorRecs: MotionRecommendationSet = { ...stretchHamstringRecs, motionKey: "stretching-hip-flexor-stretch", motionName: "Hip Flexor Stretch" };
const stretchQuadRecs: MotionRecommendationSet = { ...stretchHamstringRecs, motionKey: "stretching-quad-stretch", motionName: "Quad Stretch" };
const stretchShoulderRecs: MotionRecommendationSet = { ...stretchHamstringRecs, motionKey: "stretching-shoulder-stretch", motionName: "Shoulder Stretch" };
const stretchSpinalRecs: MotionRecommendationSet = { ...stretchHamstringRecs, motionKey: "stretching-spinal-twist", motionName: "Spinal Twist" };

// ============================================================
// RECOVERY — MOBILITY
// ============================================================

const mobilityHipRecs: MotionRecommendationSet = {
  motionKey: "mobility-hip-circles",
  motionName: "Hip Circles",
  metrics: [
    {
      metricName: "Hip Rotation", label: "Range of Motion",
      tooLow: [
        { title: "90/90 Stretch", description: "Sit in 90/90 position, rotate between sides.", prescription: "3 sets of 10 transitions" },
        { title: "Controlled Articular Rotations", description: "Slow, controlled full circles with hip.", prescription: "2 sets of 5 each direction" },
        { title: "Pigeon Pose", description: "Hold pigeon pose for deep hip opening.", prescription: "3 sets of 30 seconds each side" },
      ],
      tooHigh: [
        { title: "Controlled Range", description: "Stay within comfortable range. Build gradually.", prescription: "Every rep" },
        { title: "Isometric Holds", description: "Hold at end range for 5 seconds. Build strength.", prescription: "3 sets of 5 holds" },
        { title: "Slow Circles", description: "Very slow circles to build control at end range.", prescription: "2 sets of 5 each direction" },
      ],
      general: [
        { title: "Daily Practice", description: "Hip mobility improves with daily consistent practice.", prescription: "5 minutes daily" },
        { title: "Warm-Up Integration", description: "Include hip circles in every warm-up.", prescription: "Before every workout" },
        { title: "Progressive Overload", description: "Gradually increase range over weeks.", prescription: "Track monthly" },
      ]
    },
    {
      metricName: "Knee Flexion", label: "Stability",
      tooLow: [
        { title: "Bent-Knee Circles", description: "Perform hip circles with knee bent at 90°.", prescription: "2 sets of 8 each direction" },
        { title: "Fire Hydrants", description: "On all fours, lift knee to side. Builds hip stability.", prescription: "3 sets of 10 each side" },
        { title: "Clamshells", description: "Side-lying, open knees like a clamshell.", prescription: "3 sets of 15 each side" },
      ],
      tooHigh: [
        { title: "Straight-Leg Circles", description: "Perform circles with straighter leg for different challenge.", prescription: "2 sets of 8 each direction" },
        { title: "Standing Circles", description: "Stand on one leg, circle other leg. Builds balance.", prescription: "2 sets of 5 each direction" },
        { title: "Controlled Extensions", description: "Extend leg during circle for added challenge.", prescription: "2 sets of 5 each direction" },
      ],
      general: [
        { title: "Foam Rolling", description: "Roll hip flexors, glutes, and IT band before mobility.", prescription: "1 minute each area" },
        { title: "Deep Squat Hold", description: "Hold deep squat position for hip opening.", prescription: "3 sets of 30 seconds" },
        { title: "Frog Stretch", description: "On all fours, spread knees wide, rock back.", prescription: "3 sets of 30 seconds" },
      ]
    },
    {
      metricName: "Spine Extension", label: "Core Stability",
      tooLow: [
        { title: "Core Bracing", description: "Maintain core engagement during hip circles.", prescription: "Every rep" },
        { title: "Tall Posture", description: "Stay upright during standing hip circles.", prescription: "Every rep" },
        { title: "Anti-Rotation", description: "Keep torso still while hip moves.", prescription: "Every rep" },
      ],
      tooHigh: [
        { title: "Relaxed Movement", description: "Allow natural spinal movement during circles.", prescription: "Every rep" },
        { title: "Breathing", description: "Breathe naturally. Don't hold breath.", prescription: "Every rep" },
        { title: "Fluid Motion", description: "Keep movement smooth and continuous.", prescription: "Every rep" },
      ],
      general: [
        { title: "Cat-Cow", description: "Warm up spine with cat-cow before hip mobility.", prescription: "10 reps" },
        { title: "Bird Dog", description: "Build core stability for better hip mobility.", prescription: "3 sets of 8 each side" },
        { title: "World's Greatest Stretch", description: "Combines hip, thoracic, and hamstring mobility.", prescription: "5 reps each side" },
      ]
    }
  ]
};

const mobilityThoracicRecs: MotionRecommendationSet = { ...mobilityHipRecs, motionKey: "mobility-thoracic-rotation", motionName: "Thoracic Rotation" };
const mobilityAnkleRecs: MotionRecommendationSet = { ...mobilityHipRecs, motionKey: "mobility-ankle-mobility", motionName: "Ankle Mobility" };
const mobilityShoulderRecs: MotionRecommendationSet = { ...mobilityHipRecs, motionKey: "mobility-shoulder-circles", motionName: "Shoulder Circles" };
const mobilitySpineRecs: MotionRecommendationSet = { ...mobilityHipRecs, motionKey: "mobility-spine-waves", motionName: "Spine Waves" };

// ============================================================
// MASTER LOOKUP
// ============================================================

const allRecommendations: Record<string, MotionRecommendationSet> = {
  // Sports — Football
  "football-throw": footballThrowRecs,
  "football-qb-throw": footballThrowRecs,
  "football-punt": footballPuntRecs,
  "football-field-goal": footballFieldGoalRecs,
  
  // Sports — Basketball
  "basketball-jump-shot": basketballJumpShotRecs,
  "basketball-free-throw": basketballFreeThrowRecs,
  "basketball-layup": basketballLayupRecs,
  "basketball-dribbling": basketballDribblingRecs,
  
  // Sports — Baseball
  "baseball-fastball": baseballFastballRecs,
  "baseball-curveball": baseballCurveballRecs,
  "baseball-slider": baseballSliderRecs,
  "baseball-knuckleball": baseballKnuckleballRecs,
  "baseball-batting-swing": baseballBattingRecs,
  
  // Sports — Tennis
  "tennis-forehand": tennisForehandRecs,
  "tennis-backhand": tennisBackhandRecs,
  "tennis-serve": tennisServeRecs,
  
  // Sports — Golf
  "golf-driver-swing": golfDriverRecs,
  "golf-swing": golfDriverRecs,
  "golf-iron-shot": golfIronRecs,
  "golf-putting": golfPuttingRecs,
  
  // Sports — Soccer
  "soccer-power-shot": soccerPowerShotRecs,
  "soccer-passing": soccerPassingRecs,
  
  // Sports — Archery
  "archery-stance": archeryStanceRecs,
  "archery-draw": archeryDrawRecs,
  "archery-release": archeryReleaseRecs,
  
  // Sports — Track & Field
  "track-field-sprint-start": trackSprintStartRecs,
  "track-field-long-jump": trackLongJumpRecs,
  "track-field-high-jump": trackHighJumpRecs,
  "track-field-shot-put": trackShotPutRecs,
  "track-field-discus": trackDiscusRecs,
  "track-field-javelin": trackJavelinRecs,
  "track-field-pole-vault": trackPoleVaultRecs,
  "track-field-hurdles": trackHurdlesRecs,
  
  // Weightlifting — Powerlifting
  "powerlifting-back-squat": powerliftingSquatRecs,
  "powerlifting-front-squat": powerliftingFrontSquatRecs,
  "powerlifting-deadlift": powerliftingDeadliftRecs,
  "powerlifting-sumo-deadlift": powerliftingSumoDeadliftRecs,
  "powerlifting-bench-press": powerliftingBenchRecs,
  "powerlifting-incline-bench": powerliftingInclineBenchRecs,
  "powerlifting-overhead-press": powerliftingOverheadPressRecs,
  
  // Weightlifting — Olympic Lifting
  "olympic-lifting-clean-jerk": olympicCleanJerkRecs,
  "olympic-lifting-snatch": olympicSnatchRecs,
  "olympic-lifting-hang-clean": olympicHangCleanRecs,
  "olympic-lifting-power-clean": olympicPowerCleanRecs,
  
  // Weightlifting — Kettlebell
  "kettlebell-swing": kettlebellSwingRecs,
  "kettlebell-kb-swing": kettlebellSwingRecs,
  "kettlebell-snatch": kettlebellSnatchRecs,
  "kettlebell-kb-snatch": kettlebellSnatchRecs,
  "kettlebell-clean": kettlebellCleanRecs,
  "kettlebell-kb-clean": kettlebellCleanRecs,
  "kettlebell-press": kettlebellPressRecs,
  "kettlebell-kb-press": kettlebellPressRecs,
  "kettlebell-deadlift": kettlebellDeadliftRecs,
  "kettlebell-kb-deadlift": kettlebellDeadliftRecs,
  "kettlebell-goblet-squat": kettlebellGobletSquatRecs,
  "kettlebell-turkish-get-up": kettlebellTurkishGetUpRecs,
  "kettlebell-windmill": kettlebellWindmillRecs,
  "kettlebell-row": kettlebellRowRecs,
  "kettlebell-kb-row": kettlebellRowRecs,
  
  // Recovery — Physical Therapy
  "pt-shoulder-rehabilitation": ptShoulderRecs,
  "physical-therapy-shoulder-rehabilitation": ptShoulderRecs,
  "pt-knee-rehabilitation": ptKneeRecs,
  "physical-therapy-knee-rehabilitation": ptKneeRecs,
  "pt-hip-rehabilitation": ptHipRecs,
  "physical-therapy-hip-rehabilitation": ptHipRecs,
  "pt-ankle-rehabilitation": ptAnkleRecs,
  "physical-therapy-ankle-rehabilitation": ptAnkleRecs,
  "pt-back-rehabilitation": ptBackRecs,
  "physical-therapy-back-rehabilitation": ptBackRecs,
  "pt-neck-rehabilitation": ptNeckRecs,
  "physical-therapy-neck-rehabilitation": ptNeckRecs,
  "pt-elbow-rehabilitation": ptElbowRecs,
  "physical-therapy-elbow-rehabilitation": ptElbowRecs,
  "pt-wrist-rehabilitation": ptWristRecs,
  "physical-therapy-wrist-rehabilitation": ptWristRecs,
  "pt-postural-correction": ptPosturalRecs,
  "physical-therapy-postural-correction": ptPosturalRecs,
  "pt-balance-training": ptBalanceRecs,
  "physical-therapy-balance-training": ptBalanceRecs,
  
  // Recovery — Stretching
  "stretching-hamstring-stretch": stretchHamstringRecs,
  "stretching-hip-flexor-stretch": stretchHipFlexorRecs,
  "stretching-quad-stretch": stretchQuadRecs,
  "stretching-shoulder-stretch": stretchShoulderRecs,
  "stretching-spinal-twist": stretchSpinalRecs,
  
  // Recovery — Mobility
  "mobility-hip-circles": mobilityHipRecs,
  "mobility-thoracic-rotation": mobilityThoracicRecs,
  "mobility-ankle-mobility": mobilityAnkleRecs,
  "mobility-shoulder-circles": mobilityShoulderRecs,
  "mobility-spine-waves": mobilitySpineRecs,
};

/**
 * Get motion-specific recommendations based on motion key.
 * Tries exact match first, then fuzzy matching.
 */
export function getMotionRecommendations(
  category: string,
  subcategory: string,
  motionName: string
): MotionRecommendationSet | null {
  const motionSlug = motionName.toLowerCase().replace(/\s+/g, '-');
  
  // Try exact matches
  const keys = [
    `${subcategory.toLowerCase()}-${motionSlug}`,
    `${category.toLowerCase()}-${motionSlug}`,
    motionSlug,
  ];
  
  for (const key of keys) {
    if (allRecommendations[key]) {
      return allRecommendations[key];
    }
  }
  
  // Try partial match on subcategory
  const subcatLower = subcategory.toLowerCase().replace(/\s+/g, '-');
  for (const [profileKey, profile] of Object.entries(allRecommendations)) {
    if (profileKey.startsWith(subcatLower)) {
      return profile;
    }
  }
  
  // Keyword matching
  const combined = `${category} ${subcategory} ${motionName}`.toLowerCase();
  if (combined.includes('kettlebell') && combined.includes('swing')) return kettlebellSwingRecs;
  if (combined.includes('kettlebell') && combined.includes('snatch')) return kettlebellSnatchRecs;
  if (combined.includes('football') || combined.includes('qb')) return footballThrowRecs;
  if (combined.includes('golf')) return golfDriverRecs;
  if (combined.includes('baseball') && combined.includes('bat')) return baseballBattingRecs;
  if (combined.includes('baseball')) return baseballFastballRecs;
  if (combined.includes('basketball') && combined.includes('shot')) return basketballJumpShotRecs;
  if (combined.includes('basketball')) return basketballJumpShotRecs;
  if (combined.includes('soccer') || combined.includes('kick')) return soccerPowerShotRecs;
  if (combined.includes('tennis') && combined.includes('serve')) return tennisServeRecs;
  if (combined.includes('tennis')) return tennisForehandRecs;
  if (combined.includes('squat')) return powerliftingSquatRecs;
  if (combined.includes('deadlift')) return powerliftingDeadliftRecs;
  if (combined.includes('bench')) return powerliftingBenchRecs;
  if (combined.includes('clean') || combined.includes('jerk')) return olympicCleanJerkRecs;
  if (combined.includes('snatch') && combined.includes('olympic')) return olympicCleanJerkRecs;
  if (combined.includes('archery')) return archeryDrawRecs;
  if (combined.includes('sprint') || combined.includes('track')) return trackSprintStartRecs;
  if (combined.includes('stretch')) return stretchHamstringRecs;
  if (combined.includes('mobility')) return mobilityHipRecs;
  if (combined.includes('physical therapy') || combined.includes('rehab')) return ptShoulderRecs;
  
  return null;
}

/**
 * Get dynamic recommendations based on the user's lowest-scoring metrics.
 * Returns recommendations specifically targeting the user's weakest areas.
 */
export function getDynamicRecommendations(
  category: string,
  subcategory: string,
  motionName: string,
  metricScores: Array<{ name: string; score: number; value: number; optimalMin: number; optimalMax: number }>
): DrillRecommendation[] {
  const motionRecs = getMotionRecommendations(category, subcategory, motionName);
  if (!motionRecs) return [];
  
  // Sort metrics by score (lowest first) — these are the areas needing most improvement
  const sortedMetrics = [...metricScores]
    .filter(m => m.score > 0) // Only include detected metrics
    .sort((a, b) => a.score - b.score);
  
  const recommendations: DrillRecommendation[] = [];
  
  for (const metric of sortedMetrics) {
    if (recommendations.length >= 3) break;
    
    // Find matching metric in recommendation set
    const matchingMetricRecs = motionRecs.metrics.find(m => {
      const metricNameLower = m.metricName.toLowerCase().replace(/\s+/g, '');
      const scoredNameLower = metric.name.toLowerCase().replace(/\s+/g, '');
      return metricNameLower.includes(scoredNameLower) || scoredNameLower.includes(metricNameLower) ||
        m.label.toLowerCase().replace(/\s+/g, '').includes(scoredNameLower) ||
        scoredNameLower.includes(m.label.toLowerCase().replace(/\s+/g, ''));
    });
    
    if (!matchingMetricRecs) continue;
    
    // Determine if value is too low or too high relative to optimal range
    let drills: DrillRecommendation[];
    if (metric.value < metric.optimalMin) {
      drills = matchingMetricRecs.tooLow;
    } else if (metric.value > metric.optimalMax) {
      drills = matchingMetricRecs.tooHigh;
    } else {
      drills = matchingMetricRecs.general;
    }
    
    // Add the top drill from this metric's recommendations
    if (drills.length > 0) {
      const remaining = 3 - recommendations.length;
      recommendations.push(...drills.slice(0, Math.min(remaining, 1)));
    }
  }
  
  // If we still don't have 3 recommendations, fill from general drills of weakest metrics
  if (recommendations.length < 3 && motionRecs.metrics.length > 0) {
    for (const metricRec of motionRecs.metrics) {
      if (recommendations.length >= 3) break;
      const generalDrills = metricRec.general;
      for (const drill of generalDrills) {
        if (recommendations.length >= 3) break;
        if (!recommendations.find(r => r.title === drill.title)) {
          recommendations.push(drill);
        }
      }
    }
  }
  
  return recommendations;
}
