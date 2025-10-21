import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { categoriesData } from "@/lib/motionsData";

export default function Subcategories() {
  const [audioOn, setAudioOn] = useState(true);
  const [, setLocation] = useLocation();
  const params = useParams();
  const categoryId = params.categoryId || "";

  const category = categoriesData.find((c) => c.id === categoryId);

  if (!category) {
    return <div>Category not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100">
      <header className="bg-[#050810] flex items-center justify-between px-8 py-6 border-b border-slate-800/50">
        <div className="text-xl font-semibold">Aligned</div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setAudioOn(!audioOn)} className="border-2 border-green-500 bg-green-500 text-white hover:bg-green-600 hover:border-green-600 rounded-full px-5">
            Audio: {audioOn ? "On" : "Off"}
          </Button>
          <Button variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white/10 rounded-full px-5">High Contrast</Button>
          <Button variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white/10 rounded-full px-5">Community</Button>
          <Button variant="outline" className="border-2 border-cyan-400 bg-transparent text-cyan-400 hover:bg-cyan-400/10 rounded-full px-5">Pricing</Button>
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => setLocation("/categories")} className="text-slate-300 hover:text-white hover:bg-slate-800/50 flex items-center gap-2 rounded-lg px-4">← Back to {category.name}</Button>
          <h2 className="text-lg text-slate-300">{category.name}</h2>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-center">{category.name}</h1>
        <p className="text-center text-slate-300 mb-12">Select the specific subcategory to analyze</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {category.subcategories.map((subcategory) => (
            <div key={subcategory.id} onClick={() => setLocation(`/motions/${categoryId}/${subcategory.id}`)} className="bg-slate-900/40 border border-slate-700 rounded-2xl p-8 cursor-pointer hover:bg-slate-900/60 hover:border-slate-600 transition-all">
              <h3 className="text-2xl font-bold mb-3">{subcategory.name}</h3>
              <p className="text-slate-400 text-xs">{subcategory.motions.length} motions</p>
            </div>
          ))}
        </div>
      </main>
      <div className="fixed bottom-6 right-6 bg-white text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg"><span>✎</span> Tweak</div>
    </div>
  );
}
