# Conservative metric-corrected mocap preview

The isolated `/test/mocap-preview/:motionId` route now offers **Raw mocap** and **Metric-corrected** playback. Both modes use the same retargeted capture, duration, and source-time mapping. The corrected mode is a separately baked `AnimationClip`; neither the original FBX animation nor the raw retargeted clip is changed.

## Scope and Git boundary

This extension starts from GitHub commit `d05b3cf0731d0628be72f49c6ddfed3ea28efc31`. Only `user_github/main` is used. The managed repository’s old `74e11897` history is not fetched, pulled, merged, or pushed. Managed checkpoint/restart/publishing operations are deliberately not used because of that unresolved history mismatch.

`Analysis.tsx`, `Replay.tsx`, `Hologram3D.tsx`, and `professionalReferences.ts` remain unchanged. Only the existing licensed quarterback asset is used. No new licensed clips or media binaries are added to Git.

## Correction policy

`client/src/lib/mocapCorrection.ts` evaluates each bound metric throughout the phase, at four times the configured native frame rate plus original keys and exact phase boundaries. It obtains ranges through the same exact phase/reference/binding lookup as the raw report. No reference, flat-only references, phase gaps, or conflicting duplicate ranges do not receive substitute targets.

For an out-of-range angle, the target is the nearest range boundary plus **2° inward margin**, not the midpoint. A range narrower than 4° uses a smaller inward margin to avoid crossing its opposite boundary. The full required change, including margin, is checked against **20°**. A request exceeding that limit is refused with **“too far off to correct naturally.”** It is not partially clamped to 20°.

The first pass modifies only the forearm quaternion at each elbow and, when eligible, the spine quaternion chain. Elbows rotate around the measured shoulder–elbow–wrist plane normal at the elbow. The world hinge axis is converted to the parent coordinate frame before the offset is applied. Straight/folded, missing, and degenerate hinges are unavailable rather than assigned an invented axis.

Hip–shoulder separation uses a signed horizontal axis difference internally to choose twist direction. The requested total axial rotation is distributed evenly across available `mixamorigSpine`, `mixamorigSpine1`, and `mixamorigSpine2` bones. The cap is **20° total**, not 20° for each spine bone. Hips and legs are not rotated by this correction layer.

Knees remain **report-only**, including out-of-range values. All hip/root/translation/scale, knee, foot, and other unaffected tracks are cloned without changing their data. No IK or foot-plant correction is implemented.

## Smoothness and strict refusal

Requested offsets are smoothed across neighboring samples using an 80 ms quintic kernel. Refused or unavailable samples form hard-zero anchors. Eligible frames fade toward zero on the safe side of those anchors, with a further one-native-frame zero guard to keep interpolation away from the refusal boundary. A safe phase-to-phase target change is blended, not applied as a step.

This is intentionally conservative: brief safe intervals, phase transitions, and fade regions can retain residual out-of-range angles. The report distinguishes **Corrected**, **Easing / residual deviation**, **Already in range**, **Unavailable**, **Report-only**, and **too far off to correct naturally**. It does not assert that every phase or frame is now inside range. Already-in-range frames can carry a small neighboring offset during a fade; the before/after report makes that visible.

The baker restores the input pose before each sample and explicitly evaluates Three.js track interpolants through property bindings. It does not depend on the mixer’s unchanged-value cache, which can otherwise retain a manually applied offset on constant or absent source tracks. Input pose is restored on exit.

Wholly uncorrected native intervals retain their original quaternion keys and values instead of inserting extra raw samples. This preserves interpolation even for slightly non-unit imported Float32 quaternions. Baked keys are deduplicated at Float32 storage precision. Only genuinely corrected bones have tracks replaced. Diagnostics are measured again from the completed baked clip, not assumed from requested offsets.

## Comparison and playback

The preview independently samples both clips at each phase-start marker, so both reports stay visible regardless of the current playback mode. It also shows each clip’s phase peak separation separately. Marker snapshots are not confused with peak measurements, and scrubbing does not mutate the saved marker reports.

Switching mode preserves source time and the playing/paused state. Play/pause, reset, frame steps, and scrubbing work in both modes. The live geometric sidebar follows the selected clip. Safety warnings include refused samples elsewhere in the selected phase, not only at its start marker.

