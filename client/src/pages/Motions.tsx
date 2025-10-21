import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { categoriesData, getDifficultyColor } from "@/lib/motionsData";

export default function Motions() {
  const [audioOn, setAudioOn] = useState(true);
  const [, setLocation] = useLocation();
  const params = useParams();
  const categoryId = params.categoryId || "";
  const subcategoryId = params.subcategoryId || "";

  const category = categoriesData.find((c) => c.id === categoryId);
  const subcategory = category?.subcategories.find((s) => s.id === subcategoryId);

  if (!category || !subcategory) {
    return <div>Not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex flex-col">
      <header className="bg-[#050810] flex items-center justify-between px-8 py-6 border-b border-slate-800/50">
        <div className="text-xl font-semibold cursor-pointer" onClick={() => setLocation("/")}>Aligned</div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setAudioOn(!audioOn)} className="border-2 border-blue-500 bg-transparent text-white hover:bg-blue-500/10 rounded-full px-5">Audio: {audioOn ? "On" : "Off"}</Button>
          <Button variant="outline" className="border-2 border-orange-400 bg-transparent text-white hover:bg-orange-400/10 rounded-full px-5">High Contrast</Button>
          <Button variant="outline" className="border-2 border-purple-500 bg-transparent text-white hover:bg-purple-500/10 rounded-full px-5">Community</Button>
          <Button variant="outline" onClick={() => setLocation("/pricing")} className="border-2 border-cyan-400 bg-transparent text-white hover:bg-cyan-400/10 rounded-full px-5">Pricing</Button>
        </div>
      </header>
      <main className="flex-1 max-w-[1400px] mx-auto px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => setLocation(`/subcategories/${categoryId}`)} className="text-slate-300 hover:text-white hover:bg-slate-800/50 flex items-center gap-2 rounded-lg px-4">← Back to {category.name}</Button>
          <p className="text-slate-300">{category.name} · {subcategory.name}</p>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-center">{subcategory.name}</h1>
        <p className="text-center text-slate-300 mb-12">Select the specific motion to analyze</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          {subcategory.motions.map((motion) => (
            <div key={motion.id} onClick={() => setLocation(`/analysis/${categoryId}/${subcategoryId}/${motion.id}`)} className="relative bg-slate-900/40 border border-slate-700 rounded-2xl p-8 cursor-pointer hover:bg-slate-900/60 hover:border-slate-600 transition-all group min-h-[220px] flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold">{motion.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(motion.level)}`}>{motion.level}</span>
              </div>
              <p className="text-slate-300 text-sm mb-4">{motion.description}</p>
              <p className="text-slate-400 text-xs mb-2">Duration: {motion.duration}</p>
              <p className="text-slate-400 text-xs mb-4">Key Points: {motion.keyPoints}</p>
              <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity pt-4 border-t border-slate-700">
                <p className="text-center text-blue-400 font-medium">Click to analyze this motion →</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className="text-center py-6 text-slate-400 border-t border-slate-800/50">
        <p className="text-base mb-2">Total Points: 0</p>
        <p className="text-sm">Made with Manus</p>
      </footer>
      <div className="fixed bottom-6 right-6 bg-white text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg"><span>✎</span> Tweak</div>
    </div>
  );
}
