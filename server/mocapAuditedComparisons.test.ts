import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import MocapAuditedReport from "../client/src/components/MocapAuditedReport";
import { getMocapClip, mocapClips, type MocapClipConfig, type MocapPhase } from "../client/src/data/mocapClips";
import { professionalReferences } from "../client/src/data/professionalReferences";
import { mocapReferenceAudit, MOCAP_FLAT_AUDIT_CHECKPOINTS } from "../client/src/data/mocapReferenceAudit";
import {
  compareAuditedMocapPhase, countAuditedMocapComparisons, getMocapAuditRows,
  getMocapPhaseAuditRows, sampleAuditedMocapCheckpoints, type AuditedMocapCheckpoint,
} from "../client/src/lib/mocapAuditedComparisons";
import {
  createMocapMeasurementBaseline, measureMocapMeasurements, type MocapMeasurementBaseline,
} from "../client/src/lib/mocapMeasurements";
import * as correction from "../client/src/lib/mocapCorrection";
import * as angles from "../client/src/lib/mocapAngles";

afterEach(() => vi.restoreAllMocks());
const qb = getMocapClip("quarterback-throw")!;
// Independent source fixtures. Descriptions/notes and bounds are verbatim, not
// generated from the audit or a snapshot updated alongside production metadata.
type SourceMetric = readonly [name: string, descriptionOrNote: string, min: number, max: number, unit: string];
const flatSources: Record<string, readonly SourceMetric[]> = {
  "football-throw": [
    ["Shoulder External Rotation", "Maximum shoulder rotation when arm is cocked back", 125, 145, "degrees"],
    ["Elbow Flexion", "Elbow bend at maximal shoulder external rotation", 90, 110, "degrees"],
    ["Hip Rotation", "Total hip rotation from foot contact to follow-through", 50, 70, "degrees"],
    ["Hip-Shoulder Separation", "Peak dynamic separation between hip and shoulder rotation during late cocking", 30, 45, "degrees"],
    ["Spine Extension", "Lumbar extension at maximal shoulder external rotation", 18, 28, "degrees"],
    ["Knee Flexion", "Stride leg knee bend", 30, 50, "degrees"],
    ["Foot Positioning", "Front foot angle relative to target line", 35, 55, "degrees"],
    ["Weight Transfer", "Percentage of weight transferred from back to front foot", 60, 80, "percent"],
  ],
  "baseball-fastball": [
    ["Shoulder External Rotation", "Maximum shoulder external rotation at late cocking", 155, 185, "degrees"],
    ["Elbow Flexion", "Elbow angle at max external rotation", 80, 110, "degrees"],
    ["Hip Rotation", "Hip rotation at foot contact", 45, 65, "degrees"],
    ["Spine Extension", "Trunk tilt at ball release", 12, 28, "degrees"],
    ["Knee Flexion", "Stride leg knee flexion at foot contact", 35, 60, "degrees"],
    ["Weight Transfer", "Weight on stride leg at release", 65, 85, "percent"],
  ],
  "baseball-batting-swing": [
    ["Hip Rotation", "Hip rotation during swing", 55, 85, "degrees"],
    ["Elbow Flexion", "Lead arm elbow angle at contact", 90, 120, "degrees"],
    ["Knee Flexion", "Back leg knee bend at load", 115, 145, "degrees"],
    ["Spine Extension", "Trunk tilt at contact", 10, 25, "degrees"],
    ["Weight Transfer", "Weight to front leg at contact", 60, 80, "percent"],
  ],
  "golf-driver-swing": [
    ["Hip Rotation", "Hip rotation at impact", 45, 65, "degrees"],
    ["Shoulder External Rotation", "Shoulder turn at top of backswing", 75, 105, "degrees"],
    ["Knee Flexion", "Lead knee flexion at impact", 125, 155, "degrees"],
    ["Spine Extension", "Spine tilt at address and through impact", 20, 40, "degrees"],
    ["Weight Transfer", "Weight to front foot at impact", 70, 90, "percent"],
    ["Foot Positioning", "Stance width and foot flare", 25, 45, "degrees"],
  ],
  "soccer-passing": [
    ["Hip Rotation", "Hip rotation during pass", 25, 45, "degrees"],
    ["Knee Flexion", "Passing leg knee angle", 125, 155, "degrees"],
    ["Spine Extension", "Upright posture during pass", 3, 18, "degrees"],
    ["Foot Positioning", "Plant foot positioning", 30, 50, "degrees"],
    ["Weight Transfer", "Weight distribution", 50, 70, "percent"],
  ],
  "soccer-power-shot": [
    ["Hip Rotation", "Hip rotation during kicking", 40, 60, "degrees"],
    ["Knee Flexion", "Kicking leg knee extension at contact", 120, 155, "degrees"],
    ["Spine Extension", "Trunk lean at contact", 8, 22, "degrees"],
    ["Foot Positioning", "Plant foot angle", 40, 60, "degrees"],
    ["Weight Transfer", "Weight on plant foot", 65, 85, "percent"],
  ],
  "tennis-serve": [
    ["Shoulder External Rotation", "Maximum shoulder rotation in trophy position", 145, 175, "degrees"],
    ["Elbow Flexion", "Elbow angle at trophy position", 85, 115, "degrees"],
    ["Hip Rotation", "Hip rotation during serve", 35, 55, "degrees"],
    ["Knee Flexion", "Knee bend during loading", 100, 140, "degrees"],
    ["Spine Extension", "Back arch at trophy position", 15, 35, "degrees"],
    ["Weight Transfer", "Weight transfer into court", 60, 80, "percent"],
  ],
};
const qbPhaseSources: Record<string, readonly SourceMetric[]> = {
  "Neutral / Ready Position": [
    ["Weight Distribution", "Balanced base", -5, 5, "percent"],
    ["Back Knee Flexion", "Athletic bend", 150, 170, "degrees"],
    ["Lead Knee Flexion", "Ready to step", 150, 170, "degrees"],
    ["Spine Angle", "Tall posture", 0, 10, "degrees"],
    ["Hip Rotation", "Closed hips", 0, 10, "degrees"],
    ["Shoulder Rotation", "Closed shoulders", 0, 10, "degrees"],
    ["Throwing Elbow Flexion", "Relaxed arm", 80, 120, "degrees"],
    ["Non-Throwing Elbow Flexion", "Balanced counter", 70, 120, "degrees"],
  ],
  "Early Cocking": [
    ["Weight Distribution", "Load the back leg", -20, -10, "percent"],
    ["Back Knee Flexion", "Absorb load", 140, 160, "degrees"],
    ["Lead Knee Flexion", "Free to pivot", 150, 170, "degrees"],
    ["Spine Angle", "Stay tall", 0, 10, "degrees"],
    ["Hip Rotation", "Hips start first", 10, 25, "degrees open"],
    ["Shoulder Rotation", "Shoulders stay closed", 0, 10, "degrees open"],
    ["Throwing Elbow Height", "Elbow up, not flared", -5, 5, "degrees from shoulder level"],
    ["Throwing Elbow Flexion", "Compact arm", 80, 100, "degrees"],
    ["Non-Throwing Elbow Flexion", "Counterbalance", 30, 70, "degrees"],
  ],
  "Late Cocking / Max Torque": [
    ["Weight Distribution", "Energy moves forward", 0, 10, "percent"],
    ["Back Knee Flexion", "Drive from back leg", 150, 165, "degrees"],
    ["Lead Knee Flexion", "Prepare to brace", 140, 160, "degrees"],
    ["Spine Angle", "Tall with control", -5, 5, "degrees"],
    ["Hip Rotation", "Hips lead power", 30, 45, "degrees open"],
    ["Shoulder Rotation", "Delay shoulders", 5, 15, "degrees open"],
    ["Hip-Shoulder Separation", "Peak dynamic torque window", 30, 45, "degrees"],
    ["Throwing Elbow Flexion", "Strong L-shape", 85, 100, "degrees"],
    ["Throwing Elbow Height", "Protect shoulder", -5, 5, "degrees from shoulder level"],
    ["Non-Throwing Elbow Extension", "Pull torso through", 30, 70, "degrees"],
  ],
  "Acceleration / Release": [
    ["Weight Distribution", "Finish into throw", 20, 40, "percent on lead foot"],
    ["Lead Knee Extension", "Dynamic brace from 150 degrees toward 170-180 degrees", 150, 180, "degrees"],
    ["Back Knee Extension", "Dynamic drive from 150 degrees toward 170-180 degrees", 150, 180, "degrees"],
    ["Spine Angle", "No collapse", 0, 10, "degrees"],
    ["Hip Rotation", "Hips finish first", 45, 60, "degrees"],
    ["Shoulder Rotation", "Shoulders whip", 45, 60, "degrees"],
    ["Throwing Elbow Extension", "Dynamic extension toward 170-180 degrees; elbow leads hand", 90, 180, "degrees"],
    ["Throwing Elbow Alignment", "Throw straight", -5, 5, "degrees from target line"],
    ["Non-Throwing Elbow Flexion", "Pull torso through", 40, 90, "degrees"],
    ["Wrist Flexion", "Tight spiral", 20, 40, "degrees"],
  ],
  "Follow-Through": [
    ["Weight Distribution", "Complete transfer", 60, 80, "percent on lead foot"],
    ["Lead Knee Extension", "Stable finish", 170, 180, "degrees"],
    ["Back Knee Flexion", "Trail release", 150, 170, "degrees"],
    ["Spine Angle", "Natural deceleration", 5, 15, "degrees forward"],
    ["Shoulder Rotation", "Full rotation", 60, 90, "degrees"],
    ["Throwing Elbow Extension", "Full release", 170, 180, "degrees"],
    ["Non-Throwing Elbow Flexion", "Absorb rotation", 30, 70, "degrees"],
  ],
};
const flatAssignments: Record<string, Record<string, readonly string[]>> = {
  "baseball-fastball": { "Stride / Plant Proxy": ["Knee Flexion", "Hip Rotation"], "Max Cocking": ["Elbow Flexion", "Shoulder External Rotation"], "Release Proxy": ["Weight Transfer", "Spine Extension"] },
  "baseball-batting-swing": { "Leg Lift / Load": ["Knee Flexion"], "Strike Proxy": ["Elbow Flexion", "Hip Rotation", "Weight Transfer", "Spine Extension"] },
  "golf-driver-swing": { Address: ["Spine Extension", "Foot Positioning"], "Top / Reversal Proxy": ["Shoulder External Rotation"], "Strike / Impact Proxy": ["Knee Flexion", "Hip Rotation", "Weight Transfer"] },
  "soccer-passing": { Setup: ["Spine Extension"], "Strike Proxy": ["Knee Flexion", "Hip Rotation", "Foot Positioning", "Weight Transfer"] },
  "soccer-power-shot": { "Strike Proxy": ["Knee Flexion", "Hip Rotation", "Spine Extension", "Foot Positioning", "Weight Transfer"] },
  "tennis-serve": { "Trophy-Like Preparation": ["Elbow Flexion", "Shoulder External Rotation", "Spine Extension"], "Loaded Stance": ["Knee Flexion"], "Overhead Stroke Proxy": ["Hip Rotation", "Weight Transfer"] },
};
function phaseDescription(name: string, note: string, unit: string) {
  let suffix = "Matching flat description: none; no flat definition of this quantity is supplied.";
  const related: [RegExp, string, string][] = [
    [/Weight Distribution/, "Related flat description (distribution/transfer normalization is not established)", "Weight Transfer"],
    [/Knee/, "Related flat description (stride leg only; not automatically a back-leg or extension definition)", "Knee Flexion"],
    [/Spine Angle/, "Related flat description (lumbar extension is NOT the same quantity as gross trunk posture)", "Spine Extension"],
    [/Shoulder Rotation/, "Related flat description (arm cocking is NOT the same quantity as torso shoulder turn)", "Shoulder External Rotation"],
    [/Elbow (Flexion|Extension)/, "Related flat description (max-cocking elbow bend; not automatically a non-throwing-arm or extension definition)", "Elbow Flexion"],
    [/^(Hip Rotation|Hip-Shoulder Separation)$/, "Matching flat description", name],
  ];
  const match = related.find(([pattern]) => pattern.test(name));
  if (match) suffix = `${match[1]} [${match[2]}]: ${flatSources["football-throw"].find(metric => metric[0] === match[2])![1]}`;
  return `Note: ${note}\nUnit: ${unit}\n${suffix}`;
}

