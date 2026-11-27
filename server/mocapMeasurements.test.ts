import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { mocapClips } from "../client/src/data/mocapClips";
import { measureMocapAngles } from "../client/src/lib/mocapAngles";
import {
  createMocapMeasurementBaseline, measureMocapMeasurements,
  type MocapMeasurementBaseline, type MocapMeasurements,
} from "../client/src/lib/mocapMeasurements";

// All expected values below describe synthetic geometry, NOT observed mocap data.
// Serial Bone hierarchies deliberately exercise both local and world transforms.
function fixture() {
  const model = new THREE.Group();
  const ancestor = new THREE.Group(); ancestor.add(model);
  const bones: THREE.Bone[] = [];
  const add = (name: string, parent: THREE.Object3D, x: number, y: number, z = 0) => {
    const bone = new THREE.Bone(); bone.name = name; bone.position.set(x, y, z);
    parent.add(bone); bones.push(bone); return bone;
  };
  const hips = add("mixamorigHips", model, 0, 1);
  const spine = add("mixamorigSpine", hips, 0, 0.8);
  for (const [side, sign] of [["Left", -1], ["Right", 1]] as const) {
    const arm = add(`mixamorig${side}Arm`, spine, sign * 0.3, 0.2);
    const elbow = add(`mixamorig${side}ForeArm`, arm, sign * 0.4, 0);
    add(`mixamorig${side}Hand`, elbow, 0, 0.3);
    const hip = add(`mixamorig${side}UpLeg`, hips, sign * 0.2, 0);
    const knee = add(`mixamorig${side}Leg`, hip, 0, -0.5);
    add(`mixamorig${side}Foot`, knee, 0, -0.5);
  }
  const bone = (name: string) => bones.find(item => item.name.replace(/:/g, "") === name)!;
  return { model, ancestor, bones, bone, hips, spine };
}
type Fixture = ReturnType<typeof fixture>;
const radians = THREE.MathUtils.degToRad;
const yawQuaternion = (degrees: number) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -radians(degrees));
function measure(rig: Fixture, baseline = createMocapMeasurementBaseline(rig.model, rig.bones), leadSide: "left" | "right" | undefined = "left", throwingSide: "left" | "right" | undefined = "right") {
  return measureMocapMeasurements(rig.model, rig.bones, baseline, leadSide, throwingSide);
}
function setWorld(rig: Fixture, name: string, point: THREE.Vector3) {
  rig.model.updateWorldMatrix(true, true);
  const bone = rig.bone(name);
  bone.position.copy(bone.parent!.worldToLocal(point.clone()));
}
function setHorizontalAxis(rig: Fixture, leftName: string, rightName: string, yawDegrees: number) {
  rig.model.updateWorldMatrix(true, true);
  const left = rig.bone(leftName).getWorldPosition(new THREE.Vector3());
  const right = rig.bone(rightName).getWorldPosition(new THREE.Vector3());
  const center = left.clone().add(right).multiplyScalar(0.5);
  const halfLength = left.distanceTo(right) * 0.5;
  const halfAxis = new THREE.Vector3(Math.cos(radians(yawDegrees)), 0, Math.sin(radians(yawDegrees))).multiplyScalar(halfLength);
  setWorld(rig, leftName, center.clone().sub(halfAxis));
  setWorld(rig, rightName, center.clone().add(halfAxis));
}
function setStance(rig: Fixture, pelvisX: number, backX = 0, leadX = 1, backY = 0, leadY = 0) {
  setWorld(rig, "mixamorigLeftUpLeg", new THREE.Vector3(pelvisX - 0.2, 1, 0));
  setWorld(rig, "mixamorigRightUpLeg", new THREE.Vector3(pelvisX + 0.2, 1, 0));
  setWorld(rig, "mixamorigRightFoot", new THREE.Vector3(backX, backY, 0));
  setWorld(rig, "mixamorigLeftFoot", new THREE.Vector3(leadX, leadY, 0));
}
function localSnapshot(rig: Fixture) {
  return [rig.ancestor, rig.model, ...rig.bones].map(object => ({
    uuid: object.uuid, name: object.name, parent: object.parent?.uuid,
    children: object.children.map(child => child.uuid),
    position: object.position.toArray(), quaternion: object.quaternion.toArray(),
    rotation: object.rotation.toArray(), scale: object.scale.toArray(),
  }));
}
function expectCloseMeasurements(actual: MocapMeasurements, expected: MocapMeasurements) {
  for (const id of Object.keys(expected) as (keyof MocapMeasurements)[]) {
    if (expected[id].value === null) expect(actual[id]).toEqual(expected[id]);
    else expect(actual[id].value, id).toBeCloseTo(expected[id].value!, 8);
  }
}

