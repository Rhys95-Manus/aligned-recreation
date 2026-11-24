import * as THREE from "three";
import { measureMocapAngles, type MocapAngleMeasurements } from "./mocapAngles";

export type MotionEventKind = "throw" | "swing" | "kick";
export type MotionSide = "left" | "right";

export interface MotionSample {
  /** Seconds on the sampled clip's timeline, not source-file seconds. */
  time: number;
  angles: MocapAngleMeasurements;
  /** Independent WORLD joint-origin snapshots, keyed by e.g. RightHand / Hips. */
  positions: Record<string, THREE.Vector3>;
}

export interface DetectedMotionEvent {
  id: "max-cocking" | "release" | "backswing" | "strike" | "follow-through";
  time: number;
  confidence: "medium" | "low";
  method: string;
}

export interface MotionEventDetection {
  events: DetectedMotionEvent[];
  warnings: string[];
  /** Requested nominal rate; detection always differentiates using actual times. */
  sampleRate: number;
}

/**
 * Seek in clip seconds, sample the uniform grid, exact native-key times and
 * exact endpoint, and always restore time zero. Invalid/out-of-bounds extra
 * times are ignored; valid times are sorted and exactly deduplicated (no rounding
 * away off-grid keys). Does not rename bones or edit animation/source data.
 * The seek callback owns evaluation of the animation (including the endpoint).
 */
export function sampleMotionEvents(
  model: THREE.Object3D,
  bones: readonly THREE.Bone[],
  duration: number,
  seek: (t: number) => void,
  sampleRate = 96,
  additionalTimes: readonly number[] = []
): MotionSample[] {
  const samples: MotionSample[] = [];
  try {
    if (!Number.isFinite(duration) || duration < 0) {
      throw new RangeError(
        "Motion sample duration must be finite and non-negative."
      );
    }
    if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
      throw new RangeError("Motion sample rate must be finite and positive.");
    }
    const count = Math.ceil(duration * sampleRate);
    if (!Number.isSafeInteger(count)) {
      throw new RangeError("Motion sampling grid is too large.");
    }
    const landmarks = bones.flatMap(bone => {
      const name = bone.name.replace(/:/g, "");
      // Match the canonical namespace used by measureMocapAngles, not fuzzy names.
      const suffix = name.startsWith("mixamorig") ? name.slice(9) : "";
      return /^[A-Z][A-Za-z0-9]*$/.test(suffix) ? [{ bone, suffix }] : [];
    });
    const capture = (time: number) => {
      seek(time);
      const angles = measureMocapAngles(model, bones);
      const positions: Record<string, THREE.Vector3> = {};
      for (const { bone, suffix } of landmarks) {
        positions[suffix] = bone.getWorldPosition(new THREE.Vector3());
      }
      samples.push({ time, angles, positions });
    };
    // Integer grid indices avoid cumulative floating-point drift and duplicates.
    const times = new Set<number>([duration]);
    for (let frame = 0; frame < count; frame++) {
      const time = frame / sampleRate;
      if (time < duration) times.add(time);
    }
    for (const time of additionalTimes) {
      if (Number.isFinite(time) && time >= 0 && time <= duration)
        times.add(time);
    }
    for (const time of Array.from(times).sort((a, b) => a - b)) capture(time);
    return samples;
  } finally {
    seek(0);
    model.updateWorldMatrix(true, true);
  }
}

interface Burst {
  start: number;
  end: number;
  gain: number;
}
interface EffectorSignal {
  relative: THREE.Vector3[];
  velocities: THREE.Vector3[];
  speeds: number[];
  worldSpeeds: number[];
}

const PROXY_WARNING =
  "Kinematic proxies only: no ball or tool tracking. Release is a wrist-speed proxy, not observed ball release; strike is not observed contact.";
const EXTENSION_RATE = 30; // Interior angle increases toward a straight limb.
const EXTENSION_GAIN = 20;
const MIN_BURST_SECONDS = 0.03;
const MIN_ACTIVITY_SPEED = 0.35; // Body-scale units / second.
const MIN_ACTIVITY_TRAVEL = 0.05; // Body-scale units.

