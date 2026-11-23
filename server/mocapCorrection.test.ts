import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as THREE from "three";
import { sourceTimeToClipTime, type MocapClipConfig } from "../client/src/data/mocapClips";
import { professionalReferences, type PhaseMetric } from "../client/src/data/professionalReferences";
import { measureMocapAngles, type MocapAngleId } from "../client/src/lib/mocapAngles";
import {
  applyElbowHingeOffset, applySpineTwistOffset, bakeMetricCorrectedClip,
  correctionAtMarker, correctionEase, CORRECTION_EASE_SECONDS,
  MAX_MOCAP_CORRECTION_DEGREES, requestMocapCorrection, TOO_FAR_MESSAGE,
  type CorrectedMocap,
} from "../client/src/lib/mocapCorrection";

const REFERENCE_KEY = "__mocap_correction_test_reference__";
const metric = (name: string, min: number, max: number): PhaseMetric => ({ name, min, max, unit: "degrees", note: "Synthetic geometric benchmark" });
const rightMetric = (min = 100, max = 120) => metric("Right Elbow Angle", min, max);
const qAxis = (axis: "y" | "z", degrees: number) => new THREE.Quaternion().setFromAxisAngle(
  axis === "y" ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(degrees),
);

// Install only an in-memory, exact-key reference. Do not mock the measurement or baker.
function setReference(phases: { name: string; metrics: PhaseMetric[] }[]) {
  professionalReferences[REFERENCE_KEY] = {
    motionName: "Synthetic correction fixture", category: "test", subcategory: "test", metrics: [],
    source: "Deterministic test geometry", verificationLevel: "unverified",
    phases: phases.map((phase) => ({ ...phase, cueText: "", instruction: "", approximateDuration: "" })),
  };
}
beforeEach(() => setReference([{ name: "Correct", metrics: [rightMetric()] }]));
afterEach(() => { delete professionalReferences[REFERENCE_KEY]; });

function config(overrides: Partial<MocapClipConfig> = {}): MocapClipConfig {
  return {
    id: "correction-fixture", name: "Correction fixture", fbxUrl: "fixture.fbx", targetModel: "fixture.glb",
    trimStart: 3.25, trimEnd: 4.25, scale: 1, fps: 25, referenceKey: REFERENCE_KEY,
    phases: [{ name: "Correct", startTime: 3.25, endTime: 4.25 }], ...overrides,
  };
}

// Same real SkinnedMesh/Skeleton construction as the pipeline fixture, with an
// identifiable elbow plane and three serial spine bones rather than a straight arm.
function boneRig() {
  const group = new THREE.Group();
  const bones: THREE.Bone[] = [];
  const add = (name: string, parent: THREE.Object3D, x: number, y: number, z = 0) => {
    const bone = new THREE.Bone(); bone.name = name; bone.position.set(x, y, z);
    parent.add(bone); bones.push(bone); return bone;
  };
  const hips = add("mixamorigHips", group, 0, 1);
  const spine = add("mixamorigSpine", hips, 0, 0.2);
  const spine1 = add("mixamorigSpine1", spine, 0, 0.2);
  const spine2 = add("mixamorigSpine2", spine1, 0, 0.2);
  for (const [side, sign] of [["Right", 1], ["Left", -1]] as const) {
    const arm = add(`mixamorig${side}Arm`, spine2, sign * 0.2, 0.1);
    const forearm = add(`mixamorig${side}ForeArm`, arm, sign * 0.3, 0);
    add(`mixamorig${side}Hand`, forearm, 0, 0.3);
    const upLeg = add(`mixamorig${side}UpLeg`, hips, sign * 0.1, -0.1);
    const leg = add(`mixamorig${side}Leg`, upLeg, 0, -0.45);
    add(`mixamorig${side}Foot`, leg, 0, -0.45);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 0.1, 0, 0, 0, 0.1, 0], 3));
  geometry.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(new Array(12).fill(bones.indexOf(hips)), 4));
  geometry.setAttribute("skinWeight", new THREE.Float32BufferAttribute([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], 4));
  const mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshBasicMaterial());
  group.add(mesh); group.updateMatrixWorld(true); mesh.bind(new THREE.Skeleton(bones));
  return { group, bones, mesh, bone: (name: string) => bones.find((bone) => bone.name === name)! };
}
type Rig = ReturnType<typeof boneRig>;
const protectedName = (name: string) => /Hips|UpLeg|Leg|Foot/.test(name);
const path = (name: string, property = "quaternion") => `.bones[${name}].${property}`;
const pose = (rig: Rig) => rig.bones.map((bone) => ({
  name: bone.name, position: bone.position.toArray(), quaternion: bone.quaternion.toArray(), scale: bone.scale.toArray(),
  worldPosition: bone.getWorldPosition(new THREE.Vector3()).toArray(),
  worldQuaternion: bone.getWorldQuaternion(new THREE.Quaternion()).toArray(),
}));

