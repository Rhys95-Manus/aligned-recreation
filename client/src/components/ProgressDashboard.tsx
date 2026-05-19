import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SessionData {
  id: string;
  timestamp: string;
  motionName: string;
  detailedAnalysis?: { overallScore?: number };
}

interface ProgressDashboardProps {
  sessions: SessionData[];
}

export default function ProgressDashboard({ sessions }: ProgressDashboardProps) {
  // Get unique motion names that have scores
  const motionsWithScores = useMemo(() => {
    const motionSet = new Set<string>();
    sessions.forEach((s) => {
      if (s.detailedAnalysis?.overallScore && s.detailedAnalysis.overallScore > 0) {
        motionSet.add(s.motionName);
      }
    });
    return Array.from(motionSet).sort();
  }, [sessions]);

  const [selectedMotion, setSelectedMotion] = useState<string>(
    motionsWithScores[0] || ""
  );

  // Filter sessions for the selected motion and build chart data
  const chartData = useMemo(() => {
    if (!selectedMotion) return [];
    return sessions
      .filter(
        (s) =>
          s.motionName === selectedMotion &&
          s.detailedAnalysis?.overallScore &&
          s.detailedAnalysis.overallScore > 0
      )
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      .map((s) => ({
        date: new Date(s.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        score: s.detailedAnalysis!.overallScore!,
        fullDate: new Date(s.timestamp).toLocaleDateString(),
      }));
  }, [sessions, selectedMotion]);

  // Calculate personal best per motion
  const personalBests = useMemo(() => {
    const bests: Record<string, { score: number; date: string }> = {};
    sessions.forEach((s) => {
      const score = s.detailedAnalysis?.overallScore;
      if (!score || score <= 0) return;
      if (!bests[s.motionName] || score > bests[s.motionName].score) {
        bests[s.motionName] = {
          score,
          date: new Date(s.timestamp).toLocaleDateString(),
        };
      }
    });
    return bests;
  }, [sessions]);

  // Calculate most improved motion
  const mostImproved = useMemo(() => {
    let bestImprovement = 0;
    let bestMotion = "";

    motionsWithScores.forEach((motion) => {
      const motionSessions = sessions
        .filter(
          (s) =>
            s.motionName === motion &&
            s.detailedAnalysis?.overallScore &&
            s.detailedAnalysis.overallScore > 0
        )
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

      if (motionSessions.length < 2) return;

      const firstScore = motionSessions[0].detailedAnalysis!.overallScore!;
      const lastScore =
        motionSessions[motionSessions.length - 1].detailedAnalysis!.overallScore!;
      const improvement = lastScore - firstScore;

      if (improvement > bestImprovement) {
        bestImprovement = improvement;
        bestMotion = motion;
      }
    });

    return bestMotion
      ? { motion: bestMotion, improvement: bestImprovement }
      : null;
  }, [sessions, motionsWithScores]);

  const currentPersonalBest = selectedMotion
    ? personalBests[selectedMotion]
    : null;

  if (motionsWithScores.length === 0) {
    return (
      <div className="bg-[#1a1f2e] rounded-lg p-6 mb-6 border border-slate-700/50">
        <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
          <span className="text-cyan-400">📈</span> Progress Dashboard
        </h2>
        <p className="text-gray-400">
          Complete your first session to start tracking your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1f2e] rounded-lg p-6 mb-6 border border-slate-700/50">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span className="text-cyan-400">📈</span> Progress Dashboard
      </h2>

      {/* Callout Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Personal Best */}
        {currentPersonalBest && (
          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="text-sm text-yellow-400/80 font-medium mb-1">
              Personal Best — {selectedMotion}
            </div>
            <div className="text-3xl font-bold text-yellow-400">
              {currentPersonalBest.score}
              <span className="text-lg text-yellow-400/60">/100</span>
            </div>
            <div className="text-xs text-yellow-400/50 mt-1">
              Achieved on {currentPersonalBest.date}
            </div>
          </div>
        )}

        {/* Most Improved */}
        {mostImproved && (
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-500/30 rounded-lg p-4">
            <div className="text-sm text-green-400/80 font-medium mb-1">
              Most Improved
            </div>
            <div className="text-3xl font-bold text-green-400">
              +{mostImproved.improvement}
              <span className="text-lg text-green-400/60"> pts</span>
            </div>
            <div className="text-xs text-green-400/50 mt-1">
              {mostImproved.motion}
            </div>
          </div>
        )}
      </div>

      {/* Motion Filter */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-400">View trend for:</label>
        <select
          value={selectedMotion}
          onChange={(e) => setSelectedMotion(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
        >
          {motionsWithScores.map((motion) => (
            <option key={motion} value={motion}>
              {motion}
            </option>
          ))}
        </select>
      </div>

      {/* Line Chart */}
      {chartData.length < 2 ? (
        <div className="bg-gray-800/50 rounded-lg p-8 text-center">
          <p className="text-gray-400">
            Complete more sessions to see your progress trend
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {chartData.length === 1
              ? "1 session recorded — need at least 2 to show a trend"
              : "No scored sessions for this motion yet"}
          </p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                }}
                labelStyle={{ color: "#94a3b8" }}
                formatter={(value: number) => [`${value}/100`, "Score"]}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={{ fill: "#22d3ee", strokeWidth: 2, r: 4 }}
                activeDot={{ fill: "#06b6d4", strokeWidth: 0, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
