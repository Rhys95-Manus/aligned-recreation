/**
 * Keyframe-based professional quarterback throwing motion
 * Based on proper biomechanics research: z-axis → x-axis → z-axis rotation
 * Hip-shoulder separation creates torque during acceleration phase
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
 * Professional QB Throwing Keyframes - Biomechanically Accurate
 * 
 * Rotation Sequence (Right-Handed QB):
 * - Neutral: Hips & shoulders on z-axis (facing target, z ≈ 0)
 * - Wind-up: Begin rotation to x-axis (~45° rotation)
 * - Cocking: Maximum x-axis rotation (~90°, perpendicular to target)
 *   * Left side FORWARD (z < 0), Right side BACK (z > 0)
 * - Acceleration: Hips rotate FIRST back to z-axis, shoulders lag (torque!)
 * - Release: Both square to target (z-axis, z ≈ 0)
 * - Follow-through: Continue past z-axis
 */
export function createThrowingKeyframes(): Keyframe[] {
  const baseX = 0.5;
  const baseY = 0.5;
  
  return [
    // ============================================================
    // KEYFRAME 1: NEUTRAL STANCE (0%) - Loading Phase
    // Hips and shoulders aligned on z-axis, facing target
    // Weight balanced, ready position
    // ============================================================
    {
      phase: "Neutral",
      progress: 0.0,
      landmarks: [
        // Face (0-10) - head upright, eyes on target
        ...Array(11).fill(null).map((_, i) => 
          createLandmark(baseX + (i % 3 - 1) * 0.015, baseY - 0.35, -0.05)
        ),
        
        // Shoulders (11-12) - SQUARE TO TARGET (z ≈ 0)
        createLandmark(baseX - 0.09, baseY - 0.23, -0.01), // Left shoulder
        createLandmark(baseX + 0.09, baseY - 0.23, 0.01), // Right shoulder
        
        // Elbows (13-14) - arms relaxed
        createLandmark(baseX - 0.12, baseY - 0.10, -0.02), // Left elbow
        createLandmark(baseX + 0.12, baseY - 0.08, 0.02), // Right elbow (ball in hand)
        
        // Wrists (15-16)
        createLandmark(baseX - 0.13, baseY + 0.02, -0.01), // Left wrist
        createLandmark(baseX + 0.10, baseY + 0.02, 0.03), // Right wrist (holding ball)
        
        // Hands (17-22)
        ...Array(6).fill(null).map((_, i) => 
          createLandmark(baseX + (i < 3 ? -0.14 : 0.11), baseY + 0.04, i < 3 ? 0 : 0.04, 0.85)
        ),
        
        // Hips (23-24) - SQUARE TO TARGET (z ≈ 0)
        createLandmark(baseX - 0.08, baseY + 0.05, -0.01), // Left hip
        createLandmark(baseX + 0.08, baseY + 0.05, 0.01), // Right hip
        
        // Knees (25-26) - slight bend
        createLandmark(baseX - 0.08, baseY + 0.20, -0.01), // Left knee
        createLandmark(baseX + 0.08, baseY + 0.20, 0.01), // Right knee
        
        // Ankles (27-28)
        createLandmark(baseX - 0.09, baseY + 0.35, 0), // Left ankle
        createLandmark(baseX + 0.09, baseY + 0.35, 0), // Right ankle
        
        // Feet (29-32) - shoulder width, both pointing forward
        createLandmark(baseX - 0.10, baseY + 0.37, 0.02, 0.88), // Left heel
        createLandmark(baseX - 0.10, baseY + 0.37, -0.04, 0.88), // Left toe
        createLandmark(baseX + 0.10, baseY + 0.37, 0.02, 0.88), // Right heel
        createLandmark(baseX + 0.10, baseY + 0.37, -0.04, 0.88), // Right toe
      ]
    },
    
    // ============================================================
    // KEYFRAME 2: WIND-UP (35%) - Early Arm-Cocking Phase
    // Begin rotation toward x-axis (~45° rotation)
    // Left side starts moving FORWARD, right side starts moving BACK
    // Weight shifts to back foot
    // ============================================================
    {
      phase: "Wind-up",
      progress: 0.35,
      landmarks: [
        // Face - head turns with body
        ...Array(11).fill(null).map((_, i) => 
          createLandmark(baseX + 0.02 + (i % 3 - 1) * 0.015, baseY - 0.36, -0.02)
        ),
        
        // Shoulders - BEGIN ROTATION (~45°)
        // Left forward (z < 0), Right back (z > 0)
        createLandmark(baseX - 0.09, baseY - 0.22, -0.10), // Left shoulder FORWARD
        createLandmark(baseX + 0.09, baseY - 0.22, 0.10), // Right shoulder BACK
        
        // Elbows - right arm rises, begins external rotation
        createLandmark(baseX - 0.13, baseY - 0.12, -0.06), // Left elbow forward
        createLandmark(baseX + 0.13, baseY - 0.18, 0.12), // Right elbow BACK and UP
        
        // Wrists - right hand at ear level
        createLandmark(baseX - 0.14, baseY, -0.04), // Left wrist
        createLandmark(baseX + 0.14, baseY - 0.22, 0.15), // Right wrist BACK
        
        // Hands
        ...Array(6).fill(null).map((_, i) => 
          createLandmark(baseX + (i < 3 ? -0.15 : 0.15), baseY + (i < 3 ? 0.02 : -0.24), i < 3 ? -0.03 : 0.16, 0.85)
        ),
        
        // Hips - BEGIN ROTATION (~45°)
        // Left forward (z < 0), Right back (z > 0)
        createLandmark(baseX - 0.12, baseY + 0.06, -0.10), // Left hip FORWARD
        createLandmark(baseX + 0.04, baseY + 0.04, 0.10), // Right hip BACK
        
        // Knees - right knee bends, weight loading
        // Z-rotation MATCHES hips: -0.10 left, +0.10 right
        createLandmark(baseX - 0.11, baseY + 0.21, -0.10), // Left knee forward
        createLandmark(baseX + 0.05, baseY + 0.18, 0.10), // Right knee BENT, back
        
        // Ankles - Z-rotation MATCHES hips: -0.10 left, +0.10 right
        createLandmark(baseX - 0.12, baseY + 0.34, -0.10), // Left ankle forward
        createLandmark(baseX + 0.06, baseY + 0.32, 0.10), // Right ankle back
        
        // Feet - weight shifting to back foot
        // Z-rotation MATCHES hips: -0.10 left, +0.10 right
        createLandmark(baseX - 0.14, baseY + 0.36, -0.10, 0.88), // Left heel forward
        createLandmark(baseX - 0.14, baseY + 0.36, -0.15, 0.88), // Left toe forward
        createLandmark(baseX + 0.08, baseY + 0.34, 0.10, 0.88), // Right heel BACK (loaded)
        createLandmark(baseX + 0.08, baseY + 0.34, 0.05, 0.88), // Right toe back
      ]
    },
    
    // ============================================================
    // KEYFRAME 3: COCKING (55%) - Maximum External Rotation
    // MAXIMUM x-axis rotation (~90°, perpendicular to target)
    // Left side MAXIMUM FORWARD, right side MAXIMUM BACK
    // "Layback" position - arm at maximum external rotation
    // Weight fully on back foot
    // ============================================================
    {
      phase: "Cocking",
      progress: 0.55,
      landmarks: [
        // Face - head turned with shoulders
        ...Array(11).fill(null).map((_, i) => 
          createLandmark(baseX + 0.03 + (i % 3 - 1) * 0.015, baseY - 0.37, 0)
        ),
        
        // Shoulders - MAXIMUM ROTATION (~90°, perpendicular)
        // Left MAXIMUM forward (z << 0), Right MAXIMUM back (z >> 0)
        // Torso length = 0.28, shoulder width = 0.18
        createLandmark(baseX - 0.09, baseY - 0.22, -0.14), // Left shoulder MAXIMUM FORWARD
        createLandmark(baseX + 0.09, baseY - 0.22, 0.14), // Right shoulder MAXIMUM BACK
        
        // Elbows - right elbow high, maximum layback
        createLandmark(baseX - 0.14, baseY - 0.13, -0.12), // Left elbow forward
        createLandmark(baseX + 0.10, baseY - 0.28, 0.18), // Right elbow MAXIMUM BACK, HIGH
        
        // Wrists - maximum external rotation
        createLandmark(baseX - 0.15, baseY - 0.01, -0.10), // Left wrist
        createLandmark(baseX + 0.08, baseY - 0.35, 0.20), // Right wrist MAXIMUM BACK
        
        // Hands
        ...Array(6).fill(null).map((_, i) => 
          createLandmark(baseX + (i < 3 ? -0.16 : 0.09), baseY + (i < 3 ? 0 : -0.37), i < 3 ? -0.09 : 0.21, 0.85)
        ),
        
        // Hips - MAXIMUM ROTATION (~90°, perpendicular)
        // Left MAXIMUM forward, Right MAXIMUM back
        createLandmark(baseX - 0.08, baseY + 0.06, -0.14), // Left hip MAXIMUM FORWARD
        createLandmark(baseX + 0.08, baseY + 0.06, 0.14), // Right hip MAXIMUM BACK
        
        // Knees - back leg loaded, front leg planted
        // Z-rotation MATCHES hips: -0.14 left, +0.14 right
        createLandmark(baseX - 0.15, baseY + 0.22, -0.14), // Left knee forward
        createLandmark(baseX + 0.02, baseY + 0.16, 0.14), // Right knee MAXIMUM BENT, loaded
        
        // Ankles - Z-rotation MATCHES hips: -0.14 left, +0.14 right
        createLandmark(baseX - 0.16, baseY + 0.33, -0.14), // Left ankle forward
        createLandmark(baseX + 0.03, baseY + 0.30, 0.14), // Right ankle back
        
        // Feet - weight FULLY on back foot
        // Z-rotation MATCHES hips: -0.14 left, +0.14 right
        createLandmark(baseX - 0.18, baseY + 0.35, -0.14, 0.88), // Left heel forward (light)
        createLandmark(baseX - 0.18, baseY + 0.35, -0.20, 0.88), // Left toe forward
        createLandmark(baseX + 0.05, baseY + 0.32, 0.14, 0.88), // Right heel MAXIMUM LOADED
        createLandmark(baseX + 0.05, baseY + 0.32, 0.08, 0.88), // Right toe back
      ]
    },
    
    // ============================================================
    // KEYFRAME 4: ACCELERATION (70%) - Hip-Shoulder Separation
    // HIPS rotate FIRST back toward z-axis (explosive)
    // SHOULDERS still rotated (lag behind) - creates TORQUE!
    // This separation is KEY for power generation
    // Weight transfers from back to front
    // ============================================================
    {
      phase: "Acceleration",
      progress: 0.70,
      landmarks: [
        // Face - head starts turning back to target
        ...Array(11).fill(null).map((_, i) => 
          createLandmark(baseX + 0.01 + (i % 3 - 1) * 0.015, baseY - 0.36, -0.03)
        ),
        
        // Shoulders - STILL ROTATED (lagging behind hips)
        // Still ~60° rotated while hips are ~30° = SEPARATION!
        // Torso length = 0.28, shoulder width = 0.18
        createLandmark(baseX - 0.09, baseY - 0.22, -0.10), // Left shoulder still forward
        createLandmark(baseX + 0.09, baseY - 0.22, 0.10), // Right shoulder still back
        
        // Elbows - right elbow drives forward
        createLandmark(baseX - 0.13, baseY - 0.12, -0.08), // Left elbow
        createLandmark(baseX + 0.08, baseY - 0.25, 0.12), // Right elbow driving forward
        
        // Wrists - arm accelerating
        createLandmark(baseX - 0.14, baseY, -0.06), // Left wrist
        createLandmark(baseX + 0.05, baseY - 0.30, 0.10), // Right wrist accelerating
        
        // Hands
        ...Array(6).fill(null).map((_, i) => 
          createLandmark(baseX + (i < 3 ? -0.15 : 0.06), baseY + (i < 3 ? 0.02 : -0.32), i < 3 ? -0.05 : 0.11, 0.85)
        ),
        
        // Hips - ROTATING BACK TO Z-AXIS (explosive, leading shoulders)
        // Hips at ~30° while shoulders still at ~60° = SEPARATION!
        createLandmark(baseX - 0.10, baseY + 0.06, -0.06), // Left hip rotating back
        createLandmark(baseX + 0.06, baseY + 0.04, 0.06), // Right hip driving forward
        
        // Knees - explosive leg drive, weight transferring
        // Z-rotation MATCHES hips: -0.06 left, +0.06 right
        createLandmark(baseX - 0.12, baseY + 0.21, -0.06), // Left knee straightening
        createLandmark(baseX + 0.05, baseY + 0.18, 0.06), // Right knee driving
        
        // Ankles - weight shifting forward
        // Z-rotation MATCHES hips: -0.06 left, +0.06 right
        createLandmark(baseX - 0.13, baseY + 0.34, -0.06), // Left ankle
        createLandmark(baseX + 0.06, baseY + 0.32, 0.06), // Right ankle
        
        // Feet - weight TRANSFERRING from back to front
        // Z-rotation MATCHES hips: -0.06 left, +0.06 right
        createLandmark(baseX - 0.15, baseY + 0.36, -0.06, 0.88), // Left heel loading
        createLandmark(baseX - 0.15, baseY + 0.36, -0.11, 0.88), // Left toe
        createLandmark(baseX + 0.08, baseY + 0.34, 0.06, 0.88), // Right heel unloading
        createLandmark(baseX + 0.08, baseY + 0.34, 0.01, 0.88), // Right toe
      ]
    },
    
    // ============================================================
    // KEYFRAME 5: RELEASE (82%) - Square to Target
    // Hips AND shoulders SQUARE to target (z-axis, z ≈ 0)
    // Arm fully extended forward
    // Weight centered/forward
    // Ball release point
    // ============================================================
    {
      phase: "Release",
      progress: 0.82,
      landmarks: [
        // Face - eyes locked on target
        ...Array(11).fill(null).map((_, i) => 
          createLandmark(baseX + (i % 3 - 1) * 0.015, baseY - 0.35, -0.05)
        ),
        
        // Shoulders - SQUARE TO TARGET (z ≈ 0)
        // Torso length = 0.28, shoulder width = 0.18
        createLandmark(baseX - 0.09, baseY - 0.22, -0.02), // Left shoulder
        createLandmark(baseX + 0.09, baseY - 0.22, 0.02), // Right shoulder
        
        // Elbows - right arm FULLY EXTENDED
        createLandmark(baseX - 0.12, baseY - 0.10, -0.01), // Left elbow
        createLandmark(baseX + 0.02, baseY - 0.30, -0.15), // Right elbow EXTENDED FORWARD
        
        // Wrists - release point FAR FORWARD
        createLandmark(baseX - 0.13, baseY + 0.02, 0), // Left wrist
        createLandmark(baseX - 0.05, baseY - 0.38, -0.22), // Right wrist MAXIMUM FORWARD
        
        // Hands - ball released
        ...Array(6).fill(null).map((_, i) => 
          createLandmark(baseX + (i < 3 ? -0.14 : -0.06), baseY + (i < 3 ? 0.04 : -0.40), i < 3 ? 0 : -0.23, 0.85)
        ),
        
        // Hips - SQUARE TO TARGET (z ≈ 0)
        createLandmark(baseX - 0.08, baseY + 0.06, -0.02), // Left hip
        createLandmark(baseX + 0.08, baseY + 0.06, 0.02), // Right hip
        
        // Knees - weight centered
        // Z-rotation MATCHES hips: -0.02 left, +0.02 right
        createLandmark(baseX - 0.09, baseY + 0.20, -0.02), // Left knee
        createLandmark(baseX + 0.08, baseY + 0.20, 0.02), // Right knee
        
        // Ankles - balanced
        // Z-rotation MATCHES hips: -0.02 left, +0.02 right
        createLandmark(baseX - 0.10, baseY + 0.35, -0.02), // Left ankle
        createLandmark(baseX + 0.09, baseY + 0.35, 0.02), // Right ankle
        
        // Feet - weight centered/forward
        // Z-rotation MATCHES hips: -0.02 left, +0.02 right
        createLandmark(baseX - 0.11, baseY + 0.37, -0.02, 0.88), // Left heel
        createLandmark(baseX - 0.11, baseY + 0.37, -0.07, 0.88), // Left toe
        createLandmark(baseX + 0.10, baseY + 0.37, 0.02, 0.88), // Right heel
        createLandmark(baseX + 0.10, baseY + 0.37, -0.03, 0.88), // Right toe
      ]
    },
    
    // ============================================================
    // KEYFRAME 6: FOLLOW-THROUGH (100%) - Deceleration
    // Continue rotation PAST z-axis (negative rotation)
    // Right side now FORWARD, left side now BACK (opposite of cocking)
    // Weight fully on front foot
    // Arm across body
    // ============================================================
    {
      phase: "Follow-through",
      progress: 1.0,
      landmarks: [
        // Face - head turned left with follow-through
        ...Array(11).fill(null).map((_, i) => 
          createLandmark(baseX - 0.02 + (i % 3 - 1) * 0.015, baseY - 0.34, 0.03)
        ),
        
        // Shoulders - ROTATED PAST Z-AXIS (opposite direction)
        // Right forward (z < 0), Left back (z > 0)
        // Torso length = 0.28, shoulder width = 0.18
        createLandmark(baseX - 0.09, baseY - 0.22, 0.12), // Left shoulder BACK
        createLandmark(baseX + 0.09, baseY - 0.22, -0.12), // Right shoulder FORWARD
        
        // Elbows - right arm across body
        createLandmark(baseX - 0.10, baseY - 0.08, 0.08), // Left elbow back
        createLandmark(baseX - 0.08, baseY - 0.15, -0.12), // Right elbow across body
        
        // Wrists - right hand across left side
        createLandmark(baseX - 0.11, baseY + 0.02, 0.06), // Left wrist
        createLandmark(baseX - 0.15, baseY - 0.05, -0.15), // Right wrist across
        
        // Hands
        ...Array(6).fill(null).map((_, i) => 
          createLandmark(baseX + (i < 3 ? -0.12 : -0.16), baseY + (i < 3 ? 0.04 : -0.03), i < 3 ? 0.05 : -0.16, 0.85)
        ),
        
        // Hips - ROTATED PAST Z-AXIS
        // Right forward (z < 0), Left back (z > 0)
        createLandmark(baseX - 0.08, baseY + 0.06, 0.12), // Left hip BACK
        createLandmark(baseX + 0.08, baseY + 0.06, -0.12), // Right hip FORWARD
        
        // Knees - weight on front leg
        // Z-rotation MATCHES hips: +0.12 left (back), -0.12 right (forward)
        createLandmark(baseX - 0.05, baseY + 0.22, 0.12), // Left knee back
        createLandmark(baseX + 0.12, baseY + 0.19, -0.12), // Right knee forward
        
        // Ankles - weight forward
        // Z-rotation MATCHES hips: +0.12 left (back), -0.12 right (forward)
        createLandmark(baseX - 0.04, baseY + 0.36, 0.12), // Left ankle back
        createLandmark(baseX + 0.14, baseY + 0.34, -0.12), // Right ankle forward
        
        // Feet - weight FULLY on front foot
        // Z-rotation MATCHES hips: +0.12 left (back), -0.12 right (forward)
        createLandmark(baseX - 0.03, baseY + 0.38, 0.12, 0.88), // Left heel back (light)
        createLandmark(baseX - 0.03, baseY + 0.38, 0.07, 0.88), // Left toe back
        createLandmark(baseX + 0.16, baseY + 0.36, -0.12, 0.88), // Right heel forward (loaded)
        createLandmark(baseX + 0.16, baseY + 0.36, -0.17, 0.88), // Right toe forward
      ]
    }
  ];
}

