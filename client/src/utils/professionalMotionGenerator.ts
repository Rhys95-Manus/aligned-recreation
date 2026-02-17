/**
 * Professional Motion Generator
 * Generates realistic professional reference motion sequences with phase-based pose landmarks and metrics
 * 
 * 5-PHASE QB THROWING MOTION:
 * Phase 1: Neutral Stance
 * Phase 2A: Early Cocking
 * Phase 2B: Late Cocking
 * Phase 3: Release
 * Phase 4: Follow-through
 */

import { interpolateKeyframes } from './professionalMotionKeyframes';

export interface ProfessionalFrame {
  timestamp: number;
  landmarks: any[];
  metrics: {
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
  };
}

export interface MotionPhase {
  name: string;
  startFrame: number;
  endFrame: number;
  instruction: string;
  metrics: {
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
  };
}

/**
 * Generate professional throwing motion sequence
 * @param totalFrames Total number of frames to generate (should match user motion length)
 * @param motionType Type of motion (e.g., "football-throw")
 * @returns Array of professional frames with landmarks and metrics
 */
export function generateProfessionalMotion(totalFrames: number, motionType: string = "football-throw"): ProfessionalFrame[] {
  const frames: ProfessionalFrame[] = [];
  
  // Define motion phases for football throw with EXACT metrics from user document
  // 90° = Closed (Sideways to target)
  // 0° = Square (Facing target)
  // Timing: 1.2-1.8s for motion, 1.7-2.4s for return to neutral
  
  const motionEndFrame = Math.floor(totalFrames * 0.75);
  
  const phases: MotionPhase[] = [
    {
      name: "Neutral Stance",
      instruction: "Start tall and balanced with the ball near your chest, standing sideways to the target with a relaxed posture that prepares your body to rotate smoothly.",
      startFrame: 0,
      endFrame: Math.floor(motionEndFrame * 0.2), // ~0.3s
      metrics: {
        hipRotation: 5,          // 0-10° (Closed hips)
        shoulderRotation: 5,     // 0-10° (Closed shoulders)
        rightElbowAngle: 100,    // 80-120° (Relaxed arm)
        leftElbowAngle: 95,      // 70-120° (Balanced counter)
        rightKneeFlexion: 160,   // 150-170° (Athletic bend)
        leftKneeFlexion: 160,    // 150-170° (Ready to step)
        spineAngle: 5,           // 0-10° (Tall posture)
        rightShoulderAngle: 45,  // Relaxed
        leftShoulderAngle: 45,   // Relaxed
        footPositioning: 180,    // Sideways
        weightTransfer: 0        // -5% to +5% (Balanced base)
      }
    },
    {
      name: "Early Cocking",
      instruction: "Shift slightly into your back leg as your throwing arm moves into its backstroke position, pivoting your front foot toward the target while keeping your shoulders closed.",
      startFrame: Math.floor(motionEndFrame * 0.2),
      endFrame: Math.floor(motionEndFrame * 0.4), // ~0.25s
      metrics: {
        hipRotation: 17,         // 10-25° open (Hips start first)
        shoulderRotation: 5,     // 0-10° open (Shoulders stay closed)
        rightElbowAngle: 90,     // 80-100° (Compact arm)
        leftElbowAngle: 50,      // 30-70° (Counterbalance)
        rightKneeFlexion: 150,   // 140-160° (Absorb load)
        leftKneeFlexion: 160,    // 150-170° (Free to pivot)
        spineAngle: 5,           // 0-10° (Stay tall)
        rightShoulderAngle: 90,  // Shoulder level ±5°
        leftShoulderAngle: 60,
        footPositioning: 160,
        weightTransfer: -15      // -10% to -20% (Load the back leg)
      }
    },
    {
      name: "Late Cocking",
      instruction: "Begin shifting your weight forward as your hips rotate open while your shoulders stay closed, creating torque as your throwing arm forms a clean L-shape behind your head.",
      startFrame: Math.floor(motionEndFrame * 0.4),
      endFrame: Math.floor(motionEndFrame * 0.6), // ~0.25s
      metrics: {
        hipRotation: 37,         // 30-45° open (Hips lead power)
        shoulderRotation: 10,    // 5-15° open (Delay shoulders)
        rightElbowAngle: 92,     // 85-100° (Strong L-shape)
        leftElbowAngle: 50,      // 30-70° (Pull torso through)
        rightKneeFlexion: 157,   // 150-165° (Drive from back leg)
        leftKneeFlexion: 150,    // 140-160° (Prepare to brace)
        spineAngle: 0,           // -5° to +5° (Tall with control)
        rightShoulderAngle: 90,  // At shoulder level
        leftShoulderAngle: 70,
        footPositioning: 150,
        weightTransfer: 5        // 0% to +10% (Energy moves forward)
      }
    },
    {
      name: "Release",
      instruction: "Drive your hips square to lead your shoulders, then whip your elbow forward in a straight line and extend your arm through the target as you release the ball.",
      startFrame: Math.floor(motionEndFrame * 0.6),
      endFrame: Math.floor(motionEndFrame * 0.8), // ~0.2s
      metrics: {
        hipRotation: 52,         // 45-60° (Square) (Hips finish first)
        shoulderRotation: 52,    // 45-60° (Shoulders whip)
        rightElbowAngle: 175,    // 90° -> 170-180° (Elbow leads hand)
        leftElbowAngle: 65,      // 40-90° (Pull torso through)
        rightKneeFlexion: 175,   // 170-180° (Finish drive)
        leftKneeFlexion: 175,    // 170-180° (Brace and transfer)
        spineAngle: 5,           // 0-10° (No collapse)
        rightShoulderAngle: 100,
        leftShoulderAngle: 80,
        footPositioning: 140,
        weightTransfer: 30       // +20% to +40% (Finish into throw)
      }
    },
    {
      name: "Follow-through",
      instruction: "Let your arm naturally follow through across your body with your palm down as your shoulders and hips rotate fully, finishing your weight on the front foot with a relaxed forward lean.",
      startFrame: Math.floor(motionEndFrame * 0.8),
      endFrame: motionEndFrame, // ~0.35s
      metrics: {
        hipRotation: 75,         // >60° (Hips through)
        shoulderRotation: 75,    // 60-90° (Full rotation)
        rightElbowAngle: 175,    // 170-180° (Full release)
        leftElbowAngle: 50,      // 30-70° (Absorb rotation)
        rightKneeFlexion: 160,   // 150-170° (Trail release)
        leftKneeFlexion: 175,    // 170-180° (Stable finish)
        spineAngle: 10,          // 5-15° forward (Natural decel)
        rightShoulderAngle: 80,  // Arm comes down/across
        leftShoulderAngle: 80,
        footPositioning: 130,
        weightTransfer: 70       // +60% to +80% (Complete transfer)
      }
    },
    // Return to Neutral Phase (simulated)
    {
      name: "Return to Neutral",
      instruction: "Return to starting position to finish.",
      startFrame: motionEndFrame,
      endFrame: totalFrames,
      metrics: {
        hipRotation: 5,          // Back to 0-10°
        shoulderRotation: 5,     // Back to 0-10°
        rightElbowAngle: 100,    // Back to 80-120°
        leftElbowAngle: 95,      // Back to 70-120°
        rightKneeFlexion: 160,   // Back to 150-170°
        leftKneeFlexion: 160,    // Back to 150-170°
        spineAngle: 5,           // Back to 0-10°
        rightShoulderAngle: 45,
        leftShoulderAngle: 45,
        footPositioning: 180,
        weightTransfer: 0        // Back to -5% to +5%
      }
    }
  ];
  
  // Generate frames by interpolating between phases
  for (let i = 0; i < totalFrames; i++) {
    // Find which phase this frame belongs to
    const currentPhase = phases.find(p => i >= p.startFrame && i < p.endFrame) || phases[phases.length - 1];
    const nextPhaseIndex = phases.indexOf(currentPhase) + 1;
    const nextPhase = nextPhaseIndex < phases.length ? phases[nextPhaseIndex] : currentPhase;
    
    // Calculate interpolation factor within the phase
    const phaseProgress = (i - currentPhase.startFrame) / (currentPhase.endFrame - currentPhase.startFrame);
    
    // Interpolate metrics between current and next phase
    const interpolate = (start: number, end: number, t: number) => start + (end - start) * t;
    
    const metrics = {
      hipRotation: interpolate(currentPhase.metrics.hipRotation, nextPhase.metrics.hipRotation, phaseProgress),
      shoulderRotation: interpolate(currentPhase.metrics.shoulderRotation, nextPhase.metrics.shoulderRotation, phaseProgress),
      rightElbowAngle: interpolate(currentPhase.metrics.rightElbowAngle, nextPhase.metrics.rightElbowAngle, phaseProgress),
      leftElbowAngle: interpolate(currentPhase.metrics.leftElbowAngle, nextPhase.metrics.leftElbowAngle, phaseProgress),
      rightKneeFlexion: interpolate(currentPhase.metrics.rightKneeFlexion, nextPhase.metrics.rightKneeFlexion, phaseProgress),
      leftKneeFlexion: interpolate(currentPhase.metrics.leftKneeFlexion, nextPhase.metrics.leftKneeFlexion, phaseProgress),
      spineAngle: interpolate(currentPhase.metrics.spineAngle, nextPhase.metrics.spineAngle, phaseProgress),
      rightShoulderAngle: interpolate(currentPhase.metrics.rightShoulderAngle, nextPhase.metrics.rightShoulderAngle, phaseProgress),
      leftShoulderAngle: interpolate(currentPhase.metrics.leftShoulderAngle, nextPhase.metrics.leftShoulderAngle, phaseProgress),
      footPositioning: interpolate(currentPhase.metrics.footPositioning, nextPhase.metrics.footPositioning, phaseProgress),
      weightTransfer: interpolate(currentPhase.metrics.weightTransfer, nextPhase.metrics.weightTransfer, phaseProgress)
    };
    
    // Get interpolated landmarks from keyframes
    // Note: Keyframes need to be updated to match these new phases if we want perfect visual sync
    // For now, we rely on the metrics driving the hologram
    const progress = i / totalFrames;
    const landmarks = interpolateKeyframes(progress);
    
    frames.push({
      timestamp: (i / totalFrames) * 3000, // Assume 3 second motion
      landmarks,
      metrics
    });
  }
  
  return frames;
}

