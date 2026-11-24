import * as THREE from "three";
import { professionalReferences, type PhaseMetric, type ProfessionalReference } from "@/data/professionalReferences";
import type { MocapClipConfig, MocapPhase } from "@/data/mocapClips";

export type MocapAngleId = "rightElbowAngle" | "leftElbowAngle" | "rightKneeAngle" | "leftKneeAngle" | "hipShoulderSeparation";
export interface Point3 { x: number; y: number; z: number }
export interface AngleMeasurement { value: number | null; reason?: string }
export type MocapAngleMeasurements = Record<MocapAngleId, AngleMeasurement>;
export interface RangeComparison {
  status: "in-range" | "out-of-range";
  /** Signed distance to the nearest boundary: negative below, positive above, 0 inside. */
  difference: number;
  direction: "below" | "above" | "inside";
}
export interface PhaseAngleComparison {
  metric: PhaseMetric;
  measurement?: MocapAngleId;
  value: number | null;
  status: "in-range" | "out-of-range" | "unavailable";
  difference: number | null;
  direction?: RangeComparison["direction"];
  reason?: string;
}

const JOINTS: Record<Exclude<MocapAngleId, "hipShoulderSeparation">, readonly [string, string, string]> = {
  // Mixamo Arm = shoulder, ForeArm = elbow, Hand = wrist.
  rightElbowAngle: ["mixamorigRightArm", "mixamorigRightForeArm", "mixamorigRightHand"],
  leftElbowAngle: ["mixamorigLeftArm", "mixamorigLeftForeArm", "mixamorigLeftHand"],
  // UpLeg = hip, Leg = knee, Foot = ankle.
  rightKneeAngle: ["mixamorigRightUpLeg", "mixamorigRightLeg", "mixamorigRightFoot"],
  leftKneeAngle: ["mixamorigLeftUpLeg", "mixamorigLeftLeg", "mixamorigLeftFoot"],
};
const DEFAULT_BINDINGS: Readonly<Record<string, MocapAngleId>> = {
  "Right Elbow Angle": "rightElbowAngle",
  "Left Elbow Angle": "leftElbowAngle",
  "Right Elbow Flexion": "rightElbowAngle",
  "Left Elbow Flexion": "leftElbowAngle",
  "Right Knee Flexion": "rightKneeAngle",
  "Left Knee Flexion": "leftKneeAngle",
  "Hip-Shoulder Separation": "hipShoulderSeparation",
};

export const MOCAP_ANGLE_LABELS: Record<MocapAngleId, string> = {
  rightElbowAngle: "Right elbow interior angle",
  leftElbowAngle: "Left elbow interior angle",
  rightKneeAngle: "Right knee interior angle",
  leftKneeAngle: "Left knee interior angle",
  hipShoulderSeparation: "Hip–shoulder separation (horizontal plane)",
};

function finitePoint(point: Point3): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z);
}

/** Angle ABC, using B->A and B->C. 180 degrees = a straight limb. */
export function interiorJointAngle(a: Point3, b: Point3, c: Point3): number | null {
  if (![a, b, c].every(finitePoint)) return null;
  const ba = new THREE.Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
  const bc = new THREE.Vector3(c.x - b.x, c.y - b.y, c.z - b.z);
  if (ba.lengthSq() < 1e-12 || bc.lengthSq() < 1e-12) return null;
  const cosine = THREE.MathUtils.clamp(ba.normalize().dot(bc.normalize()), -1, 1);
  return THREE.MathUtils.radToDeg(Math.acos(cosine));
}

/** Unsigned difference of left->right pelvis and shoulder axes projected onto XZ. */
export function horizontalHipShoulderSeparation(leftHip: Point3, rightHip: Point3, leftShoulder: Point3, rightShoulder: Point3): number | null {
  if (![leftHip, rightHip, leftShoulder, rightShoulder].every(finitePoint)) return null;
  const hips = new THREE.Vector3(rightHip.x - leftHip.x, 0, rightHip.z - leftHip.z);
  const shoulders = new THREE.Vector3(rightShoulder.x - leftShoulder.x, 0, rightShoulder.z - leftShoulder.z);
  if (hips.lengthSq() < 1e-12 || shoulders.lengthSq() < 1e-12) return null;
  hips.normalize();
  shoulders.normalize();
  return THREE.MathUtils.radToDeg(Math.acos(THREE.MathUtils.clamp(hips.dot(shoulders), -1, 1)));
}