function rawClip(rig: Rig, duration = 1) {
  return new THREE.AnimationClip("raw fixture", duration, rig.bones.map((bone) =>
    new THREE.QuaternionKeyframeTrack(path(bone.name), [0, duration], [...bone.quaternion.toArray(), ...bone.quaternion.toArray()]),
  ));
}
function replaceTrack(clip: THREE.AnimationClip, track: THREE.KeyframeTrack) {
  const index = clip.tracks.findIndex((other) => other.name === track.name);
  if (index < 0) clip.tracks.push(track); else clip.tracks[index] = track;
}
function elbowTrack(clip: THREE.AnimationClip, times: number[], angles: number[]) {
  replaceTrack(clip, new THREE.QuaternionKeyframeTrack(path("mixamorigRightForeArm"), times,
    angles.flatMap((angle) => qAxis("z", 90 - angle).toArray()),
  ));
}
function trackSnapshot(clip: THREE.AnimationClip) {
  return clip.tracks.map((track) => ({ name: track.name, interpolation: track.getInterpolation(), times: Array.from(track.times), values: Array.from(track.values) }));
}
function sampleClip(rig: Rig, clip: THREE.AnimationClip, time: number) {
  const mixer = new THREE.AnimationMixer(rig.mesh);
  const action = mixer.clipAction(clip).setLoop(THREE.LoopOnce, 1);
  action.clampWhenFinished = true; action.play(); mixer.setTime(time);
  const angles = measureMocapAngles(rig.group, rig.bones);
  const sampledPose = pose(rig);
  mixer.stopAllAction(); mixer.uncacheClip(clip); rig.group.updateWorldMatrix(true, true);
  return { angles, pose: sampledPose };
}
function sample(result: CorrectedMocap, time: number, measurement: MocapAngleId = "rightElbowAngle") {
  const found = result.samples.find((item) => item.measurement === measurement && Math.abs(item.clipTime - time) < 1e-9);
  expect(found, `missing measured bake key at ${time} for ${measurement}`).toBeDefined();
  return found!;
}
function expectSameRotation(actual: number[], expected: number[], tolerance = 1e-6) {
  expect(new THREE.Quaternion().fromArray(actual).normalize().angleTo(new THREE.Quaternion().fromArray(expected).normalize())).toBeLessThan(tolerance);
}

describe("Nearest-boundary correction requests and the hard safety cap", () => {
  it.each([[80, 85, 100, 87, 7], [105, 85, 100, 98, -7], [78, 80, 81, 80.5, 2.5]])(
    "moves %s toward the nearest boundary plus an inward margin, not a broad-range midpoint",
    (value, min, max, target, required) => {
      expect(requestMocapCorrection(value, min, max)).toEqual({ target, required, status: "correctable" });
    },
  );
  it.each([85, 90, 100])("leaves inclusive in-range value %s unchanged", (value) => {
    expect(requestMocapCorrection(value, 85, 100)).toEqual({ target: value, required: 0, status: "in-range" });
  });
  it.each([[67, 20], [118, -20]])("allows exactly twenty degrees for %s", (value, required) => {
    expect(MAX_MOCAP_CORRECTION_DEGREES).toBe(20);
    expect(requestMocapCorrection(value, 85, 100)).toMatchObject({ required, status: "correctable" });
  });
  it.each([66.999, 118.001, 60, 125])("rejects %s instead of clamping an unsafe request to twenty", (value) => {
    const request = requestMocapCorrection(value, 85, 100);
    expect(request.status).toBe("too-far"); expect(Math.abs(request.required)).toBeGreaterThan(20);
  });
  it("counts the inward margin in the twenty-degree limit", () => {
    expect(requestMocapCorrection(65, 85, 100)).toEqual({ target: 87, required: 22, status: "too-far" });
  });
  it.each([[null, 85, 100], [Number.NaN, 85, 100], [Infinity, 85, 100], [90, Infinity, 100], [90, 100, 85]])(
    "rejects missing, non-finite, or inverted inputs", (value, min, max) => {
      expect(requestMocapCorrection(value, min, max)).toEqual({ target: null, required: 0, status: "unavailable" });
    },
  );
  it("clamps quintic easing and has flat endpoints", () => {
    expect(CORRECTION_EASE_SECONDS).toBeGreaterThan(0);
    expect(correctionEase(-1)).toBe(0); expect(correctionEase(2)).toBe(1); expect(correctionEase(0.5)).toBeCloseTo(0.5);
    expect(correctionEase(0.001)).toBeLessThan(1e-7); expect(1 - correctionEase(0.999)).toBeLessThan(1e-7);
  });
});

