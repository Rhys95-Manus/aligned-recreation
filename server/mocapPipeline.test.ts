import { describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { DEFAULT_MOCAP_CLIP_ID, getActivePhaseIndex, getMocapClip, mocapClips, sourceTimeToClipTime, validateMocapConfig, type MocapClipConfig } from "../client/src/data/mocapClips";
import { compareAngleToRange, compareMocapPhase, getMocapReference, getMocapReferencePhase, horizontalHipShoulderSeparation, interiorJointAngle, measureMocapAngles, type MocapAngleMeasurements } from "../client/src/lib/mocapAngles";
import { prepareMocapClip, sampleMocapPhaseMarkers } from "../client/src/lib/mocapPipeline";

const qb = getMocapClip(DEFAULT_MOCAP_CLIP_ID)!;
const point = (x: number, y: number, z = 0) => ({ x, y, z });
const measured = (value: number): MocapAngleMeasurements => ({
  rightElbowAngle: { value }, leftElbowAngle: { value },
  rightKneeAngle: { value }, leftKneeAngle: { value },
  hipShoulderSeparation: { value: 37.5 },
});

function boneRig(scale = 1, withReference = false) {
  const group = new THREE.Group();
  const bones: THREE.Bone[] = [];
  const bone = (name: string, parent: THREE.Object3D, x: number, y: number, z = 0) => {
    const node = new THREE.Bone(); node.name = name;
    node.position.set(x * scale, y * scale, z * scale);
    parent.add(node); bones.push(node); return node;
  };
  const root = withReference ? bone("mixamorigReference", group, 0, 0) : group;
  const hips = bone("mixamorigHips", root, 0, 1);
  const spine = bone("mixamorigSpine", hips, 0, 0.25);
  const rArm = bone("mixamorigRightArm", spine, 0.2, 0.3);
  const rForearm = bone("mixamorigRightForeArm", rArm, 0.3, 0);
  bone("mixamorigRightHand", rForearm, 0.3, 0);
  const lArm = bone("mixamorigLeftArm", spine, -0.2, 0.3);
  const lForearm = bone("mixamorigLeftForeArm", lArm, -0.3, 0);
  bone("mixamorigLeftHand", lForearm, -0.3, 0);
  for (const [side, x] of [["Right", 0.1], ["Left", -0.1]] as const) {
    const upLeg = bone(`mixamorig${side}UpLeg`, hips, x, -0.1);
    const leg = bone(`mixamorig${side}Leg`, upLeg, 0, -0.45);
    bone(`mixamorig${side}Foot`, leg, 0, -0.45);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 0.1, 0, 0, 0, 0.1, 0], 3));
  geometry.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(new Array(12).fill(bones.indexOf(hips)), 4));
  geometry.setAttribute("skinWeight", new THREE.Float32BufferAttribute([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], 4));
  const mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshBasicMaterial());
  group.add(mesh); group.updateMatrixWorld(true); mesh.bind(new THREE.Skeleton(bones));
  return { group, bones, mesh };
}

function animatedFixture() {
  const source = boneRig(100, true);
  const target = boneRig();
  const q = (angle: number) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle).toArray();
  source.group.animations = [new THREE.AnimationClip("fixture", 2, [
    new THREE.QuaternionKeyframeTrack("mixamorigRightArm.quaternion", [0, 1, 2], [...q(0), ...q(1), ...q(0)]),
    new THREE.QuaternionKeyframeTrack("mixamorigReference.quaternion", [0, 2], [...q(0), ...q(0)]),
    new THREE.VectorKeyframeTrack("mixamorigHips.position", [0, 2], [0, 100, 0, 20, 100, 0]),
  ])];
  const config: MocapClipConfig = {
    id: "fixture", name: "Fixture", fbxUrl: "fixture.fbx", targetModel: "fixture.glb",
    trimStart: 0.25, trimEnd: 1.25, scale: 0.01, fps: 24,
    phases: [{ name: "First", startTime: 0.25, endTime: 0.75 }, { name: "Second", startTime: 0.75, endTime: 1.25 }],
  };
  return { source, target, config };
}

