import * as THREE from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { getActivePhaseIndex, type MocapClipConfig } from "@/data/mocapClips";
import { compareMocapPhase, measureMocapAngles, type MocapAngleId, type MocapAngleMeasurements } from "@/lib/mocapAngles";
import { measureMocapMeasurements, type MocapMeasurementId, type MocapMeasurementBaseline } from "./mocapMeasurements";
import { compareAuditedMocapPhase } from "./mocapAuditedComparisons";

/** Read-only visualization for the isolated preview. No pose, clip, or range edits. */
export const MOCAP_OVERLAY_JOINTS = [
  "mixamorigLeftArm", "mixamorigLeftForeArm", "mixamorigLeftHand",
  "mixamorigRightArm", "mixamorigRightForeArm", "mixamorigRightHand",
  "mixamorigLeftUpLeg", "mixamorigLeftLeg", "mixamorigLeftFoot",
  "mixamorigRightUpLeg", "mixamorigRightLeg", "mixamorigRightFoot",
  "mixamorigHips", "mixamorigSpine", "mixamorigSpine1", "mixamorigSpine2", "mixamorigNeck",
] as const;
export const MOCAP_OVERLAY_CONNECTIONS: readonly (readonly [string, string])[] = [
  ["mixamorigLeftArm", "mixamorigLeftForeArm"], ["mixamorigLeftForeArm", "mixamorigLeftHand"],
  ["mixamorigRightArm", "mixamorigRightForeArm"], ["mixamorigRightForeArm", "mixamorigRightHand"],
  ["mixamorigLeftArm", "mixamorigRightArm"],
  ["mixamorigLeftArm", "mixamorigLeftUpLeg"], ["mixamorigRightArm", "mixamorigRightUpLeg"],
  ["mixamorigLeftUpLeg", "mixamorigRightUpLeg"],
  ["mixamorigLeftUpLeg", "mixamorigLeftLeg"], ["mixamorigLeftLeg", "mixamorigLeftFoot"],
  ["mixamorigRightUpLeg", "mixamorigRightLeg"], ["mixamorigRightLeg", "mixamorigRightFoot"],
  ["mixamorigHips", "mixamorigSpine"], ["mixamorigSpine", "mixamorigSpine1"],
  ["mixamorigSpine1", "mixamorigSpine2"], ["mixamorigSpine2", "mixamorigNeck"],
  ["mixamorigSpine2", "mixamorigLeftArm"], ["mixamorigSpine2", "mixamorigRightArm"],
];
export type OverlayAngleStatus = "in-range" | "out-of-range" | "neutral";
export const MOCAP_OVERLAY_COLORS: Record<OverlayAngleStatus, string> = {
  "in-range": "#00ff00", "out-of-range": "#ff4d4d", neutral: "#b0bdcf",
};
const LABEL_DEFINITIONS: readonly { id: MocapAngleId; name: string; bone: string }[] = [
  { id: "rightElbowAngle", name: "R elbow", bone: "mixamorigRightForeArm" },
  { id: "leftElbowAngle", name: "L elbow", bone: "mixamorigLeftForeArm" },
  { id: "rightKneeAngle", name: "R knee", bone: "mixamorigRightLeg" },
  { id: "leftKneeAngle", name: "L knee", bone: "mixamorigLeftLeg" },
  { id: "hipShoulderSeparation", name: "Hip–shoulder", bone: "mixamorigSpine1" },
];
const NEW_LABEL_DEFINITIONS: readonly { id: MocapMeasurementId; name: string; bone: string }[] = [
  { id: "trunkTilt", name: "Trunk tilt", bone: "mixamorigSpine2" },
  { id: "hipRotation", name: "Hip Δ", bone: "mixamorigHips" },
  { id: "shoulderTurn", name: "Shoulder Δ", bone: "mixamorigSpine2" },
  { id: "weightTransfer", name: "Lead proxy", bone: "mixamorigHips" },
  { id: "rightShoulderExternalRotationProxy", name: "R axial proxy", bone: "mixamorigRightArm" },
  { id: "leftShoulderExternalRotationProxy", name: "L axial proxy", bone: "mixamorigLeftArm" },
];
export type MocapOverlayMode = "off" | "key" | "full";
export interface MocapOverlayLabel {
  id: MocapMeasurementId;
  name: string;
  value: number | null;
  status: OverlayAngleStatus;
  anchor?: THREE.Vector3;
  ranges: { name: string; min: number; max: number }[];
  reason: string;
  /** An exact bound reference occurrence exists even when convention is ambiguous. */
  referenceApplies?: boolean;
  unit?: "degrees" | "percent";
  convention?: string;
}
export interface MocapOverlayFrame {
  positions: Map<string, THREE.Vector3>;
  measurements: MocapAngleMeasurements;
  phaseIndex: number;
  phaseName: string | null;
  labels: MocapOverlayLabel[];
}
const finitePosition = (v: THREE.Vector3) => [v.x, v.y, v.z].every(Number.isFinite);