// Adjust the wrist's local position; the upper arm remains horizontal and trunk up.
// Interior elbow angle beta means forearm.x = -cos(beta) for the right arm.
function rightForearm(rig: Fixture, beta: number, axial: number) {
  const length = 0.3;
  rig.bone("mixamorigRightHand").position.set(
    -length * Math.cos(radians(beta)),
    length * Math.sin(radians(beta)) * Math.cos(radians(axial)),
    length * Math.sin(radians(beta)) * Math.sin(radians(axial)),
  );
}

describe("Read-only world-position measurements", () => {
  it("preserves every existing measurement exactly", () => {
    const rig = fixture(); rig.ancestor.rotation.set(0.2, -0.4, 0.1); rig.ancestor.scale.setScalar(0.4);
    rig.spine.rotation.y = 0.3;
    const result = measure(rig); const legacy = measureMocapAngles(rig.model, rig.bones);
    for (const id of Object.keys(legacy) as (keyof typeof legacy)[]) expect(result[id]).toEqual(legacy[id]);
  });
  it("updates transformed ancestors and descendants and uses world axes rather than local Euler angles", () => {
    const rig = fixture();
    rig.ancestor.position.set(12, -5, 9); rig.ancestor.rotation.set(0, -radians(20), 0); rig.ancestor.scale.setScalar(0.5);
    rig.model.rotation.y = -radians(15);
    const baseline = createMocapMeasurementBaseline(rig.model, rig.bones);
    expect(baseline.pelvisYaw).toBeCloseTo(radians(35), 10);
    rig.hips.rotation.y = -radians(10); rig.spine.rotation.y = -radians(25);
    const result = measure(rig, baseline);
    expect(result.hipRotation.value).toBeCloseTo(10, 8);
    expect(result.shoulderTurn.value).toBeCloseTo(35, 8);
    expect(result.trunkTilt.value).toBeCloseTo(0, 8);
    expect(result.rightShoulderExternalRotationProxy.value).toBeCloseTo(0, 8);
    rig.ancestor.rotation.z = radians(30);
    expect(measure(rig, baseline).trunkTilt.value).toBeCloseTo(30, 8);
  });
  it("is invariant to common translation, including rotations, tilt, stance projection and axial proxy", () => {
    const rig = fixture(); rig.spine.rotation.y = -radians(15); rightForearm(rig, 90, 65);
    const baseline = createMocapMeasurementBaseline(rig.model, rig.bones);
    rig.hips.rotation.y = -radians(20);
    const before = measure(rig, baseline);
    rig.ancestor.position.set(30, -15, 50);
    expectCloseMeasurements(measure(rig, baseline), before);
    expect(createMocapMeasurementBaseline(rig.model, rig.bones).pelvisYaw).toBeCloseTo(radians(20), 8);
  });
  it("recognizes colon-style Mixamo names for baseline, new and existing quantities", () => {
    const rig = fixture(); rig.spine.rotation.y = -radians(20); rightForearm(rig, 90, 40);
    const before = measure(rig);
    rig.bones.forEach(bone => { bone.name = bone.name.replace("mixamorig", "mixamorig:"); });
    expectCloseMeasurements(measure(rig), before);
  });
  it("does not mutate local transforms, skeleton structure, bone arrays, or the numeric baseline", () => {
    const rig = fixture(); rig.ancestor.rotation.y = 0.4; rig.spine.rotation.y = 0.2;
    const baseline = createMocapMeasurementBaseline(rig.model, rig.bones);
    const frozenBaseline = Object.freeze({ ...baseline });
    const frozenBones = Object.freeze([...rig.bones]);
    const before = localSnapshot(rig);
    createMocapMeasurementBaseline(rig.model, frozenBones);
    measureMocapMeasurements(rig.model, frozenBones, frozenBaseline, "left", "right");
    expect(localSnapshot(rig)).toEqual(before);
    expect(frozenBones).toEqual(rig.bones); expect(frozenBaseline).toEqual(baseline);
  });
});