## Quarterback results

Angles below are measured interior angles in degrees, from the five manually configured **phase-start markers**. They are estimates on the retargeted hologram, not verified anatomical motion-capture measurements.

| Phase / source time | Metric | Range | Raw | Corrected | Result |
|---|---|---:|---:|---:|---|
| Loaded / Ready · 23.33 s | Throwing elbow | 80–120 | 41.0 | 41.0 | Too far: needs 41.0° including margin |
| Loaded / Ready · 23.33 s | Non-throwing elbow | 70–120 | 67.3 | 72.3 | Corrected; target 72°, neighbor smoothing |
| Early Cocking · 23.60 s | Throwing elbow | 80–100 | 41.1 | 41.1 | Too far: needs 40.9° |
| Early Cocking · 23.60 s | Non-throwing elbow | 30–70 | 66.4 | 68.7 | In range before/after; neighboring fade |
| Late Cocking · 23.90 s | Throwing elbow | 85–100 | 48.1 | 48.1 | Too far: needs 38.9° |
| Late Cocking · 23.90 s | Non-throwing elbow | 30–70 | 104.7 | 104.7 | Too far: needs 36.7° |
| Late Cocking · 23.90 s | Hip–shoulder separation | 30–45 | 11.0 | 11.0 | Too far: needs 21.0° to target 32° |
| Acceleration / Release · 24.17 s | Throwing elbow | 90–180 | 21.1 | 21.1 | Too far: needs 70.9° |
| Acceleration / Release · 24.17 s | Non-throwing elbow | 40–90 | 122.8 | 122.8 | Too far: needs 34.8° |
| Follow-Through · 24.50 s | Throwing elbow | 170–180 | 174.3 | 174.3 | Already in range; unchanged |
| Follow-Through · 24.50 s | Non-throwing elbow | 30–70 | 127.0 | 127.0 | Too far: needs 59.0° |

There are useful corrections later within follow-through, despite its mostly refused start-marker readings. At source **24.7066 s**, the throwing elbow changes **166.5° → 172.0°**. At source **25.1529 s**, the non-throwing elbow changes **80.3° → 68.3°**. These are separately identified interior-phase examples, not alternative phase markers.

For this particular clip, only the two forearm tracks change. Its eligible hip–shoulder correction intervals do not support a safe applied twist; the spine tracks stay raw. Distributed spine correction is independently exercised by synthetic geometric regression fixtures.

## Validation

TypeScript, the production build, and the full suite of **238 tests** pass: 181 prior tests plus 57 new correction tests. Tests cover nearest-boundary targets, inward margin, inclusive 20° limits and hard refusals, transformed-parent hinge geometry, missing/straight/folded axes, signed distributed spine twist, missing source rotation tracks, static-track accumulation, raw/source immutability, cloned protected tracks, report-only knees, missing reference fallback, exact marker sampling, Float32 key preservation, and phase/refusal continuity.

The licensed-asset numerical audit scans playback every **1 ms**. It confirms original FBX and raw retargeted clip immutability, unchanged protected tracks, **zero foot/toe displacement**, and a maximum applied offset of about **12.02°**. Refused-frame raw/corrected angle differences are no more than approximately **0.0000012°**, consistent with floating-point precision. No intentional correction is applied there.

Browser validation covers raw/restored poses, all five before/after marker reports, mode switching at a paused time and during playback, frame stepping, reset, stable saved reports, and desktop/mobile layouts. The existing bundle-size, package-manager configuration, and unrelated quaternion-interpolation warnings remain non-failing advisories.

The local reproducible audit is `/home/ubuntu/mocap-test-assets/validate-metric-correction.mts`; it reads the licensed binaries outside Git and writes `metric-correction-results.json` alongside them. To run it in this sandbox:

```sh
cd /home/ubuntu/aligned-recreation
pnpm exec tsx --tsconfig tsconfig.json /home/ubuntu/mocap-test-assets/validate-metric-correction.mts
```

This remains an isolated evaluation feature. It does not change production scoring, analysis, replay, coaching, or publishing behavior.
