import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Pose, Results } from "@mediapipe/pose";
import { getProfessionalReference, calculateMetricScore, getComparisonText } from "@/data/professionalReferences";
import { calculateRotation, calculateHipShoulderSeparation, formatWeightDistribution, formatSpineAngle, formatRotationAngle } from "@/utils/rotationCalculations";
import { detectRepBoundaries } from "@/utils/repDetection";
import Replay from "./Replay";
import LiveCoachingOverlay from "@/components/LiveCoachingOverlay";
import { useAudio } from "@/contexts/AudioContext";
import { useCloudStorage } from "@/hooks/useCloudStorage";
import { useVoiceCommand } from "@/hooks/useVoiceCommand";

// Detailed analysis data structure
interface DetailedAnalysisData {
  overallScore: number;
  priorityFocus: string;
  strengths: Array<{
    title: string;
    score: number;
    description: string;
  }>;
  detailedAreas: Array<{
    title: string;
    score: number;
    description: string;
    priority: string;
  }>;
  improvements: Array<{
    title: string;
    scoreRange: string;
    description: string;
    drill: string;
  }>;
  biomechanical: Array<{
    title: string;
    yours: string;
    pro: string;
    difference: string;
    recommendation: string;
  }>;
  consistency: {
    score: number;
    trend: string;
  };
  powerGeneration: {
    score: number;
    peakVelocity: string;
    forceTransfer: string;
    recommendation: string;
  };
  movementTiming: {
    score: number;
    sequenceOrder: string;
    phaseDurations: string;
    recommendation: string;
  };
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
  repBoundaries?: Array<{
    repNumber: number;
    startFrame: number;
    endFrame: number;
  }>;
}

console.log('🔥 Analysis.tsx loaded - VERSION WITH PEAK TRACKING - timestamp:', new Date().toISOString());

