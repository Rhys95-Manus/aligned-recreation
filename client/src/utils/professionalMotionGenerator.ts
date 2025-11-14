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
  
  // Define motion phases for football throw with CORRECT metrics
  const phases: MotionPhase[] = [
    {
      name: "Neutral Stance",
      instruction: "Ball near chest, stand sideways, weight balanced",
      startFrame: 0,
      endFrame: Math.floor(totalFrames * 0.2),
      metrics: {
        hipRotation: 90,         // 90° Back
        shoulderRotation: 90,    // 90° Back
        rightElbowAngle: 70,     // Bent (low number)
        leftElbowAngle: 80,
        rightKneeFlexion: 145,   // Slightly bent (high number = straighter)
        leftKneeFlexion: 145,
        spineAngle: -3,          // Slight back lean
        rightShoulderAngle: 60,
        leftShoulderAngle: 60,
        footPositioning: 170,
        weightTransfer: 0        // Balanced (50/50)
      }
    },
    {
      name: "Early Cocking",
      instruction: "Weight shifts slightly to back foot, throwing arm in backstroke position, pivot front foot",
      startFrame: Math.floor(totalFrames * 0.2),
      endFrame: Math.floor(totalFrames * 0.4),
      metrics: {
        hipRotation: 70,         // 70° Back
        shoulderRotation: 90,    // 90° Back (shoulders stay closed)
        rightElbowAngle: 78,
        leftElbowAngle: 75,
        rightKneeFlexion: 135,
        leftKneeFlexion: 140,
        spineAngle: -9,          // More back lean (-8° to -10° range)
        rightShoulderAngle: 70,
        leftShoulderAngle: 65,
        footPositioning: 165,
        weightTransfer: -60      // Back foot 60% (negative = back)
      }
    },
    {
      name: "Late Cocking",
      instruction: "Begin shifting weight forward, hips rotate forward, shoulders stay closed, arm makes L shape behind head",
      startFrame: Math.floor(totalFrames * 0.4),
      endFrame: Math.floor(totalFrames * 0.6),
      metrics: {
        hipRotation: 50,         // 50° Back (hips opening)
        shoulderRotation: 90,    // 90° Back (shoulders still closed - max separation)
        rightElbowAngle: 95,     // L-shape behind head
        leftElbowAngle: 70,
        rightKneeFlexion: 125,   // More bent
        leftKneeFlexion: 135,
        spineAngle: -4,          // Less back lean as weight shifts forward (-3° to -5° range)
        rightShoulderAngle: 85,
        leftShoulderAngle: 70,
        footPositioning: 160,
        weightTransfer: 55       // Front foot 55% (positive = front)
      }
    },
    {
      name: "Release",
      instruction: "Drive hips square leading the shoulders, extend arm through target",
      startFrame: Math.floor(totalFrames * 0.6),
      endFrame: Math.floor(totalFrames * 0.8),
      metrics: {
        hipRotation: 2,          // Nearly square (2° Back)
        shoulderRotation: 2,     // Nearly square
        rightElbowAngle: 150,    // Extending (high number)
        leftElbowAngle: 65,
        rightKneeFlexion: 165,   // Nearly straight
        leftKneeFlexion: 150,
        spineAngle: 3,           // Forward lean
        rightShoulderAngle: 120,
        leftShoulderAngle: 80,
        footPositioning: 155,
        weightTransfer: 60       // Front foot 60%
      }
    },
    {
      name: "Follow-through",
      instruction: "Finish with arm extended across body, slight lean forward",
      startFrame: Math.floor(totalFrames * 0.8),
      endFrame: totalFrames,
      metrics: {
        hipRotation: -5,         // 5° Forward (past square, negative = forward)
        shoulderRotation: -5,    // 5° Forward
        rightElbowAngle: 173,    // Fully extended
        leftElbowAngle: 60,
        rightKneeFlexion: 140,   // Bent again
        leftKneeFlexion: 160,    // Straighter
        spineAngle: 10,          // Forward lean
        rightShoulderAngle: 140,
        leftShoulderAngle: 90,
        footPositioning: 150,
        weightTransfer: 70       // Front foot 70%
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
    { name: "Neutral Stance", instruction: "Ball near chest, stand sideways, weight balanced", endPercent: 0.2 },
    { name: "Early Cocking", instruction: "Weight shifts slightly to back foot, throwing arm in backstroke position, pivot front foot", endPercent: 0.4 },
    { name: "Late Cocking", instruction: "Begin shifting weight forward, hips rotate forward, shoulders stay closed, arm makes L shape behind head", endPercent: 0.6 },
    { name: "Release", instruction: "Drive hips square leading the shoulders, extend arm through target", endPercent: 0.8 },
    { name: "Follow-through", instruction: "Finish with arm extended across body, slight lean forward", endPercent: 1.0 }
  ];
  
  const progress = frameIndex / totalFrames;
  const phase = phases.find(p => progress <= p.endPercent) || phases[phases.length - 1];
  
  return { name: phase.name, instruction: phase.instruction };
}