/**
 * Interpolate between keyframes based on progress (0.0 to 1.0)
 */
export function interpolateKeyframes(keyframes: Keyframe[], progress: number): Keyframe {
  // Clamp progress
  progress = Math.max(0, Math.min(1, progress));
  
  // Find surrounding keyframes
  let prevKeyframe = keyframes[0];
  let nextKeyframe = keyframes[keyframes.length - 1];
  
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (progress >= keyframes[i].progress && progress <= keyframes[i + 1].progress) {
      prevKeyframe = keyframes[i];
      nextKeyframe = keyframes[i + 1];
      break;
    }
  }
  
  // Calculate interpolation factor
  const range = nextKeyframe.progress - prevKeyframe.progress;
  const t = range === 0 ? 0 : (progress - prevKeyframe.progress) / range;
  
  // Interpolate landmarks
  const interpolatedLandmarks = prevKeyframe.landmarks.map((prevLm: any, index: number) => {
    const nextLm = nextKeyframe.landmarks[index];
    return {
      x: prevLm.x + (nextLm.x - prevLm.x) * t,
      y: prevLm.y + (nextLm.y - prevLm.y) * t,
      z: prevLm.z + (nextLm.z - prevLm.z) * t,
      visibility: prevLm.visibility
    };
  });
  
  // Determine current phase
  let currentPhase = prevKeyframe.phase;
  if (t > 0.5) {
    currentPhase = nextKeyframe.phase;
  }
  
  // Debug logging (can be removed in production)
  if (Math.random() < 0.05) { // Log ~5% of frames to avoid spam
    console.log(`🎯 Progress: ${progress.toFixed(2)} (${currentPhase})`);
    console.log(`👤 FULL BODY POSITIONS:`);
    console.log(`  💪 Arms:`);
    console.log(`    L Shoulder (11): ${interpolatedLandmarks[11].x.toFixed(3)} ${interpolatedLandmarks[11].y.toFixed(3)} z: ${interpolatedLandmarks[11].z.toFixed(3)}`);
    console.log(`    R Shoulder (12): ${interpolatedLandmarks[12].x.toFixed(3)} ${interpolatedLandmarks[12].y.toFixed(3)} z: ${interpolatedLandmarks[12].z.toFixed(3)}`);
    console.log(`    L Elbow (13): ${interpolatedLandmarks[13].x.toFixed(3)} ${interpolatedLandmarks[13].y.toFixed(3)} z: ${interpolatedLandmarks[13].z.toFixed(3)}`);
    console.log(`    R Elbow (14): ${interpolatedLandmarks[14].x.toFixed(3)} ${interpolatedLandmarks[14].y.toFixed(3)} z: ${interpolatedLandmarks[14].z.toFixed(3)}`);
    console.log(`  🦴 Hips:`);
    console.log(`    L Hip (23): ${interpolatedLandmarks[23].x.toFixed(3)} ${interpolatedLandmarks[23].y.toFixed(3)} z: ${interpolatedLandmarks[23].z.toFixed(3)}`);
    console.log(`    R Hip (24): ${interpolatedLandmarks[24].x.toFixed(3)} ${interpolatedLandmarks[24].y.toFixed(3)} z: ${interpolatedLandmarks[24].z.toFixed(3)}`);
    console.log(`  🦵 Legs:`);
    console.log(`    L Knee (25): ${interpolatedLandmarks[25].x.toFixed(3)} ${interpolatedLandmarks[25].y.toFixed(3)} z: ${interpolatedLandmarks[25].z.toFixed(3)}`);
    console.log(`    R Knee (26): ${interpolatedLandmarks[26].x.toFixed(3)} ${interpolatedLandmarks[26].y.toFixed(3)} z: ${interpolatedLandmarks[26].z.toFixed(3)}`);
    console.log(`    L Ankle (27): ${interpolatedLandmarks[27].x.toFixed(3)} ${interpolatedLandmarks[27].y.toFixed(3)} z: ${interpolatedLandmarks[27].z.toFixed(3)}`);
    console.log(`    R Ankle (28): ${interpolatedLandmarks[28].x.toFixed(3)} ${interpolatedLandmarks[28].y.toFixed(3)} z: ${interpolatedLandmarks[28].z.toFixed(3)}`);
  }
  
  return {
    phase: currentPhase,
    progress,
    landmarks: interpolatedLandmarks
  };
}