describe("World-space elbow hinge geometry", () => {
  it.each(["rightElbowAngle", "leftElbowAngle"] as const)("changes the actual %s interior angle under transformed parents", (measurement) => {
    const rig = boneRig();
    const ancestor = new THREE.Group(); ancestor.position.set(10, -3, 5); ancestor.rotation.set(0.4, -0.8, 0.7); ancestor.scale.setScalar(0.01);
    ancestor.add(rig.group); rig.group.rotation.set(-0.2, 0.3, 0.1); rig.bone("mixamorigSpine2").rotation.set(0.2, -0.4, 0.3);
    const side = measurement === "rightElbowAngle" ? "Right" : "Left";
    measureMocapAngles(rig.group, rig.bones);
    const before = pose(rig); const elbow = rig.bone(`mixamorig${side}ForeArm`);
    expect(measureMocapAngles(rig.group, rig.bones)[measurement].value).toBeCloseTo(90, 6);
    expect(applyElbowHingeOffset(rig.group, rig.bones, measurement, 12)).toBe(true);
    expect(measureMocapAngles(rig.group, rig.bones)[measurement].value).toBeCloseTo(102, 6);
    expect(elbow.getWorldPosition(new THREE.Vector3()).distanceTo(new THREE.Vector3().fromArray(before.find((bone) => bone.name === elbow.name)!.worldPosition))).toBeLessThan(1e-10);
    for (const bone of rig.bones.filter((bone) => bone !== elbow)) {
      const original = before.find((item) => item.name === bone.name)!;
      expect(bone.position.toArray()).toEqual(original.position); expect(bone.quaternion.toArray()).toEqual(original.quaternion);
    }
    expect(applyElbowHingeOffset(rig.group, rig.bones, measurement, -12)).toBe(true);
    expect(measureMocapAngles(rig.group, rig.bones)[measurement].value).toBeCloseTo(90, 6);
  });
  it.each([20, -20])("allows a %s-degree hinge offset", (degrees) => {
    const rig = boneRig(); expect(applyElbowHingeOffset(rig.group, rig.bones, "rightElbowAngle", degrees)).toBe(true);
    expect(measureMocapAngles(rig.group, rig.bones).rightElbowAngle.value).toBeCloseTo(90 + degrees, 6);
  });
  it.each([20.001, -20.001, Number.NaN, Infinity])("hard-rejects unsafe hinge input %s without touching the pose", (degrees) => {
    const rig = boneRig(); const before = pose(rig);
    expect(applyElbowHingeOffset(rig.group, rig.bones, "rightElbowAngle", degrees)).toBe(false); expect(pose(rig)).toEqual(before);
  });
  it.each(["missing", "zero-length", "straight", "folded"])("does not invent a hinge for %s geometry", (kind) => {
    const rig = boneRig(); const hand = rig.bone("mixamorigRightHand");
    if (kind === "zero-length") hand.position.set(0, 0, 0);
    if (kind === "straight") hand.position.set(0.3, 0, 0);
    if (kind === "folded") hand.position.set(-0.3, 0, 0);
    const bones = kind === "missing" ? rig.bones.filter((bone) => bone !== hand) : rig.bones;
    rig.group.updateWorldMatrix(true, true); const before = pose(rig);
    expect(applyElbowHingeOffset(rig.group, bones, "rightElbowAngle", 12)).toBe(false); expect(pose(rig)).toEqual(before);
  });
  it("recognizes colon-style Mixamo names", () => {
    const rig = boneRig(); rig.bones.forEach((bone) => { bone.name = bone.name.replace("mixamorig", "mixamorig:"); });
    expect(applyElbowHingeOffset(rig.group, rig.bones, "rightElbowAngle", 12)).toBe(true);
    expect(measureMocapAngles(rig.group, rig.bones).rightElbowAngle.value).toBeCloseTo(102, 6);
  });
});

