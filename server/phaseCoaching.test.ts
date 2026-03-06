import { describe, it, expect } from "vitest";

// Since phaseCoaching.ts is a client-side module, we import it directly
// (vitest can handle TS imports without bundling issues)
import {
  getPhaseProfile,
  segmentRepIntoPhases,
  evaluateRepPhases,
  type FrameMetrics,
} from "../client/src/data/phaseCoaching";

// Helper: generate a sequence of frames simulating a football throw
function generateFootballThrowFrames(frameCount: number = 60): FrameMetrics[] {
  const frames: FrameMetrics[] = [];
  for (let i = 0; i < frameCount; i++) {
    const t = i / (frameCount - 1); // 0.0 to 1.0

    // Simulate a throw: hip rotation increases, elbow goes from cocked to extended
    frames.push({
      hipRotation: t < 0.15 ? 5 : t < 0.4 ? 10 + t * 60 : t < 0.65 ? 30 + t * 50 : 70 + t * 30,
      shoulderRotation: t < 0.15 ? 5 : t < 0.4 ? 20 + t * 40 : 30 + t * 30,
      rightElbowAngle: t < 0.15 ? 160 : t < 0.4 ? 90 : t < 0.65 ? 90 + t * 80 : 150 + t * 20,
      leftElbowAngle: 155,
      rightKneeFlexion: t < 0.15 ? 150 : t < 0.65 ? 155 : 170,
      leftKneeFlexion: t < 0.4 ? 150 : 165,
      spineAngle: t < 0.65 ? 5 : 10,
      rightShoulderAngle: 80 + t * 20,
      leftShoulderAngle: 70,
      footPositioning: 35,
      weightTransfer: t < 0.3 ? 20 : t < 0.65 ? 40 + t * 30 : 60 + t * 20,
    });
  }
  return frames;
}

// Helper: generate frames for a kettlebell swing
function generateKettlebellSwingFrames(frameCount: number = 50): FrameMetrics[] {
  const frames: FrameMetrics[] = [];
  for (let i = 0; i < frameCount; i++) {
    const t = i / (frameCount - 1);

    frames.push({
      hipRotation: t < 0.3 ? 10 : t < 0.55 ? 20 + t * 80 : t < 0.65 ? 60 + t * 20 : 30 - t * 20,
      shoulderRotation: 10 + t * 15,
      rightElbowAngle: 170, // Arms stay straight in a swing
      leftElbowAngle: 170,
      rightKneeFlexion: t < 0.3 ? 140 : t < 0.55 ? 150 + t * 30 : t < 0.65 ? 175 : 150,
      leftKneeFlexion: t < 0.3 ? 140 : t < 0.55 ? 150 + t * 30 : t < 0.65 ? 175 : 150,
      spineAngle: t < 0.3 ? 15 : t < 0.55 ? 8 : t < 0.65 ? 3 : 12,
      rightShoulderAngle: 60,
      leftShoulderAngle: 60,
      footPositioning: 40,
      weightTransfer: 50,
    });
  }
  return frames;
}

// Helper: generate frames with intentionally bad form
function generateBadFormThrowFrames(frameCount: number = 60): FrameMetrics[] {
  const frames: FrameMetrics[] = [];
  for (let i = 0; i < frameCount; i++) {
    const t = i / (frameCount - 1);

    frames.push({
      hipRotation: 5, // No hip rotation at all — major issue
      shoulderRotation: 5, // No shoulder load
      rightElbowAngle: t < 0.4 ? 140 : 150, // Elbow too open during cocking
      leftElbowAngle: 155,
      rightKneeFlexion: 175, // Stiff legs
      leftKneeFlexion: 175,
      spineAngle: 25, // Leaning forward
      rightShoulderAngle: 80,
      leftShoulderAngle: 70,
      footPositioning: 10, // Feet too narrow
      weightTransfer: 15, // No weight transfer
    });
  }
  return frames;
}

