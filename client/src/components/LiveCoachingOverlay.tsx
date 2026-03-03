import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";
import { 
  getCoachingProfile, 
  evaluateAllMetrics,
  type MotionCoachingProfile 
} from "@/data/coachingCues";
import {
  evaluateRepPhases,
  type FrameMetrics,
  type PhaseEvaluation
} from "@/data/phaseCoaching";

interface FeedbackItem {
  type: "positive" | "correction";
  message: string;
  detail: string;
  speech?: string;
  /** Optional phase name for phase-aware feedback */
  phaseName?: string;
}

interface LiveCoachingOverlayProps {
  isActive: boolean;
  currentRep: number;
  totalReps: number;
  audioEnabled?: boolean;
  selectedVoice?: string;
  volume?: number;
  onComplete: () => void;
  /** Toggle to trigger a new feedback cycle from the parent */
  triggerFeedback?: boolean;
  /** All biomechanical metrics from pose detection (current frame - used as fallback) */
  metrics?: {
    hipRotation: number;
    shoulderRotation: number;
    rightElbowAngle: number;
    leftElbowAngle?: number;
    rightKneeFlexion?: number;
    leftKneeFlexion?: number;
    spineAngle: number;
    rightShoulderAngle?: number;
    leftShoulderAngle?: number;
    footPositioning?: number;
    weightTransfer?: number;
  };
  /** Motion context for selecting the right coaching profile */
  motionContext?: {
    category: string;
    subcategory: string;
    motionName: string;
  };
  /** 
   * Per-frame metrics for the just-completed rep.
   * When provided, enables phase-aware coaching that tells the user
   * WHICH phase of their motion needs work.
   */
  repFrames?: FrameMetrics[];
}

