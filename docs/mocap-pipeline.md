# Config-driven mocap evaluation pipeline

## Scope and repository boundary

This work starts from connected GitHub main `c6eb16fb7129a007655f854ed52dd0168bf6497b`. Only `user_github/main` is fetched or pushed. The managed repository's old `74e11897` history is not pulled or merged. Managed checkpoint/restart operations are not used because they can fetch that old origin. The existing dev server applies local changes through hot reload.

`Analysis.tsx`, `Replay.tsx`, and `Hologram3D.tsx` are unchanged and checked by SHA-256. The reference database is read-only for this task. New functionality remains isolated to test routes.

## Add a motion

Add one entry to `client/src/data/mocapClips.ts`. All configured motions automatically appear in the motion selector and load at `/test/mocap-preview/<id>`; no new page or route is needed. `/test/mocap-preview` remains a compatibility alias for the quarterback entry.

The required fields are `id`, `name`, `fbxUrl`, `targetModel`, `trimStart`, `trimEnd`, `scale`, and `phases`. Each phase has `name`, `startTime`, and `endTime`. Times are **absolute seconds on the original FBX timeline**, not percentages or time offsets on the trimmed clip. Phases must be ordered, non-overlapping, and inside the trim. Phase gaps are allowed and show no active phase. An empty phase list is also valid.

Use an existing managed asset URL or upload the licensed clip to managed storage. Do not commit FBX, GLB, MP4, or bulk pose data into the repository. Only the licensed quarterback asset is registered by this task.

Optional fields:

- `fps`: defaults to 24; set the source sample rate.
- `hipBone`: defaults to `mixamorigHips`.
- `sourceRootBone`: the animated reference ancestor, if explicitly known. Otherwise the pipeline discovers the highest bone ancestor of the source hip.
- `referenceKey`: an exact key in `professionalReferences`; defaults to the motion id. No fuzzy or generic fallback is used.
- `referenceName` on a phase: the exact reference phase name when its display name differs.
- `metricBindings`: maps reference metric names to existing geometric measurement ids; this encodes handedness and lead/back-leg interpretation without viewer changes.
- `timingNote`: explains timing provenance and any uncertainty.

New clips must use a compatible Mixamo skeleton. This is a reusable Mixamo retargeting pipeline, not an automatic semantic retargeter for arbitrary rigs. A new skeleton convention or a genuinely new anatomical measurement can require a new measurement implementation; adding another compatible motion does not.

## Proven quarterback settings

The first entry is `quarterback-throw`. It retains the proven MaleHologram target, managed quarterback FBX, source trim **23.33–25.33 s**, scale **0.01**, and 24 fps. Its explicit source root remains `mixamorigReference`.

The five approximate phase windows are Loaded / Ready (23.33–23.60), Early Cocking (23.60–23.90), Late Cocking / Max Torque (23.90–24.17), Acceleration / Release (24.17–24.50), and Follow-Through (24.50–25.33). These are manually configured comparison windows, not validated segmentation. The source begins loaded; the first marker links to the Neutral / Ready reference only as an explicitly labelled benchmark. A true neutral stance is not asserted.

SkeletonUtils output is approximately 1.96 seconds rather than the nominal 2.00 seconds. Source-to-playback mapping uses `sourceTime - trimStart`, clamped to the actual sampled output; it does not stretch or rescale the timeline. The last sampled source time is near 25.29 seconds.

## Shared retargeting and sampling

`client/src/lib/mocapPipeline.ts` validates configuration, loads the first source animation clip, identifies source/target skinned meshes, and prepares the source reference wrapper. It maps target-to-source names explicitly and calls `SkeletonUtils.retargetClip()` with the configured trim and unit scale, preserving the original quarterback options `useFirstFramePosition: true` and `preserveHipPosition: false`.

Every source animation target absent on the target produces a console warning. The quarterback retains 65/66 binding coverage; its only source-only target is `mixamorigReference`. Missing hips, invalid trims, absent clips, and invalid configured roots produce explicit errors rather than silent static playback.

