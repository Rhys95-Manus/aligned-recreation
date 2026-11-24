import { afterEach, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { getMocapClip, type MocapClipConfig } from "../client/src/data/mocapClips";
import { professionalReferences } from "../client/src/data/professionalReferences";
import { compareMocapPhase, type MocapAngleId } from "../client/src/lib/mocapAngles";
import {
  createMocapSkeletonOverlay,
  getMocapOverlayFrame,
  layoutMocapOverlayLabels,
  MOCAP_OVERLAY_COLORS,
  MOCAP_OVERLAY_CONNECTIONS,
  MOCAP_OVERLAY_JOINTS,
  projectMocapOverlayPoint,
  type MocapOverlayFrame,
  type MocapSkeletonOverlay,
} from "../client/src/lib/mocapSkeletonOverlay";

const qb = getMocapClip("quarterback-throw")!;
const angleIds: MocapAngleId[] = [
  "rightElbowAngle", "leftElbowAngle", "rightKneeAngle", "leftKneeAngle", "hipShoulderSeparation",
];
const ownedOverlays: MocapSkeletonOverlay[] = [];
afterEach(() => {
  ownedOverlays.splice(0).forEach(overlay => overlay.dispose());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/** Genuine hierarchical bones, not mocked world positions or licensed assets. */
function rigFixture(colonNames = false) {
  const ancestor = new THREE.Group();
  const model = new THREE.Group();
  const armature = new THREE.Group();
  ancestor.add(model);
  model.add(armature);
  const bones: THREE.Bone[] = [];
  const byName = new Map<string, THREE.Bone>();
  const bone = (name: string, parent: THREE.Object3D, x: number, y: number, z = 0) => {
    const node = new THREE.Bone();
    node.name = colonNames ? name.replace("mixamorig", "mixamorig:") : name;
    node.position.set(x, y, z);
    parent.add(node);
    bones.push(node);
    byName.set(name, node);
    return node;
  };
  const reference = bone("mixamorigReference", armature, 0, 0);
  const hips = bone("mixamorigHips", reference, 0, 0);
  const spine = bone("mixamorigSpine", hips, 0, 0.25);
  const spine1 = bone("mixamorigSpine1", spine, 0, 0.25);
  const spine2 = bone("mixamorigSpine2", spine1, 0, 0.25);
  bone("mixamorigNeck", spine2, 0, 0.25);
  for (const [side, sign] of [["Right", 1], ["Left", -1]] as const) {
    const arm = bone(`mixamorig${side}Arm`, spine2, sign * 0.35, 0.1);
    const forearm = bone(`mixamorig${side}ForeArm`, arm, sign * 0.4, 0);
    bone(`mixamorig${side}Hand`, forearm, sign * 0.4, 0);
    const upLeg = bone(`mixamorig${side}UpLeg`, hips, sign * 0.2, -0.1);
    const leg = bone(`mixamorig${side}Leg`, upLeg, 0, -0.45);
    bone(`mixamorig${side}Foot`, leg, 0, -0.45);
  }
  return { ancestor, model, armature, bones, byName };
}
type Rig = ReturnType<typeof rigFixture>;

function elbowAngle(rig: Rig, degrees: number) {
  const forearm = rig.byName.get("mixamorigRightForeArm")!;
  const hand = rig.byName.get("mixamorigRightHand")!;
  forearm.rotation.set(0, 0, 0);
  // Keep exact right-angle and straight endpoints to test inclusive boundaries.
  if (degrees === 90) hand.position.set(0, 0.4, 0);
  else if (degrees === 180) hand.position.set(0.4, 0, 0);
  else {
    const bend = THREE.MathUtils.degToRad(180 - degrees);
    hand.position.set(0.4 * Math.cos(bend), 0.4 * Math.sin(bend), 0);
  }
}
function frameAt(rig: Rig, config = qb, sourceTime = config.phases[2].startTime) {
  return getMocapOverlayFrame(rig.model, rig.bones, config, sourceTime - config.trimStart);
}
function labelFor(frame: MocapOverlayFrame, id: MocapAngleId) {
  return frame.labels.find(label => label.id === id)!;
}
function expectVector(actual: THREE.Vector3, expected: THREE.Vector3) {
  expect(actual.x).toBeCloseTo(expected.x, 6);
  expect(actual.y).toBeCloseTo(expected.y, 6);
  expect(actual.z).toBeCloseTo(expected.z, 6);
}
/** Independently compose local transforms, without reading matrixWorld. */
function expectedWorldOrigin(object: THREE.Object3D) {
  const point = new THREE.Vector3();
  for (let node: THREE.Object3D | null = object; node; node = node.parent) {
    point.multiply(node.scale).applyQuaternion(node.quaternion).add(node.position);
  }
  return point;
}
function localSnapshot(object: THREE.Object3D) {
  return {
    position: object.position.toArray(), quaternion: object.quaternion.toArray(),
    scale: object.scale.toArray(), parent: object.parent, children: [...object.children],
    matrixAutoUpdate: object.matrixAutoUpdate, matrixWorldAutoUpdate: object.matrixWorldAutoUpdate,
  };
}

// Only the DOM operations used by the helper; no jsdom or browser dependency.
class FakeElement {
  readonly style: Record<string, string> = {};
  readonly dataset: Record<string, string> = {};
  readonly attributes = new Map<string, string>();
  readonly children: FakeElement[] = [];
  parentNode: FakeElement | null = null;
  hidden = false;
  textContent = "";
  title = "";
  constructor(readonly tagName: string) {}
  appendChild(child: FakeElement) {
    child.remove();
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  setAttribute(name: string, value: string) { this.attributes.set(name, String(value)); }
  getAttribute(name: string) { return this.attributes.get(name) ?? null; }
  remove() {
    if (!this.parentNode) return;
    const siblings = this.parentNode.children;
    const index = siblings.indexOf(this);
    if (index >= 0) siblings.splice(index, 1);
    this.parentNode = null;
  }
}
function cameraFixture(width = 800, height = 600) {
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  return camera;
}
function overlayFixture() {
  vi.stubGlobal("document", {
    createElement: (name: string) => new FakeElement(name),
    createElementNS: (_namespace: string, name: string) => new FakeElement(name),
  });
  vi.stubGlobal("window", { devicePixelRatio: 2, innerWidth: 800, innerHeight: 600 });
  const scene = new THREE.Scene();
  const callerGroup = new THREE.Group();
  scene.add(callerGroup);
  const container = new FakeElement("div");
  const callerElement = new FakeElement("div");
  container.appendChild(callerElement);
  const overlay = createMocapSkeletonOverlay(scene, container as unknown as HTMLElement);
  ownedOverlays.push(overlay);
  const root = container.children.find(child => child.dataset.mocapSkeletonOverlay === "true")!;
  const svg = root.children.find(child => child.tagName === "svg")!;
  const labels = new Map(root.children.filter(child => child.dataset.mocapAngle)
    .map(child => [child.dataset.mocapAngle as MocapAngleId, child]));
  const lines = overlay.group.children.find(child => child instanceof LineSegments2) as LineSegments2;
  const dots = overlay.group.children.find(child => child instanceof THREE.Points) as THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  return { scene, callerGroup, container, callerElement, overlay, root, svg, labels, lines, dots, camera: cameraFixture() };
}

function expectGeometryFromFrame(lines: LineSegments2, dots: THREE.Points, frame: MocapOverlayFrame) {
  const connections = MOCAP_OVERLAY_CONNECTIONS.filter(([a, b]) => frame.positions.has(a) && frame.positions.has(b));
  expect(lines.geometry.instanceCount).toBe(connections.length);
  const start = lines.geometry.getAttribute("instanceStart");
  const end = lines.geometry.getAttribute("instanceEnd");
  connections.forEach(([a, b], index) => {
    for (const [attribute, point] of [[start, frame.positions.get(a)!], [end, frame.positions.get(b)!]] as const) {
      expectVector(new THREE.Vector3(attribute.getX(index), attribute.getY(index), attribute.getZ(index)), point);
    }
  });
  expect(dots.geometry.drawRange).toEqual({ start: 0, count: frame.positions.size });
  const positions = dots.geometry.getAttribute("position");
  [...frame.positions.values()].forEach((point, index) => {
    expectVector(new THREE.Vector3(positions.getX(index), positions.getY(index), positions.getZ(index)), point);
  });
}

describe("getMocapOverlayFrame: live, read-only world-space skeleton", () => {
  it.each([false, true])("uses actual world positions and canonical map keys (colon names: %s)", colonNames => {
    const rig = rigFixture(colonNames);
    rig.ancestor.position.set(3, -2, 4);
    rig.ancestor.rotation.set(0.15, 0.4, -0.2);
    rig.model.position.set(-1, 2, 0.5);
    rig.model.scale.setScalar(0.01);
    rig.armature.position.set(0.5, -0.25, 1);
    rig.armature.rotation.set(-0.1, 0.2, 0.3);
    const frame = frameAt(rig);
    expect([...frame.positions.keys()]).toEqual([...MOCAP_OVERLAY_JOINTS]);
    expect(frame.positions.has("mixamorigReference")).toBe(false);
    for (const [name, position] of frame.positions) {
      expect(name).not.toContain(":");
      expectVector(position, expectedWorldOrigin(rig.byName.get(name)!));
      expect(position).not.toBe(rig.byName.get(name)!.position);
    }
    for (const id of angleIds.filter(id => id !== "hipShoulderSeparation")) {
      expect(labelFor(frame, id).value).toBeCloseTo(180, 4);
    }
    expect(labelFor(frame, "rightElbowAngle").anchor).toBe(frame.positions.get("mixamorigRightForeArm"));
    expect(labelFor(frame, "hipShoulderSeparation").anchor).toBe(frame.positions.get("mixamorigSpine1"));
  });

  it("re-measures changed bone transforms at the same playback time instead of using saved report values", () => {
    const rig = rigFixture();
    const first = frameAt(rig);
    const oldWrist = first.positions.get("mixamorigRightHand")!.clone();
    elbowAngle(rig, 90);
    rig.byName.get("mixamorigLeftLeg")!.rotation.z = Math.PI / 2;
    rig.byName.get("mixamorigSpine2")!.rotation.y = Math.PI / 6;
    const next = frameAt(rig);
    expect(labelFor(first, "rightElbowAngle").value).toBeCloseTo(180);
    expect(labelFor(next, "rightElbowAngle").value).toBeCloseTo(90);
    expect(labelFor(first, "rightElbowAngle").status).toBe("out-of-range");
    expect(labelFor(next, "rightElbowAngle").status).toBe("in-range");
    expect(labelFor(next, "leftKneeAngle").value).toBeCloseTo(90);
    expect(labelFor(next, "hipShoulderSeparation").value).toBeCloseTo(30);
    expect(next.positions.get("mixamorigRightHand")!.distanceTo(oldWrist)).toBeGreaterThan(0.1);
    expectVector(first.positions.get("mixamorigRightHand")!, oldWrist);
    expectVector(next.positions.get("mixamorigRightHand")!, expectedWorldOrigin(rig.byName.get("mixamorigRightHand")!));
  });

  it("does not edit transforms, hierarchy, bone identities, clips, configuration, or reference ranges", () => {
    const rig = rigFixture(true);
    elbowAngle(rig, 90);
    rig.model.rotation.set(0.1, 0.2, 0.3);
    const clip = new THREE.AnimationClip("fixture", 1, [
      new THREE.VectorKeyframeTrack("mixamorig:RightHand.position", [0, 1], [0, 0.4, 0, 0.4, 0, 0]),
    ]);
    rig.model.animations = [clip];
    const objects = [rig.ancestor, rig.model, rig.armature, ...rig.bones];
    const before = objects.map(localSnapshot);
    const bones = [...rig.bones];
    const animations = rig.model.animations;
    const clipBefore = clip.toJSON();
    const configBefore = JSON.stringify(qb);
    const referenceBefore = JSON.stringify(professionalReferences[qb.referenceKey!]);
    frameAt(rig);
    frameAt(rig, qb, qb.phases[4].startTime);
    objects.forEach((object, index) => expect(localSnapshot(object)).toEqual(before[index]));
    expect(rig.bones).toEqual(bones);
    rig.bones.forEach((bone, index) => expect(bone).toBe(bones[index]));
    expect(rig.model.animations).toBe(animations);
    expect(rig.model.animations[0]).toBe(clip);
    expect(clip.toJSON()).toEqual(clipBefore);
    expect(JSON.stringify(qb)).toBe(configBefore);
    expect(JSON.stringify(professionalReferences[qb.referenceKey!])).toBe(referenceBefore);
  });

  it("never invents missing joints, unavailable values, or anchors from other model objects", () => {
    const rig = rigFixture();
    const missing = new Set(["mixamorigRightForeArm", "mixamorigRightHand", "mixamorigSpine1"]);
    const bones = rig.bones.filter(bone => !missing.has(bone.name));
    const frame = getMocapOverlayFrame(rig.model, bones, qb, qb.phases[2].startTime - qb.trimStart);
    for (const name of missing) expect(frame.positions.has(name)).toBe(false);
    const elbow = labelFor(frame, "rightElbowAngle");
    expect(elbow.value).toBeNull();
    expect(elbow.status).toBe("neutral");
    expect(elbow.ranges).toEqual([]);
    expect(elbow.anchor).toBeUndefined();
    expect(elbow.reason).toContain("Missing bone(s)");
    expect(elbow.reason).toContain("mixamorigRightHand");
    expect(labelFor(frame, "hipShoulderSeparation").anchor).toBe(frame.positions.get("mixamorigSpine"));
    expect(labelFor(frame, "leftElbowAngle").value).toBeCloseTo(180);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])("omits nonfinite joints (%s) rather than fabricating an angle", invalid => {
    const rig = rigFixture();
    rig.byName.get("mixamorigRightHand")!.position.x = invalid;
    const frame = frameAt(rig);
    expect(frame.positions.has("mixamorigRightHand")).toBe(false);
    expect([...frame.positions.values()].every(point => point.toArray().every(Number.isFinite))).toBe(true);
    expect(labelFor(frame, "rightElbowAngle")).toMatchObject({ value: null, status: "neutral", ranges: [] });
    expect(labelFor(frame, "rightElbowAngle").reason).toContain("non-finite");
    expect(labelFor(frame, "leftElbowAngle").value).toBeCloseTo(180);
  });

  it("keeps degenerate zero-length limb measurements neutral while retaining their real finite positions", () => {
    const rig = rigFixture();
    rig.byName.get("mixamorigRightHand")!.position.set(0, 0, 0);
    const frame = frameAt(rig);
    expect(frame.positions.has("mixamorigRightHand")).toBe(true);
    expectVector(frame.positions.get("mixamorigRightHand")!, frame.positions.get("mixamorigRightForeArm")!);
    expect(labelFor(frame, "rightElbowAngle")).toMatchObject({ value: null, status: "neutral", ranges: [] });
    expect(labelFor(frame, "rightElbowAngle").reason).toContain("Degenerate");
  });

  it("returns an empty skeleton with unavailable neutral labels when no bones are supplied", () => {
    const rig = rigFixture();
    const frame = getMocapOverlayFrame(rig.model, [], qb, 0);
    expect(frame.positions.size).toBe(0);
    expect(frame.labels).toHaveLength(5);
    frame.labels.forEach(label => expect(label).toMatchObject({ value: null, status: "neutral", anchor: undefined, ranges: [] }));
  });
});

describe("getMocapOverlayFrame: current phase and exact reference applicability", () => {
  it.each(qb.phases.map((phase, index) => [phase.name, index] as const))("matches compareMocapPhase for the current %s phase", (_name, index) => {
    const rig = rigFixture();
    elbowAngle(rig, 95);
    const phase = qb.phases[index];
    const frame = frameAt(rig, qb, (phase.startTime + phase.endTime) / 2);
    expect(frame.phaseIndex).toBe(index);
    expect(frame.phaseName).toBe(phase.name);
    const comparisons = compareMocapPhase(qb, phase, frame.measurements);
    for (const label of frame.labels) {
      expect(label.value).toBe(frame.measurements[label.id].value);
      const applicable = comparisons.filter(row => row.measurement === label.id && row.status !== "unavailable");
      expect(label.ranges).toEqual(applicable.map(row => ({ name: row.metric.name, min: row.metric.min, max: row.metric.max })));
      const status = !applicable.length ? "neutral" : applicable.some(row => row.status === "out-of-range") ? "out-of-range" : "in-range";
      expect(label.status).toBe(status);
    }
  });

  it("assigns exact transitions to the next phase and gaps to neutral, not the last selected report card", () => {
    const config: MocapClipConfig = {
      ...qb, trimStart: 10, trimEnd: 15,
      phases: [
        { name: "Ready", referenceName: "Neutral / Ready Position", startTime: 10, endTime: 11 },
        { name: "Cocking", referenceName: "Late Cocking / Max Torque", startTime: 11, endTime: 12 },
        { name: "Release", referenceName: "Acceleration / Release", startTime: 13, endTime: 15 },
      ],
    };
    const rig = rigFixture();
    elbowAngle(rig, 110);
    const ready = frameAt(rig, config, 10.5);
    expect(labelFor(ready, "rightElbowAngle").status).toBe("in-range");
    const cases: [number, number, string | null][] = [
      [-0.001, -1, null], [0, 0, "Ready"], [0.999999, 0, "Ready"],
      [1, 1, "Cocking"], [1.999999, 1, "Cocking"], [2, -1, null],
      [2.5, -1, null], [3, 2, "Release"], [5, 2, "Release"], [5.000001, -1, null],
    ];
    for (const [clipTime, index, name] of cases) {
      const frame = getMocapOverlayFrame(rig.model, rig.bones, config, clipTime);
      expect(frame.phaseIndex).toBe(index);
      expect(frame.phaseName).toBe(name);
      if (index === -1) frame.labels.forEach(label => expect(label).toMatchObject({ status: "neutral", ranges: [] }));
      else expect(labelFor(frame, "rightElbowAngle").status).toBe(index === 1 ? "out-of-range" : "in-range");
    }
    expect(ready.phaseName).toBe("Ready");
    expect(labelFor(ready, "rightElbowAngle").status).toBe("in-range");
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])("makes invalid playback time %s neutral", clipTime => {
    const rig = rigFixture();
    const frame = getMocapOverlayFrame(rig.model, rig.bones, qb, clipTime);
    expect(frame.phaseIndex).toBe(-1);
    expect(frame.phaseName).toBeNull();
    frame.labels.forEach(label => expect(label).toMatchObject({ status: "neutral", ranges: [] }));
    expect(labelFor(frame, "rightElbowAngle").value).toBeCloseTo(180);
  });

  it("does not force the quarterback release benchmark onto acceleration", () => {
    const rig = rigFixture();
    elbowAngle(rig, 90);
    const acceleration = frameAt(rig, qb, qb.phases[3].startTime);
    expect(acceleration.phaseName).toBe("Acceleration");
    acceleration.labels.forEach(label => expect(label).toMatchObject({ status: "neutral", ranges: [] }));
    const release = frameAt(rig, qb, qb.phases[4].startTime);
    expect(labelFor(release, "rightElbowAngle")).toMatchObject({ value: 90, status: "in-range", ranges: [{ name: "Throwing Elbow Extension", min: 90, max: 180 }] });
  });

  it.each([90, 180])("includes the exact release elbow reference boundary %s", degrees => {
    const rig = rigFixture();
    elbowAngle(rig, degrees);
    const label = labelFor(frameAt(rig, qb, qb.phases[4].startTime), "rightElbowAngle");
    expect(label.value).toBe(degrees);
    expect(label.status).toBe("in-range");
    elbowAngle(rig, 89);
    expect(labelFor(frameAt(rig, qb, qb.phases[4].startTime), "rightElbowAngle").status).toBe("out-of-range");
  });

  it("turns a multiply-bound label red if any assigned applicable range fails", () => {
    const rig = rigFixture();
    elbowAngle(rig, 75);
    const config: MocapClipConfig = { ...qb, metricBindings: { ...qb.metricBindings, "Non-Throwing Elbow Flexion": "rightElbowAngle" } };
    const label = labelFor(frameAt(rig, config, config.phases[0].startTime), "rightElbowAngle");
    expect(label.ranges).toEqual([
      { name: "Throwing Elbow Flexion", min: 80, max: 120 },
      { name: "Non-Throwing Elbow Flexion", min: 70, max: 120 },
    ]);
    expect(label.status).toBe("out-of-range");
  });

  it("uses only exact, explicitly opted-in unverified flat metrics at their assigned checkpoints", () => {
    const rig = rigFixture();
    elbowAngle(rig, 90);
    const config = getMocapClip("baseball-fastball")!;
    expect(professionalReferences[config.referenceKey!].verificationLevel).toBe("unverified");
    const cocking = config.phases.find(phase => phase.name === "Max Cocking")!;
    const explicit = labelFor(frameAt(rig, config, cocking.startTime), "rightElbowAngle");
    expect(explicit.status).toBe("in-range");
    expect(explicit.ranges).toEqual([{ name: "Elbow Flexion", min: 80, max: 110 }]);
    expect(labelFor(frameAt(rig, config, config.phases[0].startTime), "rightElbowAngle")).toMatchObject({ status: "neutral", ranges: [] });
    const variants: MocapClipConfig[] = [
      { ...config, phases: config.phases.map(phase => phase === cocking ? { ...phase, referenceMetrics: undefined } : phase) },
      { ...config, phases: config.phases.map(phase => phase === cocking ? { ...phase, referenceMetrics: ["elbow flexion", "Elbow Flexion "] } : phase) },
      { ...config, referenceKey: "BASEBALL-fastball" },
    ];
    for (const variant of variants) {
      expect(labelFor(frameAt(rig, variant, cocking.startTime), "rightElbowAngle")).toMatchObject({ value: 90, status: "neutral", ranges: [] });
    }
  });

  it("does not carry the tennis trophy elbow range to the overhead contact proxy", () => {
    const rig = rigFixture();
    elbowAngle(rig, 90);
    const tennis = getMocapClip("tennis-serve")!;
    const trophy = tennis.phases.find(phase => phase.name === "Trophy-Like Preparation")!;
    const contact = tennis.phases.find(phase => phase.name === "Overhead Stroke Proxy")!;
    expect(labelFor(frameAt(rig, tennis, trophy.startTime), "rightElbowAngle").ranges).toEqual([{ name: "Elbow Flexion", min: 85, max: 115 }]);
    const label = labelFor(frameAt(rig, tennis, contact.startTime), "rightElbowAngle");
    expect(label).toMatchObject({ value: 90, status: "neutral", ranges: [] });
    expect(label.reason).toContain("No applicable bound reference for the current phase");
  });
});

describe("projectMocapOverlayPoint", () => {
  it("returns CSS-pixel coordinates, preserves inputs, and follows camera orbit changes", () => {
    const width = 800, height = 400;
    const camera = cameraFixture(width, height);
    camera.fov = 90;
    camera.updateProjectionMatrix();
    const point = new THREE.Vector3(1, 1, 0);
    const before = point.toArray();
    const cameraBefore = localSnapshot(camera);
    const projected = projectMocapOverlayPoint(point, camera, width, height)!;
    expect(projected.x).toBeCloseTo((1 + 1 / (5 * camera.aspect)) * width / 2);
    expect(projected.y).toBeCloseTo((1 - 1 / 5) * height / 2);
    expect(projectMocapOverlayPoint(new THREE.Vector3(), camera, width, height)).toEqual({ x: width / 2, y: height / 2 });
    expect(point.toArray()).toEqual(before);
    expect(localSnapshot(camera)).toEqual(cameraBefore);
    camera.position.set(5, 0, 0);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld(true);
    const orbit = projectMocapOverlayPoint(point, camera, width, height)!;
    const ndc = point.clone().project(camera);
    expect(orbit.x).toBeCloseTo((ndc.x + 1) * width / 2);
    expect(orbit.y).toBeCloseTo((1 - ndc.y) * height / 2);
    expect(orbit.x).not.toBeCloseTo(projected.x);
    expect(orbit.y).not.toBeCloseTo(projected.y);
    expect(point.toArray()).toEqual(before);
  });

  it.each([
    [100, 0, 0], [0, 100, 0], [-100, 0, 0], [0, -100, 0],
    [0, 0, 6], [0, 0, 4.95], [0, 0, -200], [Number.NaN, 0, 0], [0, Number.POSITIVE_INFINITY, 0],
  ])("rejects offscreen, behind, clipped, or nonfinite anchor (%s, %s, %s)", (x, y, z) => {
    expect(projectMocapOverlayPoint(new THREE.Vector3(x, y, z), cameraFixture(), 800, 600)).toBeNull();
  });

  it.each([[0, 600], [800, 0], [-1, 600], [800, -1], [Number.NaN, 600], [800, Number.POSITIVE_INFINITY]])("rejects invalid viewport %s × %s", (width, height) => {
    expect(projectMocapOverlayPoint(new THREE.Vector3(), cameraFixture(), width, height)).toBeNull();
  });

  it("includes viewport edges and rejects nonfinite camera projection output", () => {
    const camera = new THREE.OrthographicCamera(-2, 2, 1, -1, 0.1, 10);
    camera.position.set(0, 0, 5);
    camera.updateMatrixWorld(true);
    expect(projectMocapOverlayPoint(new THREE.Vector3(2, 1, 0), camera, 800, 400)).toEqual({ x: 800, y: 0 });
    expect(projectMocapOverlayPoint(new THREE.Vector3(-2, -1, 0), camera, 800, 400)).toEqual({ x: 0, y: 400 });
    camera.projectionMatrix.elements.fill(Number.NaN);
    expect(projectMocapOverlayPoint(new THREE.Vector3(), camera, 800, 400)).toBeNull();
  });
});

describe("layoutMocapOverlayLabels", () => {
  it.each([[160, 200], [960, 540]])("keeps overlapping callouts separated and inside a %s × %s CSS viewport", (width, height) => {
    const points = angleIds.map(id => ({ id, x: width / 2, y: height / 2 }));
    const before = points.map(point => ({ ...point }));
    const labels = layoutMocapOverlayLabels(points, width, height);
    expect(labels).toHaveLength(points.length);
    labels.forEach((label, index) => {
      expect(label).toMatchObject(points[index]);
      expect(label.left).toBeGreaterThanOrEqual(8);
      expect(label.top).toBeGreaterThanOrEqual(8);
      expect(label.left + label.width).toBeLessThanOrEqual(width - 8);
      expect(label.top + label.height).toBeLessThanOrEqual(height - 8);
      for (const other of labels.slice(0, index)) {
        const separated = label.left >= other.left + other.width + 5 || other.left >= label.left + label.width + 5
          || label.top >= other.top + other.height + 5 || other.top >= label.top + label.height + 5;
        expect(separated).toBe(true);
      }
    });
    expect(points).toEqual(before);
  });

  it("clamps callout rectangles at viewport corners without changing their joint tether coordinates", () => {
    const points = [
      { id: "leftElbowAngle" as const, x: 0, y: 0 },
      { id: "rightKneeAngle" as const, x: 240, y: 180 },
    ];
    const labels = layoutMocapOverlayLabels(points, 240, 180);
    labels.forEach((label, index) => {
      expect(label).toMatchObject(points[index]);
      expect(label.left).toBeGreaterThanOrEqual(8);
      expect(label.top).toBeGreaterThanOrEqual(8);
      expect(label.left + label.width).toBeLessThanOrEqual(232);
      expect(label.top + label.height).toBeLessThanOrEqual(172);
    });
    expect(layoutMocapOverlayLabels([{ id: "rightElbowAngle", x: 16, y: 16 }], 32, 32))
      .toEqual([{ id: "rightElbowAngle", x: 16, y: 16, left: 8, top: 8, width: 16, height: 16 }]);
  });

  it("ignores nonfinite anchors and unusable viewports", () => {
    const points = [
      { id: "rightElbowAngle" as const, x: Number.NaN, y: 100 },
      { id: "leftElbowAngle" as const, x: 100, y: Number.POSITIVE_INFINITY },
      { id: "rightKneeAngle" as const, x: 100, y: 100 },
    ];
    expect(layoutMocapOverlayLabels(points, 300, 200).map(label => label.id)).toEqual(["rightKneeAngle"]);
    for (const [width, height] of [[31, 200], [300, 31], [Number.NaN, 200], [300, Number.POSITIVE_INFINITY]]) {
      expect(layoutMocapOverlayLabels(points, width, height)).toEqual([]);
    }
  });
});

describe("createMocapSkeletonOverlay lifecycle with a minimal fake DOM", () => {
  it("creates two-pixel always-on-top green lines and a round six-pixel point shader", () => {
    const { scene, overlay, root, labels, lines, dots } = overlayFixture();
    expect(scene.children).toContain(overlay.group);
    expect(overlay.group.name).toBe("mocap_live_skeleton_overlay");
    expect(overlay.group.children).toHaveLength(2);
    expect(lines.material).toBeInstanceOf(LineMaterial);
    expect(lines.material.linewidth).toBe(2);
    expect(lines.material.color.getHex()).toBe(0x00ff00);
    for (const object of [lines, dots]) {
      expect(object.material.depthTest).toBe(false);
      expect(object.material.depthWrite).toBe(false);
      expect(object.material.toneMapped).toBe(false);
      expect(object.frustumCulled).toBe(false);
      expect(object.renderOrder).toBeGreaterThanOrEqual(1000);
    }
    expect(dots.renderOrder).toBeGreaterThan(lines.renderOrder);
    expect(dots.material.vertexShader).toMatch(/gl_PointSize\s*=\s*6\.0/);
    expect(dots.material.fragmentShader).toMatch(/length\(gl_PointCoord\s*-\s*vec2\(0\.5\)\)\s*>\s*0\.5\)\s*discard/);
    expect(lines.geometry.instanceCount).toBe(0);
    expect(dots.geometry.drawRange.count).toBe(0);
    expect(root.style.pointerEvents).toBe("none");
    expect(root.getAttribute("aria-label")).toContain("world-space");
    expect([...labels.keys()]).toEqual(angleIds);
  });

  it("updates line and dot draw counts and buffer coordinates from only actually available world positions", () => {
    const { overlay, lines, dots, camera } = overlayFixture();
    const rig = rigFixture(true);
    rig.model.position.set(0.4, -0.2, 0.3);
    rig.model.rotation.set(0.1, 0.2, -0.3);
    const full = frameAt(rig);
    overlay.update(full, camera, 800, 600);
    expectGeometryFromFrame(lines, dots, full);
    expect(lines.material.resolution.toArray()).toEqual([800, 600]);
    const omitted = new Set(["mixamorig:RightHand", "mixamorig:LeftLeg", "mixamorig:Spine1"]);
    rig.byName.get("mixamorigRightFoot")!.position.x = Number.NaN;
    const partial = getMocapOverlayFrame(rig.model, rig.bones.filter(bone => !omitted.has(bone.name)), qb, 0);
    overlay.update(partial, camera, 320, 240);
    expectGeometryFromFrame(lines, dots, partial);
    expect(lines.geometry.instanceCount).toBeLessThan(MOCAP_OVERLAY_CONNECTIONS.length);
    expect(dots.geometry.drawRange.count).toBeLessThan(MOCAP_OVERLAY_JOINTS.length);
    expect(lines.material.resolution.toArray()).toEqual([320, 240]);
    const empty = getMocapOverlayFrame(rig.model, [], qb, 0);
    overlay.update(empty, camera, 320, 240);
    expectGeometryFromFrame(lines, dots, empty);
  });

  it("puts actual live values, range status, phase, references, and accessible descriptions in DOM labels", () => {
    const { overlay, root, svg, labels, camera } = overlayFixture();
    const rig = rigFixture();
    elbowAngle(rig, 90);
    const frame = frameAt(rig);
    overlay.update(frame, camera, 800, 600);
    expect(root.dataset.phase).toBe(frame.phaseName);
    frame.labels.forEach((state, index) => {
      const label = labels.get(state.id)!;
      expect(label.dataset.value).toBe(state.value!.toFixed(6));
      expect(label.dataset.status).toBe(state.status);
      expect(label.dataset.phase).toBe(frame.phaseName);
      expect(label.dataset.reference).toBe(state.ranges.map(range => `${range.min}–${range.max}°`).join("; "));
      expect(label.textContent).toBe(`${state.name} ${state.value!.toFixed(1)}°`);
      expect(label.style.display).toBe("flex");
      expect(label.style.color).toBe(MOCAP_OVERLAY_COLORS[state.status]);
      expect(label.style.borderColor).toBe(MOCAP_OVERLAY_COLORS[state.status]);
      expect(label.title).toContain(state.reason);
      expect(label.getAttribute("aria-label")).toBe(label.title);
      const projected = projectMocapOverlayPoint(state.anchor!, camera, 800, 600)!;
      const tether = svg.children[index];
      expect(Number(tether.getAttribute("x1"))).toBeCloseTo(projected.x);
      expect(Number(tether.getAttribute("y1"))).toBeCloseTo(projected.y);
      expect(tether.getAttribute("stroke")).toBe(MOCAP_OVERLAY_COLORS[state.status]);
    });
    expect(labels.get("rightElbowAngle")!.dataset.status).toBe("in-range");
    expect(labels.get("leftElbowAngle")!.dataset.status).toBe("out-of-range");
    elbowAngle(rig, 180);
    const acceleration = frameAt(rig, qb, qb.phases[3].startTime);
    overlay.update(acceleration, camera, 800, 600);
    expect(root.dataset.phase).toBe("Acceleration");
    expect(labels.get("rightElbowAngle")!.dataset).toMatchObject({ value: "180.000000", status: "neutral", phase: "Acceleration", reference: "" });
  });

  it("hides unavailable or offscreen labels and tethers without inventing DOM values", () => {
    const { overlay, labels, svg, camera } = overlayFixture();
    const rig = rigFixture();
    const valid = frameAt(rig);
    overlay.update(valid, camera, 800, 600);
    const missing = getMocapOverlayFrame(rig.model, rig.bones.filter(bone => bone.name !== "mixamorigRightHand"), qb, 0);
    overlay.update(missing, camera, 800, 600);
    const elbow = labels.get("rightElbowAngle")!;
    expect(elbow.style.display).toBe("none");
    expect(svg.children[0].style.display).toBe("none");
    expect(elbow.dataset).toMatchObject({ value: "", status: "neutral", reference: "" });
    expect(elbow.textContent).toBe("R elbow —");
    camera.position.set(0, 0, -5);
    camera.lookAt(0, 0, -10);
    camera.updateMatrixWorld(true);
    overlay.update(valid, camera, 800, 600);
    for (const label of labels.values()) expect(label.style.display).toBe("none");
    svg.children.forEach(tether => expect(tether.style.display).toBe("none"));
    expect(elbow.dataset.value).toBe(valid.measurements.rightElbowAngle.value!.toFixed(6));
  });

  it("hides and shows both 3D and DOM, skips hidden updates, and renders the latest frame on the next visible update", () => {
    const { overlay, root, labels, lines, dots, camera } = overlayFixture();
    const rig = rigFixture();
    const first = frameAt(rig);
    overlay.update(first, camera, 800, 600);
    const bufferVersion = dots.geometry.getAttribute("position").version;
    const oldCoordinates = Array.from(dots.geometry.getAttribute("position").array);
    const oldDataset = { ...labels.get("rightElbowAngle")!.dataset };
    overlay.setVisible(false);
    expect(overlay.group.visible).toBe(false);
    expect(root.hidden).toBe(true);
    elbowAngle(rig, 90);
    const next = frameAt(rig, qb, qb.phases[4].startTime);
    overlay.update(next, camera, 640, 480);
    expect(dots.geometry.getAttribute("position").version).toBe(bufferVersion);
    expect(Array.from(dots.geometry.getAttribute("position").array)).toEqual(oldCoordinates);
    expect(lines.material.resolution.toArray()).toEqual([800, 600]);
    expect(labels.get("rightElbowAngle")!.dataset).toEqual(oldDataset);
    overlay.setVisible(true);
    expect(overlay.group.visible).toBe(true);
    expect(root.hidden).toBe(false);
    overlay.update(next, camera, 640, 480);
    expectGeometryFromFrame(lines, dots, next);
    expect(dots.geometry.getAttribute("position").version).toBeGreaterThan(bufferVersion);
    expect(labels.get("rightElbowAngle")!.dataset).toMatchObject({ value: "90.000000", status: "in-range", phase: "Release" });
    expect(labels.get("rightElbowAngle")!.style.display).toBe("flex");
    expect(lines.material.resolution.toArray()).toEqual([640, 480]);
  });

  it("disposes owned resources once, removes group and DOM, preserves caller objects, and ignores updates after disposal", () => {
    const { scene, callerGroup, container, callerElement, overlay, root, lines, dots, camera } = overlayFixture();
    const rig = rigFixture();
    const frame = frameAt(rig);
    overlay.update(frame, camera, 800, 600);
    const disposeSpies = [lines.geometry, lines.material, dots.geometry, dots.material].map(resource => vi.spyOn(resource, "dispose"));
    const rootRemove = vi.spyOn(root, "remove");
    const version = dots.geometry.getAttribute("position").version;
    const phase = root.dataset.phase;
    overlay.dispose();
    overlay.dispose();
    expect(overlay.group.parent).toBeNull();
    expect(scene.children).toEqual([callerGroup]);
    expect(root.parentNode).toBeNull();
    expect(container.children).toEqual([callerElement]);
    disposeSpies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
    expect(rootRemove).toHaveBeenCalledTimes(1);
    expect(() => overlay.update(frameAt(rig, qb, qb.phases[4].startTime), camera, 320, 240)).not.toThrow();
    expect(dots.geometry.getAttribute("position").version).toBe(version);
    expect(root.dataset.phase).toBe(phase);
    expect(container.children).toEqual([callerElement]);
  });
});
