import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [audioOn, setAudioOn] = useState(true);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100">
      {/* Header with darker background */}
      <header className="bg-[#050810] flex items-center justify-between px-8 py-6 border-b border-slate-800/50">
        <div className="text-xl font-semibold">Aligned</div>

        <div className="flex gap-3">
          {/* Audio:On - Green background with white text */}
          <Button
            variant="outline"
            onClick={() => setAudioOn(!audioOn)}
            className="border-2 border-green-500 bg-green-500 text-white hover:bg-green-600 hover:border-green-600 rounded-full px-5"
          >
            Audio: {audioOn ? "On" : "Off"}
          </Button>
          
          {/* High Contrast - White text with white border, no background */}
          <Button
            variant="outline"
            className="border-2 border-white bg-transparent text-white hover:bg-white/10 rounded-full px-5"
          >
            High Contrast
          </Button>
          
          {/* Community - White text with white border, no background */}
          <Button
            variant="outline"
            className="border-2 border-white bg-transparent text-white hover:bg-white/10 rounded-full px-5"
          >
            Community
          </Button>
          
          {/* Pricing - Light cyan text with cyan border, no background */}
          <Button
            variant="outline"
            className="border-2 border-cyan-400 bg-transparent text-cyan-400 hover:bg-cyan-400/10 rounded-full px-5"
          >
            Pricing
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6">
            Welcome to <span className="text-blue-400">Aligned</span>
          </h1>
          <p className="text-xl text-slate-300 mb-10">
            Professional feedback on your form
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/categories")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 text-lg rounded-xl"
          >
            Get Started
          </Button>
        </div>

        {/* Sport Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {/* Yoga */}
          <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
            <img
              src="/yoga.webp"
              alt="Yoga"
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
              <h3 className="text-2xl font-bold mb-2">Yoga</h3>
              <p className="text-sm text-slate-300">Perfect your yoga form</p>
            </div>
          </div>

          {/* Golf */}
          <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
            <img
              src="/golf.webp"
              alt="Golf"
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
              <h3 className="text-2xl font-bold mb-2">Golf</h3>
              <p className="text-sm text-slate-300">Analyze your golf technique</p>
            </div>
          </div>

          {/* Football */}
          <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
            <img
              src="/football.webp"
              alt="Football"
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
              <h3 className="text-2xl font-bold mb-2">Football</h3>
              <p className="text-sm text-slate-300">Master quarterback mechanics</p>
            </div>
          </div>

          {/* Archery */}
          <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
            <img
              src="/archery.webp"
              alt="Archery"
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
              <h3 className="text-2xl font-bold mb-2">Archery</h3>
              <p className="text-sm text-slate-300">Improve your archery stance</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-10 text-slate-400">
        <p className="text-base mb-2">Total Points: 0</p>
        <p className="text-sm">Made with Manus</p>
      </footer>

      {/* Fixed bottom-right badge */}
      <div className="fixed bottom-6 right-6 bg-white text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
        <span>✎</span> Tweak
      </div>
    </div>
  );
}
