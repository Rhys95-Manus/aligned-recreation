import * as THREE from "three";
import { getActivePhaseIndex, sourceTimeToClipTime, type MocapClipConfig } from "@/data/mocapClips";
import { compareMocapPhase, measureMocapAngles, type MocapAngleId, type PhaseAngleComparison } from "./mocapAngles";

export const MAX_MOCAP_CORRECTION_DEGREES = 20;
export const CORRECTION_MARGIN_DEGREES = 2;
export const CORRECTION_EASE_SECONDS = 0.08;
export const TOO_FAR_MESSAGE = "too far off to correct naturally";
export type CorrectableMetric = "rightElbowAngle" | "leftElbowAngle" | "hipShoulderSeparation";
const CHANNELS: readonly CorrectableMetric[] = ["rightElbowAngle", "leftElbowAngle", "hipShoulderSeparation"];
const ELBOW_BONES = {
  rightElbowAngle: ["mixamorigRightArm", "mixamorigRightForeArm", "mixamorigRightHand"],
  leftElbowAngle: ["mixamorigLeftArm", "mixamorigLeftForeArm", "mixamorigLeftHand"],
} as const;
const SPINE_NAMES = ["mixamorigSpine", "mixamorigSpine1", "mixamorigSpine2"];

export interface CorrectionRequest {
  target: number | null;
  required: number;
  status: "in-range" | "correctable" | "too-far" | "unavailable";
}
export interface CorrectionSample {
  clipTime: number;
  sourceTime: number;
  phaseIndex: number;
  metricName: string;
  measurement: MocapAngleId;
  raw: number | null;
  corrected: number | null;
  target: number | null;
  required: number;
  applied: number;
  status: "corrected" | "easing" | "in-range" | "too-far" | "report-only" | "unavailable";
  reason?: string;
}
export interface CorrectedMocap {
  clip: THREE.AnimationClip;
  samples: CorrectionSample[];
  changedBones: string[];
  maxAppliedDegrees: number;
}

/** Nearest boundary with 2 degrees inward margin; never choose the midpoint. */
export function requestMocapCorrection(value: number | null, min: number, max: number): CorrectionRequest {
  if (value == null || ![value, min, max].every(Number.isFinite) || min > max) return { target: null, required: 0, status: "unavailable" };
  if (value >= min && value <= max) return { target: value, required: 0, status: "in-range" };
  // Narrow ranges use a smaller margin rather than crossing the opposite boundary.
  const margin = Math.min(CORRECTION_MARGIN_DEGREES, (max - min) / 2);
  const target = value < min ? min + margin : max - margin;
  const required = target - value;
  return { target, required, status: Math.abs(required) > MAX_MOCAP_CORRECTION_DEGREES + 1e-6 ? "too-far" : "correctable" };
}

export function correctionEase(value: number): number {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function findBone(bones: readonly THREE.Bone[], name: string) {
  return bones.find((bone) => bone.name.replace(/:/g, "") === name);
}
function localWorldOffset(bone: THREE.Bone, axisWorld: THREE.Vector3, radians: number) {
  const parentWorld = bone.parent?.getWorldQuaternion(new THREE.Quaternion()) ?? new THREE.Quaternion();
  const axisParent = axisWorld.clone().applyQuaternion(parentWorld.invert()).normalize();
  bone.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axisParent, radians)).normalize();
  bone.updateWorldMatrix(false, true);
}

function elbowHinge(model: THREE.Object3D, bones: readonly THREE.Bone[], metric: "rightElbowAngle" | "leftElbowAngle") {
  model.updateWorldMatrix(true, true);
  const [shoulder, elbow, wrist] = ELBOW_BONES[metric].map((name) => findBone(bones, name));
  if (!shoulder || !elbow || !wrist) return null;
  const joint = elbow.getWorldPosition(new THREE.Vector3());
  const proximal = shoulder.getWorldPosition(new THREE.Vector3()).sub(joint).normalize();
  const distal = wrist.getWorldPosition(new THREE.Vector3()).sub(joint).normalize();
  const axis = proximal.cross(distal);
  // A straight/folded pose has no identifiable geometric hinge; do not invent one.
  if (axis.lengthSq() < 1e-10) return null;
  return { elbow, axis: axis.normalize() };
}