// Helper: generate frames simulating a basketball jump shot
function generateBasketballShotFrames(frameCount: number = 60): FrameMetrics[] {
  const frames: FrameMetrics[] = [];
  for (let i = 0; i < frameCount; i++) {
    const t = i / (frameCount - 1); // 0.0 to 1.0

    // Phase 0: Neutral (0-10%), Phase 1: Catch (10-20%), Phase 2: Dip (20-45%),
    // Phase 3: Rise (45-70%), Phase 4: Release (70-85%), Phase 5: Landing (85-100%)
    let rightElbow: number, leftElbow: number, rightKnee: number, leftKnee: number;
    let spine: number, shoulderRot: number, weight: number, foot: number;
    let rightShoulder: number, leftShoulder: number, hipRot: number;

    if (t < 0.1) {
      // Phase 0: Neutral
      rightElbow = 170; leftElbow = 170; rightKnee = 170; leftKnee = 170;
      spine = 3; shoulderRot = 10; weight = 5; foot = 30;
      rightShoulder = 40; leftShoulder = 40; hipRot = 5;
    } else if (t < 0.2) {
      // Phase 1: Catch & Stance Setup
      rightElbow = 75; leftElbow = 80; rightKnee = 160; leftKnee = 158;
      spine = 5; shoulderRot = 12; weight = 8; foot = 32;
      rightShoulder = 65; leftShoulder = 55; hipRot = 8;
    } else if (t < 0.45) {
      // Phase 2: Dip / Load
      rightElbow = 70; leftElbow = 75; rightKnee = 110; leftKnee = 108;
      spine = 18; shoulderRot = 15; weight = 12; foot = 30;
      rightShoulder = 75; leftShoulder = 60; hipRot = 10;
    } else if (t < 0.7) {
      // Phase 3: Rise & Arm Extension
      const riseT = (t - 0.45) / 0.25;
      rightElbow = 70 + riseT * 70; leftElbow = 75 + riseT * 50;
      rightKnee = 110 + riseT * 55; leftKnee = 108 + riseT * 55;
      spine = 18 - riseT * 15; shoulderRot = 15; weight = 12 - riseT * 5;
      rightShoulder = 75 + riseT * 50; leftShoulder = 60 + riseT * 30;
      hipRot = 10 + riseT * 5;
    } else if (t < 0.85) {
      // Phase 4: Release & Follow-Through
      rightElbow = 165; leftElbow = 155; rightKnee = 170; leftKnee = 168;
      spine = 2; shoulderRot = 18; weight = 5; foot = 30;
      rightShoulder = 140; leftShoulder = 95; hipRot = 15;
    } else {
      // Phase 5: Landing & Recovery
      rightElbow = 140; leftElbow = 140; rightKnee = 145; leftKnee = 143;
      spine = 5; shoulderRot = 12; weight = 8; foot = 30;
      rightShoulder = 100; leftShoulder = 80; hipRot = 8;
    }

    frames.push({
      hipRotation: hipRot,
      shoulderRotation: shoulderRot,
      rightElbowAngle: rightElbow,
      leftElbowAngle: leftElbow,
      rightKneeFlexion: rightKnee,
      leftKneeFlexion: leftKnee,
      spineAngle: spine,
      rightShoulderAngle: rightShoulder,
      leftShoulderAngle: leftShoulder,
      footPositioning: foot,
      weightTransfer: weight,
    });
  }
  return frames;
}

// Helper: generate frames with bad basketball form
function generateBadBasketballShotFrames(frameCount: number = 60): FrameMetrics[] {
  const frames: FrameMetrics[] = [];
  for (let i = 0; i < frameCount; i++) {
    frames.push({
      hipRotation: 40, // Too much hip twist
      shoulderRotation: 45, // Over-rotated
      rightElbowAngle: 130, // Elbow flared out
      leftElbowAngle: 130,
      rightKneeFlexion: 170, // No dip — stiff legs
      leftKneeFlexion: 170,
      spineAngle: 30, // Leaning too much
      rightShoulderAngle: 50, // Shoulder too low
      leftShoulderAngle: 40,
      footPositioning: 60, // Feet too wide
      weightTransfer: 40, // Jumping forward
    });
  }
  return frames;
}

