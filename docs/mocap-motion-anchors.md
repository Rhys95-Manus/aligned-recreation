# Aligned — motion-event anchors and seven-clip audit

Automatic anchors are now resolved from **raw retargeted motion before metric correction**. The quarterback elbow minimum is **24.164291 s / 19.384°**, and its distinct release proxy is **24.288333 s / 126.615°**. The original FBX measures 19.339° and 126.676° at those same timestamps. The minimum fold remains in the source; this work corrects the phase sampling, not the source motion.

All times below are absolute seconds on each original FBX timeline. Interior angles use **180° = straight**. Event sampling combines a deterministic 96 Hz interpolation grid, actual baked keys, and the exact playback endpoint. This does not increase the underlying 24 fps capture resolution. The current SkeletonUtils bake ends approximately one source-frame before the nominal trim end; source-time mapping is not stretched.

## Clip overview

Counts below are **bound metric/checkpoint comparisons**, not unique joints, frame totals, movement scores, or biomechanical validation. I = raw in range; O = raw out of range without an elbow/spine refusal; T = raw elbow/spine request over 20° including the inward margin. These three are mutually exclusive. Knees always remain report-only and contribute to O rather than T. Unavailable assigned quantities are excluded from I/O/T. The six flat-only references have only 1–2 explicitly mapped angle quantities per clip; the remaining unsupported or unassigned flat metrics are not included in these checkpoint counts. Corrected I/O includes all available comparisons, including unchanged refusals.

| Clip / reference key | Nominal trim | Active side; lead/support role | Raw I / O / T | Corrected I / O | Unavailable |
|---|---|---|---:|---:|---:|
| `quarterback-throw` | 23.330–25.330 s | Right arm; left lead/plant | 4 / 10 / 7 | 5 / 16 | 23 |
| `baseball-fastball` | 18.833–21.333 s | Right arm; left lead/plant | 0 / 1 / 1 | 0 / 2 | 0 |
| `baseball-batting-swing` | 12.875–14.500 s | Right-handed two-hand swing; left lead | 1 / 0 / 1 | 1 / 1 | 0 |
| `golf-driver-swing` | 20.250–22.750 s | Right-handed two-hand swing; left lead | 1 / 0 / 0 | 1 / 0 | 0 |
| `soccer-passing` | 18.750–19.792 s | Right foot; left plant | 0 / 1 / 0 | 0 / 1 | 0 |
| `soccer-power-shot` | 22.083–24.250 s | Right foot; left plant | 0 / 1 / 0 | 0 / 1 | 0 |
| `tennis-serve` | 12.500–15.417 s | Right arm; right pre-drive support, left landing | 1 / 1 / 0 | 1 / 1 | 0 |

The six additional exact reference keys are **unverified and flat-only**. Existing numeric ranges are copied only when a checkpoint explicitly opts in through `referenceMetrics`; no professional phase ranges or generic category fallbacks are invented. Quarterback uses its existing structured reference; its stored `research-verified` label does not validate this mocap or the event detector.

## Anchor logic and manual overrides

**Throws:** choose the sustained forward elbow-extension burst (>30°/s, >20° gain, more than two observed forward intervals and at least 30 ms) tied to the strongest within-extension wrist-speed peak. Max cocking is the actual unsmoothed elbow minimum in its contiguous preceding preparation. Release is the central-difference **world wrist-speed peak inside that burst**, not a larger later recovery peak. “Forward” here means increasing interior angle, not an independently tracked target direction. Max elbow bend is not measured maximum shoulder external rotation.

**Swings:** proposed strike proxy is the dominant peak of the body-normalized, hip-relative mean of both hand positions. Proposed top/reversal is the last meaningful preceding hand-speed trough or trajectory reversal. Both are explicitly equipment-free proxies. The batting clip has no reliable detected trough/reversal under these guards; its 13.458 s manual top remains, visibly flagged. Golf top/reversal is detected at 21.625 s.

