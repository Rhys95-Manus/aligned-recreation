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
        
        // Hips (23-24) - NEUTRAL STANCE
        createLandmark(baseX - 0.08, baseY + 0.05, 0), // Left hip
        createLandmark(baseX + 0.08, baseY + 0.05, 0), // Right hip
        
        // Knees (25-26)
        createLandmark(baseX - 0.08, baseY + 0.20, 0), // Left knee
        createLandmark(baseX + 0.08, baseY + 0.20, 0), // Right knee
        
        // Ankles (27-28)
        createLandmark(baseX - 0.09, baseY + 0.35, 0), // Left ankle
        createLandmark(baseX + 0.09, baseY + 0.35, 0), // Right ankle
        
        // Feet (29-32) - shoulder width apart
        createLandmark(baseX - 0.10, baseY + 0.37, 0.02, 0.88), // Left heel
        createLandmark(baseX - 0.10, baseY + 0.37, -0.04, 0.88), // Left toe
        createLandmark(baseX + 0.10, baseY + 0.37, 0.02, 0.88), // Right heel
        createLandmark(baseX + 0.10, baseY + 0.37, -0.04, 0.88), // Right toe
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
        
        // Hips - DRAMATIC rotation right (body coiling)
        createLandmark(baseX - 0.18, baseY + 0.08, -0.10), // Left hip FORWARD
        createLandmark(baseX + 0.02, baseY + 0.02, 0.10), // Right hip WAY BACK
        
        // Knees - right knee bends, weight loading back
        createLandmark(baseX - 0.15, baseY + 0.22, -0.06), // Left knee forward
        createLandmark(baseX + 0.03, baseY + 0.16, 0.08), // Right knee BENT and back
        
        // Ankles - feet planted wide
        createLandmark(baseX - 0.16, baseY + 0.34, -0.04), // Left ankle forward
        createLandmark(baseX + 0.04, baseY + 0.30, 0.06), // Right ankle back
        
        // Feet - WIDE STANCE, weight on back foot
        createLandmark(baseX - 0.18, baseY + 0.36, 0, 0.88), // Left heel forward
        createLandmark(baseX - 0.18, baseY + 0.36, -0.08, 0.88), // Left toe forward
        createLandmark(baseX + 0.06, baseY + 0.32, 0.10, 0.88), // Right heel back
        createLandmark(baseX + 0.06, baseY + 0.32, 0.04, 0.88), // Right toe back
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
        createLandmark(baseX - 0.15, baseY - 0.25, -0.08), // Left shoulder forward
        createLandmark(baseX + 0.15, baseY - 0.21, 0.15), // Right shoulder WAY back
        
        // Elbows - right elbow high and back (cocked position)
        createLandmark(baseX - 0.16, baseY - 0.14, -0.05), // Left elbow
        createLandmark(baseX + 0.25, baseY - 0.30, 0.25), // Right elbow HIGH and BACK
        
        // Wrists - right hand behind head (throwing position)
        createLandmark(baseX - 0.17, baseY - 0.02, -0.04), // Left wrist
        createLandmark(baseX + 0.20, baseY - 0.38, 0.20), // Right wrist BEHIND head
        
        // Hands
        ...Array(6).fill(null).map((_, i) => 
          createLandmark(baseX + (i < 3 ? -0.16 : 0.09), baseY + (i < 3 ? 0 : -0.37), i < 3 ? -0.02 : 0.11, 0.85)
        ),
        
        // Hips - MAXIMUM rotation (peak coil)
        createLandmark(baseX - 0.20, baseY + 0.09, -0.12), // Left hip MAXIMUM FORWARD
        createLandmark(baseX + 0.00, baseY + 0.01, 0.12), // Right hip MAXIMUM BACK
        
        // Knees - front knee bent, back leg LOADED
        createLandmark(baseX - 0.18, baseY + 0.20, -0.08), // Left knee bent forward
        createLandmark(baseX + 0.02, baseY + 0.14, 0.10), // Right knee LOADED back
        
        // Ankles - maximum separation
        createLandmark(baseX - 0.19, baseY + 0.32, -0.06), // Left ankle forward
        createLandmark(baseX + 0.03, baseY + 0.28, 0.08), // Right ankle back
        
        // Feet - MAXIMUM WIDE STANCE, all weight on back foot
        createLandmark(baseX - 0.22, baseY + 0.34, -0.02, 0.88), // Left heel forward
        createLandmark(baseX - 0.22, baseY + 0.34, -0.10, 0.88), // Left toe forward
        createLandmark(baseX + 0.05, baseY + 0.30, 0.12, 0.88), // Right heel back (loaded)
        createLandmark(baseX + 0.05, baseY + 0.30, 0.06, 0.88), // Right toe back
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
        
           // Hips - EXPLOSIVE rotation forward (uncoiling)
        createLandmark(baseX - 0.12, baseY + 0.06, -0.06), // Left hip rotating back
        createLandmark(baseX + 0.08, baseY + 0.04, 0.06), // Right hip DRIVING forward
        
        // Knees - weight TRANSFERRING forward explosively
        createLandmark(baseX - 0.14, baseY + 0.21, -0.04), // Left knee straightening
        createLandmark(baseX + 0.06, baseY + 0.18, 0.04), // Right knee driving
        
        // Ankles - weight shifting
        createLandmark(baseX - 0.15, baseY + 0.34, -0.02), // Left ankle
        createLandmark(baseX + 0.07, baseY + 0.32, 0.04), // Right ankle
        
        // Feet - weight MOVING forward
        createLandmark(baseX - 0.17, baseY + 0.36, -0.04, 0.88), // Left heel loading
        createLandmark(baseX - 0.17, baseY + 0.36, -0.08, 0.88), // Left toe
        createLandmark(baseX + 0.09, baseY + 0.34, 0.06, 0.88), // Right heel
        createLandmark(baseX + 0.09, baseY + 0.34, 0.02, 0.88), // Right toe
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
        createLandmark(baseX - 0.10, baseY - 0.23, 0.02), // Left shoulder
        createLandmark(baseX + 0.10, baseY - 0.23, -0.02), // Right shoulder forward
        
        // Elbows - right arm FULLY extended forward
        createLandmark(baseX - 0.13, baseY - 0.11, 0.01), // Left elbow
        createLandmark(baseX - 0.05, baseY - 0.28, -0.15), // Right elbow EXTENDED FORWARD
        
        // Wrists - right hand at release point FAR FORWARD
        createLandmark(baseX - 0.14, baseY + 0.01, 0.01), // Left wrist
        createLandmark(baseX - 0.15, baseY - 0.35, -0.25), // Right wrist FAR FORWARD
        
        // Hands
        ...Array(6).fill(null).map((_, i) => 
          createLandmark(baseX + (i < 3 ? -0.14 : 0.01), baseY + (i < 3 ? 0.03 : -0.34), i < 3 ? 0 : -0.13, 0.85)
        ),
        
        // Hips - SQUARE to target (rotation complete)
        createLandmark(baseX - 0.08, baseY + 0.05, -0.02), // Left hip
        createLandmark(baseX + 0.08, baseY + 0.05, 0.02), // Right hip
        
        // Knees - balanced, weight centered
        createLandmark(baseX - 0.10, baseY + 0.20, -0.02), // Left knee
        createLandmark(baseX + 0.08, baseY + 0.20, 0.02), // Right knee
        
        // Ankles - balanced
        createLandmark(baseX - 0.11, baseY + 0.35, -0.01), // Left ankle
        createLandmark(baseX + 0.09, baseY + 0.35, 0.01), // Right ankle
        
        // Feet - weight CENTERED
        createLandmark(baseX - 0.12, baseY + 0.37, -0.02, 0.88), // Left heel
        createLandmark(baseX - 0.12, baseY + 0.37, -0.06, 0.88), // Left toe
        createLandmark(baseX + 0.10, baseY + 0.37, 0.02, 0.88), // Right heel
        createLandmark(baseX + 0.10, baseY + 0.37, -0.02, 0.88), // Right toe
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
        
        // Hips - OVER-ROTATED left (follow-through)
        createLandmark(baseX - 0.02, baseY + 0.04, 0.10), // Left hip WAY BACK
        createLandmark(baseX + 0.18, baseY + 0.06, -0.10), // Right hip WAY FORWARD
        
        // Knees - weight on front leg
        createLandmark(baseX - 0.06, baseY + 0.22, 0.06), // Left knee back
        createLandmark(baseX + 0.14, baseY + 0.19, -0.04), // Right knee forward
        
        // Ankles - weight forward
        createLandmark(baseX - 0.05, baseY + 0.36, 0.04), // Left ankle back
        createLandmark(baseX + 0.16, baseY + 0.34, -0.02), // Right ankle forward
        
        // Feet - weight FULLY on front foot
        createLandmark(baseX - 0.04, baseY + 0.38, 0.02, 0.88), // Left heel back (light)
        createLandmark(baseX - 0.04, baseY + 0.38, -0.04, 0.88), // Left toe back
        createLandmark(baseX + 0.18, baseY + 0.36, -0.04, 0.88), // Right heel forward (loaded)
        createLandmark(baseX + 0.18, baseY + 0.36, -0.08, 0.88), // Right toe forward
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
  // Debug logging
  if (progress === 0 || Math.abs(progress - 0.55) < 0.01) {
    console.log(`🎯 Progress: ${progress.toFixed(2)} (${progress < 0.2 ? 'Neutral' : progress < 0.45 ? 'Wind-up' : progress < 0.65 ? 'COCKING' : progress < 0.78 ? 'Acceleration' : progress < 0.88 ? 'RELEASE' : 'Follow-through'})`);
  }
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
  
  const result = interpolateLandmarks(kf1, kf2, easedT);
  
  // Comprehensive debug logging every 10 frames
  if (result.length >= 33 && Math.random() < 0.1) { // 10% sample rate
    console.log(`\n🎬 Frame Progress: ${progress.toFixed(3)} (${progress < 0.2 ? 'Neutral' : progress < 0.45 ? 'Wind-up' : progress < 0.65 ? 'Cocking' : progress < 0.78 ? 'Acceleration' : progress < 0.88 ? 'Release' : 'Follow-through'})`);
    console.log('👤 FULL BODY POSITIONS:');
    console.log('  💪 Arms:');
    console.log('    L Shoulder (11):', result[11].x.toFixed(3), result[11].y.toFixed(3), 'z:', result[11].z.toFixed(3));
    console.log('    R Shoulder (12):', result[12].x.toFixed(3), result[12].y.toFixed(3), 'z:', result[12].z.toFixed(3));
    console.log('    L Elbow (13):', result[13].x.toFixed(3), result[13].y.toFixed(3), 'z:', result[13].z.toFixed(3));
    console.log('    R Elbow (14):', result[14].x.toFixed(3), result[14].y.toFixed(3), 'z:', result[14].z.toFixed(3));
    console.log('  🦴 Hips:');
    console.log('    L Hip (23):', result[23].x.toFixed(3), result[23].y.toFixed(3), 'z:', result[23].z.toFixed(3));
    console.log('    R Hip (24):', result[24].x.toFixed(3), result[24].y.toFixed(3), 'z:', result[24].z.toFixed(3));
    console.log('  🦵 Legs:');
    console.log('    L Knee (25):', result[25].x.toFixed(3), result[25].y.toFixed(3), 'z:', result[25].z.toFixed(3));
    console.log('    R Knee (26):', result[26].x.toFixed(3), result[26].y.toFixed(3), 'z:', result[26].z.toFixed(3));
    console.log('    L Ankle (27):', result[27].x.toFixed(3), result[27].y.toFixed(3), 'z:', result[27].z.toFixed(3));
    console.log('    R Ankle (28):', result[28].x.toFixed(3), result[28].y.toFixed(3), 'z:', result[28].z.toFixed(3));
  }
  
  return result;
}

/**
 * Easing function for smooth interpolation
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