/** Rotation in the measured shoulder/elbow/wrist plane, about the elbow hinge. */
export function applyElbowHingeOffset(model: THREE.Object3D, bones: readonly THREE.Bone[], metric: "rightElbowAngle" | "leftElbowAngle", degrees: number): boolean {
  if (Math.abs(degrees) > MAX_MOCAP_CORRECTION_DEGREES + 1e-6 || !Number.isFinite(degrees)) return false;
  if (Math.abs(degrees) < 1e-8) return true;
  const hinge = elbowHinge(model, bones, metric);
  if (!hinge) return false;
  localWorldOffset(hinge.elbow, hinge.axis, THREE.MathUtils.degToRad(degrees));
  return true;
}

function signedSeparation(bones: readonly THREE.Bone[]): number | null {
  const selected = ["mixamorigLeftUpLeg", "mixamorigRightUpLeg", "mixamorigLeftArm", "mixamorigRightArm"].map((name) => findBone(bones, name));
  if (selected.some((bone) => !bone)) return null;
  const points = selected.map((bone) => bone!.getWorldPosition(new THREE.Vector3()));
  const hipAxis = points[1].sub(points[0]); hipAxis.y = 0;
  const shoulderAxis = points[3].sub(points[2]); shoulderAxis.y = 0;
  if (hipAxis.lengthSq() < 1e-12 || shoulderAxis.lengthSq() < 1e-12) return null;
  hipAxis.normalize(); shoulderAxis.normalize();
  return THREE.MathUtils.radToDeg(Math.atan2(new THREE.Vector3().crossVectors(hipAxis, shoulderAxis).y, hipAxis.dot(shoulderAxis)));
}

/** Total axial twist is capped at 20 degrees, shared across available spine bones. */
export function applySpineTwistOffset(model: THREE.Object3D, bones: readonly THREE.Bone[], totalDegrees: number): boolean {
  if (!Number.isFinite(totalDegrees) || Math.abs(totalDegrees) > MAX_MOCAP_CORRECTION_DEGREES + 1e-6) return false;
  const spine = SPINE_NAMES.map((name) => findBone(bones, name)).filter((bone): bone is THREE.Bone => !!bone);
  if (!spine.length) return false;
  for (const bone of spine) {
    model.updateWorldMatrix(true, true);
    localWorldOffset(bone, new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(totalDegrees / spine.length));
  }
  return true;
}

interface FramePlan {
  time: number;
  phaseIndex: number;
  rows: PhaseAngleComparison[];
  requests: Record<CorrectableMetric, CorrectionRequest>;
  signedRequests: Record<CorrectableMetric, number>;
  offsets: Record<CorrectableMetric, number>;
}
const blankOffsets = (): Record<CorrectableMetric, number> => ({ rightElbowAngle: 0, leftElbowAngle: 0, hipShoulderSeparation: 0 });