**Kicks:** proposed load/backswing is the preceding active-knee minimum; strike is peak body-normalized hip-relative active-foot speed within the forward knee-extension burst. Actual ball contact and support forces are not observed.

**Follow-through:** automatic checkpoint is the first sustained active-effector speed decay below 25% of its primary peak for at least three samples and 40 ms. This is a deceleration checkpoint, not necessarily maximum extension, the high finish pose, landing, or the end of follow-through. Manual high-finish checkpoints may therefore differ substantially.

Manual times stay in the original config. Set `phaseTiming: "manual"` for an entire motion, or `manualOverride: true` on one phase. Auto candidates are still computed and displayed. A missing event retains its manual checkpoint with a warning. Conflicting/order-invalid anchors revert atomically to manual timings; candidates remain visible rather than being clamped or fabricated. `anchorCheckpointOnly` samples an event without moving the interval start. Acceleration and max-cocking checkpoints may coincide because acceleration begins at max cocking.

```ts
phaseTiming: "auto",
eventDetection: { kind: "throw", side: "right", sampleRate: 96 },
phases: [
  { name: "Release", referenceName: "Acceleration / Release",
    startTime: 24.33, endTime: 24.50, anchor: "release",
    manualOverride: true }, // auto candidate still shown; 24.33 is used
]
```

Candidate buttons pause/seek current playback for comparison without changing the saved raw/corrected reports. Both saved reports share the same selected raw-derived checkpoints. At shared phase boundaries, the report never substitutes a nearby frame’s applied correction for the exact checkpoint.

## Quarterback throw — `quarterback-throw`

Nominal trim **23.330–25.330 s**; actual baked playback **1.960584 s**; full source **36.291668 s**. Binding coverage **65/66**; the source-only Reference target is warned, not silently ignored. Exact reference key `football-throw`, stored verification **research-verified**.

Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing.

| Checkpoint | Manual | Detected | Selected / method | Raw R elbow | Raw L elbow | Raw R knee | Raw L knee | Hip–shoulder separation |
|---|---:|---:|---|---:|---:|---:|---:|---:|
| Loaded / Ready | 23.330 | — | 23.330 / manual | 40.96° | 67.29° | 129.71° | 135.34° | 3.72° |
| Early Cocking | 23.600 | — | 23.600 / manual | 41.09° | 66.39° | 122.43° | 135.25° | 2.54° |
| Late Cocking / Max Torque | 23.900 | 24.164 | 24.164 / auto | 19.38° | 123.65° | 144.96° | 125.25° | 11.64° |
| Acceleration | 24.170 | 24.164 | 24.164 / auto | 19.38° | 123.65° | 144.96° | 125.25° | 11.64° |
| Release | 24.330 | 24.288 | 24.288 / auto | 126.61° | 114.34° | 149.61° | 134.29° | 39.51° |
| Follow-Through | 24.500 | 24.549 | 24.549 / auto | 172.04° | 124.10° | 153.15° | 134.39° | 44.55° |

Raw values above are marker snapshots, not phase maxima. An em dash means no auto anchor was assigned or detected; the UI distinguishes these cases.

