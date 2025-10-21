import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation, useParams } from "wouter";

// Define motions for each subcategory
const motionsData: Record<string, any> = {
  football: {
    name: "Football",
    breadcrumb: "Sports > Football",
    description: "Select the specific motion to analyze",
    items: [
      {
        id: "throw",
        name: "Throw",
        level: "Intermediate",
        description: "Quarterback throwing technique",
        duration: "1-2 seconds",
        keyPoints: "Arm motion, Footwork, Release",
        borderColor: "border-purple-500",
        badge: 7,
      },
      {
        id: "punt",
        name: "Punt",
        level: "Advanced",
        description: "Professional punting technique",
        duration: "2-3 seconds",
        keyPoints: "Drop timing, Leg swing, Contact point",
        borderColor: "border-orange-500",
        badge: 8,
      },
      {
        id: "field-goal",
        name: "Field Goal",
        level: "Advanced",
        description: "Placekicking technique",
        duration: "2-3 seconds",
        keyPoints: "Plant foot, Swing path, Follow-through",
        borderColor: "border-teal-500",
        badge: 9,
      },
    ],
  },
  // Add more subcategories as needed
};

export default function Motions() {
  const [audioOn, setAudioOn] = useState(true);
  const [, setLocation] = useLocation();
  const params = useParams();
  const categoryId = params.categoryId || "sports";
  const subcategoryId = params.subcategoryId || "football";
  
  const motionData = motionsData[subcategoryId] || motionsData.football;

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
            onClick={() => setLocation(`/category/${categoryId}`)}
            className="text-slate-300 hover:text-white flex items-center gap-2 border-2 border-pink-500 rounded-full px-4"
          >
            ← Back to {categoryId === "sports" ? "Sports" : "Category"}
          </Button>
          <h2 className="text-lg text-slate-300">{motionData.breadcrumb}</h2>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">{motionData.name}</h1>
          <p className="text-xl text-slate-300">{motionData.description}</p>
        </div>

        {/* Motion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {motionData.items.map((motion: any) => (
            <button
              key={motion.id}
              onClick={() => setLocation(`/analyze/${motion.id}`)}
              className={`relative text-left p-6 rounded-2xl border-2 ${motion.borderColor} bg-slate-900/60 hover:bg-slate-800/60 transition-all duration-300`}
            >
              <span className="absolute top-3 right-3 bg-slate-800/90 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-slate-600">
                {motion.badge}
              </span>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-bold">{motion.name}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                  {motion.level}
                </span>
              </div>
              <p className="text-slate-300 mb-3">{motion.description}</p>
              <p className="text-sm text-slate-400 mb-2">
                Duration: {motion.duration}
              </p>
              <p className="text-sm text-slate-400">
                Key Points: {motion.keyPoints}
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