/** Reads only bone WORLD positions after updating ancestors and descendants. */
export function measureMocapAngles(model: THREE.Object3D, bones: readonly THREE.Bone[]): MocapAngleMeasurements {
  model.updateWorldMatrix(true, true);
  const byName = new Map(bones.map((bone) => [bone.name.replace(/:/g, ""), bone]));
  const positions = new Map<string, THREE.Vector3>();
  const position = (name: string) => {
    if (positions.has(name)) return positions.get(name);
    const bone = byName.get(name);
    if (!bone) return undefined;
    const point = bone.getWorldPosition(new THREE.Vector3());
    positions.set(name, point);
    return point;
  };
  const result = {} as MocapAngleMeasurements;
  for (const [id, names] of Object.entries(JOINTS)) {
    const points = names.map(position);
    const missing = names.filter((_name, index) => !points[index]);
    const value = missing.length ? null : interiorJointAngle(points[0]!, points[1]!, points[2]!);
    result[id as MocapAngleId] = { value, ...(value === null ? { reason: missing.length ? `Missing bone(s): ${missing.join(", ")}` : "Degenerate or non-finite joint segment" } : {}) };
  }
  const separationBones = ["mixamorigLeftUpLeg", "mixamorigRightUpLeg", "mixamorigLeftArm", "mixamorigRightArm"];
  const points = separationBones.map(position);
  const missing = separationBones.filter((_name, index) => !points[index]);
  const value = missing.length ? null : horizontalHipShoulderSeparation(points[0]!, points[1]!, points[2]!, points[3]!);
  result.hipShoulderSeparation = { value, ...(value === null ? { reason: missing.length ? `Missing bone(s): ${missing.join(", ")}` : "Pelvis or shoulder axis has no valid horizontal projection" } : {}) };
  return result;
}

/** No generic/fuzzy/category fallback: missing or flat-only references stay explicit. */
export function getMocapReference(config: MocapClipConfig): ProfessionalReference | undefined {
  const key = config.referenceKey ?? config.id;
  return Object.prototype.hasOwnProperty.call(professionalReferences, key) ? professionalReferences[key] : undefined;
}

export function getMocapReferencePhase(config: MocapClipConfig, phase: MocapPhase) {
  const reference = getMocapReference(config);
  const structured = reference?.phases?.find((item) => item.name === (phase.referenceName ?? phase.name));
  if (structured) return structured;
  // Flat ranges are NEVER substituted automatically. A motion config must name
  // the exact metrics and checkpoint explicitly; the original ranges stay intact.
  if (!reference || reference.phases?.length || !phase.referenceMetrics?.length) return undefined;
  const metrics = phase.referenceMetrics.flatMap(name => {
    const metric = reference.metrics.find(item => item.name === name);
    return metric ? [{ name, min: metric.optimalRange.min, max: metric.optimalRange.max, unit: metric.unit, note: `UNVERIFIED flat reference assigned explicitly to this checkpoint: ${metric.description}` }] : [];
  });
  if (!metrics.length) return undefined;
  return { name: phase.name, cueText: "Explicit flat-reference checkpoint comparison (unverified)", instruction: "These are existing unverified flat ranges, not validated phase-specific benchmarks. Release and strike may be motion proxies.", approximateDuration: "Not supplied by reference", metrics };
}

export function compareAngleToRange(value: number, min: number, max: number): RangeComparison | null {
  if (![value, min, max].every(Number.isFinite) || min > max) return null;
  if (value < min) return { status: "out-of-range", difference: value - min, direction: "below" };
  if (value > max) return { status: "out-of-range", difference: value - max, direction: "above" };
  return { status: "in-range", difference: 0, direction: "inside" };
}

function unsupportedMetricReason(metric: PhaseMetric): string {
  if (!metric.unit.toLowerCase().startsWith("degrees")) return "Not an angle; weight/force distribution cannot be measured from rig positions.";
  if (/target line|open/i.test(metric.unit) || /Hip Rotation|Shoulder Rotation|Alignment/.test(metric.name)) return "Requires a configured target direction and validated rotation frame; not inferred from Euler rotations.";
  if (/Spine/.test(metric.name)) return "Requires a signed anatomical trunk-plane convention; not equated to an interior limb angle.";
  return "No validated world-position measurement binding for this metric.";
}

export function compareMocapPhase(config: MocapClipConfig, phase: MocapPhase, angles: MocapAngleMeasurements): PhaseAngleComparison[] {
  const reference = getMocapReferencePhase(config, phase);
  if (!reference) return [];
  return reference.metrics.map((metric) => {
    const binding = config.metricBindings?.[metric.name] ?? DEFAULT_BINDINGS[metric.name];
    if (!binding || !metric.unit.toLowerCase().startsWith("degrees")) {
      return { metric, value: null, status: "unavailable", difference: null, reason: unsupportedMetricReason(metric) };
    }
    const measurement = angles[binding];
    const comparison = measurement?.value == null ? null : compareAngleToRange(measurement.value, metric.min, metric.max);
    if (!comparison) return { metric, measurement: binding, value: measurement?.value ?? null, status: "unavailable", difference: null, reason: measurement?.reason ?? "Invalid measurement or reference range" };
    return { metric, measurement: binding, value: measurement.value, ...comparison };
  });
}