function finitePoint(point: THREE.Vector3 | undefined): point is THREE.Vector3 {
  return !!point && [point.x, point.y, point.z].every(Number.isFinite);
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** Three-point central differences, including unequal left/right time intervals. */
function velocities(
  points: readonly THREE.Vector3[],
  times: readonly number[]
): THREE.Vector3[] {
  return points.map((_point, i) => {
    if (i === 0 || i === points.length - 1)
      return new THREE.Vector3(NaN, NaN, NaN);
    const left = times[i] - times[i - 1];
    const right = times[i + 1] - times[i];
    const before = points[i]
      .clone()
      .sub(points[i - 1])
      .divideScalar(left);
    const after = points[i + 1].clone().sub(points[i]).divideScalar(right);
    return before
      .multiplyScalar(right / (left + right))
      .addScaledVector(after, left / (left + right));
  });
}

function signal(
  samples: readonly MotionSample[],
  times: readonly number[],
  keys: readonly string[],
  side: string,
  warnings: string[]
): EffectorSignal | null {
  const required = ["Hips", ...keys];
  for (const key of required) {
    if (samples.some(sample => !finitePoint(sample.positions[key]))) {
      warnings.push(
        `Missing or non-finite landmark ${key}; no events inferred.`
      );
      return null;
    }
  }
  const means = samples.map(sample => {
    const point = new THREE.Vector3();
    for (const key of keys) point.add(sample.positions[key]);
    return point.divideScalar(keys.length);
  });
  // A fixed robust scale avoids dependence on asset units. Head is optional; a
  // limb chain is the next best anchor, then a disclosed hip-to-effector scale.
  const heights = samples.flatMap(sample =>
    finitePoint(sample.positions.Head)
      ? [sample.positions.Head.distanceTo(sample.positions.Hips)]
      : []
  );
  const limb = keys[0].endsWith("Foot")
    ? [`${side}UpLeg`, `${side}Leg`, `${side}Foot`]
    : [`${side}Arm`, `${side}ForeArm`, `${side}Hand`];
  const lengths = samples.flatMap(sample =>
    limb.every(key => finitePoint(sample.positions[key]))
      ? [
          sample.positions[limb[0]].distanceTo(sample.positions[limb[1]]) +
            sample.positions[limb[1]].distanceTo(sample.positions[limb[2]]),
        ]
      : []
  );
  const positive = (values: number[]) =>
    values.filter(value => Number.isFinite(value) && value > 1e-8);
  const heightScale = positive(heights);
  const limbScale = positive(lengths);
  let anchors = heightScale.length === samples.length ? heightScale : limbScale;
  if (anchors.length !== samples.length) {
    anchors = positive(
      means.map((point, i) => point.distanceTo(samples[i].positions.Hips))
    );
    warnings.push(
      "Body scale uses hip-to-effector distance because complete Head/limb anchors are unavailable; activity thresholds are approximate."
    );
  }
  if (!anchors.length) {
    warnings.push(
      "Degenerate body scale; normalized activity cannot be established."
    );
    return null;
  }
  const scale = median(anchors);
  const relative = means.map((point, i) =>
    point.clone().sub(samples[i].positions.Hips).divideScalar(scale)
  );
  const relativeVelocities = velocities(relative, times);
  const worldVelocities = velocities(means, times);
  const speeds = relativeVelocities.map(velocity => velocity.length());
  const worldSpeeds = worldVelocities.map(velocity => velocity.length());
  if (
    speeds.slice(1, -1).some(speed => !Number.isFinite(speed)) ||
    worldSpeeds.slice(1, -1).some(speed => !Number.isFinite(speed))
  ) {
    warnings.push("Non-finite effector velocity; no events inferred.");
    return null;
  }
  return { relative, velocities: relativeVelocities, speeds, worldSpeeds };
}

function travel(
  points: readonly THREE.Vector3[],
  start: number,
  end: number
): number {
  let distance = 0;
  for (let i = start + 1; i <= end; i++)
    distance += points[i].distanceTo(points[i - 1]);
  return distance;
}

function extensionBursts(
  values: readonly number[],
  times: readonly number[]
): Burst[] {
  // Light sample smoothing is ONLY for the derivative gate, never the minimum.
  const smooth = values.map((value, i) =>
    i === 0 || i === values.length - 1
      ? value
      : (values[i - 1] + 2 * value + values[i + 1]) / 4
  );
  const bursts: Burst[] = [];
  let start = -1;
  const close = (end: number) => {
    // Smoothing must not turn a single angle jump into a sustained extension.
    let observedForwardIntervals = 0;
    if (start >= 0) {
      for (let i = start; i < end; i++) {
        if (
          (values[i + 1] - values[i]) / (times[i + 1] - times[i]) >
          EXTENSION_RATE
        ) {
          observedForwardIntervals++;
        }
      }
    }
    if (
      start >= 0 &&
      end - start >= 3 &&
      times[end] - times[start] >= MIN_BURST_SECONDS &&
      observedForwardIntervals >= 3 &&
      values[end] - values[start] > EXTENSION_GAIN
    ) {
      bursts.push({ start, end, gain: values[end] - values[start] });
    }
    start = -1;
  };
  for (let i = 0; i < values.length - 1; i++) {
    const rate = (smooth[i + 1] - smooth[i]) / (times[i + 1] - times[i]);
    if (rate > EXTENSION_RATE) {
      if (start < 0) start = i;
    } else close(i);
  }
  close(values.length - 1);
  return bursts;
}

/** An observed interior speed maximum, not a one-sided clip-end estimate. */
function peakWithin(
  speeds: readonly number[],
  times: readonly number[],
  start: number,
  end: number
): number | null {
  let best: number | null = null;
  for (let i = Math.max(2, start); i <= Math.min(speeds.length - 3, end); i++) {
    const peak = speeds[i];
    if (!(peak > 0) || peak < speeds[i - 1] || peak < speeds[i + 1]) continue;
    // Reject a flat constant-speed clip or an unobserved rising/falling peak.
    let lowerBefore = false;
    let lowerAfter = false;
    for (let j = i - 1; j >= 1 && times[i] - times[j] <= 1.5; j--) {
      if (speeds[j] < peak * 0.9) {
        lowerBefore = true;
        break;
      }
    }
    for (
      let j = i + 1;
      j < speeds.length - 1 && times[j] - times[i] <= 1.5;
      j++
    ) {
      if (speeds[j] < peak * 0.9) {
        lowerAfter = true;
        break;
      }
    }
    if (lowerBefore && lowerAfter && (best === null || peak > speeds[best]))
      best = i;
  }
  return best;
}

/**
 * Search the contiguous preparatory valley immediately tied to this extension.
 * Stop at an earlier separate cycle's crest; never use the clip-global minimum
 * (which can belong to an unrelated setup or a later recovery).
 */
function precedingMinimum(
  values: readonly number[],
  times: readonly number[],
  burst: Burst,
  peak: number
): number {
  // Smoothing can make the gate start a frame before the actual raw minimum.
  const anchor = Math.min(burst.start + 2, peak - 1);
  let minimum = anchor;
  let crest = values[anchor];
  let approachingCocking = false;
  for (let i = anchor - 1; i >= 0 && times[anchor] - times[i] <= 1.5; i--) {
    if (approachingCocking && values[i] < crest - 5) break;
    if (values[i] < values[minimum]) minimum = i;
    if (values[i] > values[minimum] + 5) approachingCocking = true;
    crest = Math.max(crest, values[i]);
  }
  return minimum;
}

function swingBackswing(
  effector: EffectorSignal,
  times: readonly number[],
  peak: number
): number | null {
  const speeds = effector.speeds;
  const peakSpeed = speeds[peak];
  let last: number | null = null;
  for (let i = 2; i <= peak - 2; i++) {
    if (times[peak] - times[i] > 1.5 || times[peak] - times[i] < 0.04) continue;
    let beforePeak = 0;
    for (let j = i - 1; j >= 1 && times[i] - times[j] <= 0.5; j--)
      beforePeak = Math.max(beforePeak, speeds[j]);
    const trough =
      speeds[i] <= speeds[i - 1] &&
      speeds[i] <= speeds[i + 1] &&
      speeds[i] < peakSpeed * 0.45 &&
      beforePeak - speeds[i] > peakSpeed * 0.2;
    const before = effector.velocities[i - 1];
    const after = effector.velocities[i + 1];
    const reversed =
      before.length() > peakSpeed * 0.15 &&
      after.length() > peakSpeed * 0.15 &&
      before.clone().normalize().dot(after.clone().normalize()) < -0.2;
    if (beforePeak > peakSpeed * 0.2 && (trough || reversed)) last = i;
  }
  return last;
}

function addFollowThrough(
  result: MotionEventDetection,
  samples: readonly MotionSample[],
  speeds: readonly number[],
  peak: number,
  mediumConfidence: boolean,
  speedDescription: string
): void {
  let start = -1;
  for (let i = peak + 1; i < samples.length - 1; i++) {
    if (Number.isFinite(speeds[i]) && speeds[i] <= speeds[peak] * 0.25) {
      if (start < 0) start = i;
      if (i - start + 1 >= 3 && samples[i].time - samples[start].time >= 0.04) {
        result.events.push({
          id: "follow-through",
          time: samples[start].time,
          confidence: mediumConfidence ? "medium" : "low",
          method: `Speed-decay proxy: ${speedDescription} below 25% of the primary peak for at least three samples and 40 ms; not a biomechanical follow-through endpoint.`,
        });
        return;
      }
    } else start = -1;
  }
  result.warnings.push(
    "Follow-through unavailable: no sustained effector speed decay below 25% of the primary peak was observed before clip end."
  );
}

/**
 * Pure, conservative heuristics for one dominant action in a clip. Coordinates
 * are not reoriented into a target plane: 'forward' means sustained elbow/knee
 * interior-angle extension, NOT a validated target direction. Translation is
 * removed for activity gating and swing/kick speed; throw release uses WORLD
 * wrist speed as requested. No equipment/contact inference or phase resolution.
 */
export function detectMotionEvents(
  samples: readonly MotionSample[],
  kind: MotionEventKind,
  side: MotionSide,
  sampleRate = 96
): MotionEventDetection {
  const validRate = Number.isFinite(sampleRate) && sampleRate > 0;
  const result: MotionEventDetection = {
    events: [],
    warnings: [PROXY_WARNING],
    sampleRate: validRate ? sampleRate : 96,
  };
  if (!validRate)
    result.warnings.push(
      "Invalid nominal sample rate; reporting the default 96 Hz. Actual timestamps still govern derivatives."
    );
  if (
    !["throw", "swing", "kick"].includes(kind) ||
    !["left", "right"].includes(side)
  ) {
    result.warnings.push(
      "Unsupported motion kind or side; no events inferred."
    );
    return result;
  }
  const times = samples.map(sample => sample.time);
  if (
    times.some(
      (time, i) =>
        !Number.isFinite(time) || time < 0 || (i > 0 && time <= times[i - 1])
    )
  ) {
    result.warnings.push(
      "Non-finite, negative, duplicate, or out-of-order timestamps; no events inferred (samples are not sorted or repaired)."
    );
    return result;
  }
  if (samples.length < 5 || times[times.length - 1] - times[0] < 0.03) {
    result.warnings.push(
      "Clip too short or too sparsely sampled to establish sustained motion and an interior speed peak."
    );
    return result;
  }
  const deltas = times.slice(1).map((time, i) => time - times[i]);
  const effectiveRate = 1 / median(deltas);
  const largestGap = Math.max(...deltas);
  const mediumConfidence =
    effectiveRate >= 30 && largestGap <= 0.1 && samples.length >= 10;
  if (!mediumConfidence || times[times.length - 1] - times[0] < 0.2) {
    result.warnings.push(
      "Low temporal resolution or short clip; proxy timing is uncertain. Upsampling cannot recover missing source frames."
    );
  }
  if (largestGap > 0.25) {
    result.warnings.push(
      "Timestamp gap exceeds 250 ms; sustained bursts cannot be established reliably, so no events inferred."
    );
    return result;
  }
  const canonicalSide = side === "right" ? "Right" : "Left";
  const keys =
    kind === "swing"
      ? ["LeftHand", "RightHand"]
      : [`${canonicalSide}${kind === "kick" ? "Foot" : "Hand"}`];
  const effector = signal(samples, times, keys, canonicalSide, result.warnings);
  if (!effector) return result;

  let peak: number | null = null;
  let primarySpeeds = effector.speeds;
  let speedDescription =
    kind === "swing"
      ? "hip-relative mean-of-two-hands speed"
      : "hip-relative active-foot speed";
  if (kind === "swing") {
    const maximum = Math.max(...effector.speeds.slice(1, -1));
    const threshold = Math.max(MIN_ACTIVITY_SPEED, maximum * 0.2);
    let start = -1;
    const close = (end: number) => {
      if (
        start >= 0 &&
        end - start >= 2 &&
        times[end] - times[start] >= MIN_BURST_SECONDS &&
        travel(effector.relative, start, end) > 0.08
      ) {
        const candidate = peakWithin(effector.speeds, times, start, end);
        if (
          candidate !== null &&
          (peak === null || effector.speeds[candidate] > effector.speeds[peak])
        )
          peak = candidate;
      }
      start = -1;
    };
    for (let i = 1; i < samples.length - 1; i++) {
      if (effector.speeds[i] > threshold) {
        if (start < 0) start = i;
      } else close(i - 1);
    }
    close(samples.length - 2);
    if (peak === null) {
      result.warnings.push(
        "No appreciable main two-hand activity burst with an observed interior speed peak; static, tiny, translation-only, or clip-boundary motion is not assigned a strike."
      );
      return result;
    }
    const backswing = swingBackswing(effector, times, peak);
    if (backswing !== null)
      result.events.push({
        id: "backswing",
        time: times[backswing],
        confidence: "low",
        method:
          "Backswing proxy: last meaningful preceding hip-relative two-hand speed trough or direction reversal within 1.5 s of strike; no tool orientation tracked.",
      });
    else
      result.warnings.push(
        "Backswing unavailable: no meaningful preceding two-hand speed trough/direction reversal within 1.5 s; no preparation event invented."
      );
    result.events.push({
      id: "strike",
      time: times[peak],
      confidence: "low",
      method:
        "Strike proxy: peak hip-relative speed of the mean of both world hand origins in the dominant activity burst; no bat/racket/club or ball contact tracked.",
    });
  } else {
    const angleKey =
      `${side}${kind === "throw" ? "Elbow" : "Knee"}Angle` as keyof MocapAngleMeasurements;
    const values = samples.map(sample => sample.angles[angleKey]?.value);
    if (
      values.some(
        value =>
          value == null || !Number.isFinite(value) || value < 0 || value > 180
      )
    ) {
      result.warnings.push(
        `Missing, non-finite, or invalid ${angleKey} measurement; no extension events inferred.`
      );
      return result;
    }
    const angles = values as number[];
    const bursts = extensionBursts(angles, times);
    if (kind === "throw") {
      primarySpeeds = effector.worldSpeeds;
      speedDescription = "world active-wrist speed";
    }
    let dominant: Burst | null = null;
    let eligible = 0;
    for (const burst of bursts) {
      const candidate = peakWithin(
        primarySpeeds,
        times,
        burst.start,
        burst.end
      );
      if (
        candidate === null ||
        effector.speeds[candidate] < MIN_ACTIVITY_SPEED ||
        travel(effector.relative, burst.start, burst.end) < MIN_ACTIVITY_TRAVEL
      )
        continue;
      eligible++;
      if (peak === null || primarySpeeds[candidate] > primarySpeeds[peak]) {
        peak = candidate;
        dominant = burst;
      }
    }
    if (peak === null || dominant === null) {
      result.warnings.push(
        `No sustained forward ${kind === "throw" ? "elbow" : "knee"} extension burst (>30 degrees/s for more than two intervals, >20 degrees gain) with appreciable normalized activity and an observed interior effector-speed peak; no events inferred.`
      );
      return result;
    }
    if (eligible > 1)
      result.warnings.push(
        "Multiple qualifying extension bursts; reporting only the burst tied to the strongest within-extension effector-speed peak."
      );
    const minimum = precedingMinimum(angles, times, dominant, peak);
    if (minimum === 0)
      result.warnings.push(
        "Preparatory minimum touches the clip start; earlier cocking/backswing may be outside the sampled clip."
      );
    result.events.push({
      id: kind === "throw" ? "max-cocking" : "backswing",
      time: times[minimum],
      confidence: "low",
      method: `${kind === "throw" ? "Max-cocking" : "Backswing"} proxy: actual unsmoothed minimum active ${kind === "throw" ? "elbow" : "knee"} interior angle in the contiguous preparation preceding the selected sustained extension burst; ${kind === "throw" ? "not shoulder external-rotation measurement" : "not foot/ball contact measurement"}.`,
    });
    result.events.push({
      id: kind === "throw" ? "release" : "strike",
      time: times[peak],
      confidence: "low",
      method: `${kind === "throw" ? "Release" : "Strike"} proxy: central-difference ${speedDescription} peak only within the dominant sustained ${kind === "throw" ? "elbow" : "knee"} extension burst, using actual time deltas; ${kind === "throw" ? "not observed ball release" : "no ball contact tracked"}.`,
    });
  }
  addFollowThrough(
    result,
    samples,
    primarySpeeds,
    peak,
    mediumConfidence,
    speedDescription
  );
  return result;
}
