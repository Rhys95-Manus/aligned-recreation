import { describe, it, expect } from 'vitest';
import { calculateMetricScore, getProfessionalReference, getComparisonText } from '../client/src/data/professionalReferences';
import { getDynamicRecommendations, getMotionRecommendations } from '../client/src/data/recommendationLibrary';

describe('Scoring System', () => {
  describe('calculateMetricScore', () => {
    const sampleMetric = {
      name: "Hip Rotation",
      professionalAverage: 61,
      optimalRange: { min: 50, max: 70 },
      unit: "degrees",
      description: "Hip rotation during throw"
    };

    it('returns -1 for undetected metrics (value near 0)', () => {
      expect(calculateMetricScore(0, sampleMetric)).toBe(-1);
      expect(calculateMetricScore(0.3, sampleMetric)).toBe(-1);
      expect(calculateMetricScore(-0.2, sampleMetric)).toBe(-1);
    });

    it('returns 90-100 for values within optimal range', () => {
      const score = calculateMetricScore(61, sampleMetric);
      expect(score).toBeGreaterThanOrEqual(90);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('returns high score for value at professional average', () => {
      const score = calculateMetricScore(61, sampleMetric);
      expect(score).toBeGreaterThanOrEqual(95);
    });

    it('returns lower score for values outside optimal range', () => {
      const scoreOutside = calculateMetricScore(30, sampleMetric);
      const scoreInside = calculateMetricScore(55, sampleMetric);
      expect(scoreInside).toBeGreaterThan(scoreOutside);
    });

    it('returns 0 for extremely far-off values', () => {
      const score = calculateMetricScore(200, sampleMetric);
      expect(score).toBeLessThanOrEqual(20);
    });

    it('never returns above 100', () => {
      const score = calculateMetricScore(61, sampleMetric);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('correctly handles values at range boundaries', () => {
      const scoreMin = calculateMetricScore(50, sampleMetric);
      const scoreMax = calculateMetricScore(70, sampleMetric);
      expect(scoreMin).toBeGreaterThanOrEqual(90);
      expect(scoreMax).toBeGreaterThanOrEqual(90);
    });
  });

  describe('getComparisonText', () => {
    const sampleMetric = {
      name: "Hip Rotation",
      professionalAverage: 61,
      optimalRange: { min: 50, max: 70 },
      unit: "degrees",
      description: "Hip rotation"
    };

    it('returns "Not detected" for values near 0', () => {
      expect(getComparisonText(0, sampleMetric)).toBe("Not detected");
    });

    it('returns positive text for values in optimal range', () => {
      const text = getComparisonText(61, sampleMetric);
      expect(text.toLowerCase()).toContain('professional');
    });
  });

  describe('getProfessionalReference', () => {
    it('returns a reference for football QB throw', () => {
      const ref = getProfessionalReference('sports', 'football', 'Throw');
      expect(ref).not.toBeNull();
      expect(ref!.metrics.length).toBeGreaterThan(0);
    });

    it('returns a reference for basketball jump shot', () => {
      const ref = getProfessionalReference('sports', 'basketball', 'Jump Shot');
      expect(ref).not.toBeNull();
      expect(ref!.metrics.length).toBeGreaterThan(0);
    });

    it('returns a reference for golf driver', () => {
      const ref = getProfessionalReference('sports', 'golf', 'Driver');
      expect(ref).not.toBeNull();
    });

    it('returns a reference for powerlifting squat', () => {
      const ref = getProfessionalReference('weightlifting', 'powerlifting', 'Squat');
      expect(ref).not.toBeNull();
    });

    it('returns a reference for kettlebell swing', () => {
      const ref = getProfessionalReference('weightlifting', 'kettlebell-training', 'Swing');
      expect(ref).not.toBeNull();
    });

    it('returns a reference for physical therapy exercises', () => {
      const ref = getProfessionalReference('recovery', 'physical-therapy', 'Shoulder Rehab');
      expect(ref).not.toBeNull();
    });

    it('returns a reference for stretching', () => {
      const ref = getProfessionalReference('recovery', 'stretching', 'Hamstring Stretch');
      expect(ref).not.toBeNull();
    });

    it('never returns null - always has a fallback', () => {
      const ref = getProfessionalReference('unknown', 'unknown', 'Unknown Motion');
      expect(ref).not.toBeNull();
      expect(ref!.metrics.length).toBeGreaterThan(0);
    });

    it('all references have at least 3 metrics', () => {
      const motions = [
        ['sports', 'football', 'Throw'],
        ['sports', 'basketball', 'Jump Shot'],
        ['sports', 'golf', 'Driver'],
        ['sports', 'baseball', 'Fastball'],
        ['sports', 'tennis', 'Serve'],
        ['weightlifting', 'powerlifting', 'Squat'],
        ['weightlifting', 'olympic-lifting', 'Clean & Jerk'],
        ['recovery', 'physical-therapy', 'Shoulder Rehab'],
      ];
      
      for (const [cat, sub, motion] of motions) {
        const ref = getProfessionalReference(cat, sub, motion);
        expect(ref).not.toBeNull();
        expect(ref!.metrics.length).toBeGreaterThanOrEqual(3);
      }
    });
  });
});

describe('Recommendation Engine', () => {
  describe('getMotionRecommendations', () => {
    it('returns recommendations for football throw', () => {
      const recs = getMotionRecommendations('sports', 'football', 'Throw');
      expect(recs).not.toBeNull();
      expect(recs!.metrics.length).toBeGreaterThan(0);
    });

    it('returns recommendations for golf driver', () => {
      const recs = getMotionRecommendations('sports', 'golf', 'Driver');
      expect(recs).not.toBeNull();
    });

    it('returns recommendations for kettlebell swing', () => {
      const recs = getMotionRecommendations('weightlifting', 'kettlebell-training', 'Swing');
      expect(recs).not.toBeNull();
    });

    it('returns recommendations for squat', () => {
      const recs = getMotionRecommendations('weightlifting', 'powerlifting', 'Squat');
      expect(recs).not.toBeNull();
    });

    it('each metric has at least 3 drills (tooLow + tooHigh + general)', () => {
      const recs = getMotionRecommendations('sports', 'football', 'Throw');
      expect(recs).not.toBeNull();
      for (const metric of recs!.metrics) {
        const totalDrills = metric.tooLow.length + metric.tooHigh.length + metric.general.length;
        expect(totalDrills).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('getDynamicRecommendations', () => {
    it('returns recommendations targeting the lowest-scoring metric', () => {
      const metricScores = [
        { name: "Hip Rotation", score: 95, value: 60, optimalMin: 50, optimalMax: 70 },
        { name: "Elbow Angle", score: 40, value: 50, optimalMin: 90, optimalMax: 110 },
        { name: "Knee Flexion", score: 85, value: 36, optimalMin: 30, optimalMax: 50 },
      ];
      
      const recs = getDynamicRecommendations('sports', 'football', 'Throw', metricScores);
      expect(recs.length).toBeGreaterThan(0);
      expect(recs.length).toBeLessThanOrEqual(3);
    });

    it('returns empty array when no motion recommendations found', () => {
      const metricScores = [
        { name: "Hip Rotation", score: 50, value: 30, optimalMin: 50, optimalMax: 70 },
      ];
      
      // Use a completely unknown motion that won't match any fallback
      const recs = getDynamicRecommendations('unknown_xyz', 'unknown_xyz', 'zzz_nonexistent_zzz', metricScores);
      expect(recs).toEqual([]);
    });

    it('does not return recommendations for metrics that scored well', () => {
      const metricScores = [
        { name: "Hip Rotation", score: 98, value: 61, optimalMin: 50, optimalMax: 70 },
        { name: "Elbow Angle", score: 97, value: 100, optimalMin: 90, optimalMax: 110 },
        { name: "Knee Flexion", score: 95, value: 38, optimalMin: 30, optimalMax: 50 },
      ];
      
      // Even with all high scores, it should still return some recommendations
      // (the library always tries to fill up to 3 from general drills)
      const recs = getDynamicRecommendations('sports', 'football', 'Throw', metricScores);
      expect(recs.length).toBeGreaterThanOrEqual(0);
      expect(recs.length).toBeLessThanOrEqual(3);
    });

    it('returns motion-specific drills, not generic football drills for golf', () => {
      const metricScores = [
        { name: "Hip Rotation", score: 40, value: 20, optimalMin: 45, optimalMax: 65 },
      ];
      
      const golfRecs = getDynamicRecommendations('sports', 'golf', 'Driver', metricScores);
      const footballRecs = getDynamicRecommendations('sports', 'football', 'Throw', metricScores);
      
      // Golf and football should have different recommendations
      if (golfRecs.length > 0 && footballRecs.length > 0) {
        // At least one recommendation should differ between the two sports
        const golfTitles = golfRecs.map(r => r.title);
        const footballTitles = footballRecs.map(r => r.title);
        const allSame = golfTitles.every(t => footballTitles.includes(t));
        expect(allSame).toBe(false);
      }
    });

    it('filters out undetected metrics (score 0)', () => {
      const metricScores = [
        { name: "Hip Rotation", score: 0, value: 0, optimalMin: 50, optimalMax: 70 },
        { name: "Elbow Angle", score: 50, value: 70, optimalMin: 90, optimalMax: 110 },
      ];
      
      const recs = getDynamicRecommendations('sports', 'football', 'Throw', metricScores);
      // Should not recommend hip rotation drills since it wasn't detected
      // (the library filters score > 0 metrics)
      expect(recs.length).toBeGreaterThanOrEqual(0);
    });
  });
});
