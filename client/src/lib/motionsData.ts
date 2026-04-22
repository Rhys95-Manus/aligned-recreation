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

// All categories data — exactly 3 categories: Sports, Weightlifting, Recovery
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
          { id: "kb-row", name: "Kettlebell Row", level: "Beginner", description: "Single arm rowing movement", duration: "1-2 seconds", keyPoints: "Flat back, Elbow drive, Squeeze" }
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
          { id: "side-leg-raises", name: "Side Leg Raises", level: "Beginner", description: "Hip abductor strengthening", duration: "10-15 reps", keyPoints: "Side lying, Controlled lift, Stable core" },
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
