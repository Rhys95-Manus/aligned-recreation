import * as THREE from "three";
import { getMocapReference, compareAngleToRange } from "./mocapAngles";
import { requestMocapCorrection } from "./mocapCorrection";
import { measureMocapMeasurements, type MocapMeasurements, type MocapMeasurementId, type MocapMeasurementBaseline } from "./mocapMeasurements";
import { mocapReferenceAudit, type MocapReferenceAuditRow, MOCAP_FLAT_AUDIT_CHECKPOINTS } from "@/data/mocapReferenceAudit";
import { sourceTimeToClipTime, type MocapClipConfig, type MocapPhase } from "@/data/mocapClips";

export interface AuditedMocapComparison {
  audit: MocapReferenceAuditRow;
  measurer: MocapMeasurementId | "unsupported";
  geometricValue: number | null;
  /** Tentative conversion is disclosed but never scored while its audit is unresolved. */
  candidateValue: number | null;
  value: number | null;
  min: number;
  max: number;
  unit: string;
  conversion: string;
  status: "in-range" | "out-of-range" | "unavailable";
  difference: number | null;
  tooFar: boolean;
  correctionPolicy: "legacy-elbow-spine" | "report-only";
  reason: string;
}
export interface AuditedMocapCheckpoint {
  phase: MocapPhase;
  sourceTime: number;
  clipTime: number;
  measurements: MocapMeasurements;
  comparisons: AuditedMocapComparison[];
}

export function getMocapAuditRows(config: MocapClipConfig): readonly MocapReferenceAuditRow[] {
  return mocapReferenceAudit.filter(row => row.clipId === config.id && row.referenceKey === (config.referenceKey ?? config.id));
}
export function getMocapPhaseAuditRows(config: MocapClipConfig, phase: MocapPhase): readonly MocapReferenceAuditRow[] {
  const reference = getMocapReference(config);
  const rows = getMocapAuditRows(config);
  if (reference?.phases?.length) return rows.filter(row => row.phaseName === (phase.referenceName ?? phase.name));
  // Whole-motion flat ranges are mapped explicitly ONCE, not used in every phase.
  const names = MOCAP_FLAT_AUDIT_CHECKPOINTS[config.id]?.[phase.name] ?? [];
  return rows.filter(row => row.phaseName === null && names.includes(row.metricName));
}

export function compareAuditedMocapPhase(config: MocapClipConfig, phase: MocapPhase, measurements: MocapMeasurements): AuditedMocapComparison[] {
  const reference = getMocapReference(config);
  return getMocapPhaseAuditRows(config, phase).map(audit => {
    const source = audit.phaseName === null ? reference?.metrics.find(m => m.name === audit.metricName)
      : reference?.phases?.find(p => p.name === audit.phaseName)?.metrics.find(m => m.name === audit.metricName);
    const min = source && "optimalRange" in source ? source.optimalRange.min : source && "min" in source ? source.min : NaN;
    const max = source && "optimalRange" in source ? source.optimalRange.max : source && "max" in source ? source.max : NaN;
    const unit = source?.unit ?? audit.unit;
    const measurer = audit.measurer;
    const measured = measurer === "unsupported" ? undefined : measurements[measurer];
    const geometricValue = measured?.value ?? null;
    const axialProxy = measurer === "rightShoulderExternalRotationProxy" || measurer === "leftShoulderExternalRotationProxy";
    const conversion = measurer === "trunkTilt" ? "Identity; unsigned trunk-axis tilt from world vertical (not lumbar extension)"
      : measurer === "hipShoulderSeparation" ? "Identity; unsigned pelvis/shoulder horizontal axis difference, 0° aligned"
      : axialProxy ? "Unsigned projected forearm vs trunk-up axial proxy; no calibrated clinical ER conversion"
      : audit.convention === "flexion" ? "180° − geometric interior angle; 0° = straight"
      : audit.convention === "interior" ? "Identity; interior angle, 180° = straight"
      : audit.convention === "relative-rotation" ? "Identity; signed rotation about world up relative to first raw-frame pelvis"
      : audit.convention === "percent" ? "Identity; geometric percent toward lead foot (not force)"
      : "No sound conversion established";
    const policy = ((measurer === "rightElbowAngle" || measurer === "leftElbowAngle") && audit.convention === "interior") || (measurer === "hipShoulderSeparation" && audit.resolution === "resolved") ? "legacy-elbow-spine" : "report-only";
    let reason = [...audit.ambiguities, audit.labelIssue, audit.rationale].filter(Boolean).join(" · ");
    if (!source) reason = `Exact source metric is missing; no substitute range. ${reason}`;
    // The requested axial proxy is measurable, but its arbitrary trunk-up zero
    // cannot be silently scored against an uncalibrated clinical-looking range.
    const blocked = !source || axialProxy || audit.resolution === "ambiguous" || audit.resolution === "unsupported" || measurer === "unsupported" || audit.convention === "ambiguous" || audit.convention === "unsupported";
    const candidateValue = audit.convention === "flexion" && geometricValue !== null && Number.isFinite(geometricValue) ? 180 - geometricValue : null;
    let value = blocked || geometricValue === null || !Number.isFinite(geometricValue) ? null : audit.convention === "flexion" ? 180 - geometricValue : geometricValue;
    if (value === null && measured?.reason) reason = `${measured.reason} · ${reason}`;
    const comparison = value === null ? null : compareAngleToRange(value, min, max);
    if (!comparison) value = null;
    const request = policy === "legacy-elbow-spine" && comparison ? requestMocapCorrection(value, min, max) : null;
    return { audit, measurer, geometricValue, candidateValue, value, min, max, unit, conversion, status: comparison?.status ?? "unavailable", difference: comparison?.difference ?? null, tooFar: request?.status === "too-far", correctionPolicy: policy, reason };
  });
}

export function sampleAuditedMocapCheckpoints(model: THREE.Object3D, bones: readonly THREE.Bone[], config: MocapClipConfig, duration: number, seek: (time: number) => void, baseline: MocapMeasurementBaseline): AuditedMocapCheckpoint[] {
  const reports = config.phases.map(phase => {
    const clipTime = sourceTimeToClipTime(config, phase.checkpointTime ?? phase.startTime, duration);
    seek(clipTime);
    const measurements = measureMocapMeasurements(model, bones, baseline, config.laterality?.leadLeg, config.eventDetection?.kind === "throw" ? config.eventDetection.side : undefined);
    return { phase, clipTime, sourceTime: config.trimStart + clipTime, measurements, comparisons: compareAuditedMocapPhase(config, phase, measurements) };
  });
  seek(0);
  return reports;
}
export function countAuditedMocapComparisons(reports: readonly AuditedMocapCheckpoint[]) {
  const counts = { inRange: 0, outOfRange: 0, tooFar: 0, unavailable: 0 };
  for (const report of reports) for (const row of report.comparisons) {
    if (row.status === "unavailable") counts.unavailable++;
    else if (row.tooFar) counts.tooFar++;
    else if (row.status === "in-range") counts.inRange++;
    else counts.outOfRange++;
  }
  return counts;
}
