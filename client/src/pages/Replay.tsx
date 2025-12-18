import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";
import { generateProfessionalMotion, getPhaseForFrame, ProfessionalFrame } from "../utils/professionalMotionGenerator";
import { detectThrowingPhase, getPhaseMiddleFrame, type MotionPhase } from "../utils/phaseDetection";
import { calculateRotation, formatWeightDistribution, formatSpineAngle, formatRotationAngle, formatRotationWithSide } from "../utils/rotationCalculations";

interface ReplayProps {
  recordedFrames: Array<{
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
    visibility?: {
      hipRotation: boolean;
      shoulderRotation: boolean;
      rightElbow: boolean;
      leftElbow: boolean;
      rightKnee: boolean;
      leftKnee: boolean;
      spineAngle: boolean;
      weightTransfer: boolean;
    };
  }>;
  professionalReference: any;
  motionName: string;
  onBack: () => void;
  detailedAnalysis?: any; // Optional detailed analysis data
  selectedReps?: number; // Number of reps user selected for workout mode
}

export default function Replay({ recordedFrames, professionalReference, motionName, onBack, detailedAnalysis, selectedReps = 1 }: ReplayProps) {
  const userCanvasRef = useRef<HTMLCanvasElement>(null);
  const proCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play on load
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isRightHanded, setIsRightHanded] = useState(true); // Toggle for left/right handed
  const [currentPhase, setCurrentPhase] = useState<MotionPhase>("Neutral");
  const [phaseInstruction, setPhaseInstruction] = useState("Ball near chest, stand sideways, weight balanced");
  const [rotationAngle, setRotationAngle] = useState(0); // 3D rotation angle in degrees (-180 to 180)
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // Playback speed multiplier (0.25x, 0.5x, 0.75x, 1x)
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [savedSessionCount, setSavedSessionCount] = useState(0);
  
  // Rep tracking state
  const [currentRep, setCurrentRep] = useState(1); // Current rep number (1-indexed)
  const [repScores, setRepScores] = useState<Array<{
    repNumber: number;
    score: number;
    peakMetrics: {
      hipRotation: number;
      shoulderRotation: number;
      rightElbowAngle: number;
      leftElbowAngle: number;
      rightKneeFlexion: number;
      leftKneeFlexion: number;
      spineAngle: number;
      weightTransfer: number;
    };
  }>>([]); // Scores for each completed rep
  const [showRepSummary, setShowRepSummary] = useState(false); // Show summary at end of all reps
  
  // Manual Timeline Editor State
  const [manualBoundaries, setManualBoundaries] = useState<Record<number, { start: number, end: number }>>({});
  
  const currentRepPeaks = useRef({
    hipRotation: 0,
    shoulderRotation: 0,
    rightElbowAngle: 0,
    leftElbowAngle: 0,
    rightKneeFlexion: 0,
    leftKneeFlexion: 0,
    spineAngle: 0,
    weightTransfer: 0
  }); // Peak values for current rep
  
  // Get rep boundaries from detailed analysis (if multiple reps detected)
  const repBoundaries = detailedAnalysis?.repBoundaries || [];
  
