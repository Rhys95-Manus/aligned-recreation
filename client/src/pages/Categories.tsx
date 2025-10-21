import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Categories() {
  const [audioOn, setAudioOn] = useState(true);
  const [, setLocation] = useLocation();

  const categories = [
    {
      id: "sports",
      name: "Sports",
      description: "Professional sports techniques and form analysis",
      subcategories: 8,
      borderColor: "border-purple-500",
      badge: 7,
    },
    {
      id: "weightlifting",
      name: "Weightlifting",
      description: "Strength training and powerlifting techniques",
      subcategories: 3,
      borderColor: "border-orange-500",
      badge: 8,
    },
    {
      id: "yoga",
      name: "Yoga",
      description: "Yoga poses and flow sequences",
      subcategories: 4,
      borderColor: "border-teal-500",
      badge: 9,
    },
    {
      id: "dance",
      name: "Dance",
      description: "Dance moves and choreography",
      subcategories: 4,
      borderColor: "border-pink-500",
      badge: 10,
    },
    {
      id: "martial-arts",
      name: "Martial Arts",
      description: "Martial arts techniques and forms",
      subcategories: 1,
      borderColor: "border-blue-500",
      badge: 11,
    },
    {
      id: "gymnastics",
      name: "Gymnastics",
      description: "Gymnastics skills and techniques",
      subcategories: 4,
      borderColor: "border-red-500",
      badge: 12,
    },
    {
      id: "recovery",
      name: "Recovery",
      description: "Recovery and mobility exercises",
      subcategories: 3,
      borderColor: "border-green-500",
      badge: 13,
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
            className="border-2 border-green-500 bg-transparent text-green-500 hover:bg-green-500/10 rounded-full px-5"
          >
            Audio: {audioOn ? "On" : "Off"}
          </Button>
          <Button
            variant="outline"
            className="border-2 border-slate-600 bg-transparent text-slate-300 hover:bg-slate-600/10 rounded-full px-5"
          >
            High Contrast
          </Button>
          <Button
            variant="outline"
            className="border-2 border-slate-600 bg-transparent text-slate-300 hover:bg-slate-600/10 rounded-full px-5"
          >
            Community
          </Button>
          <Button
            variant="outline"
            className="border-2 border-slate-600 bg-transparent text-slate-300 hover:bg-slate-600/10 rounded-full px-5"
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
            className="text-slate-300 hover:text-white flex items-center gap-2 border-2 border-pink-500 rounded-full px-4"
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
              onClick={() => setLocation(`/category/${category.id}`)}
              className={`relative text-left p-6 rounded-2xl border-2 ${category.borderColor} bg-slate-900/60 hover:bg-slate-800/60 transition-all duration-300`}
            >
              <span className="absolute top-3 right-3 bg-slate-800/90 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-slate-600">
                {category.badge}
              </span>
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

