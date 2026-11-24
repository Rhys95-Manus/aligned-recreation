import type { MocapAngleId } from "@/lib/mocapAngles";
import type { MotionEventKind, MotionSide } from "@/lib/mocapEvents";

export interface MocapPhase {
  name: string;
  /** Absolute seconds on the original FBX timeline, NOT normalized playback time. */
  startTime: number;
  endTime: number;
  /** Exact reference phase name, when the display name differs. */
  referenceName?: string;
  /** Motion event to anchor the interval start and checkpoint to. */
  anchor?: "max-cocking" | "release" | "backswing" | "strike" | "follow-through";
  /** Keep the interval start manual, but sample its event (e.g. late-cocking peak). */
  anchorCheckpointOnly?: boolean;
  /** Absolute checkpoint time; defaults to startTime. */
  checkpointTime?: number;
  /** Explicit per-checkpoint override; auto detection still appears for comparison. */
  manualOverride?: boolean;
  /** Explicit opt-in to named flat, unverified reference metrics at this checkpoint. */
  referenceMetrics?: readonly string[];
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
  eventDetection?: { kind: MotionEventKind; side: MotionSide; sampleRate?: number };
  /** Manual is a global override. Auto failures retain manual times with a warning. */
  phaseTiming?: "auto" | "manual";
  laterality?: { activeSide: MotionSide; leadLeg: MotionSide; evidence: string; confidence: "medium" | "low" };
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
    eventDetection: { kind: "throw", side: "right", sampleRate: 96 },
    phaseTiming: "auto",
    laterality: { activeSide: "right", leadLeg: "left", confidence: "medium", evidence: "Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing." },
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
      { name: "Late Cocking / Max Torque", startTime: 23.90, endTime: 24.17, anchor: "max-cocking", anchorCheckpointOnly: true },
      { name: "Acceleration", startTime: 24.17, endTime: 24.33, anchor: "max-cocking" },
      { name: "Release", referenceName: "Acceleration / Release", startTime: 24.33, endTime: 24.50, anchor: "release" },
      { name: "Follow-Through", startTime: 24.50, endTime: 25.33, anchor: "follow-through" },
    ],
    timingNote: "Manual baselines are retained for comparison; 24.17 s was the old combined Acceleration / Release start. The new 24.33 s manual Release is an approximate comparison only. Auto max-cocking uses the elbow minimum; Release is peak wrist speed during forward extension, not observed ball separation. Acceleration has no separate reference range, so the old release-extension benchmark is not forced onto its onset.",
  },
  {
    id: "baseball-fastball", name: "Baseball pitch · fastball reference",
    fbxUrl: "/manus-storage/Baseball_Pitcher_mixamo_3c9c4025.fbx",
    targetModel: "https://d2xsxph8kpxj0f.cloudfront.net/310519663143408740/Gd6AiijCmPwLtcbfaErCFP/MaleHologram_quant_d74b85d9.glb",
    trimStart: 18.833333333333332, trimEnd: 21.333333333333332, scale: 0.01, fps: 24,
    hipBone: "mixamorigHips", sourceRootBone: "mixamorigReference", referenceKey: "baseball-fastball",
    eventDetection: { kind: "throw", side: "right", sampleRate: 96 }, phaseTiming: "auto",
    laterality: { activeSide: "right", leadLeg: "left", confidence: "medium", evidence: "Right wrist reaches 6.98 m/s during elbow extension vs left 3.10 m/s. Left foot lifts/strides, then travels 0.031 m vs right 0.516 m during delivery: left plant/right trail. Pitch subtype unobservable." },
    metricBindings: { "Elbow Flexion": "rightElbowAngle", "Knee Flexion": "leftKneeAngle" },
    phases: [
      { name: "Setup / Load", startTime: 18.833333333333332, endTime: 19.833333333333332 },
      { name: "Maximum Leg Lift", startTime: 19.833333333333332, endTime: 20.35 },
      { name: "Stride / Plant Proxy", startTime: 20.35, endTime: 20.45, checkpointTime: 20.416666666666668, referenceMetrics: ["Knee Flexion"] },
      { name: "Max Cocking", startTime: 20.45, endTime: 20.583333333333332, anchor: "max-cocking", anchorCheckpointOnly: true, checkpointTime: 20.583333333333332, referenceMetrics: ["Elbow Flexion"] },
      { name: "Acceleration", startTime: 20.583333333333332, endTime: 20.708333333333332, anchor: "max-cocking" },
      { name: "Release Proxy", startTime: 20.708333333333332, endTime: 21, anchor: "release" },
      { name: "Follow-Through", startTime: 21, endTime: 21.333333333333332, anchor: "follow-through" },
    ],
    timingNote: "Full-source scan: smoothed activity ≥0.25 m/s isolated 18.917–21.125 s; retain preparation/follow-through padding, exclude reset after 21.5 s. Release is wrist-speed proxy during extension; elbow minimum is NOT shoulder MER. Flat references are unverified. The 35–60° knee range is retained under the registry's interior-angle convention, but its apparent ROM-flexion provenance needs verification; no silent conversion. Fastball subtype cannot be established from joints.",
  },
  {
    id: "baseball-batting-swing", name: "Baseball batting swing",
    fbxUrl: "/manus-storage/Baseball_Batter_mixamo_fd2717b4.fbx",
    targetModel: "https://d2xsxph8kpxj0f.cloudfront.net/310519663143408740/Gd6AiijCmPwLtcbfaErCFP/MaleHologram_quant_d74b85d9.glb",
    trimStart: 12.875, trimEnd: 14.5, scale: 0.01, fps: 24,
    hipBone: "mixamorigHips", sourceRootBone: "mixamorigReference", referenceKey: "baseball-batting-swing",
    eventDetection: { kind: "swing", side: "right", sampleRate: 96 }, phaseTiming: "auto",
    laterality: { activeSide: "right", leadLeg: "left", confidence: "medium", evidence: "Body-local hands sweep anatomical right→left; left lead elbow is less folded than right trailing elbow. Left foot strides 0.215 m, then travels 0.009 m vs right 0.130 m around strike: right-handed swing, left lead/plant." },
    metricBindings: { "Elbow Flexion": "leftElbowAngle", "Knee Flexion": "rightKneeAngle" },
    phases: [
      { name: "Setup", startTime: 12.875, endTime: 13.291666666666666 },
      { name: "Leg Lift / Load", startTime: 13.291666666666666, endTime: 13.458333333333334, referenceMetrics: ["Knee Flexion"] },
      { name: "Top / Reversal Proxy", startTime: 13.458333333333334, endTime: 13.708333333333334, anchor: "backswing" },
      { name: "Forward Acceleration", startTime: 13.708333333333334, endTime: 13.75 },
      { name: "Strike Proxy", startTime: 13.75, endTime: 14.125, anchor: "strike", referenceMetrics: ["Elbow Flexion"] },
      { name: "Follow-Through", startTime: 14.125, endTime: 14.5, anchor: "follow-through" },
    ],
    timingNote: "Activity ≥0.75 m/s core 13.125–14.042 s, padded 0.250 s before/0.458 s after. Coupled-hand speed peak is proposed strike proxy; preceding trough/direction reversal is proposed top proxy, not bat contact. Explicit unverified flat comparisons: back/right knee at load, lead/left elbow at strike. No tool tracking.",
  },
  {
    id: "golf-driver-swing", name: "Golf full swing · driver reference",
    fbxUrl: "/manus-storage/Golf_mixamo_1e6729e5.fbx",
    targetModel: "https://d2xsxph8kpxj0f.cloudfront.net/310519663143408740/Gd6AiijCmPwLtcbfaErCFP/MaleHologram_quant_d74b85d9.glb",
    trimStart: 20.25, trimEnd: 22.75, scale: 0.01, fps: 24,
    hipBone: "mixamorigHips", sourceRootBone: "mixamorigReference", referenceKey: "golf-driver-swing",
    eventDetection: { kind: "swing", side: "right", sampleRate: 96 }, phaseTiming: "auto",
    laterality: { activeSide: "right", leadLeg: "left", confidence: "medium", evidence: "Address-frame hand midpoint moves from anatomical right to left through swing. Right trailing elbow folds to 46° vs left lead 121°. Left ankle moves 0.0056 m horizontally vs right 0.0358 m through strike; left brace/right pivot." },
    metricBindings: { "Knee Flexion": "leftKneeAngle" },
    phases: [
      { name: "Address", startTime: 20.25, endTime: 21.125, checkpointTime: 20.5 },
      { name: "Backswing / Load", startTime: 21.125, endTime: 21.625 },
      { name: "Top / Reversal Proxy", startTime: 21.625, endTime: 21.791666666666668, anchor: "backswing" },
      { name: "Forward Acceleration", startTime: 21.791666666666668, endTime: 21.875 },
      { name: "Strike / Impact Proxy", startTime: 21.875, endTime: 22.5, anchor: "strike", referenceMetrics: ["Knee Flexion"] },
      { name: "Follow-Through", startTime: 22.5, endTime: 22.75, anchor: "follow-through" },
    ],
    timingNote: "Activity >0.35 m/s across 20.917–22.417 s, bridging the reversal dip, plus address/finish padding. Coupled-hand speed and preceding reversal are proposed proxies, not observed club top or impact. Driver vs iron cannot be established without equipment. Only existing unverified flat lead-knee-at-impact range is explicitly mapped; other metrics remain unavailable.",
  },
  {
    id: "soccer-passing", name: "Soccer passing · selected right-foot kick",
    fbxUrl: "/manus-storage/Soccer_Passing_mixamo_cc52d12b.fbx",
    targetModel: "https://d2xsxph8kpxj0f.cloudfront.net/310519663143408740/Gd6AiijCmPwLtcbfaErCFP/MaleHologram_quant_d74b85d9.glb",
    trimStart: 18.75, trimEnd: 19.791666666666668, scale: 0.01, fps: 24,
    hipBone: "mixamorigHips", sourceRootBone: "mixamorigReference", referenceKey: "soccer-passing",
    eventDetection: { kind: "kick", side: "right", sampleRate: 96 }, phaseTiming: "auto",
    laterality: { activeSide: "right", leadLeg: "left", confidence: "medium", evidence: "Selected right foot reaches 7.496 m/s vs left 0.018 m/s; knee folds then extends. Left travels 0.0036 m vs right 0.574 m around strike: left plant. Other repetitions include LEFT-foot kicks; no whole-file dominance claim." },
    metricBindings: { "Knee Flexion": "rightKneeAngle" },
    phases: [
      { name: "Setup", startTime: 18.75, endTime: 19.125, checkpointTime: 18.833333333333332 },
      { name: "Plant Stride / Load", startTime: 19.125, endTime: 19.291666666666668 },
      { name: "Max Knee Load", startTime: 19.291666666666668, endTime: 19.333333333333332, anchor: "backswing" },
      { name: "Forward Acceleration", startTime: 19.333333333333332, endTime: 19.375 },
      { name: "Strike Proxy", startTime: 19.375, endTime: 19.583333333333332, anchor: "strike", referenceMetrics: ["Knee Flexion"] },
      { name: "Follow-Through", startTime: 19.583333333333332, endTime: 19.791666666666668, anchor: "follow-through" },
    ],
    timingNote: "Root-relative activity ≥1.25 m/s isolates 18.958–19.542 s with a short internal dip; padding gives 18.750–19.792 s, excluding reset. Active-foot speed during knee extension and preceding knee minimum are proposed kick anchors. Actual contact, inside-foot technique, pass-vs-shot and forces unobservable. Existing flat active-knee range is unverified; knees remain report-only.",
  },
  {
    id: "soccer-power-shot", name: "Soccer power shot",
    fbxUrl: "/manus-storage/Soccer_PenaltyKick_mixamo_1bad280e.fbx",
    targetModel: "https://d2xsxph8kpxj0f.cloudfront.net/310519663143408740/Gd6AiijCmPwLtcbfaErCFP/MaleHologram_quant_d74b85d9.glb",
    trimStart: 22.083333333333332, trimEnd: 24.25, scale: 0.01, fps: 24,
    hipBone: "mixamorigHips", sourceRootBone: "mixamorigReference", referenceKey: "soccer-power-shot",
    eventDetection: { kind: "kick", side: "right", sampleRate: 96 }, phaseTiming: "auto",
    laterality: { activeSide: "right", leadLeg: "left", confidence: "medium", evidence: "Right foot 9.414 m/s vs left 0.081 m/s during extension; left ankle travels 0.038 m vs right 1.878 m across the strike band. Left approach/support leg, right kick; forces/contact not measured." },
    metricBindings: { "Knee Flexion": "rightKneeAngle" },
    phases: [
      { name: "Setup / Approach", startTime: 22.083333333333332, endTime: 23.25 },
      { name: "Backswing / Plant Transition", startTime: 23.25, endTime: 23.333333333333332 },
      { name: "Max Knee Load", startTime: 23.333333333333332, endTime: 23.375, anchor: "backswing" },
      { name: "Forward Acceleration", startTime: 23.375, endTime: 23.416666666666668 },
      { name: "Strike Proxy", startTime: 23.416666666666668, endTime: 23.666666666666668, anchor: "strike", referenceMetrics: ["Knee Flexion"] },
      { name: "Follow-Through", startTime: 23.666666666666668, endTime: 24.25, anchor: "follow-through" },
    ],
    timingNote: "Activity ≥0.5 m/s late core starts22.167 s; retain0.083 s loaded setup padding. End24.25 s at coherent foot-down finish before next recovery step, even though residual activity continues. Peak active-foot speed during knee extension is strike proxy; no ball impact or penalty context verified. Unverified flat active-knee range only; report-only, no knee correction.",
  },
  {
    id: "tennis-serve", name: "Tennis serve-like overhead sequence",
    fbxUrl: "/manus-storage/Tennis_mixamo_e691354d.fbx",
    targetModel: "https://d2xsxph8kpxj0f.cloudfront.net/310519663143408740/Gd6AiijCmPwLtcbfaErCFP/MaleHologram_quant_d74b85d9.glb",
    trimStart: 12.5, trimEnd: 15.416666666666666, scale: 0.01, fps: 24,
    hipBone: "mixamorigHips", sourceRootBone: "mixamorigReference", referenceKey: "tennis-serve",
    eventDetection: { kind: "throw", side: "right", sampleRate: 96 }, phaseTiming: "auto",
    laterality: { activeSide: "right", leadLeg: "left", confidence: "medium", evidence: "Right wrist extends overhead above head after left off-arm raise; 7.34 m/s vs left1.60 m/s. Right pre-drive support; left landing/receiving lead. Neither foot securely planted at peak extension; left later moves0.027 m vs right0.691 m." },
    metricBindings: { "Elbow Flexion": "rightElbowAngle", "Knee Flexion": "rightKneeAngle" },
    phases: [
      { name: "Setup", startTime: 12.5, endTime: 13.333333333333334 },
      { name: "Trophy-Like Preparation", startTime: 13.333333333333334, endTime: 14.333333333333334, referenceMetrics: ["Elbow Flexion"] },
      { name: "Loaded Stance", startTime: 14.333333333333334, endTime: 14.666666666666666, referenceMetrics: ["Knee Flexion"] },
      { name: "Acceleration / Compact Cocking", startTime: 14.666666666666666, endTime: 14.875, anchor: "max-cocking" },
      { name: "Overhead Stroke Proxy", startTime: 14.875, endTime: 15.25, anchor: "release" },
      { name: "Follow-Through / Landing", startTime: 15.25, endTime: 15.416666666666666, anchor: "follow-through" },
    ],
    timingNote: "File also includes earlier forehand-like and backhand-like groundstrokes; selected overhead action maps to tennis-serve. Activity ≥1.5 m/s core14.458–15.083 s; retain coherent slow preparation from12.5 s and finish through15.417 s. Throw-type wrist-speed anchor is an overhead contact proxy, NOT ball release. Serve vs smash cannot be certain without equipment. Unverified flat elbow range is trophy-only, never applied to stroke contact; loaded knee uses right pre-drive support leg.",
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
    if (phase.checkpointTime !== undefined && (!Number.isFinite(phase.checkpointTime) || phase.checkpointTime < phase.startTime || phase.checkpointTime > phase.endTime)) throw new Error(`Checkpoint ${phase.name} must lie within its phase interval.`);
    previousEnd = phase.endTime;
  }
  if (config.eventDetection && (!["throw", "swing", "kick"].includes(config.eventDetection.kind) || !["left", "right"].includes(config.eventDetection.side) || !Number.isFinite(config.eventDetection.sampleRate ?? 96) || (config.eventDetection.sampleRate ?? 96) < 24 || (config.eventDetection.sampleRate ?? 96) > 240)) throw new Error("Event detection requires a supported kind, explicit side, and 24–240 Hz sampling.");
}

/** Native offset mapping; do NOT stretch the nominal trim to the sampled clip. */
export function sourceTimeToClipTime(config: MocapClipConfig, sourceTime: number, duration: number): number {
  return Math.max(0, Math.min(duration, sourceTime - config.trimStart));
}

export function getActivePhaseIndex(config: MocapClipConfig, clipTime: number): number {
  const sourceTime = config.trimStart + clipTime;
  return config.phases.findIndex((phase, index) => sourceTime >= phase.startTime && (sourceTime < phase.endTime || (index === config.phases.length - 1 && sourceTime === phase.endTime)));
}