describe("First RAW trimmed-frame pelvis zero and signed turns", () => {
  it("keeps the first animation-frame baseline stable across later frames and correction-like spine edits", () => {
    const rig = fixture();
    const raw = new THREE.AnimationClip("synthetic raw trimmed clip", 1, [
      new THREE.QuaternionKeyframeTrack(".bones[mixamorigHips].quaternion", [0, 1], [...yawQuaternion(20).toArray(), ...yawQuaternion(50).toArray()]),
    ]);
    // AnimationMixer can resolve a Bone via an attached Skeleton without skin data.
    const mesh = new THREE.SkinnedMesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial());
    mesh.skeleton = new THREE.Skeleton(rig.bones); rig.model.add(mesh);
    const mixer = new THREE.AnimationMixer(mesh);
    const action = mixer.clipAction(raw).setLoop(THREE.LoopOnce, 1); action.clampWhenFinished = true; action.play();
    rig.spine.quaternion.copy(yawQuaternion(25)); mixer.setTime(0);
    const baseline = createMocapMeasurementBaseline(rig.model, rig.bones);
    const baselineValue = baseline.pelvisYaw;
    expect(baselineValue).toBeCloseTo(radians(20), 6);
    expect(measure(rig, baseline).hipRotation.value).toBeCloseTo(0, 6);
    expect(measure(rig, baseline).shoulderTurn.value).toBeCloseTo(25, 6);
    mixer.setTime(1);
    const later = measure(rig, baseline);
    // QuaternionKeyframeTrack stores Float32 values: degree error is about 2e-6.
    expect(later.hipRotation.value).toBeCloseTo(30, 5);
    expect(later.shoulderTurn.value).toBeCloseTo(55, 5);
    // Test-only transform edits mimic a correction snapshot; never replace the raw baseline.
    rig.spine.quaternion.copy(yawQuaternion(35));
    expect(measure(rig, baseline).hipRotation.value).toBeCloseTo(30, 5);
    expect(measure(rig, baseline).shoulderTurn.value).toBeCloseTo(65, 5);
    expect(baseline.pelvisYaw).toBe(baselineValue);
    mixer.setTime(0); rig.spine.quaternion.copy(yawQuaternion(25));
    expect(measure(rig, baseline).shoulderTurn.value).toBeCloseTo(25, 6);
    mixer.stopAllAction(); mixer.uncacheClip(raw);
  });
  it.each([[170, -170, 20], [-170, 170, -20], [0, 180, -180], [0, -180, -180], [30, 70, 40], [30, -10, -40]])(
    "wraps from baseline %s° to %s° into %s° using atan2(z,x) sign",
    (initial, current, expected) => {
      const rig = fixture(); rig.model.quaternion.copy(yawQuaternion(initial));
      const baseline = createMocapMeasurementBaseline(rig.model, rig.bones);
      rig.model.quaternion.copy(yawQuaternion(current));
      const result = measure(rig, baseline);
      expect(result.hipRotation.value).toBeCloseTo(expected, 8);
      expect(result.shoulderTurn.value).toBeCloseTo(expected, 8);
      expect(result.hipRotation.value!).toBeGreaterThanOrEqual(-180);
      expect(result.hipRotation.value!).toBeLessThan(180);
    },
  );
  it("uses the first pelvis zero for shoulders, not the first shoulder axis or current pelvis", () => {
    const rig = fixture();
    setHorizontalAxis(rig, "mixamorigLeftUpLeg", "mixamorigRightUpLeg", 30);
    setHorizontalAxis(rig, "mixamorigLeftArm", "mixamorigRightArm", 70);
    const baseline = createMocapMeasurementBaseline(rig.model, rig.bones);
    expect(measure(rig, baseline).shoulderTurn.value).toBeCloseTo(40, 8);
    setHorizontalAxis(rig, "mixamorigLeftUpLeg", "mixamorigRightUpLeg", 50);
    setHorizontalAxis(rig, "mixamorigLeftArm", "mixamorigRightArm", 100);
    expect(measure(rig, baseline).hipRotation.value).toBeCloseTo(20, 8);
    expect(measure(rig, baseline).shoulderTurn.value).toBeCloseTo(70, 8);
  });
  it.each([null, Number.NaN, Infinity, -Infinity])("rejects invalid shared baseline %s", pelvisYaw => {
    const rig = fixture(); const baseline: MocapMeasurementBaseline = { pelvisYaw };
    const result = measure(rig, baseline);
    expect(result.hipRotation.value).toBeNull(); expect(result.shoulderTurn.value).toBeNull();
    expect(result.hipRotation.reason).toMatch(/baseline/i);
    expect(result.trunkTilt.value).toBeCloseTo(0);
  });
  it("cannot capture a baseline with missing, non-finite or horizontally degenerate pelvis bones", () => {
    const rig = fixture(); const left = rig.bone("mixamorigLeftUpLeg");
    expect(createMocapMeasurementBaseline(rig.model, rig.bones.filter(bone => bone !== left)).pelvisYaw).toBeNull();
    left.position.x = Number.NaN;
    expect(createMocapMeasurementBaseline(rig.model, rig.bones).pelvisYaw).toBeNull();
    left.position.set(0, -0.1, 0); rig.bone("mixamorigRightUpLeg").position.set(0, 0.1, 0);
    expect(createMocapMeasurementBaseline(rig.model, rig.bones).pelvisYaw).toBeNull();
    const result = measure(rig, { pelvisYaw: 0 });
    expect(result.hipRotation.value).toBeNull(); expect(result.shoulderTurn.value).toBeCloseTo(0);
  });
  it("returns unavailable shoulder turn for a vertical shoulder line without invalidating pelvis turn", () => {
    const rig = fixture();
    rig.bone("mixamorigLeftArm").position.set(0, 0, 0);
    rig.bone("mixamorigRightArm").position.set(0, 0.4, 0);
    const result = measure(rig);
    expect(result.shoulderTurn.value).toBeNull(); expect(result.shoulderTurn.reason).toMatch(/horizontal/i);
    expect(result.hipRotation.value).toBeCloseTo(0);
  });
});

