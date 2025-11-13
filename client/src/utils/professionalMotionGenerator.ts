/**
 * Professional Motion Generator
 * Generates realistic professional reference motion sequences with phase-based pose landmarks and metrics
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
  
  // Define motion phases for football throw
  const phases: MotionPhase[] = [
    {
      name: "Neutral",
      startFrame: 0,
      endFrame: Math.floor(totalFrames * 0.15),
      metrics: {
        hipRotation: 5,
        shoulderRotation: 0,  // Square to target
        rightElbowAngle: 10,
        leftElbowAngle: 10,
        rightKneeFlexion: 5,
        leftKneeFlexion: 5,
        spineAngle: 10,
        rightShoulderAngle: 15,
        leftShoulderAngle: 15,
        footPositioning: 170,
        weightTransfer: 50
      }
    },
    {
      name: "Wind-up",
      startFrame: Math.floor(totalFrames * 0.15),
      endFrame: Math.floor(totalFrames * 0.35),
      metrics: {
        hipRotation: 45,
        shoulderRotation: -30,  // Shoulders rotated back
        rightElbowAngle: 40,
        leftElbowAngle: 30,
        rightKneeFlexion: 25,
        leftKneeFlexion: 15,
        spineAngle: 20,
        rightShoulderAngle: 60,
        leftShoulderAngle: 40,
        footPositioning: 165,
        weightTransfer: 30
      }
    },
    {
      name: "Cocking",
      startFrame: Math.floor(totalFrames * 0.35),
      endFrame: Math.floor(totalFrames * 0.55),
      metrics: {
        hipRotation: 90,      // Maximum hip rotation
        shoulderRotation: -60,  // Maximum shoulder rotation back
        rightElbowAngle: 100,  // Maximum elbow flexion (bent back)
        leftElbowAngle: 80,
        rightKneeFlexion: 38,  // Maximum knee bend
        leftKneeFlexion: 25,
        spineAngle: 30,
        rightShoulderAngle: 110, // Maximum shoulder external rotation
        leftShoulderAngle: 70,
        footPositioning: 160,
        weightTransfer: 20     // Weight on back foot
      }
    },
    {
      name: "Acceleration",
      startFrame: Math.floor(totalFrames * 0.55),
      endFrame: Math.floor(totalFrames * 0.75),
      metrics: {
        hipRotation: 50,       // Hip rotation decreasing
        shoulderRotation: -20,  // Shoulders opening up
        rightElbowAngle: 60,   // Elbow extending
        leftElbowAngle: 50,
        rightKneeFlexion: 20,  // Knee extending
        leftKneeFlexion: 30,
        spineAngle: 25,
        rightShoulderAngle: 80,
        leftShoulderAngle: 60,
        footPositioning: 165,
        weightTransfer: 60     // Weight transferring forward
      }
    },
    {
      name: "Release",
      startFrame: Math.floor(totalFrames * 0.75),
      endFrame: Math.floor(totalFrames * 0.85),
      metrics: {
        hipRotation: 20,       // Hips nearly square
        shoulderRotation: 0,   // Shoulders square to target
        rightElbowAngle: 15,   // Arm nearly extended
        leftElbowAngle: 30,
        rightKneeFlexion: 10,
        leftKneeFlexion: 35,
        spineAngle: 20,
        rightShoulderAngle: 40,
        leftShoulderAngle: 50,
        footPositioning: 170,
        weightTransfer: 85     // Most weight on front foot
      }
    },
    {
      name: "Follow-through",
      startFrame: Math.floor(totalFrames * 0.85),
      endFrame: totalFrames,
      metrics: {
        hipRotation: 10,
        shoulderRotation: 5,   // Shoulders slightly forward past square
        rightElbowAngle: 20,
        leftElbowAngle: 25,
        rightKneeFlexion: 15,
        leftKneeFlexion: 30,
        spineAngle: 15,
        rightShoulderAngle: 30,
        leftShoulderAngle: 40,
        footPositioning: 175,
        weightTransfer: 90
      }
    }
  ];
  
  // Generate frames with smooth transitions between phases
  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    const timestamp = (frameIndex / 30) * 1000; // Assuming 30 FPS
    
    // Find current phase and next phase
    let currentPhase = phases[0];
    let nextPhase = phases[0];
    let phaseProgress = 0;
    
    for (let i = 0; i < phases.length; i++) {
      if (frameIndex >= phases[i].startFrame && frameIndex < phases[i].endFrame) {
        currentPhase = phases[i];
        nextPhase = i < phases.length - 1 ? phases[i + 1] : phases[i];
        const phaseLength = currentPhase.endFrame - currentPhase.startFrame;
        phaseProgress = (frameIndex - currentPhase.startFrame) / phaseLength;
        break;
      }
    }
    
    // Interpolate metrics between current and next phase
    const metrics = {
      hipRotation: lerp(currentPhase.metrics.hipRotation, nextPhase.metrics.hipRotation, phaseProgress),
      shoulderRotation: lerp(currentPhase.metrics.shoulderRotation, nextPhase.metrics.shoulderRotation, phaseProgress),
      rightElbowAngle: lerp(currentPhase.metrics.rightElbowAngle, nextPhase.metrics.rightElbowAngle, phaseProgress),
      leftElbowAngle: lerp(currentPhase.metrics.leftElbowAngle, nextPhase.metrics.leftElbowAngle, phaseProgress),
      rightKneeFlexion: lerp(currentPhase.metrics.rightKneeFlexion, nextPhase.metrics.rightKneeFlexion, phaseProgress),
      leftKneeFlexion: lerp(currentPhase.metrics.leftKneeFlexion, nextPhase.metrics.leftKneeFlexion, phaseProgress),
      spineAngle: lerp(currentPhase.metrics.spineAngle, nextPhase.metrics.spineAngle, phaseProgress),
      rightShoulderAngle: lerp(currentPhase.metrics.rightShoulderAngle, nextPhase.metrics.rightShoulderAngle, phaseProgress),
      leftShoulderAngle: lerp(currentPhase.metrics.leftShoulderAngle, nextPhase.metrics.leftShoulderAngle, phaseProgress),
      footPositioning: lerp(currentPhase.metrics.footPositioning, nextPhase.metrics.footPositioning, phaseProgress),
      weightTransfer: lerp(currentPhase.metrics.weightTransfer, nextPhase.metrics.weightTransfer, phaseProgress)
    };
    
    // Generate pose landmarks based on metrics
    const landmarks = generatePoseLandmarks(metrics, frameIndex, totalFrames);
    
    frames.push({
      timestamp,
      landmarks,
      metrics
    });
  }
  
  return frames;
}

/**
 * Linear interpolation between two values
 */
