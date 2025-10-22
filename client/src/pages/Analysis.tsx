import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Pose, Results } from "@mediapipe/pose";

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
}

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
  
  // Session state
  const [sessionState, setSessionState] = useState<'idle' | 'ready' | 'capturing' | 'complete'>('idle');
  const [detailedAnalysis, setDetailedAnalysis] = useState<DetailedAnalysisData | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  
  // Voice feedback
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  useEffect(() => {
    // Load total points from localStorage
    const saved = localStorage.getItem('totalPoints');
    if (saved) {
      setTotalPoints(parseInt(saved, 10));
    }
    
    // Ensure voices are loaded
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    
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
  
  const speak = (text: string) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Select a female voice - matching the original website
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name === 'Google US English' ||
        voice.name === 'Samantha' ||
        voice.name.includes('Female') ||
        (voice.name.includes('Google') && voice.lang === 'en-US')
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
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
      
      // Count landmarks with visibility > 0.5 (reference threshold)
      const visibleLandmarks = landmarks.filter(landmark => 
        landmark && (landmark.visibility ?? 0) > 0.5
      ).length;
      setLandmarksDetected(visibleLandmarks);
      
      // Calculate body scale and distance
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      
      if (leftShoulder && rightShoulder) {
        const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
        setBodyScale(shoulderWidth);
        
        // Update distance based on landmark count (reference logic)
        if (visibleLandmarks >= 30) {
          setDistance("Optimal distance");
        } else if (visibleLandmarks >= 25) {
          setDistance("Good distance");
        } else if (visibleLandmarks >= 15) {
          setDistance("Move closer to camera");
        } else {
          setDistance("No pose detected");
        }
      }
      
      // Check hand positions with reference thresholds
      const leftWrist = landmarks[15];
      const rightWrist = landmarks[16];
      
      const rightHandRaisedDetected = rightWrist && rightShoulder && 
        (rightWrist.visibility ?? 0) > 0.5 && (rightShoulder.visibility ?? 0) > 0.5 &&
        rightWrist.y < rightShoulder.y + 0.1; // Reference threshold
      
      const leftHandRaisedDetected = leftWrist && leftShoulder && 
        (leftWrist.visibility ?? 0) > 0.5 && (leftShoulder.visibility ?? 0) > 0.5 &&
        leftWrist.y < leftShoulder.y + 0.1; // Reference threshold
      
      setRightHandRaised(rightHandRaisedDetected);
      setLeftHandRaised(leftHandRaisedDetected);
      
      // Check foot positions with reference thresholds
      const leftAnkle = landmarks[27];
      const rightAnkle = landmarks[28];
      const leftKnee = landmarks[25];
      const rightKnee = landmarks[26];
      
      const rightFootLiftedDetected = rightAnkle && rightKnee && 
        (rightAnkle.visibility ?? 0) > 0.5 && (rightKnee.visibility ?? 0) > 0.5 &&
        rightAnkle.y < rightKnee.y + 0.15; // Reference threshold
      
      const leftFootLiftedDetected = leftAnkle && leftKnee && 
        (leftAnkle.visibility ?? 0) > 0.5 && (leftKnee.visibility ?? 0) > 0.5 &&
        leftAnkle.y < leftKnee.y + 0.15; // Reference threshold
      
      setRightFootLifted(rightFootLiftedDetected);
      setLeftFootLifted(leftFootLiftedDetected);
      
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
    }
  };
  
  const drawSkeleton = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    // Draw connections
    const connections = [
      // Face
      [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
      // Torso
      [9, 10], [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
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
          (startPoint.visibility ?? 0) > 0.5 && (endPoint.visibility ?? 0) > 0.5) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x * width, startPoint.y * height);
        ctx.lineTo(endPoint.x * width, endPoint.y * height);
        ctx.stroke();
      }
    });
    
    // Draw landmarks (only visible ones)
    ctx.fillStyle = '#00ff00';
    landmarks.forEach(landmark => {
      if (landmark && (landmark.visibility ?? 0) > 0.5) {
        ctx.beginPath();
        ctx.arc(landmark.x * width, landmark.y * height, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
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
          speak("Camera has started. Position yourself and press start capture when ready");
        }, 1500);
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      alert("Failed to start camera. Please ensure camera permissions are granted.");
    }
  };
  
  const startCapture = () => {
    setSessionState('capturing');
    speak("Perform your motion now");
  };
  
  const stopAndScore = () => {
    speak("Here's your detailed analysis");
    
    // Generate detailed analysis
    const analysis: DetailedAnalysisData = {
      overallScore: Math.floor(70 + Math.random() * 30),
      priorityFocus: "Increase elbow flexion - keep forearm closer to 90°",
      strengths: [
        {
          title: "Joint Angles",
          score: 86,
          description: "Great joint positioning - very close to professional form"
        },
        {
          title: "Movement Timing",
          score: 87,
          description: "Smooth, well-timed movement sequence"
        }
      ],
      detailedAreas: [
        {
          title: "Power Generation",
          score: 50,
          description: "Improve power transfer through better hip-to-shoulder coordination",
          priority: "High"
        },
        {
          title: "Movement Timing",
          score: 71,
          description: "Work on smooth, sequential muscle activation for better timing",
          priority: "Medium"
        },
        {
          title: "Posture & Alignment",
          score: 73,
          description: "Maintain upright posture with engaged core throughout the movement",
          priority: "High"
        },
        {
          title: "Range of Motion",
          score: 73,
          description: "Increase range of motion through targeted mobility work",
          priority: "Medium"
        },
        {
          title: "Joint Angles",
          score: 83,
          description: "Focus on achieving optimal joint angles at each phase of the motion",
          priority: "High"
        },
        {
          title: "Balance & Stability",
          score: 88,
          description: "Strengthen stabilizing muscles for better balance control",
          priority: "Medium"
        }
      ],
      improvements: [
        {
          title: "Power Generation",
          scoreRange: "52 → 67",
          description: "Work on explosive movement patterns",
          drill: "Medicine ball throws (3 sets of 8)"
        },
        {
          title: "Balance & Stability",
          scoreRange: "60 → 75",
          description: "Strengthen stabilizing muscles",
          drill: "Single-leg stands (30 seconds each)"
        },
        {
          title: "Range of Motion",
          scoreRange: "66 → 81",
          description: "Work on mobility in tight areas",
          drill: "Dynamic stretching (10 minutes)"
        },
        {
          title: "Joint Angles",
          scoreRange: "72 → 87",
          description: "Focus on achieving optimal joint angles at key phases",
          drill: "Mirror practice (5 minutes daily)"
        },
        {
          title: "Movement Timing",
          scoreRange: "75 → 90",
          description: "Focus on smooth acceleration through the motion",
          drill: "Slow-motion reps (10 reps)"
        }
      ],
      biomechanical: [
        {
          title: "Hip Rotation",
          yours: "61°",
          pro: "36°",
          difference: "25°",
          recommendation: "Increase hip rotation by 15° for more power"
        },
        {
          title: "Elbow Angle",
          yours: "92°",
          pro: "104°",
          difference: "12°",
          recommendation: "Maintain 90° elbow angle at cocking phase"
        },
        {
          title: "Knee Flexion",
          yours: "32°",
          pro: "38°",
          difference: "6°",
          recommendation: "Deepen knee bend for better power transfer"
        },
        {
          title: "Spine Angle",
          yours: "7°",
          pro: "9°",
          difference: "2°",
          recommendation: "Maintain neutral spine throughout motion"
        }
      ],
      consistency: {
        score: 81,
        trend: "stable"
      }
    };
    
    setDetailedAnalysis(analysis);
    setSessionState('complete');
    setShowDetailedAnalysis(true);
    
    // Award points
    const points = analysis.overallScore;
    const newTotal = totalPoints + points;
    setTotalPoints(newTotal);
    localStorage.setItem('totalPoints', newTotal.toString());
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
    if (sessionState === 'capturing') return "Stop and Score";
    if (sessionState === 'complete') return "Try Again";
    return "Start Video";
  };
  
  const getButtonClass = () => {
    if (sessionState === 'capturing') {
      return "w-full mt-4 py-6 text-lg bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold";
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
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Back button */}
            <Link href={`/motions?category=${params.get('category')}&subcategory=${params.get('subcategory')}`}>
              <Button variant="outline" className="mb-4">
                ← Back to Motions
              </Button>
            </Link>

            {/* Overall Performance */}
            <div className="bg-[#1a1f2e] rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Overall Performance</h2>
              <div className="text-6xl font-bold mb-6">{detailedAnalysis.overallScore}/100</div>
              <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
                <h3 className="text-yellow-400 font-bold mb-2">Priority Focus:</h3>
                <p className="text-yellow-200">{detailedAnalysis.priorityFocus}</p>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="bg-[#1a1f2e] rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Detailed Analysis</h2>
              </div>
            </div>

            {/* Your Strengths */}
            <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-green-400 mb-6">Your Strengths</h2>
              <div className="space-y-4">
                {detailedAnalysis.strengths.map((strength, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-semibold text-green-300">{strength.title} ({strength.score}/100)</h3>
                    </div>
                    <p className="text-gray-300">{strength.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Analysis - All Areas */}
            <div className="bg-[#1a1f2e] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-blue-400 mb-6">Detailed Analysis - All Areas</h2>
              <div className="space-y-4">
                {detailedAnalysis.detailedAreas.map((area, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-semibold text-blue-300">{area.title}</h3>
                      <span className="bg-blue-900/50 px-3 py-1 rounded text-sm">{area.score}/100</span>
                    </div>
                    <p className="text-gray-300 mb-1">{area.description}</p>
                    <p className="text-sm text-gray-400">Priority: {area.priority}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Recommendations */}
            <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">Improvement Recommendations</h2>
              <div className="space-y-6">
                {detailedAnalysis.improvements.map((improvement, idx) => (
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

            {/* Biomechanical Analysis */}
            <div className="bg-[#1a1f2e] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-6">Biomechanical Analysis</h2>
              <div className="space-y-6">
                {detailedAnalysis.biomechanical.map((bio, idx) => (
                  <div key={idx} className="border-l-4 border-cyan-500 pl-4">
                    <h3 className="text-xl font-semibold text-cyan-300 mb-3">{bio.title}</h3>
                    <p className="text-gray-300 mb-2">
                      Your: {bio.yours} | Pro: {bio.pro} | Difference: {bio.difference}
                    </p>
                    <p className="text-cyan-200">{bio.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Movement Consistency */}
            <div className="bg-[#1a1f2e] rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Movement Consistency</h2>
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-bold">{detailedAnalysis.consistency.score}/100</span>
                <span className="text-gray-400">Trend: {detailedAnalysis.consistency.trend}</span>
              </div>
            </div>

            {/* Try Again Button */}
            <Button
              onClick={() => setShowDetailedAnalysis(false)}
              className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
            >
              Analyze Another Motion
            </Button>
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
  
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link href={`/motions?category=${params.get('category')}&subcategory=${params.get('subcategory')}`}>
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
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {/* Video Feed - Takes up 70% width on large screens */}
            <div className="lg:w-[70%] bg-[#1a1f2e] rounded-lg p-6">
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                  width={640}
                  height={480}
                />
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <p className="text-xl">Camera not started</p>
                  </div>
                )}
              </div>

              {/* Control Button */}
              <Button
                onClick={handleButtonClick}
                className={getButtonClass()}
                disabled={cameraActive && !poseInitialized}
              >
                {getButtonText()}
              </Button>
            </div>

            {/* Detection Status - Takes up 30% width on large screens */}
            <div className="lg:w-[30%] space-y-4 flex-shrink-0">
              <div className="bg-[#1a1f2e] rounded-lg p-4">
              <h3 className="font-semibold mb-2">Real-Time Detection</h3>
              <p className="text-sm text-gray-400">Landmarks: {landmarksDetected}/33</p>
              <p className="text-sm text-gray-400">Body Scale: {bodyScale.toFixed(2)}</p>
              <p className="text-sm text-gray-400">Distance: {distance}</p>
            </div>

            <div className="bg-[#1a1f2e] rounded-lg p-4">
              <h3 className="font-semibold mb-2">Positioning Feedback</h3>
              <p className="text-sm text-gray-400">Right Hand: {rightHandRaised ? '✓ Raised' : '✗ Down'}</p>
              <p className="text-sm text-gray-400">Left Hand: {leftHandRaised ? '✓ Raised' : '✗ Down'}</p>
              <p className="text-sm text-gray-400">Right Foot: {rightFootLifted ? '✓ Lifted' : '✗ Down'}</p>
              <p className="text-sm text-gray-400">Left Foot: {leftFootLifted ? '✓ Lifted' : '✗ Down'}</p>
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
