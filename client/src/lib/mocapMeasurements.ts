import * as THREE from "three";
import { measureMocapAngles, interiorJointAngle, MOCAP_ANGLE_LABELS, type MocapAngleId, type AngleMeasurement } from "./mocapAngles";

export type NewMocapMeasurementId = "trunkTilt" | "hipRotation" | "shoulderTurn" | "weightTransfer" | "rightShoulderExternalRotationProxy" | "leftShoulderExternalRotationProxy";
export type MocapMeasurementId = MocapAngleId | NewMocapMeasurementId;
export type MocapMeasurements = Record<MocapMeasurementId, { value: number | null; reason?: string }>;
export type MocapMeasurementBaseline = {
  /** World XZ left-to-right pelvis orientation, atan2(z, x), in radians. */
  pelvisYaw: number | null;
};
export interface MocapMeasurementDefinition {
  unit: "degrees" | "percent";
  shortLabel: string;
  method: string;
  limits: string;
}

export const NEW_MEASUREMENT_LABELS: Record<NewMocapMeasurementId, string> & Partial<Record<MocapMeasurementId, string>> = {
  trunkTilt: "Trunk tilt from world vertical",
  hipRotation: "Pelvis turn from first raw frame",
  shoulderTurn: "Shoulder turn from first raw pelvis",
  weightTransfer: "Pelvis-over-stance proxy (not actual weight)",
  rightShoulderExternalRotationProxy: "Right shoulder axial orientation proxy",
  leftShoulderExternalRotationProxy: "Left shoulder axial orientation proxy",
};
export const MOCAP_MEASUREMENT_LABELS: Record<MocapMeasurementId, string> = { ...MOCAP_ANGLE_LABELS, ...NEW_MEASUREMENT_LABELS };

const TURN_LIMITS = "Signed shortest turn in [-180, 180). Positive follows atan2(z, x); this is not an anatomical open/closed convention or target-line angle. Requires a finite first RAW trimmed-frame pelvis baseline and a nondegenerate horizontal axis. Report-only.";
const SHOULDER_PROXY_METHOD = "Unsigned angle (0–180°) between elbow→wrist and hip-midpoint→shoulder-midpoint trunk-up, both projected onto the plane normal to shoulder→elbow. Trunk-up supplies an arbitrary zero.";
const SHOULDER_PROXY_LIMITS = "Active throwing side only: caller supplies throwingSide only when eventDetection.kind is throw (including tennis overhead clips), otherwise undefined. Elbow interior angle must be 45–135° inclusive; missing/non-finite bones or degenerate segments/projections are unavailable. Axial orientation proxy, NOT clinical humeral external rotation or maximum external rotation. Report-only.";
const JOINT_LIMITS = "Existing interior-angle convention: 180° is straight, not ROM flexion. Missing, degenerate or non-finite segments are unavailable. This module does not alter the legacy measurement or correction.";

export const MOCAP_MEASUREMENT_DEFINITIONS: Record<MocapMeasurementId, MocapMeasurementDefinition> = {
  rightElbowAngle: { unit: "degrees", shortLabel: "Right elbow", method: "Existing world-position interior angle: right shoulder–elbow–wrist.", limits: JOINT_LIMITS },
  leftElbowAngle: { unit: "degrees", shortLabel: "Left elbow", method: "Existing world-position interior angle: left shoulder–elbow–wrist.", limits: JOINT_LIMITS },
  rightKneeAngle: { unit: "degrees", shortLabel: "Right knee", method: "Existing world-position interior angle: right hip–knee–ankle.", limits: JOINT_LIMITS },
  leftKneeAngle: { unit: "degrees", shortLabel: "Left knee", method: "Existing world-position interior angle: left hip–knee–ankle.", limits: JOINT_LIMITS },
  hipShoulderSeparation: { unit: "degrees", shortLabel: "Hip–shoulder separation", method: "Existing unsigned angle between left→right pelvis and shoulder axes in world XZ.", limits: "0–180°. Requires finite, nondegenerate horizontal axes; unchanged legacy measurement." },
  trunkTilt: { unit: "degrees", shortLabel: "Trunk tilt", method: "Unsigned angle (0–180°) between world up (0, 1, 0) and the vector from hip midpoint to shoulder midpoint.", limits: "Overall trunk-axis tilt, NOT signed backbend, individual spinal extension, or a sagittal anatomical angle. Missing/non-finite midpoints or a zero-length trunk are unavailable. Report-only." },
  hipRotation: { unit: "degrees", shortLabel: "Pelvis turn", method: "Current leftUpLeg→rightUpLeg XZ atan2(z, x), minus the first RAW trimmed-frame pelvis orientation, wrapped to [-180, 180).", limits: TURN_LIMITS },
  shoulderTurn: { unit: "degrees", shortLabel: "Shoulder turn", method: "Current leftArm→rightArm XZ atan2(z, x), minus the same first RAW trimmed-frame PELVIS orientation (not first shoulder orientation), wrapped to [-180, 180).", limits: TURN_LIMITS },
  weightTransfer: { unit: "percent", shortLabel: "Pelvis-over-stance proxy", method: "100 × dot(pelvis midpoint − back foot, lead foot − back foot) / |lead foot − back foot|² in world XZ: 0 at back foot, 100 at lead foot.", limits: "Unbounded geometric projection, never clamped; may be negative or exceed 100%. NOT center of mass, ground reaction force, or actual weight distribution. Requires explicit lead side and horizontal foot separation ≥0.05 metres in metre-scaled world coordinates. Report-only." },
  rightShoulderExternalRotationProxy: { unit: "degrees", shortLabel: "Right shoulder axial proxy", method: SHOULDER_PROXY_METHOD, limits: SHOULDER_PROXY_LIMITS },
  leftShoulderExternalRotationProxy: { unit: "degrees", shortLabel: "Left shoulder axial proxy", method: SHOULDER_PROXY_METHOD, limits: SHOULDER_PROXY_LIMITS },
};