export function getMocapOverlayFrame(model: THREE.Object3D, bones: readonly THREE.Bone[], config: MocapClipConfig, clipTime: number, baseline?: MocapMeasurementBaseline): MocapOverlayFrame {
  // This updates world matrices, but never changes local transforms or animation.
  const measurements = measureMocapAngles(model, bones);
  const byName = new Map(bones.map(b => [b.name.replace(/:/g, ""), b]));
  const positions = new Map<string, THREE.Vector3>();
  for (const name of MOCAP_OVERLAY_JOINTS) {
    const bone = byName.get(name);
    if (!bone) continue;
    const point = bone.getWorldPosition(new THREE.Vector3());
    if (finitePosition(point)) positions.set(name, point);
  }
  const phaseIndex = Number.isFinite(clipTime) ? getActivePhaseIndex(config, clipTime) : -1;
  const phase = phaseIndex >= 0 ? config.phases[phaseIndex] : undefined;
  const comparisons = phase ? compareMocapPhase(config, phase, measurements) : [];
  const labels = LABEL_DEFINITIONS.map(({ id, name, bone }): MocapOverlayLabel => {
    const measurement = measurements[id];
    const value = measurement.value != null && Number.isFinite(measurement.value) ? measurement.value : null;
    const bound = comparisons.filter(c => c.measurement === id);
    const valid = bound.filter(c => c.status !== "unavailable");
    // Any failing assigned range is red. Missing/invalid ranges stay neutral.
    const status: OverlayAngleStatus = value === null || !valid.length ? "neutral"
      : valid.some(c => c.status === "out-of-range") ? "out-of-range" : "in-range";
    const ranges = valid.map(c => ({ name: c.metric.name, min: c.metric.min, max: c.metric.max }));
    const reason = value === null ? measurement.reason ?? "Unavailable world-space measurement"
      : !ranges.length ? "No applicable bound reference for the current phase"
      : ranges.map(r => `${r.name}: ${r.min}–${r.max}°`).join("; ");
    const anchor = positions.get(bone) ?? (id === "hipShoulderSeparation" ? positions.get("mixamorigSpine") : undefined);
    return { id, name, value, status, anchor, ranges, reason };
  });
  if (baseline) {
    const measured = measureMocapMeasurements(model, bones, baseline, config.laterality?.leadLeg, config.eventDetection?.kind === "throw" ? config.eventDetection.side : undefined);
    const audited = phase ? compareAuditedMocapPhase(config, phase, measured) : [];
    const expanded = [...LABEL_DEFINITIONS, ...NEW_LABEL_DEFINITIONS].map(({ id, name, bone }): MocapOverlayLabel => {
      const assigned = audited.filter(row => row.measurer === id);
      const valid = assigned.filter(row => row.status !== "unavailable");
      const converted = valid[0];
      const value = converted?.value ?? measured[id].value;
      const status: OverlayAngleStatus = !valid.length || value === null ? "neutral" : valid.some(row => row.status === "out-of-range") ? "out-of-range" : "in-range";
      const joint = id.includes("ElbowAngle") || id.includes("KneeAngle");
      const convention = converted?.audit.convention ?? (joint ? "interior" : assigned[0]?.audit.convention);
      const displayName = joint ? name.replace("knee", convention === "flexion" ? "knee flex" : "knee int").replace("elbow", convention === "flexion" ? "elbow flex" : "elbow int") : name;
      return { id, name: displayName, value, status, anchor: positions.get(bone), ranges: valid.map(row => ({ name: row.audit.metricName, min: row.min, max: row.max })), reason: assigned.map(row => `${row.conversion}; ${row.reason}`).join(" · ") || measured[id].reason || "No applicable reference", referenceApplies: assigned.length > 0, unit: id === "weightTransfer" ? "percent" : "degrees", convention };
    });
    return { positions, measurements, phaseIndex, phaseName: phase?.name ?? null, labels: expanded };
  }
  return { positions, measurements, phaseIndex, phaseName: phase?.name ?? null, labels };
}

