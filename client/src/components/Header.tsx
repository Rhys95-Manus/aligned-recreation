import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Header() {
  const [audioOn, setAudioOn] = useState(true);
  const [, setLocation] = useLocation();

  return (
    <header className="bg-[#050810] flex items-center justify-between px-8 py-6 border-b border-slate-800/50">
      <div className="text-xl font-semibold cursor-pointer" onClick={() => setLocation("/")}>
        Aligned
      </div>
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => setAudioOn(!audioOn)} 
          className="!border-2 !border-emerald-600 !bg-emerald-600/30 text-white hover:!bg-emerald-600/50 rounded-full px-5"
        >
          Audio: {audioOn ? "On" : "Off"}
        </Button>
        <Button 
          variant="outline" 
          className="!border-2 !border-white bg-transparent text-white hover:bg-white/10 rounded-full px-5"
        >
          High Contrast
        </Button>
        <Button 
          variant="outline" 
          className="!border-2 !border-white bg-transparent text-white hover:bg-white/10 rounded-full px-5"
        >
          Community
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setLocation("/pricing")} 
          className="!border-2 !border-cyan-400 bg-transparent !text-cyan-400 hover:bg-cyan-400/10 rounded-full px-5"
        >
          Pricing
        </Button>
      </div>
    </header>
  );
}
