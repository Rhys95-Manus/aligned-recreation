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
  onComplete: () => void;
}

export default function LiveCoachingOverlay({
  isActive,
  currentRep,
  totalReps,
  audioEnabled = true,
  onComplete
}: LiveCoachingOverlayProps) {
  const [feedbackState, setFeedbackState] = useState<"analyzing" | "feedback" | "ready">("ready");
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackItem[]>([]);

  // Trigger feedback cycle whenever currentRep changes
  useEffect(() => {
    if (isActive && currentRep > 0) {
      const cycle = async () => {
        // 1. Analyzing Phase
        setFeedbackState("analyzing");
        await new Promise(r => setTimeout(r, 1500));

        // 2. Feedback Phase
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
        
        const selectedFeedback = [
          positive[Math.floor(Math.random() * positive.length)],
          corrections[Math.floor(Math.random() * corrections.length)]
        ];

        // @ts-ignore
        setCurrentFeedback(selectedFeedback);
        setFeedbackState("feedback");
        
        // Audio Feedback
        if (audioEnabled) {
          // @ts-ignore
          const message = `Rep ${currentRep}. ${selectedFeedback[0].message}. ${selectedFeedback[1].message}.`;
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.rate = 1.1;
          utterance.pitch = 1.0;
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
  }, [currentRep, isActive, audioEnabled, totalReps, onComplete]);

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
            className="w-full max-w-md px-6"
          >
            <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-sm font-mono text-gray-400">REP {currentRep}/{totalReps}</span>
                <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-white">LIVE COACHING</span>
              </div>

              {/* Feedback Items */}
              <div className="space-y-4">
                {currentFeedback.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.2 }}
                    className={`p-4 rounded-xl border-l-4 ${
                      item.type === "positive" 
                        ? "bg-emerald-500/10 border-emerald-500" 
                        : "bg-rose-500/10 border-rose-500"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {item.type === "positive" ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h3 className={`font-bold text-lg ${
                          item.type === "positive" ? "text-emerald-100" : "text-rose-100"
                        }`}>
                          {item.message}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1 leading-relaxed">
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