/** Project a WORLD joint; points outside/behind the camera are never pinned to an edge. */
export function projectMocapOverlayPoint(point: THREE.Vector3, camera: THREE.Camera, width: number, height: number): { x: number; y: number } | null {
  if (!finitePosition(point) || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  const projected = point.clone().project(camera);
  if (!finitePosition(projected) || projected.z < -1 || projected.z > 1 || Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1) return null;
  return { x: (projected.x + 1) * width / 2, y: (1 - projected.y) * height / 2 };
}
export interface PositionedMocapLabel { id: MocapMeasurementId; x: number; y: number; left: number; top: number; width: number; height: number }

/** Screen-space callouts remain tethered to 3D joints, with collision-aware placement. */
export function layoutMocapOverlayLabels(points: { id: MocapMeasurementId; x: number; y: number }[], width: number, height: number): PositionedMocapLabel[] {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 32 || height < 32) return [];
  const placed: PositionedMocapLabel[] = [];
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  for (const point of points) {
    if (![point.x, point.y].every(Number.isFinite)) continue;
    const w = Math.min(point.id === "hipShoulderSeparation" || point.id.includes("Proxy") ? 126 : 112, width - 16);
    const h = Math.min(23, height - 16);
    const leftSide = point.id.startsWith("left");
    const torso = ["hipShoulderSeparation", "trunkTilt", "hipRotation", "shoulderTurn", "weightTransfer"].includes(point.id);
    const preferredLeft = point.x + (leftSide || (torso && point.id !== "hipRotation" && point.id !== "shoulderTurn") ? -w - 26 : 26);
    const left = clamp(preferredLeft, 8, width - w - 8);
    let top = clamp(point.y - (point.id === "hipShoulderSeparation" ? 44 : h / 2), 8, height - h - 8);
    for (let attempt = 0; attempt < 32; attempt++) {
      const offset = attempt === 0 ? 0 : Math.ceil(attempt / 2) * (h + 6) * (attempt % 2 ? -1 : 1);
      const candidate = clamp(point.y - h / 2 + offset - (point.id === "hipShoulderSeparation" ? 30 : 0), 8, height - h - 8);
      const overlaps = placed.some(p => left < p.left + p.width + 5 && left + w + 5 > p.left && candidate < p.top + p.height + 5 && candidate + h + 5 > p.top);
      top = candidate;
      if (!overlaps) break;
    }
    placed.push({ ...point, left, top, width: w, height: h });
  }
  return placed;
}

export interface MocapSkeletonOverlay {
  group: THREE.Group;
  setVisible: (visible: boolean) => void;
  setMode: (mode: MocapOverlayMode) => void;
  update: (frame: MocapOverlayFrame, camera: THREE.Camera, width: number, height: number) => void;
  dispose: () => void;
}

