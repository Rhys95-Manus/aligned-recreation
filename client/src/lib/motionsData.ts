// Complete motions data structure based on provided specifications

export interface Motion {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  description: string;
  duration: string;
  keyPoints: string;
}

export interface Subcategory {
  id: string;
  name: string;
  motions: Motion[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  subcategories: Subcategory[];
}

// Helper function to get difficulty badge color
export function getDifficultyColor(level: string): string {
  switch (level) {
    case "Beginner":
      return "bg-green-500/20 text-green-400";
    case "Intermediate":
      return "bg-orange-500/20 text-orange-400";
    case "Advanced":
      return "bg-red-500/20 text-red-400";
    case "Expert":
      return "bg-purple-500/20 text-purple-400";
    default:
      return "bg-slate-500/20 text-slate-400";
  }
}

// All categories data
export const categoriesData: Category[] = [
  {
    id: "sports",
    name: "Sports",
    description: "Professional sports techniques and form analysis",
    subcategories: [
      {
        id: "football",
        name: "Football",
        motions: [
          { id: "throw", name: "Throw", level: "Intermediate", description: "Quarterback throwing technique", duration: "1-2 seconds", keyPoints: "Arm motion, Footwork, Release" },
          { id: "punt", name: "Punt", level: "Advanced", description: "Professional punting technique", duration: "2-3 seconds", keyPoints: "Drop timing, Leg swing, Contact point" },
          { id: "field-goal", name: "Field Goal", level: "Advanced", description: "Placekicking technique", duration: "2-3 seconds", keyPoints: "Plant foot, Swing path, Follow-through" }
        ]
      },
      {
        id: "basketball",
        name: "Basketball",
        motions: [
          { id: "jump-shot", name: "Jump Shot", level: "Intermediate", description: "NBA-style shooting form and technique", duration: "1-2 seconds", keyPoints: "Elbow alignment, Arc angle, Follow-through" },
          { id: "free-throw", name: "Free Throw", level: "Beginner", description: "Consistent free throw shooting form", duration: "2-3 seconds", keyPoints: "Routine consistency, Arc, Follow-through" },
          { id: "layup", name: "Layup", level: "Beginner", description: "Basic layup technique", duration: "1-2 seconds", keyPoints: "Footwork, Soft touch, Body control" },
          { id: "dribbling", name: "Dribbling", level: "Intermediate", description: "Ball handling fundamentals", duration: "Continuous", keyPoints: "Hand position, Court vision, Control" }
        ]
      },
      {
        id: "baseball",
        name: "Baseball",
        motions: [
          { id: "fastball", name: "Fastball", level: "Intermediate", description: "Four-seam fastball pitching mechanics", duration: "2-3 seconds", keyPoints: "Stride length, Arm slot, Release point" },
          { id: "curveball", name: "Curveball", level: "Advanced", description: "Breaking ball with 12-6 rotation", duration: "2-3 seconds", keyPoints: "Grip pressure, Wrist snap, Release timing" },
          { id: "slider", name: "Slider", level: "Advanced", description: "Sharp breaking slider technique", duration: "2-3 seconds", keyPoints: "Finger pressure, Arm speed, Late break" },
          { id: "knuckleball", name: "Knuckleball", level: "Expert", description: "Unpredictable knuckleball delivery", duration: "2-3 seconds", keyPoints: "Fingertip grip, Minimal rotation, Consistent release" },
          { id: "batting-swing", name: "Batting Swing", level: "Intermediate", description: "MLB-style hitting mechanics", duration: "1-2 seconds", keyPoints: "Load phase, Hip rotation, Bat path" }
        ]
      },
      {
        id: "tennis",
        name: "Tennis",
        motions: [
          { id: "forehand", name: "Forehand", level: "Intermediate", description: "Modern forehand technique", duration: "1-2 seconds", keyPoints: "Grip, Swing path, Follow-through" },
          { id: "backhand", name: "Backhand", level: "Intermediate", description: "Two-handed backhand", duration: "1-2 seconds", keyPoints: "Preparation, Contact point, Finish" },
          { id: "serve", name: "Serve", level: "Advanced", description: "Professional serve technique", duration: "2-3 seconds", keyPoints: "Toss, Racquet drop, Contact" }
        ]
      },
      {
        id: "golf",
        name: "Golf",
        motions: [
          { id: "driver-swing", name: "Driver Swing", level: "Intermediate", description: "Full driver swing mechanics", duration: "2-3 seconds", keyPoints: "Setup, Backswing, Impact" },
          { id: "iron-shot", name: "Iron Shot", level: "Intermediate", description: "Mid-iron striking technique", duration: "2-3 seconds", keyPoints: "Ball position, Divot, Follow-through" },
          { id: "putting", name: "Putting", level: "Beginner", description: "Putting stroke fundamentals", duration: "1-2 seconds", keyPoints: "Alignment, Tempo, Distance control" }
        ]
      },
      {
        id: "soccer",
        name: "Soccer",
        motions: [
          { id: "power-shot", name: "Power Shot", level: "Intermediate", description: "Powerful shooting technique", duration: "1-2 seconds", keyPoints: "Plant foot, Contact point, Follow-through" },
          { id: "passing", name: "Passing", level: "Beginner", description: "Accurate passing technique", duration: "1 second", keyPoints: "Inside foot, Weight of pass, Accuracy" }
        ]
      },
      {
        id: "archery",
        name: "Archery",
        motions: [
          { id: "stance", name: "Stance", level: "Beginner", description: "Proper archery stance and foot positioning", duration: "Hold 3-5 seconds", keyPoints: "Foot placement, Body alignment, Balance" },
          { id: "draw", name: "Draw", level: "Intermediate", description: "Drawing the bowstring with proper form", duration: "2-3 seconds", keyPoints: "Back tension, Anchor point, Consistent draw length" },
          { id: "release", name: "Release", level: "Advanced", description: "Clean arrow release and follow-through", duration: "1-2 seconds", keyPoints: "Relaxed fingers, Back tension maintenance, Follow-through" }
        ]
      },
      {
        id: "track-field",
        name: "Track & Field",
        motions: [
          { id: "sprint-start", name: "Sprint Start", level: "Intermediate", description: "Explosive starting technique", duration: "1-2 seconds", keyPoints: "Block setup, Drive phase, Acceleration" },
          { id: "long-jump", name: "Long Jump", level: "Advanced", description: "Long jump technique", duration: "3-4 seconds", keyPoints: "Approach, Takeoff, Landing" },
          { id: "high-jump", name: "High Jump", level: "Advanced", description: "Fosbury flop technique", duration: "3-4 seconds", keyPoints: "Approach, Takeoff, Bar clearance" },
          { id: "shot-put", name: "Shot Put", level: "Advanced", description: "Shot put throwing technique", duration: "2-3 seconds", keyPoints: "Glide, Power position, Release" },
          { id: "discus", name: "Discus", level: "Advanced", description: "Discus throwing technique", duration: "3-4 seconds", keyPoints: "Wind-up, Power position, Release" },
          { id: "javelin", name: "Javelin", level: "Expert", description: "Javelin throwing technique", duration: "4-5 seconds", keyPoints: "Approach, Crossover, Release" },
          { id: "pole-vault", name: "Pole Vault", level: "Expert", description: "Pole vault technique", duration: "5-6 seconds", keyPoints: "Approach, Plant, Inversion" },
          { id: "hurdles", name: "Hurdles", level: "Advanced", description: "Hurdle technique", duration: "1-2 seconds", keyPoints: "Lead leg, Trail leg, Rhythm" }
        ]
      }
    ]
  },
  {
    id: "weightlifting",
    name: "Weightlifting",
    description: "Strength training and powerlifting techniques",
    subcategories: [
      {
        id: "powerlifting",
        name: "Powerlifting",
        motions: [
          { id: "back-squat", name: "Back Squat", level: "Intermediate", description: "Competition back squat technique", duration: "3-4 seconds", keyPoints: "Depth, Knee tracking, Hip drive" },
          { id: "front-squat", name: "Front Squat", level: "Advanced", description: "Front-loaded squat variation", duration: "3-4 seconds", keyPoints: "Rack position, Upright torso, Depth" },
          { id: "deadlift", name: "Deadlift", level: "Intermediate", description: "Conventional deadlift technique", duration: "2-3 seconds", keyPoints: "Hip hinge, Bar path, Lockout" },
          { id: "sumo-deadlift", name: "Sumo Deadlift", level: "Advanced", description: "Wide stance deadlift variation", duration: "2-3 seconds", keyPoints: "Stance width, Vertical torso, Hip drive" },
          { id: "bench-press", name: "Bench Press", level: "Intermediate", description: "Competition bench press technique", duration: "2-3 seconds", keyPoints: "Arch, Bar path, Leg drive" },
          { id: "incline-bench", name: "Incline Bench Press", level: "Intermediate", description: "Inclined pressing movement", duration: "2-3 seconds", keyPoints: "Angle, Shoulder position, Range of motion" },
          { id: "overhead-press", name: "Overhead Press", level: "Intermediate", description: "Standing overhead press", duration: "2-3 seconds", keyPoints: "Core stability, Bar path, Lockout" }
        ]
      },
      {
        id: "olympic-lifting",
        name: "Olympic Lifting",
        motions: [
          { id: "clean-jerk", name: "Clean & Jerk", level: "Expert", description: "Olympic clean and jerk", duration: "4-5 seconds", keyPoints: "First pull, Second pull, Jerk drive" },
          { id: "snatch", name: "Snatch", level: "Expert", description: "Olympic snatch technique", duration: "2-3 seconds", keyPoints: "First pull, Turnover, Overhead stability" },
          { id: "hang-clean", name: "Hang Clean", level: "Advanced", description: "Hang position clean", duration: "2-3 seconds", keyPoints: "Hip extension, High pull, Catch position" },
          { id: "power-clean", name: "Power Clean", level: "Advanced", description: "Power variation of clean", duration: "2-3 seconds", keyPoints: "Triple extension, High elbows, Catch" }
        ]
      },
      {
        id: "kettlebell",
        name: "Kettlebell Training",
        motions: [
          { id: "kb-swing", name: "Kettlebell Swing", level: "Beginner", description: "Russian kettlebell swing", duration: "1-2 seconds", keyPoints: "Hip hinge, Glute drive, Neutral spine" },
          { id: "kb-clean", name: "Kettlebell Clean", level: "Intermediate", description: "Single arm kettlebell clean", duration: "1-2 seconds", keyPoints: "Hip snap, Elbow insertion, Rack position" },
          { id: "kb-snatch", name: "Kettlebell Snatch", level: "Advanced", description: "Overhead kettlebell snatch", duration: "1-2 seconds", keyPoints: "Hip drive, High pull, Punch through" },
          { id: "kb-press", name: "Kettlebell Press", level: "Intermediate", description: "Single arm overhead press", duration: "2-3 seconds", keyPoints: "Rack position, Core stability, Vertical path" },
          { id: "turkish-getup", name: "Turkish Get-Up", level: "Advanced", description: "Full Turkish get-up movement", duration: "10-15 seconds", keyPoints: "Stability, Control, Smooth transitions" },
          { id: "kb-windmill", name: "Kettlebell Windmill", level: "Advanced", description: "Overhead stability and mobility", duration: "3-5 seconds", keyPoints: "Hip hinge, Overhead stability, Flexibility" },
          { id: "goblet-squat", name: "Goblet Squat", level: "Beginner", description: "Front-loaded squat pattern", duration: "2-3 seconds", keyPoints: "Chest up, Deep squat, Heel contact" },
          { id: "kb-deadlift", name: "Kettlebell Deadlift", level: "Beginner", description: "Hip hinge pattern with kettlebell", duration: "2-3 seconds", keyPoints: "Hip hinge, Neutral spine, Glute squeeze" },
          { id: "kb-row", name: "Kettlebell Row", level: "Beginner", description: "Single arm rowing movement", duration: "1-2 seconds", keyPoints: "Hip hinge, Elbow path, Squeeze shoulder blade" }
        ]
      }
    ]
  },
  {
    id: "yoga",
    name: "Yoga",
    description: "Yoga poses and flow sequences",
    subcategories: [
      {
        id: "seated",
        name: "Seated",
        motions: [
          { id: "seated-forward-fold", name: "Seated Forward Fold", level: "Beginner", description: "Hamstring and spine stretch", duration: "Hold 1-2 minutes", keyPoints: "Long spine, Hip hinge, Relaxed neck" },
          { id: "bound-angle", name: "Bound Angle Pose", level: "Beginner", description: "Hip opening seated pose", duration: "Hold 1-2 minutes", keyPoints: "Soles together, Tall spine, Gentle forward fold" },
          { id: "seated-twist", name: "Seated Spinal Twist", level: "Intermediate", description: "Detoxifying spinal rotation", duration: "Hold 30-60s each side", keyPoints: "Tall spine, Gradual rotation, Breath awareness" },
          { id: "lotus", name: "Lotus Pose", level: "Advanced", description: "Traditional meditation seat", duration: "Hold 1-5 minutes", keyPoints: "Hip flexibility, Straight spine, Relaxed shoulders" },
          { id: "hero", name: "Hero Pose", level: "Intermediate", description: "Kneeling meditation pose", duration: "Hold 1-3 minutes", keyPoints: "Knees together, Tall spine, Relaxed arms" },
          { id: "pigeon", name: "Pigeon Pose", level: "Intermediate", description: "Deep hip opening pose", duration: "Hold 1-2 minutes", keyPoints: "Hip opening, Square hips, Gentle forward fold" }
        ]
      },
      {
        id: "standing",
        name: "Standing",
        motions: [
          { id: "warrior-1", name: "Warrior I", level: "Beginner", description: "Strong grounding warrior pose", duration: "Hold 30-60s", keyPoints: "Hip square, Strong legs, Lifted chest" },
          { id: "warrior-2", name: "Warrior II", level: "Beginner", description: "Side-facing warrior pose", duration: "Hold 30-60s", keyPoints: "Wide stance, Bent front knee, Open hips" },
          { id: "warrior-3", name: "Warrior III", level: "Advanced", description: "Balancing warrior pose", duration: "Hold 15-30s", keyPoints: "Single leg balance, Straight line, Core engagement" },
          { id: "triangle", name: "Triangle Pose", level: "Intermediate", description: "Side body stretch and strength", duration: "Hold 30-60s", keyPoints: "Long spine, Open chest, Strong legs" },
          { id: "tree", name: "Tree Pose", level: "Intermediate", description: "Single leg balance pose", duration: "Hold 30-60s", keyPoints: "Root down, Engage core, Steady gaze" },
          { id: "extended-side-angle", name: "Extended Side Angle", level: "Intermediate", description: "Deep side body stretch", duration: "Hold 30-60s", keyPoints: "Long line, Open chest, Grounded feet" }
        ]
      },
      {
        id: "flow",
        name: "Flow",
        motions: [
          { id: "sun-salutation-a", name: "Sun Salutation A", level: "Beginner", description: "Classic vinyasa flow sequence", duration: "1-2 minutes", keyPoints: "Breath coordination, Smooth transitions, Alignment" },
          { id: "sun-salutation-b", name: "Sun Salutation B", level: "Intermediate", description: "Extended vinyasa flow with warriors", duration: "2-3 minutes", keyPoints: "Warrior integration, Breath rhythm, Flow continuity" }
        ]
      },
      {
        id: "restorative",
        name: "Restorative",
        motions: [
          { id: "childs-pose", name: "Child's Pose", level: "Beginner", description: "Resting and grounding pose", duration: "Hold 1-5 minutes", keyPoints: "Hip connection, Relaxed arms, Deep breathing" },
          { id: "corpse-pose", name: "Corpse Pose", level: "Beginner", description: "Final relaxation pose", duration: "Hold 5-15 minutes", keyPoints: "Complete relaxation, Natural breath, Mental stillness" }
        ]
      }
    ]
  },
  {
    id: "dance",
    name: "Dance",
    description: "Dance moves and choreography",
    subcategories: [
      {
        id: "hip-hop",
        name: "Hip Hop",
        motions: [
          { id: "pop-lock", name: "Pop & Lock", level: "Intermediate", description: "Classic popping and locking", duration: "2-4 seconds", keyPoints: "Sharp movements, Isolation, Rhythm" },
          { id: "toprock", name: "Toprock", level: "Beginner", description: "Standing breakdance moves", duration: "4-8 seconds", keyPoints: "Footwork, Style, Flow" },
          { id: "windmill", name: "Windmill", level: "Expert", description: "Classic breakdance power move", duration: "2-4 seconds", keyPoints: "Momentum, Core strength, Timing" }
        ]
      },
      {
        id: "latin",
        name: "Latin",
        motions: [
          { id: "salsa-basic", name: "Salsa Basic", level: "Beginner", description: "Fundamental salsa step", duration: "4-8 beats", keyPoints: "Timing, Hip movement, Partner connection" },
          { id: "tango-walk", name: "Tango Walk", level: "Intermediate", description: "Argentine tango walking technique", duration: "2-4 steps", keyPoints: "Posture, Connection, Precision" }
        ]
      },
      {
        id: "contemporary",
        name: "Contemporary",
        motions: [
          { id: "spiral", name: "Spiral", level: "Intermediate", description: "Contemporary spiral movement", duration: "4-8 seconds", keyPoints: "Fluidity, Core engagement, Spatial awareness" },
          { id: "floor-work", name: "Floor Work", level: "Advanced", description: "Contemporary floor movement", duration: "8-16 seconds", keyPoints: "Weight shifts, Momentum, Control" }
        ]
      },
      {
        id: "ballet",
        name: "Ballet",
        motions: [
          { id: "plie", name: "Plié", level: "Beginner", description: "Fundamental ballet knee bend", duration: "2-4 seconds", keyPoints: "Turnout, Alignment, Control" },
          { id: "arabesque", name: "Arabesque", level: "Intermediate", description: "Classic ballet balance pose", duration: "Hold 5-10s", keyPoints: "Line, Balance, Extension" }
        ]
      }
    ]
  },
  {
    id: "martial-arts",
    name: "Martial Arts",
    description: "Martial arts techniques and forms",
    subcategories: [
      {
        id: "striking",
        name: "Striking Techniques",
        motions: [
          { id: "jab", name: "Jab", level: "Beginner", description: "Basic boxing jab technique", duration: "0.5-1 second", keyPoints: "Straight line, Hip rotation, Quick return" },
          { id: "cross", name: "Cross", level: "Beginner", description: "Power cross punch", duration: "0.5-1 second", keyPoints: "Hip drive, Shoulder turn, Follow-through" },
          { id: "hook", name: "Hook", level: "Intermediate", description: "Boxing hook punch", duration: "0.5-1 second", keyPoints: "Circular motion, Elbow position, Body rotation" },
          { id: "uppercut", name: "Uppercut", level: "Intermediate", description: "Upward boxing punch", duration: "0.5-1 second", keyPoints: "Knee bend, Upward drive, Hip thrust" },
          { id: "overhand", name: "Overhand", level: "Advanced", description: "Looping overhand punch", duration: "0.5-1 second", keyPoints: "Arc motion, Shoulder over, Power generation" },
          { id: "backfist", name: "Backfist", level: "Intermediate", description: "Reverse knuckle strike", duration: "0.5-1 second", keyPoints: "Whipping motion, Back of hand, Snap back" },
          { id: "hammer-fist", name: "Hammer Fist", level: "Beginner", description: "Downward striking technique", duration: "0.5-1 second", keyPoints: "Bottom of fist, Downward arc, Full body weight" },
          { id: "horizontal-elbow", name: "Horizontal Elbow", level: "Intermediate", description: "Side elbow strike", duration: "0.5-1 second", keyPoints: "Hip rotation, Elbow point, Close range" },
          { id: "upward-elbow", name: "Upward Elbow", level: "Intermediate", description: "Rising elbow strike", duration: "0.5-1 second", keyPoints: "Drive upward, Hip thrust, Close distance" },
          { id: "downward-elbow", name: "Downward Elbow", level: "Advanced", description: "Downward elbow strike", duration: "0.5-1 second", keyPoints: "Overhead position, Downward drive, Full body weight" },
          { id: "front-kick", name: "Front Kick", level: "Beginner", description: "Straight forward kick", duration: "1-2 seconds", keyPoints: "Knee chamber, Hip drive, Ball of foot" },
          { id: "roundhouse", name: "Roundhouse Kick", level: "Intermediate", description: "Circular kicking technique", duration: "1-2 seconds", keyPoints: "Hip turn, Knee chamber, Snap through" },
          { id: "side-kick", name: "Side Kick", level: "Intermediate", description: "Lateral kicking technique", duration: "1-2 seconds", keyPoints: "Hip turn, Blade of foot, Chamber high" },
          { id: "back-kick", name: "Back Kick", level: "Advanced", description: "Reverse kicking technique", duration: "1-2 seconds", keyPoints: "Look back, Hip thrust, Heel strike" },
          { id: "axe-kick", name: "Axe Kick", level: "Advanced", description: "Downward chopping kick", duration: "1-2 seconds", keyPoints: "High chamber, Straight leg, Heel down" },
          { id: "crescent-kick", name: "Crescent Kick", level: "Intermediate", description: "Arcing kick technique", duration: "1-2 seconds", keyPoints: "Arc motion, Inside edge, Hip flexibility" },
          { id: "spinning-heel", name: "Spinning Heel Kick", level: "Expert", description: "Spinning back kick variation", duration: "1-2 seconds", keyPoints: "Spin timing, Hip turn, Heel contact" },
          { id: "straight-knee", name: "Straight Knee", level: "Beginner", description: "Direct knee strike", duration: "0.5-1 second", keyPoints: "Drive upward, Hip thrust, Clinch position" },
          { id: "diagonal-knee", name: "Diagonal Knee", level: "Intermediate", description: "Angled knee strike", duration: "0.5-1 second", keyPoints: "Angle entry, Hip rotation, Target ribs" },
          { id: "jumping-knee", name: "Jumping Knee", level: "Advanced", description: "Explosive jumping knee", duration: "1-2 seconds", keyPoints: "Jump timing, Knee drive, Landing control" }
        ]
      }
    ]
  },
  {
    id: "gymnastics",
    name: "Gymnastics",
    description: "Gymnastics skills and techniques",
    subcategories: [
      {
        id: "floor",
        name: "Floor Exercise",
        motions: [
          { id: "cartwheel", name: "Cartwheel", level: "Beginner", description: "Basic cartwheel technique", duration: "2-3 seconds", keyPoints: "Straight line, Hand placement, Leg extension" },
          { id: "handstand", name: "Handstand", level: "Advanced", description: "Freestanding handstand", duration: "Hold 10-30s", keyPoints: "Hollow body, Active shoulders, Balance" },
          { id: "back-handspring", name: "Back Handspring", level: "Intermediate", description: "Backward tumbling skill", duration: "1-2 seconds", keyPoints: "Sit back, Block, Snap down" },
          { id: "front-walkover", name: "Front Walkover", level: "Intermediate", description: "Forward flexibility skill", duration: "3-4 seconds", keyPoints: "Kick over, Bridge, Control" },
          { id: "back-tuck", name: "Back Tuck", level: "Advanced", description: "Backward somersault", duration: "1-2 seconds", keyPoints: "Set, Tuck, Spot landing" }
        ]
      },
      {
        id: "vault",
        name: "Vault",
        motions: [
          { id: "tsukahara", name: "Tsukahara", level: "Advanced", description: "Half turn vault", duration: "2-3 seconds", keyPoints: "Entry, Half turn, Salto" }
        ]
      },
      {
        id: "bars",
        name: "Bars",
        motions: [
          { id: "kip", name: "Kip", level: "Intermediate", description: "Cast to support", duration: "2-3 seconds", keyPoints: "Glide, Compression, Push away" },
          { id: "giant", name: "Giant", level: "Advanced", description: "Full circle around bar", duration: "2-3 seconds", keyPoints: "Tap, Hollow, Timing" }
        ]
      },
      {
        id: "beam",
        name: "Beam",
        motions: [
          { id: "split-leap", name: "Split Leap", level: "Intermediate", description: "Leap with split position", duration: "1-2 seconds", keyPoints: "Height, Split, Landing" }
        ]
      }
    ]
  },
  {
    id: "recovery",
    name: "Recovery",
    description: "Recovery and mobility exercises",
    subcategories: [
      {
        id: "physical-therapy",
        name: "Physical Therapy",
        motions: [
          { id: "glute-bridge", name: "Glute Bridge", level: "Beginner", description: "Hip extension strengthening", duration: "10-15 reps", keyPoints: "Squeeze glutes, Neutral spine, Controlled movement" },
          { id: "clamshells", name: "Clamshells", level: "Beginner", description: "Hip abductor strengthening", duration: "10-15 reps", keyPoints: "Side lying, Controlled opening, Stable pelvis" },
          { id: "bird-dog", name: "Bird Dog", level: "Beginner", description: "Core stability exercise", duration: "Hold 10-30s", keyPoints: "Opposite arm/leg, Stable spine, Controlled movement" },
          { id: "wall-slides", name: "Wall Slides", level: "Beginner", description: "Shoulder blade mobility", duration: "10-15 reps", keyPoints: "Back to wall, Smooth sliding, Full range" },
          { id: "heel-raises", name: "Heel Raises", level: "Beginner", description: "Calf strengthening", duration: "10-20 reps", keyPoints: "Rise on toes, Controlled descent, Balance" },
          { id: "side-steps", name: "Side Steps", level: "Beginner", description: "Hip abductor strengthening", duration: "10-15 steps", keyPoints: "Resistance band, Controlled steps, Stable posture" },
          { id: "marching", name: "Marching in Place", level: "Beginner", description: "Balance and coordination", duration: "30-60 seconds", keyPoints: "High knees, Stable core, Rhythmic movement" },
          { id: "single-leg-stand", name: "Single Leg Stand", level: "Intermediate", description: "Balance training", duration: "Hold 30-60s", keyPoints: "One foot, Stable core, Eyes forward" },
          { id: "step-ups", name: "Step-Ups", level: "Intermediate", description: "Functional leg strengthening", duration: "10-15 reps", keyPoints: "Full step up, Controlled descent, Stable platform" },
          { id: "resistance-rows", name: "Resistance Band Rows", level: "Beginner", description: "Upper back strengthening", duration: "10-15 reps", keyPoints: "Squeeze shoulder blades, Controlled pull, Stable posture" }
        ]
      },
      {
        id: "stretching",
        name: "Stretching",
        motions: [
          { id: "hip-flexor-stretch", name: "Hip Flexor Stretch", level: "Beginner", description: "Deep hip flexor mobility", duration: "Hold 30-60s", keyPoints: "Hip extension, Neutral pelvis, Gentle pressure" },
          { id: "hamstring-stretch", name: "Hamstring Stretch", level: "Beginner", description: "Posterior chain flexibility", duration: "Hold 30-60s", keyPoints: "Straight leg, Hip hinge, Gentle pull" },
          { id: "calf-stretch", name: "Calf Stretch", level: "Beginner", description: "Lower leg flexibility", duration: "Hold 30-60s", keyPoints: "Straight leg, Heel down, Wall support" },
          { id: "quad-stretch", name: "Quadriceps Stretch", level: "Beginner", description: "Front thigh flexibility", duration: "Hold 30-60s", keyPoints: "Heel to glute, Hip extension, Balance support" },
          { id: "shoulder-crossbody", name: "Shoulder Cross-Body Stretch", level: "Beginner", description: "Shoulder and upper back mobility", duration: "Hold 30-60s", keyPoints: "Arm across body, Gentle pull, Relaxed shoulders" }
        ]
      },
      {
        id: "mobility",
        name: "Mobility",
        motions: [
          { id: "thoracic-rotation", name: "Thoracic Spine Rotation", level: "Beginner", description: "Upper back mobility exercise", duration: "10-15 reps", keyPoints: "Controlled rotation, Stable hips, Full range" },
          { id: "hip-circles", name: "Hip Circles", level: "Beginner", description: "Hip joint mobility", duration: "10-15 circles", keyPoints: "Smooth circles, Full range, Both directions" },
          { id: "ankle-circles", name: "Ankle Circles", level: "Beginner", description: "Ankle joint mobility", duration: "10-15 circles", keyPoints: "Full circles, Point and flex, Both directions" },
          { id: "neck-rolls", name: "Neck Rolls", level: "Beginner", description: "Cervical spine mobility", duration: "5-10 rolls", keyPoints: "Slow movement, Gentle pressure, Avoid forcing" },
          { id: "arm-circles", name: "Arm Circles", level: "Beginner", description: "Shoulder joint mobility", duration: "10-15 circles", keyPoints: "Full circles, Controlled movement, Both directions" }
        ]
      }
    ]
  }
];