export default function Analysis() {
  const [location] = useLocation();
  
  // Parse motion info from URL
  const params = new URLSearchParams(window.location.search);
  const motionName = params.get('motion') || 'Unknown Motion';
  const motionDescription = params.get('description') || '';
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const poseRef = useRef<Pose | null>(null);
  const [poseInitialized, setPoseInitialized] = useState(false);
  const processingRef = useRef(false);
  
  // Detection state
  const [landmarksDetected, setLandmarksDetected] = useState(0);
  const [bodyScale, setBodyScale] = useState(0.00);
  const [distance, setDistance] = useState("No pose detected");
  const [rightHandRaised, setRightHandRaised] = useState(false);
  const [leftHandRaised, setLeftHandRaised] = useState(false);
  const [rightFootLifted, setRightFootLifted] = useState(false);
  const [leftFootLifted, setLeftFootLifted] = useState(false);
  
  // Advanced biomechanical metrics
  const [hipRotation, setHipRotation] = useState(0);
  const [rightElbowAngle, setRightElbowAngle] = useState(0);
  const [leftElbowAngle, setLeftElbowAngle] = useState(0);
  const [rightKneeFlexion, setRightKneeFlexion] = useState(0);
  const [leftKneeFlexion, setLeftKneeFlexion] = useState(0);
  const [spineAngle, setSpineAngle] = useState(0);
  
  // Visibility tracking for metrics
  const [metricsVisible, setMetricsVisible] = useState({
    hipRotation: false,
    shoulderRotation: false,
    rightElbow: false,
    leftElbow: false,
    rightKnee: false,
    leftKnee: false,
    spineAngle: false,
    weightTransfer: false
  });
  const [balanceScore, setBalanceScore] = useState(0);
  const [rightShoulderAngle, setRightShoulderAngle] = useState(0);
  const [leftShoulderAngle, setLeftShoulderAngle] = useState(0);
  const [shoulderRotation, setShoulderRotation] = useState(0);
  const [hipShoulderSeparation, setHipShoulderSeparation] = useState(0);
  
  // Footwork metrics
  const [footPositioning, setFootPositioning] = useState(0);
  const [weightTransfer, setWeightTransfer] = useState(0);
  const [strideLength, setStrideLength] = useState(0);
  
  // Peak value tracking (for capturing maximum values during motion)
  const peakHipRotation = useRef(0);
  const peakRightElbowAngle = useRef(0);
  const peakLeftElbowAngle = useRef(0);
  const peakRightKneeFlexion = useRef(0);
  const peakLeftKneeFlexion = useRef(0);
  const peakSpineAngle = useRef(0);
  const peakRightShoulderAngle = useRef(0);
  const peakLeftShoulderAngle = useRef(0);
  const peakFootPositioning = useRef(0);
  const peakWeightTransfer = useRef(0);
  const peakShoulderRotation = useRef(0);
  const peakHipShoulderSeparation = useRef(0);
  
  // Session state
  const [sessionState, setSessionState] = useState<'idle' | 'ready' | 'countdown' | 'capturing' | 'complete'>('idle');
  const isCapturingRef = useRef(false); // Ref to avoid closure issues in onResults
  const [countdown, setCountdown] = useState(5); // Countdown from 5 to 0
  
  // Rep counter for workout mode
  const [selectedReps, setSelectedReps] = useState(1); // Number of reps user wants to do
  const selectedRepsRef = useRef(1); // Ref to keep track of selected reps inside closure
  const [customReps, setCustomReps] = useState('');
  const [currentCaptureRep, setCurrentCaptureRep] = useState(1); // Current rep being captured (live)
  const [completedReps, setCompletedReps] = useState<number[]>([]); // Array of completed rep numbers
  const [feedbackTrigger, setFeedbackTrigger] = useState(false); // Trigger for live coaching
  const [liveCoachingEnabled, setLiveCoachingEnabled] = useState(false); // Toggle for live coaching feature

  // Voice command state
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceCommandFeedback, setVoiceCommandFeedback] = useState<string | null>(null);
  const voiceFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs for voice command callbacks (avoid stale closures)
  const sessionStateRef = useRef(sessionState);
  const cameraActiveRef = useRef(cameraActive);
  const poseInitializedRef = useRef(poseInitialized);
  const startVideoRef = useRef<() => void>(() => {});
  const startCaptureRef = useRef<() => void>(() => {});
  useEffect(() => { sessionStateRef.current = sessionState; }, [sessionState]);
  useEffect(() => { cameraActiveRef.current = cameraActive; }, [cameraActive]);
  useEffect(() => { poseInitializedRef.current = poseInitialized; }, [poseInitialized]);

  const showVoiceFeedback = useCallback((msg: string) => {
    setVoiceCommandFeedback(msg);
    if (voiceFeedbackTimeoutRef.current) clearTimeout(voiceFeedbackTimeoutRef.current);
    voiceFeedbackTimeoutRef.current = setTimeout(() => setVoiceCommandFeedback(null), 2500);
  }, []);

  // Voice command handler - uses refs so it NEVER has stale closures
  const handleVoiceStart = useCallback(() => {
    const state = sessionStateRef.current;
    const camActive = cameraActiveRef.current;
    const poseReady = poseInitializedRef.current;

    console.log(`\u{1F3A4} Voice start handler called. state=${state}, camActive=${camActive}, poseReady=${poseReady}`);

    if (!camActive) {
      showVoiceFeedback('Starting camera...');
      startVideoRef.current();
    } else if ((state === 'ready' || state === 'idle') && poseReady) {
      showVoiceFeedback('Voice command: Start!');
      startCaptureRef.current();
    } else {
      showVoiceFeedback('Not ready yet...');
    }
  }, [showVoiceFeedback]);

  // Only start commands - no stop commands needed (auto-stop works great)
  const voiceCommands = useMemo(() => ({
    'start': handleVoiceStart,
    'go': handleVoiceStart,
    'begin': handleVoiceStart,
    'capture': handleVoiceStart,
  }), [handleVoiceStart]);

  // Enable voice listening even before camera is active so user can say "start" to begin
  const voiceCommand = useVoiceCommand({
    commands: voiceCommands,
    enabled: voiceEnabled,
    onCommandRecognized: (cmd) => {
      console.log(`\u{1F3A4} Voice command recognized: "${cmd}"`);
    },
    onError: (err) => {
      console.warn('\u{1F3A4} Voice recognition error:', err);
      if (err.includes('permission denied')) {
        showVoiceFeedback('Mic access denied');
        setVoiceEnabled(false);
      }
    },
  });

  // Ref to track completedReps inside onResults closure (avoids stale state)
  const completedRepsRef = useRef<number[]>([]);
  useEffect(() => { completedRepsRef.current = completedReps; }, [completedReps]);

  // Watch for completion of all reps AND trigger feedback
  useEffect(() => {
    // If a new rep was just added (length increased), trigger feedback
    if (completedReps.length > 0) {
      console.log(`🎯 Rep completed. Triggering feedback...`);
      setFeedbackTrigger(prev => !prev);
    }

    if (completedReps.length > 0 && completedReps.length >= selectedRepsRef.current) {
      console.log(`🎯 useEffect detected all ${selectedRepsRef.current} reps complete. Triggering stopAndScore...`);
      // Small timeout to ensure state is settled
      const timer = setTimeout(() => {
        stopAndScore();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [completedReps]);
  // Visual feedback removed as per user request
  const captureMotionState = useRef<'neutral' | 'execution' | 'follow_through'>('neutral');
  const captureRepStartFrame = useRef<number>(0);
  const capturedRepBoundaries = useRef<Array<{start: number, end: number}>>([]);
  const captureBaselineMetrics = useRef<any>(null);
  const neutralHoldCounter = useRef<number>(0);  // Frame recording for replay
  const [recordedFrames, setRecordedFrames] = useState<Array<{
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
  }>>([]);
  const recordedFramesRef = useRef<typeof recordedFrames>([]);
  const captureStartTimeRef = useRef<number>(0);
  const [detailedAnalysis, setDetailedAnalysis] = useState<DetailedAnalysisData | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  
  // Video recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  
  // Voice feedback
  // const { audioEnabled, selectedVoice } = useAudio(); // Moved to top level for volume access
  
  const cloudStorage = useCloudStorage();
  
  useEffect(() => {
    // Load total points from cloud or localStorage
    setTotalPoints(cloudStorage.totalPoints);
    
    return () => {
      // Cleanup camera on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [stream]);
  
  // Auto-stop navigation effect (backup path when sessionState is set to 'complete' inside onResults)
  useEffect(() => {
    if (sessionState === 'complete') {
      console.log('🏁 Session complete detected via useEffect - triggering stopAndScore');
      stopAndScore();
    }
  }, [sessionState]);

  // Countdown timer effect
  useEffect(() => {
    if (sessionState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        const newCount = countdown - 1;
        setCountdown(newCount);
        
          // Speak the countdown number
          if (newCount > 0) {
            speak(newCount.toString());
          } else {
            // Countdown finished, start capturing
            speak("Perform your motion now!");
            isCapturingRef.current = true;
            recordedFramesRef.current = []; // Clear previous recording
            captureStartTimeRef.current = Date.now(); // Record start time
            setSessionState('capturing');
            
            // Start video recording
            if (stream) {
              try {
                recordedChunksRef.current = [];
                const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
                
                mediaRecorder.ondataavailable = (event) => {
                  if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                  }
                };
                
                mediaRecorder.onstop = () => {
                  const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                  const url = URL.createObjectURL(blob);
                  setRecordedVideoUrl(url);
                  console.log('🎥 Video recording saved:', url);
                };
                
                mediaRecorder.start();
                mediaRecorderRef.current = mediaRecorder;
                console.log('🎥 MediaRecorder started');
              } catch (e) {
                console.error('❌ Failed to start MediaRecorder:', e);
              }
            }
            
            console.log('▶️ Countdown complete - starting capture');
            console.log('🎥 Frame recording started');
          }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [sessionState, countdown]);
  
  // Helper function to calculate angle between three points (in degrees)
  const calculateAngle = (a: any, b: any, c: any): number => {
    if (!a || !b || !c) return 0;
    
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    
    return angle;
  };
  
  const { audioEnabled, selectedVoice, volume } = useAudio();

  const speak = (text: string) => {
    if (audioEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = volume;
      
      // Use selected voice from context
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => voice.name === selectedVoice) || 
                             voices.find(voice => voice.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const onResults = (results: Results) => {
    console.log('onResults called', results.poseLandmarks ? `${results.poseLandmarks.length} landmarks` : 'no landmarks');
    
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (results.poseLandmarks) {
      const landmarks = results.poseLandmarks;
      
      // Count landmarks with visibility > 0.3 - EXCLUDE face landmarks (0-10)
      // Body landmarks: 11-32 = 22 landmarks
      // + 1 head, + 1 neck, + 3 spine = 27 total
      const bodyLandmarks = landmarks.filter((landmark, index) => 
        index >= 11 && landmark && (landmark.visibility ?? 0) > 0.3
      ).length;
      
      // Add custom landmarks if visible
      let customLandmarks = 0;
      const nose = landmarks[0];
      if (nose && (nose.visibility ?? 0) > 0.3) customLandmarks++; // Head
      
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      if (leftShoulder && rightShoulder) customLandmarks += 4; // Neck + 3 spine landmarks
      
      const totalVisibleLandmarks = bodyLandmarks + customLandmarks;
      setLandmarksDetected(totalVisibleLandmarks);
      
      console.log(`Detected ${totalVisibleLandmarks}/27 visible landmarks (${bodyLandmarks} body + ${customLandmarks} custom)`);
      
      // Calculate body scale and distance
      // (leftShoulder and rightShoulder already declared above)
      
      if (leftShoulder && rightShoulder) {
        const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
        setBodyScale(shoulderWidth);
        
        // Update distance based on landmark count - more lenient thresholds
        if (totalVisibleLandmarks >= 20) {
          setDistance("Optimal distance");
        } else if (totalVisibleLandmarks >= 15) {
          setDistance("Good distance");
        } else if (totalVisibleLandmarks >= 8) {
          setDistance("Move closer to camera");
        } else {
          setDistance("No pose detected");
        }
      }
      
      // Check hand positions with reference thresholds
      const leftWrist = landmarks[15];
      const rightWrist = landmarks[16];
      
      // More lenient hand detection - works at various distances
      const rightHandRaisedDetected = rightWrist && rightShoulder && 
        (rightWrist.visibility ?? 0) > 0.3 && (rightShoulder.visibility ?? 0) > 0.3 &&
        rightWrist.y < rightShoulder.y + 0.15; // More lenient threshold
      
      const leftHandRaisedDetected = leftWrist && leftShoulder && 
        (leftWrist.visibility ?? 0) > 0.3 && (leftShoulder.visibility ?? 0) > 0.3 &&
        leftWrist.y < leftShoulder.y + 0.15; // More lenient threshold
      
      setRightHandRaised(rightHandRaisedDetected);
      setLeftHandRaised(leftHandRaisedDetected);
      
      // Check foot positions with reference thresholds
      const leftAnkle = landmarks[27];
      const rightAnkle = landmarks[28];
      const leftKnee = landmarks[25];
      const rightKnee = landmarks[26];
      
      // FIXED foot detection - Y increases downward, so ankle.y > knee.y when standing
      // When foot lifts UP, ankle.y gets SMALLER (closer to knee.y)
      // Detect when ankle is significantly closer to knee than normal standing position
      const rightAnkleVis = rightAnkle?.visibility ?? 0;
      const rightKneeVis = rightKnee?.visibility ?? 0;
      
      // Calculate distance from knee to ankle
      const rightKneeToAnkleDist = rightAnkle && rightKnee ? Math.abs(rightAnkle.y - rightKnee.y) : 999;
      
      // Foot is lifted if ankle is much closer to knee than normal (< 0.25 in normalized coords)
      const rightFootLiftedDetected = rightAnkle && rightKnee && 
        rightAnkleVis > 0.3 && rightKneeVis > 0.3 && 
        rightKneeToAnkleDist < 0.25; // More lenient threshold for easier detection
      
      const leftAnkleVis = leftAnkle?.visibility ?? 0;
      const leftKneeVis = leftKnee?.visibility ?? 0;
      
      const leftKneeToAnkleDist = leftAnkle && leftKnee ? Math.abs(leftAnkle.y - leftKnee.y) : 999;
      
      const leftFootLiftedDetected = leftAnkle && leftKnee && 
        leftAnkleVis > 0.3 && leftKneeVis > 0.3 && 
        leftKneeToAnkleDist < 0.25; // More lenient threshold for easier detection
      
      console.log('Foot detection:', {
        rightAnkleVis: rightAnkleVis.toFixed(2),
        rightKneeVis: rightKneeVis.toFixed(2),
        rightDist: rightKneeToAnkleDist.toFixed(3),
        rightFootLifted: rightFootLiftedDetected,
        leftDist: leftKneeToAnkleDist.toFixed(3),
        leftFootLifted: leftFootLiftedDetected
      });
      
      setRightFootLifted(rightFootLiftedDetected);
      setLeftFootLifted(leftFootLiftedDetected);
      
      // Advanced biomechanical calculations
      
      // 1. Hip Rotation - measure 3D rotation with directional indicator
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];
      let hipRotationCalc = 0;
      let hipRotationVisible = false;
      if (leftHip && rightHip) {
        hipRotationVisible = (leftHip.visibility ?? 0) > 0.7 && (rightHip.visibility ?? 0) > 0.7;
        const hipRotationResult = calculateRotation(leftHip, rightHip, hipRotationVisible);
        hipRotationCalc = hipRotationResult.angle;
        setHipRotation(hipRotationCalc);
        setMetricsVisible(prev => ({ ...prev, hipRotation: hipRotationVisible }));
      } else {
        setHipRotation(0);
        setMetricsVisible(prev => ({ ...prev, hipRotation: false }));
      }
      
      // 2. Elbow Angles - shoulder, elbow, wrist
      const rightElbow = landmarks[14];
      const leftElbow = landmarks[13];
      
      let rightElbowCalc = 0;
      let leftElbowCalc = 0;
      let rightElbowVisible = false;
      let leftElbowVisible = false;
      
      if (rightShoulder && rightElbow && rightWrist) {
        rightElbowVisible = (rightShoulder.visibility ?? 0) > 0.7 && (rightElbow.visibility ?? 0) > 0.7 && (rightWrist.visibility ?? 0) > 0.7;
        // Use raw angle: bent elbow = low numbers (60-90°), straight = high (170-180°)
        rightElbowCalc = calculateAngle(rightShoulder, rightElbow, rightWrist);
        setRightElbowAngle(rightElbowCalc);
        setMetricsVisible(prev => ({ ...prev, rightElbow: rightElbowVisible }));
      } else {
        setRightElbowAngle(0);
        setMetricsVisible(prev => ({ ...prev, rightElbow: false }));
      }
      
      if (leftShoulder && leftElbow && leftWrist) {
        leftElbowVisible = (leftShoulder.visibility ?? 0) > 0.7 && (leftElbow.visibility ?? 0) > 0.7 && (leftWrist.visibility ?? 0) > 0.7;
        // Use raw angle: bent elbow = low numbers (60-90°), straight = high (170-180°)
        leftElbowCalc = calculateAngle(leftShoulder, leftElbow, leftWrist);
        setLeftElbowAngle(leftElbowCalc);
        setMetricsVisible(prev => ({ ...prev, leftElbow: leftElbowVisible }));
      } else {
        setLeftElbowAngle(0);
        setMetricsVisible(prev => ({ ...prev, leftElbow: false }));
      }
      
      // 3. Knee Flexion - hip, knee, ankle
      let rightKneeCalc = 0;
      let leftKneeCalc = 0;
      let rightKneeVisible = false;
      let leftKneeVisible = false;
           if (rightHip && rightKnee && rightAnkle) {
        rightKneeVisible = (rightHip.visibility ?? 0) > 0.7 && (rightKnee.visibility ?? 0) > 0.7 && (rightAnkle.visibility ?? 0) > 0.7;
        // Use raw angle: bent knee = low numbers (90-120°), straight = high (170-180°)
        rightKneeCalc = calculateAngle(rightHip, rightKnee, rightAnkle);
        setRightKneeFlexion(rightKneeCalc);
        setMetricsVisible(prev => ({ ...prev, rightKnee: rightKneeVisible }));
      } else {
        setRightKneeFlexion(0);
        setMetricsVisible(prev => ({ ...prev, rightKnee: false }));
      }
      
      if (leftHip && leftKnee && leftAnkle) {
        leftKneeVisible = (leftHip.visibility ?? 0) > 0.7 && (leftKnee.visibility ?? 0) > 0.7 && (leftAnkle.visibility ?? 0) > 0.7;
        leftKneeCalc = calculateAngle(leftHip, leftKnee, leftAnkle);
        setLeftKneeFlexion(leftKneeCalc);
        setMetricsVisible(prev => ({ ...prev, leftKnee: leftKneeVisible }));
      } else {
        setLeftKneeFlexion(0);
        setMetricsVisible(prev => ({ ...prev, leftKnee: false }));
      }
      
      // 4. Spine Angle - deviation from vertical (0° = upright, negative = back, positive = forward)
      let spineAngleCalc = 0;
      let spineAngleVisible = false;
      if (leftShoulder && rightShoulder && leftHip && rightHip) {
        spineAngleVisible = (leftShoulder.visibility ?? 0) > 0.7 && (rightShoulder.visibility ?? 0) > 0.7 && (leftHip.visibility ?? 0) > 0.7 && (rightHip.visibility ?? 0) > 0.7;
        
        const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
        const hipMidY = (leftHip.y + rightHip.y) / 2;
        const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
        const hipMidX = (leftHip.x + rightHip.x) / 2;
        
        // Calculate spine angle as deviation from vertical
        // When standing straight: shoulders directly above hips (xDiff ≈ 0), angle = 0°
        // When leaning forward: shoulders ahead of hips (xDiff > 0), angle = positive
        // When leaning back: shoulders behind hips (xDiff < 0), angle = negative
        
        const xDiff = shoulderMidX - hipMidX;
        const yDiff = Math.abs(shoulderMidY - hipMidY); // Always positive (shoulders above hips)
        
        // Calculate angle from vertical using atan
        // atan(xDiff / yDiff) gives deviation from vertical
        spineAngleCalc = Math.atan(xDiff / Math.max(yDiff, 0.01)) * 180 / Math.PI;
        
        setSpineAngle(spineAngleCalc);
        setMetricsVisible(prev => ({ ...prev, spineAngle: spineAngleVisible }));
      } else {
        setSpineAngle(0);
        setMetricsVisible(prev => ({ ...prev, spineAngle: false }));
      }
      
      // 5. Shoulder Angles - for arm positioning
      const neck = landmarks[0]; // Nose as reference
      let rightShoulderCalc = 0;
      let leftShoulderCalc = 0;
      
      if (neck && rightShoulder && rightElbow) {
        rightShoulderCalc = calculateAngle(neck, rightShoulder, rightElbow);
        setRightShoulderAngle(rightShoulderCalc);
      }
      
      if (neck && leftShoulder && leftElbow) {
        leftShoulderCalc = calculateAngle(neck, leftShoulder, leftElbow);
        setLeftShoulderAngle(leftShoulderCalc);
      }
      
      // 6. Balance Score - based on hip alignment and foot positioning
      let balanceCalc = 0;
      if (leftHip && rightHip && leftAnkle && rightAnkle) {
        const hipWidth = Math.abs(leftHip.x - rightHip.x);
        const ankleWidth = Math.abs(leftAnkle.x - rightAnkle.x);
        const hipCenterX = (leftHip.x + rightHip.x) / 2;
        const ankleCenterX = (leftAnkle.x + rightAnkle.x) / 2;
        const centerOffset = Math.abs(hipCenterX - ankleCenterX);
        
        // Balance score: 100 = perfect balance, lower = less balanced
        balanceCalc = Math.max(0, 100 - (centerOffset * 500));
        setBalanceScore(Math.round(balanceCalc));
      }
      
      // 6b. Shoulder Rotation - measure 3D rotation with directional indicator
      // leftShoulder and rightShoulder already declared earlier
      let shoulderRotationCalc = 0;
      let shoulderRotationVisible = false;
      if (leftShoulder && rightShoulder) {
        shoulderRotationVisible = (leftShoulder.visibility ?? 0) > 0.7 && (rightShoulder.visibility ?? 0) > 0.7;
        const shoulderRotationResult = calculateRotation(leftShoulder, rightShoulder, shoulderRotationVisible);
        shoulderRotationCalc = shoulderRotationResult.angle;
        setShoulderRotation(shoulderRotationCalc);
        setMetricsVisible(prev => ({ ...prev, shoulderRotation: shoulderRotationVisible }));
      } else {
        setShoulderRotation(0);
        setMetricsVisible(prev => ({ ...prev, shoulderRotation: false }));
      }
      
      // 6c. Hip-Shoulder Separation - key metric for power generation
      let hipShoulderSeparationCalc = 0;
      if (hipRotationCalc !== 0 && shoulderRotationCalc !== 0) {
        const separationResult = calculateHipShoulderSeparation(hipRotationCalc, shoulderRotationCalc);
        hipShoulderSeparationCalc = separationResult.angle;
        setHipShoulderSeparation(hipShoulderSeparationCalc);
      }
      
      // 7. Footwork Metrics
      let footPositioningCalc = 0;
      let strideLengthCalc = 0;
      let weightTransferCalc = 0;
      
      // Check visibility for footwork metrics
      const anklesVisible = (leftAnkle?.visibility ?? 0) > 0.7 && (rightAnkle?.visibility ?? 0) > 0.7;
      const hipsVisible2 = (leftHip?.visibility ?? 0) > 0.7 && (rightHip?.visibility ?? 0) > 0.7;
      const weightTransferVisible = anklesVisible && hipsVisible2;
      
      if (leftAnkle && rightAnkle && leftHip && rightHip && weightTransferVisible) {
        // Foot Positioning - angle of front foot relative to body center line
        footPositioningCalc = Math.abs(Math.atan2(rightAnkle.y - leftAnkle.y, rightAnkle.x - leftAnkle.x) * 180 / Math.PI);
        setFootPositioning(footPositioningCalc);
        
        // Stride Length - distance between feet
        const strideX = Math.abs(rightAnkle.x - leftAnkle.x);
        const strideY = Math.abs(rightAnkle.y - leftAnkle.y);
        strideLengthCalc = Math.sqrt(strideX * strideX + strideY * strideY);
        setStrideLength(strideLengthCalc);
        
        // Weight Transfer - estimate based on hip position relative to feet
        const hipCenter = (leftHip.y + rightHip.y) / 2;
        const frontFootY = Math.min(leftAnkle.y, rightAnkle.y);
        const backFootY = Math.max(leftAnkle.y, rightAnkle.y);
        const totalDistance = Math.abs(frontFootY - backFootY);
        const hipToFrontDistance = Math.abs(hipCenter - frontFootY);
        
        if (totalDistance > 0.01) { // Require meaningful stride
          weightTransferCalc = (hipToFrontDistance / totalDistance) * 100;
          weightTransferCalc = Math.min(100, Math.max(0, weightTransferCalc));
          setWeightTransfer(weightTransferCalc);
        }
      } else {
        // Reset values when not visible
        setWeightTransfer(0);
        setFootPositioning(0);
      }
      
      // Track peak values during capture session (use ref to avoid closure issues)
      if (isCapturingRef.current) {
        console.log('📈 Tracking peaks - isCapturing:', isCapturingRef.current);
        if (hipRotationCalc > peakHipRotation.current) peakHipRotation.current = hipRotationCalc;
        if (rightElbowCalc > peakRightElbowAngle.current) peakRightElbowAngle.current = rightElbowCalc;
        if (leftElbowCalc > peakLeftElbowAngle.current) peakLeftElbowAngle.current = leftElbowCalc;
        if (rightKneeCalc > peakRightKneeFlexion.current) peakRightKneeFlexion.current = rightKneeCalc;
        if (leftKneeCalc > peakLeftKneeFlexion.current) peakLeftKneeFlexion.current = leftKneeCalc;
        if (spineAngleCalc > peakSpineAngle.current) peakSpineAngle.current = spineAngleCalc;
        if (rightShoulderCalc > peakRightShoulderAngle.current) peakRightShoulderAngle.current = rightShoulderCalc;
        if (leftShoulderCalc > peakLeftShoulderAngle.current) peakLeftShoulderAngle.current = leftShoulderCalc;
        if (footPositioningCalc > peakFootPositioning.current) peakFootPositioning.current = footPositioningCalc;
        if (weightTransferCalc > peakWeightTransfer.current) peakWeightTransfer.current = weightTransferCalc;
        if (Math.abs(shoulderRotationCalc) > Math.abs(peakShoulderRotation.current)) peakShoulderRotation.current = shoulderRotationCalc;
        if (Math.abs(hipShoulderSeparationCalc) > Math.abs(peakHipShoulderSeparation.current)) peakHipShoulderSeparation.current = hipShoulderSeparationCalc;
        
        // HARD KILL SWITCH: Stop recording immediately if we've reached the target reps
        // This prevents "walking over to camera" from being recorded
        // Uses completedRepsRef (not completedReps) to avoid stale closure inside onResults
        if (completedRepsRef.current.length >= selectedRepsRef.current) {
          console.log('🛑 Hard kill switch triggered: Target reps reached. Stopping frame recording.');
          isCapturingRef.current = false;
          setSessionState('complete');
          return; // EXIT IMMEDIATELY
        }

        // Record this frame for replay
        const timestamp = Date.now() - captureStartTimeRef.current;
        recordedFramesRef.current.push({
          timestamp,
          landmarks: JSON.parse(JSON.stringify(landmarks)), // Deep copy
          metrics: {
            hipRotation: hipRotationCalc,
            shoulderRotation: shoulderRotationCalc,
            rightElbowAngle: rightElbowCalc,
            leftElbowAngle: leftElbowCalc,
            rightKneeFlexion: rightKneeCalc,
            leftKneeFlexion: leftKneeCalc,
            spineAngle: spineAngleCalc,
            rightShoulderAngle: rightShoulderCalc,
            leftShoulderAngle: leftShoulderCalc,
            footPositioning: footPositioningCalc,
            weightTransfer: weightTransferCalc
          },
          visibility: {
            hipRotation: hipRotationVisible,
            shoulderRotation: shoulderRotationVisible,
            rightElbow: rightElbowVisible,
            leftElbow: leftElbowVisible,
            rightKnee: rightKneeVisible,
            leftKnee: leftKneeVisible,
            spineAngle: spineAngleVisible,
            weightTransfer: weightTransferVisible
          }
        });
        
        // Real-time rep detection and auto-stop logic
        const currentFrameCount = recordedFramesRef.current.length;
        
        // Set baseline metrics from first 10 frames
        if (currentFrameCount === 10 && !captureBaselineMetrics.current) {
          captureBaselineMetrics.current = {
            hipRotation: hipRotationCalc,
            shoulderRotation: shoulderRotationCalc,
            rightElbowAngle: rightElbowCalc,
            weightTransfer: weightTransferCalc
          };
          console.log('🎯 Baseline metrics set:', captureBaselineMetrics.current);
        }
        
        // Detect motion state changes after baseline is set
        if (captureBaselineMetrics.current && currentFrameCount > 10) {
          const previousState = captureMotionState.current;
          
          // Calculate changes from baseline
          const hipChange = Math.abs(hipRotationCalc - captureBaselineMetrics.current.hipRotation);
          const shoulderChange = Math.abs(shoulderRotationCalc - captureBaselineMetrics.current.shoulderRotation);
          const elbowChange = Math.abs(rightElbowCalc - captureBaselineMetrics.current.rightElbowAngle);
          const totalChange = hipChange + shoulderChange + elbowChange;
          
          // Calculate velocity (change from previous frame)
          const prevFrame = recordedFramesRef.current[currentFrameCount - 2];
          if (prevFrame) {
            const hipVelocity = Math.abs(hipRotationCalc - prevFrame.metrics.hipRotation);
            const shoulderVelocity = Math.abs(shoulderRotationCalc - prevFrame.metrics.shoulderRotation);
            const totalVelocity = hipVelocity + shoulderVelocity;
            
            // POSTURE-BASED NEUTRAL DETECTION (Reverted & Refined)
            // We compare current posture to the captured baseline to determine state
            // This ensures user must actually RETURN to neutral, not just stop moving
            
            let newState: 'neutral' | 'execution' | 'follow_through' = 'neutral';
            
            // Calculate deviation from baseline (how "far" user is from start pose)
            const hipChange = Math.abs(hipRotationCalc - (captureBaselineMetrics.current?.hipRotation || 0));
            const shoulderChange = Math.abs(shoulderRotationCalc - (captureBaselineMetrics.current?.shoulderRotation || 0));
            const elbowChange = Math.abs(rightElbowCalc - (captureBaselineMetrics.current?.rightElbowAngle || 0));
            // Exclude weight change from neutral detection as it's too noisy/variable
            // const weightChange = Math.abs(weightTransferCalc - (captureBaselineMetrics.current?.weightTransfer || 0));
            
            // Only track core posture metrics for neutral return
            const totalChange = hipChange + shoulderChange + elbowChange;
            
            // Thresholds for state detection
            // Neutral: Relaxed thresholds to ensure reps are registered even if user isn't perfectly still
            // totalChange < 100: Allows for ~33 degrees of variance per joint (hips, shoulders, elbow)
            // totalVelocity < 3.0: Ensures user has actually stopped moving
            // MOBILE FIX: Tuned thresholds for responsive stopping (reduced from 180/12.0)
            if ((totalChange < 150 && totalVelocity < 10.0) || (totalVelocity < 5.0)) {
              newState = 'neutral';
            } 
            // Execution: Significant deviation from baseline OR high velocity
            else if (totalChange > 80 || totalVelocity > 10.0) {
              newState = 'execution';
            } 
            // Follow-through: In-between state
            else {
              newState = 'follow_through';
            }
            
            // Detect rep start: neutral → execution
            // MUST have been in neutral for at least 15 frames (0.5s) to prevent rapid re-triggering
            const framesSinceLastRep = currentFrameCount - (captureRepStartFrame.current || 0);
            
            // Get last rep end frame to enforce cool-down
            const lastRepEndFrame = capturedRepBoundaries.current.length > 0 
              ? capturedRepBoundaries.current[capturedRepBoundaries.current.length - 1].end 
              : 0;
            const framesSinceLastRepEnd = currentFrameCount - lastRepEndFrame;
            
            // START CONDITION:
            // 1. Must transition from neutral to execution
            // 2. Must be at least 45 frames (1.5s) since the last rep ended (COOLDOWN)
            // This prevents double-counting if the user wobbles while returning to neutral
            if (previousState === 'neutral' && newState === 'execution' && framesSinceLastRepEnd > 45) {
              // Add EXTENDED PRE-ROLL BUFFER: Start the rep 60 frames (2.0s) BEFORE the movement actually begins
              // This captures the "Setup" / "Ready" phase even if detection is slightly late
              const preRollFrames = 60;
              const actualStartFrame = Math.max(lastRepEndFrame + 1, currentFrameCount - preRollFrames);
              
              captureRepStartFrame.current = actualStartFrame;
              console.log(`🟢 Rep ${currentCaptureRep} started at frame ${actualStartFrame} (with pre-roll)`);
            }
            
            // END CONDITION:
            // 1. Must transition back to neutral (posture matches baseline)
            // 2. Must have lasted at least 36 frames (1.2s) to be a valid rep (MINIMUM DURATION)
            // 3. Must currently be tracking a valid rep
            // 4. NEUTRAL HOLD: Must hold neutral for 10 frames (0.3s) to confirm end
            const repDurationFrames = currentFrameCount - captureRepStartFrame.current;
            
            // Initialize neutral hold counter if entering neutral
            if ((previousState === 'follow_through' || previousState === 'execution') && newState === 'neutral') {
               neutralHoldCounter.current = 0;
            }
            
            // Increment counter if in neutral
            if (newState === 'neutral') {
               neutralHoldCounter.current = (neutralHoldCounter.current || 0) + 1;
            } else {
               neutralHoldCounter.current = 0;
            }

            if (newState === 'neutral' && 
                (neutralHoldCounter.current || 0) >= 20 && // TUNED: Require 20 frames (~0.66s) of neutral hold (slightly faster)
                repDurationFrames > 36 && // Min duration 1.2s
                captureRepStartFrame.current > lastRepEndFrame) { 
              
              // NO BACKDATING:
              // We want to capture the full follow-through and return to neutral.
              // Cutting too early makes the replay confusing.
              // We just use the current frame as the end point.
              const actualEndFrame = currentFrameCount;
              
              console.log(`✅ Rep ${currentCaptureRep} completed at frame ${actualEndFrame}`);
              
              // Save boundary for this rep
              capturedRepBoundaries.current.push({
                start: captureRepStartFrame.current,
                end: actualEndFrame
              });
              
              setCompletedReps(prev => [...prev, currentCaptureRep]);
              
              // Check if this was the final rep
              // Use completedRepsRef (not completedReps) to get the latest value inside the stale closure
              // +1 because setCompletedReps above hasn't propagated yet
              const totalCompleted = completedRepsRef.current.length + 1;
              
              // Trigger live coaching feedback for the completed rep
              // We can't call setFeedbackTrigger directly here because it's inside a closure that might not have the latest state setter
              // However, since we are updating completedReps, we can use a useEffect to watch completedReps and trigger feedback there
              
              if (totalCompleted >= selectedRepsRef.current) {
                console.log(`🏁 All ${selectedRepsRef.current} reps completed! Auto-stopping...`);
                
                // FORCE STOP IMMEDIATELY
                // We set the state to 'complete' directly here to bypass any React delays
                // This prevents any further frames from being processed or the user needing to walk to camera
                isCapturingRef.current = false; // Kill the capture loop instantly
                setSessionState('complete'); // Force UI update
                
                // We DON'T call stopAndScore here anymore.
                // We rely on the useEffect below to trigger it when 'completedReps' updates.
                // This avoids race conditions where the state update hasn't propagated.
              } else {
                // More reps to go
                setCurrentCaptureRep(prev => prev + 1);
                console.log(`🔄 Moving to rep ${currentCaptureRep + 1}`);
              }
            }
            
            captureMotionState.current = newState;
          }
        }
      }
      
      // Log biomechanical metrics (use calculated values, not state)
      console.log('=== BIOMECHANICAL METRICS ===');
      console.log(`Hip Rotation: ${hipRotationCalc.toFixed(1)}°`);
      console.log(`Right Elbow: ${rightElbowCalc.toFixed(1)}° | Left Elbow: ${leftElbowCalc.toFixed(1)}°`);
      console.log(`Right Knee: ${rightKneeCalc.toFixed(1)}° | Left Knee: ${leftKneeCalc.toFixed(1)}°`);
      console.log(`Spine Angle: ${spineAngleCalc.toFixed(1)}°`);
      console.log(`Balance Score: ${balanceCalc.toFixed(1)}/100`);
      console.log(`Right Shoulder: ${rightShoulderCalc.toFixed(1)}° | Left Shoulder: ${leftShoulderCalc.toFixed(1)}°`);
      console.log('--- FOOTWORK METRICS ---');
      console.log(`Foot Positioning: ${footPositioningCalc.toFixed(1)}°`);
      console.log(`Weight Transfer: ${weightTransferCalc.toFixed(1)}%`);
      console.log(`Stride Length: ${strideLengthCalc.toFixed(1)}`);
      console.log('============================');
      
      // Draw skeleton
      drawSkeleton(ctx, landmarks, canvas.width, canvas.height);
    } else {
      setLandmarksDetected(0);
      setBodyScale(0);
      setDistance("No pose detected");
      setRightHandRaised(false);
      setLeftHandRaised(false);
      setRightFootLifted(false);
      setLeftFootLifted(false);
      
      // Reset biomechanical metrics
      setHipRotation(0);
      setRightElbowAngle(0);
      setLeftElbowAngle(0);
      setRightKneeFlexion(0);
      setLeftKneeFlexion(0);
      setSpineAngle(0);
      setBalanceScore(0);
      setRightShoulderAngle(0);
      setLeftShoulderAngle(0);
    }
  };
  
  const drawSkeleton = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    // Draw connections (NO FACE LINES)
    const connections = [
      // Torso
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      // Left leg
      [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
      // Right leg
      [24, 26], [26, 28], [28, 30], [28, 32], [30, 32]
    ];
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      if (startPoint && endPoint && 
          (startPoint.visibility ?? 0) > 0.3 && (endPoint.visibility ?? 0) > 0.3) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x * width, startPoint.y * height);
        ctx.lineTo(endPoint.x * width, endPoint.y * height);
        ctx.stroke();
      }
    });
    
    // Draw landmarks (only visible ones) - EXCLUDE face landmarks (0-10)
    // MediaPipe Pose landmarks: 0-10 are face, 11-32 are body
    ctx.fillStyle = '#00ff00';
    landmarks.forEach((landmark, index) => {
      // Skip face landmarks (indices 0-10: nose, eyes, ears, mouth)
      if (index >= 11 && landmark && (landmark.visibility ?? 0) > 0.3) {
        ctx.beginPath();
        ctx.arc(landmark.x * width, landmark.y * height, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
    
    // Add HEAD landmark (top of head) - GREEN dot at very top
    const nose = landmarks[0];
    if (nose && (nose.visibility ?? 0) > 0.3) {
      const headY = nose.y - 0.15; // Position well above nose at TOP of head
      ctx.fillStyle = '#00ff00'; // GREEN like other body landmarks
      ctx.beginPath();
      ctx.arc(nose.x * width, headY * height, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Add NECK landmark (between shoulders)
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    if (leftShoulder && rightShoulder) {
      const neckX = (leftShoulder.x + rightShoulder.x) / 2;
      const neckY = (leftShoulder.y + rightShoulder.y) / 2 - 0.08; // Raised to middle of neck
      ctx.fillStyle = '#4ECDC4'; // Teal for neck
      ctx.beginPath();
      ctx.arc(neckX * width, neckY * height, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw 3 SPINE LANDMARKS down the middle of the body
    // (leftShoulder and rightShoulder already declared above)
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    
    if (leftShoulder && rightShoulder && leftHip && rightHip) {
      // Calculate spine points
      const neckX = (leftShoulder.x + rightShoulder.x) / 2;
      const neckY = (leftShoulder.y + rightShoulder.y) / 2;
      
      const hipX = (leftHip.x + rightHip.x) / 2;
      const hipY = (leftHip.y + rightHip.y) / 2;
      
      const midSpineX = (neckX + hipX) / 2;
      const midSpineY = (neckY + hipY) / 2;
      
      // Draw spine landmarks as larger, distinct colored circles
      // Top spine (neck/upper back) - CYAN
      ctx.fillStyle = '#00FFFF';
      ctx.beginPath();
      ctx.arc(neckX * width, neckY * height, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Mid spine (thoracic) - YELLOW
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath();
      ctx.arc(midSpineX * width, midSpineY * height, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Lower spine (lumbar/hip) - MAGENTA
      ctx.fillStyle = '#FF00FF';
      ctx.beginPath();
      ctx.arc(hipX * width, hipY * height, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw connecting line for spine
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]); // Dashed line
      ctx.beginPath();
      ctx.moveTo(neckX * width, neckY * height);
      ctx.lineTo(midSpineX * width, midSpineY * height);
      ctx.lineTo(hipX * width, hipY * height);
      ctx.stroke();
      ctx.setLineDash([]); // Reset to solid line
    }
  };
  
  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      
      if (videoRef.current && canvasRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setStream(mediaStream);
        setCameraActive(true);
        
        // Initialize MediaPipe Pose
        const pose = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });
        
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        
        pose.onResults(onResults);
        poseRef.current = pose;
        processingRef.current = true;
        
        console.log('MediaPipe Pose initialized, starting frame processing');
        
        // Process video frames
        const processFrame = async () => {
          // UPSTREAM KILL SWITCH: Check if we should stop processing
          // If session is complete, STOP IMMEDIATELY. Do not process another frame.
          if (sessionState === 'complete') {
            console.log('🛑 Upstream kill switch: Session complete. Stopping animation loop.');
            processingRef.current = false;
            return;
          }

          if (videoRef.current && poseRef.current && processingRef.current) {
            try {
              await poseRef.current.send({ image: videoRef.current });
            } catch (error) {
              console.error('Error processing frame:', error);
            }
            requestAnimationFrame(processFrame);
          } else {
            console.log('Frame processing stopped', {
              hasVideo: !!videoRef.current,
              hasPose: !!poseRef.current,
              isProcessing: processingRef.current
            });
          }
        };
        
        // Start processing frames immediately
        processFrame();
        
        // Wait a short moment for MediaPipe to load, then set to ready
        setTimeout(() => {
          setPoseInitialized(true);
          setSessionState('ready');
          // Mute voice commands during speech to prevent self-triggering
          if (voiceCommand.mute) voiceCommand.mute(5000);
          speak("Video capture is ready. You may begin when ready");
        }, 1500);
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      alert("Failed to start camera. Please ensure camera permissions are granted.");
    }
  };
  
  const startCapture = () => {
    // Reset peak values at start of capture
    peakHipRotation.current = 0;
    peakRightElbowAngle.current = 0;
    peakLeftElbowAngle.current = 0;
    peakRightKneeFlexion.current = 0;
    peakLeftKneeFlexion.current = 0;
    peakSpineAngle.current = 0;
    peakRightShoulderAngle.current = 0;
    peakLeftShoulderAngle.current = 0;
    peakFootPositioning.current = 0;
    peakWeightTransfer.current = 0;
    
    // Start countdown instead of immediate capture
    setCountdown(5);
    setSessionState('countdown');
    setCurrentCaptureRep(1); // Reset rep counter
    setCompletedReps([]); // Clear completed reps
    completedRepsRef.current = []; // Also reset the ref immediately
    captureMotionState.current = 'neutral'; // Reset motion state
    captureBaselineMetrics.current = null; // Clear baseline
    captureRepStartFrame.current = 0; // Reset rep start frame
    capturedRepBoundaries.current = []; // Clear rep boundaries
    neutralHoldCounter.current = 0; // Reset neutral hold counter
    console.log('⏱️ Starting 5-second countdown');
    // Mute voice commands during countdown speech to prevent self-triggering
    if (voiceCommand.mute) voiceCommand.mute(7000); // 5s countdown + 2s buffer
    speak("Get ready. Starting in 5 seconds");
  };

  // Keep voice command refs in sync with latest function definitions
  startVideoRef.current = startVideo;
  startCaptureRef.current = startCapture;
  
  // Helper function to get drill recommendation for a metric
  const getDrillForMetric = (metricTitle: string): string => {
    const drills: Record<string, string> = {
      "Hip Rotation": "Medicine ball rotational throws (3 sets of 10)",
      "Elbow Angle": "Wall angels with resistance band (3 sets of 15)",
      "Knee Flexion": "Bodyweight squats focusing on depth (3 sets of 12)",
      "Spine Angle": "Cat-cow stretches and thoracic extensions (2 sets of 10)",
      "Shoulder Angle": "Band pull-aparts and external rotations (3 sets of 15)",
      "Foot Positioning": "Cone drills focusing on foot placement (10 minutes)",
      "Weight Transfer": "Single-leg balance with weight shifts (3 sets of 30 seconds)"
    };
    return drills[metricTitle] || "Practice the motion slowly with focus (10 reps)";
  };

  const stopAndScore = async () => {
    console.log('🛑 stopAndScore function called! sessionState:', sessionState);
    isCapturingRef.current = false; // Stop peak tracking
    console.log('⏹️ Stopped capture - isCapturingRef set to:', isCapturingRef.current);
    
    // Stop video recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      console.log('🎥 MediaRecorder stopped');
    }
    
    // speak("Here's your detailed analysis"); // Removed to prevent double speech
    
    // Get professional reference for this motion
    const category = params.get('category') || '';
    const subcategory = params.get('subcategory') || '';
    console.log('📊 Getting professional reference for:');
    console.log('  category:', category);
    console.log('  subcategory:', subcategory);
    console.log('  motionName:', motionName);
    const professionalRef = getProfessionalReference(category, subcategory, motionName);
    console.log('📊 Professional reference:', professionalRef ? 'FOUND' : 'NOT FOUND (NULL)');
    
    // Calculate scores based on captured biomechanical data vs professional reference
    let biomechanicalData: Array<{
      title: string;
      yours: string;
      pro: string;
      difference: string;
      recommendation: string;
    }> = [];
    
    let overallScore = 75; // Base score
    
    if (professionalRef) {
      // Use PEAK values captured during the motion (not final frame values)
      console.log('=== USING PEAK VALUES FOR SCORING ===');
      console.log(`Peak Hip Rotation: ${peakHipRotation.current.toFixed(1)}°`);
      console.log(`Peak Elbow Angles: R=${peakRightElbowAngle.current.toFixed(1)}° L=${peakLeftElbowAngle.current.toFixed(1)}°`);
      console.log(`Peak Knee Flexion: R=${peakRightKneeFlexion.current.toFixed(1)}° L=${peakLeftKneeFlexion.current.toFixed(1)}°`);
      console.log(`Peak Spine Angle: ${peakSpineAngle.current.toFixed(1)}°`);
      console.log(`Peak Shoulder Angles: R=${peakRightShoulderAngle.current.toFixed(1)}° L=${peakLeftShoulderAngle.current.toFixed(1)}°`);
      console.log(`Peak Foot Positioning: ${peakFootPositioning.current.toFixed(1)}°`);
      console.log(`Peak Weight Transfer: ${peakWeightTransfer.current.toFixed(1)}%`);
      console.log('=====================================');
      
      const userMetrics = [
        { name: "Hip Rotation", value: peakHipRotation.current, metricName: "Hip Rotation" },
        { name: "Elbow Angle", value: (peakRightElbowAngle.current + peakLeftElbowAngle.current) / 2, metricName: "Elbow Flexion" },
        { name: "Knee Flexion", value: (peakRightKneeFlexion.current + peakLeftKneeFlexion.current) / 2, metricName: "Knee Flexion" },
        { name: "Spine Angle", value: peakSpineAngle.current, metricName: "Spine Extension" },
        { name: "Shoulder Angle", value: (peakRightShoulderAngle.current + peakLeftShoulderAngle.current) / 2, metricName: "Shoulder External Rotation" },
        { name: "Foot Positioning", value: peakFootPositioning.current, metricName: "Foot Positioning" },
        { name: "Weight Transfer", value: peakWeightTransfer.current, metricName: "Weight Transfer" }
      ];
      
      let totalScore = 0;
      let metricCount = 0;
      
      userMetrics.forEach(userMetric => {
        const refMetric = professionalRef.metrics.find(m => m.name === userMetric.metricName);
        if (refMetric) {
          const score = calculateMetricScore(userMetric.value, refMetric);
          totalScore += score;
          metricCount++;
          
          const difference = Math.abs(userMetric.value - refMetric.professionalAverage);
          const comparisonText = getComparisonText(userMetric.value, refMetric);
          
          let recommendation = "";
          const distanceFromOptimal = Math.abs(userMetric.value - refMetric.professionalAverage);
          
          if (userMetric.value >= refMetric.optimalRange.min && userMetric.value <= refMetric.optimalRange.max) {
            if (distanceFromOptimal < 2) {
              recommendation = `Perfect alignment! Your ${userMetric.name.toLowerCase()} matches professional mechanics`;
            } else {
              recommendation = `Great alignment - ${userMetric.name.toLowerCase()} within professional range (${refMetric.optimalRange.min}-${refMetric.optimalRange.max}°)`;
            }
          } else {
            const direction = userMetric.value < refMetric.professionalAverage ? "Increase" : "Reduce";
            recommendation = `${direction} ${userMetric.name.toLowerCase()} to align with professional average (${refMetric.professionalAverage}°) for optimal performance`;
          }
          
          const unit = userMetric.name === "Weight Transfer" ? "%" : "°";
          biomechanicalData.push({
            title: userMetric.name,
            yours: `${userMetric.value.toFixed(1)}${unit}`,
            pro: `${refMetric.professionalAverage}${unit}`,
            difference: `${difference.toFixed(1)}${unit}`,
            recommendation
          });
        }
      });
      
      if (metricCount > 0) {
        overallScore = Math.round(totalScore / metricCount);
      }
    } else {
      // Fallback to mock data if no professional reference available
      biomechanicalData = [
        {
          title: "Hip Rotation",
          yours: `${hipRotation.toFixed(1)}°`,
          pro: "61°",
          difference: `${Math.abs(hipRotation - 61).toFixed(1)}°`,
          recommendation: "Work on hip rotation for more power"
        },
        {
          title: "Elbow Angle",
          yours: `${((rightElbowAngle + leftElbowAngle) / 2).toFixed(1)}°`,
          pro: "100°",
          difference: `${Math.abs(((rightElbowAngle + leftElbowAngle) / 2) - 100).toFixed(1)}°`,
          recommendation: "Maintain optimal elbow angle at cocking phase"
        }
      ];
    }
    
    // Generate detailed analysis
    const analysis: DetailedAnalysisData = {
      overallScore,
      priorityFocus: biomechanicalData.length > 0 && biomechanicalData[0].recommendation ? biomechanicalData[0].recommendation : "Focus on form and technique",
      strengths: biomechanicalData
        .filter(metric => {
          const diff = parseFloat(metric.difference.replace('°', ''));
          return diff < 10; // Metrics within 10° of professional
        })
        .slice(0, 3)
        .map(metric => ({
          title: metric.title,
          score: Math.round(100 - (parseFloat(metric.difference.replace('°', '')) / parseFloat(metric.pro.replace('°', ''))) * 100),
          description: metric.recommendation
        })),
      detailedAreas: biomechanicalData
        .filter(metric => {
          const diff = parseFloat(metric.difference.replace('°', ''));
          return diff >= 10; // Metrics that need improvement
        })
        .map(metric => {
          const diff = parseFloat(metric.difference.replace('°', ''));
          const score = Math.round(100 - (diff / parseFloat(metric.pro.replace('°', ''))) * 100);
          return {
            title: metric.title,
            score: Math.max(0, score),
            description: metric.recommendation,
            priority: diff > 20 ? "High" : "Medium"
          };
        }),
      improvements: biomechanicalData
        .filter(metric => {
          const diff = parseFloat(metric.difference.replace('°', ''));
          return diff >= 10;
        })
        .slice(0, 5)
        .map(metric => {
          const currentScore = Math.round(100 - (parseFloat(metric.difference.replace('°', '')) / parseFloat(metric.pro.replace('°', ''))) * 100);
          const targetScore = Math.min(100, currentScore + 15);
          return {
            title: metric.title,
            scoreRange: `${Math.max(0, currentScore)} → ${targetScore}`,
            description: metric.recommendation,
            drill: getDrillForMetric(metric.title)
          };
        }),
      biomechanical: biomechanicalData,
      consistency: {
        score: 81,
        trend: "stable"
      },
      powerGeneration: {
        score: Math.round((peakHipRotation.current / 61) * 100), // Based on PEAK hip rotation vs professional average
        peakVelocity: `${((peakHipRotation.current / 61) * 100).toFixed(1)}% of professional`,
        forceTransfer: `${peakWeightTransfer.current.toFixed(1)}% weight transfer`,
        recommendation: peakWeightTransfer.current < 60 ? "Increase weight transfer to front foot for more power" : "Good power transfer through kinetic chain"
      },
      movementTiming: {
        score: Math.round(((peakHipRotation.current > 40 ? 100 : (peakHipRotation.current / 40) * 100) + (peakSpineAngle.current > 15 ? 100 : (peakSpineAngle.current / 15) * 100)) / 2),
        sequenceOrder: "Hips → Torso → Shoulder → Elbow",
        phaseDurations: `Hip rotation: ${peakHipRotation.current.toFixed(1)}°, Spine angle: ${peakSpineAngle.current.toFixed(1)}°`,
        recommendation: peakHipRotation.current < 40 ? "Initiate movement with hip rotation for better sequencing" : "Good kinetic chain sequencing"
      },
      recordedFrames: recordedFramesRef.current // Include recorded frames for replay
    };
    
    // Use captured rep boundaries if available, otherwise fallback to detection
    if (selectedReps > 1) {
      if (capturedRepBoundaries.current.length > 0) {
        // Use the boundaries we captured in real-time
        analysis.repBoundaries = capturedRepBoundaries.current.map((b, i) => ({
          repNumber: i + 1,
          startFrame: b.start,
          endFrame: b.end
        }));
        console.log(`🎯 Using captured boundaries for ${capturedRepBoundaries.current.length} reps:`, capturedRepBoundaries.current);
      } else {
        // Fallback to post-processing detection if something went wrong
        const boundaries = detectRepBoundaries(
          recordedFramesRef.current.map(f => ({ metrics: f.metrics })),
          selectedReps
        );
        analysis.repBoundaries = boundaries;
        console.log(`🎯 Fallback detection found ${boundaries.length} reps:`, boundaries);
      }
    }
    
    console.log(`🎬 Recorded ${recordedFramesRef.current.length} frames for replay`);
    setDetailedAnalysis(analysis);
    setSessionState('complete');
    setShowDetailedAnalysis(true);
    
    // Award points
    const points = analysis.overallScore;
    const newTotal = totalPoints + points;
    setTotalPoints(newTotal);
    cloudStorage.addPoints(points).catch(console.error);
    
    // REMOVED SPEECH: Replay page will handle the announcement
    // speak("Here is your detailed analysis"); 
  };
  
  const resetSession = () => {
    setSessionState('idle');
    setShowDetailedAnalysis(false);
    setDetailedAnalysis(null);
    setLandmarksDetected(0);
    setDistance("No pose detected");
  };
  
  const getButtonText = () => {
    if (!cameraActive) return "Start Video";
    if (cameraActive && !poseInitialized) return "Initializing MediaPipe...";
    if (sessionState === 'ready') return "Start Capture";
    if (sessionState === 'countdown') return `Starting in ${countdown}...`;
    if (sessionState === 'capturing') return "Stop and Score";
    if (sessionState === 'complete') return "Try Again";
    return "Start Video";
  };
  
  const getButtonClass = () => {
    if (sessionState === 'capturing') {
      return "w-full mt-4 py-6 text-lg bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold";
    }
    if (sessionState === 'countdown') {
      return "w-full mt-4 py-6 text-lg bg-yellow-600 text-white rounded-lg font-bold cursor-not-allowed";
    }
    if (sessionState === 'ready') {
      return "w-full mt-4 py-6 text-lg bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold";
    }
    return "w-full mt-4 py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg";
  };
  
  const handleButtonClick = () => {
    if (!cameraActive) {
      startVideo();
    } else if (sessionState === 'ready') {
      startCapture();
    } else if (sessionState === 'capturing') {
      stopAndScore();
    } else if (sessionState === 'complete') {
      resetSession();
    }
  };
  
  if (showDetailedAnalysis && detailedAnalysis) {
    // Get professional reference for replay
    const category = params.get('category') || '';
    const subcategory = params.get('subcategory') || '';
    const professionalRef = getProfessionalReference(category, subcategory, motionName);
    
    return (
      <>
        <Header />
        <Replay
          recordedFrames={detailedAnalysis.recordedFrames || []}
          professionalReference={professionalRef}
          motionName={motionName}
          onBack={() => setShowDetailedAnalysis(false)}
          detailedAnalysis={detailedAnalysis}
          selectedReps={selectedReps}
          videoUrl={recordedVideoUrl}
        />
      </>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <Link href={`/motions/${params.get('category')}/${params.get('subcategory')}`}>
            <Button variant="outline" className="mb-4">
              ← Back to Motions
            </Button>
          </Link>

          {/* Motion Info */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{motionName}</h1>
            <p className="text-gray-400">{motionDescription}</p>
          </div>

          {/* Video Feed and Detection Status */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Video Feed - Takes up 80% width on large screens */}
            <div className="lg:w-[80%] bg-[#1a1f2e] rounded-lg p-4">
              {/* Live Coaching & Voice Command Toggles */}
              <div className="flex justify-end gap-2 mb-2 flex-wrap">
                {/* Voice Command Toggle */}
                <div 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    voiceEnabled 
                      ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400' 
                      : 'bg-slate-800/80 border-slate-700 text-slate-400'
                  }`}
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  title={voiceCommand.isSupported ? 'Toggle voice commands (say "Start" to begin capture)' : 'Voice commands not supported in this browser'}
                >
                  {voiceCommand.isListening ? (
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                  ) : (
                    <div className={`w-2 h-2 rounded-full transition-colors ${voiceEnabled ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {!voiceCommand.isSupported ? 'Voice: N/A' : voiceCommand.isListening ? 'Listening...' : `Voice: ${voiceEnabled ? 'ON' : 'OFF'}`}
                  </span>
                </div>

                {/* Live Coaching Toggle */}
                <div 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    liveCoachingEnabled 
                      ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                      : 'bg-slate-800/80 border-slate-700 text-slate-400'
                  }`}
                  onClick={() => setLiveCoachingEnabled(!liveCoachingEnabled)}
                >
                  <div className={`w-2 h-2 rounded-full transition-colors ${liveCoachingEnabled ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 'bg-slate-500'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Live Coaching: {liveCoachingEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9', maxHeight: '500px' }}>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover scale-x-[-1]"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full scale-x-[-1]"
                  width={640}
                  height={480}
                />
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <p className="text-xl">Camera not started</p>
                  </div>
                )}
                {/* Voice Command Feedback Overlay */}
                {voiceCommandFeedback && (
                  <div className="absolute top-4 left-4 z-20 bg-emerald-600/90 backdrop-blur-sm rounded-lg px-4 py-2 text-white font-bold text-sm animate-in fade-in slide-in-from-top-2 duration-300 shadow-lg">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                      {voiceCommandFeedback}
                    </div>
                  </div>
                )}

                {/* Voice Listening Indicator - only show when not capturing */}
                {voiceEnabled && voiceCommand.isListening && !voiceCommandFeedback && cameraActive && sessionState !== 'capturing' && sessionState !== 'countdown' && (
                  <div className="absolute top-4 left-4 z-20 bg-slate-900/70 backdrop-blur-sm rounded-lg px-3 py-2 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                    <div className="relative">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                    </div>
                    Say &quot;Start&quot; to begin
                  </div>
                )}

                {/* Countdown Overlay */}
                {sessionState === 'countdown' && countdown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="text-9xl font-bold text-blue-400 animate-pulse">
                        {countdown}
                      </div>
                      <p className="text-2xl text-white mt-4">Get ready...</p>
                    </div>
                  </div>
                )}
                
                {/* Live Rep Counter During Capture - Dots Only */}
                {sessionState === 'capturing' && selectedReps > 1 && (
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-2 border border-blue-500/50">
                    <div className="flex gap-2 justify-center items-center">
                      {Array.from({ length: selectedReps }, (_, i) => i + 1).map((rep) => (
                        <div
                          key={rep}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            completedReps.includes(rep)
                              ? 'bg-green-500 scale-100'
                              : rep === currentCaptureRep
                              ? 'bg-blue-500 animate-pulse scale-125'
                              : 'bg-gray-600 scale-90'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Coaching Overlay */}
                {liveCoachingEnabled && (
                  <LiveCoachingOverlay 
                    isActive={sessionState === 'capturing'}
                    currentRep={currentCaptureRep - 1} // Show feedback for the COMPLETED rep
                    totalReps={selectedReps}
                    audioEnabled={audioEnabled}
                    selectedVoice={selectedVoice}
                    volume={volume}
                    triggerFeedback={feedbackTrigger}
                    metrics={{
                      hipRotation: hipRotation,
                      shoulderRotation: shoulderRotation,
                      rightElbowAngle: rightElbowAngle,
                      spineAngle: spineAngle
                    }}
                    onComplete={() => {
                      // Optional: Handle completion of all feedback
                    }}
                  />
                )}
              </div>

              {/* Rep Selector - Only show when camera is active and ready to capture */}
              {cameraActive && poseInitialized && (sessionState === 'idle' || sessionState === 'ready') && (
                <div className="bg-[#1a1f2e] rounded-lg p-3 mt-2">
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <h3 className="font-semibold text-sm">Rep Counter</h3>
                    <p className="text-sm text-blue-400 font-bold uppercase tracking-wide bg-blue-900/30 px-2 py-1 rounded">Return to starting position to finish</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[1, 3, 5, 10].map((rep) => (
                      <button
                        key={rep}
                        onClick={() => {
                          setSelectedReps(rep);
                          selectedRepsRef.current = rep;
                          setCustomReps('');
                        }}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          selectedReps === rep && !customReps
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        }`}
                      >
                        {rep}
                      </button>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        placeholder="Custom"
                        value={customReps}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomReps(val);
                          if (val && parseInt(val) > 0) {
                            const num = parseInt(val);
                            setSelectedReps(num);
                            selectedRepsRef.current = num;
                          }
                        }}
                        className="w-20 px-3 py-2 rounded-lg bg-slate-700 text-white text-center border border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <span className="text-lg font-bold text-blue-400">{selectedReps} Rep{selectedReps > 1 ? 's' : ''}</span>
                    <span className="text-gray-400 text-sm ml-2">selected</span>
                  </div>
                </div>
              )}

              {/* Control Button */}
              <Button
                onClick={handleButtonClick}
                className={getButtonClass()}
                disabled={(cameraActive && !poseInitialized) || sessionState === 'countdown'}
              >
                {getButtonText()}
              </Button>

              {/* Voice Command Hint - stable visibility based on voiceEnabled, not isListening */}
              {voiceEnabled && sessionState !== 'capturing' && sessionState !== 'countdown' && sessionState !== 'complete' && (
                <div className="mt-2 text-center" style={{ minHeight: '1.5rem' }}>
                  <p className="text-xs text-emerald-400/80">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      </svg>
                      Say &quot;Start&quot;, &quot;Go&quot;, &quot;Begin&quot;, or &quot;Capture&quot; to start hands-free
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Detection Status - Takes up 20% width on large screens */}
            <div className="lg:w-[20%] space-y-4 flex-shrink-0">
              <div className="bg-[#1a1f2e] rounded-lg p-4">
                <h3 className="font-semibold mb-3">Real-Time Detection</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Right Hand Raised</span>
                    <span className={`text-lg font-bold ${rightHandRaised ? 'text-green-400' : 'text-red-400'}`}>
                      {rightHandRaised ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Left Hand Raised</span>
                    <span className={`text-lg font-bold ${leftHandRaised ? 'text-green-400' : 'text-red-400'}`}>
                      {leftHandRaised ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Right Foot Lifted</span>
                    <span className={`text-lg font-bold ${rightFootLifted ? 'text-green-400' : 'text-red-400'}`}>
                      {rightFootLifted ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Left Foot Lifted</span>
                    <span className={`text-lg font-bold ${leftFootLifted ? 'text-green-400' : 'text-red-400'}`}>
                      {leftFootLifted ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1f2e] rounded-lg p-4">
                <h3 className="font-semibold mb-3">Positioning Feedback</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Landmarks:</span>
                    <span className={`text-sm font-semibold ${
                      landmarksDetected > 20 ? 'text-green-400' : 
                      landmarksDetected > 12 ? 'text-yellow-400' : 'text-red-400'
                    }`}>{landmarksDetected}/27</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Body Scale:</span>
                    <span className="text-sm text-gray-400">{bodyScale.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Distance:</span>
                    <span className={`text-sm font-semibold ${
                      distance === 'Optimal distance' ? 'text-green-400' :
                      distance === 'Good distance' ? 'text-yellow-400' :
                      distance === 'Move closer to camera' ? 'text-orange-400' : 'text-red-400'
                    }`}>{distance}</span>
                  </div>
                </div>
              </div>

              {/* Live Biomechanical Metrics */}
              {(sessionState === 'ready' || sessionState === 'capturing') && (
                <div className="bg-[#1a1f2e] rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Live Metrics</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Hip Rotation:</span>
                      <span className="text-cyan-400 font-semibold">
                        {metricsVisible.hipRotation ? formatRotationAngle(hipRotation) : '---'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Shoulder Rotation:</span>
                      <span className="text-cyan-400 font-semibold">
                        {metricsVisible.shoulderRotation ? formatRotationAngle(shoulderRotation) : '---'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">R Elbow:</span>
                      <span className="text-pink-400 font-semibold">
                        {metricsVisible.rightElbow ? `${rightElbowAngle.toFixed(0)}°` : '---'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">L Elbow:</span>
                      <span className="text-pink-400 font-semibold">
                        {metricsVisible.leftElbow ? `${leftElbowAngle.toFixed(0)}°` : '---'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">R Knee:</span>
                      <span className="text-purple-400 font-semibold">
                        {metricsVisible.rightKnee ? `${rightKneeFlexion.toFixed(0)}°` : '---'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">L Knee:</span>
                      <span className="text-purple-400 font-semibold">
                        {metricsVisible.leftKnee ? `${leftKneeFlexion.toFixed(0)}°` : '---'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Spine Angle:</span>
                      <span className="text-yellow-400 font-semibold">
                        {metricsVisible.spineAngle ? `${spineAngle.toFixed(0)}°` : '---'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Weight:</span>
                      <span className="text-green-400 font-semibold">
                        {weightTransfer > 0 ? `${weightTransfer.toFixed(0)}%` : '---'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pro Tips Section */}
              <div className="bg-[#1a1f2e] rounded-lg p-4">
                <h3 className="font-semibold mb-3">Pro Tips · {motionName}</h3>
                <div className="text-xs space-y-1 text-gray-300">
                  <p>• Film in good light, full body in frame</p>
                  <p>• Warm up joints; test range before effort</p>
                  <p>• Two reps at moderate pace help models segment phases</p>
                  {motionName.toLowerCase().includes('jump') && (
                    <>
                      <p>• Elbow alignment</p>
                      <p>• Arc angle</p>
                      <p>• Follow-through</p>
                    </>
                  )}
                  {motionName.toLowerCase().includes('throw') && (
                    <>
                      <p>• Arm motion</p>
                      <p>• Footwork</p>
                      <p>• Release</p>
                    </>
                  )}
                  {motionName.toLowerCase().includes('layup') && (
                    <>
                      <p>• Footwork</p>
                      <p>• Soft touch</p>
                      <p>• Body control</p>
                    </>
                  )}
                  {motionName.toLowerCase().includes('dribbl') && (
                    <>
                      <p>• Hand position</p>
                      <p>• Court vision</p>
                      <p>• Control</p>
                    </>
                  )}
                  {(motionName.toLowerCase().includes('yoga') || motionName.toLowerCase().includes('pose')) && (
                    <>
                      <p>• Alignment</p>
                      <p>• Breathing</p>
                      <p>• Balance</p>
                    </>
                  )}
                  {motionName.toLowerCase().includes('golf') && (
                    <>
                      <p>• Grip</p>
                      <p>• Stance</p>
                      <p>• Swing path</p>
                    </>
                  )}
                  {!motionName.toLowerCase().match(/(jump|throw|layup|dribbl|yoga|pose|golf)/) && (
                    <>
                      <p>• Form</p>
                      <p>• Technique</p>
                      <p>• Consistency</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#050810] py-4 text-center text-gray-400">
        <p>Total Points: {totalPoints}</p>
        <p className="text-sm">Made with Manus</p>
      </footer>
    </div>
  );
}
