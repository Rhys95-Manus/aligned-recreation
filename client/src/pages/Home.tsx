import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [audioOn, setAudioOn] = useState(true);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100">
      <header className="bg-[#050810] flex items-center justify-between px-8 py-6 border-b border-slate-800/50">
        <div className="text-xl font-semibold cursor-pointer" onClick={() => setLocation("/")}>Aligned</div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setAudioOn(!audioOn)} className="!border-2 !border-green-500 !bg-green-500 text-white hover:!bg-green-600 rounded-full px-5">
            Audio: {audioOn ? "On" : "Off"}
          </Button>
          <Button variant="outline" className="!border-2 !border-white bg-transparent text-white hover:bg-white/10 rounded-full px-5">High Contrast</Button>
          <Button variant="outline" className="!border-2 !border-white bg-transparent text-white hover:bg-white/10 rounded-full px-5">Community</Button>
          <Button variant="outline" onClick={() => setLocation("/pricing")} className="!border-2 !border-cyan-400 bg-transparent !text-cyan-400 hover:bg-cyan-400/10 rounded-full px-5">Pricing</Button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4">
            Welcome to <span className="text-blue-400">Aligned</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8">Professional feedback on your form</p>
          <Button onClick={() => setLocation("/categories")} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl">
            Get Started
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 transition-all cursor-pointer">
            <img src="/yoga.webp" alt="Yoga" className="w-full h-64 object-cover" />
            <div className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-2">Yoga</h3>
              <p className="text-slate-300 text-sm">Perfect your yoga form</p>
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
            <img src="/archery.webp" alt="Archery" className="w-full h-64 object-cover" />
            <div className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-2">Archery</h3>
              <p className="text-slate-300 text-sm">Improve your archery stance</p>
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
    </div>
  );
}