| Assigned checkpoint | Metric / binding | Range | Raw → corrected | Raw classification |
|---|---|---:|---:|---|
| Loaded / Ready | Back Knee Flexion / `rightKneeAngle` | 150–170° | 129.71° → 129.71° | Out of range; knee report-only |
| Loaded / Ready | Lead Knee Flexion / `leftKneeAngle` | 150–170° | 135.34° → 135.34° | Out of range; knee report-only |
| Loaded / Ready | Throwing Elbow Flexion / `rightElbowAngle` | 80–120° | 40.96° → 40.96° | Too far (>20° request) |
| Loaded / Ready | Non-Throwing Elbow Flexion / `leftElbowAngle` | 70–120° | 67.29° → 72.27° | Out of range |
| Early Cocking | Back Knee Flexion / `rightKneeAngle` | 140–160° | 122.43° → 122.43° | Out of range; knee report-only |
| Early Cocking | Lead Knee Flexion / `leftKneeAngle` | 150–170° | 135.25° → 135.25° | Out of range; knee report-only |
| Early Cocking | Throwing Elbow Flexion / `rightElbowAngle` | 80–100° | 41.09° → 41.09° | Too far (>20° request) |
| Early Cocking | Non-Throwing Elbow Flexion / `leftElbowAngle` | 30–70° | 66.39° → 68.69° | In range |
| Late Cocking / Max Torque | Back Knee Flexion / `rightKneeAngle` | 150–165° | 144.96° → 144.96° | Out of range; knee report-only |
| Late Cocking / Max Torque | Lead Knee Flexion / `leftKneeAngle` | 140–160° | 125.25° → 125.25° | Out of range; knee report-only |
| Late Cocking / Max Torque | Hip-Shoulder Separation / `hipShoulderSeparation` | 30–45° | 11.64° → 11.64° | Too far (>20° request) |
| Late Cocking / Max Torque | Throwing Elbow Flexion / `rightElbowAngle` | 85–100° | 19.38° → 19.38° | Too far (>20° request) |
| Late Cocking / Max Torque | Non-Throwing Elbow Extension / `leftElbowAngle` | 30–70° | 123.65° → 123.65° | Too far (>20° request) |
| Release | Lead Knee Extension / `leftKneeAngle` | 150–180° | 134.29° → 134.29° | Out of range; knee report-only |
| Release | Back Knee Extension / `rightKneeAngle` | 150–180° | 149.61° → 149.61° | Out of range; knee report-only |
| Release | Throwing Elbow Extension / `rightElbowAngle` | 90–180° | 126.61° → 126.61° | In range |
| Release | Non-Throwing Elbow Flexion / `leftElbowAngle` | 40–90° | 114.34° → 114.34° | Too far (>20° request) |
| Follow-Through | Lead Knee Extension / `leftKneeAngle` | 170–180° | 134.39° → 134.39° | Out of range; knee report-only |
| Follow-Through | Back Knee Flexion / `rightKneeAngle` | 150–170° | 153.15° → 153.15° | In range; knee report-only |
| Follow-Through | Throwing Elbow Extension / `rightElbowAngle` | 170–180° | 172.04° → 172.04° | In range |
| Follow-Through | Non-Throwing Elbow Flexion / `leftElbowAngle` | 30–70° | 124.10° → 124.10° | Too far (>20° request) |

Maximum applied elbow/total-spine offset: **12.019°**. Source clip and raw retargeted tracks were unchanged in the audit; only allowed elbow/spine quaternion tracks can differ in the corrected clone. Hip, knee, foot, toe, and translation tracks remain byte-for-byte unchanged.

The manual 24.17 s value was **21.133°**. It is retained as the acceleration baseline, not labeled detected release. The newly introduced manual release baseline, 24.33 s, measures 167.940°; it was not part of the old five-marker config. Auto Release at 24.288333 s measures 126.615°. The current structured Acceleration / Release throwing-elbow range is 90–180°, so the 126.615° proxy snapshot is in range and remains raw without needing correction. The follow-through range is separately 170–180°. The acceleration checkpoint deliberately has no release benchmark; no premature straightening is attempted.

Detection notes: Kinematic proxies only: no ball or tool tracking. Release is a wrist-speed proxy, not observed ball release; strike is not observed contact.

## Baseball pitch · fastball reference — `baseball-fastball`

Nominal trim **18.833–21.333 s**; actual baked playback **2.462417 s**; full source **25.125000 s**. Binding coverage **65/66**; the source-only Reference target is warned, not silently ignored. Exact reference key `baseball-fastball`, stored verification **unverified**.

Right wrist reaches 6.98 m/s during elbow extension vs left 3.10 m/s. Left foot lifts/strides, then travels 0.031 m vs right 0.516 m during delivery: left plant/right trail. Pitch subtype unobservable.

