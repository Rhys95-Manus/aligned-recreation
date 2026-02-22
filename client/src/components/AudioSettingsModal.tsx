import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/AudioContext";
import { Volume2, VolumeX, Mic, Settings } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AudioSettingsModal() {
  const { 
    audioEnabled, 
    toggleAudio, 
    selectedVoice, 
    setSelectedVoice, 
    availableVoices,
    volume,
    setVolume
  } = useAudio();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`!border-2 rounded-full px-3 md:px-5 text-sm md:text-base flex items-center gap-2 ${
            audioEnabled 
              ? "!border-emerald-600 !bg-emerald-600/30 text-white hover:!bg-emerald-600/50" 
              : "!border-slate-600 !bg-slate-800 text-slate-400"
          }`}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {audioEnabled ? "Audio On" : "Audio Off"}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0a0e1a] border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-400" />
            Audio Settings
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Customize your coaching experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#1a1f2e] border border-slate-700">
            <div className="flex items-center gap-3">
              {audioEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
              <span className="font-medium">Master Audio</span>
            </div>
            <Switch 
              checked={audioEnabled} 
              onCheckedChange={toggleAudio}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>

          {/* Volume Control */}
          <div className={`space-y-3 transition-opacity duration-300 ${!audioEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Coach Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <VolumeX className="w-4 h-4 text-slate-500" />
              <Slider 
                value={[volume * 100]} 
                max={100} 
                step={1} 
                onValueChange={(vals) => setVolume(vals[0] / 100)}
                className="flex-1"
              />
              <Volume2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Voice Selection */}
          <div className={`space-y-3 transition-opacity duration-300 ${!audioEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Mic className="w-4 h-4" />
              <span>Coach Voice</span>
            </div>
            <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {availableVoices
                .filter(v => v.lang.startsWith('en'))
                .slice(0, 8)
                .map((voice) => (
                  <div 
                    key={voice.name}
                    onClick={() => {
                      setSelectedVoice(voice.name);
                      const utterance = new SpeechSynthesisUtterance("Hello, I'm your coach.");
                      utterance.voice = voice;
                      utterance.volume = volume;
                      window.speechSynthesis.cancel();
                      window.speechSynthesis.speak(utterance);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-sm ${
                      selectedVoice === voice.name 
                        ? "bg-blue-600/20 border-blue-500 text-blue-100" 
                        : "bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <span className="font-medium truncate max-w-[180px]">
                      {voice.name.replace(/Google |Microsoft /, "").split(" ")[0]}
                    </span>
                    {selectedVoice === voice.name && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
