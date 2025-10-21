import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const [audioOn, setAudioOn] = useState(true);
  const [totalPoints] = useState(0);

  const sports = [
    {
      id: 1,
      name: "Yoga",
      description: "Perfect your Yoga form",
      image: "/yoga.webp",
      badge: 7,
      borderColor: "border-blue-500",
      glowColor: "shadow-[0_0_25px_rgba(59,130,246,0.6)]",
    },
    {
      id: 2,
      name: "Golf",
      description: "Analyze your Golf technique",
      image: "/golf.webp",
      badge: 8,
      borderColor: "border-orange-500",
      glowColor: "shadow-[0_0_25px_rgba(249,115,22,0.6)]",
    },
    {
      id: 3,
      name: "Football",
      description: "Master Quarterback mechanics",
      image: "/football.webp",
      badge: 9,
      borderColor: "border-teal-500",
      glowColor: "shadow-[0_0_25px_rgba(20,184,166,0.6)]",
    },
    {
      id: 4,
      name: "Archery",
      description: "Improve your Archery stance",
      image: "/archery.webp",
      badge: 10,
      borderColor: "border-pink-500",
      glowColor: "shadow-[0_0_25px_rgba(236,72,153,0.6)]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <Button
          variant="outline"
          className="border-2 border-green-500 bg-transparent text-green-500 hover:bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.5)] font-semibold rounded-lg px-6"
        >
          Aligned
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setAudioOn(!audioOn)}
            className="border-2 border-blue-500 bg-transparent text-blue-500 hover:bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.5)] rounded-lg"
          >
            Audio: {audioOn ? "On" : "Off"}
          </Button>
          <Button
            variant="outline"
            className="border-2 border-yellow-500 bg-transparent text-yellow-500 hover:bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.5)] rounded-lg"
          >
            High Contrast
          </Button>
          <Button
            variant="outline"
            className="border-2 border-pink-500 bg-transparent text-pink-500 hover:bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.5)] rounded-lg"
          >
            Community
          </Button>
          <Button
            variant="outline"
            className="border-2 border-cyan-500 bg-transparent text-cyan-500 hover:bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.5)] rounded-lg"
          >
            Pricing
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4">
            Welcome to <span className="text-cyan-400">Aligned</span>
          </h1>
          <p className="text-xl text-slate-300 mb-10">
            Professional feedback on your form
          </p>
          <div className="relative inline-block">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-10 py-6 text-lg shadow-[0_0_30px_rgba(168,85,247,0.6)] rounded-xl"
            >
              Get Started
            </Button>
            <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.7)]">
              6
            </span>
          </div>
        </div>

        {/* Sports Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {sports.map((sport) => (
            <div
              key={sport.id}
              className={`relative group cursor-pointer rounded-2xl overflow-hidden border-[3px] ${sport.borderColor} ${sport.glowColor} bg-slate-900/40 hover:scale-[1.02] transition-all duration-300`}
            >
              <span className="absolute top-3 right-3 bg-slate-800/90 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center z-10 border-2 border-slate-600">
                {sport.badge}
              </span>
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={sport.image}
                  alt={sport.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 bg-slate-900/70 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-1.5">{sport.name}</h3>
                <p className="text-sm text-slate-400">{sport.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-10 text-slate-400">
        <p className="text-base mb-2">Total Points: {totalPoints}</p>
        <p className="text-sm">Made with Manus</p>
      </footer>

      {/* Bottom Right Badge */}
      <div className="fixed bottom-5 right-5 bg-slate-900/90 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-slate-700 text-xs text-slate-300 flex items-center gap-2 shadow-lg">
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        Made with Manus
      </div>
    </div>
  );
}

