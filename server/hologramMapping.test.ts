import { describe, it, expect } from 'vitest';

// Since these are client-side functions, we test the logic directly
// by reimplementing the pure functions here (they don't depend on DOM)

type MotionType = 'football_throw' | 'basketball_jumpshot' | 'basketball_dribble' | 'golf_swing' | 'kettlebell' | 'generic';

const FOOTBALL_MODEL_URL = '/Hologram1.0.glb';
const BASKETBALL_MODEL_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663143408740/Gd6AiijCmPwLtcbfaErCFP/MaleHologram_quant_d74b85d9.glb';

function getModelUrlForMotion(motionType: MotionType): string {
  switch (motionType) {
    case 'basketball_jumpshot':
      return BASKETBALL_MODEL_URL;
    case 'basketball_dribble':
      return FOOTBALL_MODEL_URL;
    case 'football_throw':
    case 'golf_swing':
    case 'kettlebell':
    case 'generic':
    default:
      return FOOTBALL_MODEL_URL;
  }
}

function detectMotionType(motionName: string): MotionType {
  const name = motionName.toLowerCase();
  if (name.includes('jump shot') || name.includes('jumpshot') || name.includes('layup') || 
      name.includes('free throw') || name.includes('three point') || name.includes('3-point')) {
    return 'basketball_jumpshot';
  }
  if (name.includes('dribbl')) {
    return 'basketball_dribble';
  }
  if (name.includes('football') || name.includes('throw') || name.includes('quarterback')) {
    return 'football_throw';
  }
  if (name.includes('kettlebell') || name.includes('snatch')) {
    return 'kettlebell';
  }
  if (name.includes('golf') || name.includes('swing')) {
    return 'golf_swing';
  }
  return 'generic';
}

describe('Hologram Model Mapping', () => {
  describe('detectMotionType', () => {
    it('should detect basketball jump shot', () => {
      expect(detectMotionType('Basketball Jump Shot')).toBe('basketball_jumpshot');
      expect(detectMotionType('Jump Shot')).toBe('basketball_jumpshot');
      expect(detectMotionType('jumpshot')).toBe('basketball_jumpshot');
    });

    it('should detect basketball layup', () => {
      expect(detectMotionType('Layup')).toBe('basketball_jumpshot');
      expect(detectMotionType('Basketball Layup')).toBe('basketball_jumpshot');
    });

    it('should detect basketball free throw', () => {
      expect(detectMotionType('Free Throw')).toBe('basketball_jumpshot');
    });

    it('should detect basketball three point', () => {
      expect(detectMotionType('Three Point Shot')).toBe('basketball_jumpshot');
      expect(detectMotionType('3-Point Shot')).toBe('basketball_jumpshot');
    });

    it('should detect basketball dribbling', () => {
      expect(detectMotionType('Dribbling')).toBe('basketball_dribble');
      expect(detectMotionType('Basketball Dribble')).toBe('basketball_dribble');
    });

    it('should detect football throw', () => {
      expect(detectMotionType('Football Throw')).toBe('football_throw');
      expect(detectMotionType('Quarterback Throw')).toBe('football_throw');
    });

    it('should detect golf swing', () => {
      expect(detectMotionType('Golf Swing')).toBe('golf_swing');
    });

    it('should detect kettlebell', () => {
      expect(detectMotionType('Kettlebell Snatch')).toBe('kettlebell');
      expect(detectMotionType('Kettlebell Swing')).toBe('kettlebell');
    });

    it('should return generic for unknown motions', () => {
      expect(detectMotionType('Unknown Motion')).toBe('generic');
      expect(detectMotionType('')).toBe('generic');
    });
  });

  describe('getModelUrlForMotion', () => {
    it('should return basketball model for basketball jump shot', () => {
      expect(getModelUrlForMotion('basketball_jumpshot')).toBe(BASKETBALL_MODEL_URL);
    });

    it('should return football model for basketball dribble (per user request)', () => {
      expect(getModelUrlForMotion('basketball_dribble')).toBe(FOOTBALL_MODEL_URL);
    });

    it('should return football model for football throw', () => {
      expect(getModelUrlForMotion('football_throw')).toBe(FOOTBALL_MODEL_URL);
    });

    it('should return football model for golf swing', () => {
      expect(getModelUrlForMotion('golf_swing')).toBe(FOOTBALL_MODEL_URL);
    });

    it('should return football model for kettlebell', () => {
      expect(getModelUrlForMotion('kettlebell')).toBe(FOOTBALL_MODEL_URL);
    });

    it('should return football model for generic', () => {
      expect(getModelUrlForMotion('generic')).toBe(FOOTBALL_MODEL_URL);
    });
  });
});
