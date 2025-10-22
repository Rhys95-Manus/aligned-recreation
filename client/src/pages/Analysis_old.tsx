import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";

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
  const params = new URLSearchParams(location.split('?')[1] || '');
  const motionName = params.get('motion') || 'Unknown Motion';
  const motionDescription = params.get('description') || '';
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
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
  
  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setStream(mediaStream);
        setCameraActive(true);
        
        speak("Camera has started. Position yourself and press start capture when ready");
        
        // Simulate pose detection after 1 second
        setTimeout(() => {
          simulatePoseDetection();
        }, 1000);
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      alert("Failed to start camera. Please ensure camera permissions are granted.");
    }
  };
  
  const simulatePoseDetection = () => {
    // Simulate MediaPipe detection
    setLandmarksDetected(33);
    setBodyScale(0.15);
    setDistance("1.5m");
    setSessionState('ready');
    
    // Removed - no audio cue here
    
    // Randomly update detection status
    const interval = setInterval(() => {
      setRightHandRaised(Math.random() > 0.5);
      setLeftHandRaised(Math.random() > 0.5);
      setRightFootLifted(Math.random() > 0.7);
      setLeftFootLifted(Math.random() > 0.7);
    }, 500);
    
    return () => clearInterval(interval);
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
    
    // Add points to total
    const newTotal = totalPoints + analysis.overallScore;
    setTotalPoints(newTotal);
    localStorage.setItem('totalPoints', newTotal.toString());
    
    speak("Analysis complete. Your score is " + analysis.overallScore + " out of 100.");
  };
  
  const resetSession = () => {
    setDetailedAnalysis(null);
    setShowDetailedAnalysis(false);
    setSessionState('ready');
    speak("Ready for another capture.");
  };
  
  const getButtonText = () => {
    if (!cameraActive) return "Start Video";
    if (sessionState === 'idle') return "Initializing...";
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

        {/* Detailed Analysis Content */}
        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <Button
            variant="outline"
            onClick={() => setShowDetailedAnalysis(false)}
            className="mb-6 rounded-full border-2 border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            ← Back to Video
          </Button>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Overall Performance */}
            <div className="bg-[#1a1f2e] rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Overall Performance</h2>
              <div className="text-6xl font-bold mb-6">{detailedAnalysis.overallScore}/100</div>
              <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
                <h3 className="text-yellow-400 font-bold mb-2">Priority Focus:</h3>
                <p className="text-yellow-200">{detailedAnalysis.priorityFocus}</p>
              </div>
            </div>

            {/* Detailed Analysis Header */}
            <div className="bg-[#1a1f2e] rounded-lg p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Detailed Analysis</h2>
                <button className="text-blue-400 hover:text-blue-300">Show Details</button>
              </div>
            </div>

            {/* Your Strengths */}
            <div className="bg-[#1a1f2e] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-green-400 mb-4">Your Strengths</h2>
              <div className="space-y-4">
                {detailedAnalysis.strengths.map((strength, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">{strength.title} ({strength.score}/100)</h3>
                    </div>
                    <p className="text-gray-300">{strength.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Analysis - All Areas */}
            <div className="bg-[#1a1f2e] rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Detailed Analysis - All Areas</h2>
              <div className="space-y-6">
                {detailedAnalysis.detailedAreas.map((area, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-semibold text-blue-400">{area.title}</h3>
                      <span className="text-lg font-bold">{area.score}/100</span>
                    </div>
                    <p className="text-gray-300 mb-2">{area.description}</p>
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
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#050810] border-t border-gray-800 px-6 py-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">Total Points: {totalPoints}</p>
            <p className="text-gray-500 text-sm">Made with Manus</p>
          </div>
        </footer>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mb-6 rounded-full border-2 border-white/20 bg-transparent text-white hover:bg-white/10"
        >
          ← Back
        </Button>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">{motionName}</h1>
          <p className="text-gray-400">{motionDescription}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <div className="lg:col-span-2">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ display: cameraActive ? 'block' : 'none' }}
                autoPlay
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ display: cameraActive ? 'block' : 'none' }}
              />
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p className="text-sm mb-2">Live · IDLE · Ghost: default</p>
                    <p>Camera will appear here</p>
                  </div>
                </div>
              )}
              {sessionState === 'complete' && detailedAnalysis && !showDetailedAnalysis && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center">
                    <h2 className="text-6xl font-bold text-green-400 mb-4">{detailedAnalysis.overallScore}</h2>
                    <p className="text-2xl mb-4">Points Earned!</p>
                    <Button
                      onClick={() => setShowDetailedAnalysis(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
                    >
                      View Detailed Analysis
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <Button
              onClick={handleButtonClick}
              className={getButtonClass()}
            >
              {getButtonText()}
            </Button>
          </div>
          
          {/* Side Panels */}
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-[#1a1f2e] rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Controls</h3>
              <p className="text-gray-400 text-sm">
                Use the smart button below the video to control your session
              </p>
            </div>
            
            {/* Real-time Detection Status */}
            <div className="bg-[#1a1f2e] rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Real-time Detection Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Right Hand Raised</span>
                  <span className={rightHandRaised ? "text-green-400" : "text-red-400"}>
                    {rightHandRaised ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Left Hand Raised</span>
                  <span className={leftHandRaised ? "text-green-400" : "text-red-400"}>
                    {leftHandRaised ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Right Foot Lifted</span>
                  <span className={rightFootLifted ? "text-green-400" : "text-red-400"}>
                    {rightFootLifted ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Left Foot Lifted</span>
                  <span className={leftFootLifted ? "text-green-400" : "text-red-400"}>
                    {leftFootLifted ? "✓" : "✗"}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Positioning Feedback */}
            <div className="bg-[#1a1f2e] rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Positioning Feedback</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Landmarks Detected:</span>
                  <span className="text-blue-400">{landmarksDetected}/33</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Body Scale:</span>
                  <span className="text-blue-400">{bodyScale.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Distance:</span>
                  <span className="text-yellow-400">{distance}</span>
                </div>
              </div>
            </div>
            
            {/* Pro Tips */}
            <div className="bg-[#1a1f2e] rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Pro Tips · {motionName}</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Film in good light, full body in frame</li>
                <li>• Warm up joints; test range before effort</li>
                <li>• Two reps at moderate pace help models segment phases</li>
                <li>• Focus on form over speed</li>
                <li>• Keep consistent distance from camera</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#050810] border-t border-gray-800 px-6 py-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-400">Total Points: {totalPoints}</p>
          <p className="text-gray-500 text-sm">Made with Manus</p>
        </div>
      </footer>
    </div>
  );
}
