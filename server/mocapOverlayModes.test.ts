import { afterEach, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { getMocapClip, type MocapClipConfig } from "../client/src/data/mocapClips";
import { professionalReferences } from "../client/src/data/professionalReferences";
import { createMocapMeasurementBaseline, measureMocapMeasurements, type MocapMeasurementId, type MocapMeasurementBaseline } from "../client/src/lib/mocapMeasurements";
import { compareAuditedMocapPhase } from "../client/src/lib/mocapAuditedComparisons";
import {
  createMocapSkeletonOverlay, getMocapOverlayFrame, MOCAP_OVERLAY_CONNECTIONS,
  MOCAP_OVERLAY_JOINTS, type MocapOverlayFrame, type MocapOverlayLabel, type MocapSkeletonOverlay,
} from "../client/src/lib/mocapSkeletonOverlay";

const qb = getMocapClip("quarterback-throw")!;
const ids: MocapMeasurementId[] = [
  "rightElbowAngle", "leftElbowAngle", "rightKneeAngle", "leftKneeAngle", "hipShoulderSeparation",
  "trunkTilt", "hipRotation", "shoulderTurn", "weightTransfer", "rightShoulderExternalRotationProxy", "leftShoulderExternalRotationProxy",
];
const owned: MocapSkeletonOverlay[] = [];
afterEach(() => {
  owned.splice(0).forEach(overlay => overlay.dispose());
  vi.restoreAllMocks(); vi.unstubAllGlobals();
});

// The renderer requires only these DOM operations: no jsdom, browser, canvas,
// mock WebGL renderer, dependency installation, or production helper changes.
class FakeElement {
  readonly style: Record<string, string> = {};
  readonly dataset: Record<string, string> = {};
  readonly attributes = new Map<string, string>();
  readonly children: FakeElement[] = [];
  parentNode: FakeElement | null = null;
  hidden = false; textContent = ""; title = "";
  constructor(readonly tagName: string) {}
  appendChild(child: FakeElement) { child.remove(); child.parentNode = this; this.children.push(child); return child; }
  setAttribute(name: string, value: string) { this.attributes.set(name, String(value)); }
  getAttribute(name: string) { return this.attributes.get(name) ?? null; }
  remove() {
    if (!this.parentNode) return;
    const siblings = this.parentNode.children, index = siblings.indexOf(this);
    if (index >= 0) siblings.splice(index, 1);
    this.parentNode = null;
  }
}
function overlayFixture() {
  vi.stubGlobal("document", { createElement: (name: string) => new FakeElement(name), createElementNS: (_namespace: string, name: string) => new FakeElement(name) });
  const scene = new THREE.Scene(), container = new FakeElement("div");
  const overlay = createMocapSkeletonOverlay(scene, container as unknown as HTMLElement); owned.push(overlay);
  const root = container.children.find(child => child.dataset.mocapSkeletonOverlay === "true")!;
  const svg = root.children.find(child => child.tagName === "svg")!;
  const labels = new Map(root.children.filter(child => child.dataset.mocapAngle).map(child => [child.dataset.mocapAngle as MocapMeasurementId, child]));
  const lines = overlay.group.children.find(child => child instanceof LineSegments2) as LineSegments2;
  const dots = overlay.group.children.find(child => child instanceof THREE.Points) as THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  const camera = new THREE.PerspectiveCamera(60, 800 / 600, 0.1, 100);
  camera.position.set(0, 0, 5); camera.lookAt(0, 0, 0); camera.updateMatrixWorld(true);
  return { scene, container, overlay, root, svg, labels, lines, dots, camera };
}

// Actual Bone parent/child transforms are re-evaluated on every frame. All
// expected numeric values describe this analytic fixture, not athlete data.
function rigFixture(colonNames = false) {
  const ancestor = new THREE.Group(), model = new THREE.Group(); ancestor.add(model);
  const bones: THREE.Bone[] = [], byName = new Map<string, THREE.Bone>();
  const add = (name: string, parent: THREE.Object3D, x: number, y: number, z = 0) => {
    const bone = new THREE.Bone(); bone.name = colonNames ? name.replace("mixamorig", "mixamorig:") : name;
    bone.position.set(x, y, z); parent.add(bone); bones.push(bone); byName.set(name, bone); return bone;
  };
  const hips = add("mixamorigHips", model, 0, 0);
  const spine = add("mixamorigSpine", hips, 0, 0.25);
  const spine1 = add("mixamorigSpine1", spine, 0, 0.25);
  const spine2 = add("mixamorigSpine2", spine1, 0, 0.25);
  add("mixamorigNeck", spine2, 0, 0.25);
  for (const [side, sign] of [["Right", 1], ["Left", -1]] as const) {
    const arm = add(`mixamorig${side}Arm`, spine2, sign * 0.35, 0.1);
    const elbow = add(`mixamorig${side}ForeArm`, arm, sign * 0.4, 0);
    add(`mixamorig${side}Hand`, elbow, 0, 0.3); // 90° elbow; active axial proxy has valid projections.
    const hip = add(`mixamorig${side}UpLeg`, hips, sign * 0.2, -0.1);
    const knee = add(`mixamorig${side}Leg`, hip, 0, -0.45);
    add(`mixamorig${side}Foot`, knee, 0, -0.45);
  }
  return { ancestor, model, bones, hips, spine, spine2, bone: (name: string) => byName.get(name)! };
}
type Rig = ReturnType<typeof rigFixture>;
function frameAt(rig: Rig, config = qb, phaseIndex = 4, baseline: MocapMeasurementBaseline | undefined = createMocapMeasurementBaseline(rig.model, rig.bones)) {
  const phase = config.phases[phaseIndex];
  return getMocapOverlayFrame(rig.model, rig.bones, config, (phase.startTime + phase.endTime) / 2 - config.trimStart, baseline);
}
function labelFor(frame: MocapOverlayFrame, id: MocapMeasurementId) { return frame.labels.find(label => label.id === id)!; }
function visibleIds(labels: Map<MocapMeasurementId, FakeElement>) { return [...labels].filter(([, label]) => label.style.display !== "none").map(([id]) => id); }
function transforms(rig: Rig) {
  return [rig.ancestor, rig.model, ...rig.bones].map(object => ({ position: object.position.toArray(), quaternion: object.quaternion.toArray(), scale: object.scale.toArray(), parent: object.parent, children: [...object.children] }));
}
function expectGeometry(lines: LineSegments2, dots: THREE.Points, frame: MocapOverlayFrame) {
  const connections = MOCAP_OVERLAY_CONNECTIONS.filter(([a, b]) => frame.positions.has(a) && frame.positions.has(b));
  expect(lines.geometry.instanceCount).toBe(connections.length);
  for (const [index, [a, b]] of connections.entries()) {
    for (const [name, attributeName] of [[a, "instanceStart"], [b, "instanceEnd"]] as const) {
      const attribute = lines.geometry.getAttribute(attributeName), point = frame.positions.get(name)!;
      expect(attribute.getX(index)).toBeCloseTo(point.x, 6); expect(attribute.getY(index)).toBeCloseTo(point.y, 6); expect(attribute.getZ(index)).toBeCloseTo(point.z, 6);
    }
  }
  expect(dots.geometry.drawRange).toEqual({ start: 0, count: frame.positions.size });
  const positions = dots.geometry.getAttribute("position");
  [...frame.positions.values()].forEach((point, index) => {
    expect(positions.getX(index)).toBeCloseTo(point.x, 6); expect(positions.getY(index)).toBeCloseTo(point.y, 6); expect(positions.getZ(index)).toBeCloseTo(point.z, 6);
  });
}

describe("baseline-aware overlay frames", () => {
  it("keeps the baseline optional for legacy callers and expands to the exact eleven measurement IDs when supplied", () => {
    const rig = rigFixture();
    const legacy = getMocapOverlayFrame(rig.model, rig.bones, qb, 0);
    expect(legacy.labels.map(label => label.id)).toEqual(ids.slice(0, 5));
    const baseline = Object.freeze(createMocapMeasurementBaseline(rig.model, rig.bones));
    const before = transforms(rig), references = JSON.stringify(professionalReferences), config = JSON.stringify(qb);
    const frame = frameAt(rig, qb, 4, baseline);
    expect(frame.labels.map(label => label.id)).toEqual(ids);
    expect([...frame.positions.keys()]).toEqual([...MOCAP_OVERLAY_JOINTS]);
    const measurement = measureMocapMeasurements(rig.model, rig.bones, baseline, "left", "right");
    const audited = compareAuditedMocapPhase(qb, qb.phases[4], measurement);
    frame.labels.forEach(label => {
      const assigned = audited.filter(row => row.measurer === label.id), valid = assigned.filter(row => row.status !== "unavailable");
      expect(label.referenceApplies, label.id).toBe(assigned.length > 0);
      expect(label.value).toBe(valid[0]?.value ?? measurement[label.id].value);
      expect(label.ranges).toEqual(valid.map(row => ({ name: row.audit.metricName, min: row.min, max: row.max })));
      expect(label.unit).toBe(label.id === "weightTransfer" ? "percent" : "degrees");
    });
    expect(transforms(rig)).toEqual(before); expect(JSON.stringify(professionalReferences)).toBe(references); expect(JSON.stringify(qb)).toBe(config); expect(baseline.pelvisYaw).toBe(0);
  });

  it("shows unavailable baseball flexion comparison as measured knee interior, not silently converted/scored flexion", () => {
    const rig = rigFixture(), config = getMocapClip("baseball-fastball")!;
    rig.bone("mixamorigLeftFoot").position.set(0.45, 0, 0); // Exact 90° interior, actual bone geometry.
    const frame = frameAt(rig, config, 2), knee = labelFor(frame, "leftKneeAngle");
    expect(knee.value).toBeCloseTo(90, 8);
    expect(knee).toMatchObject({ status: "neutral", ranges: [], referenceApplies: true, convention: "interior" });
    expect(knee.name).toContain("knee int"); expect(knee.name).not.toContain("knee flex");
    expect(knee.reason).toContain("180° − geometric interior angle");
    expect(knee.reason).toMatch(/unverified|verified.*conversion/i);
    const pitcher = compareAuditedMocapPhase(config, config.phases[2], measureMocapMeasurements(rig.model, rig.bones, createMocapMeasurementBaseline(rig.model, rig.bones), "left", "right"));
    expect(pitcher.find(row => row.measurer === "leftKneeAngle")).toMatchObject({ value: null, status: "unavailable", min: 35, max: 60 });
    const golf = getMocapClip("golf-driver-swing")!;
    const golfKnee = labelFor(frameAt(rig, golf, 4), "leftKneeAngle");
    expect(golfKnee).toMatchObject({ convention: "interior", referenceApplies: true, status: "out-of-range", ranges: [{ name: "Knee Flexion", min: 125, max: 155 }] });
    expect(golfKnee.value).toBeCloseTo(90, 8);
  });

  it("uses exact phase applicability, never stale trophy/release bindings or a target-relative rotation fallback", () => {
    const rig = rigFixture(), tennis = getMocapClip("tennis-serve")!;
    const trophy = frameAt(rig, tennis, 1), contact = frameAt(rig, tennis, 4);
    expect(labelFor(trophy, "rightElbowAngle")).toMatchObject({ referenceApplies: true, status: "neutral", ranges: [], convention: "interior" });
    expect(labelFor(contact, "rightElbowAngle")).toMatchObject({ referenceApplies: false, status: "neutral", ranges: [] });
    expect(labelFor(contact, "hipRotation")).toMatchObject({ referenceApplies: true, status: "neutral", ranges: [] });
    expect(labelFor(contact, "hipRotation").reason).toMatch(/target direction|zero/i);
    const acceleration = frameAt(rig, qb, 3);
    acceleration.labels.forEach(label => expect(label).toMatchObject({ referenceApplies: false, status: "neutral", ranges: [] }));
    const missingBaseline = getMocapOverlayFrame(rig.model, rig.bones, qb, 0, { pelvisYaw: null });
    expect(missingBaseline.labels).toHaveLength(11);
    expect(labelFor(missingBaseline, "hipRotation").value).toBeNull(); expect(labelFor(missingBaseline, "shoulderTurn").value).toBeNull();
    expect(labelFor(missingBaseline, "weightTransfer").value).toBeCloseTo(50);
  });

  it("retains unavailable labels without fabricating bones, finite values, or an opposite-side throwing proxy", () => {
    const rig = rigFixture(true), baseline = createMocapMeasurementBaseline(rig.model, rig.bones);
    const frame = frameAt(rig, qb, 4, baseline);
    expect(labelFor(frame, "rightShoulderExternalRotationProxy").value).toBeCloseTo(0);
    expect(labelFor(frame, "leftShoulderExternalRotationProxy").value).toBeNull();
    rig.bone("mixamorigRightHand").position.z = Infinity;
    const invalid = frameAt(rig, qb, 4, baseline);
    expect(labelFor(invalid, "rightElbowAngle")).toMatchObject({ value: null, status: "neutral", referenceApplies: true, ranges: [] });
    expect(labelFor(invalid, "rightShoulderExternalRotationProxy").value).toBeNull();
    expect(invalid.positions.has("mixamorigRightHand")).toBe(false);
    const empty = getMocapOverlayFrame(rig.model, [], qb, 0, baseline);
    expect(empty.labels).toHaveLength(11); expect(empty.positions.size).toBe(0);
    empty.labels.forEach(label => expect(label).toMatchObject({ value: null, status: "neutral", anchor: undefined, ranges: [] }));
  });
});

describe("Off / Key / Full rendering with a minimal fake DOM", () => {
  it("allocates eleven initially hidden labels/tethers, reserves overlay layer 2 without bloom layer 1, and preserves inherited dynamic line/dot material settings", () => {
    const { overlay, labels, svg, lines, dots, root } = overlayFixture();
    expect([...labels.keys()]).toEqual(ids); expect(svg.children).toHaveLength(11);
    labels.forEach(label => expect(label.style.display).toBe("none"));
    expect(root.style.pointerEvents).toBe("none");
    overlay.group.traverse(object => { expect(object.layers.isEnabled(0)).toBe(true); expect(object.layers.isEnabled(2)).toBe(true); expect(object.layers.isEnabled(1)).toBe(false); });
    expect(lines.material).toBeInstanceOf(LineMaterial); expect(lines.material.linewidth).toBe(2); expect(lines.material.opacity).toBe(0.9);
    expect(lines.material.color.getHex()).toBe(0x00ff00);
    for (const object of [lines, dots]) {
      expect(object.material.depthTest).toBe(false); expect(object.material.depthWrite).toBe(false); expect(object.material.toneMapped).toBe(false);
      expect(object.frustumCulled).toBe(false); expect(object.renderOrder).toBeGreaterThanOrEqual(1000);
    }
    expect(dots.material.vertexShader).toMatch(/gl_PointSize\s*=\s*6\.0/);
    expect(dots.material.fragmentShader).toMatch(/length\(gl_PointCoord\s*-\s*vec2\(0\.5\)\)\s*>\s*0\.5\)\s*discard/);
  });

  it("Key uses thin 0.38-opacity lines, no dots, and only exact referenceApplies labels including neutral ambiguous occurrences", () => {
    const { overlay, root, labels, lines, dots, camera } = overlayFixture(), rig = rigFixture();
    const frame = frameAt(rig, qb, 4);
    overlay.setMode("key"); overlay.update(frame, camera, 800, 600);
    expect(root.dataset.mode).toBe("key"); expect(root.hidden).toBe(false); expect(overlay.group.visible).toBe(true);
    expect(lines.material.linewidth).toBe(1); expect(lines.material.opacity).toBe(0.38); expect(dots.visible).toBe(false);
    const applicable = frame.labels.filter(label => label.referenceApplies === true && label.value !== null && label.anchor).map(label => label.id);
    expect(visibleIds(labels)).toEqual(applicable);
    expect(labels.get("hipRotation")!.style.display).toBe("flex");
    expect(labels.get("hipRotation")!.dataset.status).toBe("neutral"); expect(labels.get("hipRotation")!.dataset.reference).toBe("");
    expect(labels.get("hipShoulderSeparation")!.style.display).toBe("none"); expect(labels.get("rightShoulderExternalRotationProxy")!.style.display).toBe("none");
    expectGeometry(lines, dots, frame);
    // Explicit false takes precedence over a nonempty stale range, while the
    // optional property continues supporting the legacy five-label caller.
    const explicit: MocapOverlayFrame = { ...frame, labels: frame.labels.map(label => label.id === "hipShoulderSeparation" ? { ...label, referenceApplies: false, ranges: [{ name: "Stale", min: 0, max: 10 }] } : label) };
    overlay.update(explicit, camera, 800, 600); expect(labels.get("hipShoulderSeparation")!.style.display).toBe("none");
    const legacy = getMocapOverlayFrame(rig.model, rig.bones, qb, qb.phases[4].startTime - qb.trimStart);
    overlay.update(legacy, camera, 800, 600);
    expect(visibleIds(labels)).toEqual(legacy.labels.filter(label => label.ranges.length > 0 && label.value !== null).map(label => label.id));
    ids.slice(5).forEach(id => expect(labels.get(id)!.style.display).toBe("none"));
  });

  it("Full retains all eleven DOM slots and displays all actually measurable geometry with percentages, explicit conventions, and proxy limitations", () => {
    const { overlay, root, labels, lines, dots, camera } = overlayFixture(), rig = rigFixture();
    overlay.setMode("full");
    const frame = frameAt(rig, qb, 4); overlay.update(frame, camera, 800, 600);
    expect(root.dataset.mode).toBe("full"); expect(lines.material.linewidth).toBe(2); expect(lines.material.opacity).toBe(0.9); expect(dots.visible).toBe(true);
    expect(labels.size).toBe(11); expect(frame.labels).toHaveLength(11);
    expect(visibleIds(labels)).toEqual(frame.labels.filter(label => label.value !== null && label.anchor).map(label => label.id));
    // Only the active throwing arm is measurable; Full must not invent the
    // opposite axial proxy merely to make all eleven labels visible at once.
    expect(visibleIds(labels)).toHaveLength(10); expect(labels.get("leftShoulderExternalRotationProxy")!.style.display).toBe("none");
    expect(labels.get("weightTransfer")!.textContent).toBe("Lead proxy 50.0%");
    expect(labels.get("weightTransfer")!.title).toContain("not force");
    expect(labels.get("rightShoulderExternalRotationProxy")!.textContent).toBe("R axial proxy 0.0°");
    frame.labels.forEach(state => {
      const label = labels.get(state.id)!;
      expect(label.dataset.value).toBe(state.value?.toFixed(6) ?? ""); expect(label.dataset.phase).toBe(frame.phaseName); expect(label.dataset.status).toBe(state.status);
      expect(label.dataset.convention).toBe(state.convention ?? "interior");
      expect(label.title).toContain(state.reason); expect(label.getAttribute("aria-label")).toBe(label.title);
    });
    expectGeometry(lines, dots, frame);
  });

  it("renders a supplied confirmed flexion-converted convention and % units without treating the original ambiguous reference as confirmed", () => {
    const { overlay, labels, camera } = overlayFixture(), rig = rigFixture();
    const config = getMocapClip("baseball-fastball")!, actual = frameAt(rig, config, 2);
    const interior = labelFor(actual, "leftKneeAngle").value!;
    // Renderer-only contract fixture for a caller-provided verified conversion.
    // The real audit comparison remains unavailable, and neither source nor
    // getMocapOverlayFrame is patched to manufacture a resolved reference.
    const converted: MocapOverlayLabel = { ...labelFor(actual, "leftKneeAngle"), name: "L knee flex", value: 180 - interior, convention: "flexion", unit: "degrees", reason: "Confirmed caller conversion: 180° − geometric interior angle; 0° = straight" };
    overlay.setMode("full"); overlay.update({ ...actual, labels: actual.labels.map(label => label.id === converted.id ? converted : label) }, camera, 800, 600);
    expect(labels.get("leftKneeAngle")!.textContent).toBe("L knee flex 0.0°");
    expect(labels.get("leftKneeAngle")!.dataset.convention).toBe("flexion"); expect(labels.get("leftKneeAngle")!.title).toContain("0° = straight");
    expect(labels.get("weightTransfer")!.textContent).toContain("%");
    overlay.update(actual, camera, 800, 600);
    expect(labels.get("leftKneeAngle")!.dataset.convention).toBe("interior");
    expect(labels.get("leftKneeAngle")!.textContent).toContain("knee int 180.0°");
    expect(labels.get("leftKneeAngle")!.dataset.status).toBe("neutral");
  });

  it("Off hides both 3D and DOM, skips hidden updates, and switching back refreshes the current phase before displaying values", () => {
    const { overlay, root, labels, dots, lines, camera } = overlayFixture(), rig = rigFixture();
    overlay.setMode("full"); overlay.update(frameAt(rig), camera, 800, 600);
    const version = dots.geometry.getAttribute("position").version, phase = root.dataset.phase, value = labels.get("rightElbowAngle")!.dataset.value;
    overlay.setMode("off"); expect(root.hidden).toBe(true); expect(overlay.group.visible).toBe(false); expect(dots.visible).toBe(false);
    const next = frameAt(rig, qb, 3); overlay.update(next, camera, 320, 240);
    expect(dots.geometry.getAttribute("position").version).toBe(version); expect(root.dataset.phase).toBe(phase); expect(labels.get("rightElbowAngle")!.dataset.value).toBe(value);
    expect(lines.material.resolution.toArray()).toEqual([800, 600]);
    overlay.setMode("key"); overlay.update(next, camera, 320, 240);
    expect(root.hidden).toBe(false); expect(overlay.group.visible).toBe(true); expect(visibleIds(labels)).toEqual([]);
    expect(root.dataset.phase).toBe("Acceleration"); expect(lines.material.resolution.toArray()).toEqual([320, 240]);
    expect(dots.geometry.getAttribute("position").version).toBeGreaterThan(version);
  });

  it("removes stale labels/tethers across trophy → contact → phase gap → legacy frames and clears current-phase reference metadata", () => {
    const { overlay, labels, svg, root, camera } = overlayFixture(), rig = rigFixture(), tennis = getMocapClip("tennis-serve")!;
    const baseline = createMocapMeasurementBaseline(rig.model, rig.bones);
    overlay.setMode("key"); overlay.update(frameAt(rig, tennis, 1, baseline), camera, 800, 600);
    expect(labels.get("rightElbowAngle")!.style.display).toBe("flex");
    overlay.update(frameAt(rig, tennis, 4, baseline), camera, 800, 600);
    const elbow = labels.get("rightElbowAngle")!;
    expect(elbow.style.display).toBe("none"); expect(svg.children[0].style.display).toBe("none");
    expect(elbow.dataset.phase).toBe("Overhead Stroke Proxy"); expect(elbow.dataset.reference).toBe("");
    expect(root.dataset.phase).toBe("Overhead Stroke Proxy");
    const gapConfig: MocapClipConfig = { ...tennis, phases: [{ ...tennis.phases[1], endTime: tennis.phases[1].startTime + 0.1 }] };
    const gap = getMocapOverlayFrame(rig.model, rig.bones, gapConfig, 2, baseline);
    expect(gap.phaseName).toBeNull(); overlay.update(gap, camera, 800, 600);
    expect(visibleIds(labels)).toEqual([]); svg.children.forEach(tether => expect(tether.style.display).toBe("none"));
    labels.forEach(label => { expect(label.dataset.phase).toBe("No active phase"); expect(label.dataset.reference).toBe(""); expect(label.dataset.status).toBe("neutral"); });
    overlay.setMode("full"); overlay.update(frameAt(rig, qb, 4, baseline), camera, 800, 600);
    expect(labels.get("weightTransfer")!.style.display).toBe("flex");
    const legacy = getMocapOverlayFrame(rig.model, rig.bones, qb, 0);
    overlay.update(legacy, camera, 800, 600);
    ids.slice(5).forEach((id, index) => { expect(labels.get(id)!.style.display).toBe("none"); expect(svg.children[index + 5].style.display).toBe("none"); });
  });

  it("updates real world line/dot buffers dynamically in Key and Full, then shrinks draws for absent bones", () => {
    const { overlay, lines, dots, camera } = overlayFixture(), rig = rigFixture(true);
    const baseline = createMocapMeasurementBaseline(rig.model, rig.bones);
    overlay.setMode("key"); const first = frameAt(rig, qb, 4, baseline); overlay.update(first, camera, 800, 600); expectGeometry(lines, dots, first);
    const oldPoint = first.positions.get("mixamorigRightHand")!.clone(), version = dots.geometry.getAttribute("position").version;
    rig.ancestor.position.set(0.2, 0.1, 0.3); rig.spine2.rotation.y = 0.3; rig.bone("mixamorigRightHand").position.set(0.3, 0, 0);
    const next = frameAt(rig, qb, 4, baseline); overlay.update(next, camera, 400, 300);
    expectGeometry(lines, dots, next); expect(dots.visible).toBe(false); expect(dots.geometry.getAttribute("position").version).toBeGreaterThan(version);
    expect(next.positions.get("mixamorigRightHand")!.distanceTo(oldPoint)).toBeGreaterThan(0.1);
    expect(first.positions.get("mixamorigRightHand")!.toArray()).toEqual(oldPoint.toArray());
    overlay.setMode("full");
    const missing = new Set(["mixamorig:RightHand", "mixamorig:LeftLeg", "mixamorig:Spine1"]);
    const partial = getMocapOverlayFrame(rig.model, rig.bones.filter(bone => !missing.has(bone.name)), qb, 0, baseline);
    overlay.update(partial, camera, 400, 300); expectGeometry(lines, dots, partial); expect(dots.visible).toBe(true);
    expect(lines.geometry.instanceCount).toBeLessThan(MOCAP_OVERLAY_CONNECTIONS.length); expect(dots.geometry.drawRange.count).toBeLessThan(MOCAP_OVERLAY_JOINTS.length);
    const empty = getMocapOverlayFrame(rig.model, [], qb, 0, baseline); overlay.update(empty, camera, 400, 300); expectGeometry(lines, dots, empty);
  });

  it("hides invalid/offscreen values in every mode and disposes the eleven-label overlay resources exactly once", () => {
    const { overlay, root, labels, svg, lines, dots, camera, container, scene } = overlayFixture(), rig = rigFixture();
    const frame = frameAt(rig); overlay.setMode("full"); overlay.update(frame, camera, 800, 600);
    camera.position.set(0, 0, -5); camera.lookAt(0, 0, -10); camera.updateMatrixWorld(true);
    overlay.update(frame, camera, 800, 600); expect(visibleIds(labels)).toEqual([]); svg.children.forEach(tether => expect(tether.style.display).toBe("none"));
    overlay.setMode("key"); overlay.update(frame, camera, 800, 600); expect(visibleIds(labels)).toEqual([]);
    const spies = [lines.geometry, lines.material, dots.geometry, dots.material].map(resource => vi.spyOn(resource, "dispose"));
    overlay.dispose(); overlay.dispose(); spies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
    expect(scene.children).not.toContain(overlay.group); expect(container.children).not.toContain(root);
    const version = dots.geometry.getAttribute("position").version;
    expect(() => overlay.update(frame, camera, 800, 600)).not.toThrow(); expect(dots.geometry.getAttribute("position").version).toBe(version);
  });
});
