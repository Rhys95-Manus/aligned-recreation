import * as THREE from "three";
import { validateMocapConfig, type MocapClipConfig } from "@/data/mocapClips";
import { detectMotionEvents, sampleMotionEvents, type MotionEventDetection } from "./mocapEvents";

export interface MocapPhaseTiming {
  phaseName: string;
  manualSourceTime: number;
  autoSourceTime: number | null;
  selectedSourceTime: number;
  timingSource: "auto" | "manual";
  method: string;
}
export interface AnchoredMocap {
  config: MocapClipConfig;
  detection: MotionEventDetection;
  timing: MocapPhaseTiming[];
}

/** Resolve once from RAW motion, before correction. All times remain on the FBX timeline. */
export function resolveDetectedPhaseAnchors(config: MocapClipConfig, detection: MotionEventDetection): AnchoredMocap {
  const events = new Map(detection.events.map(event => [event.id, event]));
  const warnings = [...detection.warnings];
  const timing = config.phases.map(phase => {
    const event = phase.anchor ? events.get(phase.anchor) : undefined;
    const manualSourceTime = phase.checkpointTime ?? phase.startTime;
    const autoSourceTime = event ? config.trimStart + event.time : null;
    const auto = autoSourceTime !== null && config.phaseTiming !== "manual" && !phase.manualOverride;
    if (phase.anchor && !event) warnings.push(`${phase.name}: ${phase.anchor} was not detected; retained manual timing.`);
    return {
      phaseName: phase.name, manualSourceTime, autoSourceTime,
      selectedSourceTime: auto ? autoSourceTime! : manualSourceTime,
      timingSource: auto ? "auto" as const : "manual" as const,
      method: event?.method ?? "Manual source-timeline checkpoint",
    };
  });
  const phases = config.phases.map((phase, i) => ({ ...phase,
    startTime: phase.anchor && !phase.anchorCheckpointOnly && timing[i].timingSource === "auto" ? timing[i].selectedSourceTime : phase.startTime,
    checkpointTime: timing[i].selectedSourceTime,
  }));
  // Reconnect contiguous original intervals to moved boundaries. Keep intentional gaps.
  phases.forEach((phase, i) => {
    if (i + 1 < phases.length && Math.abs(config.phases[i].endTime - config.phases[i + 1].startTime) < 1e-6) phase.endTime = phases[i + 1].startTime;
  });
  let resolved = { ...config, phases };
  try { validateMocapConfig(resolved); }
  catch {
    // Never silently clamp or fabricate an event to accommodate conflicting overrides.
    warnings.push("Detected events conflict with phase windows or manual overrides; retained all manual phase times. Auto candidates remain visible.");
    resolved = { ...config, phases: config.phases.map(phase => ({ ...phase, checkpointTime: phase.checkpointTime ?? phase.startTime })) };
    for (const row of timing) { row.selectedSourceTime = row.manualSourceTime; row.timingSource = "manual"; }
    validateMocapConfig(resolved);
  }
  return { config: resolved, detection: { ...detection, warnings }, timing };
}

export function anchorMocapPhases(model: THREE.Object3D, bones: readonly THREE.Bone[], config: MocapClipConfig, duration: number, seek: (time: number) => void, nativeTimes: readonly number[] = []): AnchoredMocap {
  const options = config.eventDetection;
  if (!options) return resolveDetectedPhaseAnchors(config, { events: [], warnings: [], sampleRate: config.fps ?? 24 });
  const sampleRate = options.sampleRate ?? 96;
  const samples = sampleMotionEvents(model, bones, duration, seek, sampleRate, nativeTimes);
  return resolveDetectedPhaseAnchors(config, detectMotionEvents(samples, options.kind, options.side, sampleRate));
}