describe("Total distributed spine twist, not twenty degrees per bone", () => {
  it.each([20, -20])("shares a total %s-degree twist among three bones and leaves the pelvis and legs untouched", (degrees) => {
    const rig = boneRig(); rig.group.position.set(2, 4, -3); rig.group.rotation.y = 0.4; rig.bone("mixamorigHips").rotation.y = -0.2;
    rig.bone("mixamorigSpine1").quaternion.copy(qAxis("y", 35));
    const raw = measureMocapAngles(rig.group, rig.bones).hipShoulderSeparation.value!; const before = pose(rig);
    expect(applySpineTwistOffset(rig.group, rig.bones, degrees)).toBe(true);
    expect(measureMocapAngles(rig.group, rig.bones).hipShoulderSeparation.value).toBeCloseTo(raw + degrees, 6);
    for (const bone of rig.bones) {
      const original = before.find((item) => item.name === bone.name)!;
      expect(bone.position.toArray()).toEqual(original.position);
      if (/Spine/.test(bone.name)) expect(THREE.MathUtils.radToDeg(bone.quaternion.angleTo(new THREE.Quaternion().fromArray(original.quaternion)))).toBeCloseTo(Math.abs(degrees) / 3, 6);
      else expect(bone.quaternion.toArray()).toEqual(original.quaternion);
      if (protectedName(bone.name)) {
        expect(bone.getWorldPosition(new THREE.Vector3()).toArray()).toEqual(original.worldPosition);
        expectSameRotation(bone.getWorldQuaternion(new THREE.Quaternion()).toArray(), original.worldQuaternion);
      }
    }
  });
  it.each([20.001, -20.001, Number.NaN, Infinity])("rejects unsafe total spine input %s atomically", (degrees) => {
    const rig = boneRig(); const before = pose(rig);
    expect(applySpineTwistOffset(rig.group, rig.bones, degrees)).toBe(false); expect(pose(rig)).toEqual(before);
  });
  it("returns false if there are no spine bones", () => {
    const rig = boneRig(); const before = pose(rig);
    expect(applySpineTwistOffset(rig.group, rig.bones.filter((bone) => !/Spine/.test(bone.name)), 12)).toBe(false);
    expect(pose(rig)).toEqual(before);
  });
});