/** Clone original tracks; only elbow/spine quaternion tracks may be replaced. */
export function bakeMetricCorrectedClip(model: THREE.Object3D, mesh: THREE.SkinnedMesh, rawClip: THREE.AnimationClip, config: MocapClipConfig): CorrectedMocap {
  const bones = mesh.skeleton.bones;
  const originalPose = bones.map((bone) => ({ position: bone.position.clone(), quaternion: bone.quaternion.clone(), scale: bone.scale.clone() }));
  const restorePose = () => bones.forEach((bone, index) => {
    bone.position.copy(originalPose[index].position); bone.quaternion.copy(originalPose[index].quaternion); bone.scale.copy(originalPose[index].scale);
  });
  // Explicit interpolants avoid AnimationMixer's unchanged-value cache retaining
  // a correction we manually applied to a static or unanimated bone last frame.
  // These runtime methods exist in Three but are absent from its current typings.
  const makeSamplers = (clip: THREE.AnimationClip) => clip.tracks.map((track) => {
    const interpolant = (track as THREE.KeyframeTrack & { createInterpolant: () => THREE.Interpolant }).createInterpolant();
    const binding = THREE.PropertyBinding.create(mesh, track.name) as THREE.PropertyBinding & { setValue: (values: ArrayLike<number>, offset: number) => void };
    binding.bind();
    return { interpolant, binding };
  });
  const rawSamplers = makeSamplers(rawClip);
  const seekRaw = (time: number) => {
    restorePose();
    for (const sampler of rawSamplers) sampler.binding.setValue(sampler.interpolant.evaluate(time), 0);
    model.updateWorldMatrix(true, true);
  };
  const fps = config.fps ?? 24;
  // Subframe bake plus original keys and phase boundaries. A full native-frame
  // zero guard keeps the safety fade off interpolation intervals near refusals.
  const timeSet = new Set<number>([0, rawClip.duration]);
  for (let i = 0; i / (fps * 4) < rawClip.duration; i++) timeSet.add(i / (fps * 4));
  for (const track of rawClip.tracks) for (const time of Array.from(track.times)) timeSet.add(time);
  for (const phase of config.phases) {
    timeSet.add(sourceTimeToClipTime(config, phase.startTime, rawClip.duration));
    timeSet.add(sourceTimeToClipTime(config, phase.endTime, rawClip.duration));
    if (phase.checkpointTime !== undefined) timeSet.add(sourceTimeToClipTime(config, phase.checkpointTime, rawClip.duration));
  }
  const times = Array.from(timeSet).filter((time) => time >= 0 && time <= rawClip.duration).sort((a, b) => a - b);
  const frames: FramePlan[] = [];
  try {
    for (const time of times) {
      seekRaw(time);
      const phaseIndex = getActivePhaseIndex(config, time);
      const rawAngles = measureMocapAngles(model, bones);
      const rows = phaseIndex < 0 ? [] : compareMocapPhase(config, config.phases[phaseIndex], rawAngles);
      const requests = {} as FramePlan["requests"];
      const signedRequests = blankOffsets();
      for (const channel of CHANNELS) {
        const bound = rows.filter((row) => row.measurement === channel);
        const row = bound[0];
        // Conflicting duplicate bindings are not silently combined into >20 offsets.
        const conflict = bound.some((other) => other.metric.min !== row?.metric.min || other.metric.max !== row?.metric.max);
        requests[channel] = row && !conflict ? requestMocapCorrection(row.value, row.metric.min, row.metric.max) : { target: null, required: 0, status: "unavailable" };
        if (requests[channel].status === "correctable") {
          signedRequests[channel] = requests[channel].required;
          if (channel === "hipShoulderSeparation") {
            const signed = signedSeparation(bones);
            if (signed === null || !SPINE_NAMES.some((name) => findBone(bones, name))) { requests[channel].status = "unavailable"; signedRequests[channel] = 0; }
            else signedRequests[channel] *= signed < 0 ? -1 : 1;
          } else if (!elbowHinge(model, bones, channel)) {
            requests[channel].status = "unavailable"; signedRequests[channel] = 0;
          }
        }
      }
      frames.push({ time, phaseIndex, rows, requests, signedRequests, offsets: blankOffsets() });
    }

    // Smooth requested offsets across neighboring subframes. Refusal/missing-data
    // samples are hard zero anchors; safe frames ease to zero BEFORE those anchors.
    for (const channel of CHANNELS) {
      const forbidden = frames.filter((frame) => ["too-far", "unavailable"].includes(frame.requests[channel].status)).map((frame) => frame.time);
      for (const frame of frames) {
        if (["too-far", "unavailable"].includes(frame.requests[channel].status)) continue;
        let numerator = 0; let denominator = 0;
        for (const neighbor of frames) {
          const distance = Math.abs(neighbor.time - frame.time);
          if (distance >= CORRECTION_EASE_SECONDS) continue;
          const weight = 1 - correctionEase(distance / CORRECTION_EASE_SECONDS);
          numerator += neighbor.signedRequests[channel] * weight;
          denominator += weight;
        }
        let closest = Infinity;
        for (const time of forbidden) closest = Math.min(closest, Math.abs(time - frame.time));
        const envelope = correctionEase((closest - 1 / fps) / CORRECTION_EASE_SECONDS);
        frame.offsets[channel] = THREE.MathUtils.clamp((denominator ? numerator / denominator : 0) * envelope, -MAX_MOCAP_CORRECTION_DEGREES, MAX_MOCAP_CORRECTION_DEGREES);
      }
    }

    const correctedNames = new Set<string>();
    const trackValues = new Map<string, number[]>();
    const trackOffsets = new Map<string, number[]>();
    const candidates = ["mixamorigRightForeArm", "mixamorigLeftForeArm", ...SPINE_NAMES].map((name) => findBone(bones, name)).filter((bone): bone is THREE.Bone => !!bone);
    for (const bone of candidates) { trackValues.set(bone.name, []); trackOffsets.set(bone.name, []); }
    const samples: CorrectionSample[] = [];
    let maxAppliedDegrees = 0;
    for (const frame of frames) {
      seekRaw(frame.time);
      const applied = blankOffsets();
      for (const channel of CHANNELS) {
        const offset = frame.offsets[channel];
        const ok = channel === "hipShoulderSeparation" ? applySpineTwistOffset(model, bones, offset) : applyElbowHingeOffset(model, bones, channel, offset);
        if (ok) applied[channel] = offset;
        if (ok && Math.abs(offset) > 1e-8) {
          const names = channel === "hipShoulderSeparation" ? SPINE_NAMES : [ELBOW_BONES[channel][1]];
          for (const name of names) { const bone = findBone(bones, name); if (bone) correctedNames.add(bone.name); }
        }
      }
      const correctedAngles = measureMocapAngles(model, bones);
      for (const bone of candidates) {
        const value = bone.quaternion.clone();
        const values = trackValues.get(bone.name)!;
        // Quaternion signs must remain in one hemisphere for stable interpolation.
        if (values.length >= 4 && value.dot(new THREE.Quaternion().fromArray(values, values.length - 4)) < 0) value.set(-value.x, -value.y, -value.z, -value.w);
        values.push(value.x, value.y, value.z, value.w);
        const canonical = bone.name.replace(/:/g, "");
        const offset = canonical === ELBOW_BONES.rightElbowAngle[1] ? applied.rightElbowAngle : canonical === ELBOW_BONES.leftElbowAngle[1] ? applied.leftElbowAngle : applied.hipShoulderSeparation;
        trackOffsets.get(bone.name)!.push(offset);
      }
      for (const row of frame.rows) {
        if (!row.measurement) continue;
        const measurement = row.measurement;
        const correctionChannel = CHANNELS.includes(measurement as CorrectableMetric) ? measurement as CorrectableMetric : undefined;
        const request = correctionChannel ? frame.requests[correctionChannel] : undefined;
        const corrected = correctedAngles[measurement].value;
        const actual = correctionChannel ? applied[correctionChannel] : 0;
        maxAppliedDegrees = Math.max(maxAppliedDegrees, Math.abs(actual));
        const inRange = corrected != null && corrected >= row.metric.min && corrected <= row.metric.max;
        let status: CorrectionSample["status"] = "report-only";
        let reason: string | undefined;
        if (request?.status === "too-far") { status = "too-far"; reason = TOO_FAR_MESSAGE; }
        else if (request?.status === "unavailable" || corrected == null) { status = "unavailable"; reason = row.reason ?? "Correction hinge axis, spine chain, or reference unavailable"; }
        else if (request) {
          if (Math.abs(actual) < 1e-6 && request.status === "in-range") status = "in-range";
          else if (Math.abs(actual) > 1e-6 && inRange) status = "corrected";
          else { status = "easing"; reason = "Safety/neighbor easing leaves a residual deviation; no guarantee of an in-range frame."; }
        } else reason = "Knees are report-only; no knee or foot-plant IK correction is applied.";
        samples.push({ clipTime: frame.time, sourceTime: config.trimStart + frame.time, phaseIndex: frame.phaseIndex, metricName: row.metric.name, measurement, raw: row.value, corrected, target: request?.target ?? null, required: request?.required ?? 0, applied: actual, status, ...(reason ? { reason } : {}) });
      }
    }
    const tracks = rawClip.tracks.map((track) => track.clone());
    for (const name of Array.from(correctedNames)) {
      const path = `.bones[${name}].quaternion`;
      const index = tracks.findIndex((track) => track.name === path);
      const original = index >= 0 ? rawClip.tracks[index] : undefined;
      const offsets = trackOffsets.get(name)!;
      const values = trackValues.get(name)!;
      const selectedTimes: number[] = []; const selectedValues: number[] = [];
      const addKey = (time: number, quaternion: ArrayLike<number>) => {
        const stored = Math.fround(time);
        if (selectedTimes[selectedTimes.length - 1] === stored) selectedValues.splice(selectedValues.length - 4, 4, ...Array.from(quaternion));
        else { selectedTimes.push(stored); selectedValues.push(...Array.from(quaternion)); }
      };
      let replacement: THREE.QuaternionKeyframeTrack;
      if (original && original.getInterpolation() === THREE.InterpolateLinear && original.times.length > 1) {
        // Do not resample zero-only native intervals. Slightly non-unit imported
        // quaternions can change their interpolation if extra raw keys are added.
        // Keep those intervals' original values and keys byte-for-byte instead.
        const originalKeys = new Map(Array.from(original.times).map((time, key) => [time, key]));
        const intervalAt = (time: number) => {
          let key = 0;
          while (key < original.times.length - 2 && original.times[key + 1] <= time) key++;
          return key;
        };
        const activeIntervals = new Set<number>();
        for (let key = 0; key < times.length; key++) if (Math.abs(offsets[key]) > 1e-8) {
          const interval = intervalAt(times[key]);
          activeIntervals.add(interval);
          if (originalKeys.has(times[key]) && interval > 0) activeIntervals.add(interval - 1);
        }
        for (let key = 0; key < times.length; key++) {
          const time = times[key]; const rawKey = originalKeys.get(Math.fround(time));
          if (rawKey === undefined && !activeIntervals.has(intervalAt(time))) continue;
          const source = rawKey !== undefined && Math.abs(offsets[key]) < 1e-8 ? original.values : values;
          const offset = rawKey !== undefined && Math.abs(offsets[key]) < 1e-8 ? rawKey * 4 : key * 4;
          addKey(time, source.slice(offset, offset + 4));
        }
      } else for (let key = 0; key < times.length; key++) addKey(times[key], values.slice(key * 4, key * 4 + 4));
      replacement = new THREE.QuaternionKeyframeTrack(path, selectedTimes, selectedValues);
      if (index >= 0) tracks[index] = replacement; else tracks.push(replacement);
    }
    const clip = new THREE.AnimationClip(`${config.name} · metric-corrected (20° safety cap)`, rawClip.duration, tracks);
    const bakedSamplers = makeSamplers(clip);
    try {
      for (const frame of frames) {
        restorePose();
        for (const sampler of bakedSamplers) sampler.binding.setValue(sampler.interpolant.evaluate(frame.time), 0);
        const bakedAngles = measureMocapAngles(model, bones);
        for (const sample of samples.filter((sample) => sample.clipTime === frame.time)) {
          sample.corrected = bakedAngles[sample.measurement].value;
          if (sample.status === "corrected" || sample.status === "easing") {
            const row = frame.rows.find((row) => row.metric.name === sample.metricName)!;
            const inRange = sample.corrected != null && sample.corrected >= row.metric.min && sample.corrected <= row.metric.max;
            sample.status = Math.abs(sample.applied) > 1e-6 && inRange ? "corrected" : "easing";
            if (sample.status === "easing") sample.reason = "Safety/neighbor easing leaves a residual deviation; no guarantee of an in-range frame.";
            else delete sample.reason;
          }
        }
      }
    } finally { for (const sampler of bakedSamplers) sampler.binding.unbind(); }
    return { clip, samples, changedBones: Array.from(correctedNames), maxAppliedDegrees };
  } finally {
    for (const sampler of rawSamplers) sampler.binding.unbind();
    restorePose();
    model.updateWorldMatrix(true, true);
  }
}

/** Exact markers are included in the bake grid; return the closest measured key. */
export function correctionAtMarker(result: CorrectedMocap, phaseIndex: number, measurement: MocapAngleId, clipTime: number): CorrectionSample | undefined {
  return result.samples.filter((sample) => sample.phaseIndex === phaseIndex && sample.measurement === measurement).reduce<CorrectionSample | undefined>((best, sample) => !best || Math.abs(sample.clipTime - clipTime) < Math.abs(best.clipTime - clipTime) ? sample : best, undefined);
}