describe("Unsigned hip-midpoint to shoulder-midpoint trunk tilt", () => {
  it("is exactly zero for a vertical synthetic trunk", () => expect(measure(fixture()).trunkTilt.value).toBeCloseTo(0, 10));
  it.each([-30, 30, -60, 60])("measures unsigned %s° lean without inventing a backbend sign", angle => {
    const rig = fixture(); rig.spine.position.x = Math.tan(radians(angle));
    expect(measure(rig).trunkTilt.value).toBeCloseTo(Math.abs(angle), 8);
  });
  it("uses midpoint geometry, not the Hips or Spine bone orientation", () => {
    const rig = fixture();
    rig.spine.position.set(0.6, 0.6, 0); // shoulder midpoint (0.6, 1.8, 0), hip midpoint (0, 1, 0)
    expect(measure(rig).trunkTilt.value).toBeCloseTo(THREE.MathUtils.radToDeg(Math.atan2(0.6, 0.8)), 8);
    rig.bone("mixamorigLeftArm").position.x -= 0.15;
    rig.bone("mixamorigRightArm").position.x += 0.15;
    expect(measure(rig).trunkTilt.value).toBeCloseTo(THREE.MathUtils.radToDeg(Math.atan2(0.6, 0.8)), 8);
  });
  it("allows horizontal and inverted trunk axes and rejects a zero-length one", () => {
    const rig = fixture(); rig.spine.position.set(1, -0.2, 0);
    expect(measure(rig).trunkTilt.value).toBeCloseTo(90, 8);
    rig.spine.position.set(0, -1.2, 0);
    expect(measure(rig).trunkTilt.value).toBeCloseTo(180, 8);
    rig.spine.position.set(0, -0.2, 0);
    expect(measure(rig).trunkTilt.value).toBeNull();
  });
});