| Checkpoint | Manual | Detected | Selected / method | Raw R elbow | Raw L elbow | Raw R knee | Raw L knee | Hip–shoulder separation |
|---|---:|---:|---|---:|---:|---:|---:|---:|
| Setup / Load | 18.833 | — | 18.833 / manual | 47.58° | 60.52° | 153.67° | 154.60° | 5.97° |
| Maximum Leg Lift | 19.833 | — | 19.833 / manual | 39.62° | 55.21° | 126.48° | 84.44° | 9.97° |
| Stride / Plant Proxy | 20.417 | — | 20.417 / manual | 53.95° | 113.32° | 131.08° | 135.63° | 19.04° |
| Max Cocking | 20.583 | 20.586 | 20.586 / auto | 35.42° | 115.51° | 126.30° | 119.80° | 6.34° |
| Acceleration | 20.583 | 20.586 | 20.586 / auto | 35.42° | 115.51° | 126.30° | 119.80° | 6.34° |
| Release Proxy | 20.708 | 20.667 | 20.667 / auto | 85.94° | 139.22° | 127.79° | 118.77° | 22.59° |
| Follow-Through | 21.000 | 20.878 | 20.878 / auto | 161.50° | 167.78° | 135.62° | 123.13° | 23.59° |

Raw values above are marker snapshots, not phase maxima. An em dash means no auto anchor was assigned or detected; the UI distinguishes these cases.

| Assigned checkpoint | Metric / binding | Range | Raw → corrected | Raw classification |
|---|---|---:|---:|---|
| Stride / Plant Proxy | Knee Flexion / `leftKneeAngle` | 35–60° | 135.63° → 135.63° | Out of range; knee report-only |
| Max Cocking | Elbow Flexion / `rightElbowAngle` | 80–110° | 35.42° → 35.42° | Too far (>20° request) |

Maximum applied elbow/total-spine offset: **0.000°**. Source clip and raw retargeted tracks were unchanged in the audit; only allowed elbow/spine quaternion tracks can differ in the corrected clone. Hip, knee, foot, toe, and translation tracks remain byte-for-byte unchanged.

Pitch identity and sides are supported; fastball subtype is not proven. The existing 35–60° “Knee Flexion” range resembles a ROM-flexion convention, while the registry header explicitly says interior angles. The numerical out-of-range label is only a comparison to those stored unverified numbers, not an anatomical judgment; no silent 180−angle conversion or new range was applied. The elbow minimum is not measured shoulder MER.

Detection notes: Kinematic proxies only: no ball or tool tracking. Release is a wrist-speed proxy, not observed ball release; strike is not observed contact. Multiple qualifying extension bursts; reporting only the burst tied to the strongest within-extension effector-speed peak.

## Baseball batting swing — `baseball-batting-swing`

Nominal trim **12.875–14.500 s**; actual baked playback **1.586212 s**; full source **22.958334 s**. Binding coverage **65/66**; the source-only Reference target is warned, not silently ignored. Exact reference key `baseball-batting-swing`, stored verification **unverified**.

Body-local hands sweep anatomical right→left; left lead elbow is less folded than right trailing elbow. Left foot strides 0.215 m, then travels 0.009 m vs right 0.130 m around strike: right-handed swing, left lead/plant.

| Checkpoint | Manual | Detected | Selected / method | Raw R elbow | Raw L elbow | Raw R knee | Raw L knee | Hip–shoulder separation |
|---|---:|---:|---|---:|---:|---:|---:|---:|
| Setup | 12.875 | — | 12.875 / manual | 52.11° | 109.18° | 144.57° | 149.97° | 17.79° |
| Leg Lift / Load | 13.292 | — | 13.292 / manual | 45.44° | 107.04° | 134.37° | 58.87° | 29.72° |
| Top / Reversal Proxy | 13.458 | — | 13.458 / manual | 33.35° | 95.49° | 137.59° | 118.14° | 38.39° |
| Forward Acceleration | 13.708 | — | 13.708 / manual | 69.10° | 134.30° | 134.09° | 137.49° | 22.87° |
| Strike Proxy | 13.750 | 13.740 | 13.740 / auto | 101.06° | 141.21° | 134.70° | 140.09° | 13.99° |
| Follow-Through | 14.125 | 13.969 | 13.969 / auto | 125.02° | 77.50° | 139.13° | 140.76° | 32.29° |