describe("Mocap clip config and source timeline", () => {
  it("keeps the proven quarterback assets, trim, and unit scale", () => {
    expect(qb.trimStart).toBe(23.33); expect(qb.trimEnd).toBe(25.33); expect(qb.scale).toBe(0.01);
    expect(qb.fbxUrl).toBe("/manus-storage/Football_Quarterback_mixamo_25080ba4.fbx");
    expect(qb.targetModel).toContain("MaleHologram_quant_d74b85d9.glb"); expect(qb.phases).toHaveLength(6);
  });
  it("validates all registry entries and unique ids", () => {
    expect(new Set(mocapClips.map((item) => item.id)).size).toBe(mocapClips.length);
    for (const item of mocapClips) expect(() => validateMocapConfig(item)).not.toThrow();
  });
  it("does not silently fall back for unknown motion ids", () => { expect(getMocapClip("unknown")).toBeUndefined(); });
  it.each([0, -1, Number.NaN])("rejects invalid scale %s", (scale) => { expect(() => validateMocapConfig({ ...qb, scale })).toThrow(); });
  it.each([0, 241, Number.NaN])("rejects invalid fps %s", (fps) => { expect(() => validateMocapConfig({ ...qb, fps })).toThrow(); });
  it("rejects invalid/negative/too-short trim windows", () => {
    expect(() => validateMocapConfig({ ...qb, trimStart: -1 })).toThrow();
    expect(() => validateMocapConfig({ ...qb, trimEnd: 23.34 })).toThrow();
    expect(() => validateMocapConfig({ ...qb, trimEnd: Number.NaN })).toThrow();
  });
  it("rejects overlapping, out-of-window, or duplicate phases", () => {
    expect(() => validateMocapConfig({ ...qb, phases: [{ name: "A", startTime: 23.33, endTime: 24 }, { name: "B", startTime: 23.9, endTime: 24.2 }] })).toThrow();
    expect(() => validateMocapConfig({ ...qb, phases: [{ name: "A", startTime: 23.33, endTime: 26 }] })).toThrow();
    expect(() => validateMocapConfig({ ...qb, phases: [{ name: "A", startTime: 23.33, endTime: 24 }, { name: "A", startTime: 24, endTime: 25 }] })).toThrow();
  });
  it("accepts a new motion and reference-less phases with no viewer code change", () => {
    expect(() => validateMocapConfig({ ...qb, id: "new-motion", referenceKey: undefined, phases: [] })).not.toThrow();
  });
  it("maps absolute source offsets without stretching the 1.96s output", () => {
    expect(sourceTimeToClipTime(qb, 24.17, 1.96)).toBeCloseTo(0.84);
    expect(sourceTimeToClipTime(qb, 25.33, 1.96)).toBe(1.96);
    expect(sourceTimeToClipTime(qb, 20, 1.96)).toBe(0);
  });
  it("assigns a boundary to the next phase and reports gaps explicitly", () => {
    expect(getActivePhaseIndex(qb, 23.60 - qb.trimStart)).toBe(1);
    expect(getActivePhaseIndex(qb, 1.96)).toBe(5);
    expect(getActivePhaseIndex({ ...qb, phases: [] }, 0)).toBe(-1);
  });
});