/** Two-pixel green connections and six-pixel round joint dots mirror Replay's user overlay. */
export function createMocapSkeletonOverlay(scene: THREE.Scene, container: HTMLElement): MocapSkeletonOverlay {
  const group = new THREE.Group();
  group.name = "mocap_live_skeleton_overlay";
  const lineGeometry = new LineSegmentsGeometry();
  lineGeometry.setPositions(new Float32Array(MOCAP_OVERLAY_CONNECTIONS.length * 6));
  lineGeometry.instanceCount = 0;
  const lineMaterial = new LineMaterial({ color: 0x00ff00, linewidth: 2, transparent: true, opacity: 0.9, depthTest: false, depthWrite: false, toneMapped: false });
  const lines = new LineSegments2(lineGeometry, lineMaterial);
  lines.renderOrder = 1000;
  lines.frustumCulled = false;
  group.add(lines);
  const dotGeometry = new THREE.BufferGeometry();
  const dotPositions = new THREE.BufferAttribute(new Float32Array(MOCAP_OVERLAY_JOINTS.length * 3), 3);
  dotGeometry.setAttribute("position", dotPositions);
  dotGeometry.setDrawRange(0, 0);
  const dotMaterial = new THREE.ShaderMaterial({
    vertexShader: "void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = 6.0; }",
    fragmentShader: "void main() { if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard; gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); }",
    transparent: true, depthTest: false, depthWrite: false, toneMapped: false,
  });
  const dots = new THREE.Points(dotGeometry, dotMaterial);
  dots.renderOrder = 1001;
  dots.frustumCulled = false;
  group.add(dots);
  group.traverse(object => object.layers.enable(2));
  scene.add(group);
  const root = document.createElement("div");
  root.dataset.mocapSkeletonOverlay = "true";
  root.setAttribute("aria-label", "Live world-space angle overlay");
  Object.assign(root.style, { position: "absolute", inset: "0", pointerEvents: "none", overflow: "hidden", zIndex: "2" });
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("aria-hidden", "true");
  Object.assign(svg.style, { position: "absolute", inset: "0" });
  root.appendChild(svg);
  const elements = new Map<MocapMeasurementId, { label: HTMLDivElement; tether: SVGLineElement }>();
  for (const definition of [...LABEL_DEFINITIONS, ...NEW_LABEL_DEFINITIONS]) {
    const label = document.createElement("div");
    label.dataset.mocapAngle = definition.id;
    Object.assign(label.style, {
      position: "absolute", display: "none", alignItems: "center", justifyContent: "center", gap: "4px",
      font: "500 10px ui-monospace, SFMono-Regular, monospace", whiteSpace: "nowrap", border: "1px solid", borderRadius: "4px",
      background: "rgba(10,14,39,0.76)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    });
    const tether = document.createElementNS("http://www.w3.org/2000/svg", "line");
    tether.setAttribute("stroke-width", "1");
    tether.setAttribute("opacity", "0.65");
    svg.appendChild(tether);
    root.appendChild(label);
    elements.set(definition.id, { label, tether });
  }
  container.appendChild(root);
  let visible = true;
  let mode: MocapOverlayMode = "full";
  let disposed = false;
  return {
    group,
    setVisible(nextVisible) { visible = nextVisible; group.visible = nextVisible; root.hidden = !nextVisible; },
    setMode(nextMode) {
      mode = nextMode; visible = mode !== "off"; group.visible = visible; root.hidden = !visible;
      root.dataset.mode = mode;
      lineMaterial.linewidth = mode === "key" ? 1 : 2;
      lineMaterial.opacity = mode === "key" ? 0.38 : 0.9;
      dots.visible = mode === "full";
    },
    update(frame, camera, width, height) {
      if (disposed || !visible) return;
      const start = lineGeometry.getAttribute("instanceStart") as THREE.InterleavedBufferAttribute;
      const end = lineGeometry.getAttribute("instanceEnd") as THREE.InterleavedBufferAttribute;
      let segmentCount = 0;
      for (const [aName, bName] of MOCAP_OVERLAY_CONNECTIONS) {
        const a = frame.positions.get(aName), b = frame.positions.get(bName);
        if (!a || !b) continue;
        start.setXYZ(segmentCount, a.x, a.y, a.z);
        end.setXYZ(segmentCount, b.x, b.y, b.z);
        segmentCount++;
      }
      start.data.needsUpdate = true;
      lineGeometry.instanceCount = segmentCount;
      lineMaterial.resolution.set(Math.max(width, 1), Math.max(height, 1));
      let dotCount = 0;
      frame.positions.forEach(point => { dotPositions.setXYZ(dotCount++, point.x, point.y, point.z); });
      dotPositions.needsUpdate = true;
      dotGeometry.setDrawRange(0, dotCount);
      root.dataset.phase = frame.phaseName ?? "No active phase";
      elements.forEach(({ label, tether }) => { label.style.display = "none"; tether.style.display = "none"; });
      const projected = frame.labels.flatMap(label => {
        if (mode === "key" && !(label.referenceApplies ?? label.ranges.length > 0)) return [];
        const point = label.anchor && projectMocapOverlayPoint(label.anchor, camera, width, height);
        return point && label.value !== null ? [{ id: label.id, ...point }] : [];
      });
      const placements = new Map(layoutMocapOverlayLabels(projected, width, height).map(p => [p.id, p]));
      for (const state of frame.labels) {
        const { label, tether } = elements.get(state.id)!;
        const placement = placements.get(state.id);
        label.style.display = placement ? "flex" : "none";
        tether.style.display = placement ? "" : "none";
        label.dataset.status = state.status;
        label.dataset.value = state.value?.toFixed(6) ?? "";
        label.dataset.phase = frame.phaseName ?? "No active phase";
        label.dataset.reference = state.ranges.map(r => `${r.min}–${r.max}°`).join("; ");
        label.dataset.convention = state.convention ?? "interior";
        label.textContent = `${state.name} ${state.value === null ? "—" : `${state.value.toFixed(1)}${state.unit === "percent" ? "%" : "°"}`}`;
        const description = `${label.textContent}; ${frame.phaseName ?? "No active phase"}; ${state.status === "neutral" ? "neutral" : state.status.replace(/-/g, " ")}; ${state.reason}`;
        label.title = description;
        label.setAttribute("aria-label", description);
        const color = MOCAP_OVERLAY_COLORS[state.status];
        label.style.color = color;
        label.style.borderColor = color;
        tether.setAttribute("stroke", color);
        if (!placement) continue;
        Object.assign(label.style, { left: `${placement.left}px`, top: `${placement.top}px`, width: `${placement.width}px`, height: `${placement.height}px` });
        tether.setAttribute("x1", String(placement.x)); tether.setAttribute("y1", String(placement.y));
        tether.setAttribute("x2", String(THREE.MathUtils.clamp(placement.x, placement.left, placement.left + placement.width)));
        tether.setAttribute("y2", String(THREE.MathUtils.clamp(placement.y, placement.top, placement.top + placement.height)));
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      scene.remove(group);
      lineGeometry.dispose(); lineMaterial.dispose(); dotGeometry.dispose(); dotMaterial.dispose();
      root.remove();
    },
  };
}