// Genuine world-transform Bone fixture; these numbers are analytic test geometry,
// not fabricated athlete observations, mocked measurements, or licensed motions.
function rigFixture() {
  const model = new THREE.Group();
  const bones: THREE.Bone[] = [];
  const byName = new Map<string, THREE.Bone>();
  const add = (name: string, parent: THREE.Object3D, x: number, y: number, z = 0) => {
    const bone = new THREE.Bone(); bone.name = name; bone.position.set(x, y, z);
    parent.add(bone); bones.push(bone); byName.set(name, bone); return bone;
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
  return { model, bones, hips, spine, bone: (name: string) => byName.get(name)! };
}
type Rig = ReturnType<typeof rigFixture>;
function measured(rig: Rig, config: MocapClipConfig, baseline = createMocapMeasurementBaseline(rig.model, rig.bones)) {
  return measureMocapMeasurements(rig.model, rig.bones, baseline, config.laterality?.leadLeg, config.eventDetection?.kind === "throw" ? config.eventDetection.side : undefined);
}
function rowsAt(rig: Rig, config: MocapClipConfig, phaseName: string) {
  return compareAuditedMocapPhase(config, config.phases.find(phase => phase.name === phaseName)!, measured(rig, config));
}
function elbowInterior(rig: Rig, degrees: number, axial = 0) {
  const beta = THREE.MathUtils.degToRad(degrees), alpha = THREE.MathUtils.degToRad(axial);
  if (degrees === 180) { rig.bone("mixamorigRightHand").position.set(0.3, 0, 0); return; }
  rig.bone("mixamorigRightHand").position.set(-0.3 * Math.cos(beta), 0.3 * Math.sin(beta) * Math.cos(alpha), 0.3 * Math.sin(beta) * Math.sin(alpha));
}
function snapshot(rig: Rig) {
  return [rig.model, ...rig.bones].map(object => ({ position: object.position.toArray(), quaternion: object.quaternion.toArray(), scale: object.scale.toArray(), parent: object.parent, children: [...object.children] }));
}
function checkpoint(config: MocapClipConfig, phase: MocapPhase, rig = rigFixture()): AuditedMocapCheckpoint {
  const measurements = measured(rig, config), sourceTime = phase.checkpointTime ?? phase.startTime;
  return { phase, sourceTime, clipTime: sourceTime - config.trimStart, measurements, comparisons: compareAuditedMocapPhase(config, phase, measurements) };
}

describe("complete occurrence-level reference audit", () => {
  it("pins every flat and phase source name, description/note, unit, and unchanged numeric range across all 85 occurrences", () => {
    const expected = mocapClips.flatMap(config => {
      const key = config.referenceKey!;
      const flat = flatSources[key].map(([metricName, description, min, max, unit]) => ({ referenceKey: key, clipId: config.id, phaseName: null, metricName, description, min, max, unit }));
      const phases = key === "football-throw" ? Object.entries(qbPhaseSources).flatMap(([phaseName, metrics]) => metrics.map(([metricName, note, min, max, unit]) => ({ referenceKey: key, clipId: config.id, phaseName, metricName, description: phaseDescription(metricName, note, unit), min, max, unit }))) : [];
      const reference = professionalReferences[key];
      expect(reference.metrics.map(metric => [metric.name, metric.description, metric.optimalRange.min, metric.optimalRange.max, metric.unit]), key).toEqual(flatSources[key]);
      expect((reference.phases ?? []).map(phase => [phase.name, phase.metrics.map(metric => [metric.name, metric.note, metric.min, metric.max, metric.unit])]), key).toEqual(key === "football-throw" ? Object.entries(qbPhaseSources) : []);
      return [...flat, ...phases];
    });
    expect(expected).toHaveLength(85);
    expect(mocapReferenceAudit).toHaveLength(85);
    expect(mocapReferenceAudit.map(({ referenceKey, clipId, phaseName, metricName, description, min, max, unit }) => ({ referenceKey, clipId, phaseName, metricName, description, min, max, unit }))).toEqual(expected);
    const identities = mocapReferenceAudit.map(row => JSON.stringify([row.referenceKey, row.clipId, row.phaseName, row.metricName]));
    expect(new Set(identities).size).toBe(85);
  });

  it.each(Object.keys(flatAssignments))("assigns every exact flat source occurrence once, and only once, for %s", id => {
    const config = getMocapClip(id)!;
    expect(MOCAP_FLAT_AUDIT_CHECKPOINTS[id]).toEqual(flatAssignments[id]);
    const assigned = config.phases.flatMap(phase => {
      const rows = getMocapPhaseAuditRows(config, phase);
      const names = flatAssignments[id][phase.name] ?? [];
      expect(rows.map(row => row.metricName).sort(), phase.name).toEqual([...names].sort());
      rows.forEach(row => { expect(row.phaseName).toBeNull(); expect(getMocapAuditRows(config)).toContain(row); });
      return rows;
    });
    expect(assigned.map(row => row.metricName).sort()).toEqual(flatSources[config.referenceKey!].map(metric => metric[0]).sort());
    expect(new Set(assigned).size).toBe(assigned.length);
    expect(getMocapPhaseAuditRows(config, { name: "Unassigned", startTime: config.trimStart, endTime: config.trimEnd, referenceMetrics: flatSources[id].map(metric => metric[0]) })).toEqual([]);
  });

  it.each(qb.phases)("uses only the structured same-phase quarterback occurrences for $name", phase => {
    const sourceName = phase.referenceName ?? phase.name;
    const rows = getMocapPhaseAuditRows(qb, phase);
    expect(rows.map(row => row.metricName)).toEqual((qbPhaseSources[sourceName] ?? []).map(metric => metric[0]));
    rows.forEach(row => expect(row.phaseName).toBe(sourceName));
    if (phase.name === "Acceleration") expect(rows).toEqual([]);
  });

  it("has no fuzzy key, inherited key, phase-name, generic flat, or release fallback", () => {
    for (const referenceKey of ["Football-throw", " football-throw", "missing", "toString"]) {
      const config = { ...qb, referenceKey };
      expect(getMocapAuditRows(config)).toEqual([]);
      expect(getMocapPhaseAuditRows(config, qb.phases[4])).toEqual([]);
    }
    expect(getMocapAuditRows({ ...qb, id: "unknown-clip" })).toEqual([]);
    for (const name of ["Acceleration", "acceleration / release", "Acceleration / Release "]) {
      expect(getMocapPhaseAuditRows(qb, { name, startTime: qb.trimStart, endTime: qb.trimEnd, referenceMetrics: ["Elbow Flexion"] })).toEqual([]);
    }
    expect(getMocapPhaseAuditRows(qb, { ...qb.phases[0], name: "Renamed UI phase", referenceName: "Neutral / Ready Position" }).map(row => row.metricName)).toEqual(qbPhaseSources["Neutral / Ready Position"].map(metric => metric[0]));
  });

  it("binds pitcher stride and golf lead to left, tennis pre-drive support to right, and golf shoulder turn to torso rather than arm ER", () => {
    const find = (clipId: string, metricName: string) => mocapReferenceAudit.find(row => row.clipId === clipId && row.phaseName === null && row.metricName === metricName)!;
    expect(find("baseball-fastball", "Knee Flexion")).toMatchObject({ sideRole: "stride", physicalSide: "left", measurer: "leftKneeAngle", convention: "flexion", resolution: "ambiguous", min: 35, max: 60 });
    expect(find("golf-driver-swing", "Knee Flexion")).toMatchObject({ sideRole: "lead", physicalSide: "left", measurer: "leftKneeAngle", convention: "interior", resolution: "resolved", min: 125, max: 155 });
    const tennis = find("tennis-serve", "Knee Flexion");
    expect(tennis).toMatchObject({ sideRole: "back", physicalSide: "right", measurer: "rightKneeAngle", resolution: "ambiguous" });
    expect(tennis.rationale).toContain("pre-drive support");
    const golf = find("golf-driver-swing", "Shoulder External Rotation");
    expect(golf).toMatchObject({ measurer: "shoulderTurn", sideRole: "torso", physicalSide: "none", resolution: "ambiguous", min: 75, max: 105 });
    expect(golf.labelIssue).toMatch(/torso shoulder turn/);
    expect(golf.labelIssue).toMatch(/not glenohumeral/);
    const qbLead = mocapReferenceAudit.filter(row => row.clipId === qb.id && ["lead", "stride"].includes(row.sideRole));
    expect(qbLead.length).toBeGreaterThan(0);
    qbLead.forEach(row => expect(row.physicalSide).toBe("left"));
  });
});

describe("audited comparisons: safe conventions, immutable bounds, report-only policies", () => {
  it("retains every ambiguous/unsupported assignment as unavailable even when candidate geometry is measurable", () => {
    const rig = rigFixture();
    const rows = mocapClips.flatMap(config => config.phases.flatMap(phase => compareAuditedMocapPhase(config, phase, measured(rig, config))));
    const blocked = rows.filter(row => ["ambiguous", "unsupported"].includes(row.audit.resolution) || ["ambiguous", "unsupported"].includes(row.audit.convention));
    expect(blocked.length).toBeGreaterThan(40);
    for (const row of blocked) {
      expect(row, `${row.audit.clipId}/${row.audit.phaseName}/${row.audit.metricName}`).toMatchObject({ value: null, difference: null, status: "unavailable", tooFar: false });
      expect(row.min).toBe(row.audit.min); expect(row.max).toBe(row.audit.max);
      expect(row.reason).not.toBe("");
    }
    const baseball = getMocapClip("baseball-fastball")!;
    const knee = rowsAt(rig, baseball, "Stride / Plant Proxy").find(row => row.audit.metricName === "Knee Flexion")!;
    expect(knee.geometricValue).toBeCloseTo(180);
    expect(knee).toMatchObject({ value: null, min: 35, max: 60, status: "unavailable", correctionPolicy: "report-only" });
    expect(knee.candidateValue).toBeCloseTo(0, 8);
    rig.bone("mixamorigLeftFoot").position.set(Math.sqrt(3) * 0.25, -0.25, 0);
    const bentKnee = rowsAt(rig, baseball, "Stride / Plant Proxy").find(row => row.audit.metricName === "Knee Flexion")!;
    expect(bentKnee.geometricValue).toBeCloseTo(120, 8);
    expect(bentKnee.candidateValue).toBeCloseTo(60, 8);
    expect(bentKnee).toMatchObject({ value: null, status: "unavailable", min: 35, max: 60, tooFar: false });
    rig.bone("mixamorigLeftFoot").position.set(0, 0, 0);
    expect(rowsAt(rig, baseball, "Stride / Plant Proxy").find(row => row.audit.metricName === "Knee Flexion")).toMatchObject({ geometricValue: null, candidateValue: null, value: null, status: "unavailable" });
    expect(knee.conversion).toContain("180° − geometric interior angle");
    expect(knee.reason).toMatch(/unverified|verified.*conversion/i);
    const elbows = rows.filter(row => /Elbow (Flexion|Extension)/.test(row.audit.metricName) && row.audit.convention === "ambiguous");
    expect(elbows.length).toBeGreaterThan(10);
    elbows.forEach(row => { expect(row.geometricValue).not.toBeNull(); expect(row.status).toBe("unavailable"); expect(row.value).toBeNull(); });
    const turns = rows.filter(row => ["hipRotation", "shoulderTurn"].includes(row.measurer));
    expect(turns.length).toBeGreaterThan(10);
    turns.forEach(row => { expect(row.geometricValue).not.toBeNull(); expect(row.status).toBe("unavailable"); expect(row.reason).toMatch(/target|baseline|zero/i); });
  });

  it("measures valid throwing-arm axial geometry but never scores it against an uncalibrated clinical-looking ER zero", () => {
    const rig = rigFixture(); elbowInterior(rig, 90, 170);
    const config = getMocapClip("baseball-fastball")!;
    const measurement = measured(rig, config);
    expect(measurement.rightElbowAngle.value).toBeCloseTo(90, 8);
    expect(measurement.rightShoulderExternalRotationProxy.value).toBeCloseTo(170, 8);
    const row = rowsAt(rig, config, "Max Cocking").find(row => row.audit.metricName === "Shoulder External Rotation")!;
    expect(row).toMatchObject({ measurer: "rightShoulderExternalRotationProxy", value: null, status: "unavailable", difference: null, min: 155, max: 185, correctionPolicy: "report-only", tooFar: false });
    expect(row.geometricValue).toBeCloseTo(170, 8);
    expect(row.candidateValue).toBeNull();
    expect(row.conversion).toContain("no calibrated clinical ER conversion");
    expect(row.reason).toMatch(/zero|calibration/i);
    elbowInterior(rig, 170, 170);
    expect(rowsAt(rig, config, "Max Cocking").find(item => item.measurer === row.measurer)).toMatchObject({ geometricValue: null, value: null, status: "unavailable", min: 155, max: 185 });
  });

  it("qualifies directional weight geometry as report-only even far outside its unchanged percentage benchmark", () => {
    const rig = rigFixture();
    rig.bone("mixamorigRightFoot").position.x = -1.2; // world X = -1
    rig.bone("mixamorigLeftFoot").position.x = -0.3; // world X = -0.5
    const request = vi.spyOn(correction, "requestMocapCorrection");
    const golf = getMocapClip("golf-driver-swing")!;
    const row = rowsAt(rig, golf, "Strike / Impact Proxy").find(item => item.measurer === "weightTransfer")!;
    expect(row).toMatchObject({ value: 200, geometricValue: 200, status: "out-of-range", difference: 110, min: 70, max: 90, unit: "percent", correctionPolicy: "report-only", tooFar: false });
    expect(row.conversion).toContain("not force");
    expect(row.reason).toMatch(/geometry proxy|geometry percentage|geometric proxy/);
    expect(request).not.toHaveBeenCalled();
    const signedReady = rowsAt(rig, qb, "Loaded / Ready").find(item => item.measurer === "weightTransfer")!;
    expect(signedReady).toMatchObject({ geometricValue: 200, value: null, status: "unavailable", min: -5, max: 5, tooFar: false });
  });

  it.each([[72, false, -18], [71.99, true, -18.01], [90, false, 0], [180, false, 0]])("applies the existing elbow request's 2° margin and inclusive 20° cap at interior %s°", (degrees, tooFar, difference) => {
    const rig = rigFixture(); elbowInterior(rig, degrees);
    const row = rowsAt(rig, qb, "Release").find(item => item.audit.metricName === "Throwing Elbow Extension")!;
    expect(row).toMatchObject({ min: 90, max: 180, correctionPolicy: "legacy-elbow-spine", tooFar });
    // Normalized world vectors plus acos can lose sub-microdegree precision at 180°.
    expect(row.value).toBeCloseTo(degrees, 5); expect(row.difference).toBeCloseTo(difference, 8);
    expect(row.tooFar).toBe(correction.requestMocapCorrection(row.value, row.min, row.max).status === "too-far");
    expect(row.conversion).toContain("180° = straight");
  });

  it.each([[12, false], [11.99, true], [63, false], [63.01, true]])("retains the same inclusive request cap for resolved hip–shoulder separation %s°", (degrees, tooFar) => {
    const rig = rigFixture(); rig.spine.rotation.y = -THREE.MathUtils.degToRad(degrees);
    const row = rowsAt(rig, qb, "Late Cocking / Max Torque").find(item => item.measurer === "hipShoulderSeparation")!;
    expect(row).toMatchObject({ min: 30, max: 45, correctionPolicy: "legacy-elbow-spine", tooFar });
    expect(row.value).toBeCloseTo(degrees, 8);
    expect(row.conversion).toContain("0° aligned");
  });

  it("never requests correction for new/proxy/knee/converted-only or unavailable measurements, and never edits a pose or source", () => {
    const rig = rigFixture(); const before = snapshot(rig);
    const referencesBefore = JSON.stringify(professionalReferences), auditBefore = JSON.stringify(mocapReferenceAudit), configsBefore = JSON.stringify(mocapClips);
    const request = vi.spyOn(correction, "requestMocapCorrection");
    const bake = vi.spyOn(correction, "bakeMetricCorrectedClip"), elbow = vi.spyOn(correction, "applyElbowHingeOffset"), spine = vi.spyOn(correction, "applySpineTwistOffset");
    const rows = mocapClips.flatMap(config => config.phases.flatMap(phase => compareAuditedMocapPhase(config, phase, measured(rig, config))));
    const eligible = rows.filter(row => row.correctionPolicy === "legacy-elbow-spine" && row.status !== "unavailable");
    expect(request).toHaveBeenCalledTimes(eligible.length);
    expect(request.mock.calls).toEqual(eligible.map(row => [row.value, row.min, row.max]));
    rows.filter(row => row.correctionPolicy === "report-only").forEach(row => expect(row.tooFar).toBe(false));
    rows.filter(row => row.tooFar).forEach(row => expect(["rightElbowAngle", "leftElbowAngle", "hipShoulderSeparation"]).toContain(row.measurer));
    expect(bake).not.toHaveBeenCalled(); expect(elbow).not.toHaveBeenCalled(); expect(spine).not.toHaveBeenCalled();
    expect(snapshot(rig)).toEqual(before);
    expect(JSON.stringify(professionalReferences)).toBe(referencesBefore); expect(JSON.stringify(mocapReferenceAudit)).toBe(auditBefore); expect(JSON.stringify(mocapClips)).toBe(configsBefore);
  });

  it("does not substitute a flat range if the exact structured source metric is absent", () => {
    const original = professionalReferences[qb.referenceKey!];
    vi.spyOn(angles, "getMocapReference").mockReturnValue({ ...original, phases: original.phases!.map(phase => ({ ...phase, metrics: phase.metrics.filter(metric => metric.name !== "Throwing Elbow Extension") })) });
    const row = rowsAt(rigFixture(), qb, "Release").find(item => item.audit.metricName === "Throwing Elbow Extension")!;
    expect(row).toMatchObject({ value: null, status: "unavailable", difference: null, tooFar: false });
    expect(row.min).toBeNaN(); expect(row.max).toBeNaN();
    expect(row.reason).toContain("Exact source metric is missing; no substitute range");
  });

  it("counts unavailable, in-range, ordinary out-of-range, and legacy refusals without double counting", () => {
    const rig = rigFixture(); elbowInterior(rig, 60);
    const report = checkpoint(qb, qb.phases[4], rig);
    expect(countAuditedMocapComparisons([report])).toEqual({ inRange: 3, outOfRange: 1, tooFar: 1, unavailable: 5 });
    expect(countAuditedMocapComparisons([])).toEqual({ inRange: 0, outOfRange: 0, tooFar: 0, unavailable: 0 });
    const counts = countAuditedMocapComparisons([report]);
    expect(Object.values(counts).reduce((sum, count) => sum + count, 0)).toBe(report.comparisons.length);
  });
});

describe("checkpoint sampling keeps the first RAW pelvis baseline", () => {
  it("seeks native checkpoint offsets, shares one frozen raw baseline across raw/corrected-like poses, and restores time zero", () => {
    const rig = rigFixture();
    rig.hips.rotation.y = -THREE.MathUtils.degToRad(20);
    const baseline: MocapMeasurementBaseline = Object.freeze(createMocapMeasurementBaseline(rig.model, rig.bones));
    expect(baseline.pelvisYaw).toBeCloseTo(THREE.MathUtils.degToRad(20), 8);
    const initial = baseline.pelvisYaw;
    const config: MocapClipConfig = { ...qb, trimStart: 10, trimEnd: 12, phases: [
      { name: "Ready", referenceName: "Neutral / Ready Position", startTime: 10, endTime: 11, checkpointTime: 10.25 },
      { name: "Release", referenceName: "Acceleration / Release", startTime: 11, endTime: 12, checkpointTime: 11.5 },
    ] };
    let correctedLike = false;
    // Seek is mocked only as the caller's transport: numeric results still come
    // from genuine, re-evaluated bone matrices, never fabricated measurement rows.
    const seek = vi.fn((time: number) => {
      rig.hips.rotation.y = -THREE.MathUtils.degToRad(20 + time * 20);
      rig.spine.rotation.y = -THREE.MathUtils.degToRad(correctedLike ? 35 : 25);
    });
    const raw = sampleAuditedMocapCheckpoints(rig.model, rig.bones, config, 2, seek, baseline);
    expect(seek.mock.calls.map(([time]) => time)).toEqual([0.25, 1.5, 0]);
    expect(raw.map(row => [row.clipTime, row.sourceTime])).toEqual([[0.25, 10.25], [1.5, 11.5]]);
    raw.forEach((row, index) => { expect(row.measurements.hipRotation.value).toBeCloseTo([5, 30][index], 8); expect(row.measurements.shoulderTurn.value).toBeCloseTo([30, 55][index], 8); });
    seek.mockClear(); correctedLike = true;
    const corrected = sampleAuditedMocapCheckpoints(rig.model, rig.bones, config, 2, seek, baseline);
    expect(seek.mock.calls.map(([time]) => time)).toEqual([0.25, 1.5, 0]);
    corrected.forEach((row, index) => { expect(row.measurements.hipRotation.value).toBeCloseTo([5, 30][index], 8); expect(row.measurements.shoulderTurn.value).toBeCloseTo([40, 65][index], 8); });
    expect(baseline.pelvisYaw).toBe(initial);
    expect(createMocapMeasurementBaseline(rig.model, rig.bones).pelvisYaw).toBeCloseTo(initial!, 8);
    expect(raw[1].measurements.shoulderTurn.value).toBeCloseTo(55, 8);
  });

  it("clamps a source checkpoint to actual clip duration without stretching the reference timeline", () => {
    const rig = rigFixture(); const baseline = createMocapMeasurementBaseline(rig.model, rig.bones);
    const seek = vi.fn();
    const config = { ...qb, phases: [{ ...qb.phases[4], checkpointTime: qb.trimStart + 4 }] };
    const [report] = sampleAuditedMocapCheckpoints(rig.model, rig.bones, config, 0.5, seek, baseline);
    expect(report.clipTime).toBe(0.5); expect(report.sourceTime).toBe(qb.trimStart + 0.5);
    expect(seek.mock.calls).toEqual([[0.5], [0]]);
  });
});

describe("MocapAuditedReport SSR disclosures and read-only rendering", () => {
  it("renders sides, measurers, conventions, unchanged ranges, limits, raw/corrected snapshots, and the complete audit without invoking legacy correction", () => {
    const rig = rigFixture(); elbowInterior(rig, 72);
    const raw = qb.phases.map(phase => checkpoint(qb, phase, rig));
    elbowInterior(rig, 92);
    const corrected = qb.phases.map(phase => checkpoint(qb, phase, rig));
    const before = snapshot(rig), references = JSON.stringify(professionalReferences);
    const request = vi.spyOn(correction, "requestMocapCorrection"), bake = vi.spyOn(correction, "bakeMetricCorrectedClip"), elbow = vi.spyOn(correction, "applyElbowHingeOffset"), spine = vi.spyOn(correction, "applySpineTwistOffset");
    const html = renderToStaticMarkup(React.createElement(MocapAuditedReport, { config: qb, raw, corrected, selectedIndex: 4 }));
    for (const text of ["Audited mocap measurement report", "Measurer / side", "Convention / conversion", "Unchanged range", "rightElbowAngle", "throwing → right", "lead → left", "interior", "180° = straight", "72.0° → 92.0°", "90–180 degrees", "Report-only; no correction", "52 metric occurrences", "first RAW trimmed frame", "not weight, center of mass, balance, force, or pressure", "not clinical humeral rotation", "lumbar extension", "Measurement definitions and limits", "Unbounded geometric projection", "not calibrated to its zero or sign", "Ambiguous ranges are not compared", "not scores"]) expect(html, text).toContain(text);
    for (const spy of [request, bake, elbow, spine]) expect(spy).not.toHaveBeenCalled();
    expect(snapshot(rig)).toEqual(before); expect(JSON.stringify(professionalReferences)).toBe(references);
  });

  it("shows unavailable and tentative flexion rather than silently reporting a converted baseball knee, and explains unassigned phases", () => {
    const config = getMocapClip("baseball-fastball")!;
    const raw = config.phases.map(phase => checkpoint(config, phase));
    const html = renderToStaticMarkup(React.createElement(MocapAuditedReport, { config, raw, corrected: raw, selectedIndex: 2 }));
    for (const text of ["leftKneeAngle", "stride → left", "flexion", "180° − geometric interior angle", "Unscored flexion candidate", "0.0°", "Unavailable → Unavailable", "35–60 degrees", "provenance remains unverified", "6 metric occurrences"]) expect(html, text).toContain(text);
    const empty = renderToStaticMarkup(React.createElement(MocapAuditedReport, { config: qb, raw: qb.phases.map(phase => checkpoint(qb, phase)), corrected: [], selectedIndex: 3 }));
    expect(empty).toContain("No reference metric is assigned to this phase");
    expect(empty).toContain("Full overlay mode");
  });
});