describe("Geometric interior angles, not local Euler rotations", () => {
  it.each([
    [point(-1, 0), point(0, 0), point(1, 0), 180],
    [point(1, 0), point(0, 0), point(0, 1), 90],
    [point(1, 0), point(0, 0), point(1, 1), 45],
    [point(1, 0), point(0, 0), point(2, 0), 0],
    [point(0, 0, -1), point(0, 0), point(0, 0, 1), 180],
  ])("computes angle ABC correctly", (a, b, c, expected) => { expect(interiorJointAngle(a, b, c)).toBeCloseTo(expected); });
  it("returns unavailable, not 0 degrees, for zero-length or non-finite segments", () => {
    expect(interiorJointAngle(point(0, 0), point(0, 0), point(1, 0))).toBeNull();
    expect(interiorJointAngle(point(Number.NaN, 0), point(0, 0), point(1, 0))).toBeNull();
  });
  it("is invariant under translation, global rotation, and uniform unit scale", () => {
    const transform = new THREE.Matrix4().compose(new THREE.Vector3(100, -4, 3), new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, 0.7, 1.1)), new THREE.Vector3(0.01, 0.01, 0.01));
    const points = [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(), new THREE.Vector3(0, 1, 0)].map((p) => p.applyMatrix4(transform));
    expect(interiorJointAngle(points[0], points[1], points[2])).toBeCloseTo(90);
  });
  it("reads shoulder-elbow-wrist bone WORLD positions including transformed parents", () => {
    const { group, bones } = boneRig(); group.rotation.set(0.1, 0.6, 0.9); group.position.set(5, 4, 3); group.scale.setScalar(0.01);
    const angles = measureMocapAngles(group, bones);
    expect(angles.rightElbowAngle.value).toBeCloseTo(180); expect(angles.leftKneeAngle.value).toBeCloseTo(180);
  });
  it("handles missing bones without crashing or issuing a false out-of-range result", () => {
    const { group, bones } = boneRig();
    const result = measureMocapAngles(group, bones.filter((bone) => bone.name !== "mixamorigRightHand"));
    expect(result.rightElbowAngle.value).toBeNull(); expect(result.rightElbowAngle.reason).toContain("mixamorigRightHand");
  });
  it("normalizes colon-style Mixamo bone names", () => {
    const { group, bones } = boneRig(); bones.forEach((bone) => { bone.name = bone.name.replace("mixamorig", "mixamorig:"); });
    expect(measureMocapAngles(group, bones).rightElbowAngle.value).toBeCloseTo(180);
  });
  it("measures horizontal pelvis/shoulder separation, independently of Euler rotations", () => {
    const a = THREE.MathUtils.degToRad(37.5);
    expect(horizontalHipShoulderSeparation(point(-1, 0), point(1, 0), point(-Math.cos(a), 1, -Math.sin(a)), point(Math.cos(a), 1, Math.sin(a)))).toBeCloseTo(37.5);
  });
  it("does not confuse vertical shoulder tilt with horizontal separation", () => {
    expect(horizontalHipShoulderSeparation(point(-1, 0), point(1, 0), point(-1, 1), point(1, 4))).toBeCloseTo(0);
  });
  it("reports degenerate horizontal axes as unavailable", () => {
    expect(horizontalHipShoulderSeparation(point(0, 0), point(0, 1), point(-1, 1), point(1, 1))).toBeNull();
  });
});

describe("Phase-specific reference comparisons", () => {
  it.each([
    [80, "out-of-range", -5, "below"], [85, "in-range", 0, "inside"],
    [90, "in-range", 0, "inside"], [100, "in-range", 0, "inside"], [115, "out-of-range", 15, "above"],
  ])("compares %s degrees to inclusive 85-100 range", (value, status, difference, direction) => {
    expect(compareAngleToRange(value, 85, 100)).toEqual({ status, difference, direction });
  });
  it("rejects invalid measurements or inverted ranges", () => {
    expect(compareAngleToRange(Number.NaN, 0, 90)).toBeNull(); expect(compareAngleToRange(90, 100, 80)).toBeNull();
  });
  it("reads the exact late-cocking phase, not the flat elbow range", () => {
    const late = qb.phases[2]; const rows = compareMocapPhase(qb, late, measured(105));
    const elbow = rows.find((row) => row.metric.name === "Throwing Elbow Flexion")!;
    expect(elbow.metric.min).toBe(85); expect(elbow.metric.max).toBe(100); expect(elbow.difference).toBe(5); expect(elbow.status).toBe("out-of-range");
    expect(rows.find((row) => row.metric.name === "Hip-Shoulder Separation")!.status).toBe("in-range");
  });
  it("maps flexion and extension labels to the same interior elbow angle", () => {
    const rows = compareMocapPhase(qb, qb.phases[4], measured(175));
    const row = rows.find((item) => item.metric.name === "Throwing Elbow Extension")!;
    expect(row.value).toBe(175); expect(row.status).toBe("in-range");
  });
  it("uses config bindings for handedness and lead/back legs", () => {
    const leftHanded = { ...qb, metricBindings: { ...qb.metricBindings, "Throwing Elbow Flexion": "leftElbowAngle" as const } };
    const values = measured(10); values.leftElbowAngle.value = 90;
    const row = compareMocapPhase(leftHanded, qb.phases[2], values).find((item) => item.metric.name === "Throwing Elbow Flexion")!;
    expect(row.value).toBe(90); expect(row.status).toBe("in-range");
  });
  it("does not fabricate rotation, wrist, weight, or target-line comparisons", () => {
    const rows = compareMocapPhase(qb, qb.phases[4], measured(100));
    for (const name of ["Weight Distribution", "Hip Rotation", "Shoulder Rotation", "Throwing Elbow Alignment", "Wrist Flexion", "Spine Angle"]) {
      const row = rows.find((item) => item.metric.name === name)!;
      expect(row.status).toBe("unavailable"); expect(row.difference).toBeNull(); expect(row.reason).toBeTruthy();
    }
  });
  it("does not fall back when the motion has no reference data", () => {
    const config = { ...qb, referenceKey: "no-such-reference" };
    expect(getMocapReference(config)).toBeUndefined(); expect(compareMocapPhase(config, qb.phases[0], measured(90))).toEqual([]);
  });
  it("does not confuse a flat-only reference with phase data", () => {
    const config = { ...qb, referenceKey: "football-punt" };
    expect(getMocapReference(config)).toBeDefined(); expect(getMocapReferencePhase(config, qb.phases[0])).toBeUndefined();
    expect(compareMocapPhase(config, qb.phases[0], measured(90))).toEqual([]);
  });
  it("does not substitute another phase when the name is unmapped", () => {
    const phase = { ...qb.phases[0], name: "Unknown", referenceName: undefined };
    expect(getMocapReferencePhase(qb, phase)).toBeUndefined(); expect(compareMocapPhase(qb, phase, measured(90))).toEqual([]);
  });
  it("marks a missing geometric measurement unavailable rather than out of range", () => {
    const values = measured(90); values.rightElbowAngle = { value: null, reason: "Missing bone" };
    const row = compareMocapPhase(qb, qb.phases[2], values).find((item) => item.metric.name === "Throwing Elbow Flexion")!;
    expect(row.status).toBe("unavailable"); expect(row.reason).toBe("Missing bone");
  });
});

