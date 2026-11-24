import * as THREE from "three";
import { retargetClip } from "three/examples/jsm/utils/SkeletonUtils.js";
import { sourceTimeToClipTime, validateMocapConfig, type MocapClipConfig, type MocapPhase } from "@/data/mocapClips";
import { compareMocapPhase, measureMocapAngles, type MocapAngleMeasurements, type PhaseAngleComparison } from "./mocapAngles";

export interface PreparedMocap {
  sourceRig: THREE.Group & { skeleton: THREE.Skeleton };
  targetMesh: THREE.SkinnedMesh;
  clip: THREE.AnimationClip;
  originalDuration: number;
  sourceTargets: number;
  matchedTargets: number;
  missing: string[];
}
export interface MocapPhaseMarkerReport {
  phase: MocapPhase;
  sourceTime: number;
  clipTime: number;
  angles: MocapAngleMeasurements;
  comparisons: PhaseAngleComparison[];
  separationPeak: { value: number; sourceTime: number } | null;
}

function firstSkinnedMesh(root: THREE.Object3D): THREE.SkinnedMesh {
  let mesh: THREE.SkinnedMesh | undefined;
  root.traverse((node) => {
    if (!mesh && (node as THREE.SkinnedMesh).isSkinnedMesh) mesh = node as THREE.SkinnedMesh;
  });
  if (!mesh) throw new Error(`No skinned mesh found in ${root.name || "loaded rig"}.`);
  return mesh;
}

/** Shared pipeline for configured, bone-compatible Mixamo FBX / GLB rigs. */
export function prepareMocapClip(model: THREE.Object3D, fbx: THREE.Group, config: MocapClipConfig): PreparedMocap {
  validateMocapConfig(config);
  const sourceClip = fbx.animations[0];
  if (!sourceClip) throw new Error("The selected FBX has no animation clip.");
  if (config.trimEnd > sourceClip.duration + 1e-6) throw new Error("Configured trim extends past the source clip duration.");
  const sourceMesh = firstSkinnedMesh(fbx);
  const targetMesh = firstSkinnedMesh(model);
  const canonical = (name: string) => name.replace(/:/g, "");
  const sourceNames = new Map(sourceMesh.skeleton.bones.map((bone) => [canonical(bone.name), bone.name]));
  const targetNames = new Set(targetMesh.skeleton.bones.map((bone) => canonical(bone.name)));
  const targets = Array.from(new Set(sourceClip.tracks.map((track) => track.name.slice(0, track.name.lastIndexOf(".")))));
  const missing = targets.filter((name) => !targetNames.has(canonical(name)));
  for (const name of missing) console.warn(`[MocapPreview] Source animation target missing on hologram: ${name}`);
  const hip = config.hipBone ?? "mixamorigHips";
  if (!sourceNames.has(canonical(hip)) || !targetNames.has(canonical(hip))) throw new Error(`The configured hip bone ${hip} must exist on both rigs.`);
  let sourceRoot: THREE.Object3D | undefined;
  if (config.sourceRootBone) {
    sourceRoot = fbx.getObjectByName(config.sourceRootBone);
    if (!sourceRoot) throw new Error(`Configured source root ${config.sourceRootBone} is missing.`);
  } else {
    sourceRoot = fbx.getObjectByName(sourceNames.get(canonical(hip))!);
    // Retain animated bone ancestors, including an FBX reference root when present.
    while (sourceRoot?.parent && sourceRoot.parent !== fbx && (sourceRoot.parent as THREE.Bone).isBone) sourceRoot = sourceRoot.parent;
  }
  if (!sourceRoot) throw new Error("No source skeleton root found.");
  const sourceRig = Object.assign(new THREE.Group(), { skeleton: sourceMesh.skeleton });
  sourceRig.name = "MocapSourceRig";
  sourceRig.add(sourceRoot);
  sourceRig.updateMatrixWorld(true);
  model.updateMatrixWorld(true);
  const names: Record<string, string> = {};
  for (const bone of targetMesh.skeleton.bones) {
    const sourceName = sourceNames.get(canonical(bone.name));
    if (sourceName) names[bone.name] = sourceName;
    else console.warn(`[MocapPreview] Target bone has no source counterpart: ${bone.name}`);
  }
  const clip = retargetClip(targetMesh, sourceRig, sourceClip, {
    names,
    fps: config.fps ?? 24,
    trim: [config.trimStart, config.trimEnd],
    hip: sourceNames.get(canonical(hip))!,
    scale: config.scale,
    useFirstFramePosition: true,
    preserveHipPosition: false,
  });
  if (!Number.isFinite(clip.duration) || clip.duration <= 0) throw new Error("Retargeting did not produce a playable clip.");
  clip.name = `${config.name} · retargeted evaluation`;
  return { sourceRig, targetMesh, clip, originalDuration: sourceClip.duration, sourceTargets: targets.length, matchedTargets: targets.length - missing.length, missing };
}

/** Sample each resolved checkpoint and the separation peak within its phase interval. */
export function sampleMocapPhaseMarkers(model: THREE.Object3D, bones: readonly THREE.Bone[], config: MocapClipConfig, duration: number, seek: (time: number) => void): MocapPhaseMarkerReport[] {
  const fps = config.fps ?? 24;
  const reports = config.phases.map((phase) => {
    const clipTime = sourceTimeToClipTime(config, phase.checkpointTime ?? phase.startTime, duration);
    seek(clipTime);
    const angles = measureMocapAngles(model, bones);
    let separationPeak: MocapPhaseMarkerReport["separationPeak"] = null;
    const end = sourceTimeToClipTime(config, phase.endTime, duration);
    for (let sampleTime = sourceTimeToClipTime(config, phase.startTime, duration); sampleTime < end; sampleTime += 1 / fps) {
      seek(sampleTime);
      const value = measureMocapAngles(model, bones).hipShoulderSeparation.value;
      if (value !== null && (!separationPeak || value > separationPeak.value)) separationPeak = { value, sourceTime: config.trimStart + sampleTime };
    }
    return { phase, clipTime, sourceTime: config.trimStart + clipTime, angles, comparisons: compareMocapPhase(config, phase, angles), separationPeak };
  });
  // Sampling must not change the initial playback pose or timeline.
  seek(0);
  return reports;
}