The target mixer acts on the target SkinnedMesh because the generated tracks use `.bones[name]` bindings. Controls retain play/pause, reset, 0–100% scrubbing, and native-fps frame stepping. Sampling phase reports restores time zero before the viewer is made ready.

Numbered markers on the scrubber and phase cards seek to each phase's start and pause. Each phase report is a saved snapshot at that start marker; arbitrary later scrubbing does not change it. The live sidebar separately shows the current pose's geometric angles. Hip–shoulder separation also has a distinct phase-interval peak report sampled at the configured fps, so a start-marker value is not mistaken for the peak reference.

## World-space angle convention

`client/src/lib/mocapAngles.ts` updates world matrices and reads the target deformation bones' world positions. Interior angle ABC is computed with vectors **B→A** and **B→C**, a normalized dot product, a clamped cosine, and `acos`. Thus 180° is a straight limb, 90° is a right-angle bend, and 0° is fully folded. Missing, coincident, or non-finite geometry returns an unavailable measurement—not a fabricated zero.

The Mixamo joint triplets are Arm→ForeArm→Hand for each elbow (shoulder, elbow, wrist), and UpLeg→Leg→Foot for each knee (hip, knee, ankle). Both flexion and extension labels in the existing phase references use the same interior angle; values are not incorrectly converted to `180 - angle`.

Hip–shoulder separation uses the angle between left-to-right hip and shoulder axes projected onto world XZ, with Y as vertical. It is an unsigned horizontal-plane estimate, not an interior limb angle, and is invariant to camera orbit. Degenerate projections are unavailable. Local Spine/Arm/ForeArm Euler readouts remain available under the debug disclosure but never enter metric comparisons.

## Reference comparisons and limits

Ranges come directly from the motion's exact `professionalReferences` entry and its exact phase name. Whole-motion flat ranges are not substituted for missing phase data. No reference, flat-only references, and unmapped phases have separate explicit UI states; geometric measurements can still be inspected.

For a valid angle and inclusive `[min,max]` range, the difference is zero in range, `value - min` below range, or `value - max` above range. The UI presents the magnitude and direction of the nearest-boundary difference. It does not compare to the professional average instead of the supplied phase range.

Elbows and knees are compared with explicit handedness/lead-leg bindings. Horizontal hip–shoulder separation is compared when that phase supplies its range. Weight distribution, target-relative hip/shoulder rotation, throwing alignment, signed trunk angles, wrist articulation, and other unimplemented measurement conventions are marked unavailable with reasons. The pipeline does not infer these from local Euler values or fabricate ranges.

All numbers are estimates from the retargeted model. Its proportions, joint centers, and manually configured phase timing can differ from the performer and from a validated biomechanical measurement. In/out-of-range labels are evaluation comparisons, not clinical judgments or a production movement score. The loaded/ready benchmark is especially not a validated neutral-phase assessment.

## Validation

TypeScript, the production build, and all **181 tests** pass: 135 existing tests plus 46 new mocap regression tests. The new tests cover config validation, timeline mapping, straight/bent/degenerate interior angles, transformed world coordinates, separation geometry, inclusive range differences, exact phase lookup, missing references/bones, config-driven handedness, and a second synthetic configured motion passed through the real retargetClip helper. No second licensed clip was extracted or added.

Browser checks cover all five phase markers and range tables, play/pause, reset, frame stepping, 50% scrubbing, and the unknown-motion error. The quarterback's 50% local Euler values match the previous implementation: Spine 1.1°/9.5°/−3.5°, RightArm 53.0°/32.6°/−72.2°, RightForeArm 18.0°/39.3°/−40.1°. At the same frame, geometry reports right elbow 148.6°, left elbow 118.1°, right knee 152.0°, left knee 135.1°, and horizontal separation 39.3°; the difference from local Euler values is intentional.

Desktop and mobile layouts are visually inspected. Existing bundle-size, package-manager configuration, and quaternion interpolation warnings remain non-failing advisories. Final delivery reports the independently verified GitHub commit SHA; no managed checkpoint or publishing action is claimed.
