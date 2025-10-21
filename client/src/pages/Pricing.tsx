import Header from "@/components/Header";
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
      <Header />

      <main className="max-w-[1400px] mx-auto px-8 py-12">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => setLocation("/")}
          className="mb-6 !border-2 !border-slate-600 bg-transparent text-white hover:bg-slate-600/10 rounded-lg px-4 py-2"
        >
          ← Back
        </Button>
        {/* Tab Switcher */}
        <div className="flex gap-4 mb-8">
          <Button 
            onClick={() => setActiveTab("per-tab")} 
            className={`px-6 py-2 rounded-lg ${activeTab === "per-tab" ? "bg-slate-600 text-white" : "bg-transparent text-slate-300 border border-slate-700"}`}
          >
            Per Tab
          </Button>
          <Button 
            onClick={() => setActiveTab("bundles")} 
            className={`px-6 py-2 rounded-lg ${activeTab === "bundles" ? "bg-slate-600 text-white" : "bg-transparent text-slate-300 border border-slate-700"}`}
          >
            Bundles
          </Button>
        </div>

        {/* Individual Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {categories.map((cat) => (
            <div key={cat.name} className="bg-slate-900/30 border border-slate-700/50 rounded-xl p-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-1">{cat.name}</h3>
                <p className="text-slate-400 text-sm">{cat.price}</p>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded border-2 border-slate-600 bg-transparent" />
            </div>
          ))}
        </div>

        {/* Bundle Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {bundles.map((bundle) => (
            <div 
              key={bundle.name} 
              className="bg-slate-900/30 border border-slate-700/50 rounded-xl p-6 cursor-pointer hover:bg-slate-800/40 hover:border-cyan-400/50 transition-all"
              onClick={() => console.log(`Selected: ${bundle.name}`)}
            >
              <h3 className="text-lg font-medium text-slate-200 mb-3">{bundle.name}</h3>
              <p className="text-4xl font-bold text-cyan-400">{bundle.price}</p>
            </div>
          ))}
        </div>

        <p className="text-slate-400 text-sm mt-12">
          Any subscription removes ads and unlocks full tab(s). Prices are USD.
        </p>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-[#050810] border-t border-slate-800/50 py-4 px-8 flex items-center justify-between">
        <div className="text-slate-400 text-sm">Total Points: 0</div>
        <div className="text-slate-500 text-sm">Made with Manus</div>
      </footer>

      <div className="fixed bottom-6 right-6 bg-white text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
        <span>✎</span> Tweak
      </div>
    </div>
  );
}

