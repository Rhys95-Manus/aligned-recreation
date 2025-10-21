import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation, useParams } from "wouter";

// Complete subcategories data for all categories
const subcategoriesData: Record<string, any> = {
  sports: {
    name: "Sports",
    description: "Choose a specific sport or activity",
    items: [
      { id: "football", name: "Football", motions: 3 },
      { id: "basketball", name: "Basketball", motions: 4 },
      { id: "baseball", name: "Baseball", motions: 5 },
      { id: "tennis", name: "Tennis", motions: 3 },
      { id: "golf", name: "Golf", motions: 3 },
      { id: "soccer", name: "Soccer", motions: 2 },
      { id: "archery", name: "Archery", motions: 3 },
      { id: "track-field", name: "Track & Field", motions: 8 },
    ],
  },
  weightlifting: {
    name: "Weightlifting",
    description: "Choose a specific lift or technique",
    items: [
      { id: "olympic", name: "Olympic Lifts", motions: 4 },
      { id: "powerlifting", name: "Powerlifting", motions: 3 },
      { id: "bodybuilding", name: "Bodybuilding", motions: 6 },
    ],
  },
  yoga: {
    name: "Yoga",
    description: "Choose a specific yoga style",
    items: [
      { id: "hatha", name: "Hatha Yoga", motions: 5 },
      { id: "vinyasa", name: "Vinyasa Flow", motions: 6 },
      { id: "power", name: "Power Yoga", motions: 4 },
      { id: "restorative", name: "Restorative", motions: 3 },
    ],
  },
  dance: {
    name: "Dance",
    description: "Choose a specific dance style",
    items: [
      { id: "ballet", name: "Ballet", motions: 5 },
      { id: "hiphop", name: "Hip Hop", motions: 4 },
      { id: "contemporary", name: "Contemporary", motions: 4 },
      { id: "ballroom", name: "Ballroom", motions: 3 },
    ],
  },
  "martial-arts": {
    name: "Martial Arts",
    description: "Choose a specific martial art",
    items: [
      { id: "karate", name: "Karate", motions: 6 },
    ],
  },
  gymnastics: {
    name: "Gymnastics",
    description: "Choose a specific apparatus or skill",
    items: [
      { id: "floor", name: "Floor Exercise", motions: 5 },
      { id: "vault", name: "Vault", motions: 2 },
      { id: "bars", name: "Bars", motions: 4 },
      { id: "beam", name: "Balance Beam", motions: 3 },
    ],
  },
  recovery: {
    name: "Recovery",
    description: "Choose a specific recovery technique",
    items: [
      { id: "stretching", name: "Stretching", motions: 5 },
      { id: "foam-rolling", name: "Foam Rolling", motions: 4 },
      { id: "mobility", name: "Mobility Work", motions: 4 },
    ],
  },
};

export default function Subcategories() {
  const [audioOn, setAudioOn] = useState(true);
  const [, setLocation] = useLocation();
  const params = useParams();
  const categoryId = params.categoryId || "sports";
  
  const categoryData = subcategoriesData[categoryId] || subcategoriesData.sports;

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
            onClick={() => setLocation("/categories")}
            className="text-slate-300 hover:text-white hover:bg-slate-800/50 flex items-center gap-2 rounded-lg px-4"
          >
            ← Back to Categories
          </Button>
          <h2 className="text-lg text-slate-300">{categoryData.name}</h2>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">{categoryData.name}</h1>
          <p className="text-xl text-slate-300">{categoryData.description}</p>
        </div>

        {/* Subcategory Cards - NO colored borders, NO badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {categoryData.items.map((subcategory: any) => (
            <button
              key={subcategory.id}
              onClick={() => setLocation(`/category/${categoryId}/${subcategory.id}`)}
              className="text-left p-6 rounded-2xl border border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 transition-all duration-300"
            >
              <h3 className="text-2xl font-bold mb-3">{subcategory.name}</h3>
              <p className="text-sm text-slate-400">
                {subcategory.motions} motions available
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
