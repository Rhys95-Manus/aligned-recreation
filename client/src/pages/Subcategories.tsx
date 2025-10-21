import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation, useParams } from "wouter";

// Define subcategories for each category
const subcategoriesData: Record<string, any> = {
  sports: {
    name: "Sports",
    description: "Choose a specific sport or activity",
    items: [
      { id: "football", name: "Football", motions: 3, borderColor: "border-purple-500", badge: 7 },
      { id: "basketball", name: "Basketball", motions: 4, borderColor: "border-orange-500", badge: 8 },
      { id: "baseball", name: "Baseball", motions: 5, borderColor: "border-teal-500", badge: 9 },
      { id: "tennis", name: "Tennis", motions: 3, borderColor: "border-pink-500", badge: 10 },
      { id: "golf", name: "Golf", motions: 3, borderColor: "border-blue-500", badge: 11 },
      { id: "soccer", name: "Soccer", motions: 2, borderColor: "border-red-500", badge: 12 },
      { id: "archery", name: "Archery", motions: 3, borderColor: "border-green-500", badge: 13 },
      { id: "track-field", name: "Track & Field", motions: 8, borderColor: "border-indigo-500", badge: 14 },
    ],
  },
  yoga: {
    name: "Yoga",
    description: "Choose a specific yoga style",
    items: [
      { id: "hatha", name: "Hatha Yoga", motions: 5, borderColor: "border-purple-500", badge: 7 },
      { id: "vinyasa", name: "Vinyasa Flow", motions: 6, borderColor: "border-blue-500", badge: 8 },
      { id: "power", name: "Power Yoga", motions: 4, borderColor: "border-red-500", badge: 9 },
      { id: "restorative", name: "Restorative", motions: 3, borderColor: "border-green-500", badge: 10 },
    ],
  },
  // Add more categories as needed
};

export default function Subcategories() {
  const [audioOn, setAudioOn] = useState(true);
  const [, setLocation] = useLocation();
  const params = useParams();
  const categoryId = params.categoryId || "sports";
  
  const categoryData = subcategoriesData[categoryId] || subcategoriesData.sports;

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
            onClick={() => setLocation("/categories")}
            className="text-slate-300 hover:text-white flex items-center gap-2 border-2 border-pink-500 rounded-full px-4"
          >
            ← Back to Categories
          </Button>
          <h2 className="text-lg text-slate-300">{categoryData.name}</h2>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">{categoryData.name}</h1>
          <p className="text-xl text-slate-300">{categoryData.description}</p>
        </div>

        {/* Subcategory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {categoryData.items.map((subcategory: any) => (
            <button
              key={subcategory.id}
              onClick={() => setLocation(`/category/${categoryId}/${subcategory.id}`)}
              className={`relative text-left p-6 rounded-2xl border-2 ${subcategory.borderColor} bg-slate-900/60 hover:bg-slate-800/60 transition-all duration-300`}
            >
              <span className="absolute top-3 right-3 bg-slate-800/90 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-slate-600">
                {subcategory.badge}
              </span>
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
    </div>
  );
}