/**
 * Get phase information for a given frame
 */
export function getPhaseForFrame(frameIndex: number, totalFrames: number): { name: string; instruction: string } {
  const phases = [
    { name: "Neutral Stance", instruction: "Start tall and balanced with the ball near your chest, standing sideways to the target with a relaxed posture that prepares your body to rotate smoothly.", endPercent: 0.15 },
    { name: "Early Cocking", instruction: "Shift slightly into your back leg as your throwing arm moves into its backstroke position, pivoting your front foot toward the target while keeping your shoulders closed.", endPercent: 0.3 },
    { name: "Late Cocking", instruction: "Begin shifting your weight forward as your hips rotate open while your shoulders stay closed, creating torque as your throwing arm forms a clean L-shape behind your head.", endPercent: 0.45 },
    { name: "Release", instruction: "Drive your hips square to lead your shoulders, then whip your elbow forward in a straight line and extend your arm through the target as you release the ball.", endPercent: 0.6 },
    { name: "Follow-through", instruction: "Let your arm naturally follow through across your body with your palm down as your shoulders and hips rotate fully, finishing your weight on the front foot with a relaxed forward lean.", endPercent: 0.75 },
    { name: "Return to Neutral", instruction: "Return to starting position to finish.", endPercent: 1.0 }
  ];
  
  const progress = frameIndex / totalFrames;
  const phase = phases.find(p => progress <= p.endPercent) || phases[phases.length - 1];
  
  return { name: phase.name, instruction: phase.instruction };
}
