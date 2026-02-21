import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import LiveCoachingOverlay from "@/components/LiveCoachingOverlay";
import PoseAnalysis from "@/components/PoseAnalysis";
import { Square, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Session() {
  const [audioOn, setAudioOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [currentRep, setCurrentRep] = useState(1);
  const [recordingTime, setRecordingTime] = useState(0);
  const [feedbackTrigger, setFeedbackTrigger] = useState(false);
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/session/:activity");
  
  // @ts-ignore
  const activityName = params?.activity ? decodeURIComponent(params.activity) : "Session";

  // Auto-start recording when entering session
  useEffect(() => {
    setIsRecording(true);
    setRecordingTime(0);
    setCurrentRep(1);
  }, []);

  // Timer logic
  useEffect(() => {
    if (!isRecording) return;
    
    const timer = setInterval(() => {
      setRecordingTime((prev: number) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isRecording]);

  const handleStop = () => {
    setIsRecording(false);
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col">
      {/* Session Header */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent">
        <Button 
          variant="ghost" 
          onClick={handleStop}
          className="text-white hover:bg-white/10 gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Exit Session
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">{activityName}</span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setAudioOn(!audioOn)} 
            className={`rounded-full px-4 border-2 ${audioOn ? 'border-emerald-500 bg-emerald-500/20 text-emerald-100' : 'border-slate-500 bg-slate-500/20 text-slate-300'}`}
          >
            Audio: {audioOn ? "On" : "Off"}
          </Button>
        </div>
      </header>

      {/* Main Content Area - Camera Feed & Overlay */}
      <div className="flex-1 relative overflow-hidden">
        {/* Real-Time Pose Analysis & Camera Feed */}
        <PoseAnalysis 
          isActive={isRecording}
          onRepComplete={(feedback: any) => {
            console.log("Rep Complete:", feedback);
            setCurrentRep((prev: number) => prev + 1);
            setFeedbackTrigger(prev => !prev);
          }}
        />
        
        {/* Recording Indicator */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500/20 backdrop-blur-md border border-red-500/50 px-6 py-3 rounded-full flex items-center gap-3 z-40">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]" />
          <span className="text-red-100 font-mono text-lg tracking-widest">
            REC {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}
          </span>
        </div>

        {/* Live Coaching Overlay */}
        <LiveCoachingOverlay 
          isActive={true}
          currentRep={currentRep}
          totalReps={5}
          audioEnabled={audioOn}
          triggerFeedback={feedbackTrigger}
          onComplete={() => {
            // Session Complete Logic
            setIsRecording(false);
            // Could navigate to a summary page here
            setLocation("/");
          }}
        />

        {/* Manual Rep Trigger (Debug) */}
        <Button 
          size="sm"
          className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-cyan-600/80 hover:bg-cyan-700 text-white px-6 py-3 rounded-full shadow-lg z-[10000] pointer-events-auto"
          onClick={() => {
            if (currentRep < 5) {
              setCurrentRep((prev: number) => prev + 1);
              setFeedbackTrigger(prev => !prev);
            } else {
              handleStop();
            }
          }}
        >
          Force Next Rep (Debug)
        </Button>

        {/* Stop Button */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center z-50">
          <Button 
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white px-12 py-6 text-xl rounded-full shadow-2xl flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
            onClick={handleStop}
          >
            <Square className="w-6 h-6 fill-current" />
            Stop Recording
          </Button>
        </div>
      </div>
    </div>
  );
}
