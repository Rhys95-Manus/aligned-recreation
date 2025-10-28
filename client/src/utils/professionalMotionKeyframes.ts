/**
 * Keyframe-based professional quarterback throwing motion
 * Defines realistic poses for each phase of a throw
 */

export interface Keyframe {
  phase: string;
  progress: number; // 0.0 to 1.0
  landmarks: any[];
}

/**
 * Create a single landmark with proper typing
 */
function createLandmark(x: number, y: number, z: number, visibility: number = 0.95) {
  return { x, y, z, visibility };
}

/**
 * Define keyframe poses for a professional quarterback throw
 * All coordinates are normalized (0-1 range)
 * Origin is center of canvas (0.5, 0.5)
 */
export function createThrowingKeyframes(): Keyframe[] {
  const baseX = 0.5;
  const baseY = 0.5;
  
  return [
    // KEYFRAME 1: Neutral Stance (0-15%)
    {
      phase: "Neutral",
      progress: 0.0,
      landmarks: [
        // Face (0-10) - head upright, looking forward
        ...Array(11).fill(null).map((_, i) => 
          createLandmark(baseX + (i % 3 - 1) * 0.015, baseY - 0.35, -0.05)
        ),
        
        // Shoulders (11-12)
        createLandmark(baseX - 0.09, baseY - 0.23, 0), // Left shoulder
        createLandmark(baseX + 0.09, baseY - 0.23, 0), // Right shoulder
        
        // Elbows (13-14)
        createLandmark(baseX - 0.12, baseY - 0.10, -0.02), // Left elbow
        createLandmark(baseX + 0.12, baseY - 0.10, -0.02), // Right elbow
        
        // Wrists (15-16)
        createLandmark(baseX - 0.13, baseY + 0.02, -0.01), // Left wrist
        createLandmark(baseX + 0.13, baseY + 0.02, -0.01), // Right wrist
        
        // Hands (17-22)
        ...Array(6).fill(null).map((_, i) => 
          createLandmark(baseX + (i < 3 ? -0.14 : 0.14), baseY + 0.04, 0, 0.85)
        ),
        
        // Hips (23-24)
        createLandmark(baseX - 0.07, baseY + 0.05, 0), // Left hip
        createLandmark(baseX + 0.07, baseY + 0.05, 0), // Right hip
        
        // Knees (25-26)
        createLandmark(baseX - 0.07, baseY + 0.20, 0), // Left knee
        createLandmark(baseX + 0.07, baseY + 0.20, 0), // Right knee
        
        // Ankles (27-28)
        createLandmark(baseX - 0.07, baseY + 0.35, 0), // Left ankle
        createLandmark(baseX + 0.07, baseY + 0.35, 0), // Right ankle
        
        // Feet (29-32)
        createLandmark(baseX - 0.09, baseY + 0.37, 0.03, 0.88), // Left heel
        createLandmark(baseX - 0.09, baseY + 0.37, -0.03, 0.88), // Left toe
        createLandmark(baseX + 0.09, baseY + 0.37, 0.03, 0.88), // Right heel
        createLandmark(baseX + 0.09, baseY + 0.37, -0.03, 0.88), // Right toe
      ]
    },
    
    // KEYFRAME 2: Wind-up (35%)
    {
      phase: "Wind-up",
      progress: 0.35,
      landmarks: [
        // Face - head turns slightly right
        ...Array(11).fill(null).map((_, i) => 
          createLandmark(baseX + 0.02 + (i % 3 - 1) * 0.015, baseY - 0.36, -0.03)
        ),
        
        // Shoulders - rotate back
        createLandmark(baseX - 0.10, baseY - 0.24, -0.04), // Left shoulder forward
        createLandmark(baseX + 0.08, baseY - 0.22, 0.04), // Right shoulder back
        
        // Elbows - right arm starts back
        createLandmark(baseX - 0.13, baseY - 0.12, -0.03), // Left elbow
        createLandmark(baseX + 0.15, baseY - 0.15, 0.08), // Right elbow back and up
        
        // Wrists
        createLandmark(baseX - 0.14, baseY, -0.02), // Left wrist
        createLandmark(baseX + 0.18, baseY - 0.20, 0.12), // Right wrist back
        
        // Hands
        ...Array(6).fill(null).map((_, i) => 
          createLandmark(baseX + (i < 3 ? -0.15 : 0.19), baseY + (i < 3 ? 0.02 : -0.22), i < 3 ? -0.01 : 0.13, 0.85)
        ),
        
        // Hips - rotate right
        createLandmark(baseX - 0.08, baseY + 0.06, -0.05), // Left hip forward
        createLandmark(baseX + 0.06, baseY + 0.04, 0.05), // Right hip back
        
        // Knees - right knee bends
        createLandmark(baseX - 0.08, baseY + 0.21, -0.03), // Left knee
        createLandmark(baseX + 0.06, baseY + 0.18, 0.04), // Right knee bent
        
        // Ankles
        createLandmark(baseX - 0.09, baseY + 0.35, -0.02), // Left ankle
        createLandmark(baseX + 0.06, baseY + 0.33, 0.03), // Right ankle
        
        // Feet - weight shifting back
        createLandmark(baseX - 0.11, baseY + 0.37, 0.02, 0.88),
        createLandmark(baseX - 0.11, baseY + 0.37, -0.04, 0.88),
        createLandmark(baseX + 0.08, baseY + 0.35, 0.05, 0.88),
        createLandmark(baseX + 0.08, baseY + 0.35, 0, 0.88),
      ]
    },
    
    // KEYFRAME 3: Cocking (55%) - Maximum arm back position
    {
      phase: "Cocking",
      progress: 0.55,
      landmarks: [
        // Face - head rotated right, looking at target
        ...Array(11).fill(null).map((_, i) => 
          createLandmark(baseX + 0.03 + (i % 3 - 1) * 0.015, baseY - 0.37, 0)
        ),
        
        // Shoulders - maximum rotation
        createLandmark(baseX - 0.12, baseY - 0.25, -0.06), // Left shoulder forward
        createLandmark(baseX + 0.06, baseY - 0.21, 0.08), // Right shoulder way back
        
        // Elbows - right elbow high and back (cocked position)
        createLandmark(baseX - 0.14, baseY - 0.14, -0.04), // Left elbow
        createLandmark(baseX + 0.12, baseY - 0.28, 0.15), // Right elbow high and back
        
        // Wrists - right hand behind head
        createLandmark(baseX - 0.15, baseY - 0.02, -0.03), // Left wrist
        createLandmark(baseX + 0.08, baseY - 0.35, 0.10), // Right wrist behind head
        
        // Hands
        ...Array(6).fill(null).map((_, i) => 
          createLandmark(baseX + (i < 3 ? -0.16 : 0.09), baseY + (i < 3 ? 0 : -0.37), i < 3 ? -0.02 : 0.11, 0.85)
        ),
        
        // Hips - maximum rotation
        createLandmark(baseX - 0.09, baseY + 0.07, -0.08), // Left hip forward
        createLandmark(baseX + 0.05, baseY + 0.03, 0.08), // Right hip back
        
        // Knees - front knee bent, back leg loaded
        createLandmark(baseX - 0.10, baseY + 0.19, -0.05), // Left knee bent
        createLandmark(baseX + 0.05, baseY + 0.16, 0.06), // Right knee loaded
        
        // Ankles
        createLandmark(baseX - 0.11, baseY + 0.33, -0.04), // Left ankle
        createLandmark(baseX + 0.05, baseY + 0.31, 0.05), // Right ankle
        
        // Feet - weight on back foot
        createLandmark(baseX - 0.13, baseY + 0.35, 0, 0.88),
        createLandmark(baseX - 0.13, baseY + 0.35, -0.06, 0.88),
        createLandmark(baseX + 0.07, baseY + 0.33, 0.07, 0.88),
        createLandmark(baseX + 0.07, baseY + 0.33, 0.02, 0.88),
      ]
    },
    
    // KEYFRAME 4: Acceleration (70%) - Hips rotating forward, arm coming through
    {
      phase: "Acceleration",
      progress: 0.70,
      landmarks: [
        // Face - head forward, eyes on target
        ...Array(11).fill(null).map((_, i) => 
          createLandmark(baseX + (i % 3 - 1) * 0.015, baseY - 0.36, -0.02)
        ),
        
        // Shoulders - rotating forward
        createLandmark(baseX - 0.10, baseY - 0.24, -0.02), // Left shoulder
        createLandmark(baseX + 0.08, baseY - 0.23, 0.02), // Right shoulder coming forward
        
        // Elbows - right arm whipping forward
        createLandmark(baseX - 0.13, baseY - 0.13, -0.02), // Left elbow
        createLandmark(baseX + 0.14, baseY - 0.20, 0.06), // Right elbow forward
        
        // Wrists - right hand coming forward
        createLandmark(baseX - 0.14, baseY, -0.01), // Left wrist
        createLandmark(baseX + 0.18, baseY - 0.25, 0.08), // Right wrist forward
        
        // Hands
        ...Array(6).fill(null).map((_, i) => 
          createLandmark(baseX + (i < 3 ? -0.15 : 0.20), baseY + (i < 3 ? 0.02 : -0.27), i < 3 ? 0 : 0.09, 0.85)
        ),
        
        // Hips - rotating forward
        createLandmark(baseX - 0.08, baseY + 0.06, -0.03), // Left hip
        createLandmark(baseX + 0.06, baseY + 0.04, 0.03), // Right hip forward
        
        // Knees - front leg extending
        createLandmark(baseX - 0.09, baseY + 0.20, -0.02), // Left knee extending
        createLandmark(baseX + 0.06, baseY + 0.18, 0.02), // Right knee
        
        // Ankles
        createLandmark(baseX - 0.09, baseY + 0.34, -0.01), // Left ankle
        createLandmark(baseX + 0.06, baseY + 0.33, 0.02), // Right ankle
        
        // Feet - weight transferring forward
        createLandmark(baseX - 0.11, baseY + 0.36, -0.02, 0.88),
        createLandmark(baseX - 0.11, baseY + 0.36, -0.06, 0.88),
        createLandmark(baseX + 0.08, baseY + 0.35, 0.03, 0.88),
        createLandmark(baseX + 0.08, baseY + 0.35, 0, 0.88),
      ]
    },
    
    // KEYFRAME 5: Release (82%) - Arm fully extended forward
    {
      phase: "Release",
      progress: 0.82,
      landmarks: [
        // Face - head following through
        ...Array(11).fill(null).map((_, i) => 
          createLandmark(baseX - 0.01 + (i % 3 - 1) * 0.015, baseY - 0.35, -0.03)
        ),
        
        // Shoulders - square to target
        createLandmark(baseX - 0.09, baseY - 0.23, 0), // Left shoulder
        createLandmark(baseX + 0.09, baseY - 0.23, 0), // Right shoulder
        
        // Elbows - right arm extended
        createLandmark(baseX - 0.12, baseY - 0.11, 0), // Left elbow
        createLandmark(baseX + 0.05, baseY - 0.25, -0.08), // Right elbow extended forward
        
        // Wrists - right hand at release point
        createLandmark(baseX - 0.13, baseY + 0.01, 0), // Left wrist
        createLandmark(baseX + 0.02, baseY - 0.32, -0.12), // Right wrist extended
        
        // Hands
        ...Array(6).fill(null).map((_, i) => 
          createLandmark(baseX + (i < 3 ? -0.14 : 0.01), baseY + (i < 3 ? 0.03 : -0.34), i < 3 ? 0 : -0.13, 0.85)
        ),
        
        // Hips - square, weight forward
        createLandmark(baseX - 0.07, baseY + 0.05, 0), // Left hip
        createLandmark(baseX + 0.07, baseY + 0.05, 0), // Right hip
        
        // Knees - front leg straight, back leg pushing
        createLandmark(baseX - 0.08, baseY + 0.21, 0), // Left knee straight
        createLandmark(baseX + 0.07, baseY + 0.20, 0.02), // Right knee
        
        // Ankles
        createLandmark(baseX - 0.08, baseY + 0.35, 0), // Left ankle
        createLandmark(baseX + 0.07, baseY + 0.35, 0.01), // Right ankle
        
        // Feet - weight on front foot
        createLandmark(baseX - 0.10, baseY + 0.37, -0.03, 0.88),
        createLandmark(baseX - 0.10, baseY + 0.37, -0.07, 0.88),
        createLandmark(baseX + 0.09, baseY + 0.37, 0.02, 0.88),
        createLandmark(baseX + 0.09, baseY + 0.37, -0.01, 0.88),
      ]
    },
    
    // KEYFRAME 6: Follow-through (100%) - Arm across body
    {
      phase: "Follow-through",
      progress: 1.0,
      landmarks: [
        // Face - head turned left following arm
        ...Array(11).fill(null).map((_, i) => 
          createLandmark(baseX - 0.02 + (i % 3 - 1) * 0.015, baseY - 0.34, -0.04)
        ),
        
        // Shoulders - rotated left
        createLandmark(baseX - 0.08, baseY - 0.22, 0.04), // Left shoulder back
        createLandmark(baseX + 0.10, baseY - 0.24, -0.04), // Right shoulder forward
        
        // Elbows - right arm across body
        createLandmark(baseX - 0.10, baseY - 0.10, 0.02), // Left elbow
        createLandmark(baseX - 0.05, baseY - 0.15, -0.08), // Right elbow across body
        
        // Wrists - right hand across left side
        createLandmark(baseX - 0.11, baseY + 0.02, 0.01), // Left wrist
        createLandmark(baseX - 0.12, baseY - 0.08, -0.10), // Right wrist across
        
        // Hands
        ...Array(6).fill(null).map((_, i) => 
          createLandmark(baseX + (i < 3 ? -0.12 : -0.14), baseY + (i < 3 ? 0.04 : -0.06), i < 3 ? 0.01 : -0.11, 0.85)
        ),
        
        // Hips - rotated left
        createLandmark(baseX - 0.06, baseY + 0.04, 0.05), // Left hip back
        createLandmark(baseX + 0.08, baseY + 0.06, -0.05), // Right hip forward
        
        // Knees - balanced
        createLandmark(baseX - 0.07, baseY + 0.20, 0.03), // Left knee
        createLandmark(baseX + 0.08, baseY + 0.21, -0.02), // Right knee
        
        // Ankles
        createLandmark(baseX - 0.07, baseY + 0.35, 0.02), // Left ankle
        createLandmark(baseX + 0.09, baseY + 0.36, -0.01), // Right ankle
        
        // Feet - weight fully forward
        createLandmark(baseX - 0.09, baseY + 0.37, 0, 0.88),
        createLandmark(baseX - 0.09, baseY + 0.37, -0.05, 0.88),
        createLandmark(baseX + 0.11, baseY + 0.38, -0.02, 0.88),
        createLandmark(baseX + 0.11, baseY + 0.38, -0.05, 0.88),
      ]
    }
  ];
}

