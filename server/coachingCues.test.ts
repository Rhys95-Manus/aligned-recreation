import { describe, it, expect } from 'vitest';

// We test the pure logic functions from the coaching cues module.
// Since these are client-side utils, we import them directly (vitest handles TS).
import {
  getCoachingProfile,
  evaluateMetric,
  evaluateAllMetrics,
  type MetricCoachingConfig,
  type MotionCoachingProfile,
} from '../client/src/data/coachingCues';

describe('getCoachingProfile', () => {
  it('returns football throw profile for football-throw motion', () => {
    const profile = getCoachingProfile('sports', 'football', 'Throw');
    expect(profile).toBeDefined();
    expect(profile.hipRotation).toBeDefined();
    expect(profile.hipRotation!.label).toBe('Hip Drive');
    expect(profile.rightElbowAngle).toBeDefined();
    expect(profile.rightElbowAngle!.label).toBe('Throwing Elbow');
  });

  it('returns kettlebell swing profile for kettlebell swing motion', () => {
    const profile = getCoachingProfile('strength', 'kettlebell', 'Kettlebell Swing');
    expect(profile).toBeDefined();
    expect(profile.hipRotation).toBeDefined();
    expect(profile.hipRotation!.label).toBe('Hip Snap');
    expect(profile.spineAngle).toBeDefined();
    expect(profile.spineAngle!.label).toBe('Spine Neutral');
  });

  it('returns kettlebell snatch profile for kb snatch', () => {
    const profile = getCoachingProfile('strength', 'kettlebell', 'Kettlebell Snatch');
    expect(profile).toBeDefined();
    expect(profile.hipRotation).toBeDefined();
    expect(profile.hipRotation!.label).toBe('Hip Drive');
  });

  it('returns golf swing profile for golf motions', () => {
    const profile = getCoachingProfile('sports', 'golf', 'Driver Swing');
    expect(profile).toBeDefined();
    expect(profile.hipRotation).toBeDefined();
    expect(profile.hipRotation!.label).toBe('Hip Turn');
  });

  it('returns basketball shot profile for jump shot', () => {
    const profile = getCoachingProfile('sports', 'basketball', 'Jump Shot');
    expect(profile).toBeDefined();
    expect(profile.rightElbowAngle).toBeDefined();
    expect(profile.rightElbowAngle!.label).toBe('Shooting Elbow');
  });

  it('returns baseball pitch profile for fastball', () => {
    const profile = getCoachingProfile('sports', 'baseball', 'Fastball');
    expect(profile).toBeDefined();
    expect(profile.hipRotation!.label).toBe('Hip Lead');
  });

  it('returns squat profile for back squat', () => {
    const profile = getCoachingProfile('weightlifting', 'powerlifting', 'Back Squat');
    expect(profile).toBeDefined();
    expect(profile.rightKneeFlexion).toBeDefined();
    expect(profile.rightKneeFlexion!.label).toBe('Depth');
  });

  it('returns deadlift profile for deadlift', () => {
    const profile = getCoachingProfile('weightlifting', 'powerlifting', 'Deadlift');
    expect(profile).toBeDefined();
    expect(profile.hipRotation!.label).toBe('Hip Hinge');
  });

  it('returns generic profile for unknown motions', () => {
    const profile = getCoachingProfile('unknown', 'unknown', 'Unknown Motion');
    expect(profile).toBeDefined();
    expect(profile.hipRotation).toBeDefined();
    expect(profile.hipRotation!.label).toBe('Hip Movement');
  });

  it('handles keyword matching for partial motion names', () => {
    // "swing" keyword should match golf
    const profile = getCoachingProfile('sports', 'golf', 'Swing');
    expect(profile).toBeDefined();
    expect(profile.hipRotation).toBeDefined();
  });
});

describe('evaluateMetric', () => {
  const sampleConfig: MetricCoachingConfig = {
    label: 'Hip Drive',
    optimalRange: [30, 90],
    priority: 1,
    cues: {
      positive: 'Great hip drive!',
      positiveSpeech: 'Great hips!',
      tooLow: 'Snap your hips through the target',
      tooLowSpeech: 'Snap hips!',
      tooHigh: 'Control the hip turn',
      tooHighSpeech: 'Control hips!',
    }
  };

  it('returns positive feedback when value is within optimal range', () => {
    const result = evaluateMetric(sampleConfig, 60);
    expect(result.type).toBe('positive');
    expect(result.message).toBe('Great hip drive!');
    expect(result.speech).toBe('Great hips!');
  });

  it('returns positive at lower boundary', () => {
    const result = evaluateMetric(sampleConfig, 30);
    expect(result.type).toBe('positive');
  });

  it('returns positive at upper boundary', () => {
    const result = evaluateMetric(sampleConfig, 90);
    expect(result.type).toBe('positive');
  });

  it('returns tooLow correction when value is below range', () => {
    const result = evaluateMetric(sampleConfig, 15);
    expect(result.type).toBe('correction');
    expect(result.message).toBe('Snap your hips through the target');
    expect(result.speech).toBe('Snap hips!');
    expect(result.detail).toContain('15');
    expect(result.detail).toContain('30–90');
  });

  it('returns tooHigh correction when value is above range', () => {
    const result = evaluateMetric(sampleConfig, 100);
    expect(result.type).toBe('correction');
    expect(result.message).toBe('Control the hip turn');
    expect(result.speech).toBe('Control hips!');
  });
});