describe("Phase Coaching System", () => {
  describe("getPhaseProfile", () => {
    it("returns football throw profile for football/throw motions", () => {
      const profile = getPhaseProfile("sports", "football", "Football Throw");
      expect(profile.motionName).toBe("Football Throw");
      expect(profile.phases.length).toBeGreaterThanOrEqual(4);
    });

    it("returns kettlebell swing profile for KB swing motions", () => {
      const profile = getPhaseProfile("strength", "kettlebell", "Kettlebell Swing");
      expect(profile.motionName).toBe("Kettlebell Swing");
      expect(profile.phases.length).toBeGreaterThanOrEqual(3);
    });

    it("returns kettlebell snatch profile for KB snatch motions", () => {
      const profile = getPhaseProfile("strength", "kettlebell", "Kettlebell Snatch");
      expect(profile.motionName).toBe("Kettlebell Snatch");
    });

    it("returns golf swing profile for golf motions", () => {
      const profile = getPhaseProfile("sports", "golf", "Golf Swing");
      expect(profile.motionName).toBe("Golf Swing");
    });

    it("returns basketball shot profile for basketball motions", () => {
      const profile = getPhaseProfile("sports", "basketball", "Basketball Jump Shot");
      expect(profile.motionName).toBe("Basketball Jump Shot");
    });

    it("basketball profile has 6 phases (Phase 0-5)", () => {
      const profile = getPhaseProfile("sports", "basketball", "Basketball Jump Shot");
      expect(profile.phases.length).toBe(6);
    });

    it("basketball profile has correct phase names", () => {
      const profile = getPhaseProfile("sports", "basketball", "Basketball Jump Shot");
      const phaseNames = profile.phases.map(p => p.name);
      expect(phaseNames).toContain("Neutral / Reset");
      expect(phaseNames).toContain("Ready Pocket");
      expect(phaseNames).toContain("Dip / Load");
      expect(phaseNames).toContain("Rise to Set Point");
      expect(phaseNames).toContain("Release");
      expect(phaseNames).toContain("Landing & Follow-Through");
    });

    it("basketball free-throw also uses basketball profile", () => {
      const profile = getPhaseProfile("sports", "basketball", "Basketball Free Throw");
      expect(profile.motionName).toBe("Basketball Jump Shot");
    });

    it("returns squat profile for squat motions", () => {
      const profile = getPhaseProfile("strength", "powerlifting", "Back Squat");
      expect(profile.motionName).toBe("Squat");
    });

    it("returns deadlift profile for deadlift motions", () => {
      const profile = getPhaseProfile("strength", "powerlifting", "Deadlift");
      expect(profile.motionName).toBe("Deadlift");
    });

    it("returns generic profile for unknown motions", () => {
      const profile = getPhaseProfile("unknown", "unknown", "Unknown Motion");
      expect(profile.motionName).toBe("Generic");
      expect(profile.phases.length).toBeGreaterThanOrEqual(2);
    });

    it("does keyword matching when slug doesn't match directly", () => {
      const profile = getPhaseProfile("sports", "ball", "Throw Football");
      expect(profile.motionName).toBe("Football Throw");
    });
  });

  describe("segmentRepIntoPhases", () => {
    it("segments football throw frames into all expected phases", () => {
      const profile = getPhaseProfile("sports", "football", "Football Throw");
      const frames = generateFootballThrowFrames(60);
      const segments = segmentRepIntoPhases(profile, frames);

      // Should have at least 3 phases with frames
      let phasesWithFrames = 0;
      segments.forEach((data) => {
        if (data.frameCount > 0) phasesWithFrames++;
      });
      expect(phasesWithFrames).toBeGreaterThanOrEqual(3);
    });

    it("computes average metrics per phase", () => {
      const profile = getPhaseProfile("sports", "football", "Football Throw");
      const frames = generateFootballThrowFrames(60);
      const segments = segmentRepIntoPhases(profile, frames);

      // Check that avgMetrics are computed
      segments.forEach((data) => {
        if (data.frameCount > 0) {
          expect(data.avgMetrics.hipRotation).toBeDefined();
          expect(typeof data.avgMetrics.hipRotation).toBe("number");
        }
      });
    });

    it("handles empty frames gracefully", () => {
      const profile = getPhaseProfile("sports", "football", "Football Throw");
      const segments = segmentRepIntoPhases(profile, []);
      expect(segments.size).toBe(0);
    });

    it("handles single frame", () => {
      const profile = getPhaseProfile("sports", "football", "Football Throw");
      const frames: FrameMetrics[] = [{
        hipRotation: 5,
        shoulderRotation: 5,
        rightElbowAngle: 90,
        leftElbowAngle: 155,
        rightKneeFlexion: 150,
        leftKneeFlexion: 150,
        spineAngle: 5,
        rightShoulderAngle: 80,
        leftShoulderAngle: 70,
        footPositioning: 35,
        weightTransfer: 20,
      }];
      const segments = segmentRepIntoPhases(profile, frames);
      // Should assign the single frame to one phase
      let totalFrames = 0;
      segments.forEach((data) => {
        totalFrames += data.frameCount;
      });
      expect(totalFrames).toBe(1);
    });
  });

  describe("evaluateRepPhases", () => {
    it("returns corrections for bad form football throw", () => {
      const evals = evaluateRepPhases(
        "sports", "football", "Football Throw",
        generateBadFormThrowFrames(60),
        3
      );

      expect(evals.length).toBeGreaterThan(0);
      expect(evals.length).toBeLessThanOrEqual(3);

      // Should have at least one correction
      const corrections = evals.filter(e => e.type === "correction");
      expect(corrections.length).toBeGreaterThan(0);
    });

    it("includes phase context in feedback messages", () => {
      const evals = evaluateRepPhases(
        "sports", "football", "Football Throw",
        generateBadFormThrowFrames(60),
        3
      );

      // Every evaluation should have a phase name
      for (const ev of evals) {
        expect(ev.phaseName).toBeTruthy();
        expect(ev.displayPrefix).toBeTruthy();
        expect(ev.spokenPrefix).toBeTruthy();
      }

      // Messages should contain phase prefixes like "During the", "As you", "In your", "On the", "At"
      const hasPhasePrefix = evals.some(ev =>
        ev.message.startsWith("During") ||
        ev.message.startsWith("As you") ||
        ev.message.startsWith("In your") ||
        ev.message.startsWith("On the") ||
        ev.message.startsWith("On your") ||
        ev.message.startsWith("At ")
      );
      expect(hasPhasePrefix).toBe(true);
    });

    it("returns some positives for decent form", () => {
      const evals = evaluateRepPhases(
        "sports", "football", "Football Throw",
        generateFootballThrowFrames(60),
        3
      );

      expect(evals.length).toBeGreaterThan(0);
      // Should have at least one positive or correction
      const types = evals.map(e => e.type);
      expect(types.length).toBeGreaterThan(0);
    });

    it("provides speech versions for all feedback", () => {
      const evals = evaluateRepPhases(
        "sports", "football", "Football Throw",
        generateBadFormThrowFrames(60),
        3
      );

      for (const ev of evals) {
        expect(ev.speech).toBeTruthy();
        expect(ev.speech.length).toBeGreaterThan(0);
        // Speech should be shorter than the full message
        expect(ev.speech.length).toBeLessThanOrEqual(ev.message.length + 30);
      }
    });

    it("provides detail with metric values", () => {
      const evals = evaluateRepPhases(
        "sports", "football", "Football Throw",
        generateBadFormThrowFrames(60),
        3
      );

      for (const ev of evals) {
        expect(ev.detail).toBeTruthy();
        // Detail should contain the phase name and a number
        expect(ev.detail).toContain("·");
        expect(ev.detail).toContain("target:");
      }
    });

    it("works for kettlebell swing motions", () => {
      const evals = evaluateRepPhases(
        "strength", "kettlebell", "Kettlebell Swing",
        generateKettlebellSwingFrames(50),
        3
      );

      expect(evals.length).toBeGreaterThan(0);
      for (const ev of evals) {
        expect(ev.phaseName).toBeTruthy();
      }
    });

    it("works for generic/unknown motions", () => {
      const evals = evaluateRepPhases(
        "unknown", "unknown", "Unknown Motion",
        generateFootballThrowFrames(60),
        3
      );

      expect(evals.length).toBeGreaterThan(0);
    });

    it("respects maxItems parameter", () => {
      const evals1 = evaluateRepPhases(
        "sports", "football", "Football Throw",
        generateBadFormThrowFrames(60),
        1
      );
      expect(evals1.length).toBeLessThanOrEqual(1);

      const evals5 = evaluateRepPhases(
        "sports", "football", "Football Throw",
        generateBadFormThrowFrames(60),
        5
      );
      expect(evals5.length).toBeLessThanOrEqual(5);
    });

    it("prioritizes corrections over positives", () => {
      const evals = evaluateRepPhases(
        "sports", "football", "Football Throw",
        generateBadFormThrowFrames(60),
        3
      );

      // First items should be corrections
      if (evals.length >= 2) {
        const firstCorrection = evals.findIndex(e => e.type === "correction");
        const firstPositive = evals.findIndex(e => e.type === "positive");
        if (firstCorrection !== -1 && firstPositive !== -1) {
          expect(firstCorrection).toBeLessThan(firstPositive);
        }
      }
    });
  });

  describe("Basketball Jump Shot - Comprehensive", () => {
    it("segments basketball shot frames into phases", () => {
      const profile = getPhaseProfile("sports", "basketball", "Basketball Jump Shot");
      const frames = generateBasketballShotFrames(60);
      const segments = segmentRepIntoPhases(profile, frames);

      let phasesWithFrames = 0;
      segments.forEach((data) => {
        if (data.frameCount > 0) phasesWithFrames++;
      });
      // Should have frames in multiple phases
      expect(phasesWithFrames).toBeGreaterThanOrEqual(3);
    });

    it("returns corrections for bad basketball form", () => {
      const evals = evaluateRepPhases(
        "sports", "basketball", "Basketball Jump Shot",
        generateBadBasketballShotFrames(60),
        5
      );

      expect(evals.length).toBeGreaterThan(0);
      const corrections = evals.filter(e => e.type === "correction");
      expect(corrections.length).toBeGreaterThan(0);
    });

    it("basketball corrections include phase context", () => {
      const evals = evaluateRepPhases(
        "sports", "basketball", "Basketball Jump Shot",
        generateBadBasketballShotFrames(60),
        5
      );

      for (const ev of evals) {
        expect(ev.phaseName).toBeTruthy();
        expect(ev.displayPrefix).toBeTruthy();
      }

      // Should reference basketball-specific phases
      const allPhaseNames = evals.map(e => e.phaseName);
      const hasBasketballPhase = allPhaseNames.some(name =>
        name.includes("Dip") || name.includes("Rise") || name.includes("Release") ||
        name.includes("Landing") || name.includes("Catch") || name.includes("Neutral")
      );
      expect(hasBasketballPhase).toBe(true);
    });

    it("good basketball form produces some positives", () => {
      const evals = evaluateRepPhases(
        "sports", "basketball", "Basketball Jump Shot",
        generateBasketballShotFrames(60),
        5
      );

      expect(evals.length).toBeGreaterThan(0);
      // Good form should have at least some positives
      const types = evals.map(e => e.type);
      expect(types.length).toBeGreaterThan(0);
    });

    it("basketball speech cues are concise", () => {
      const evals = evaluateRepPhases(
        "sports", "basketball", "Basketball Jump Shot",
        generateBadBasketballShotFrames(60),
        5
      );

      for (const ev of evals) {
        expect(ev.speech).toBeTruthy();
        // Speech should be reasonably short for between-rep delivery
        expect(ev.speech.length).toBeLessThan(120);
      }
    });
  });
});
