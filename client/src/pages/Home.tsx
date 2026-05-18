import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAudio } from "@/contexts/AudioContext";
import AudioSettingsModal from "@/components/AudioSettingsModal";

const featuredCategories = [
  {
    id: "sports",
    name: "Sports",
    description: "Football, basketball, baseball, tennis & more",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663143408740/Gd6AiijCmPwLtcbfaErCFP/category-sports-MVkeqiyv7nw5Rxpexe3F5r.webp",
    route: "/subcategories/sports",
  },
  {
    id: "weightlifting",
    name: "Weightlifting",
    description: "Powerlifting, Olympic lifts & kettlebell training",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663143408740/Gd6AiijCmPwLtcbfaErCFP/category-weightlifting-98TYa4o5P2N6yisn6dhbXZ.webp",
    route: "/subcategories/weightlifting",
  },
  {
    id: "recovery",
    name: "Recovery",
    description: "Physical therapy, stretching & mobility work",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663143408740/Gd6AiijCmPwLtcbfaErCFP/category-recovery-V2dndiQN4XfRDXnnnwksJk.webp",
    route: "/subcategories/recovery",
  },
];

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const { audioEnabled, toggleAudio } = useAudio();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100">
      <header className="bg-[#050810] flex items-center justify-between px-4 md:px-8 py-4 md:py-6 border-b border-slate-800/50">
        <div className="cursor-pointer" onClick={() => setLocation("/")}>
          <img src="/aligned-logo-v2.png" alt="Aligned" className="h-14 md:h-16 object-contain" />
        </div>
        <div className="flex gap-2 md:gap-3 flex-wrap justify-end">
          <AudioSettingsModal />
          <Button variant="outline" onClick={() => setLocation("/community")} className="!border-2 !border-white bg-transparent text-white hover:bg-white/10 rounded-full px-3 md:px-5 text-sm md:text-base">Community</Button>
          <Button variant="outline" onClick={() => setLocation("/history")} className="!border-2 !border-purple-400 bg-transparent !text-purple-400 hover:bg-purple-400/10 rounded-full px-3 md:px-5 text-sm md:text-base">History</Button>
          <Button variant="outline" onClick={() => setLocation("/pricing")} className="!border-2 !border-cyan-400 bg-transparent !text-cyan-400 hover:bg-cyan-400/10 rounded-full px-3 md:px-5 text-sm md:text-base">Pricing</Button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 flex flex-col md:flex-row items-center justify-center gap-0 md:gap-0">
            <span>Welcome to</span> <img src="/aligned-logo-v2.png" alt="Aligned" className="h-32 md:h-40 object-contain inline-block translate-y-2 md:translate-y-4 -mt-4 md:-mt-0 md:-ml-2" />
          </h1>
          <p className="text-xl text-slate-300 mb-8">Professional feedback on your form</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setLocation("/categories")} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl">
              Get Started
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {featuredCategories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 hover:border-cyan-500/40 transition-all cursor-pointer group"
              onClick={() => setLocation(cat.route)}
            >
              <div className="overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>
                <p className="text-slate-300 text-sm">{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-10 text-slate-400">
        <div className="flex justify-center gap-6 mb-3 text-sm">
          <span
            className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
            onClick={() => setLocation("/terms")}
          >
            Terms of Service
          </span>
          <span className="text-slate-600">|</span>
          <span
            className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
            onClick={() => setLocation("/privacy")}
          >
            Privacy Policy
          </span>
        </div>
        <p className="text-sm">Made with Manus</p>
      </footer>
    </div>
  );
}