describe('evaluateAllMetrics', () => {
  it('returns prioritized feedback with corrections first', () => {
    const profile = getCoachingProfile('sports', 'football', 'Throw');
    
    // Metrics where hip is bad but elbow is good
    const metrics = {
      hipRotation: 10,        // Below optimal → correction
      shoulderRotation: 50,   // Within range → positive
      rightElbowAngle: 90,    // Within range → positive
      spineAngle: 5,          // Within range → positive
    };

    const results = evaluateAllMetrics(profile, metrics, 3);
    
    expect(results.length).toBeLessThanOrEqual(3);
    expect(results.length).toBeGreaterThan(0);
    
    // First item should be the correction (hip)
    expect(results[0].type).toBe('correction');
    
    // Should include at least one positive
    const hasPositive = results.some(r => r.type === 'positive');
    expect(hasPositive).toBe(true);
  });

  it('returns all positives when everything is in range', () => {
    const profile = getCoachingProfile('sports', 'football', 'Throw');
    
    const metrics = {
      hipRotation: 60,
      shoulderRotation: 60,
      rightElbowAngle: 95,
      spineAngle: 8,
      rightKneeFlexion: 160,
      leftKneeFlexion: 165,
      weightTransfer: 50,
    };

    const results = evaluateAllMetrics(profile, metrics, 3);
    
    expect(results.length).toBe(3);
    results.forEach(r => {
      expect(r.type).toBe('positive');
    });
  });

  it('handles missing metrics gracefully', () => {
    const profile = getCoachingProfile('sports', 'football', 'Throw');
    
    // Only provide one metric
    const metrics = {
      hipRotation: 10,
    };

    const results = evaluateAllMetrics(profile, metrics, 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].type).toBe('correction');
  });

  it('limits output to maxItems', () => {
    const profile = getCoachingProfile('sports', 'football', 'Throw');
    
    // All metrics bad
    const metrics = {
      hipRotation: 5,
      shoulderRotation: 5,
      rightElbowAngle: 20,
      spineAngle: 50,
      rightKneeFlexion: 50,
      leftKneeFlexion: 50,
      weightTransfer: -50,
    };

    const results = evaluateAllMetrics(profile, metrics, 2);
    expect(results.length).toBe(2);
  });

  it('uses motion-specific cue text, not generic', () => {
    const profile = getCoachingProfile('sports', 'football', 'Throw');
    
    const metrics = {
      rightElbowAngle: 50, // Too low for football throw
    };

    const results = evaluateAllMetrics(profile, metrics, 3);
    const elbowResult = results.find(r => r.message.toLowerCase().includes('tuck') || r.message.toLowerCase().includes('elbow'));
    expect(elbowResult).toBeDefined();
    // Should NOT say "Fix Elbow Angle" (the old generic cue)
    expect(elbowResult!.message).not.toBe('Fix Elbow Angle');
  });

  it('provides actionable cues for kettlebell swing', () => {
    const profile = getCoachingProfile('strength', 'kettlebell', 'Kettlebell Swing');
    
    const metrics = {
      hipRotation: 10,   // Too low
      spineAngle: 35,    // Too high (rounding)
    };

    const results = evaluateAllMetrics(profile, metrics, 3);
    
    // Should have corrections
    const corrections = results.filter(r => r.type === 'correction');
    expect(corrections.length).toBeGreaterThan(0);
    
    // Cues should be actionable (contain action verbs)
    corrections.forEach(c => {
      // Each correction message should be a real sentence, not just "Fix X"
      expect(c.message.length).toBeGreaterThan(15);
    });
  });

  it('provides different cues for different motions with same metric issue', () => {
    const footballProfile = getCoachingProfile('sports', 'football', 'Throw');
    const golfProfile = getCoachingProfile('sports', 'golf', 'Driver Swing');
    
    const metrics = { hipRotation: 10 }; // Too low for both
    
    const footballResults = evaluateAllMetrics(footballProfile, metrics, 1);
    const golfResults = evaluateAllMetrics(golfProfile, metrics, 1);
    
    // Different motions should give different coaching cues for the same metric
    expect(footballResults[0].message).not.toBe(golfResults[0].message);
  });
});
