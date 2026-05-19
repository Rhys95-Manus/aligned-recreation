import { useState, useEffect } from "react";
import type { MilestoneNotification } from "@/lib/notifications";

interface MilestoneBannerProps {
  milestone: MilestoneNotification;
  onDismiss: () => void;
}

export default function MilestoneBanner({ milestone, onDismiss }: MilestoneBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger slide-down animation on mount
    const showTimer = setTimeout(() => setIsVisible(true), 50);

    // Auto-dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    // Wait for slide-up animation to complete before calling onDismiss
    setTimeout(() => {
      onDismiss();
    }, 400);
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none transition-transform duration-400 ease-out ${
        isVisible && !isExiting ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{ transitionDuration: "400ms" }}
    >
      <div className="pointer-events-auto mt-4 mx-4 max-w-lg w-full">
        {/* Banner card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0d1225]/95 backdrop-blur-xl border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15),0_0_60px_rgba(6,182,212,0.05)] p-4">
          {/* Animated glow border effect */}
          <div className="absolute inset-0 rounded-2xl opacity-40 animate-pulse bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10" />

          {/* Content */}
          <div className="relative flex items-center gap-4">
            {/* Badge icon with glow/pulse */}
            <div className="flex-shrink-0">
              <div className="relative">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-md animate-pulse" />
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 flex items-center justify-center animate-[pulse_1.5s_ease-in-out_2]">
                  <span className="text-3xl">{milestone.icon}</span>
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider mb-0.5">
                {milestone.name} Unlocked
              </h3>
              <p className="text-sm text-slate-200 leading-snug">
                {milestone.message}
              </p>
            </div>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss notification"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Progress bar that shrinks over 5 seconds */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all ease-linear"
              style={{
                width: isVisible && !isExiting ? "0%" : "100%",
                transitionDuration: isVisible && !isExiting ? "5000ms" : "0ms",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
