import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [audioOn, setAudioOn] = useState(true);
  const [, setLocation] = useLocation();

  const sports = [
    {
      id: 1,
      name: "Yoga",
      description: "Perfect your yoga form",
      image: "/yoga.webp",
    },
    {
      id: 2,
      name: "Golf",
      description: "Analyze your golf technique",
      image: "/golf.webp",
    },
    {
      id: 3,
      name: "Football",
      description: "Master quarterback mechanics",
      image: "/football.webp",
    },
    {
      id: 4,
      name: "Archery",
      description: "Improve your archery stance",
      image: "/archery.webp",
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

      {/* Hero Section */}
      <main className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4">
            Welcome to <span className="text-blue-400">Aligned</span>
          </h1>
          <p className="text-xl text-slate-300 mb-10">
            Professional feedback on your form
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/categories")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-6 text-lg rounded-xl"
          >
            Get Started
          </Button>
        </div>

        {/* Sports Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {sports.map((sport) => (
            <div
              key={sport.id}
              className="relative group cursor-pointer rounded-2xl overflow-hidden bg-slate-900/40 hover:scale-[1.02] transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={sport.image}
                  alt={sport.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-xl font-bold mb-1">{sport.name}</h3>
                <p className="text-sm text-slate-300">{sport.description}</p>
              </div>
            </div>
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