describe("Baked clips, actual measurements, and raw-track preservation", () => {
  it("bakes both elbows and a total spine twist while cloning and preserving every protected track and restoring the input pose", () => {
    setReference([{ name: "Correct", metrics: [rightMetric(), metric("Left Elbow Angle", 65, 80), metric("Hip-Shoulder Separation", 30, 45), metric("Right Knee Flexion", 100, 110)] }]);
    const rig = boneRig(); rig.bone("mixamorigSpine1").quaternion.copy(qAxis("y", 20));
    const raw = rawClip(rig);
    replaceTrack(raw, new THREE.VectorKeyframeTrack(path("mixamorigHips", "position"), [0, 0.4375, 1], [0, 1, 0, 0.2, 1.1, -0.1, 0.4, 1, 0]));
    replaceTrack(raw, new THREE.QuaternionKeyframeTrack(path("mixamorigHips"), [0, 0.4375, 1], [...qAxis("y", 0).toArray(), ...qAxis("y", 15).toArray(), ...qAxis("y", 0).toArray()]));
    replaceTrack(raw, new THREE.QuaternionKeyframeTrack(path("mixamorigRightLeg"), [0, 1], [...qAxis("z", 3).toArray(), ...qAxis("z", 8).toArray()]));
    rig.group.updateWorldMatrix(true, true); const before = pose(rig); const snapshot = trackSnapshot(raw);
    const result = bakeMetricCorrectedClip(rig.group, rig.mesh, raw, config());
    expect(result.clip).not.toBe(raw); expect(result.clip.duration).toBe(raw.duration);
    expect(trackSnapshot(raw)).toEqual(snapshot); expect(pose(rig)).toEqual(before);
    expect(new Set(result.changedBones)).toEqual(new Set(["mixamorigRightForeArm", "mixamorigLeftForeArm", "mixamorigSpine", "mixamorigSpine1", "mixamorigSpine2"]));
    expect(result.maxAppliedDegrees).toBeCloseTo(12, 5); expect(result.maxAppliedDegrees).toBeLessThanOrEqual(20);
    for (const original of raw.tracks) {
      const baked = result.clip.tracks.find((track) => track.name === original.name)!;
      expect(baked).not.toBe(original); expect(baked.times).not.toBe(original.times); expect(baked.values).not.toBe(original.values);
      if (!result.changedBones.some((name) => original.name === path(name))) {
        expect(Array.from(baked.times)).toEqual(Array.from(original.times)); expect(Array.from(baked.values)).toEqual(Array.from(original.values));
        expect(baked.getInterpolation()).toBe(original.getInterpolation());
      }
    }
    for (const time of [0, 0.123, 0.4375, 0.75, 1]) {
      const rawFrame = sampleClip(rig, raw, time); const bakedFrame = sampleClip(rig, result.clip, time);
      expect(bakedFrame.angles.rightElbowAngle.value).toBeCloseTo(102, 4);
      expect(bakedFrame.angles.leftElbowAngle.value).toBeCloseTo(78, 4);
      expect(bakedFrame.angles.hipShoulderSeparation.value).toBeCloseTo(32, 4);
      for (const bone of rawFrame.pose.filter((item) => protectedName(item.name))) {
        const baked = bakedFrame.pose.find((item) => item.name === bone.name)!;
        expect(baked.position).toEqual(bone.position); expect(baked.quaternion).toEqual(bone.quaternion);
        expect(baked.worldPosition).toEqual(bone.worldPosition); expectSameRotation(baked.worldQuaternion, bone.worldQuaternion);
      }
    }
    for (const measurement of ["rightElbowAngle", "leftElbowAngle", "hipShoulderSeparation"] as const) {
      const report = sample(result, 0.5, measurement); const baked = sampleClip(rig, result.clip, report.clipTime);
      expect(report.corrected).toBeCloseTo(baked.angles[measurement].value!, 4); expect(report.status).toBe("corrected");
    }
    const knee = sample(result, 0.5, "rightKneeAngle");
    expect(knee.status).toBe("report-only"); expect(knee.applied).toBe(0); expect(knee.corrected).toBeCloseTo(knee.raw!, 6);
    expect(knee.reason).toMatch(/report-only|no knee/i);
    result.clip.tracks[0].values[0] += 0.1;
    expect(trackSnapshot(raw)).toEqual(snapshot);
  });
  it.each(["no-such-reference", "football-punt"])("falls back to independent raw clones for absent or flat-only reference %s", (referenceKey) => {
    const rig = boneRig(); const raw = rawClip(rig); elbowTrack(raw, [0, 0.375, 1], [80, 130, 95]);
    const snapshot = trackSnapshot(raw); const result = bakeMetricCorrectedClip(rig.group, rig.mesh, raw, config({ referenceKey }));
    expect(result.samples).toEqual([]); expect(result.changedBones).toEqual([]); expect(result.maxAppliedDegrees).toBe(0);
    expect(trackSnapshot(result.clip)).toEqual(snapshot); expect(trackSnapshot(raw)).toEqual(snapshot);
    result.clip.tracks.forEach((track, index) => {
      expect(track).not.toBe(raw.tracks[index]); expect(track.values).not.toBe(raw.tracks[index].values); expect(track.times).not.toBe(raw.tracks[index].times);
    });
    for (const time of [0, 0.23, 0.375, 0.88, 1]) expect(sampleClip(rig, result.clip, time).angles).toEqual(sampleClip(rig, raw, time).angles);
  });
  it.each(["missing", "zero-length"])("keeps raw playback and unavailable reports for %s elbow geometry", (kind) => {
    const rig = boneRig(); const hand = rig.bone("mixamorigRightHand");
    if (kind === "missing") rig.mesh.skeleton.bones = rig.bones.filter((bone) => bone !== hand);
    else hand.position.set(0, 0, 0);
    const raw = rawClip(rig);
    if (kind === "missing") raw.tracks = raw.tracks.filter((track) => track.name !== path(hand.name));
    const result = bakeMetricCorrectedClip(rig.group, rig.mesh, raw, config());
    expect(result.changedBones).toEqual([]); expect(trackSnapshot(result.clip)).toEqual(trackSnapshot(raw));
    expect(result.samples.length).toBeGreaterThan(0);
    for (const report of result.samples) { expect(report.status).toBe("unavailable"); expect(report.applied).toBe(0); expect(report.corrected).toBeNull(); expect(report.reason).toBeTruthy(); }
  });
  it("reports an unavailable hinge, rather than successful/easing correction, for an out-of-range straight limb", () => {
    setReference([{ name: "Correct", metrics: [rightMetric(150, 170)] }]);
    const rig = boneRig(); rig.bone("mixamorigRightHand").position.set(0.3, 0, 0); const raw = rawClip(rig);
    const result = bakeMetricCorrectedClip(rig.group, rig.mesh, raw, config());
    expect(result.changedBones).toEqual([]); expect(result.maxAppliedDegrees).toBe(0);
    const report = sample(result, 0.5); expect(report.raw).toBeCloseTo(180); expect(report.corrected).toBeCloseTo(180);
    expect(report.applied).toBe(0); expect(report.status).toBe("unavailable"); expect(report.reason).toMatch(/axis|hinge|degenerate/i);
  });
  it("keeps separation unavailable if the pelvis has no horizontal axis", () => {
    setReference([{ name: "Correct", metrics: [metric("Hip-Shoulder Separation", 30, 45)] }]);
    const rig = boneRig(); rig.bone("mixamorigLeftUpLeg").position.x = 0; rig.bone("mixamorigRightUpLeg").position.x = 0;
    const raw = rawClip(rig); const result = bakeMetricCorrectedClip(rig.group, rig.mesh, raw, config());
    expect(result.changedBones).toEqual([]);
    const report = sample(result, 0.5, "hipShoulderSeparation"); expect(report.status).toBe("unavailable"); expect(report.applied).toBe(0); expect(report.raw).toBeNull();
  });
  it("does not accumulate elbow offsets when the source has no forearm quaternion track", () => {
    const rig = boneRig(); const raw = rawClip(rig); raw.tracks = raw.tracks.filter((track) => track.name !== path("mixamorigRightForeArm"));
    const result = bakeMetricCorrectedClip(rig.group, rig.mesh, raw, config());
    expect(result.changedBones).toEqual(["mixamorigRightForeArm"]);
    for (const time of [0, 0.25, 0.5, 0.75, 1]) {
      expect(sampleClip(rig, result.clip, time).angles.rightElbowAngle.value).toBeCloseTo(102, 4);
      expect(sample(result, time).corrected).toBeCloseTo(102, 4);
    }
  });
  it("does not accumulate distributed spine offsets when source spine tracks are absent", () => {
    setReference([{ name: "Correct", metrics: [metric("Hip-Shoulder Separation", 30, 45)] }]);
    const rig = boneRig(); rig.bone("mixamorigSpine1").quaternion.copy(qAxis("y", 20)); const raw = rawClip(rig);
    raw.tracks = raw.tracks.filter((track) => !/Spine/.test(track.name));
    const result = bakeMetricCorrectedClip(rig.group, rig.mesh, raw, config());
    for (const time of [0, 0.25, 0.5, 0.75, 1]) {
      expect(sampleClip(rig, result.clip, time).angles.hipShoulderSeparation.value).toBeCloseTo(32, 4);
      expect(sample(result, time, "hipShoulderSeparation").corrected).toBeCloseTo(32, 4);
    }
    expect(result.changedBones.every((name) => /Spine/.test(name))).toBe(true);
  });
  it.each([[108, 128, 110, 20], [52, 72, 70, -20]])("bakes an inclusive twenty-degree request without exceeding the total cap", (min, max, target, required) => {
    setReference([{ name: "Correct", metrics: [rightMetric(min, max)] }]);
    const rig = boneRig(); const raw = rawClip(rig); const result = bakeMetricCorrectedClip(rig.group, rig.mesh, raw, config());
    expect(result.maxAppliedDegrees).toBeCloseTo(20, 5); expect(result.maxAppliedDegrees).toBeLessThanOrEqual(20);
    const report = sample(result, 0.5);
    expect(report.required).toBeCloseTo(required, 5); expect(report.applied).toBeCloseTo(required, 5); expect(report.status).toBe("corrected");
    expect(report.corrected).toBeCloseTo(target, 4);
    expect(sampleClip(rig, result.clip, 0.5).angles.rightElbowAngle.value).toBeCloseTo(target, 4);
  });
  it("hard-refuses an entirely unsafe clip rather than baking a twenty-degree clamped approximation", () => {
    setReference([{ name: "Correct", metrics: [rightMetric(120, 140)] }]);
    const rig = boneRig(); const raw = rawClip(rig); const result = bakeMetricCorrectedClip(rig.group, rig.mesh, raw, config());
    expect(result.changedBones).toEqual([]); expect(result.maxAppliedDegrees).toBe(0); expect(trackSnapshot(result.clip)).toEqual(trackSnapshot(raw));
    for (const report of result.samples) {
      expect(report.status).toBe("too-far"); expect(report.reason).toBe(TOO_FAR_MESSAGE); expect(report.required).toBeCloseTo(32);
      expect(report.applied).toBe(0); expect(report.corrected).toBeCloseTo(report.raw!, 6);
    }
  });
  it("leaves out-of-range knees report-only, including animated hip, knee and foot tracks", () => {
    setReference([{ name: "Correct", metrics: [metric("Right Knee Flexion", 90, 110), metric("Left Knee Flexion", 90, 110)] }]);
    const rig = boneRig(); const raw = rawClip(rig);
    for (const name of ["mixamorigHips", "mixamorigRightLeg", "mixamorigLeftLeg", "mixamorigRightFoot", "mixamorigLeftFoot"]) {
      replaceTrack(raw, new THREE.QuaternionKeyframeTrack(path(name), [0, 0.4375, 1], [...qAxis("z", 2).toArray(), ...qAxis("z", 8).toArray(), ...qAxis("z", 3).toArray()]));
    }
    const result = bakeMetricCorrectedClip(rig.group, rig.mesh, raw, config());
    expect(result.changedBones).toEqual([]); expect(result.maxAppliedDegrees).toBe(0); expect(trackSnapshot(result.clip)).toEqual(trackSnapshot(raw));
    for (const report of result.samples) {
      expect(report.status).toBe("report-only"); expect(report.applied).toBe(0); expect(report.corrected).toBeCloseTo(report.raw!, 6);
      expect(report.reason).toMatch(/no knee|report-only/i);
    }
    for (const time of [0, 0.123, 0.4375, 0.75, 1]) {
      const actual = sampleClip(rig, result.clip, time); const expected = sampleClip(rig, raw, time);
      expect(actual.angles.rightKneeAngle.value).toBeCloseTo(expected.angles.rightKneeAngle.value!, 6);
      expect(actual.pose.filter((bone) => protectedName(bone.name))).toEqual(expected.pose.filter((bone) => protectedName(bone.name)));
    }
  });
});