describe("Unbounded horizontal pelvis-over-stance projection", () => {
  it.each([[0, 0], [0.25, 25], [1, 100], [-0.5, -50], [1.5, 150]])(
    "projects pelvis x=%s to %s%% without clamping",
    (pelvis, expected) => {
      const rig = fixture(); setStance(rig, pelvis, 0, 1, -3, 4);
      expect(measure(rig).weightTransfer.value).toBeCloseTo(expected, 8);
      expect(measure(rig, undefined, "right").weightTransfer.value).toBeCloseTo(100 - expected, 8);
    },
  );
  it("projects onto an oblique stance line while ignoring perpendicular and vertical offsets", () => {
    const rig = fixture();
    setWorld(rig, "mixamorigLeftUpLeg", new THREE.Vector3(2.8, 1, 0));
    setWorld(rig, "mixamorigRightUpLeg", new THREE.Vector3(3.2, 1, 0));
    setWorld(rig, "mixamorigRightFoot", new THREE.Vector3(0, -4, 0));
    setWorld(rig, "mixamorigLeftFoot", new THREE.Vector3(2, 7, 2));
    // dot((3,0,0),(2,0,2))/8 = 0.75, not a distance ratio.
    expect(measure(rig).weightTransfer.value).toBeCloseTo(75, 8);
  });
  it.each([0, 0.01, 0.049999])("rejects horizontal foot separation %s m even with vertical separation", separation => {
    const rig = fixture(); setStance(rig, 0.02, 0, separation, -2, 4);
    const result = measure(rig).weightTransfer;
    expect(result.value).toBeNull(); expect(result.reason).toMatch(/0\.05/);
  });
  it("accepts exactly 0.05 m horizontal foot separation", () => {
    const rig = fixture(); setStance(rig, 0.025, 0, 0.05);
    expect(measure(rig).weightTransfer.value).toBeCloseTo(50, 8);
  });
  it("does not infer lead side", () => {
    const rig = fixture(); const baseline = createMocapMeasurementBaseline(rig.model, rig.bones);
    expect(measureMocapMeasurements(rig.model, rig.bones, baseline, undefined, "right").weightTransfer.value).toBeNull();
  });
});

describe("Throw-side axial orientation proxy with arbitrary trunk-up zero", () => {
  it.each([0, 30, 90, 150, 180])("measures %s° between projected forearm and trunk-up", axial => {
    const rig = fixture(); rightForearm(rig, 90, axial);
    const result = measure(rig);
    expect(result.rightShoulderExternalRotationProxy.value).toBeCloseTo(axial, 8);
    expect(result.leftShoulderExternalRotationProxy.value).toBeNull();
    expect(result.leftShoulderExternalRotationProxy.reason).toMatch(/opposite/i);
  });
  it.each([45, 90, 135])("accepts the inclusive %s° elbow interior angle", beta => {
    const rig = fixture(); rightForearm(rig, beta, 60);
    const result = measure(rig);
    expect(result.rightElbowAngle.value).toBeCloseTo(beta, 8);
    expect(result.rightShoulderExternalRotationProxy.value).toBeCloseTo(60, 8);
  });
  it.each([0, 20, 44.999, 135.001, 170, 180])("rejects %s° elbow interior geometry", beta => {
    const rig = fixture(); rightForearm(rig, beta, 60);
    const result = measure(rig).rightShoulderExternalRotationProxy;
    expect(result.value).toBeNull(); expect(result.reason).toMatch(/45–135/);
  });
  it("measures only the configured left throwing side when left is active", () => {
    const rig = fixture();
    rig.bone("mixamorigLeftHand").position.set(0, 0.15, 0.3 * Math.sin(radians(60)));
    const result = measure(rig, undefined, "right", "left");
    expect(result.leftShoulderExternalRotationProxy.value).toBeCloseTo(60, 8);
    expect(result.rightShoulderExternalRotationProxy.value).toBeNull();
  });
  it("is invariant to whole-rig rotation when trunk-up and the arm share that rotation", () => {
    const rig = fixture(); rightForearm(rig, 75, 70);
    rig.ancestor.rotation.set(0.6, -0.8, 0.4); rig.model.rotation.set(-0.2, 0.3, 0.1);
    expect(measure(rig).rightShoulderExternalRotationProxy.value).toBeCloseTo(70, 8);
  });
  it("returns null when trunk-up projects to zero along a vertical upper arm", () => {
    const rig = fixture(); rig.bone("mixamorigRightForeArm").position.set(0, 0.4, 0);
    rig.bone("mixamorigRightHand").position.set(0.3, 0, 0);
    const result = measure(rig);
    expect(result.rightElbowAngle.value).toBeCloseTo(90, 8);
    expect(result.rightShoulderExternalRotationProxy.value).toBeNull();
    expect(result.rightShoulderExternalRotationProxy.reason).toMatch(/projection/i);
  });
  it.each(["upper arm", "forearm", "trunk"])("rejects a zero-length %s", kind => {
    const rig = fixture();
    if (kind === "upper arm") rig.bone("mixamorigRightForeArm").position.set(0, 0, 0);
    if (kind === "forearm") rig.bone("mixamorigRightHand").position.set(0, 0, 0);
    if (kind === "trunk") rig.spine.position.set(0, -0.2, 0);
    expect(measure(rig).rightShoulderExternalRotationProxy.value).toBeNull();
  });
  it("accepts throw configurations including tennis, and rejects non-throw configurations via an undefined throwing side", () => {
    const rig = fixture(); rightForearm(rig, 90, 50);
    const baseline = createMocapMeasurementBaseline(rig.model, rig.bones);
    const configs = mocapClips.filter(config => ["quarterback-throw", "tennis-serve", "golf-driver-swing", "soccer-passing"].includes(config.id));
    expect(configs).toHaveLength(4);
    for (const config of configs) {
      const throwingSide = config.eventDetection?.kind === "throw" ? config.laterality?.activeSide : undefined;
      const result = measureMocapMeasurements(rig.model, rig.bones, baseline, config.laterality?.leadLeg, throwingSide);
      if (config.eventDetection?.kind === "throw") expect(result.rightShoulderExternalRotationProxy.value).toBeCloseTo(50, 8);
      else {
        expect(result.rightShoulderExternalRotationProxy.value).toBeNull();
        expect(result.leftShoulderExternalRotationProxy.value).toBeNull();
        expect(result.rightShoulderExternalRotationProxy.reason).toMatch(/throw/i);
      }
    }
    const unconfigured = measureMocapMeasurements(rig.model, rig.bones, baseline, "left", undefined);
    expect(unconfigured.rightShoulderExternalRotationProxy.value).toBeNull();
  });
});

