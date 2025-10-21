import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation, useParams } from "wouter";

// Complete motions data for all subcategories
const motionsData: Record<string, any> = {
  football: {
    name: "Football",
    breadcrumb: "Sports > Football",
    description: "Select the specific motion to analyze",
    items: [
      { id: "throw", name: "Throw", level: "Intermediate", description: "Quarterback throwing technique", duration: "1-2 seconds", keyPoints: "Arm motion, Footwork, Release" },
      { id: "punt", name: "Punt", level: "Advanced", description: "Professional punting technique", duration: "2-3 seconds", keyPoints: "Drop timing, Leg swing, Contact point" },
      { id: "field-goal", name: "Field Goal", level: "Advanced", description: "Placekicking technique", duration: "2-3 seconds", keyPoints: "Plant foot, Swing path, Follow-through" },
    ],
  },
  basketball: {
    name: "Basketball",
    breadcrumb: "Sports > Basketball",
    description: "Select the specific motion to analyze",
    items: [
      { id: "jump-shot", name: "Jump Shot", level: "Intermediate", description: "Standard jump shot technique", duration: "1-2 seconds", keyPoints: "Form, Release, Follow-through" },
      { id: "layup", name: "Layup", level: "Beginner", description: "Basic layup technique", duration: "1-2 seconds", keyPoints: "Approach, Footwork, Finish" },
      { id: "free-throw", name: "Free Throw", level: "Intermediate", description: "Free throw shooting form", duration: "2-3 seconds", keyPoints: "Stance, Arc, Consistency" },
      { id: "dunk", name: "Dunk", level: "Advanced", description: "Dunking technique", duration: "1-2 seconds", keyPoints: "Approach, Jump, Finish" },
    ],
  },
  baseball: {
    name: "Baseball",
    breadcrumb: "Sports > Baseball",
    description: "Select the specific motion to analyze",
    items: [
      { id: "pitch", name: "Pitch", level: "Advanced", description: "Pitching mechanics", duration: "2-3 seconds", keyPoints: "Windup, Delivery, Release" },
      { id: "swing", name: "Swing", level: "Intermediate", description: "Batting swing technique", duration: "1 second", keyPoints: "Stance, Swing path, Contact" },
      { id: "catch", name: "Catch", level: "Beginner", description: "Catching technique", duration: "1 second", keyPoints: "Positioning, Glove work, Transfer" },
      { id: "throw", name: "Throw", level: "Intermediate", description: "Throwing mechanics", duration: "1-2 seconds", keyPoints: "Arm angle, Footwork, Accuracy" },
      { id: "slide", name: "Slide", level: "Intermediate", description: "Base sliding technique", duration: "1-2 seconds", keyPoints: "Timing, Form, Safety" },
    ],
  },
  tennis: {
    name: "Tennis",
    breadcrumb: "Sports > Tennis",
    description: "Select the specific motion to analyze",
    items: [
      { id: "serve", name: "Serve", level: "Advanced", description: "Tennis serve technique", duration: "2-3 seconds", keyPoints: "Toss, Motion, Contact" },
      { id: "forehand", name: "Forehand", level: "Intermediate", description: "Forehand stroke", duration: "1 second", keyPoints: "Grip, Swing, Follow-through" },
      { id: "backhand", name: "Backhand", level: "Intermediate", description: "Backhand stroke", duration: "1 second", keyPoints: "Grip, Rotation, Contact" },
    ],
  },
  golf: {
    name: "Golf",
    breadcrumb: "Sports > Golf",
    description: "Select the specific motion to analyze",
    items: [
      { id: "drive", name: "Drive", level: "Intermediate", description: "Driver swing technique", duration: "2-3 seconds", keyPoints: "Setup, Backswing, Impact" },
      { id: "iron", name: "Iron Shot", level: "Intermediate", description: "Iron shot technique", duration: "2-3 seconds", keyPoints: "Ball position, Swing, Divot" },
      { id: "putt", name: "Putt", level: "Beginner", description: "Putting stroke", duration: "1-2 seconds", keyPoints: "Alignment, Stroke, Distance control" },
    ],
  },
  soccer: {
    name: "Soccer",
    breadcrumb: "Sports > Soccer",
    description: "Select the specific motion to analyze",
    items: [
      { id: "kick", name: "Kick", level: "Intermediate", description: "Ball striking technique", duration: "1 second", keyPoints: "Approach, Contact, Follow-through" },
      { id: "header", name: "Header", level: "Intermediate", description: "Heading technique", duration: "1 second", keyPoints: "Timing, Contact point, Direction" },
    ],
  },
  archery: {
    name: "Archery",
    breadcrumb: "Sports > Archery",
    description: "Select the specific motion to analyze",
    items: [
      { id: "draw", name: "Draw", level: "Intermediate", description: "Drawing the bow", duration: "2-3 seconds", keyPoints: "Stance, Draw, Anchor" },
      { id: "release", name: "Release", level: "Advanced", description: "Release technique", duration: "1 second", keyPoints: "Timing, Form, Follow-through" },
      { id: "aim", name: "Aim", level: "Intermediate", description: "Aiming technique", duration: "2-3 seconds", keyPoints: "Sight picture, Stability, Focus" },
    ],
  },
  "track-field": {
    name: "Track & Field",
    breadcrumb: "Sports > Track & Field",
    description: "Select the specific motion to analyze",
    items: [
      { id: "sprint", name: "Sprint", level: "Intermediate", description: "Sprinting technique", duration: "Continuous", keyPoints: "Start, Stride, Finish" },
      { id: "hurdle", name: "Hurdle", level: "Advanced", description: "Hurdling technique", duration: "1-2 seconds", keyPoints: "Approach, Clearance, Landing" },
      { id: "long-jump", name: "Long Jump", level: "Advanced", description: "Long jump technique", duration: "2-3 seconds", keyPoints: "Approach, Takeoff, Landing" },
      { id: "high-jump", name: "High Jump", level: "Advanced", description: "High jump technique", duration: "2-3 seconds", keyPoints: "Approach, Takeoff, Clearance" },
      { id: "shot-put", name: "Shot Put", level: "Advanced", description: "Shot put technique", duration: "2-3 seconds", keyPoints: "Glide, Power position, Release" },
      { id: "discus", name: "Discus", level: "Advanced", description: "Discus throw technique", duration: "2-3 seconds", keyPoints: "Spin, Power position, Release" },
      { id: "javelin", name: "Javelin", level: "Advanced", description: "Javelin throw technique", duration: "2-3 seconds", keyPoints: "Approach, Crossover, Release" },
      { id: "pole-vault", name: "Pole Vault", level: "Advanced", description: "Pole vault technique", duration: "3-4 seconds", keyPoints: "Approach, Plant, Clearance" },
    ],
  },
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
      {/* Header with darker background */}
      <header className="bg-[#050810] flex items-center justify-between px-8 py-6 border-b border-slate-800/50">
        <div className="text-xl font-semibold">Aligned</div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setAudioOn(!audioOn)}
            className="border-2 border-green-500 bg-green-500 text-white hover:bg-green-600 hover:border-green-600 rounded-full px-5"
          >
            Audio: {audioOn ? "On" : "Off"}
          </Button>
          <Button
            variant="outline"
            className="border-2 border-yellow-500 bg-transparent text-yellow-500 hover:bg-yellow-500/10 rounded-full px-5"
          >
            High Contrast
          </Button>
          <Button
            variant="outline"
            className="border-2 border-pink-500 bg-transparent text-pink-500 hover:bg-pink-500/10 rounded-full px-5"
          >
            Community
          </Button>
          <Button
            variant="outline"
            className="border-2 border-cyan-500 bg-transparent text-cyan-500 hover:bg-cyan-500/10 rounded-full px-5"
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
            className="text-slate-300 hover:text-white hover:bg-slate-800/50 flex items-center gap-2 rounded-lg px-4"
          >
            ← Back to {categoryId === "sports" ? "Sports" : "Category"}
          </Button>
          <h2 className="text-lg text-slate-300">{motionData.breadcrumb}</h2>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">{motionData.name}</h1>
          <p className="text-xl text-slate-300">{motionData.description}</p>
        </div>

        {/* Motion Cards - NO colored borders, NO badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {motionData.items.map((motion: any) => (
            <button
              key={motion.id}
              onClick={() => setLocation(`/analyze/${motion.id}`)}
              className="text-left p-6 rounded-2xl border border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 transition-all duration-300"
            >
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

      {/* Fixed bottom-right badge */}
      <div className="fixed bottom-6 right-6 bg-white text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
        <span>✎</span> Tweak
      </div>
    </div>
  );
}