Raw values above are marker snapshots, not phase maxima. An em dash means no auto anchor was assigned or detected; the UI distinguishes these cases.

| Assigned checkpoint | Metric / binding | Range | Raw → corrected | Raw classification |
|---|---|---:|---:|---|
| Leg Lift / Load | Knee Flexion / `rightKneeAngle` | 115–145° | 134.37° → 134.37° | In range; knee report-only |
| Strike Proxy | Elbow Flexion / `leftElbowAngle` | 90–120° | 141.21° → 141.21° | Too far (>20° request) |

Maximum applied elbow/total-spine offset: **0.766°**. Source clip and raw retargeted tracks were unchanged in the audit; only allowed elbow/spine quaternion tracks can differ in the corrected clone. Hip, knee, foot, toe, and translation tracks remain byte-for-byte unchanged.

Detection notes: Kinematic proxies only: no ball or tool tracking. Release is a wrist-speed proxy, not observed ball release; strike is not observed contact. Backswing unavailable: no meaningful preceding two-hand speed trough/direction reversal within 1.5 s; no preparation event invented. Top / Reversal Proxy: backswing was not detected; retained manual timing.

## Golf full swing · driver reference — `golf-driver-swing`

Nominal trim **20.250–22.750 s**; actual baked playback **2.461564 s**; full source **31.750000 s**. Binding coverage **65/66**; the source-only Reference target is warned, not silently ignored. Exact reference key `golf-driver-swing`, stored verification **unverified**.

Address-frame hand midpoint moves from anatomical right to left through swing. Right trailing elbow folds to 46° vs left lead 121°. Left ankle moves 0.0056 m horizontally vs right 0.0358 m through strike; left brace/right pivot.

| Checkpoint | Manual | Detected | Selected / method | Raw R elbow | Raw L elbow | Raw R knee | Raw L knee | Hip–shoulder separation |
|---|---:|---:|---|---:|---:|---:|---:|---:|
| Address | 20.500 | — | 20.500 / manual | 164.01° | 169.31° | 149.86° | 156.35° | 10.23° |
| Backswing / Load | 21.125 | — | 21.125 / manual | 147.18° | 163.00° | 151.46° | 148.88° | 22.39° |
| Top / Reversal Proxy | 21.625 | 21.625 | 21.625 / auto | 46.24° | 121.49° | 148.87° | 128.29° | 51.98° |
| Forward Acceleration | 21.792 | — | 21.792 / manual | 72.44° | 135.06° | 146.03° | 141.57° | 30.82° |
| Strike / Impact Proxy | 21.875 | 21.865 | 21.865 / auto | 129.35° | 162.56° | 140.76° | 153.83° | 31.69° |
| Follow-Through | 22.500 | 22.219 | 22.219 / auto | 102.27° | 62.33° | 144.70° | 166.06° | 26.73° |

Raw values above are marker snapshots, not phase maxima. An em dash means no auto anchor was assigned or detected; the UI distinguishes these cases.

| Assigned checkpoint | Metric / binding | Range | Raw → corrected | Raw classification |
|---|---|---:|---:|---|
| Strike / Impact Proxy | Knee Flexion / `leftKneeAngle` | 125–155° | 153.83° → 153.83° | In range; knee report-only |

Maximum applied elbow/total-spine offset: **0.000°**. Source clip and raw retargeted tracks were unchanged in the audit; only allowed elbow/spine quaternion tracks can differ in the corrected clone. Hip, knee, foot, toe, and translation tracks remain byte-for-byte unchanged.

Full golf-swing identity is supported; driver versus iron cannot be established without equipment. Only lead/left knee at the strike proxy is assigned an existing range.

