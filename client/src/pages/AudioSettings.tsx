import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/AudioContext";
import { Link } from "wouter";
import { Volume2, VolumeX, Mic, ArrowLeft } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AudioSettings() {
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
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Audio Settings</h1>
        </div>

        {/* Master Toggle */}
        <Card className="bg-[#1a1f2e] border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {audioEnabled ? <Volume2 className="w-6 h-6 text-emerald-400" /> : <VolumeX className="w-6 h-6 text-slate-400" />}
                <span>Master Audio</span>
              </div>
              <Switch 
                checked={audioEnabled} 
                onCheckedChange={toggleAudio}
                className="data-[state=checked]:bg-emerald-500"
              />
            </CardTitle>
            <CardDescription className="text-slate-400">
              Turn all coaching feedback and sound effects on or off.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Volume Control */}
        <Card className={`bg-[#1a1f2e] border-slate-700 transition-opacity duration-300 ${!audioEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <CardHeader>
            <CardTitle>Volume</CardTitle>
            <CardDescription className="text-slate-400">
              Adjust the loudness of the coach's voice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <VolumeX className="w-4 h-4 text-slate-400" />
              <Slider 
                value={[volume * 100]} 
                max={100} 
                step={1} 
                onValueChange={(vals) => setVolume(vals[0] / 100)}
                className="flex-1"
              />
              <Volume2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-right mt-2 text-sm text-slate-400">
              {Math.round(volume * 100)}%
            </div>
          </CardContent>
        </Card>

        {/* Voice Selection */}
        <Card className={`bg-[#1a1f2e] border-slate-700 transition-opacity duration-300 ${!audioEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-400" />
              Coach Voice
            </CardTitle>
            <CardDescription className="text-slate-400">
              Select the voice persona for your live coaching feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {availableVoices
              .filter(v => v.lang.startsWith('en'))
              .slice(0, 8) // Show top 8 English voices
              .map((voice) => (
                <div 
                  key={voice.name}
                  onClick={() => {
                    setSelectedVoice(voice.name);
                    // Preview the voice
                    const utterance = new SpeechSynthesisUtterance("Hello, I'm your coach.");
                    utterance.voice = voice;
                    utterance.volume = volume;
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(utterance);
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    selectedVoice === voice.name 
                      ? "bg-blue-600/20 border-blue-500 text-blue-100" 
                      : "bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <span className="font-medium">
                    {voice.name.replace(/Google |Microsoft /, "").split(" ")[0]}
                  </span>
                  {selectedVoice === voice.name && (
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
