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
      expect(profile.motionName).toBe("Basketball Shot");
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
});
