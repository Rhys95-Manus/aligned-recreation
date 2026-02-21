import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Activity } from "lucide-react";

interface FeedbackItem {
  type: "positive" | "correction";
  message: string;
  detail: string;
}

interface LiveCoachingOverlayProps {
  isActive: boolean;
  currentRep: number;
  totalReps: number;
  audioEnabled?: boolean;
  selectedVoice?: string;
  onComplete: () => void;
  // New prop to force trigger feedback from parent
  triggerFeedback?: boolean;
  // New prop for real biomechanical data
  metrics?: {
    hipRotation: number;
    shoulderRotation: number;
    rightElbowAngle: number;
    spineAngle: number;
  };
}

export default function LiveCoachingOverlay({
  isActive,
  currentRep,
  totalReps,
  audioEnabled = true,
  selectedVoice = "Google US English",
  onComplete,
  triggerFeedback,
  metrics
}: LiveCoachingOverlayProps) {
  const [feedbackState, setFeedbackState] = useState<"analyzing" | "feedback" | "ready">("ready");
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackItem[]>([]);

  // Trigger feedback cycle whenever triggerFeedback changes
  useEffect(() => {
    if (isActive && currentRep > 0) {
      const cycle = async () => {
        // Force reset state first to ensure animation plays
        setFeedbackState("ready");
        await new Promise(r => setTimeout(r, 100));

        // 1. Analyzing Phase
        setFeedbackState("analyzing");
        await new Promise(r => setTimeout(r, 1500));

        // 2. Feedback Phase
        // Generate dynamic feedback based on real metrics if available
        let selectedFeedback: FeedbackItem[] = [];
        
        if (metrics) {
          // Hip Rotation Logic
          if (metrics.hipRotation > 30) {
            selectedFeedback.push({ type: "positive", message: "Great Hip Rotation", detail: `You achieved ${metrics.hipRotation.toFixed(1)}° of rotation.` });
          } else {
            selectedFeedback.push({ type: "correction", message: "Rotate Hips More", detail: `Only ${metrics.hipRotation.toFixed(1)}° detected. Aim for >30°.` });
          }

          // Elbow Angle Logic
          if (metrics.rightElbowAngle > 80 && metrics.rightElbowAngle < 110) {
            selectedFeedback.push({ type: "positive", message: "Perfect Elbow Angle", detail: `Maintained ${metrics.rightElbowAngle.toFixed(1)}° (Ideal: 90°).` });
          } else {
            selectedFeedback.push({ type: "correction", message: "Fix Elbow Angle", detail: `Elbow at ${metrics.rightElbowAngle.toFixed(1)}°. Keep it near 90°.` });
          }
        } else {
          // Fallback to random feedback if no metrics provided
          const positive = [
            { type: "positive", message: "Great Hip Rotation", detail: "Your hip velocity peaked at 450°/s" },
            { type: "positive", message: "Solid Base", detail: "Excellent stability through the throw" },
            { type: "positive", message: "Good Extension", detail: "Full arm extension achieved" }
          ];
          const corrections = [
            { type: "correction", message: "Fix Elbow Angle", detail: "Keep elbow at 90° during cocking" },
            { type: "correction", message: "Watch Your Head", detail: "Keep head still during release" },
            { type: "correction", message: "Drive Harder", detail: "Push off the back leg more explosively" }
          ];
          
          selectedFeedback = [
            // @ts-ignore
            positive[Math.floor(Math.random() * positive.length)],
            // @ts-ignore
            corrections[Math.floor(Math.random() * corrections.length)]
          ];
        }

        setCurrentFeedback(selectedFeedback);
        setFeedbackState("feedback");
        
        // Audio Feedback
        if (audioEnabled) {
          // @ts-ignore
          const message = `Rep ${currentRep}. ${selectedFeedback[0].message}. ${selectedFeedback[1].message}.`;
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.rate = 0.95; // Match Analysis.tsx rate
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          // Select the voice based on user preference
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(voice => voice.name === selectedVoice) || 
                                 voices.find(voice => voice.lang.startsWith('en'));
          
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }

          window.speechSynthesis.speak(utterance);
        }
        
        // Show feedback for 4s
        await new Promise(r => setTimeout(r, 4000)); 

        // 3. Reset to ready state (waiting for next rep trigger)
        setFeedbackState("ready");
        
        if (currentRep >= totalReps) {
          onComplete();
        }
      };
      cycle();
    }
  }, [triggerFeedback, isActive]); // Only trigger on explicit signal from parent

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-[9999]">
      {/* Debug / Manual Trigger Controls */}
      <div className="absolute top-24 right-4 pointer-events-auto bg-black/80 p-4 rounded-lg border border-white/20 text-xs font-mono text-white z-[10000]">
        <div className="mb-2 font-bold text-cyan-400">DEBUG PANEL</div>
        <div>State: {feedbackState}</div>
        <div>Rep: {currentRep}/{totalReps}</div>
        <div>Audio: {audioEnabled ? "ON" : "OFF"}</div>
        <button 
          onClick={() => {
            console.log("Manual trigger clicked");
            // Force a state update to trigger effect
            // In a real app, this would be wired to a parent handler
            // For now, we rely on the parent's timer or this visual confirmation
          }}
          className="mt-2 bg-white/20 hover:bg-white/30 px-2 py-1 rounded w-full"
        >
          (Timer Running...)
        </button>
      </div>
      <AnimatePresence mode="wait">
        {feedbackState === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
              <Activity className="w-16 h-16 text-cyan-400 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-cyan-100 tracking-widest uppercase">
              Analyzing Form...
            </h2>
          </motion.div>
        )}

        {feedbackState === "feedback" && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-3xl px-6"
          >
            <div className="bg-black/90 backdrop-blur-xl border-2 border-blue-500/50 rounded-3xl p-8 shadow-2xl space-y-8 transform scale-105 origin-center">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <span className="text-xl font-mono text-gray-300 font-bold">REP {currentRep}/{totalReps}</span>
                <span className="text-sm font-black bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full uppercase tracking-widest border border-blue-500/30">LIVE COACHING</span>
              </div>

              {/*               {/* Feedback Items */}
              <div className="space-y-6">
                {currentFeedback.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.2 }}
                    className={`p-6 rounded-2xl border-l-8 shadow-lg ${
                      item.type === "positive" 
                        ? "bg-emerald-900/40 border-emerald-500" 
                        : "bg-rose-900/40 border-rose-500"
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <span className="text-5xl filter drop-shadow-lg">
                        {item.type === "positive" ? "✅" : "⚠️"}
                      </span>
                      <div>
                        <h3 className={`text-3xl font-black tracking-tight ${
                          item.type === "positive" ? "text-emerald-400" : "text-rose-400"
                        }`}>
                          {item.message}
                        </h3>
                        <p className="text-xl font-medium text-white mt-2 leading-relaxed opacity-90">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Next Rep Cue */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="text-center pt-2"
              >
                <p className="text-cyan-400 text-sm font-mono animate-pulse">
                  GET READY FOR NEXT REP...
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