export default function LiveCoachingOverlay({
  isActive,
  currentRep,
  totalReps,
  audioEnabled = true,
  selectedVoice = "Google US English",
  volume = 1.0,
  onComplete,
  triggerFeedback,
  metrics,
  motionContext,
  repFrames
}: LiveCoachingOverlayProps) {
  const [feedbackState, setFeedbackState] = useState<"analyzing" | "feedback" | "ready">("ready");
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackItem[]>([]);
  const [coachingProfile, setCoachingProfile] = useState<MotionCoachingProfile | null>(null);

  // Resolve the coaching profile when motion context changes
  useEffect(() => {
    if (motionContext) {
      const profile = getCoachingProfile(
        motionContext.category,
        motionContext.subcategory,
        motionContext.motionName
      );
      setCoachingProfile(profile);
    } else {
      // Default to generic if no context
      const profile = getCoachingProfile("", "", "");
      setCoachingProfile(profile);
    }
  }, [motionContext?.category, motionContext?.subcategory, motionContext?.motionName]);

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

        // 2. Generate feedback — prefer phase-aware if we have rep frames
        let selectedFeedback: FeedbackItem[] = [];
        
        const hasRepFrames = repFrames && repFrames.length > 10;
        const hasMotionContext = motionContext && motionContext.category && motionContext.motionName;

        if (hasRepFrames && hasMotionContext) {
          // ===== PHASE-AWARE COACHING =====
          // Analyze the full rep's frames to identify which phase had issues
          const phaseEvals: PhaseEvaluation[] = evaluateRepPhases(
            motionContext!.category,
            motionContext!.subcategory,
            motionContext!.motionName,
            repFrames!,
            3 // top 3 items
          );

          selectedFeedback = phaseEvals.map(ev => ({
            type: ev.type,
            message: ev.message,
            detail: ev.detail,
            speech: ev.speech,
            phaseName: ev.phaseName,
          }));
        } else if (metrics && coachingProfile) {
          // ===== FALLBACK: Single-frame coaching (original behavior) =====
          const metricsRecord: Record<string, number> = {};
          if (metrics.hipRotation !== undefined) metricsRecord.hipRotation = metrics.hipRotation;
          if (metrics.shoulderRotation !== undefined) metricsRecord.shoulderRotation = metrics.shoulderRotation;
          if (metrics.rightElbowAngle !== undefined) metricsRecord.rightElbowAngle = metrics.rightElbowAngle;
          if (metrics.leftElbowAngle !== undefined) metricsRecord.leftElbowAngle = metrics.leftElbowAngle;
          if (metrics.rightKneeFlexion !== undefined) metricsRecord.rightKneeFlexion = metrics.rightKneeFlexion;
          if (metrics.leftKneeFlexion !== undefined) metricsRecord.leftKneeFlexion = metrics.leftKneeFlexion;
          if (metrics.spineAngle !== undefined) metricsRecord.spineAngle = metrics.spineAngle;
          if (metrics.rightShoulderAngle !== undefined) metricsRecord.rightShoulderAngle = metrics.rightShoulderAngle;
          if (metrics.leftShoulderAngle !== undefined) metricsRecord.leftShoulderAngle = metrics.leftShoulderAngle;
          if (metrics.footPositioning !== undefined) metricsRecord.footPositioning = metrics.footPositioning;
          if (metrics.weightTransfer !== undefined) metricsRecord.weightTransfer = metrics.weightTransfer;

          const evaluated = evaluateAllMetrics(coachingProfile, metricsRecord, 3);
          
          selectedFeedback = evaluated.map(item => ({
            type: item.type,
            message: item.message,
            detail: item.detail,
            speech: item.speech,
          }));
        }

        // Fallback if nothing produced results
        if (selectedFeedback.length === 0) {
          selectedFeedback = [
            { type: "positive", message: "Keep it up — stay focused!", detail: "Waiting for clearer tracking data...", speech: "Keep it up!" },
          ];
        }

        setCurrentFeedback(selectedFeedback);
        setFeedbackState("feedback");
        
        // Audio Feedback — use the short speech versions for concise audio
        if (audioEnabled && selectedFeedback.length > 0) {
          // Build a concise spoken message: "Rep 2. [phase prefix + cue]. [phase prefix + cue]."
          const spokenParts = selectedFeedback
            .slice(0, 2) // Max 2 items spoken to keep it brief
            .map(f => f.speech || f.message);
          const message = `Rep ${currentRep}. ${spokenParts.join('. ')}.`;
          
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.rate = 0.95;
          utterance.pitch = 1.0;
          utterance.volume = volume;

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

        // 3. Reset to ready state
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
            <div className="bg-black/90 backdrop-blur-xl border-2 border-blue-500/50 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 transform scale-105 origin-center">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-lg font-mono text-gray-300 font-bold">REP {currentRep}/{totalReps}</span>
                <span className="text-xs font-black bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-full uppercase tracking-widest border border-blue-500/30">LIVE COACH</span>
              </div>

              {/* Feedback Items */}
              <div className="space-y-4">
                {currentFeedback.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.15 }}
                    className={`p-4 md:p-5 rounded-2xl border-l-[6px] shadow-lg ${
                      item.type === "positive" 
                        ? "bg-emerald-900/40 border-emerald-500" 
                        : "bg-amber-900/30 border-amber-500"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl md:text-4xl filter drop-shadow-lg flex-shrink-0 mt-0.5">
                        {item.type === "positive" ? "✅" : "🎯"}
                      </span>
                      <div className="min-w-0">
                        {/* Phase badge */}
                        {item.phaseName && (
                          <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-white/10 text-white/60 px-2 py-0.5 rounded-md mb-1.5">
                            {item.phaseName}
                          </span>
                        )}
                        <h3 className={`text-xl md:text-2xl font-black tracking-tight leading-tight ${
                          item.type === "positive" ? "text-emerald-400" : "text-amber-400"
                        }`}>
                          {item.message}
                        </h3>
                        <p className="text-sm md:text-base font-medium text-white/80 mt-1.5 leading-relaxed">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Next Rep Cue */}
              {currentRep < totalReps && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-center pt-1"
                >
                  <p className="text-cyan-400 text-sm font-mono animate-pulse">
                    GET READY FOR NEXT REP...
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