const MIN_LENGTH_SQ = 1e-12;
const MIN_FOOT_SEPARATION_SQ = 0.05 ** 2;
const HIP_NAMES = ["mixamorigLeftUpLeg", "mixamorigRightUpLeg"] as const;
const SHOULDER_NAMES = ["mixamorigLeftArm", "mixamorigRightArm"] as const;
const TRUNK_NAMES = [...HIP_NAMES, ...SHOULDER_NAMES];
const unavailable = (reason: string): AngleMeasurement => ({ value: null, reason });
const finitePoint = (point: THREE.Vector3): boolean => [point.x, point.y, point.z].every(Number.isFinite);
const validVector = (vector: THREE.Vector3): boolean => finitePoint(vector) && Number.isFinite(vector.lengthSq()) && vector.lengthSq() >= MIN_LENGTH_SQ;

/** Reads world positions only; colon-style Mixamo names normalize like legacy angles. */
function worldPositions(model: THREE.Object3D, bones: readonly THREE.Bone[]) {
  model.updateWorldMatrix(true, true);
  const byName = new Map(bones.map(bone => [bone.name.replace(/:/g, ""), bone]));
  const cache = new Map<string, THREE.Vector3 | undefined>();
  return (name: string): THREE.Vector3 | undefined => {
    if (!cache.has(name)) cache.set(name, byName.get(name)?.getWorldPosition(new THREE.Vector3()));
    return cache.get(name);
  };
}
type PositionReader = ReturnType<typeof worldPositions>;
function invalidPoints(position: PositionReader, names: readonly string[]): string | undefined {
  const missing = names.filter(name => !position(name));
  if (missing.length) return `Missing bone(s): ${missing.join(", ")}`;
  return names.some(name => !finitePoint(position(name)!)) ? "Non-finite bone world position" : undefined;
}
function midpoint(a: THREE.Vector3, b: THREE.Vector3): THREE.Vector3 {
  return a.clone().multiplyScalar(0.5).addScaledVector(b, 0.5);
}
function trunkUp(position: PositionReader): THREE.Vector3 {
  return midpoint(position(SHOULDER_NAMES[0])!, position(SHOULDER_NAMES[1])!)
    .sub(midpoint(position(HIP_NAMES[0])!, position(HIP_NAMES[1])!));
}
function horizontalYaw(position: PositionReader, names: readonly [string, string]): number | null {
  if (invalidPoints(position, names)) return null;
  const axis = position(names[1])!.clone().sub(position(names[0])!); axis.y = 0;
  return validVector(axis) ? Math.atan2(axis.z, axis.x) : null;
}
function unsignedAngle(a: THREE.Vector3, b: THREE.Vector3): number | null {
  if (!validVector(a) || !validVector(b)) return null;
  const dot = a.clone().normalize().dot(b.clone().normalize());
  return Number.isFinite(dot) ? THREE.MathUtils.radToDeg(Math.acos(THREE.MathUtils.clamp(dot, -1, 1))) : null;
}
function turnFromBaseline(position: PositionReader, names: readonly [string, string], baseline: MocapMeasurementBaseline): AngleMeasurement {
  if (baseline.pelvisYaw == null || !Number.isFinite(baseline.pelvisYaw)) return unavailable("First RAW trimmed-frame pelvis baseline is unavailable or non-finite");
  const invalid = invalidPoints(position, names);
  if (invalid) return unavailable(invalid);
  const yaw = horizontalYaw(position, names);
  if (yaw === null) return unavailable("Axis has no valid horizontal projection");
  const degrees = THREE.MathUtils.radToDeg(yaw - baseline.pelvisYaw);
  if (!Number.isFinite(degrees)) return unavailable("Non-finite relative orientation");
  return { value: ((degrees + 180) % 360 + 360) % 360 - 180 };
}

/**
 * Capture once AFTER the caller seeks the first RAW trimmed frame (raw clip time 0).
 * This function neither seeks nor applies corrections, and never rebaselines from a
 * correction-mode snapshot. Retain this numeric baseline for all subsequent frames.
 */
