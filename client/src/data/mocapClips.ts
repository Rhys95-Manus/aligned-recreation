import type { MocapAngleId } from "@/lib/mocapAngles";

export interface MocapPhase {
  name: string;
  /** Absolute seconds on the original FBX timeline, NOT normalized playback time. */
  startTime: number;
  endTime: number;
  /** Exact reference phase name, when the display name differs. */
  referenceName?: string;
}

export interface MocapClipConfig {
  id: string;
  name: string;
  fbxUrl: string;
  targetModel: string;
  trimStart: number;
  trimEnd: number;
  scale: number;
  phases: readonly MocapPhase[];
  fps?: number;
  hipBone?: string;
  sourceRootBone?: string;
  /** Exact professionalReferences registry key; no fuzzy or generic fallback. */
  referenceKey?: string;
  /** Reference metric name -> geometric measurement. Defines handedness/lead leg. */
  metricBindings?: Readonly<Record<string, MocapAngleId>>;
  timingNote?: string;
}

export const DEFAULT_MOCAP_CLIP_ID = "quarterback-throw";

/** Add licensed Mixamo motions here. No route or viewer code change is required. */
export const mocapClips: readonly MocapClipConfig[] = [
  {
    id: DEFAULT_MOCAP_CLIP_ID,
    name: "Quarterback throw",
    fbxUrl: "/manus-storage/Football_Quarterback_mixamo_25080ba4.fbx",
    targetModel: "https://d2xsxph8kpxj0f.cloudfront.net/310519663143408740/Gd6AiijCmPwLtcbfaErCFP/MaleHologram_quant_d74b85d9.glb",
    trimStart: 23.33,
    trimEnd: 25.33,
    scale: 0.01,
    fps: 24,
    hipBone: "mixamorigHips",
    sourceRootBone: "mixamorigReference",
    referenceKey: "football-throw",
    // This clip is right-handed: left leg leads, right leg trails.
    metricBindings: {
      "Throwing Elbow Flexion": "rightElbowAngle",
      "Throwing Elbow Extension": "rightElbowAngle",
      "Non-Throwing Elbow Flexion": "leftElbowAngle",
      "Non-Throwing Elbow Extension": "leftElbowAngle",
      "Lead Knee Flexion": "leftKneeAngle",
      "Lead Knee Extension": "leftKneeAngle",
      "Back Knee Flexion": "rightKneeAngle",
      "Back Knee Extension": "rightKneeAngle",
      "Hip-Shoulder Separation": "hipShoulderSeparation",
    },
    phases: [
      { name: "Loaded / Ready", referenceName: "Neutral / Ready Position", startTime: 23.33, endTime: 23.60 },
      { name: "Early Cocking", startTime: 23.60, endTime: 23.90 },
      { name: "Late Cocking / Max Torque", startTime: 23.90, endTime: 24.17 },
      { name: "Acceleration / Release", startTime: 24.17, endTime: 24.50 },
      { name: "Follow-Through", startTime: 24.50, endTime: 25.33 },
    ],
    timingNote: "Manual approximate phase windows, not detected phases. The clip starts already loaded; Loaded / Ready uses the Neutral / Ready benchmark only as a comparison, not a claim that a true neutral pose is present. Release is estimated around 24.25–24.50 s.",
  },
];

export function getMocapClip(id: string): MocapClipConfig | undefined {
  return mocapClips.find((clip) => clip.id === id);
}

export function validateMocapConfig(config: MocapClipConfig): void {
  const fps = config.fps ?? 24;
  if (!config.id || !config.name || !config.fbxUrl || !config.targetModel) throw new Error("Motion config requires id, name, FBX URL, and target model.");
  if (!Number.isFinite(fps) || fps < 1 || fps > 240) throw new Error("Motion fps must be between 1 and 240.");
  if (!Number.isFinite(config.scale) || config.scale <= 0) throw new Error("Motion scale must be positive and finite.");
  if (!Number.isFinite(config.trimStart) || !Number.isFinite(config.trimEnd) || config.trimStart < 0 || config.trimEnd - config.trimStart < 2 / fps) {
    throw new Error("Motion trim must be non-negative and contain at least two frame intervals.");
  }
  const names = new Set<string>();
  let previousEnd = config.trimStart;
  for (const phase of config.phases) {
    if (!phase.name || names.has(phase.name)) throw new Error("Phase names must be non-empty and unique.");
    names.add(phase.name);
    if (!Number.isFinite(phase.startTime) || !Number.isFinite(phase.endTime) || phase.startTime < previousEnd || phase.endTime <= phase.startTime || phase.endTime > config.trimEnd) {
      throw new Error(`Phase ${phase.name} must be ordered, non-overlapping, and inside the source trim window.`);
    }
    previousEnd = phase.endTime;
  }
}

/** Native offset mapping; do NOT stretch the nominal trim to the sampled clip. */
export function sourceTimeToClipTime(config: MocapClipConfig, sourceTime: number, duration: number): number {
  return Math.max(0, Math.min(duration, sourceTime - config.trimStart));
}

export function getActivePhaseIndex(config: MocapClipConfig, clipTime: number): number {
  const sourceTime = config.trimStart + clipTime;
  return config.phases.findIndex((phase, index) => sourceTime >= phase.startTime && (sourceTime < phase.endTime || (index === config.phases.length - 1 && sourceTime === phase.endTime)));
}
