import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAudio } from "@/contexts/AudioContext";
import AudioSettingsModal from "@/components/AudioSettingsModal";

export default function Home() {
  const { audioEnabled, toggleAudio } = useAudio();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100">
      <header className="bg-[#050810] flex items-center justify-between px-4 md:px-8 py-4 md:py-6 border-b border-slate-800/50">
        <div className="cursor-pointer" onClick={() => setLocation("/")}>
          <img src="/aligned-logo-v2.png" alt="Aligned" className="h-14 md:h-16 object-contain" />
        </div>
        <div className="flex gap-2 md:gap-3 flex-wrap justify-end">
          <AudioSettingsModal />
          <Button variant="outline" onClick={() => setLocation("/community")} className="!border-2 !border-white bg-transparent text-white hover:bg-white/10 rounded-full px-3 md:px-5 text-sm md:text-base">Community</Button>
          <Button variant="outline" onClick={() => setLocation("/history")} className="!border-2 !border-purple-400 bg-transparent !text-purple-400 hover:bg-purple-400/10 rounded-full px-3 md:px-5 text-sm md:text-base">📊 History</Button>
          <Button variant="outline" onClick={() => setLocation("/pricing")} className="!border-2 !border-cyan-400 bg-transparent !text-cyan-400 hover:bg-cyan-400/10 rounded-full px-3 md:px-5 text-sm md:text-base">Pricing</Button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 flex flex-col md:flex-row items-center justify-center gap-0 md:gap-0">
            <span>Welcome to</span> <img src="/aligned-logo-v2.png" alt="Aligned" className="h-32 md:h-40 object-contain inline-block translate-y-2 md:translate-y-4 -mt-4 md:-mt-0 md:-ml-2" />
          </h1>
          <p className="text-xl text-slate-300 mb-8">Professional feedback on your form</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setLocation("/categories")} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl">
              Get Started
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          <div 
            className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 transition-all cursor-pointer"
            onClick={() => setLocation("/analysis/strength/kettlebell/snatch?motion=Kettlebell%20Snatch")}
          >
            <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663143408740/SOnnUycYEwqvJYwg.webp" alt="Kettlebell Snatch" className="w-full h-64 object-cover" />
            <div className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-2">Kettlebell Snatch</h3>
              <p className="text-slate-300 text-sm">Optimize your hip drive</p>
            </div>
          </div>
          <div 
            className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 transition-all cursor-pointer"
            onClick={() => setLocation("/analysis/sports/golf/swing?motion=Golf%20Swing")}
          >
            <img src="/golf.webp" alt="Golf" className="w-full h-64 object-cover" />
            <div className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-2">Golf</h3>
              <p className="text-slate-300 text-sm">Analyze your golf technique</p>
            </div>
          </div>
          <div 
            className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 transition-all cursor-pointer"
            onClick={() => setLocation("/analysis/sports/football/throw?motion=Football%20Throw")}
          >
            <img src="/football.webp" alt="Football" className="w-full h-64 object-cover" />
            <div className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-2">Football</h3>
              <p className="text-slate-300 text-sm">Master quarterback mechanics</p>
            </div>
          </div>
          <div 
            className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 transition-all cursor-pointer"
            onClick={() => setLocation("/analysis/strength/kettlebell/swing?motion=Kettlebell%20Swing")}
          >
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




    </div>
  );
}
