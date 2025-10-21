import Header from "@/components/Header";
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
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 max-w-[1400px] mx-auto px-8 py-8 w-full">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => setLocation("/categories")} className="text-slate-300 hover:text-white hover:bg-slate-800/50 flex items-center gap-2 rounded-lg px-4">← Back to Sports</Button>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-center">{category.name}</h1>
        <p className="text-center text-slate-300 mb-12">Choose a specific sport or activity</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-16">
          {category.subcategories.map((subcategory) => (
            <div key={subcategory.id} onClick={() => setLocation(`/motions/${categoryId}/${subcategory.id}`)} className="bg-slate-900/40 border border-slate-700 rounded-2xl p-8 cursor-pointer hover:bg-slate-900/60 hover:border-slate-600 transition-all">
              <h3 className="text-2xl font-bold mb-3">{subcategory.name}</h3>
              <p className="text-slate-400 text-sm">{subcategory.motions.length} motions available</p>
            </div>
          ))}
        </div>
      </main>
      <footer className="text-center py-6 text-slate-400 border-t border-slate-800/50">
        <p className="text-base mb-2">Total Points: 0</p>
      </footer>
      <div className="fixed bottom-6 right-6 bg-white text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg"><span>✎</span> Tweak</div>
    </div>
  );
}
