import { describe, expect, it } from "vitest";
import { getMocapClip, type MocapClipConfig } from "../client/src/data/mocapClips";
import { resolveDetectedPhaseAnchors } from "../client/src/lib/mocapPhaseAnchors";
import { getMocapReferencePhase, compareMocapPhase, type MocapAngleMeasurements } from "../client/src/lib/mocapAngles";
import type { MotionEventDetection } from "../client/src/lib/mocapEvents";

const config = (): MocapClipConfig => ({
  id: "fixture", name: "Fixture", fbxUrl: "f.fbx", targetModel: "m.glb", trimStart: 10, trimEnd: 12, scale: 1, phaseTiming: "auto",
  phases: [
    { name: "Load", startTime: 10, endTime: 10.5 },
    { name: "Max cocking", startTime: 10.5, endTime: 10.8, anchor: "max-cocking", anchorCheckpointOnly: true },
    { name: "Acceleration", startTime: 10.8, endTime: 11, anchor: "max-cocking" },
    { name: "Release", startTime: 11, endTime: 11.4, anchor: "release" },
    { name: "Follow-through", startTime: 11.4, endTime: 12, anchor: "follow-through" },
  ],
});
const detected = (): MotionEventDetection => ({ sampleRate: 96, warnings: [], events: [
  { id: "max-cocking", time: 0.75, method: "elbow minimum", confidence: "medium" },
  { id: "release", time: 1.15, method: "wrist-speed proxy", confidence: "medium" },
  { id: "follow-through", time: 1.55, method: "speed decay", confidence: "low" },
] });

describe("Motion event phase anchoring", () => {
  it("moves acceleration and release separately, samples max cocking without erasing its interval, and preserves inputs", () => {
    const cfg = config(); const snapshot = JSON.stringify(cfg); const eventSnapshot = JSON.stringify(detected());
    const result = resolveDetectedPhaseAnchors(cfg, detected());
    expect(result.config.phases[1]).toMatchObject({ startTime: 10.5, endTime: 10.75, checkpointTime: 10.75 });
    expect(result.config.phases[2]).toMatchObject({ startTime: 10.75, endTime: 11.15, checkpointTime: 10.75 });
    expect(result.config.phases[3]).toMatchObject({ startTime: 11.15, endTime: 11.55, checkpointTime: 11.15 });
    expect(result.timing[3]).toMatchObject({ manualSourceTime: 11, autoSourceTime: 11.15, selectedSourceTime: 11.15, timingSource: "auto" });
    expect(JSON.stringify(cfg)).toBe(snapshot); expect(JSON.stringify(detected())).toBe(eventSnapshot);
  });
  it("retains both detected candidates and manual times with the global override", () => {
    const cfg = { ...config(), phaseTiming: "manual" as const };
    const result = resolveDetectedPhaseAnchors(cfg, detected());
    expect(result.config.phases.map(p => p.startTime)).toEqual(cfg.phases.map(p => p.startTime));
    expect(result.timing[3]).toMatchObject({ selectedSourceTime: 11, autoSourceTime: 11.15, timingSource: "manual" });
  });
  it("allows an individual manual checkpoint override without switching other events", () => {
    const cfg = config(); cfg.phases = cfg.phases.map(p => p.name === "Release" ? { ...p, manualOverride: true } : p);
    const result = resolveDetectedPhaseAnchors(cfg, detected());
    expect(result.config.phases[3].startTime).toBe(11); expect(result.config.phases[2].startTime).toBe(10.75);
    expect(result.timing[3].autoSourceTime).toBe(11.15);
  });
  it("falls back with explicit warnings for missing events, not fabricated anchors", () => {
    const result = resolveDetectedPhaseAnchors(config(), { events: [], warnings: ["No extension"], sampleRate: 96 });
    expect(result.timing.every(t => t.timingSource === "manual")).toBe(true);
    expect(result.detection.warnings).toContain("No extension"); expect(result.detection.warnings.join(" ")).toMatch(/not detected/);
  });
  it("rejects conflicting or out-of-window candidates atomically and keeps candidates visible", () => {
    for (const time of [0.1, 2.5]) {
      const detection = detected(); detection.events[1].time = time;
      const result = resolveDetectedPhaseAnchors(config(), detection);
      expect(result.timing.every(t => t.timingSource === "manual")).toBe(true);
      expect(result.timing[3].autoSourceTime).toBe(10 + time);
      expect(result.detection.warnings.join(" ")).toMatch(/conflict/);
    }
  });
  it("does not force the old release benchmark onto quarterback acceleration onset", () => {
    const qb = getMocapClip("quarterback-throw")!;
    expect(qb.phases.some(p => p.name === "Release")).toBe(true);
    expect(getMocapReferencePhase(qb, qb.phases.find(p => p.name === "Acceleration")!)).toBeUndefined();
    expect(getMocapReferencePhase(qb, qb.phases.find(p => p.name === "Release")!)?.name).toBe("Acceleration / Release");
  });
});

describe("Unverified flat-reference checkpoint assignments", () => {
  it("requires explicit exact metric names and preserves original range values", () => {
    const cfg = { ...config(), referenceKey: "baseball-fastball", metricBindings: { "Elbow Flexion": "leftElbowAngle" as const } };
    const phase = { ...cfg.phases[0], referenceMetrics: ["Elbow Flexion", "No such metric"] };
    expect(getMocapReferencePhase(cfg, cfg.phases[0])).toBeUndefined();
    const assigned = getMocapReferencePhase(cfg, phase)!;
    expect(assigned.metrics).toHaveLength(1); expect(assigned.metrics[0]).toMatchObject({ name: "Elbow Flexion", min: 80, max: 110 });
    expect(assigned.metrics[0].note).toContain("UNVERIFIED");
    const angles: MocapAngleMeasurements = { leftElbowAngle: { value: 90 }, rightElbowAngle: { value: 10 }, leftKneeAngle: { value: 135 }, rightKneeAngle: { value: 150 }, hipShoulderSeparation: { value: 10 } };
    expect(compareMocapPhase(cfg, phase, angles)[0]).toMatchObject({ value: 90, status: "in-range", measurement: "leftElbowAngle" });
    expect(getMocapReferencePhase(cfg, { ...phase, referenceMetrics: ["elbow flexion"] })).toBeUndefined();
  });
  it("does not replace structured or absent references with flat ranges", () => {
    const qb = getMocapClip("quarterback-throw")!;
    expect(getMocapReferencePhase(qb, { name: "Missing", startTime: 23.33, endTime: 23.5, referenceMetrics: ["Elbow Flexion"] })).toBeUndefined();
    expect(getMocapReferencePhase({ ...config(), referenceKey: "absent" }, { ...config().phases[0], referenceMetrics: ["Elbow Flexion"] })).toBeUndefined();
  });
});
