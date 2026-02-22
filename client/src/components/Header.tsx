import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import { useAudio } from "@/contexts/AudioContext";
import AudioSettingsModal from "./AudioSettingsModal";
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
        <AudioSettingsModal />
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
