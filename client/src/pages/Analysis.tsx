import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation, useParams } from "wouter";

// Define motion details
const motionDetails: Record<string, any> = {
  throw: {
    name: "Throw",
    description: "Quarterback throwing technique",
    tips: [
      "Film in good light, full body in frame.",
      "Warm up joints; test range before effort.",
      "Two reps at moderate pace help models segment phases.",
      "Arm motion",
      "Footwork",
      "Release",
    ],
  },
  punt: {
    name: "Punt",
    description: "Professional punting technique",
    tips: [
      "Film in good light, full body in frame.",
      "Drop timing is critical",
      "Leg swing path",
      "Contact point accuracy",
    ],
  },
  "field-goal": {
    name: "Field Goal",
    description: "Placekicking technique",
    tips: [
      "Film in good light, full body in frame.",
      "Plant foot positioning",
      "Swing path consistency",
      "Follow-through completion",
    ],
  },
};

export default function Analysis() {
  const [audioOn, setAudioOn] = useState(true);
  const [, setLocation] = useLocation();
  const params = useParams();
  const motionId = params.motionId || "throw";
  
  const motion = motionDetails[motionId] || motionDetails.throw;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100">
      {/* Header with darker background */}
      <header className="bg-[#050810] flex items-center justify-between px-8 py-6 border-b border-slate-800/50">
        <div className="text-xl font-semibold">Aligned</div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setAudioOn(!audioOn)}
            className="border-2 border-blue-500 bg-transparent text-white hover:bg-blue-500/10 rounded-full px-5"
          >
            Audio: {audioOn ? "On" : "Off"}
          </Button>
          <Button
            variant="outline"
            className="border-2 border-yellow-500 bg-transparent text-yellow-500 hover:bg-yellow-500/10 rounded-full px-5"
          >
            High Contrast
          </Button>
          <Button
            variant="outline"
            className="border-2 border-pink-500 bg-transparent text-pink-500 hover:bg-pink-500/10 rounded-full px-5"
          >
            Community
          </Button>
          <Button
            variant="outline"
            className="border-2 border-cyan-500 bg-transparent text-cyan-500 hover:bg-cyan-500/10 rounded-full px-5"
          >
            Pricing
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="text-slate-300 hover:text-white hover:bg-slate-800/50 flex items-center gap-2 rounded-lg px-4"
          >
            ← Back
          </Button>
          <h2 className="text-lg text-slate-300">{motion.description}</h2>
        </div>

        <h1 className="text-4xl font-bold mb-8">{motion.name}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Video Feed */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
              <div className="text-slate-400 text-center">
                <p className="text-sm mb-2">Live · IDLE · Ghost: default</p>
                <p>Camera will appear here</p>
              </div>
              
              {/* Start Video Button */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg rounded-xl"
                >
                  Start Video
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Controls and Feedback */}
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-3">Controls</h3>
              <p className="text-sm text-slate-400">
                Use the smart button below the video to control your session
              </p>
            </div>

            {/* Real-time Detection Status */}
            <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4">Real-time Detection Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Right Hand Raised</span>
                  <span className="text-red-500 text-xl">✗</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Left Hand Raised</span>
                  <span className="text-red-500 text-xl">✗</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Right Foot Lifted</span>
                  <span className="text-red-500 text-xl">✗</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Left Foot Lifted</span>
                  <span className="text-red-500 text-xl">✗</span>
                </div>
              </div>
            </div>

            {/* Positioning Feedback */}
            <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4">Positioning Feedback</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Landmarks Detected:</span>
                  <span className="text-blue-400">0/33</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Body Scale:</span>
                  <span className="text-slate-300">1.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Distance:</span>
                  <span className="text-yellow-400">No pose detected</span>
                </div>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4">Pro Tips · {motion.name}</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                {motion.tips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed bottom-right badge */}
      <div className="fixed bottom-6 right-6 bg-white text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
        <span>✎</span> Tweak
      </div>
    </div>
  );
}