// Calculate current rep's frame range
  const getCurrentRepFrames = () => {
    // 1. Check for manual overrides first
    if (manualBoundaries[currentRep]) {
      const { start, end } = manualBoundaries[currentRep];
      return recordedFrames.slice(start, end + 1);
    }
  
    // 2. If we have explicit boundaries, use them
    if (repBoundaries.length > 0) {
      const boundary = repBoundaries.find((b: any) => b.repNumber === currentRep);
      if (boundary) {
        // Ensure indices are within bounds
        const start = Math.max(0, boundary.startFrame);
        const end = Math.min(recordedFrames.length - 1, boundary.endFrame);
        
        if (start <= end) {
          return recordedFrames.slice(start, end + 1);
        }
      }
    }
    
    // 3. Fallback: use all frames
    return recordedFrames;
  };
	  
	  const currentRepFrames = getCurrentRepFrames();
  
  // Generate professional motion sequence (same length as current rep)
  // Regenerate when currentRep changes to match new rep segment length
  const [professionalFrames, setProfessionalFrames] = useState<ProfessionalFrame[]>(
    generateProfessionalMotion(currentRepFrames.length, "football-throw")
  );
  
  // Regenerate professional frames when rep changes
  useEffect(() => {
    setProfessionalFrames(generateProfessionalMotion(currentRepFrames.length, "football-throw"));
  }, [currentRep, currentRepFrames.length]);
  
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  
  // Calculate score for a rep based on peak metrics
  const calculateRepScore = (peaks: typeof currentRepPeaks.current) => {
    // Simple scoring: average of how close each metric is to professional reference
    const proRef = professionalReference || {};
    let totalScore = 0;
    let metricCount = 0;
    
    // Score each metric based on distance from professional average
    const scoreMetric = (userValue: number, proValue: number, tolerance: number = 20) => {
      const diff = Math.abs(userValue - proValue);
      if (diff <= 10) return 100; // Perfect alignment
      if (diff <= tolerance) return 90 - ((diff - 10) * 2); // Close
      return Math.max(0, 70 - ((diff - tolerance) * 1.5)); // Needs improvement
    };
    
    if (peaks.hipRotation > 0) {
      totalScore += scoreMetric(peaks.hipRotation, proRef.hipRotation || 61, 20);
      metricCount++;
    }
    if (peaks.rightElbowAngle > 0) {
      totalScore += scoreMetric(peaks.rightElbowAngle, proRef.elbowAngle || 100, 15);
      metricCount++;
    }
    if (peaks.spineAngle > 0) {
      totalScore += scoreMetric(peaks.spineAngle, proRef.spineAngle || 23, 10);
      metricCount++;
    }
    if (peaks.weightTransfer > 0) {
      totalScore += scoreMetric(peaks.weightTransfer, proRef.weightTransfer || 70, 15);
      metricCount++;
    }
    
    return metricCount > 0 ? Math.round(totalScore / metricCount) : 0;
  };
  
  // Save current rep score and reset peaks for next rep
  const finishCurrentRep = () => {
    const score = calculateRepScore(currentRepPeaks.current);
    setRepScores(prev => [...prev, {
      repNumber: currentRep,
      score,
      peakMetrics: { ...currentRepPeaks.current }
    }]);
    
    // Reset peaks for next rep
    currentRepPeaks.current = {
      hipRotation: 0,
      shoulderRotation: 0,
      rightElbowAngle: 0,
      leftElbowAngle: 0,
      rightKneeFlexion: 0,
      leftKneeFlexion: 0,
      spineAngle: 0,
      weightTransfer: 0
    };
  };
  
  // Playback loop with rep cycling
  useEffect(() => {
    if (!isPlaying) return;
    
    const frameRate = 30; // 30 FPS playback
    const frameDuration = (1000 / frameRate) / playbackSpeed; // Adjust duration based on speed
    
    const playFrame = (timestamp: number) => {
	      if (timestamp - lastFrameTimeRef.current >= frameDuration) {
	        setCurrentFrameIndex(prev => {
	          // Check if we reached the end of the current rep segment
	          if (prev >= currentRepFrames.length - 1) {
	            // End of one rep cycle
	            
	            // If we have multiple reps selected, move to next one
	            if (currentRep < selectedReps) {
	              // More reps to do - save score, reset, and continue
	              finishCurrentRep();
	              setCurrentRep(r => r + 1);
	              return 0; // Reset to beginning for next rep
	            } else {
	              // All reps complete - loop the LAST rep or stop?
	              // User requirement: "Replay for each rep was just looping the whole session"
	              // Fix: Stop at end, show summary. User can manually click reps to replay them.
	              finishCurrentRep();
	              setIsPlaying(false);
	              setShowRepSummary(true);
	              return 0; // Reset to start of this rep (paused)
	            }
	          }
	          return prev + 1;
	        });
	        lastFrameTimeRef.current = timestamp;
	      }
      
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(playFrame);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(playFrame);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentRepFrames.length, playbackSpeed, currentRep, selectedReps]);
  
  // Detect current phase for display (but don't lock hologram to it)
  useEffect(() => {
    if (!currentRepFrames[currentFrameIndex]) return;
    
    const currentFrame = currentRepFrames[currentFrameIndex];
    
    // Detect which phase the user is currently in
    const phaseInfo = getPhaseForFrame(currentFrameIndex, currentRepFrames.length);
    setCurrentPhase(phaseInfo.name as MotionPhase);
    setPhaseInstruction(phaseInfo.instruction);
  }, [currentFrameIndex, currentRepFrames]);
  
  // Render current frame
  useEffect(() => {
    if (!currentRepFrames[currentFrameIndex]) return;
    
    const currentFrame = currentRepFrames[currentFrameIndex];
    
    // Render user motion
    if (userCanvasRef.current) {
      const canvas = userCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw user landmarks (filter out face landmarks 0-10 so user can see their face)
        const bodyLandmarks = currentFrame.landmarks.slice(11); // Only body landmarks (11-32)
        
        // Draw connections (POSE_CONNECTIONS automatically handles body connections)
        drawConnectors(ctx, currentFrame.landmarks, POSE_CONNECTIONS, {
          color: '#00ff00',
          lineWidth: 2
        });
        
        // Draw only body landmark points (skip face)
        currentFrame.landmarks.forEach((landmark: any, index: number) => {
          if (index >= 11) { // Only draw body landmarks
            ctx.beginPath();
            ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 3, 0, 2 * Math.PI);
            ctx.fillStyle = '#00ff00';
            ctx.fill();
          }
        });
      }
    }
    
    // Render professional hologram (plays through full animation)
    if (proCanvasRef.current && professionalFrames[currentFrameIndex]) {
      const canvas = proCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const proFrame = professionalFrames[currentFrameIndex];
      
      if (ctx && proFrame) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw holographic effect (glowing wireframe) - filter face landmarks
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff00ff';
              // Calculate body center (hip midpoint) for rotation pivot
        const leftHip = proFrame.landmarks[23];
        const rightHip = proFrame.landmarks[24];
        const bodyCenterX = (leftHip.x + rightHip.x) / 2;
        const bodyCenterZ = (leftHip.z + rightHip.z) / 2;
        
        // Apply Y-axis rotation around body center (user-controlled viewing angle)
        // Add 180° offset so 0° faces forward (not backward)
        const rotationRad = ((rotationAngle + 180) * Math.PI) / 180;
        const cosTheta = Math.cos(rotationRad);
        const sinTheta = Math.sin(rotationRad);
        
        const rotatedLandmarks = proFrame.landmarks.map((lm: any) => {
          // Translate to body center
          const relX = lm.x - bodyCenterX;
          const relZ = lm.z - bodyCenterZ;
          
          // Rotate around Y-axis: x' = x*cos(θ) + z*sin(θ), z' = -x*sin(θ) + z*cos(θ)
          const rotatedX = relX * cosTheta + relZ * sinTheta;
          const rotatedZ = -relX * sinTheta + relZ * cosTheta;
          
          // Translate back
          return {
            ...lm,
            x: rotatedX + bodyCenterX,
            z: rotatedZ + bodyCenterZ
          };
        });
        
        // Normalize coordinates to fix proportions and centering
        // Find bounding box
        const allX = rotatedLandmarks.map((lm: any) => lm.x);
        const allY = rotatedLandmarks.map((lm: any) => lm.y);
        const minX = Math.min(...allX);
        const maxX = Math.max(...allX);
        const minY = Math.min(...allY);
        const maxY = Math.max(...allY);
        
        const width = maxX - minX;
        const height = maxY - minY;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        
        // Normalize to 0.2-0.8 range (centered with padding)
        const normalizedLandmarks = rotatedLandmarks.map((lm: any) => ({
          ...lm,
          x: 0.5 + ((lm.x - centerX) / width) * 0.6,  // Scale to 60% of canvas width
          y: 0.5 + ((lm.y - centerY) / height) * 0.6  // Scale to 60% of canvas height
        }));
        
        // No mirroring needed - MediaPipe coordinates are correct as-is
        // The rotation control handles viewing angle
        const mirroredLandmarks = normalizedLandmarks;
        
        // Apply 3D perspective transformation with MINIMAL scaling to maintain proportions
        const transformedLandmarks = mirroredLandmarks.map((lm: any, index: number) => {
          const depth = lm.z || 0;
          
          // Isometric projection: shift x based on z-depth
          const perspectiveShift = depth * 0.3;
          const projectedX = lm.x + perspectiveShift;
          
          // NO scaling - keep hologram stationary
          const scale = 1.0;
          
          // Opacity based on depth (subtle)
          const opacity = Math.max(0.7, Math.min(1.0, 1.0 - depth * 0.3));
          
          // Magenta/Purple color with depth-based brightness
          const brightness = Math.max(0.7, Math.min(1.0, 1.0 - depth * 0.3));
          const r = Math.floor(255 * brightness);
          const g = Math.floor(0 * brightness);
          const b = Math.floor(255 * brightness);
          
          return {
            ...lm,
            x: projectedX,
            y: lm.y,
            scale,
            opacity,
            depth,
            color: { r, g, b }
          };
        });
        
        // Draw connections with depth-based styling
        // We need to manually draw connections to apply depth effects
        const connections = [
          [11, 13], [13, 15], // Left arm
          [12, 14], [14, 16], // Right arm
          [11, 12], // Shoulders
          [11, 23], [12, 24], // Torso
          [23, 24], // Hips
          [23, 25], [25, 27], // Left leg
          [24, 26], [26, 28], // Right leg
        ];
        
        connections.forEach(([startIdx, endIdx]) => {
          const start = transformedLandmarks[startIdx];
          const end = transformedLandmarks[endIdx];
          
          if (start && end) {
            const avgOpacity = (start.opacity + end.opacity) / 2;
            const avgDepth = (start.depth + end.depth) / 2;
            const avgColor = {
              r: Math.floor((start.color.r + end.color.r) / 2),
              g: Math.floor((start.color.g + end.color.g) / 2),
              b: Math.floor((start.color.b + end.color.b) / 2)
            };
            
            ctx.beginPath();
            ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
            ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
            
            // Depth-based color gradient - UNIFORM thickness
            ctx.strokeStyle = `rgba(${avgColor.r}, ${avgColor.g}, ${avgColor.b}, ${avgOpacity})`;
            ctx.lineWidth = 3; // Uniform line width
            ctx.stroke();
          }
        });
        
        // Draw ALL landmark points (matching user's style with visible dots)
        transformedLandmarks.forEach((landmark: any, index: number) => {
          // Draw all 33 landmarks as visible dots (like user's green skeleton)
          const radius = 5 * (landmark.scale || 1.0); // Scale with depth
          
          ctx.beginPath();
          ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, radius, 0, 2 * Math.PI);
          
          // Magenta/Purple fill (professional reference color)
          ctx.fillStyle = `rgba(${landmark.color.r}, ${landmark.color.g}, ${landmark.color.b}, ${landmark.opacity})`;
          ctx.fill();
          
          // Cyan outline for depth (brighter for closer landmarks)
          const outlineOpacity = landmark.depth < 0 ? landmark.opacity : landmark.opacity * 0.6;
          ctx.strokeStyle = `rgba(0, 255, 255, ${outlineOpacity})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        });
        
        ctx.shadowBlur = 0;
      }
    }
  }, [currentFrameIndex, recordedFrames, isRightHanded, rotationAngle]);
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const skipBackward = () => {
    setCurrentFrameIndex(Math.max(0, currentFrameIndex - 30));
  };
  
  const skipForward = () => {
    setCurrentFrameIndex(Math.min(recordedFrames.length - 1, currentFrameIndex + 30));
  };
  
  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(e.target.value);
    setCurrentFrameIndex(newIndex);
    setIsPlaying(false);
  };
  
  const handleSaveSession = () => {
    // Create session data structure
    const sessionData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      motionName,
      recordedFrames,
      detailedAnalysis,
      duration: (recordedFrames.length / 30).toFixed(1), // Duration in seconds
      frameCount: recordedFrames.length
    };
    
    // Get existing sessions from localStorage
    const existingSessions = JSON.parse(localStorage.getItem('alignedSessions') || '[]');
    
    // Add new session
    existingSessions.push(sessionData);
    
    // Save back to localStorage
    localStorage.setItem('alignedSessions', JSON.stringify(existingSessions));
    
    // Show success confirmation
    setSavedSessionCount(existingSessions.length);
    setShowSaveConfirmation(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowSaveConfirmation(false);
    }, 5000);
  };
  
  const currentMetrics = currentRepFrames[currentFrameIndex]?.metrics;
  const currentVisibility = currentRepFrames[currentFrameIndex]?.visibility;
  const progress = (currentFrameIndex / (currentRepFrames.length - 1)) * 100;
  
  // Track peak metrics for current rep
  useEffect(() => {
    if (!currentMetrics) return;
    
    // Update peaks if current values are higher (only for visible metrics)
    if (currentVisibility?.hipRotation && Math.abs(currentMetrics.hipRotation) > Math.abs(currentRepPeaks.current.hipRotation)) {
      currentRepPeaks.current.hipRotation = currentMetrics.hipRotation;
    }
    if (currentVisibility?.shoulderRotation && Math.abs(currentMetrics.shoulderRotation) > Math.abs(currentRepPeaks.current.shoulderRotation)) {
      currentRepPeaks.current.shoulderRotation = currentMetrics.shoulderRotation;
    }
    if (currentVisibility?.rightElbow && currentMetrics.rightElbowAngle > currentRepPeaks.current.rightElbowAngle) {
      currentRepPeaks.current.rightElbowAngle = currentMetrics.rightElbowAngle;
    }
    if (currentVisibility?.leftElbow && currentMetrics.leftElbowAngle > currentRepPeaks.current.leftElbowAngle) {
      currentRepPeaks.current.leftElbowAngle = currentMetrics.leftElbowAngle;
    }
    if (currentVisibility?.rightKnee && currentMetrics.rightKneeFlexion > currentRepPeaks.current.rightKneeFlexion) {
      currentRepPeaks.current.rightKneeFlexion = currentMetrics.rightKneeFlexion;
    }
    if (currentVisibility?.leftKnee && currentMetrics.leftKneeFlexion > currentRepPeaks.current.leftKneeFlexion) {
      currentRepPeaks.current.leftKneeFlexion = currentMetrics.leftKneeFlexion;
    }
    if (currentVisibility?.spineAngle && Math.abs(currentMetrics.spineAngle) > Math.abs(currentRepPeaks.current.spineAngle)) {
      currentRepPeaks.current.spineAngle = currentMetrics.spineAngle;
    }
    if (currentVisibility?.weightTransfer && currentMetrics.weightTransfer > currentRepPeaks.current.weightTransfer) {
      currentRepPeaks.current.weightTransfer = currentMetrics.weightTransfer;
    }
  }, [currentMetrics, currentVisibility]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 md:gap-3 flex-wrap">
            <Button onClick={onBack} variant="outline" className="text-sm md:text-base">
              ← Back to Analysis
            </Button>
            <Button onClick={handleSaveSession} className="bg-green-600 hover:bg-green-700 text-sm md:text-base">
              💾 Save Session
            </Button>
            <Button onClick={() => window.location.href = '/history'} variant="outline" className="!border-2 !border-purple-400 !text-purple-400 hover:bg-purple-400/10 text-sm md:text-base">
              📊 History
            </Button>
          </div>
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-bold">Motion Replay: {motionName}</h1>
            {selectedReps > 1 && (
              <div className="mt-2 flex items-center justify-end gap-3">
                <span className="text-lg font-semibold text-blue-400">
                  Rep {currentRep} of {selectedReps}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: selectedReps }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        // Jump to specific rep
                        setCurrentRep(i + 1);
                        setCurrentFrameIndex(0);
                        setIsPlaying(true);
                      }}
                      className={`w-3 h-3 rounded-full transition-all cursor-pointer hover:scale-125 ${
                        i + 1 < currentRep
                          ? 'bg-green-500 hover:bg-green-400' // Completed
                          : i + 1 === currentRep
                          ? 'bg-blue-500 animate-pulse' // Current
                          : 'bg-gray-600 hover:bg-gray-500' // Upcoming
                      }`}
                      title={`Jump to Rep ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Save Confirmation Modal */}
        {showSaveConfirmation && (
          <div className="fixed top-20 right-6 bg-green-600 text-white rounded-lg shadow-2xl p-6 max-w-md z-50 animate-in slide-in-from-right">
            <div className="flex items-start gap-4">
              <div className="text-4xl">✅</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Session Saved!</h3>
                <p className="text-green-100 mb-4">
                  You now have {savedSessionCount} saved session{savedSessionCount !== 1 ? 's' : ''}.
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => window.location.href = '/history'} 
                    className="bg-white text-green-600 hover:bg-green-50"
                  >
                    📊 View in History
                  </Button>
                  <Button 
                    onClick={() => setShowSaveConfirmation(false)} 
                    variant="outline"
                    className="border-white text-white hover:bg-green-700"
                  >
                    Continue Watching
                  </Button>
                </div>
              </div>
              <button 
                onClick={() => setShowSaveConfirmation(false)}
                className="text-white hover:text-green-200 text-2xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        
        {/* Side-by-Side Replay */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Motion */}
          <div className="bg-[#1a1f2e] rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-green-400">Your Motion</h2>
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <canvas
                ref={userCanvasRef}
                width={640}
                height={480}
                className="w-full h-full"
              />
            </div>
          </div>
          
          {/* Professional Hologram */}
          <div className="bg-[#1a1f2e] rounded-lg p-6">
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-pink-400">Professional Reference</h2>
                <Button 
                  onClick={() => setIsRightHanded(!isRightHanded)} 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                >
                  {isRightHanded ? '🤜 Right-Handed' : '🤛 Left-Handed'}
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 whitespace-nowrap">View Angle:</span>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotationAngle}
                  onChange={(e) => setRotationAngle(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-pink-400 font-mono w-12">{rotationAngle}°</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setRotationAngle(0)} variant="outline" size="sm" className="text-xs">Front</Button>
                <Button onClick={() => setRotationAngle(90)} variant="outline" size="sm" className="text-xs">Side</Button>
                <Button onClick={() => setRotationAngle(180)} variant="outline" size="sm" className="text-xs">Back</Button>
                <Button onClick={() => setRotationAngle(-90)} variant="outline" size="sm" className="text-xs">Other Side</Button>
              </div>
            </div>
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <canvas
                ref={proCanvasRef}
                width={640}
                height={480}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
        
        {/* Playback Controls */}
        <div className="bg-[#1a1f2e] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button onClick={skipBackward} variant="outline" size="lg">
              ⏮ -1s
            </Button>
            <Button onClick={togglePlayPause} size="lg" className="w-32">
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </Button>
            <Button onClick={skipForward} variant="outline" size="lg">
              +1s ⏭
            </Button>
          </div>
          
          {/* Scrubber (Relative to Current Rep) */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm">{(currentFrameIndex / 30).toFixed(1)}s</span>
            <input
              type="range"
              min="0"
              max={currentRepFrames.length - 1}
              value={currentFrameIndex}
              onChange={handleScrub}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentFrameIndex / (currentRepFrames.length - 1)) * 100}%, #374151 ${(currentFrameIndex / (currentRepFrames.length - 1)) * 100}%, #374151 100%)`
              }}
            />
            <span className="text-sm">{(currentRepFrames.length / 30).toFixed(1)}s</span>
          </div>

          {/* Global Session Timeline Editor */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                <span>✂️</span> Global Session Editor (Rep {currentRep})
              </h3>
              <span className="text-xs text-gray-400">Drag handles to adjust this rep's range within the full session</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1 w-16">
                <span className="text-xs text-gray-400">Start</span>
                <span className="text-xs font-mono text-green-400">{((manualBoundaries[currentRep]?.start ?? (repBoundaries.find((b: any) => b.repNumber === currentRep)?.startFrame ?? 0)) / 30).toFixed(2)}s</span>
              </div>
              
              <div className="relative flex-1 h-12">
                {/* Full Session Track */}
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-700 rounded-full -translate-y-1/2 overflow-hidden">
                  {/* Visual markers for other reps could go here */}
                </div>
                
                {/* Selected Range Highlight */}
                <div 
                  className="absolute top-1/2 h-2 bg-blue-500/50 rounded-full -translate-y-1/2 pointer-events-none"
                  style={{
                    left: `${((manualBoundaries[currentRep]?.start ?? (repBoundaries.find((b: any) => b.repNumber === currentRep)?.startFrame ?? 0)) / (recordedFrames.length - 1)) * 100}%`,
                    right: `${100 - ((manualBoundaries[currentRep]?.end ?? (repBoundaries.find((b: any) => b.repNumber === currentRep)?.endFrame ?? recordedFrames.length - 1)) / (recordedFrames.length - 1)) * 100}%`
                  }}
                ></div>
                
                {/* Start Handle (Green) */}
                <input
                  type="range"
                  min="0"
                  max={recordedFrames.length - 1}
                  value={manualBoundaries[currentRep]?.start ?? (repBoundaries.find((b: any) => b.repNumber === currentRep)?.startFrame ?? 0)}
                  onChange={(e) => {
                    const newStart = parseInt(e.target.value);
                    // Get current end from state OR fallback to detected boundary OR fallback to end of recording
                    const currentEnd = manualBoundaries[currentRep]?.end ?? 
                                      (repBoundaries.find((b: any) => b.repNumber === currentRep)?.endFrame) ?? 
                                      (recordedFrames.length - 1);
                    
                    // Allow dragging anywhere as long as start < end
                    if (newStart < currentEnd) {
                      setManualBoundaries(prev => ({
                        ...prev,
                        [currentRep]: { start: newStart, end: currentEnd }
                      }));
                      // Don't reset playback constantly while dragging, it's annoying
                    }
                  }}
                  className="absolute top-0 w-full h-full opacity-0 cursor-ew-resize z-20 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                />
                <div 
                  className="absolute top-1/2 w-4 h-6 bg-green-500 rounded -translate-y-1/2 shadow-lg border border-white cursor-ew-resize z-10 pointer-events-none flex items-center justify-center"
                  style={{ 
                    left: `${((manualBoundaries[currentRep]?.start ?? (repBoundaries.find((b: any) => b.repNumber === currentRep)?.startFrame ?? 0)) / (recordedFrames.length - 1)) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <span className="text-[8px] text-black font-bold">S</span>
                </div>
                
                {/* End Handle (Red) */}
                <input
                  type="range"
                  min="0"
                  max={recordedFrames.length - 1}
                  value={manualBoundaries[currentRep]?.end ?? (repBoundaries.find((b: any) => b.repNumber === currentRep)?.endFrame ?? recordedFrames.length - 1)}
                  onChange={(e) => {
                    const newEnd = parseInt(e.target.value);
                    const currentStart = manualBoundaries[currentRep]?.start ?? (repBoundaries.find((b: any) => b.repNumber === currentRep)?.startFrame ?? 0);
                    
                    // Allow dragging anywhere as long as end > start
                    if (newEnd > currentStart) {
                      setManualBoundaries(prev => ({
                        ...prev,
                        [currentRep]: { start: currentStart, end: newEnd }
                      }));
                    }
                  }}
                  className="absolute top-0 w-full h-full opacity-0 cursor-ew-resize z-20 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                />
                <div 
                  className="absolute top-1/2 w-4 h-6 bg-red-500 rounded -translate-y-1/2 shadow-lg border border-white cursor-ew-resize z-10 pointer-events-none flex items-center justify-center"
                  style={{ 
                    left: `${((manualBoundaries[currentRep]?.end ?? (repBoundaries.find((b: any) => b.repNumber === currentRep)?.endFrame ?? recordedFrames.length - 1)) / (recordedFrames.length - 1)) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <span className="text-[8px] text-white font-bold">E</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1 w-16">
                <span className="text-xs text-gray-400">End</span>
                <span className="text-xs font-mono text-red-400">{((manualBoundaries[currentRep]?.end ?? (repBoundaries.find((b: any) => b.repNumber === currentRep)?.endFrame ?? recordedFrames.length - 1)) / 30).toFixed(2)}s</span>
              </div>
            </div>
            <div className="mt-2 text-center">
               <span className="text-xs text-gray-500">Total Session Length: {(recordedFrames.length / 30).toFixed(1)}s</span>
            </div>
          </div>
          
          {/* Playback Speed Control */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-sm text-gray-400">Speed:</span>
            <div className="flex gap-2">
              <Button 
                onClick={() => setPlaybackSpeed(0.25)} 
                variant={playbackSpeed === 0.25 ? "default" : "outline"} 
                size="sm"
              >
                0.25x
              </Button>
              <Button 
                onClick={() => setPlaybackSpeed(0.5)} 
                variant={playbackSpeed === 0.5 ? "default" : "outline"} 
                size="sm"
              >
                0.5x
              </Button>
              <Button 
                onClick={() => setPlaybackSpeed(0.75)} 
                variant={playbackSpeed === 0.75 ? "default" : "outline"} 
                size="sm"
              >
                0.75x
              </Button>
              <Button 
                onClick={() => setPlaybackSpeed(1)} 
                variant={playbackSpeed === 1 ? "default" : "outline"} 
                size="sm"
              >
                1x
              </Button>
            </div>
          </div>
        </div>
        
        {/* Real-Time Metrics */}
        {currentMetrics && professionalFrames[currentFrameIndex] && (
          <div className="bg-[#1a1f2e] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Real-Time Metrics (Frame {currentFrameIndex + 1}/{recordedFrames.length})</h2>
              <div className="bg-purple-900/50 px-4 py-2 rounded-lg border border-purple-500 max-w-2xl">
                <span className="text-purple-300 font-semibold">{phaseInstruction}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard
                title="Hip Rotation"
                yours={currentMetrics.hipRotation}
                pro={professionalFrames[currentFrameIndex].metrics.hipRotation}
                unit="°"
                yoursFormatted={currentVisibility?.hipRotation ? formatRotationWithSide(currentMetrics.hipRotation, "Hip", isRightHanded) : "Not Visible"}
                proFormatted={formatRotationWithSide(professionalFrames[currentFrameIndex].metrics.hipRotation, "Hip", isRightHanded)}
              />
              <MetricCard
                title="Shoulder Rotation"
                yours={currentMetrics.shoulderRotation}
                pro={professionalFrames[currentFrameIndex].metrics.shoulderRotation}
                unit="°"
                yoursFormatted={currentVisibility?.shoulderRotation ? formatRotationWithSide(currentMetrics.shoulderRotation, "Shoulder", isRightHanded) : "Not Visible"}
                proFormatted={formatRotationWithSide(professionalFrames[currentFrameIndex].metrics.shoulderRotation, "Shoulder", isRightHanded)}
              />
              <MetricCard
                title="Throwing Arm Elbow"
                yours={isRightHanded ? currentMetrics.rightElbowAngle : currentMetrics.leftElbowAngle}
                pro={professionalFrames[currentFrameIndex].metrics.rightElbowAngle}
                unit="°"
                yoursFormatted={(isRightHanded ? currentVisibility?.rightElbow : currentVisibility?.leftElbow) ? undefined : "Not Visible"}
              />
              <MetricCard
                title="Non-Throwing Arm Elbow"
                yours={isRightHanded ? currentMetrics.leftElbowAngle : currentMetrics.rightElbowAngle}
                pro={professionalFrames[currentFrameIndex].metrics.leftElbowAngle}
                unit="°"
                yoursFormatted={(isRightHanded ? currentVisibility?.leftElbow : currentVisibility?.rightElbow) ? undefined : "Not Visible"}
              />
              <MetricCard
                title="Lead Leg Knee"
                yours={isRightHanded ? currentMetrics.leftKneeFlexion : currentMetrics.rightKneeFlexion}
                pro={professionalFrames[currentFrameIndex].metrics.leftKneeFlexion}
                unit="°"
                yoursFormatted={(isRightHanded ? currentVisibility?.leftKnee : currentVisibility?.rightKnee) ? undefined : "Not Visible"}
              />
              <MetricCard
                title="Back Leg Knee"
                yours={isRightHanded ? currentMetrics.rightKneeFlexion : currentMetrics.leftKneeFlexion}
                pro={professionalFrames[currentFrameIndex].metrics.rightKneeFlexion}
                unit="°"
                yoursFormatted={(isRightHanded ? currentVisibility?.rightKnee : currentVisibility?.leftKnee) ? undefined : "Not Visible"}
              />
              <MetricCard
                title="Spine Angle"
                yours={currentMetrics.spineAngle}
                pro={professionalFrames[currentFrameIndex].metrics.spineAngle}
                unit="°"
                yoursFormatted={currentVisibility?.spineAngle ? formatSpineAngle(currentMetrics.spineAngle) : "Not Visible"}
                proFormatted={formatSpineAngle(professionalFrames[currentFrameIndex].metrics.spineAngle)}
              />

              <MetricCard
                title="Weight Distribution"
                yours={currentMetrics.weightTransfer}
                pro={professionalFrames[currentFrameIndex].metrics.weightTransfer}
                unit="%"
                yoursFormatted={currentVisibility?.weightTransfer ? formatWeightDistribution(currentMetrics.weightTransfer) : "Not Visible"}
                proFormatted={formatWeightDistribution(professionalFrames[currentFrameIndex].metrics.weightTransfer)}
              />
            </div>
          </div>
        )}
        
        {/* Detailed Analysis - Shows after replay */}
        {detailedAnalysis && !isPlaying && (
          <div className="max-w-7xl mx-auto mt-8 space-y-6">
            {/* Overall Score */}
            <div className="bg-[#1a1f2e] rounded-lg p-6">
              <h2 className="text-3xl font-bold mb-4">Overall Performance</h2>
              <div className="text-6xl font-bold mb-6">{detailedAnalysis.overallScore}/100</div>
              <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
                <h3 className="text-yellow-400 font-bold mb-2">Priority Focus:</h3>
                <p className="text-yellow-200">{detailedAnalysis.priorityFocus}</p>
              </div>
            </div>
            
            {/* Your Strengths */}
            <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-green-400 mb-6">Your Strengths</h2>
              <div className="space-y-4">
                {detailedAnalysis.strengths.map((strength: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-semibold text-green-300">{strength.title} ({strength.score}/100)</h3>
                    </div>
                    <p className="text-gray-300">{strength.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Improvement Recommendations */}
            <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">Improvement Recommendations</h2>
              <div className="space-y-6">
                {detailedAnalysis.improvements.map((improvement: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-yellow-600 pl-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-semibold text-yellow-300">{improvement.title}</h3>
                      <span className="bg-yellow-900/50 px-3 py-1 rounded text-sm">{improvement.scoreRange}</span>
                    </div>
                    <p className="text-gray-300 mb-2">{improvement.description}</p>
                    <div className="flex items-center gap-2 text-yellow-200">
                      <span>💡</span>
                      <span className="font-semibold">Drill:</span>
                      <span>{improvement.drill}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Power Generation */}
            <div className="bg-[#1a1f2e] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-orange-400 mb-4">Power Generation</h2>
              <div className="space-y-3">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold text-orange-300">{detailedAnalysis.powerGeneration.score}/100</span>
                </div>
                <p className="text-gray-300">Peak Velocity: {detailedAnalysis.powerGeneration.peakVelocity}</p>
                <p className="text-gray-300">Force Transfer: {detailedAnalysis.powerGeneration.forceTransfer}</p>
                <p className="text-orange-200 mt-3">{detailedAnalysis.powerGeneration.recommendation}</p>
              </div>
            </div>
            
            {/* Movement Timing */}
            <div className="bg-[#1a1f2e] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-purple-400 mb-4">Movement Timing & Sequencing</h2>
              <div className="space-y-3">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold text-purple-300">{detailedAnalysis.movementTiming.score}/100</span>
                </div>
                <p className="text-gray-300">Kinetic Chain: {detailedAnalysis.movementTiming.sequenceOrder}</p>
                <p className="text-gray-300">Phase Data: {detailedAnalysis.movementTiming.phaseDurations}</p>
                <p className="text-purple-200 mt-3">{detailedAnalysis.movementTiming.recommendation}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Rep Summary Modal */}
        {showRepSummary && selectedReps > 1 && repScores.length > 0 && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1f2e] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-3xl font-bold text-center mb-6">Session Complete! 🎉</h2>
              
              {/* Overall Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-900/30 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {Math.round(repScores.reduce((sum, r) => sum + r.score, 0) / repScores.length)}
                  </div>
                  <div className="text-sm text-gray-400">Average Score</div>
                </div>
                <div className="bg-green-900/30 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {Math.max(...repScores.map(r => r.score))}
                  </div>
                  <div className="text-sm text-gray-400">Best Rep</div>
                </div>
                <div className="bg-purple-900/30 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {repScores.length}
                  </div>
                  <div className="text-sm text-gray-400">Reps Completed</div>
                </div>
              </div>
              
              {/* Individual Rep Scores */}
              <h3 className="text-xl font-semibold mb-4">Rep Breakdown</h3>
              <div className="space-y-3 mb-8">
                {repScores.map((rep, idx) => {
                  const isBest = rep.score === Math.max(...repScores.map(r => r.score));
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        isBest ? 'bg-green-900/30 border border-green-500' : 'bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold">Rep {rep.repNumber}</span>
                        {isBest && <span className="text-yellow-400">⭐ Best</span>}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm text-gray-400">
                          <div>Hip: {Math.round(rep.peakMetrics.hipRotation)}°</div>
                          <div>Elbow: {Math.round(rep.peakMetrics.rightElbowAngle)}°</div>
                        </div>
                        <div className={`text-2xl font-bold ${
                          rep.score >= 80 ? 'text-green-400' :
                          rep.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {rep.score}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Trend Indicator */}
              {repScores.length >= 2 && (
                <div className="bg-slate-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Trend:</span>
                    {repScores[repScores.length - 1].score > repScores[0].score ? (
                      <span className="text-green-400 font-semibold">↗ Improving (+{repScores[repScores.length - 1].score - repScores[0].score} from first rep)</span>
                    ) : repScores[repScores.length - 1].score < repScores[0].score ? (
                      <span className="text-red-400 font-semibold">↘ Declining ({repScores[repScores.length - 1].score - repScores[0].score} from first rep)</span>
                    ) : (
                      <span className="text-gray-400 font-semibold">→ Consistent</span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  onClick={() => {
                    setShowRepSummary(false);
                    setCurrentRep(1);
                    setRepScores([]);
                    setCurrentFrameIndex(0);
                    setIsPlaying(true);
                    currentRepPeaks.current = {
                      hipRotation: 0,
                      shoulderRotation: 0,
                      rightElbowAngle: 0,
                      leftElbowAngle: 0,
                      rightKneeFlexion: 0,
                      leftKneeFlexion: 0,
                      spineAngle: 0,
                      weightTransfer: 0
                    };
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  🔄 Replay Session
                </Button>
                <Button 
                  onClick={handleSaveSession}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  💾 Save Session
                </Button>
                <Button 
                  onClick={onBack}
                  variant="outline"
                  className="flex-1"
                >
                  ← Back
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, yours, pro, unit, yoursFormatted, proFormatted }: { 
  title: string; 
  yours: number; 
  pro: number; 
  unit: string;
  yoursFormatted?: string;
  proFormatted?: string;
}) {
  const difference = Math.abs(yours - pro);
  
  // Determine color based on difference from professional range
  // Green: within 10° or 10%, Yellow: within 20° or 20%, Red: beyond 20° or 20%
  let colorClass = 'text-red-400';
  let borderColorClass = 'border-red-500';
  let bgColorClass = 'bg-red-900/20';
  let statusText = 'Needs Improvement';
  
  if (yoursFormatted === "Not Visible") {
    // Not visible - use gray
    colorClass = 'text-gray-400';
    borderColorClass = 'border-gray-600';
    bgColorClass = 'bg-gray-800';
    statusText = 'Not Visible';
  } else if (difference <= 10) {
    // Within 10° or 10% - green (within pro range)
    colorClass = 'text-green-400';
    borderColorClass = 'border-green-500';
    bgColorClass = 'bg-green-900/20';
    statusText = 'Within Pro Range';
  } else if (difference <= 20) {
    // Within 20° or 20% - yellow (close)
    colorClass = 'text-yellow-400';
    borderColorClass = 'border-yellow-500';
    bgColorClass = 'bg-yellow-900/20';
    statusText = 'Close';
  }
  
  return (
    <div className={`rounded-lg p-4 border-2 ${borderColorClass} ${bgColorClass}`}>
      <h3 className="text-sm font-semibold mb-2 text-gray-400">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${colorClass}`}>
          {yoursFormatted || `${yours.toFixed(1)}${unit}`}
        </span>
        <span className="text-sm text-gray-500">vs</span>
        <span className="text-lg text-pink-400">
          {proFormatted || `${pro.toFixed(1)}${unit}`}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Diff: {difference.toFixed(1)}{unit}
        </span>
        <span className={`text-xs font-semibold ${colorClass}`}>
          {statusText}
        </span>
      </div>
    </div>
  );
}