/**
 * Interpolate between two keyframes
 */
function interpolateLandmarks(kf1: Keyframe, kf2: Keyframe, t: number): any[] {
  const landmarks = [];
  
  for (let i = 0; i < 33; i++) {
    const lm1 = kf1.landmarks[i];
    const lm2 = kf2.landmarks[i];
    
    landmarks.push({
      x: lm1.x + (lm2.x - lm1.x) * t,
      y: lm1.y + (lm2.y - lm1.y) * t,
      z: lm1.z + (lm2.z - lm1.z) * t,
      visibility: lm1.visibility
    });
  }
  
  return landmarks;
}

/**
 * Get landmarks for a specific progress through the motion (0-1)
 */
export function getLandmarksAtProgress(progress: number): any[] {
  const keyframes = createThrowingKeyframes();
  
  // Clamp progress
  progress = Math.max(0, Math.min(1, progress));
  
  // Find the two keyframes to interpolate between
  let kf1 = keyframes[0];
  let kf2 = keyframes[1];
  
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (progress >= keyframes[i].progress && progress <= keyframes[i + 1].progress) {
      kf1 = keyframes[i];
      kf2 = keyframes[i + 1];
      break;
    }
  }
  
  // Calculate interpolation factor
  const range = kf2.progress - kf1.progress;
  const t = range > 0 ? (progress - kf1.progress) / range : 0;
  
  // Apply easing for smooth motion
  const easedT = easeInOutCubic(t);
  
  return interpolateLandmarks(kf1, kf2, easedT);
}

/**
 * Easing function for smooth interpolation
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

