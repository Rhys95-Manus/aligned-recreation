import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";
import { generateProfessionalMotion, ProfessionalFrame } from "../utils/professionalMotionGenerator";

interface ReplayProps {
  recordedFrames: Array<{
    timestamp: number;
    landmarks: any[];
    metrics: {
      hipRotation: number;
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
  }>;
  professionalReference: any;
  motionName: string;
  onBack: () => void;
  detailedAnalysis?: any; // Optional detailed analysis data
}

export default function Replay({ recordedFrames, professionalReference, motionName, onBack, detailedAnalysis }: ReplayProps) {
  const userCanvasRef = useRef<HTMLCanvasElement>(null);
  const proCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play on load
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  
  // Generate professional motion sequence (same length as user motion)
  const professionalFrames = useRef<ProfessionalFrame[]>(
    generateProfessionalMotion(recordedFrames.length, "football-throw")
  ).current;
  
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  
  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;
    
    const frameRate = 30; // 30 FPS playback
    const frameDuration = 1000 / frameRate;
    
    const playFrame = (timestamp: number) => {
      if (timestamp - lastFrameTimeRef.current >= frameDuration) {
        setCurrentFrameIndex(prev => {
          if (prev >= recordedFrames.length - 1) {
            setIsPlaying(false);
            return prev;
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
  }, [isPlaying, recordedFrames.length]);
  
  // Render current frame
  useEffect(() => {
    if (!recordedFrames[currentFrameIndex]) return;
    
    const currentFrame = recordedFrames[currentFrameIndex];
    
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
    
    // Render professional hologram
    if (proCanvasRef.current && professionalFrames[currentFrameIndex]) {
      const canvas = proCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const proFrame = professionalFrames[currentFrameIndex];
      
      if (ctx && proFrame) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw holographic effect (glowing wireframe) - filter face landmarks
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff00ff';
        
        // Draw connections
        drawConnectors(ctx, proFrame.landmarks, POSE_CONNECTIONS, {
          color: '#ff00ff',
          lineWidth: 3
        });
        
        // Draw only body landmark points (skip face 0-10)
        proFrame.landmarks.forEach((landmark: any, index: number) => {
          if (index >= 11) { // Only draw body landmarks
            ctx.beginPath();
            ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#ff00ff';
            ctx.fill();
            // Add cyan glow
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        });
        
        ctx.shadowBlur = 0;
      }
    }
  }, [currentFrameIndex, recordedFrames]);
  
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
  
  const currentMetrics = recordedFrames[currentFrameIndex]?.metrics;
  const progress = (currentFrameIndex / (recordedFrames.length - 1)) * 100;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline">
            ← Back to Analysis
          </Button>
          <h1 className="text-3xl font-bold">Motion Replay: {motionName}</h1>
          <div className="w-32"></div>
        </div>
        
        
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
            <h2 className="text-xl font-bold mb-4 text-pink-400">Professional Reference</h2>
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
          
          {/* Scrubber */}
          <div className="flex items-center gap-4">
            <span className="text-sm">{(currentFrameIndex / 30).toFixed(1)}s</span>
            <input
              type="range"
              min="0"
              max={recordedFrames.length - 1}
              value={currentFrameIndex}
              onChange={handleScrub}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #374151 ${progress}%, #374151 100%)`
              }}
            />
            <span className="text-sm">{(recordedFrames.length / 30).toFixed(1)}s</span>
          </div>
        </div>
        
        {/* Real-Time Metrics */}
        {currentMetrics && professionalFrames[currentFrameIndex] && (
          <div className="bg-[#1a1f2e] rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Real-Time Metrics (Frame {currentFrameIndex + 1}/{recordedFrames.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard
                title="Hip Rotation"
                yours={currentMetrics.hipRotation}
                pro={professionalFrames[currentFrameIndex].metrics.hipRotation}
                unit="°"
              />
              <MetricCard
                title="Right Elbow"
                yours={currentMetrics.rightElbowAngle}
                pro={professionalFrames[currentFrameIndex].metrics.rightElbowAngle}
                unit="°"
              />
              <MetricCard
                title="Left Elbow"
                yours={currentMetrics.leftElbowAngle}
                pro={professionalFrames[currentFrameIndex].metrics.leftElbowAngle}
                unit="°"
              />
              <MetricCard
                title="Right Knee"
                yours={currentMetrics.rightKneeFlexion}
                pro={professionalFrames[currentFrameIndex].metrics.rightKneeFlexion}
                unit="°"
              />
              <MetricCard
                title="Left Knee"
                yours={currentMetrics.leftKneeFlexion}
                pro={professionalFrames[currentFrameIndex].metrics.leftKneeFlexion}
                unit="°"
              />
              <MetricCard
                title="Spine Angle"
                yours={currentMetrics.spineAngle}
                pro={professionalFrames[currentFrameIndex].metrics.spineAngle}
                unit="°"
              />
              <MetricCard
                title="Foot Positioning"
                yours={currentMetrics.footPositioning}
                pro={professionalFrames[currentFrameIndex].metrics.footPositioning}
                unit="°"
              />
              <MetricCard
                title="Weight Transfer"
                yours={currentMetrics.weightTransfer}
                pro={professionalFrames[currentFrameIndex].metrics.weightTransfer}
                unit="%"
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
      </div>
    </div>
  );
}

function MetricCard({ title, yours, pro, unit }: { title: string; yours: number; pro: number; unit: string }) {
  const difference = Math.abs(yours - pro);
  const isGood = difference < pro * 0.2; // Within 20% is good
  
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-400">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${isGood ? 'text-green-400' : 'text-yellow-400'}`}>
          {yours.toFixed(1)}{unit}
        </span>
        <span className="text-sm text-gray-500">vs</span>
        <span className="text-lg text-pink-400">
          {pro.toFixed(1)}{unit}
        </span>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Difference: {difference.toFixed(1)}{unit}
      </div>
    </div>
  );
}