describe("Unavailable geometry is explicit rather than NaN or invented values", () => {
  it.each(["mixamorigLeftUpLeg", "mixamorigRightArm", "mixamorigRightHand", "mixamorigLeftFoot"])("guards missing bone %s", name => {
    const rig = fixture(); const baseline = createMocapMeasurementBaseline(rig.model, rig.bones);
    const result = measureMocapMeasurements(rig.model, rig.bones.filter(bone => bone !== rig.bone(name)), baseline, "left", "right");
    const ids: (keyof MocapMeasurements)[] = name.endsWith("Foot") ? ["weightTransfer"]
      : name.endsWith("Hand") ? ["rightShoulderExternalRotationProxy"]
      : name.endsWith("UpLeg") ? ["trunkTilt", "hipRotation", "weightTransfer", "rightShoulderExternalRotationProxy"]
      : ["trunkTilt", "shoulderTurn", "rightShoulderExternalRotationProxy"];
    for (const id of ids) { expect(result[id].value).toBeNull(); expect(result[id].reason).toContain(name); }
  });
  it.each([Number.NaN, Infinity, -Infinity])("guards non-finite shoulder world positions %s", value => {
    const rig = fixture(); const baseline = createMocapMeasurementBaseline(rig.model, rig.bones);
    rig.bone("mixamorigRightArm").position.z = value;
    const result = measure(rig, baseline);
    for (const id of ["trunkTilt", "shoulderTurn", "rightShoulderExternalRotationProxy"] as const) {
      expect(result[id].value).toBeNull(); expect(result[id].reason).toMatch(/non-finite/i);
    }
    for (const item of Object.values(result)) expect(item.value === null || Number.isFinite(item.value)).toBe(true);
  });
  it("guards non-finite pelvis, wrist and foot independently", () => {
    for (const [boneName, ids] of [
      ["mixamorigRightUpLeg", ["hipRotation", "trunkTilt", "weightTransfer", "rightShoulderExternalRotationProxy"]],
      ["mixamorigRightHand", ["rightShoulderExternalRotationProxy"]],
      ["mixamorigLeftFoot", ["weightTransfer"]],
    ] as const) {
      const rig = fixture(); const baseline = createMocapMeasurementBaseline(rig.model, rig.bones);
      rig.bone(boneName).position.x = Number.NaN;
      const result = measure(rig, baseline);
      for (const id of ids) { expect(result[id].value).toBeNull(); expect(result[id].reason).toMatch(/non-finite/i); }
    }
  });
  it("returns reasoned unavailable results for an empty bone array", () => {
    const model = new THREE.Group(); const baseline = createMocapMeasurementBaseline(model, []);
    expect(baseline).toEqual({ pelvisYaw: null });
    const result = measureMocapMeasurements(model, [], baseline, undefined, undefined);
    for (const item of Object.values(result)) { expect(item.value).toBeNull(); expect(item.reason).toBeTruthy(); }
  });
});
