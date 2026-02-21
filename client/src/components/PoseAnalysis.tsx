import { useEffect, useRef, useState } from "react";
import { Pose, Results, POSE_CONNECTIONS } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

interface PoseAnalysisProps {
  onRepComplete: (feedback: any) => void;
  isActive: boolean;
}

export default function PoseAnalysis({ onRepComplete, isActive }: PoseAnalysisProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  // Use refs for mutable state inside the callback loop to avoid closure staleness
  const stageRef = useRef<"down" | "up">("down");
  const repsRef = useRef(0);
  const lastFeedbackTimeRef = useRef(0);

  const calculateAngle = (a: any, b: any, c: any) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  };

  useEffect(() => {
    if (!isActive || !videoRef.current || !canvasRef.current) return;

    const onResults = (results: Results) => {
      if (!canvasRef.current || !videoRef.current) return;

      const canvasCtx = canvasRef.current.getContext("2d");
      if (!canvasCtx) return;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw the video frame
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.poseLandmarks) {
        // Draw landmarks
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 4,
        });
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: "#FF0000",
          lineWidth: 2,
        });

        // Logic for Kettlebell Snatch / Overhead Press (Simplified)
        // We track the right shoulder (12), right elbow (14), and right wrist (16)
        const landmarks = results.poseLandmarks;
        
        // Right Arm Angle
        const shoulder = landmarks[12];
        const elbow = landmarks[14];
        const wrist = landmarks[16];
        
        // Hip Angle (Right Hip 24, Right Knee 26, Right Ankle 28)
        const hip = landmarks[24];
        const knee = landmarks[26];
        const ankle = landmarks[28];

        if (shoulder && elbow && wrist && hip && knee && ankle) {
          const armAngle = calculateAngle(shoulder, elbow, wrist);
          const legAngle = calculateAngle(hip, knee, ankle);

          // Rep Counting Logic
          // "Up" phase: Arm is extended overhead (angle > 160) AND legs are straight (angle > 160)
          // "Down" phase: Arm is bent (angle < 90) OR squatting (angle < 120)
          
          const now = Date.now();
          
          if (armAngle > 150 && legAngle > 160) {
            if (stageRef.current === "down") {
              stageRef.current = "up";
              repsRef.current += 1;
              
              // Debounce feedback to avoid spamming
              if (now - lastFeedbackTimeRef.current > 2000) {
                lastFeedbackTimeRef.current = now;
                
                // Trigger feedback on rep completion
                onRepComplete({
                  rep: repsRef.current,
                  armAngle: Math.round(armAngle),
                  legAngle: Math.round(legAngle),
                  quality: armAngle > 170 ? "Perfect Extension" : "Extend Fully"
                });
              }
            }
          } else if (armAngle < 100) {
            stageRef.current = "down";
          }
        }
      }
      canvasCtx.restore();
    };

    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await pose.send({ image: videoRef.current });
        }
      },
      width: 1280,
      height: 720,
    });

    camera.start();
    setCameraActive(true);

    return () => {
      camera.stop();
      pose.close();
    };
  }, [isActive, onRepComplete]);

  return (
    <div className="absolute inset-0 z-10">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-0" // Hide video, show canvas overlay
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
        width={1280}
        height={720}
      />
      {!cameraActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
          <p>Starting Camera...</p>
        </div>
      )}
    </div>
  );
}