Detection notes: Kinematic proxies only: no ball or tool tracking. Release is a wrist-speed proxy, not observed ball release; strike is not observed contact.

## Soccer passing · selected right-foot kick — `soccer-passing`

Nominal trim **18.750–19.792 s**; actual baked playback **1.001712 s**; full source **24.375000 s**. Binding coverage **65/66**; the source-only Reference target is warned, not silently ignored. Exact reference key `soccer-passing`, stored verification **unverified**.

Selected right foot reaches 7.496 m/s vs left 0.018 m/s; knee folds then extends. Left travels 0.0036 m vs right 0.574 m around strike: left plant. Other repetitions include LEFT-foot kicks; no whole-file dominance claim.

| Checkpoint | Manual | Detected | Selected / method | Raw R elbow | Raw L elbow | Raw R knee | Raw L knee | Hip–shoulder separation |
|---|---:|---:|---|---:|---:|---:|---:|---:|
| Setup | 18.833 | — | 18.833 / manual | 140.79° | 141.40° | 128.30° | 173.73° | 12.45° |
| Plant Stride / Load | 19.125 | — | 19.125 / manual | 136.15° | 175.53° | 145.64° | 135.17° | 6.41° |
| Max Knee Load | 19.292 | 19.293 | 19.293 / auto | 138.09° | 173.01° | 94.16° | 123.12° | 2.14° |
| Forward Acceleration | 19.333 | — | 19.333 / manual | 139.06° | 169.26° | 101.88° | 119.46° | 0.77° |
| Strike Proxy | 19.375 | 19.375 | 19.375 / auto | 138.34° | 169.67° | 124.78° | 118.70° | 2.68° |
| Follow-Through | 19.583 | 19.552 | 19.552 / auto | 133.20° | 153.16° | 172.86° | 122.78° | 26.18° |

Raw values above are marker snapshots, not phase maxima. An em dash means no auto anchor was assigned or detected; the UI distinguishes these cases.

| Assigned checkpoint | Metric / binding | Range | Raw → corrected | Raw classification |
|---|---|---:|---:|---|
| Strike Proxy | Knee Flexion / `rightKneeAngle` | 125–155° | 124.78° → 124.78° | Out of range; knee report-only |

Maximum applied elbow/total-spine offset: **0.000°**. Source clip and raw retargeted tracks were unchanged in the audit; only allowed elbow/spine quaternion tracks can differ in the corrected clone. Hip, knee, foot, toe, and translation tracks remain byte-for-byte unchanged.

The full file includes left- and right-foot repetitions. This config selects the coherent right-foot repetition, so “right” is clip-repetition laterality, not inferred player dominance. Passing versus shooting and inside-foot technique remain equipment-free classification uncertainties.

Detection notes: Kinematic proxies only: no ball or tool tracking. Release is a wrist-speed proxy, not observed ball release; strike is not observed contact.

## Soccer power shot — `soccer-power-shot`

Nominal trim **22.083–24.250 s**; actual baked playback **2.128130 s**; full source **28.333334 s**. Binding coverage **65/66**; the source-only Reference target is warned, not silently ignored. Exact reference key `soccer-power-shot`, stored verification **unverified**.

Right foot 9.414 m/s vs left 0.081 m/s during extension; left ankle travels 0.038 m vs right 1.878 m across the strike band. Left approach/support leg, right kick; forces/contact not measured.