export function createMocapMeasurementBaseline(model: THREE.Object3D, bones: readonly THREE.Bone[]): MocapMeasurementBaseline {
  return { pelvisYaw: horizontalYaw(worldPositions(model, bones), HIP_NAMES) };
}

function measureWeightTransfer(position: PositionReader, leadSide: "left" | "right" | undefined): AngleMeasurement {
  if (leadSide !== "left" && leadSide !== "right") return unavailable("Explicit lead side is required for the pelvis-over-stance proxy");
  const names = [...HIP_NAMES, "mixamorigLeftFoot", "mixamorigRightFoot"];
  const invalid = invalidPoints(position, names);
  if (invalid) return unavailable(invalid);
  const lead = position(leadSide === "left" ? "mixamorigLeftFoot" : "mixamorigRightFoot")!;
  const back = position(leadSide === "left" ? "mixamorigRightFoot" : "mixamorigLeftFoot")!;
  const stance = lead.clone().sub(back); stance.y = 0;
  const lengthSq = stance.lengthSq();
  if (!finitePoint(stance) || !Number.isFinite(lengthSq) || lengthSq < MIN_FOOT_SEPARATION_SQ) return unavailable("Horizontal foot separation is below 0.05 m or non-finite");
  const offset = midpoint(position(HIP_NAMES[0])!, position(HIP_NAMES[1])!).sub(back); offset.y = 0;
  const value = offset.dot(stance) / lengthSq * 100;
  return Number.isFinite(value) ? { value } : unavailable("Non-finite pelvis-over-stance projection");
}
function measureShoulderProxy(position: PositionReader, side: "left" | "right", throwingSide: "left" | "right" | undefined): AngleMeasurement {
  if (throwingSide !== "left" && throwingSide !== "right") return unavailable("Throw-only axial proxy: no active throwing side configured (non-throw or unavailable)");
  if (side !== throwingSide) return unavailable("Opposite side is not the configured active throwing side");
  const prefix = side === "right" ? "mixamorigRight" : "mixamorigLeft";
  const names = [`${prefix}Arm`, `${prefix}ForeArm`, `${prefix}Hand`];
  const invalid = invalidPoints(position, [...TRUNK_NAMES, ...names]);
  if (invalid) return unavailable(invalid);
  const [shoulder, elbow, wrist] = names.map(name => position(name)!);
  const elbowInterior = interiorJointAngle(shoulder, elbow, wrist);
  // Roundoff allowance only at the inclusive 45° and 135° boundaries.
  if (elbowInterior === null || elbowInterior < 45 - 1e-10 || elbowInterior > 135 + 1e-10) return unavailable("Elbow interior angle must be 45–135° inclusive; near-straight/folded or degenerate elbow is unavailable");
  const axis = elbow.clone().sub(shoulder);
  const forearm = wrist.clone().sub(elbow);
  const trunk = trunkUp(position);
  if (![axis, forearm, trunk].every(validVector)) return unavailable("Degenerate or non-finite upper arm, forearm, or trunk axis");
  axis.normalize();
  const forearmProjection = forearm.clone().addScaledVector(axis, -forearm.dot(axis));
  const trunkProjection = trunk.clone().addScaledVector(axis, -trunk.dot(axis));
  const value = unsignedAngle(forearmProjection, trunkProjection);
  return value === null ? unavailable("Forearm or trunk-up projection is degenerate/non-finite; arbitrary axial zero is unavailable") : { value };
}

/**
 * Report-only world-position geometry. No local transforms, animation state,
 * baseline, or inputs are mutated; only updateWorldMatrix refreshes world caches.
 * The caller MUST pass throwingSide only for eventDetection.kind === "throw"
 * (including tennis), and undefined for swings, kicks, or unconfigured events.
 */
export function measureMocapMeasurements(
  model: THREE.Object3D,
  bones: readonly THREE.Bone[],
  baseline: MocapMeasurementBaseline,
  leadSide: "left" | "right" | undefined,
  throwingSide: "left" | "right" | undefined,
): MocapMeasurements {
  const angles = measureMocapAngles(model, bones);
  const position = worldPositions(model, bones);
  const trunkInvalid = invalidPoints(position, TRUNK_NAMES);
  const tilt = trunkInvalid ? null : unsignedAngle(trunkUp(position), new THREE.Vector3(0, 1, 0));
  return {
    ...angles,
    trunkTilt: tilt === null ? unavailable(trunkInvalid ?? "Hip-to-shoulder trunk axis is degenerate or non-finite") : { value: tilt },
    hipRotation: turnFromBaseline(position, HIP_NAMES, baseline),
    shoulderTurn: turnFromBaseline(position, SHOULDER_NAMES, baseline),
    weightTransfer: measureWeightTransfer(position, leadSide),
    rightShoulderExternalRotationProxy: measureShoulderProxy(position, "right", throwingSide),
    leftShoulderExternalRotationProxy: measureShoulderProxy(position, "left", throwingSide),
  };
}