describe("Temporal easing, refusal intervals, and exact phase-marker samples", () => {
  it("smooths opposite safe offsets across a phase boundary instead of stepping between phase targets", () => {
    setReference([{ name: "Raise", metrics: [rightMetric()] }, { name: "Lower", metrics: [rightMetric(65, 80)] }]);
    const cfg = config({ phases: [{ name: "Raise", startTime: 3.25, endTime: 3.75 }, { name: "Lower", startTime: 3.75, endTime: 4.25 }] });
    const rig = boneRig(); const raw = rawClip(rig); const result = bakeMetricCorrectedClip(rig.group, rig.mesh, raw, cfg);
    expect(sample(result, 0.25).applied).toBeCloseTo(12, 5); expect(sample(result, 0.75).applied).toBeCloseTo(-12, 5);
    const before = sample(result, 0.49); const at = sample(result, 0.5); const after = sample(result, 0.51);
    expect(before.phaseIndex).toBe(0); expect(at.phaseIndex).toBe(1); expect(at.target).toBe(78);
    expect(before.applied).toBeGreaterThan(at.applied); expect(at.applied).toBeGreaterThan(after.applied);
    expect(Math.abs(at.applied)).toBeLessThan(4); expect(Math.abs(at.applied - before.applied)).toBeLessThan(6);
    expect(at.status).toBe("easing"); expect(at.corrected).toBeGreaterThan(80);
    const a = sampleClip(rig, result.clip, 0.499).angles.rightElbowAngle.value!;
    const b = sampleClip(rig, result.clip, 0.501).angles.rightElbowAngle.value!;
    expect(Math.abs(a - b)).toBeLessThan(1);
  });
  it("eases to zero before a too-far interval and exactly preserves animated raw playback throughout the unsafe interval", () => {
    setReference([{ name: "Safe", metrics: [rightMetric()] }, { name: "Unsafe", metrics: [rightMetric(120, 140)] }]);
    const cfg = config({ phases: [
      { name: "Before", referenceName: "Safe", startTime: 3.25, endTime: 3.65 },
      { name: "Unsafe", startTime: 3.65, endTime: 3.85 },
      { name: "After", referenceName: "Safe", startTime: 3.85, endTime: 4.25 },
    ] });
    const rig = boneRig(); const raw = rawClip(rig); elbowTrack(raw, [0, 0.3, 0.4, 0.6, 0.7, 1], [85, 90, 90, 92, 94, 90]);
    const result = bakeMetricCorrectedClip(rig.group, rig.mesh, raw, cfg);
    expect(sample(result, 0.3).applied).toBeGreaterThan(10); expect(Math.abs(sample(result, 0.39).applied)).toBeLessThan(1);
    expect(Math.abs(sample(result, 0.61).applied)).toBeLessThan(1); expect(sample(result, 0.7).applied).toBeGreaterThan(6);
    const unsafe = result.samples.filter((item) => item.phaseIndex === 1);
    expect(unsafe.length).toBeGreaterThan(10);
    for (const report of unsafe) {
      expect(report.status).toBe("too-far"); expect(report.reason).toBe(TOO_FAR_MESSAGE);
      expect(Math.abs(report.required)).toBeGreaterThan(20); expect(report.applied).toBe(0); expect(report.corrected).toBeCloseTo(report.raw!, 5);
    }
    // Include non-bake subframes: zero at anchors alone is insufficient.
    for (let i = 0; i < 40; i++) {
      const time = 0.4 + i * 0.005;
      const actual = sampleClip(rig, result.clip, time); const expected = sampleClip(rig, raw, time);
      expect(actual.angles.rightElbowAngle.value).toBeCloseTo(expected.angles.rightElbowAngle.value!, 4);
      expectSameRotation(actual.pose.find((bone) => bone.name === "mixamorigRightForeArm")!.quaternion, expected.pose.find((bone) => bone.name === "mixamorigRightForeArm")!.quaternion);
    }
  });
  it("preserves original imported quaternion keys and interpolation in zero-only refused native intervals", () => {
    setReference([{ name: "Safe", metrics: [rightMetric()] }, { name: "Unsafe", metrics: [rightMetric(125, 145)] }]);
    const cfg = config({ phases: [
      { name: "Safe", startTime: 3.25, endTime: 3.65 },
      { name: "Unsafe", startTime: 3.65, endTime: 3.85 },
      { name: "After", referenceName: "Safe", startTime: 3.85, endTime: 4.25 },
    ] });
    const rig = boneRig(); const raw = rawClip(rig);
    elbowTrack(raw, [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1], [90, 92, 91, 93, 94, 90, 91]);
    const original = raw.tracks.find((track) => track.name === path("mixamorigRightForeArm"))!;
    // Licensed imports can contain slightly non-unit Float32 quaternions.
    for (let index = 0; index < original.values.length; index++) original.values[index] *= 0.9999;
    const result = bakeMetricCorrectedClip(rig.group, rig.mesh, raw, cfg);
    const baked = result.clip.tracks.find((track) => track.name === original.name)!;
    for (let key = 2; key <= 4; key++) {
      const index = Array.from(baked.times).indexOf(original.times[key]);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(Array.from(baked.values.slice(index * 4, index * 4 + 4))).toEqual(Array.from(original.values.slice(key * 4, key * 4 + 4)));
    }
    for (const time of [0.401, 0.437, 0.499, 0.501, 0.559, 0.599]) {
      expect(sampleClip(rig, result.clip, time).angles.rightElbowAngle.value).toBeCloseTo(sampleClip(rig, raw, time).angles.rightElbowAngle.value!, 6);
    }
  });
  it("uses missing-geometry intervals as hard-zero anchors and eases valid neighboring frames", () => {
    const rig = boneRig(); const raw = rawClip(rig);
    replaceTrack(raw, new THREE.VectorKeyframeTrack(path("mixamorigRightHand", "position"), [0, 0.39, 0.4, 0.6, 0.61, 1],
      [0, 0.3, 0, 0, 0.3, 0, 0, 0, 0, 0, 0, 0, 0, 0.3, 0, 0, 0.3, 0]));
    const result = bakeMetricCorrectedClip(rig.group, rig.mesh, raw, config());
    // Full correction outside the 80 ms fade plus one native-frame zero guard.
    expect(sample(result, 0.25).applied).toBeCloseTo(12, 4);
    expect(sample(result, 0.3).applied).toBeCloseTo(12 * correctionEase((0.4 - 0.3 - 1 / 25) / CORRECTION_EASE_SECONDS), 4);
    expect(Math.abs(sample(result, 0.39).applied)).toBeLessThan(1);
    expect(Math.abs(sample(result, 0.61).applied)).toBeLessThan(1);
    for (const time of [0.41, 0.5, 0.59]) {
      const report = sample(result, time); expect(report.status).toBe("unavailable"); expect(report.applied).toBe(0); expect(report.corrected).toBeNull();
      const actual = sampleClip(rig, result.clip, time); const expected = sampleClip(rig, raw, time);
      expectSameRotation(actual.pose.find((bone) => bone.name === "mixamorigRightForeArm")!.quaternion, expected.pose.find((bone) => bone.name === "mixamorigRightForeArm")!.quaternion);
    }
  });
  it("returns exact off-grid source phase starts and includes those markers and original keys in corrected tracks", () => {
    const boundarySource = 3.587; const cfg = config({ phases: [
      { name: "First", referenceName: "Correct", startTime: 3.25, endTime: boundarySource },
      { name: "Second", referenceName: "Correct", startTime: boundarySource, endTime: 4.25 },
    ] });
    const rig = boneRig(); const raw = rawClip(rig); elbowTrack(raw, [0, 0.4375, 1], [90, 91, 90]);
    const result = bakeMetricCorrectedClip(rig.group, rig.mesh, raw, cfg);
    for (const [phaseIndex, phase] of cfg.phases.entries()) {
      const time = sourceTimeToClipTime(cfg, phase.startTime, raw.duration);
      const marker = correctionAtMarker(result, phaseIndex, "rightElbowAngle", time)!;
      expect(marker).toBeDefined(); expect(marker.clipTime).toBe(time); expect(marker.sourceTime).toBe(phase.startTime); expect(marker.phaseIndex).toBe(phaseIndex);
      expect(marker.corrected).toBeCloseTo(sampleClip(rig, result.clip, time).angles.rightElbowAngle.value!, 4);
      for (const name of result.changedBones) {
        const keys = result.clip.tracks.find((track) => track.name === path(name))!.times;
        // Three stores keys in Float32Arrays; require the exact marker to storage precision.
        expect(Array.from(keys).some((key) => Math.abs(key - time) < 5e-8)).toBe(true);
        expect(Array.from(keys)).toContain(0.4375);
      }
    }
    expect(correctionAtMarker(result, 99, "rightElbowAngle", 0)).toBeUndefined();
    expect(correctionAtMarker(result, 0, "leftElbowAngle", 0)).toBeUndefined();
  });
});
