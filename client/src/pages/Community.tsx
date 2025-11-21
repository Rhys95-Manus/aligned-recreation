import Header from "@/components/Header";
import { useState } from "react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  date: string;
}

// Mock leaderboard data for each motion
const generateMockLeaderboard = (motionName: string): LeaderboardEntry[] => {
  const usernames = [
    "ThrowerPro", "FormMaster", "AthleteX", "QuickRelease", "PowerArm",
    "PrecisionKing", "SpeedDemon", "TechniqueGuru", "ElitePlayer", "ChampionForm",
    "MechanicsAce", "ProMotion", "FlawlessForm", "PeakPerformer", "SkillMaster",
    "FormGenius", "MotionExpert", "TopThrower", "BioMechanic", "AlignedPro"
  ];
  
  // Generate scores between 70-98 for realistic leaderboard
  const baseScores = [98, 96, 94, 92, 90, 88, 86, 84, 82, 80];
  
  return baseScores.map((score, index) => ({
    rank: index + 1,
    username: usernames[index],
    score: score + Math.floor(Math.random() * 2), // Add slight variation
    date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
  }));
};

const motions = [
  { category: "Football", subcategory: "Quarterback", name: "Throw" },
  { category: "Golf", subcategory: "Driver", name: "Swing" },
  { category: "Tennis", subcategory: "Serve", name: "Serve" },
  { category: "Baseball", subcategory: "Pitcher", name: "Pitch" },
  { category: "Basketball", subcategory: "Shooting", name: "Shot" },
  { category: "Archery", subcategory: "Recurve", name: "Draw" },
];

export default function Community() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100">
      <Header />

      <main className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Community Leaderboards</h1>
          <p className="text-slate-300 text-lg">
            See how you stack up against the best performers in each motion
          </p>
        </div>

        {/* Leaderboards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {motions.map((motion) => {
            const leaderboard = generateMockLeaderboard(motion.name);
            
            return (
              <div
                key={`${motion.category}-${motion.name}`}
                className="bg-slate-900/40 border border-slate-700 rounded-2xl p-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-1">
                    {motion.category} - {motion.name}
                  </h2>
                  <p className="text-slate-400 text-sm">{motion.subcategory}</p>
                </div>

                {/* Leaderboard Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-2 text-slate-400 font-medium">Rank</th>
                        <th className="text-left py-3 px-2 text-slate-400 font-medium">Username</th>
                        <th className="text-right py-3 px-2 text-slate-400 font-medium">Score</th>
                        <th className="text-right py-3 px-2 text-slate-400 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry) => (
                        <tr
                          key={entry.rank}
                          className={`border-b border-slate-800 hover:bg-slate-800/30 transition-colors ${
                            entry.rank <= 3 ? 'bg-slate-800/20' : ''
                          }`}
                        >
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              {entry.rank === 1 && <span className="text-yellow-400 text-xl">🥇</span>}
                              {entry.rank === 2 && <span className="text-gray-300 text-xl">🥈</span>}
                              {entry.rank === 3 && <span className="text-orange-400 text-xl">🥉</span>}
                              <span className={entry.rank <= 3 ? 'font-bold' : ''}>
                                #{entry.rank}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2 font-medium">{entry.username}</td>
                          <td className="py-3 px-2 text-right">
                            <span className={`font-bold ${
                              entry.score >= 95 ? 'text-green-400' :
                              entry.score >= 85 ? 'text-yellow-400' :
                              'text-slate-300'
                            }`}>
                              {entry.score}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right text-slate-400 text-sm">
                            {entry.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>Leaderboards update in real-time. Complete a motion analysis to see your ranking!</p>
        </div>
      </main>
    </div>
  );
}
