import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Categories() {
  const [audioOn, setAudioOn] = useState(true);
  const [, setLocation] = useLocation();

  const categories = [
    {
      id: 1,
      name: "Sports",
      description: "Professional sports techniques and form analysis",
      subcategories: 8,
    },
    {
      id: 2,
      name: "Weightlifting",
      description: "Strength training and powerlifting techniques",
      subcategories: 3,
    },
    {
      id: 3,
      name: "Yoga",
      description: "Yoga poses and flow sequences",
      subcategories: 4,
    },
    {
      id: 4,
      name: "Dance",
      description: "Dance moves and choreography",
      subcategories: 4,
    },
    {
      id: 5,
      name: "Martial Arts",
      description: "Martial arts techniques and forms",
      subcategories: 1,
    },
    {
      id: 6,
      name: "Gymnastics",
      description: "Gymnastics skills and techniques",
      subcategories: 4,
    },
    {
      id: 7,
      name: "Recovery",
      description: "Recovery and mobility exercises",
      subcategories: 3,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="text-xl font-semibold">Aligned</div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setAudioOn(!audioOn)}
            className="border-2 border-green-500 bg-transparent text-green-500 hover:bg-green-500/10 rounded-lg"
          >
            Audio: {audioOn ? "On" : "Off"}
          </Button>
          <Button
            variant="outline"
            className="border-2 border-slate-600 bg-transparent text-slate-300 hover:bg-slate-600/10 rounded-lg"
          >
            High Contrast
          </Button>
          <Button
            variant="outline"
            className="border-2 border-slate-600 bg-transparent text-slate-300 hover:bg-slate-600/10 rounded-lg"
          >
            Community
          </Button>
          <Button
            variant="outline"
            className="border-2 border-slate-600 bg-transparent text-slate-300 hover:bg-slate-600/10 rounded-lg"
          >
            Pricing
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-12">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="text-slate-300 hover:text-white flex items-center gap-2"
          >
            ← Back
          </Button>
          <h2 className="text-lg text-slate-300">Choose Your Category</h2>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Select Category</h1>
          <p className="text-xl text-slate-300">
            Choose the type of movement you want to analyze
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {categories.map((category) => (
            <button
              key={category.id}
              className="text-left p-6 rounded-2xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/60 transition-all duration-300"
            >
              <h3 className="text-2xl font-bold mb-3">{category.name}</h3>
              <p className="text-slate-300 mb-3">{category.description}</p>
              <p className="text-sm text-slate-400">
                {category.subcategories} subcategories
              </p>
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-10 text-slate-400">
        <p className="text-base mb-2">Total Points: 0</p>
        <p className="text-sm">Made with Manus</p>
      </footer>
    </div>
  );
}

