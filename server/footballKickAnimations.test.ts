import { describe, it, expect } from 'vitest';
import * as THREE from 'three';

// We need to test the animation creation functions
// Since they use THREE.js, we import them directly
import { createPuntClip, createFieldGoalClip, PUNT_CLIP_DURATION, FIELD_GOAL_CLIP_DURATION } from '../client/src/data/footballKickAnimations';

describe('Football Kick Animations', () => {
  describe('createPuntClip', () => {
    it('creates a valid AnimationClip', () => {
      const clip = createPuntClip();
      expect(clip).toBeInstanceOf(THREE.AnimationClip);
      expect(clip.name).toBe('punt');
      expect(clip.duration).toBe(PUNT_CLIP_DURATION);
    });

    it('has tracks with sanitized bone names (no colons)', () => {
      const clip = createPuntClip();
      for (const track of clip.tracks) {
        expect(track.name).not.toContain(':');
        expect(track.name).toMatch(/^[a-zA-Z0-9_]+\.quaternion$/);
      }
    });

    it('includes the essential leg bones for a kick', () => {
      const clip = createPuntClip();
      const trackNames = clip.tracks.map(t => t.name);
      
      // Must have kicking leg
      expect(trackNames).toContain('mixamorigRightUpLeg.quaternion');
      expect(trackNames).toContain('mixamorigRightLeg.quaternion');
      expect(trackNames).toContain('mixamorigRightFoot.quaternion');
      
      // Must have plant leg
      expect(trackNames).toContain('mixamorigLeftUpLeg.quaternion');
      expect(trackNames).toContain('mixamorigLeftLeg.quaternion');
      expect(trackNames).toContain('mixamorigLeftFoot.quaternion');
      
      // Must have hips
      expect(trackNames).toContain('mixamorigHips.quaternion');
    });

    it('does NOT include any IK or FK control bones', () => {
      const clip = createPuntClip();
      const trackNames = clip.tracks.map(t => t.name);
      
      for (const name of trackNames) {
        expect(name).not.toContain('IK');
        expect(name).not.toContain('Ctrl');
        expect(name).not.toContain('FK');
      }
    });

    it('produces normalized quaternions (unit length) for all keyframes', () => {
      const clip = createPuntClip();
      for (const track of clip.tracks) {
        const values = track.values;
        // Each quaternion is 4 values [x, y, z, w]
        for (let i = 0; i < values.length; i += 4) {
          const x = values[i];
          const y = values[i + 1];
          const z = values[i + 2];
          const w = values[i + 3];
          const length = Math.sqrt(x * x + y * y + z * z + w * w);
          expect(length).toBeCloseTo(1.0, 3);
        }
      }
    });

    it('has 5 keyframes per track', () => {
      const clip = createPuntClip();
      for (const track of clip.tracks) {
        expect(track.times.length).toBe(5);
        // 4 quaternion components per keyframe
        expect(track.values.length).toBe(5 * 4);
      }
    });
  });

  describe('createFieldGoalClip', () => {
    it('creates a valid AnimationClip', () => {
      const clip = createFieldGoalClip();
      expect(clip).toBeInstanceOf(THREE.AnimationClip);
      expect(clip.name).toBe('fieldGoalKick');
      expect(clip.duration).toBe(FIELD_GOAL_CLIP_DURATION);
    });

    it('has tracks with sanitized bone names (no colons)', () => {
      const clip = createFieldGoalClip();
      for (const track of clip.tracks) {
        expect(track.name).not.toContain(':');
        expect(track.name).toMatch(/^[a-zA-Z0-9_]+\.quaternion$/);
      }
    });

    it('includes the essential leg bones for a kick', () => {
      const clip = createFieldGoalClip();
      const trackNames = clip.tracks.map(t => t.name);
      
      expect(trackNames).toContain('mixamorigRightUpLeg.quaternion');
      expect(trackNames).toContain('mixamorigRightLeg.quaternion');
      expect(trackNames).toContain('mixamorigRightFoot.quaternion');
      expect(trackNames).toContain('mixamorigLeftUpLeg.quaternion');
      expect(trackNames).toContain('mixamorigLeftLeg.quaternion');
      expect(trackNames).toContain('mixamorigLeftFoot.quaternion');
      expect(trackNames).toContain('mixamorigHips.quaternion');
    });

    it('does NOT include any IK or FK control bones', () => {
      const clip = createFieldGoalClip();
      const trackNames = clip.tracks.map(t => t.name);
      
      for (const name of trackNames) {
        expect(name).not.toContain('IK');
        expect(name).not.toContain('Ctrl');
        expect(name).not.toContain('FK');
      }
    });

    it('produces normalized quaternions (unit length) for all keyframes', () => {
      const clip = createFieldGoalClip();
      for (const track of clip.tracks) {
        const values = track.values;
        for (let i = 0; i < values.length; i += 4) {
          const x = values[i];
          const y = values[i + 1];
          const z = values[i + 2];
          const w = values[i + 3];
          const length = Math.sqrt(x * x + y * y + z * z + w * w);
          expect(length).toBeCloseTo(1.0, 3);
        }
      }
    });

    it('is shorter than the punt (more compact motion)', () => {
      expect(FIELD_GOAL_CLIP_DURATION).toBeLessThan(PUNT_CLIP_DURATION);
    });
  });

  describe('Animation consistency', () => {
    it('both clips start from the same neutral pose for shared bones', () => {
      const puntClip = createPuntClip();
      const fgClip = createFieldGoalClip();
      
      // Find matching tracks and compare first keyframe
      for (const puntTrack of puntClip.tracks) {
        const fgTrack = fgClip.tracks.find(t => t.name === puntTrack.name);
        if (fgTrack) {
          // First keyframe should be identical (both start from throw frame 0)
          for (let i = 0; i < 4; i++) {
            expect(puntTrack.values[i]).toBeCloseTo(fgTrack.values[i], 4);
          }
        }
      }
    });

    it('kicking leg (RightUpLeg) has significant rotation change during kick', () => {
      const puntClip = createPuntClip();
      const rightUpLegTrack = puntClip.tracks.find(t => t.name === 'mixamorigRightUpLeg.quaternion');
      expect(rightUpLegTrack).toBeDefined();
      
      if (rightUpLegTrack) {
        // Compare first and peak keyframe — should be significantly different
        const firstQ = new THREE.Quaternion(
          rightUpLegTrack.values[0], rightUpLegTrack.values[1],
          rightUpLegTrack.values[2], rightUpLegTrack.values[3]
        );
        // Peak is at keyframe 3 (contact)
        const peakQ = new THREE.Quaternion(
          rightUpLegTrack.values[12], rightUpLegTrack.values[13],
          rightUpLegTrack.values[14], rightUpLegTrack.values[15]
        );
        
        // Angular difference should be substantial (>30 degrees)
        const angleDiff = firstQ.angleTo(peakQ) * 180 / Math.PI;
        expect(angleDiff).toBeGreaterThan(30);
      }
    });
  });
});
