# Isolated quarterback mocap evaluation

## Scope

The standalone `/test/mocap-preview` page loads the existing MaleHologram model and only the licensed `Football_Quarterback_mixamo.fbx`. It does not reuse production hologram components. `Analysis.tsx`, `Replay.tsx`, and `Hologram3D.tsx` remain byte-identical to the restored project baseline. No production analysis, replay, scoring, or coaching flow is connected to the test route.

The November 23, 2026 sandbox recovery restored checkpoint `74e11897` but did not retain the uncheckpointed evaluation page. The page and its asset proxy were reconstructed using the retained diagnostic scripts and prior findings, then revalidated.

## Asset locations and delivery

- Source archive entry: `Sports/Football_Quarterback_mixamo.fbx`.
- Extracted with `unzip -j`; no other sports clips were extracted.
- Source file outside the repository: `/home/ubuntu/mocap-test-assets/Football_Quarterback_mixamo.fbx`.
- Refreshed managed asset URL: `/manus-storage/Football_Quarterback_mixamo_25080ba4.fbx`.
- Binary length: 2,975,504 bytes.
- SHA-256: `acc793ae53cade9f7a4cfae925a59f3b60ec9c37ae7492771d82170f7eabc2cf`.

The legacy `storageGet()` helper returns an unsigned CDN URL, which returned HTTP 403 for the recovered private asset. The proxy now uses the current `v1/storage/presign/get` endpoint. Curl could follow its signed redirect successfully, but the browser's cross-origin fetch still returned `TypeError: Failed to fetch`. Same-origin FBX byte delivery through the proxy resolved that browser failure. Other managed asset types retain signed redirect delivery. The served FBX's SHA-256 was checked against the extracted licensed source.

The earlier September incident was separate: the asset URL returned Vite HTML with HTTP 200, producing `THREE.FBXLoader: Cannot find the version number for the file given.` Neither incident was caused by Git history or the archive's `Sports/` folder.

## Retargeting implementation

Use `retargetClip` from `three/examples/jsm/utils/SkeletonUtils.js`, not raw source clip playback or hand-patched transforms.

The FBX exposes 198 tracks targeting 66 distinct animated nodes. The target contains 65 matching deformation bones. The sole source-only target is `mixamorigReference`; an individual console warning is emitted. Three.js loaders normalize the asset names to forms such as `mixamorigHips`, without the colon. Human-readable labels retain the familiar `mixamorig:Spine` form.

The source mixer must be able to animate the FBX's reference ancestor. A temporary group contains `mixamorigReference` and exposes the source mesh's skeleton. An explicit identity `names` map is required by this Three.js helper, even though names already match.

Retarget options:

```ts
{
  names: identityTargetToSourceMap,
  fps: 24,
  trim: [23.33, 25.33],
  hip: "mixamorigHips",
  scale: 0.01,
  useFirstFramePosition: true,
  preserveHipPosition: false,
}
```

The target mixer runs on the target `SkinnedMesh` because generated tracks use `.bones[name]` bindings. Non-hip bone positions are preserved by the helper defaults. The 0.01 unit scale accounts for the source's approximately 89-unit hip height versus the meter-scale target; source tracks are not manually transformed.

## Approximate actual throw window

The original source clip is 36.29166793823242 seconds at 24 fps. The retained full-timeline numerical scan located the strongest movement event near 24.17 seconds.

| Event | Approximate source time |
|---|---|
| Loaded-arm / cocking start | 23.33 s |
| Peak acceleration activity | 24.17 s |
| Release estimate | 24.25–24.50 s |
| Follow-through / return interval end | 25.33 s |

Playback is trimmed to 23.33–25.33 seconds. SkeletonUtils sampling yields approximately 1.96 seconds of output; its final sample is near 25.29 seconds, so the final displayed source time is not exactly 25.33. These are approximate phase observations, not ball-release tracking or validated biomechanical segmentation.

## Browser validation on November 23, 2026

The page reaches **Ready for retargeting evaluation** with a visible, proportionate human model. Manual and programmatic checks covered 0%, 50%, and 100% scrubbing, previous/next 24-fps frames, reset, play, and pause. Pause freezes timeline progress. The observed sequence moves from loaded arm to raised arm and extension/follow-through without the raw source's unit-scale deformation.

At 50% (about source 24.31 s), readouts were:

- Spine X/Y/Z: 1.1° / 9.5° / −3.5°.
- RightArm X/Y/Z: 53.0° / 32.6° / −72.2°.
- RightForeArm X/Y/Z: 18.0° / 39.3° / −40.1°.

These are **local Euler rotations relative to each bone's parent**, not anatomical joint-angle measurements. Spine Y alone does not establish shoulder rotation or hip–shoulder separation; it must not be compared directly with the 30–45° late-cocking coaching reference as if they were identical measurements. No quantitative clinical or coaching accuracy claim is made. Foot-contact fidelity and exact release timing remain unvalidated.

## Repository history cleanup

The user downloaded byte-exact backups of `qb_video.mp4` and `pose_data_full.json` and explicitly confirmed authorization to proceed on November 23, 2026. A full pre-rewrite recovery bundle was also retained outside the repository.

Both file paths were removed from branch history using `git filter-repo --invert-paths`. A scan of rewritten refs found neither file, and the main history contained no remaining blob over 50 MB. Ignore rules prevent either filename from being committed again. GitHub main is updated with an explicit force-with-lease against the verified old remote SHA; no unrelated branch is force-pushed.

## Validation

TypeScript, production build, all 135 existing Vitest tests, and `git diff --check` pass. Existing test interpolation warnings and the production bundle-size advisory are not new functional failures. Protected production files are additionally verified by SHA-256 against the pre-rewrite baseline.

## Managed checkpoint limitation

The repaired branch was successfully pushed to `user_github/main` and independently confirmed at `03fcf6ecd0b27addeda8cb7001f07c3c76dcd6d1` before the checkpoint attempt. The managed WebDev checkpoint tool then fetched its separate S3-backed `origin/main`, still at original commit `74e11897cd757707ab59d5dd5e1666bdce004226`, and refused to save because that history diverges from the cleaned branch.

A normal merge was deliberately not performed: it would make the oversized historical blobs reachable from the cleaned branch again. Terminal access to this managed S3 remote is intentionally unavailable; credentials are confined to the checkpoint tool. The available tool exposes no forced managed-branch replacement option. Independent WebDev diagnostics confirmed that the managed repository needs a supported adoption/import of the clean history before checkpointing can succeed. No new project was created and no publish action was attempted.

The existing managed repository therefore still contains the old history, while the repaired local `main` and GitHub `main` are clean. GitHub is the durable source of the restored evaluation code. The final delivery reports its exact verified SHA and supplies a full source archive outside the repository; it does not claim that a new managed checkpoint was saved.
