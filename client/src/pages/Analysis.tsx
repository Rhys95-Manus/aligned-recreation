import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";

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
  const [bodyScale, setBodyScale] = useState(1.00);
  const [distance, setDistance] = useState("No pose detected");
  const [rightHandRaised, setRightHandRaised] = useState(false);
  const [leftHandRaised, setLeftHandRaised] = useState(false);
  const [rightFootLifted, setRightFootLifted] = useState(false);
  const [leftFootLifted, setLeftFootLifted] = useState(false);
  
  // Session state
  const [sessionState, setSessionState] = useState<'idle' | 'ready' | 'capturing' | 'complete'>('idle');
  const [score, setScore] = useState<number | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  
  useEffect(() => {
    // Load total points from localStorage
    const saved = localStorage.getItem('totalPoints');
    if (saved) {
      setTotalPoints(parseInt(saved, 10));
    }
    
    return () => {
      // Cleanup camera on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);
  
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
    
    // Simulate capture for 3 seconds
    setTimeout(() => {
      stopCapture();
    }, 3000);
  };
  
  const stopCapture = () => {
    // Calculate score
    const calculatedScore = Math.floor(75 + Math.random() * 25);
    setScore(calculatedScore);
    setSessionState('complete');
    
    // Add points to total
    const newTotal = totalPoints + calculatedScore;
    setTotalPoints(newTotal);
    localStorage.setItem('totalPoints', newTotal.toString());
  };
  
  const resetSession = () => {
    setScore(null);
    setSessionState('ready');
  };
  
  const getButtonText = () => {
    if (!cameraActive) return "Start Video";
    if (sessionState === 'idle') return "Initializing...";
    if (sessionState === 'ready') return "Start Capture";
    if (sessionState === 'capturing') return "Stop";
    if (sessionState === 'complete') return "Try Again";
    return "Start Video";
  };
  
  const handleButtonClick = () => {
    if (!cameraActive) {
      startVideo();
    } else if (sessionState === 'ready') {
      startCapture();
    } else if (sessionState === 'capturing') {
      stopCapture();
    } else if (sessionState === 'complete') {
      resetSession();
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">
      {/* Header */}
      <header className="bg-[#050810] border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold hover:text-blue-400 transition-colors">
            Aligned
          </Link>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-full !border-emerald-600 bg-emerald-600/30 text-white hover:bg-emerald-700"
            >
              Audio: On
            </Button>
            <Button
              variant="outline"
              className="rounded-full !border-orange-400 bg-transparent text-white hover:bg-orange-400/10"
            >
              High Contrast
            </Button>
            <Button
              variant="outline"
              className="rounded-full !border-purple-500 bg-transparent text-white hover:bg-purple-500/10"
            >
              Community
            </Button>
            <Link href="/pricing">
              <Button
                variant="outline"
                className="rounded-full !border-cyan-400 bg-transparent !text-cyan-400 hover:bg-cyan-400/10"
              >
                Pricing
              </Button>
            </Link>
          </div>
        </div>
      </header>

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
              {sessionState === 'complete' && score !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center">
                    <h2 className="text-6xl font-bold text-green-400 mb-4">{score}</h2>
                    <p className="text-2xl">Points Earned!</p>
                  </div>
                </div>
              )}
            </div>
            
            <Button
              onClick={handleButtonClick}
              className="w-full mt-4 py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
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
                  <span className="text-blue-400">{bodyScale}</span>
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
