import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import LiveCoachingOverlay from "@/components/LiveCoachingOverlay";
import { Activity, Video, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function TimerLogic({ isRecording, setRecordingTime, setCurrentRep }: { isRecording: boolean, setRecordingTime: any, setCurrentRep: any }) {
  useEffect(() => {
    if (!isRecording) return;
    
    const timer = setInterval(() => {
      setRecordingTime((prev: number) => prev + 1);
    }, 1000);

    const repTimer = setInterval(() => {
      setCurrentRep((prev: number) => {
        // Only increment if less than 5
        if (prev < 5) return prev + 1;
        return prev;
      });
    }, 8000); // Increment rep every 8 seconds

    return () => {
      clearInterval(timer);
      clearInterval(repTimer);
    };
  }, [isRecording, setRecordingTime, setCurrentRep]);

  return null;
}

export default function Home() {
  const [audioOn, setAudioOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [currentRep, setCurrentRep] = useState(1);
  const [recordingTime, setRecordingTime] = useState(0);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100">
      <header className="bg-[#050810] flex items-center justify-between px-4 md:px-8 py-4 md:py-6 border-b border-slate-800/50">
        <div className="text-lg md:text-xl font-semibold cursor-pointer" onClick={() => setLocation("/")}>Aligned</div>
        <div className="flex gap-2 md:gap-3 flex-wrap justify-end">
          <Button variant="outline" onClick={() => setAudioOn(!audioOn)} className="!border-2 !border-emerald-600 !bg-emerald-600/30 text-white hover:!bg-emerald-600/50 rounded-full px-3 md:px-5 text-sm md:text-base">
            Audio: {audioOn ? "On" : "Off"}
          </Button>
          <Button variant="outline" onClick={() => setLocation("/community")} className="!border-2 !border-white bg-transparent text-white hover:bg-white/10 rounded-full px-3 md:px-5 text-sm md:text-base">Community</Button>
          <Button variant="outline" onClick={() => setLocation("/history")} className="!border-2 !border-purple-400 bg-transparent !text-purple-400 hover:bg-purple-400/10 rounded-full px-3 md:px-5 text-sm md:text-base">📊 History</Button>
          <Button variant="outline" onClick={() => setLocation("/pricing")} className="!border-2 !border-cyan-400 bg-transparent !text-cyan-400 hover:bg-cyan-400/10 rounded-full px-3 md:px-5 text-sm md:text-base">Pricing</Button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4">
            Welcome to <span className="text-blue-400">Aligned</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8">Professional feedback on your form</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setLocation("/categories")} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl">
              Get Started
            </Button>
            <Button 
              onClick={() => {
                setIsRecording(true);
                setRecordingTime(0);
              }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-6 text-lg rounded-xl flex items-center gap-2"
            >
              <Video className="w-5 h-5" />
              Start Recording
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 transition-all cursor-pointer">
            <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663143408740/SOnnUycYEwqvJYwg.webp" alt="Kettlebell Snatch" className="w-full h-64 object-cover" />
            <div className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-2">Kettlebell Snatch</h3>
              <p className="text-slate-300 text-sm">Optimize your hip drive</p>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 transition-all cursor-pointer">
            <img src="/golf.webp" alt="Golf" className="w-full h-64 object-cover" />
            <div className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-2">Golf</h3>
              <p className="text-slate-300 text-sm">Analyze your golf technique</p>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 transition-all cursor-pointer">
            <img src="/football.webp" alt="Football" className="w-full h-64 object-cover" />
            <div className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-2">Football</h3>
              <p className="text-slate-300 text-sm">Master quarterback mechanics</p>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 transition-all cursor-pointer">
            <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663143408740/fjcdgycFVnPgCPZP.webp" alt="Kettlebell Swing" className="w-full h-64 object-cover" />
            <div className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-2">Kettlebell Swing</h3>
              <p className="text-slate-300 text-sm">Perfect your hinge pattern</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-10 text-slate-400">
        <p className="text-base mb-2">Total Points: 0</p>
        <p className="text-sm">Made with Manus</p>
      </footer>

      <div className="fixed bottom-6 right-6 bg-white text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
        <span>✎</span> Tweak
      </div>

      {/* Timer Logic */}
      {isRecording && (
        <div className="hidden">
          {/* This hidden div ensures the timer logic runs when isRecording is true */}
          <TimerLogic 
            isRecording={isRecording} 
            setRecordingTime={setRecordingTime} 
            setCurrentRep={setCurrentRep} 
          />
        </div>
      )}

      {/* Recording Overlay & Camera Feed Simulation */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
          >
            {/* Simulated Camera Feed Background */}
            <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center grayscale mix-blend-overlay" />
            
            {/* Recording Indicator */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-500/20 backdrop-blur-md border border-red-500/50 px-6 py-3 rounded-full flex items-center gap-3 z-50">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]" />
              <span className="text-red-100 font-mono text-lg tracking-widest">
                REC {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Live Coaching Overlay (Active during recording) */}
            <LiveCoachingOverlay 
              isActive={true}
              currentRep={currentRep}
              totalReps={5}
              onComplete={() => {
                setIsRecording(false);
                setCurrentRep(1);
              }}
            />

            {/* Stop Button */}
            <Button 
              size="lg"
              className="absolute bottom-12 bg-red-600 hover:bg-red-700 text-white px-12 py-6 text-xl rounded-full shadow-2xl z-50"
              onClick={() => setIsRecording(false)}
            >
              <Square className="w-6 h-6 mr-3 fill-current" />
              Stop Recording
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
