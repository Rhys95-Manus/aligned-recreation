import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MocapPhaseReport from "../client/src/components/MocapPhaseReport";
import { getMocapClip, type MocapClipConfig } from "../client/src/data/mocapClips";
import { compareMocapPhase, type MocapAngleMeasurements } from "../client/src/lib/mocapAngles";
import type { MocapPhaseMarkerReport } from "../client/src/lib/mocapPipeline";
import type { CorrectedMocap, CorrectionSample } from "../client/src/lib/mocapCorrection";
const angles: MocapAngleMeasurements = { rightElbowAngle: { value: 19.383645 }, leftElbowAngle: { value: 120 }, rightKneeAngle: { value: 145 }, leftKneeAngle: { value: 125 }, hipShoulderSeparation: { value: 12 } };
function report(cfg: MocapClipConfig, index: number): MocapPhaseMarkerReport {
  const phase = cfg.phases[index]; const sourceTime = phase.checkpointTime ?? phase.startTime;
  return { phase, sourceTime, clipTime: sourceTime - cfg.trimStart, angles, comparisons: compareMocapPhase(cfg, phase, angles), separationPeak: null };
}
function render(cfg: MocapClipConfig, index: number, correction: CorrectedMocap | null = null) {
  const reports = cfg.phases.map((_, i) => report(cfg, i));
  return renderToStaticMarkup(React.createElement(MocapPhaseReport, {
    config: cfg, reports, correctedReports: reports, correction, selectedIndex: index, onSelect: () => {},
    timing: cfg.phases.map(p => ({ phaseName: p.name, manualSourceTime: p.startTime, autoSourceTime: p.anchor ? 24.164291 : null, selectedSourceTime: p.checkpointTime ?? p.startTime, timingSource: p.anchor ? "auto" as const : "manual" as const, method: p.anchor ? "Elbow minimum proxy" : "Manual" })),
    detection: { events: [], warnings: ["Kinematic proxies only; no observed ball release."], sampleRate: 96 }, onSeekSource: () => {},
  }));
}

describe("Isolated mocap checkpoint report", () => {
  it("shows detected and manual times, separate acceleration/release, and proxy warnings", () => {
    const html = render(getMocapClip("quarterback-throw")!, 2);
    for (const text of ["Manual baseline", "Detected candidate", "Selected checkpoint", "23.900 s", "24.164 s", "Acceleration", "Release", "no observed ball release", "saved raw / corrected snapshots"]) expect(html).toContain(text);
  });
  it("does not display a nearby-frame correction as the exact shared-boundary checkpoint", () => {
    const base = getMocapClip("quarterback-throw")!;
    const cfg = { ...base, phases: base.phases.map((p, i) => i === 2 ? { ...p, checkpointTime: 24.164291 } : p) };
    const sample: CorrectionSample = { clipTime: .83, sourceTime: 24.16, phaseIndex: 2, metricName: "Throwing Elbow Flexion", measurement: "rightElbowAngle", raw: 19.4, corrected: 87, target: 87, required: 67.6, applied: 12.345, status: "corrected" };
    const correction = { clip: {} as CorrectedMocap["clip"], samples: [sample], changedBones: [], maxAppliedDegrees: 12.345 };
    const html = render(cfg, 2, correction);
    expect(html).toContain("too far off to correct naturally"); expect(html).toContain("19.4°");
    expect(html).toContain("applied unavailable"); expect(html).not.toContain("applied 12.3°");
  });
  it("displays exact same-phase correction offsets rather than suppressing all samples", () => {
    const cfg = getMocapClip("quarterback-throw")!;
    const time = cfg.phases[2].startTime - cfg.trimStart;
    const sample: CorrectionSample = { clipTime: time, sourceTime: cfg.phases[2].startTime, phaseIndex: 2, metricName: "Throwing Elbow Flexion", measurement: "rightElbowAngle", raw: 19.4, corrected: 19.4, target: 87, required: 67.6, applied: 0, status: "too-far" };
    const html = render(cfg, 2, { clip: {} as CorrectedMocap["clip"], samples: [sample], changedBones: [], maxAppliedDegrees: 0 });
    expect(html).toContain("applied 0.0°"); expect(html).toContain("too far off to correct naturally");
  });
  it("marks opted-in flat ranges unverified and never calls them published phase-specific ranges", () => {
    const cfg = getMocapClip("baseball-fastball")!;
    const index = cfg.phases.findIndex(p => p.referenceMetrics?.includes("Elbow Flexion"));
    const html = render(cfg, index);
    expect(html).toContain("Reference verification: unverified"); expect(html).toContain("Explicit flat-range checkpoint assignment");
    expect(html).toContain("80–110°"); expect(html).toContain("not published phase-specific ranges");
  });
  it("does not apply a trophy elbow benchmark to the tennis contact proxy", () => {
    const cfg = getMocapClip("tennis-serve")!;
    const html = render(cfg, cfg.phases.findIndex(p => p.name === "Overhead Stroke Proxy"));
    expect(html).toContain("No reference range"); expect(html).not.toContain("85–115°");
  });
});
