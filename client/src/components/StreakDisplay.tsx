import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import MilestoneBanner from "@/components/MilestoneBanner";
import {
  MILESTONE_NOTIFICATIONS,
  sendMilestoneNotification,
  getMilestoneNotification,
  requestNotificationPermission,
  hasRequestedPermission,
  markPermissionRequested,
  getNotificationPermission,
} from "@/lib/notifications";
import type { MilestoneNotification } from "@/lib/notifications";

interface MilestoneBadge {
  days: number;
  name: string;
  icon: string;
  description: string;
  color: string;
  glowColor: string;
}

const MILESTONES: MilestoneBadge[] = [
  {
    days: 3,
    name: "Ignited",
    icon: "🔥",
    description: "Getting started",
    color: "from-orange-600 to-red-600",
    glowColor: "shadow-orange-500/50",
  },
  {
    days: 7,
    name: "Locked In",
    icon: "🔒",
    description: "One week of consistency",
    color: "from-blue-600 to-indigo-600",
    glowColor: "shadow-blue-500/50",
  },
  {
    days: 14,
    name: "Momentum",
    icon: "⚡",
    description: "Two weeks, building habit",
    color: "from-purple-600 to-violet-600",
    glowColor: "shadow-purple-500/50",
  },
  {
    days: 30,
    name: "Devoted",
    icon: "💎",
    description: "One month, serious commitment",
    color: "from-emerald-600 to-teal-600",
    glowColor: "shadow-emerald-500/50",
  },
  {
    days: 60,
    name: "Relentless",
    icon: "🌊",
    description: "Two months, elite level",
    color: "from-cyan-500 to-blue-600",
    glowColor: "shadow-cyan-500/50",
  },
  {
    days: 100,
    name: "Aligned",
    icon: "✦",
    description: "The highest badge",
    color: "from-cyan-400 to-purple-500",
    glowColor: "shadow-cyan-400/60",
  },
];

function CelebrationAnimation({ badge, onClose }: { badge: MilestoneBadge; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Energy particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-cyan-400 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      <div className="relative text-center p-8 max-w-sm">
        {/* Glow ring */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${badge.color} opacity-20 blur-3xl animate-pulse`} />

        {/* Badge icon */}
        <div className={`relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${badge.color} shadow-lg ${badge.glowColor} mb-4 animate-bounce`}>
          <span className="text-4xl">{badge.icon}</span>
        </div>

        {/* Text */}
        <h2 className="text-3xl font-bold text-white mb-2">
          {badge.name} Unlocked!
        </h2>
        <p className="text-cyan-300 text-lg mb-1">{badge.days}-Day Streak</p>
        <p className="text-gray-400 text-sm">{badge.description}</p>
        <p className="text-gray-500 text-xs mt-4">Tap to dismiss</p>
      </div>
    </div>
  );
}

export default function StreakDisplay() {
  const { isAuthenticated } = useAuth();
  const [celebratingBadge, setCelebratingBadge] = useState<MilestoneBadge | null>(null);
  const [hasShownCelebration, setHasShownCelebration] = useState<Set<number>>(new Set());
  const [bannerMilestone, setBannerMilestone] = useState<MilestoneNotification | null>(null);

  const { data: streakData } = trpc.streak.get.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const currentStreak = streakData?.currentStreak ?? 0;
  const longestStreak = streakData?.longestStreak ?? 0;

  // Determine earned badges
  const earnedBadges = useMemo(
    () => MILESTONES.filter((m) => longestStreak >= m.days),
    [longestStreak]
  );

  // Request notification permission on first login (not on landing page)
  useEffect(() => {
    if (!isAuthenticated) return;
    if (hasRequestedPermission()) return;

    // Delay permission request slightly so it doesn't fire immediately on page load
    const timer = setTimeout(() => {
      requestNotificationPermission().then(() => {
        markPermissionRequested();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // Check for new milestone celebration + send notifications
  useEffect(() => {
    if (!streakData) return;

    // Find the highest milestone that the current streak has reached
    // and that we haven't already celebrated this session
    const newBadge = [...MILESTONES]
      .reverse()
      .find((m) => currentStreak >= m.days && !hasShownCelebration.has(m.days));

    if (newBadge) {
      // Only celebrate if it's a newly earned badge (check localStorage)
      const celebratedKey = `aligned_celebrated_${newBadge.days}`;
      if (!localStorage.getItem(celebratedKey)) {
        // 1. Show celebration animation
        setCelebratingBadge(newBadge);
        localStorage.setItem(celebratedKey, "true");

        // 2. Send push notification (if permission granted)
        const milestoneNotif = getMilestoneNotification(newBadge.days);
        if (milestoneNotif) {
          sendMilestoneNotification(milestoneNotif);
          // 3. Show in-app banner
          setBannerMilestone(milestoneNotif);
        }
      }

      setHasShownCelebration((prev) => {
        const next = new Set(Array.from(prev));
        next.add(newBadge.days);
        return next;
      });
    }
  }, [streakData, currentStreak, hasShownCelebration]);

  // Show streak for all users — non-authenticated users see 0 streak as motivation to sign in

  return (
    <>
      {/* In-app banner notification */}
      {bannerMilestone && (
        <MilestoneBanner
          milestone={bannerMilestone}
          onDismiss={() => setBannerMilestone(null)}
        />
      )}

      {/* Celebration overlay */}
      {celebratingBadge && (
        <CelebrationAnimation
          badge={celebratingBadge}
          onClose={() => setCelebratingBadge(null)}
        />
      )}

      {/* Streak section */}
      <div className="bg-gradient-to-br from-[#0f1629] to-[#1a1f3a] border border-cyan-900/30 rounded-2xl p-6 md:p-8 mb-8">
        {/* Current Streak */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl md:text-5xl animate-pulse">🔥</span>
            <span className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {currentStreak}
            </span>
          </div>
          <p className="text-slate-300 text-lg">
            {currentStreak === 0
              ? "Start your streak today"
              : "Days showing up for yourself"}
          </p>
          {longestStreak > 0 && longestStreak !== currentStreak && (
            <p className="text-slate-500 text-sm mt-1">
              Longest streak: {longestStreak} days
            </p>
          )}
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {MILESTONES.map((milestone) => {
            const isEarned = longestStreak >= milestone.days;
            return (
              <div
                key={milestone.days}
                className="relative group"
                title={
                  isEarned
                    ? `${milestone.name} — ${milestone.description}`
                    : `${milestone.days}-day streak required`
                }
              >
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
                    isEarned
                      ? `bg-gradient-to-br ${milestone.color} shadow-lg ${milestone.glowColor}`
                      : "bg-gray-800/60 border border-gray-700"
                  }`}
                >
                  <span
                    className={`text-xl md:text-2xl ${
                      isEarned ? "" : "opacity-30 grayscale"
                    }`}
                  >
                    {milestone.icon}
                  </span>
                </div>
                {/* Badge name */}
                <p
                  className={`text-xs text-center mt-1 ${
                    isEarned ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {milestone.name}
                </p>
                {/* Tooltip on hover for locked badges */}
                {!isEarned && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {milestone.days}-day streak
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