describe("Reusable retargetClip and marker sampling", () => {
  it("retargets a second configured motion with unit scale and auto-discovered source root", () => {
    const { source, target, config } = animatedFixture();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const original = source.group.animations[0].tracks.map((track) => Array.from(track.values));
    const prepared = prepareMocapClip(target.group, source.group, config);
    expect(prepared.clip.duration).toBeCloseTo(0.96, 1); expect(prepared.missing).toEqual(["mixamorigReference"]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("mixamorigReference"));
    expect(source.group.animations[0].tracks.map((track) => Array.from(track.values))).toEqual(original);
    const mixer = new THREE.AnimationMixer(prepared.targetMesh); const action = mixer.clipAction(prepared.clip).play();
    mixer.setTime(0); const arm = target.bones.find((bone) => bone.name === "mixamorigRightArm")!;
    const first = arm.quaternion.clone(); mixer.setTime(0.5);
    expect(first.angleTo(arm.quaternion)).toBeGreaterThan(0.1);
    expect(target.bones.find((bone) => bone.name === "mixamorigHips")!.position.length()).toBeLessThan(10);
    const seek = (time: number) => { action.paused = false; action.enabled = true; mixer.setTime(time); };
    const reports = sampleMocapPhaseMarkers(target.group, target.bones, config, prepared.clip.duration, seek);
    expect(reports).toHaveLength(2); expect(reports[0].sourceTime).toBe(0.25); expect(reports[1].clipTime).toBe(0.5);
    expect(reports[0].angles.rightElbowAngle.value).toBeCloseTo(180); expect(reports[0].comparisons).toEqual([]);
    expect(reports[0].separationPeak).not.toBeNull(); expect(mixer.time).toBe(0);
    warn.mockRestore();
  });
  it("fails clearly when the source clip is absent", () => {
    const { source, target, config } = animatedFixture(); source.group.animations = [];
    expect(() => prepareMocapClip(target.group, source.group, config)).toThrow("no animation clip");
  });
  it("fails clearly when trim exceeds the source clip", () => {
    const { source, target, config } = animatedFixture();
    expect(() => prepareMocapClip(target.group, source.group, { ...config, trimEnd: 3 })).toThrow("past the source clip");
  });
  it("fails clearly for a configured missing root instead of silent static playback", () => {
    const { source, target, config } = animatedFixture(); const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => prepareMocapClip(target.group, source.group, { ...config, sourceRootBone: "missing" })).toThrow("source root missing");
    warn.mockRestore();
  });
  it("fails clearly when the required hip is missing", () => {
    const { source, target, config } = animatedFixture(); const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => prepareMocapClip(target.group, source.group, { ...config, hipBone: "not-a-hip" })).toThrow("must exist on both rigs");
    warn.mockRestore();
  });
});
