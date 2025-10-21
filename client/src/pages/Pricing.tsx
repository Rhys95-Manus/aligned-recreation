import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Pricing() {
  const [audioOn, setAudioOn] = useState(true);
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"per-tab" | "bundles">("per-tab");

  const categories = [
    { name: "Sports", price: "$5/mo" },
    { name: "Weightlifting", price: "$5/mo" },
    { name: "Yoga", price: "$5/mo" },
    { name: "Dance", price: "$5/mo" },
    { name: "Martial Arts", price: "$5/mo" },
    { name: "Gymnastics", price: "$5/mo" },
    { name: "Recovery", price: "$5/mo" },
  ];

  const bundles = [
    { name: "2 Tabs", price: "$9/mo" },
    { name: "3 Tabs", price: "$12/mo" },
    { name: "4 Tabs (All)", price: "$14/mo" },
    { name: "5 Tabs", price: "$15/mo" },
    { name: "6 Tabs", price: "$16/mo" },
    { name: "7 Tabs (All)", price: "$17/mo" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100">
      <header className="bg-[#050810] flex items-center justify-between px-8 py-6 border-b border-slate-800/50">
        <div className="text-xl font-semibold cursor-pointer" onClick={() => setLocation("/")}>Aligned</div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setAudioOn(!audioOn)} className="!border-2 !border-green-500 bg-transparent text-white hover:bg-blue-500/10 rounded-full px-5">
            Audio: {audioOn ? "On" : "Off"}
          </Button>
          <Button variant="outline" className="!border-2 !border-white bg-transparent text-white hover:bg-white/10 rounded-full px-5">High Contrast</Button>
          <Button variant="outline" className="!border-2 !border-white bg-transparent text-white hover:bg-white/10 rounded-full px-5">Community</Button>
          <Button variant="outline" onClick={() => setLocation("/pricing")} className="!border-2 !border-cyan-400 bg-transparent !text-cyan-400 hover:bg-cyan-400/10 rounded-full px-5">Pricing</Button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="flex gap-4 mb-8">
          <Button onClick={() => setActiveTab("per-tab")} className={`px-6 py-2 rounded-lg ${activeTab === "per-tab" ? "bg-slate-700 text-white" : "bg-slate-800/40 text-slate-300"}`}>
            Per Tab
          </Button>
          <Button onClick={() => setActiveTab("bundles")} className={`px-6 py-2 rounded-lg ${activeTab === "bundles" ? "bg-slate-700 text-white" : "bg-slate-800/40 text-slate-300"}`}>
            Bundles
          </Button>
        </div>

        {activeTab === "per-tab" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {categories.map((cat) => (
              <div key={cat.name} className="bg-slate-900/40 border border-slate-700 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                  <p className="text-slate-400 text-sm">{cat.price}</p>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded border-slate-600" />
              </div>
            ))}
          </div>
        )}

        {activeTab === "bundles" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {bundles.map((bundle) => (
              <div key={bundle.name} className="bg-slate-900/40 border border-slate-700 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-3">{bundle.name}</h3>
                <p className="text-3xl font-bold text-cyan-400">{bundle.price}</p>
              </div>
            ))}
          </div>
        )}

        <p className="text-slate-400 text-sm mt-12">
          Any subscription removes ads and unlocks full tab(s). Prices are USD.
        </p>
      </main>

      <div className="fixed bottom-6 right-6 bg-white text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
        <span>✎</span> Tweak
      </div>
    </div>
  );
}