| Checkpoint | Manual | Detected | Selected / method | Raw R elbow | Raw L elbow | Raw R knee | Raw L knee | Hip–shoulder separation |
|---|---:|---:|---|---:|---:|---:|---:|---:|
| Setup / Approach | 22.083 | — | 22.083 / manual | 149.12° | 172.70° | 162.98° | 149.06° | 1.66° |
| Backswing / Plant Transition | 23.250 | — | 23.250 / manual | 131.08° | 170.41° | 106.06° | 150.10° | 6.12° |
| Max Knee Load | 23.333 | 23.335 | 23.335 / auto | 131.67° | 171.50° | 85.69° | 139.07° | 3.90° |
| Forward Acceleration | 23.375 | — | 23.375 / manual | 133.78° | 172.18° | 92.60° | 135.19° | 3.35° |
| Strike Proxy | 23.417 | 23.417 | 23.417 / auto | 137.73° | 172.27° | 117.01° | 134.38° | 7.50° |
| Follow-Through | 23.667 | 23.919 | 23.919 / auto | 111.23° | 142.85° | 116.06° | 107.78° | 12.21° |

Raw values above are marker snapshots, not phase maxima. An em dash means no auto anchor was assigned or detected; the UI distinguishes these cases.

| Assigned checkpoint | Metric / binding | Range | Raw → corrected | Raw classification |
|---|---|---:|---:|---|
| Strike Proxy | Knee Flexion / `rightKneeAngle` | 120–155° | 117.01° → 117.01° | Out of range; knee report-only |

Maximum applied elbow/total-spine offset: **0.000°**. Source clip and raw retargeted tracks were unchanged in the audit; only allowed elbow/spine quaternion tracks can differ in the corrected clone. Hip, knee, foot, toe, and translation tracks remain byte-for-byte unchanged.

Detection notes: Kinematic proxies only: no ball or tool tracking. Release is a wrist-speed proxy, not observed ball release; strike is not observed contact. Multiple qualifying extension bursts; reporting only the burst tied to the strongest within-extension effector-speed peak.

## Tennis serve-like overhead sequence — `tennis-serve`

Nominal trim **12.500–15.417 s**; actual baked playback **2.879185 s**; full source **28.666666 s**. Binding coverage **65/66**; the source-only Reference target is warned, not silently ignored. Exact reference key `tennis-serve`, stored verification **unverified**.

Right wrist extends overhead above head after left off-arm raise; 7.34 m/s vs left1.60 m/s. Right pre-drive support; left landing/receiving lead. Neither foot securely planted at peak extension; left later moves0.027 m vs right0.691 m.

| Checkpoint | Manual | Detected | Selected / method | Raw R elbow | Raw L elbow | Raw R knee | Raw L knee | Hip–shoulder separation |
|---|---:|---:|---|---:|---:|---:|---:|---:|
| Setup | 12.500 | — | 12.500 / manual | 63.69° | 74.82° | 129.48° | 141.60° | 4.72° |
| Trophy-Like Preparation | 13.333 | — | 13.333 / manual | 72.03° | 174.87° | 129.34° | 156.04° | 0.74° |
| Loaded Stance | 14.333 | — | 14.333 / manual | 65.60° | 177.60° | 110.69° | 136.63° | 6.10° |
| Acceleration / Compact Cocking | 14.667 | 14.670 | 14.670 / auto | 32.46° | 154.18° | 136.64° | 76.61° | 11.09° |
| Overhead Stroke Proxy | 14.875 | 14.875 | 14.875 / auto | 156.97° | 137.86° | 146.99° | 151.26° | 16.97° |
| Follow-Through / Landing | 15.250 | 15.087 | 15.087 / auto | 159.27° | 127.65° | 131.07° | 122.89° | 20.87° |

Raw values above are marker snapshots, not phase maxima. An em dash means no auto anchor was assigned or detected; the UI distinguishes these cases.

| Assigned checkpoint | Metric / binding | Range | Raw → corrected | Raw classification |
|---|---|---:|---:|---|
| Trophy-Like Preparation | Elbow Flexion / `rightElbowAngle` | 85–115° | 72.03° → 72.03° | Out of range |
| Loaded Stance | Knee Flexion / `rightKneeAngle` | 100–140° | 110.69° → 110.69° | In range; knee report-only |

Maximum applied elbow/total-spine offset: **17.171°**. Source clip and raw retargeted tracks were unchanged in the audit; only allowed elbow/spine quaternion tracks can differ in the corrected clone. Hip, knee, foot, toe, and translation tracks remain byte-for-byte unchanged.

