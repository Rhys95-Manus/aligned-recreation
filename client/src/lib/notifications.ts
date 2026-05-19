/**
 * Push Notification utility for streak milestone notifications.
 * Handles permission requests and sending browser notifications.
 */

export interface MilestoneNotification {
  days: number;
  name: string;
  icon: string;
  message: string;
}

export const MILESTONE_NOTIFICATIONS: MilestoneNotification[] = [
  {
    days: 3,
    name: "Ignited",
    icon: "🔥",
    message: "🔥 You're Ignited! 3 days of showing up for yourself. Keep the fire burning.",
  },
  {
    days: 7,
    name: "Locked In",
    icon: "⚡",
    message: "⚡ Locked In! 7 consecutive days of commitment. You're building something real.",
  },
  {
    days: 14,
    name: "Momentum",
    icon: "💪",
    message: "💪 Momentum! 14 days strong. The habit is forming — don't stop now.",
  },
  {
    days: 30,
    name: "Devoted",
    icon: "🏆",
    message: "🏆 Devoted! 30 days of showing up. Most people quit. You didn't.",
  },
  {
    days: 60,
    name: "Relentless",
    icon: "🔱",
    message: "🔱 Relentless! 60 days. You are in rare company. Elite level commitment.",
  },
  {
    days: 100,
    name: "Aligned",
    icon: "👑",
    message: "👑 Aligned! 100 days. You have fully committed to becoming your best self. Welcome to the top.",
  },
];

/**
 * Check if the browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return "Notification" in window;
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

/**
 * Request notification permission from the user.
 * Should only be called after first login or first completed motion.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!isNotificationSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";

  const result = await Notification.requestPermission();
  return result;
}

/**
 * Send a push notification for a streak milestone.
 * Returns true if notification was sent, false otherwise.
 */
export function sendMilestoneNotification(milestone: MilestoneNotification): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== "granted") return false;

  try {
    new Notification(`${milestone.name} — Streak Milestone!`, {
      body: milestone.message,
      icon: "/aligned-logo-v2.png",
      badge: "/aligned-logo-v2.png",
      tag: `streak-milestone-${milestone.days}`,
      requireInteraction: false,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the milestone notification data for a given streak day count.
 * Returns null if the day count is not a milestone.
 */
export function getMilestoneNotification(days: number): MilestoneNotification | null {
  return MILESTONE_NOTIFICATIONS.find((m) => m.days === days) ?? null;
}

/**
 * Check if we've already requested notification permission in this session.
 */
export function hasRequestedPermission(): boolean {
  return localStorage.getItem("aligned_notification_permission_requested") === "true";
}

/**
 * Mark that we've requested notification permission.
 */
export function markPermissionRequested(): void {
  localStorage.setItem("aligned_notification_permission_requested", "true");
}
