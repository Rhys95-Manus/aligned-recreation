import { describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import {
  measureMocapAngles,
  type MocapAngleMeasurements,
} from "../client/src/lib/mocapAngles";
import {
  detectMotionEvents,
  sampleMotionEvents,
  type MotionSample,
  type MotionSide,
} from "../client/src/lib/mocapEvents";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const angles = (value = 110): MocapAngleMeasurements => ({
  rightElbowAngle: { value },
  leftElbowAngle: { value },
  rightKneeAngle: { value },
  leftKneeAngle: { value },
  hipShoulderSeparation: { value: 20 },
});
const grid = (duration = 2.4, fps = 96) => {
  const times: number[] = [];
  for (let i = 0; i / fps < duration; i++) times.push(i / fps);
  times.push(duration);
  return times;
};
const lerpRange = (
  t: number,
  start: number,
  end: number,
  from: number,
  to: number
) => {
  const u = THREE.MathUtils.clamp((t - start) / (end - start), 0, 1);
  return from + (to - from) * u;
};
const smoothTravel = (
  t: number,
  start: number,
  end: number,
  distance: number
) => {
  const u = THREE.MathUtils.clamp((t - start) / (end - start), 0, 1);
  return distance * u * u * (3 - 2 * u);
};
function baseSample(time: number): MotionSample {
  return {
    time,
    angles: angles(),
    positions: {
      Hips: V(),
      Head: V(0, 1),
      RightHand: V(0.5, 0.7),
      LeftHand: V(-0.5, 0.7),
      RightFoot: V(0.2, -0.8),
      LeftFoot: V(-0.2, -0.8),
      RightArm: V(0.25, 0.8),
      RightForeArm: V(0.4, 0.7),
      LeftArm: V(-0.25, 0.8),
      LeftForeArm: V(-0.4, 0.7),
      RightUpLeg: V(0.15, -0.1),
      RightLeg: V(0.15, -0.45),
      LeftUpLeg: V(-0.15, -0.1),
      LeftLeg: V(-0.15, -0.45),
    },
  };
}

/** Intentional independent angle/trajectory channels isolate detector semantics. */
function extensionFixture(
  options: {
    side?: MotionSide;
    kick?: boolean;
    recovery?: boolean;
    times?: number[];
  } = {}
): MotionSample[] {
  const {
    side = "right",
    kick = false,
    recovery = false,
    times = grid(),
  } = options;
  const joint =
    `${side}${kick ? "Knee" : "Elbow"}Angle` as keyof MocapAngleMeasurements;
  const key = `${side === "right" ? "Right" : "Left"}${kick ? "Foot" : "Hand"}`;
  return times.map(time => {
    const sample = baseSample(time);
    const angle =
      time < 0.5
        ? lerpRange(time, 0.1, 0.5, 125, 60)
        : time <= 1.2
          ? lerpRange(time, 0.5, 1.2, 60, 165)
          : recovery
            ? lerpRange(time, 1.5, 1.9, 165, 20)
            : 165;
    sample.angles[joint] = { value: angle };
    sample.positions[key].x +=
      smoothTravel(time, 0.5, 1.2, 0.9) +
      (recovery ? smoothTravel(time, 1.5, 1.9, 8) : 0);
    return sample;
  });
}
function swingFixture(times = grid()): MotionSample[] {
  return times.map(time => {
    const sample = baseSample(time);
    const movement =
      -smoothTravel(time, 0.1, 0.55, 0.45) + smoothTravel(time, 0.7, 1.2, 1.1);
    sample.positions.LeftHand.x += movement;
    sample.positions.RightHand.x += movement;
    return sample;
  });
}
function eventTime(
  result: ReturnType<typeof detectMotionEvents>,
  id: string
): number {
  const event = result.events.find(item => item.id === id);
  expect(event, result.warnings.join("\n")).toBeDefined();
  return event!.time;
}
function translated(samples: MotionSample[]): MotionSample[] {
  return samples.map(sample => ({
    ...sample,
    positions: Object.fromEntries(
      Object.entries(sample.positions).map(([key, point]) => [
        key,
        point
          .clone()
          .add(
            V(50 * sample.time * sample.time, 2 * sample.time, -sample.time)
          ),
      ])
    ),
  }));
}
function snapshot(samples: readonly MotionSample[]) {
  return samples.map(sample => ({
    time: sample.time,
    angles: structuredClone(sample.angles),
    positions: Object.fromEntries(
      Object.entries(sample.positions).map(([key, point]) => [
        key,
        point.toArray(),
      ])
    ),
  }));
}

// Tiny world-origin rig; colon names are intentional and mesh geometry absent.
function samplingRig() {
  const model = new THREE.Group();
  const bones: THREE.Bone[] = [];
  const add = (
    name: string,
    parent: THREE.Object3D,
    position: THREE.Vector3
  ) => {
    const bone = new THREE.Bone();
    bone.name = `mixamorig:${name}`;
    bone.position.copy(position);
    parent.add(bone);
    bones.push(bone);
    return bone;
  };
  const hips = add("Hips", model, V(0, 1));
  add("Head", hips, V(0, 1));
  const arm = add("RightArm", hips, V(0.2, 0.5));
  const elbow = add("RightForeArm", arm, V(0.3));
  const hand = add("RightHand", elbow, V(0.3));
  const unrelated = new THREE.Bone();
  unrelated.name = "Other:RightHand";
  model.add(unrelated);
  bones.push(unrelated);
  model.position.set(3, 4, -2);
  model.rotation.set(0.2, -0.3, 0.4);
  model.scale.setScalar(0.01);
  model.animations = [
    new THREE.AnimationClip("immutable source", 1, [
      new THREE.VectorKeyframeTrack(
        "mixamorig:RightHand.position",
        [0, 1],
        [0.3, 0, 0, 0, 0.3, 0]
      ),
    ]),
  ];
  const seek = vi.fn((time: number) => {
    hand.position.set(0.3 * Math.cos(time), 0.3 * Math.sin(time), 0);
  });
  return { model, bones, hand, seek };
}

describe("sampleMotionEvents", () => {
  it("defaults to uniform 96 Hz in clip seconds, includes the exact non-grid endpoint, and resets zero", () => {
    const { model, bones, seek } = samplingRig();
    const duration = 0.027;
    const samples = sampleMotionEvents(model, bones, duration, seek);
    expect(samples.map(sample => sample.time)).toEqual([
      0,
      1 / 96,
      2 / 96,
      duration,
    ]);
    expect(seek.mock.calls.map(([time]) => time)).toEqual([
      0,
      1 / 96,
      2 / 96,
      duration,
      0,
    ]);
    expect(seek).toHaveBeenLastCalledWith(0);
  });
  it("merges exact off-grid native keys, sorts/deduplicates, guards bounds, and does not mutate key times", () => {
    const { model, bones, hand } = samplingRig();
    const key = 0.0174291;
    const keys = Object.freeze([
      key,
      0.05,
      key,
      1 / 96,
      0,
      -0.1,
      NaN,
      Infinity,
      0.06,
    ]);
    const seek = vi.fn((time: number) => {
      const angle = 19.383645 + 1000 * Math.abs(time - key);
      const rotation = THREE.MathUtils.degToRad(180 - angle);
      hand.position.set(0.3 * Math.cos(rotation), 0.3 * Math.sin(rotation), 0);
    });
    const samples = sampleMotionEvents(model, bones, 0.05, seek, 96, keys);
    expect(samples.map(sample => sample.time)).toEqual([
      0,
      1 / 96,
      key,
      2 / 96,
      3 / 96,
      4 / 96,
      0.05,
    ]);
    const minimum = samples.reduce((best, sample) =>
      sample.angles.rightElbowAngle.value! < best.angles.rightElbowAngle.value!
        ? sample
        : best
    );
    expect(minimum.time).toBe(key);
    expect(minimum.angles.rightElbowAngle.value).toBeCloseTo(19.383645, 8);
    expect(keys).toEqual([
      key,
      0.05,
      key,
      1 / 96,
      0,
      -0.1,
      NaN,
      Infinity,
      0.06,
    ]);
    expect(seek).toHaveBeenLastCalledWith(0);
  });
  it("does not duplicate a grid-aligned endpoint or omit a zero-duration pose", () => {
    const rig = samplingRig();
    expect(
      sampleMotionEvents(rig.model, rig.bones, 3 / 96, rig.seek).map(
        sample => sample.time
      )
    ).toEqual([0, 1 / 96, 2 / 96, 3 / 96]);
    expect(
      sampleMotionEvents(rig.model, rig.bones, 0, rig.seek).map(
        sample => sample.time
      )
    ).toEqual([0]);
  });
  it("uses world bone origins with colon-normalized canonical suffix keys and immutable snapshots", () => {
    const { model, bones, hand, seek } = samplingRig();
    const names = bones.map(bone => bone.name);
    const hierarchy = bones.map(bone => bone.parent);
    const source = model.animations[0];
    const sourceValues = Array.from(source.tracks[0].values);
    const samples = sampleMotionEvents(model, bones, 0.1, seek, 20);
    expect(Object.keys(samples[0].positions).sort()).toEqual([
      "Head",
      "Hips",
      "RightArm",
      "RightForeArm",
      "RightHand",
    ]);
    expect(samples[0].positions.RightHand).not.toBe(hand.position);
    expect(
      samples[0].positions.RightHand.distanceTo(hand.getWorldPosition(V()))
    ).toBeCloseTo(0, 12);
    expect(samples[0].angles).toEqual(measureMocapAngles(model, bones));
    expect(samples[0].angles.rightElbowAngle.value).toBeCloseTo(180);
    expect(samples.at(-1)!.angles.rightElbowAngle.value).toBeLessThan(180);
    expect(samples[0].positions.RightHand).not.toBe(
      samples[1].positions.RightHand
    );
    const before = samples[0].positions.RightHand.clone();
    samples[1].positions.RightHand.set(99, 99, 99);
    expect(samples[0].positions.RightHand.equals(before)).toBe(true);
    expect(bones.map(bone => bone.name)).toEqual(names);
    expect(bones.map(bone => bone.parent)).toEqual(hierarchy);
    expect(model.animations[0]).toBe(source);
    expect(Array.from(source.tracks[0].values)).toEqual(sourceValues);
    expect(hand.position.toArray()).toEqual([0.3, 0, 0]);
  });
  it("resets seek zero in finally even when seeking fails", () => {
    const rig = samplingRig();
    const seek = vi.fn((time: number) => {
      if (time > 0) throw new Error("evaluation failed");
    });
    expect(() => sampleMotionEvents(rig.model, rig.bones, 0.1, seek)).toThrow(
      "evaluation failed"
    );
    expect(seek).toHaveBeenLastCalledWith(0);
  });
  it.each([-1, NaN, Infinity])(
    "rejects invalid duration %s and still resets",
    duration => {
      const rig = samplingRig();
      expect(() =>
        sampleMotionEvents(rig.model, rig.bones, duration, rig.seek)
      ).toThrow(RangeError);
      expect(rig.seek).toHaveBeenLastCalledWith(0);
    }
  );
  it.each([0, -1, NaN, Infinity])(
    "rejects invalid rate %s and still resets",
    rate => {
      const rig = samplingRig();
      expect(() =>
        sampleMotionEvents(rig.model, rig.bones, 1, rig.seek, rate)
      ).toThrow(RangeError);
      expect(rig.seek).toHaveBeenLastCalledWith(0);
    }
  );
});

describe("throw extension / wrist-speed proxies", () => {
  it.each(["right", "left"] as const)(
    "detects strong %s extension with actual cocking minimum and in-burst release",
    side => {
      const result = detectMotionEvents(
        extensionFixture({ side }),
        "throw",
        side
      );
      expect(result.sampleRate).toBe(96);
      expect(result.events.map(event => event.id)).toEqual([
        "max-cocking",
        "release",
        "follow-through",
      ]);
      expect(eventTime(result, "max-cocking")).toBeCloseTo(0.5, 2);
      expect(eventTime(result, "release")).toBeCloseTo(0.85, 2);
      expect(eventTime(result, "follow-through")).toBeGreaterThan(
        eventTime(result, "release")
      );
      expect(
        result.events.every(event =>
          ["low", "medium"].includes(event.confidence)
        )
      ).toBe(true);
      expect(
        result.events.find(event => event.id === "release")!.method
      ).toMatch(/world active-wrist.*not observed ball release/);
      expect(result.warnings.join(" ")).toMatch(/no ball or tool tracking/);
    }
  );
  it("excludes a much faster later recovery wrist movement and its smaller unrelated elbow minimum", () => {
    const samples = extensionFixture({ recovery: true });
    const result = detectMotionEvents(samples, "throw", "right");
    const recoverySpeed =
      (samples[164].positions.RightHand.x -
        samples[162].positions.RightHand.x) /
      (samples[164].time - samples[162].time);
    expect(recoverySpeed).toBeGreaterThan(10);
    expect(eventTime(result, "release")).toBeCloseTo(0.85, 2);
    expect(eventTime(result, "max-cocking")).toBeCloseTo(0.5, 2);
    expect(
      Math.min(...samples.map(sample => sample.angles.rightElbowAngle.value!))
    ).toBe(20);
  });
  it("selects the strongest qualifying extension burst and its contiguous valley, not a prior unrelated minimum", () => {
    const samples = extensionFixture({ recovery: true });
    for (const sample of samples) {
      if (sample.time > 1.2)
        sample.angles.rightElbowAngle.value =
          sample.time < 1.5
            ? lerpRange(sample.time, 1.2, 1.5, 165, 90)
            : lerpRange(sample.time, 1.5, 1.9, 90, 170);
    }
    const result = detectMotionEvents(samples, "throw", "right");
    expect(eventTime(result, "release")).toBeCloseTo(1.7, 2);
    expect(eventTime(result, "max-cocking")).toBeCloseTo(1.5, 2);
    expect(result.warnings.join(" ")).toMatch(
      /Multiple qualifying extension bursts/
    );
  });
  it("uses raw minimum values rather than the smoothed derivative signal", () => {
    const samples = extensionFixture();
    samples[48].angles.rightElbowAngle.value = 54;
    const result = detectMotionEvents(samples, "throw", "right");
    expect(eventTime(result, "max-cocking")).toBe(samples[48].time);
  });
  it("does not invent release without appreciable sustained extension", () => {
    for (const variant of ["staticAngle", "tinyGain", "oneFrame"] as const) {
      const samples = extensionFixture();
      samples.forEach((sample, i) => {
        sample.angles.rightElbowAngle.value =
          variant === "staticAngle"
            ? 90
            : variant === "tinyGain"
              ? lerpRange(sample.time, 0.5, 1.2, 90, 105)
              : i < 82
                ? 60
                : 150; // Deliberately coincident with the wrist-speed peak.
      });
      const result = detectMotionEvents(samples, "throw", "right");
      expect(result.events, variant).toEqual([]);
      expect(result.warnings.join(" ")).toMatch(
        /No sustained forward elbow extension/
      );
    }
  });
  it("will not substitute opposite-hand landmarks or angles", () => {
    expect(
      detectMotionEvents(extensionFixture({ side: "left" }), "throw", "right")
        .events
    ).toEqual([]);
    const samples = extensionFixture();
    for (const sample of samples) delete sample.positions.RightHand;
    const result = detectMotionEvents(samples, "throw", "right");
    expect(result.events).toEqual([]);
    expect(result.warnings.join(" ")).toContain("RightHand");
  });
  it("reports missing follow-through explicitly when post-peak motion stays above the decay threshold", () => {
    const samples = extensionFixture({ times: grid(1.2) });
    for (const sample of samples) {
      if (sample.time > 0.85)
        sample.positions.RightHand.x = 0.95 + 1.4 * (sample.time - 0.85);
    }
    const result = detectMotionEvents(samples, "throw", "right");
    expect(result.events.some(event => event.id === "release")).toBe(true);
    expect(result.events.some(event => event.id === "follow-through")).toBe(
      false
    );
    expect(result.warnings.join(" ")).toMatch(
      /Follow-through unavailable.*before clip end/
    );
  });
});

describe("swing and kick proxies", () => {
  it("uses a two-hand mean-speed main burst and last meaningful prestrike speed trough for swing", () => {
    const result = detectMotionEvents(swingFixture(), "swing", "right");
    expect(eventTime(result, "strike")).toBeCloseTo(0.95, 2);
    expect(eventTime(result, "backswing")).toBeGreaterThan(0.55);
    expect(eventTime(result, "backswing")).toBeLessThan(0.7);
    expect(eventTime(result, "follow-through")).toBeGreaterThan(1);
    expect(result.events.find(event => event.id === "strike")!.method).toMatch(
      /mean of both world hand origins/
    );
    expect(detectMotionEvents(swingFixture(), "swing", "left")).toEqual(result);
  });
  it("does not use a large single-hand speed when the two-hand grip mean is stationary", () => {
    const samples = swingFixture();
    for (const sample of samples)
      sample.positions.LeftHand.x = -sample.positions.RightHand.x;
    expect(detectMotionEvents(samples, "swing", "right").events).toEqual([]);
  });
  it("does not invent a swing backswing when there was no prior meaningful motion", () => {
    const samples = swingFixture();
    for (const sample of samples) {
      sample.positions.LeftHand.x =
        -0.5 + smoothTravel(sample.time, 0.7, 1.2, 1.1);
      sample.positions.RightHand.x =
        0.5 + smoothTravel(sample.time, 0.7, 1.2, 1.1);
    }
    const result = detectMotionEvents(samples, "swing", "right");
    expect(eventTime(result, "strike")).toBeCloseTo(0.95, 2);
    expect(result.events.some(event => event.id === "backswing")).toBe(false);
    expect(result.warnings.join(" ")).toMatch(/Backswing unavailable/);
  });
  it("requires both hands for a swing", () => {
    const samples = swingFixture();
    delete samples[20].positions.LeftHand;
    const result = detectMotionEvents(samples, "swing", "right");
    expect(result.events).toEqual([]);
    expect(result.warnings.join(" ")).toMatch(/Missing.*LeftHand/);
  });
  it.each(["left", "right"] as const)(
    "gates %s kick foot strike to knee extension and reports a prior knee minimum",
    side => {
      const result = detectMotionEvents(
        extensionFixture({ kick: true, side, recovery: true }),
        "kick",
        side
      );
      expect(result.events.map(event => event.id)).toEqual([
        "backswing",
        "strike",
        "follow-through",
      ]);
      expect(eventTime(result, "backswing")).toBeCloseTo(0.5, 2);
      expect(eventTime(result, "strike")).toBeCloseTo(0.85, 2);
      expect(
        result.events.find(event => event.id === "strike")!.method
      ).toMatch(/hip-relative active-foot.*no ball contact/);
    }
  );
  it("does not infer a kick from a moving foot without knee extension", () => {
    const samples = extensionFixture({ kick: true });
    samples.forEach(sample => {
      sample.angles.rightKneeAngle.value = 100;
    });
    expect(detectMotionEvents(samples, "kick", "right").events).toEqual([]);
  });
});

describe("conservative input handling, time discipline, and purity", () => {
  it.each(["throw", "swing", "kick"] as const)(
    "rejects static and whole-rig translated static motion for %s",
    kind => {
      const samples = grid().map(baseSample);
      expect(detectMotionEvents(samples, kind, "right").events).toEqual([]);
      expect(
        detectMotionEvents(translated(samples), kind, "right").events
      ).toEqual([]);
    }
  );
  it("still rejects translated static wrists even if supplied angles appear to extend", () => {
    const samples = extensionFixture();
    samples.forEach(sample => {
      sample.positions.RightHand = V(0.5, 0.7);
    });
    expect(
      detectMotionEvents(translated(samples), "throw", "right").events
    ).toEqual([]);
  });
  it.each(["swing", "kick"] as const)(
    "makes %s event timing invariant to global translation and uniform unit scale",
    kind => {
      const samples =
        kind === "swing" ? swingFixture() : extensionFixture({ kick: true });
      const original = detectMotionEvents(samples, kind, "right");
      expect(
        detectMotionEvents(translated(samples), kind, "right").events
      ).toEqual(original.events);
      const scaled = samples.map(sample => ({
        ...sample,
        positions: Object.fromEntries(
          Object.entries(sample.positions).map(([key, point]) => [
            key,
            point.clone().multiplyScalar(0.001),
          ])
        ),
      }));
      expect(detectMotionEvents(scaled, kind, "right").events).toEqual(
        original.events
      );
    }
  );
  it("rejects a tiny two-hand motion instead of treating normalized numerical noise as strike", () => {
    const samples = swingFixture();
    for (const sample of samples) {
      sample.positions.LeftHand.x =
        -0.5 + (sample.positions.LeftHand.x + 0.5) * 0.001;
      sample.positions.RightHand.x =
        0.5 + (sample.positions.RightHand.x - 0.5) * 0.001;
    }
    expect(detectMotionEvents(samples, "swing", "right").events).toEqual([]);
  });
  it("uses actual irregular timestamp deltas, not the nominal sample rate", () => {
    const times = [0];
    let i = 0;
    while (times.at(-1)! < 2.4) {
      times.push(Math.min(2.4, times.at(-1)! + [0.013, 0.021, 0.017][i++ % 3]));
    }
    const samples = extensionFixture({ times });
    const result = detectMotionEvents(samples, "throw", "right", 96);
    expect(eventTime(result, "release")).toBeCloseTo(0.85, 1);
    expect(eventTime(result, "max-cocking")).toBeCloseTo(0.5, 1);
    const otherRate = detectMotionEvents(samples, "throw", "right", 10);
    expect(otherRate.events).toEqual(result.events);
    expect(otherRate.sampleRate).toBe(10);
  });
  it("supports a low-fps burst conservatively and refuses very short/undersampled clips", () => {
    const result = detectMotionEvents(
      extensionFixture({ times: grid(2.4, 12) }),
      "throw",
      "right",
      12
    );
    expect(eventTime(result, "release")).toBeCloseTo(0.85, 1);
    expect(result.events.every(event => event.confidence === "low")).toBe(true);
    expect(result.warnings.join(" ")).toMatch(/Low temporal resolution/);
    for (const times of [
      [],
      [0],
      [0, 0.1, 0.2],
      [0, 0.001, 0.002, 0.003, 0.004],
    ]) {
      expect(
        detectMotionEvents(times.map(baseSample), "throw", "right").events
      ).toEqual([]);
    }
  });
  it.each(["duplicate", "reverse", "nonfinite", "negative", "gap"] as const)(
    "rejects %s timestamps without sorting or extrapolation",
    variant => {
      const samples = extensionFixture();
      if (variant === "duplicate") samples[20].time = samples[19].time;
      if (variant === "reverse") samples[20].time = samples[19].time - 0.01;
      if (variant === "nonfinite") samples[20].time = NaN;
      if (variant === "negative") samples[0].time = -0.1;
      if (variant === "gap") samples.splice(20, 50);
      const before = snapshot(samples);
      const result = detectMotionEvents(samples, "throw", "right");
      expect(result.events).toEqual([]);
      expect(snapshot(samples)).toEqual(before);
      expect(result.warnings.join(" ")).toMatch(/timestamps|gap exceeds/);
    }
  );
  it.each([
    "angleMissing",
    "angleNonfinite",
    "positionMissing",
    "positionNonfinite",
    "hipsMissing",
  ] as const)("refuses %s required data rather than bridging it", variant => {
    const samples = extensionFixture();
    if (variant === "angleMissing")
      samples[50].angles.rightElbowAngle = {
        value: null,
        reason: "Missing bone",
      };
    if (variant === "angleNonfinite")
      samples[50].angles.rightElbowAngle.value = Infinity;
    if (variant === "positionMissing") delete samples[50].positions.RightHand;
    if (variant === "positionNonfinite")
      samples[50].positions.RightHand.x = NaN;
    if (variant === "hipsMissing") delete samples[50].positions.Hips;
    const result = detectMotionEvents(samples, "throw", "right");
    expect(result.events).toEqual([]);
    expect(result.warnings.join(" ")).toMatch(/Missing|non-finite/);
  });
  it("uses a disclosed body-scale fallback when Head and limb anchors are unavailable", () => {
    const samples = extensionFixture();
    for (const sample of samples) {
      delete sample.positions.Head;
      delete sample.positions.RightArm;
      delete sample.positions.RightForeArm;
    }
    const result = detectMotionEvents(samples, "throw", "right");
    expect(eventTime(result, "release")).toBeCloseTo(0.85, 2);
    expect(result.warnings.join(" ")).toMatch(/hip-to-effector distance/);
  });
  it("does not select a rising clip endpoint as release or strike", () => {
    const samples = grid(1).map(time => {
      const sample = baseSample(time);
      sample.angles.rightElbowAngle.value = 60 + 100 * time;
      sample.angles.rightKneeAngle.value = 60 + 100 * time;
      sample.positions.RightHand.x += time * time;
      sample.positions.LeftHand.x += time * time;
      sample.positions.RightFoot.x += time * time;
      return sample;
    });
    for (const kind of ["throw", "swing", "kick"] as const)
      expect(detectMotionEvents(samples, kind, "right").events).toEqual([]);
  });
  it("is deterministic and leaves all source arrays, angle records, and vector snapshots untouched", () => {
    const samples = extensionFixture({ recovery: true });
    const before = snapshot(samples);
    const vectors = samples.map(sample => sample.positions.RightHand);
    for (const sample of samples) {
      Object.values(sample.positions).forEach(Object.freeze);
      Object.values(sample.angles).forEach(Object.freeze);
      Object.freeze(sample.angles);
      Object.freeze(sample.positions);
      Object.freeze(sample);
    }
    Object.freeze(samples);
    const first = detectMotionEvents(samples, "throw", "right");
    expect(detectMotionEvents(samples, "throw", "right")).toEqual(first);
    expect(snapshot(samples)).toEqual(before);
    expect(samples.map(sample => sample.positions.RightHand)).toEqual(vectors);
  });
});
