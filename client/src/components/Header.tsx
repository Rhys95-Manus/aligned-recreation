import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAudio } from "@/contexts/AudioContext";
import { Settings, Volume2, VolumeX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { audioEnabled, toggleAudio, selectedVoice, setSelectedVoice, availableVoices } = useAudio();
  const [, setLocation] = useLocation();

  return (
    <header className="bg-[#050810] flex items-center justify-between px-4 md:px-8 py-4 md:py-6 border-b border-slate-800/50">
      <div className="text-lg md:text-xl font-semibold cursor-pointer" onClick={() => setLocation("/")}>
        Aligned
      </div>
      <div className="flex gap-2 md:gap-3 flex-wrap justify-end">
        <Button 
          variant="outline" 
          onClick={() => setLocation("/settings/audio")}
          className={`!border-2 rounded-full px-3 md:px-5 text-sm md:text-base flex items-center gap-2 ${
            audioEnabled 
              ? "!border-emerald-600 !bg-emerald-600/30 text-white hover:!bg-emerald-600/50" 
              : "!border-slate-600 !bg-slate-800 text-slate-400"
          }`}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {audioEnabled ? "Audio On" : "Audio Off"}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setLocation("/community")} 
          className="!border-2 !border-white bg-transparent text-white hover:bg-white/10 rounded-full px-3 md:px-5 text-sm md:text-base"
        >
          Community
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setLocation("/history")} 
          className="!border-2 !border-purple-400 bg-transparent !text-purple-400 hover:bg-purple-400/10 rounded-full px-3 md:px-5 text-sm md:text-base"
        >
          📊 History
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setLocation("/pricing")} 
          className="!border-2 !border-cyan-400 bg-transparent !text-cyan-400 hover:bg-cyan-400/10 rounded-full px-3 md:px-5 text-sm md:text-base"
        >
          Pricing
        </Button>
      </div>
    </header>
  );
}