Earlier sequences are forehand-like and backhand-like groundstrokes; the selected sequence has left off-arm raising, compact right-arm cocking, overhead right-wrist extension above the head, and descending follow-through. It maps to `tennis-serve`, with serve-versus-smash uncertainty because neither ball nor racket is tracked. The trophy elbow range is assigned only to Trophy-Like Preparation; no trophy/forehand elbow range is applied to overhead contact. Right knee at load is the pre-drive support-knee benchmark. Left is the landing/receiving lead, not a securely planted foot at the overhead speed peak.

Detection notes: Kinematic proxies only: no ball or tool tracking. Release is a wrist-speed proxy, not observed ball release; strike is not observed contact.

## Trim selection evidence

Trims were set from full original-FBX activity scans and independent anatomically colored joint-position contact sheets, not the strongest sample alone. Opening rest-pose discontinuities, walking, gestures, other repetitions and reset were excluded. Activity thresholds are source-scan screening aids, not universal event classifiers.

| Clip | Selected activity core / screening | Padding / exclusion |
|---|---|---|
| Quarterback | Raw activity >0.7 m/s, 23.625–24.542 s | Retain proven 23.33–25.33 trim; loaded setup and recovery padding |
| Baseball pitcher | Seven-sample smoothed activity ≥0.25 m/s, 18.917–21.125 s | 0.083 s pre / 0.208 s post; exclude later reset |
| Baseball batter | Activity ≥0.75 m/s, 13.125–14.042 s | 0.250 s pre / 0.458 s post |
| Golf | Activity >0.35 m/s, 20.917–22.417 s, bridge top reversal | Address context from20.25; finish to22.75 |
| Soccer passing | Activity ≥1.25 m/s, 18.958–19.542 s, merge internal dip | 0.208 s pre / 0.250 s post; selected right-foot repetition |
| Soccer power shot | Activity ≥0.5 m/s begins22.167 s | 0.083 s pre; end24.25 before next recovery step despite residual activity |
| Tennis | Strong activity ≥1.5 m/s, 14.458–15.083 s | Include coherent slow preparation from12.5, end15.417 before reset |

## Verification and scope

Licensed-asset audit: all seven assets parse and retarget; phase times and bounds validate; source/raw clips remain unchanged; correction maximum stays ≤20°; all non-correctable tracks remain unchanged. Source angles were separately measured on an independent untouched FBX instance at the selected times.

Browser validation: all seven isolated routes loaded with 65/66 binding coverage and visibly rendered the model. Two concurrent first-frame screenshots were taken before a model render; subsequent captures confirmed pitcher and golf rendering. Quarterback detected-checkpoint seeking, raw/corrected mode switching, manual candidate comparison, frame stepping, and play/pause were exercised successfully. A manual-candidate seek did not overwrite the saved report.

TypeScript, production build, and full tests are run before Git delivery. Build emits the existing large-chunk advisory; tests emit legacy quaternion interpolation warnings. Test fixtures are deterministic synthetic geometry; result tables above use only the actual licensed assets.

Only isolated mocap config/helpers/view/report/tests and documentation changed. `Analysis.tsx`, `Replay.tsx`, `Hologram3D.tsx` are SHA-256 unchanged. No production routes, scoring, coaching, or replay behavior was connected or modified. FBX binaries are stored through the project storage proxy, not in Git. No managed `origin` history is fetched, pulled, merged or pushed; delivery targets only `user_github/main`.

## Source material

The user-supplied `Sports.zip` is the primary motion source. All numerical tables come from its original Mixamo FBX animations and the existing `MaleHologram_quant.glb` target. Reference numbers and verification labels come unchanged from `client/src/data/professionalReferences.ts`. Implementation sources: `mocapEvents.ts`, `mocapPhaseAnchors.ts`, `mocapPipeline.ts`, `mocapAngles.ts`, and `mocapCorrection.ts`. No external biomechanical validation is claimed.
