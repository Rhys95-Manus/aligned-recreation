import { useEffect, useState } from 'react';
import Replay from './Replay';

export default function TestReplay() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Create sample professional reference data
    const professionalReference = {
      frames: Array(10).fill(null).map((_, frameIndex) => ({
        timestamp: frameIndex * 100,
        landmarks: Array(33).fill(null).map((_, i) => ({
          x: 0.5 + Math.sin((i + frameIndex) / 33 * Math.PI) * 0.1,
          y: 0.5 + Math.cos((i + frameIndex) / 33 * Math.PI) * 0.1,
          z: Math.random() * 0.2,
          visibility: 0.9
        })),
        metrics: {
          hipRotation: 90 - frameIndex * 2,
          shoulderRotation: 90 - frameIndex * 1.5,
          rightElbowAngle: 70 + frameIndex * 5,
          leftElbowAngle: 170 - frameIndex * 2,
          rightKneeFlexion: 160 - frameIndex * 1,
          leftKneeFlexion: 160 - frameIndex * 1,
          spineAngle: -5 + frameIndex * 0.5,
          rightShoulderAngle: 45 + frameIndex * 2,
          leftShoulderAngle: 45 - frameIndex * 1,
          footPositioning: 45,
          weightTransfer: -50 + frameIndex * 3
        }
      }))
    };

    // Create sample recorded frames (user motion)
    const recordedFrames = Array(10).fill(null).map((_, frameIndex) => ({
      timestamp: frameIndex * 100,
      landmarks: Array(33).fill(null).map((_, i) => ({
        x: 0.5 + Math.sin((i + frameIndex) / 33 * Math.PI) * 0.09,
        y: 0.5 + Math.cos((i + frameIndex) / 33 * Math.PI) * 0.09,
        z: Math.random() * 0.18,
        visibility: 0.85
      })),
      metrics: {
        hipRotation: 88 - frameIndex * 2.2,
        shoulderRotation: 92 - frameIndex * 1.6,
        rightElbowAngle: 72 + frameIndex * 5.2,
        leftElbowAngle: 168 - frameIndex * 2.1,
        rightKneeFlexion: 158 - frameIndex * 1.1,
        leftKneeFlexion: 162 - frameIndex * 1.2,
        spineAngle: -4 + frameIndex * 0.6,
        rightShoulderAngle: 48 + frameIndex * 2.1,
        leftShoulderAngle: 42 - frameIndex * 1.1,
        footPositioning: 44,
        weightTransfer: -48 + frameIndex * 3.2
      },
      visibility: {
        hipRotation: true,
        shoulderRotation: true,
        rightElbow: true,
        leftElbow: true,
        rightKnee: true,
        leftKnee: true,
        spineAngle: true,
        weightTransfer: true
      }
    }));

    // Create detailed analysis data
    const detailedAnalysis = {
      overallScore: 87,
      repBoundaries: [],
      strengths: [],
      detailedAreas: [],
      improvements: [],
      biomechanicalAnalysis: [],
      powerGeneration: { peakVelocity: 45, forceTransfer: 85 },
      movementTiming: { hipPhase: 0.2, torsoPhase: 0.4, shoulderPhase: 0.6, elbowPhase: 0.8 }
    };

    // Store in session storage for Replay component
    sessionStorage.setItem('replayData', JSON.stringify({
      recordedFrames,
      professionalReference,
      motionName: 'Throw',
      detailedAnalysis,
      selectedReps: 1
    }));

    setIsReady(true);
  }, []);

  if (!isReady) {
    return <div className="text-white p-8">Loading test data...</div>;
  }

  // Get data from sessionStorage
  const data = JSON.parse(sessionStorage.getItem('replayData') || '{}');

  return (
    <div className="bg-[#0a0e27] min-h-screen">
      <Replay
        recordedFrames={data.recordedFrames}
        professionalReference={data.professionalReference}
        motionName={data.motionName}
        detailedAnalysis={data.detailedAnalysis}
        selectedReps={data.selectedReps}
        onBack={() => window.history.back()}
      />
    </div>
  );
}