function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * easeInOutCubic(progress);
}

/**
 * Easing function for smooth transitions
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Generate pose landmarks using keyframe-based animation
 * This creates realistic throwing motion by interpolating between pre-defined keyframe poses
 */
function generatePoseLandmarks(metrics: any, frameIndex: number, totalFrames: number): any[] {
  // Calculate progress through the motion (0-1)
  const progress = frameIndex / totalFrames;
  
  // Get landmarks from keyframe system - this returns realistic throwing poses!
  const interpolatedLandmarks = interpolateKeyframes(progress);
  return interpolatedLandmarks;
}

/**
 * OLD ALGORITHM - Not used anymore, kept for reference
 */
function generatePoseLandmarksOld(metrics: any, frameIndex: number, totalFrames: number): any[] {
  const landmarks = [];
  
  // Base position and scale
  const baseX = 0.5;
  const baseY = 0.5;
  const scale = 0.25;
  
  // Convert metrics to radians for calculations
  const hipRotationRad = (metrics.hipRotation * Math.PI) / 180;
  const rightElbowRad = (metrics.rightElbowAngle * Math.PI) / 180;
  const leftElbowRad = (metrics.leftElbowAngle * Math.PI) / 180;
  const rightKneeRad = (metrics.rightKneeFlexion * Math.PI) / 180;
  const leftKneeRad = (metrics.leftKneeFlexion * Math.PI) / 180;
  const spineRad = (metrics.spineAngle * Math.PI) / 180;
  
  // Head center (adjusted for spine angle)
  const headX = baseX + Math.sin(spineRad) * scale * 0.1;
  const headY = baseY - scale * 1.3;
  
  // Face landmarks (0-10) - stable head position
  const faceOffsets = [
    [0, -0.03], [0.02, -0.02], [-0.02, -0.02], [0.03, 0], [-0.03, 0],
    [0.02, 0.01], [-0.02, 0.01], [0.015, 0.02], [-0.015, 0.02],
    [0.01, 0.025], [-0.01, 0.025]
  ];
  
  for (let i = 0; i <= 10; i++) {
    landmarks.push({
      x: headX + faceOffsets[i][0],
      y: headY + faceOffsets[i][1],
      z: -0.05,
      visibility: 0.95
    });
  }
  
  // Shoulder positions (11=left, 12=right)
  const shoulderY = baseY - scale * 0.9;
  const shoulderWidth = 0.18;
  
  // Shoulders rotate with hips (but less)
  const shoulderRotation = hipRotationRad * 0.4;
  
  landmarks.push({
    x: baseX - shoulderWidth / 2 - Math.sin(shoulderRotation) * 0.05,
    y: shoulderY,
    z: -Math.cos(shoulderRotation) * 0.05,
    visibility: 0.98
  }); // Left shoulder (11)
  
  landmarks.push({
    x: baseX + shoulderWidth / 2 + Math.sin(shoulderRotation) * 0.05,
    y: shoulderY,
    z: Math.cos(shoulderRotation) * 0.05,
    visibility: 0.98
  }); // Right shoulder (12)
  
  // Elbow positions (13=left, 14=right)
  const upperArmLength = 0.12;
  
  // Left elbow
  const leftElbowAngle = Math.PI * 0.5 + leftElbowRad * 0.5;
  landmarks.push({
    x: landmarks[11].x - Math.cos(leftElbowAngle) * upperArmLength,
    y: landmarks[11].y + Math.sin(leftElbowAngle) * upperArmLength,
    z: landmarks[11].z - 0.02,
    visibility: 0.95
  }); // Left elbow (13)
  
  // Right elbow (throwing arm) - more dynamic
  const rightElbowAngle = Math.PI * 0.3 - rightElbowRad * 0.8;
  landmarks.push({
    x: landmarks[12].x + Math.cos(rightElbowAngle) * upperArmLength,
    y: landmarks[12].y + Math.sin(rightElbowAngle) * upperArmLength * 0.8,
    z: landmarks[12].z + 0.08,
    visibility: 0.95
  }); // Right elbow (14)
  
  // Wrist positions (15=left, 16=right)
  const forearmLength = 0.11;
  
  // Left wrist
  const leftWristAngle = leftElbowAngle + Math.PI * 0.3;
  landmarks.push({
    x: landmarks[13].x - Math.cos(leftWristAngle) * forearmLength,
    y: landmarks[13].y + Math.sin(leftWristAngle) * forearmLength,
    z: landmarks[13].z,
    visibility: 0.92
  }); // Left wrist (15)
  
  // Right wrist (throwing hand)
  const rightWristAngle = rightElbowAngle - Math.PI * 0.2;
  landmarks.push({
    x: landmarks[14].x + Math.cos(rightWristAngle) * forearmLength,
    y: landmarks[14].y + Math.sin(rightWristAngle) * forearmLength,
    z: landmarks[14].z + 0.05,
    visibility: 0.92
  }); // Right wrist (16)
  
  // Hand landmarks (17-22) - simplified, stable positions
  // Left hand (17-19)
  for (let i = 0; i < 3; i++) {
    landmarks.push({
      x: landmarks[15].x - 0.015 * (i + 1),
      y: landmarks[15].y + 0.01 * i,
      z: landmarks[15].z,
      visibility: 0.85
    });
  }
  
  // Right hand (20-22)
  for (let i = 0; i < 3; i++) {
    landmarks.push({
      x: landmarks[16].x + 0.015 * (i + 1),
      y: landmarks[16].y + 0.01 * i,
      z: landmarks[16].z,
      visibility: 0.85
    });
  }
  
  // Hip positions (23=left, 24=right)
  const hipY = baseY - scale * 0.2;
  const hipWidth = 0.14;
  
  landmarks.push({
    x: baseX - hipWidth / 2 - Math.sin(hipRotationRad) * 0.08,
    y: hipY,
    z: -Math.cos(hipRotationRad) * 0.08,
    visibility: 0.98
  }); // Left hip (23)
  
  landmarks.push({
    x: baseX + hipWidth / 2 + Math.sin(hipRotationRad) * 0.08,
    y: hipY,
    z: Math.cos(hipRotationRad) * 0.08,
    visibility: 0.98
  }); // Right hip (24)
  
  // Knee positions (25=left, 26=right)
  const thighLength = 0.18;
  
  // Left knee
  const leftKneeAngle = Math.PI * 0.5 + leftKneeRad * 0.5;
  landmarks.push({
    x: landmarks[23].x - Math.sin(leftKneeAngle) * 0.02,
    y: landmarks[23].y + thighLength,
    z: landmarks[23].z,
    visibility: 0.95
  }); // Left knee (25)
  
  // Right knee
  const rightKneeAngle = Math.PI * 0.5 + rightKneeRad * 0.5;
  landmarks.push({
    x: landmarks[24].x + Math.sin(rightKneeAngle) * 0.02,
    y: landmarks[24].y + thighLength,
    z: landmarks[24].z,
    visibility: 0.95
  }); // Right knee (26)
  
  // Ankle positions (27=left, 28=right)
  const shinLength = 0.18;
  
  landmarks.push({
    x: landmarks[25].x,
    y: landmarks[25].y + shinLength,
    z: landmarks[25].z,
    visibility: 0.92
  }); // Left ankle (27)
  
  landmarks.push({
    x: landmarks[26].x,
    y: landmarks[26].y + shinLength,
    z: landmarks[26].z,
    visibility: 0.92
  }); // Right ankle (28)
  
  // Foot landmarks (29-32)
  // Left foot (29-30)
  landmarks.push({
    x: landmarks[27].x - 0.04,
    y: landmarks[27].y + 0.01,
    z: landmarks[27].z + 0.05,
    visibility: 0.88
  }); // Left heel (29)
  
  landmarks.push({
    x: landmarks[27].x - 0.04,
    y: landmarks[27].y + 0.01,
    z: landmarks[27].z - 0.05,
    visibility: 0.88
  }); // Left toe (30)
  
  // Right foot (31-32)
  landmarks.push({
    x: landmarks[28].x + 0.04,
    y: landmarks[28].y + 0.01,
    z: landmarks[28].z + 0.05,
    visibility: 0.88
  }); // Right heel (31)
  
  landmarks.push({
    x: landmarks[28].x + 0.04,
    y: landmarks[28].y + 0.01,
    z: landmarks[28].z - 0.05,
    visibility: 0.88
  }); // Right toe (32)
  
  return landmarks;
}

