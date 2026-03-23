- [ ] Update Phase 1 elbow metrics to 60-90 degrees in professionalMotionGenerator.ts
- [ ] Modify Hologram3D.tsx to prioritize metrics over landmarks for rotation
- [ ] Verify hologram hips rotate correctly based on metrics
- [ ] Verify Phase 1 elbow angles are correct
- [ ] Restore `yoga.webp` and `archery.webp` with correct images (not kettlebell)
- [ ] Revert hologram color to previous cyan/blue blend
- [ ] Wait for user to upload quarterback video for animation calibration
- [ ] Extract motion data from uploaded video to fix hologram deformation
- [ ] Verify hologram animation with new data
- [ ] Replace `yoga.webp` with `Snatch2.0.png`
- [ ] Replace `archery.webp` with `kettlebellswing.png`
- [ ] Update hologram color to match the lighter electric blue from the provided images
- [ ] Recalibrate bone rotation axes in `Hologram3D.tsx` to fix deformation (focus on Mixamo rig standards)
- [ ] Verify animation fluidity with the new calibration
- [ ] Remap `hipRotation` and `shoulderRotation` metrics: 0° = Closed (Sideways/90° on model), 90° = Square (Facing target/0° on model)
- [ ] Revert hologram color to **Deep Electric Blue** (remove red/pink)
- [ ] Fix shoulder deformation: Ensure right shoulder stays wide and high in the "Closed" stance (prevent collapsing into torso)
- [ ] Verify arm position in "Late Cocking" phase (L-shape) to ensure it's not clipping
- [ ] Update `professionalMotionGenerator.ts`: Neutral/Closed = 90° (Perpendicular), Release/Square = 0° (Facing target)
- [ ] Darken hologram color significantly: Use deep navy/electric blue (`0x000088`), remove/reduce cyan emissive glow
- [ ] Fix shoulder deformation: Hard-code arm position in "Closed" stance to ensure it stays wide and away from torso
- [ ] Verify arm position in "Neutral" phase to ensure no clipping
- [ ] Reduce scene lighting intensity: Lower main light and spot light brightness
- [ ] Adjust hologram material: Increase roughness to reduce white specular highlights
- [ ] Remove/Darken pink rim light: Eliminate the pink tint that might be mixing with blue
- [ ] Set base color to pure deep blue (`0x0000ff`)
- [ ] Extract frame from `IMG_3222.MOV` to identify the exact blue color and lighting setup
- [ ] Update `Hologram3D.tsx` to match the extracted color (likely a brighter, more saturated electric blue with specific emissive settings)
- [ ] Adjust lighting to recreate the "perfect" look from the video (likely balanced ambient + directional light)
- [ ] Update `Home.tsx`: Rename "Yoga" to "Kettlebell Snatch" and "Archery" to "Kettlebell Swing"
- [ ] Update descriptions for Kettlebell exercises to be relevant (e.g., "Master the explosive hip drive" instead of generic text)
- [ ] Provide the direct preview link for incognito testing
- [ ] Update `Home.tsx`: Change "Master the explosive hip drive" to "Optimize your hip drive"
- [ ] Fix `Hologram3D.tsx`:
    - [ ] Set base color to Deep Electric Blue (`0x0000cc`)
    - [ ] Reduce emissive intensity to prevent white washout
    - [ ] Lower scene lighting intensity (Main Light 1.2 -> 0.5)
    - [ ] Increase material roughness to eliminate white specular highlights
- [ ] Refine Hologram Color:
    - [ ] Change base color to Royal Blue (`0x0033cc`)
    - [ ] Reduce emissive intensity to minimize "electric" look
- [ ] Fix Arm/Shoulder Pose:
    - [ ] Ensure starting arm position is at chest/sternum (Phase 1), not behind head
    - [ ] Correct shoulder rotation: Right Shoulder back (away from target), Left Shoulder forward (toward target) for right-handed thrower
- [ ] Force Arms Down in Neutral Phase:
    - [ ] Hard-code Right Shoulder Abduction to 0° (arms down) for Phase 1
    - [ ] Ensure arm only lifts during throw
- [ ] Flatten Hologram Color:
    - [ ] Disable emissive glow entirely (`emissiveIntensity: 0`)
    - [ ] Set base color to flat Royal Blue (`0x0033cc`)
- [ ] Correct Shoulder Rotation:
    - [ ] Force Right Shoulder BACK (negative rotation)
    - [ ] Force Left Shoulder FORWARD (positive rotation) for side-on stance
- [ ] Fix Arm Rotation Axis:
    - [ ] Swap `rightArm` rotation from Z to X/Y to force arms DOWN instead of BACK
    - [ ] Ensure arms are at chest/sides in Neutral Phase
- [ ] Rotate Model:
    - [ ] Rotate entire hologram 180 degrees (Y-axis) so Left Shoulder points to Target
- [ ] Deepen Blue Color:
    - [ ] Set base color to Royal Blue (`0x0044cc`)
    - [ ] Add minimal glow (0.15) for "little electricity" without white washout
- [ ] Fix Flailing Arms:
    - [ ] Force Shoulder Z (Up/Down) to 0° or negative in Neutral Phase
    - [ ] Force Shoulder X (Forward/Back) to +45° to bring elbows forward
    - [ ] Force Elbow Flexion to ~90° to keep hands at chest level
- [ ] Restore View Angle:
    - [ ] Separate "Stance Rotation" (internal model rotation) from "View Rotation" (camera/container)
    - [ ] Ensure manual rotation overrides animation loop
- [ ] Darken Hologram:
    - [ ] Reduce Metalness to 0 and increase Roughness to 1.0 (maximum matte)
    - [ ] Lower base color brightness to Deep Matte Blue (`0x0022aa`)
- [ ] Force Arms Down (Hard Override):
    - [ ] Bypass metric-based rotation for arms in Neutral Phase
    - [ ] Hard-code bone rotations to static "A-Pose" (arms down)
- [ ] Replace Material (Color Fix):
    - [ ] Use `MeshBasicMaterial` or dull `MeshLambertMaterial` in Dark Navy Blue (`0x001188`)
    - [ ] Remove all lighting calculations to eliminate shine/whiteness
- [ ] Adjust Camera:
    - [ ] Zoom out (increase Z position)
    - [ ] Pan down (decrease Y target) to show feet fully
- [ ] Fix Arms (Invert Rotation):
    - [ ] Try -80 degrees on X-axis (instead of +80)
    - [ ] Force Z-axis to 0
    - [ ] Clamp arms to sides using different rotation combination
- [ ] Fix Color (Disable Lights):
    - [ ] Remove all scene lights except weak ambient
    - [ ] Use `MeshBasicMaterial` in Pure Blue (`0x0000ff`)
    - [ ] Ensure material emits its own color (no reflection)
- [ ] Fix Camera (Reset Zoom):
    - [ ] Reset Z position to ~4.5 (closer)
    - [ ] Move camera Y position DOWN to ~0.8 to frame feet
    - [ ] Ensure model fills frame without being tiny
- [ ] Force Arm Rotation (All Axes)
- [ ] Move Model Up (Y-axis)
- [ ] Darken Color (Deep Blue)
- [ ] Log Bone Names (Debug)
- [ ] Fix Jumping (Reset Y)
- [ ] Restore Perfect Blue (Standard Material)
- [ ] Revert T-Pose to standard throwing stance (hands at chest/ready)
- [ ] Change Hologram Color to Deep Dark Cyan/Teal (0x004444 or similar)
- [ ] Reduce brightness/emissive intensity to avoid "neon" look
- [ ] Fix syntax error in Hologram3D.tsx
- [ ] Wake up app and provide shareable link
- [ ] Revert to last working version (bright cyan)
- [ ] Provide shareable link for testing
- [ ] Analyze `ChatGPTImageFeb4,2026,08_59_51PM.png` for color palette
- [ ] Update Hologram3D.tsx to use Pink/Magenta base with Cyan rim lighting/accents
- [ ] Adjust lighting to match the dramatic stadium look (blue background lights, pink subject)
- [ ] Analyze `ChatGPTImageFeb14,2026,04_24_24PM.png` for color palette
- [ ] Update Hologram3D.tsx to match the new blue/cyan color scheme
- [ ] Remove all pink/magenta elements
- [ ] Darken hologram base color to Deep Navy/Midnight Blue
- [ ] Reduce emissive intensity to minimize bloom
- [ ] Lower scene lighting for dramatic shadows
- [ ] Increase emissive intensity to ~1.0 for neon effect
- [ ] Lighten base color to Deep Electric Blue (between Navy and Ice Blue)
- [ ] Enhance wireframe visibility for structural pop
- [ ] Darken base color to Deep Navy (0x001144)
- [ ] Maintain high-intensity Neon Cyan wireframe (0x00ccff)
- [ ] Adjust lighting to create high contrast (Dark Body + Bright Edges)
- [ ] Restore Inner Layer: Deep Purple/Blue (0x2a004e) for volume
- [ ] Restore Outer Layer: Cyan Wireframe (0x00ffff) for contrast
- [ ] Ensure "Sci-Fi Hologram" depth is achieved
- [ ] Reduce wireframe opacity to ~0.15 (Subtle Digital Skin)
- [ ] Increase core opacity and emissive intensity (Solid Purple Mass)
- [ ] Boost Magenta rim light to highlight the purple core
- [ ] Reduce wireframe opacity to 0.1 (Barely-there Digital Edge)
- [ ] Create `LiveCoachingOverlay.tsx` component (Sci-Fi HUD style)
- [ ] Design "Positive Feedback" state (Green/Cyan highlight)
- [ ] Design "Correction Cue" state (Red/Magenta highlight)
- [ ] Implement "Listening/Analyzing" animation state
- [ ] Build logic to cycle through feedback between reps
- [ ] Merge Live Coaching logic into `isRecording` state
- [ ] Create a simulated "Camera Feed" background for the recording view
- [ ] Ensure feedback overlay appears dynamically *during* the recording session
- [ ] Implement `useEffect` timer to auto-increment `currentRep` every 5-8 seconds during recording
- [ ] Ensure `LiveCoachingOverlay` receives the updated rep count and triggers feedback animations
- [ ] Read `LiveCoachingOverlay.tsx` to check `useEffect` dependencies for `currentRep`
- [ ] Ensure feedback animation triggers on every rep change
- [ ] Verify z-index and visibility of the overlay container

- [x] Upgrade to full-stack project (database, server, user auth)
- [x] Resolve merge conflicts from upgrade (preserve Home.tsx, package.json deps)
- [x] Update dependencies (tanstack/react-query v5, vite-plugin-manus-runtime v0.57)
- [x] Push database schema (users table)
- [x] Verify all existing pages and routes preserved after upgrade
- [x] Migrate local storage data to cloud database
- [x] Add cloud video storage (S3 upload for exported videos)
- [x] Create sessions and user_settings database tables
- [x] Create tRPC API for sessions CRUD and settings management
- [x] Create useCloudStorage hook with dual-mode (cloud + localStorage fallback)
- [x] Update Analysis.tsx to use cloud storage for totalPoints
- [x] Update Replay.tsx to save sessions to cloud
- [x] Update Replay.tsx "Save to Cloud" button to upload videos to S3
- [x] Update SessionHistory.tsx to load from cloud with auth banner
- [x] Write vitest tests for sessions and settings (11 tests passing)
- [x] All TypeScript compiles clean (tsc --noEmit passes)

## Voice-Activated Start
- [x] Create useVoiceCommand hook using Web Speech API
- [x] Integrate voice trigger into Analysis page (say "Start" to begin capture)
- [x] Add visual feedback for voice listening state (microphone indicator)
- [x] Ensure voice command works alongside manual button (both paths supported)
- [x] Handle browser compatibility (fallback when Speech API unavailable)
- [x] Write tests for voice command integration (13 tests passing)

## Bug Fixes
- [x] Fix voice commands not triggering start capture (stale closures fixed with refs)
- [x] Remove stop/finish/done voice commands (auto-stop works well, not needed)
- [x] Fix auto-stop delay regression (reduced to 100ms, removed duplicate stopAndScore call)
- [x] Fix glitching text under start capture button (use voiceEnabled not isListening for stable rendering)

## Bug Fixes (Round 2)
- [x] Fix auto-stop rep counter off-by-one (added completedRepsRef, restored sessionState complete useEffect, reset refs in startCapture, restored 500ms delay)
- [x] Fix app's own speech triggering voice command (added mute() to useVoiceCommand, changed speech text to avoid trigger words, mute during countdown)

## Bug Fixes (Round 3)
- [x] Fix auto-stop not triggering after rep completion (reverted completedRepsRef back to original completedReps.length - the stale closure was the correct design)

## Bug Fixes (Round 4)
- [x] Fix persistent auto-stop bug: restored exact working Analysis.tsx from pre-voice checkpoint, surgically re-added voice code with zero changes to auto-stop logic

## Bug Fixes (Round 5 - Clean Room)
- [x] Fully revert Analysis.tsx to exact pre-voice working version (8815b37) — verified byte-for-byte identical
- [x] Move voice commands to standalone VoiceCommandOverlay component (uses DOM click, zero hooks/state/refs in Analysis.tsx)
- [x] Fix speech text: changed to "You may now proceed when ready" (no trigger words)
- [x] Verify auto-stop code: diff shows only 5 lines changed (import, data-attr, component render, speech text, flex-wrap)

## Bug Fixes (Round 6 - Root Cause Hunt)
- [x] Found real root cause: useCloudStorage hook causing re-renders during capture, resetting pose callback closures
- [x] Removed useCloudStorage from Analysis.tsx, restored original localStorage approach for totalPoints
- [x] Moved voice toggle back next to Live Coaching toggle
- [x] Cleaned up VoiceCommandOverlay to single-instance rendering (no renderLocation split)
- [x] Verified diff: only 5 non-voice lines differ from working version (import, speech text, localStorage)

## UI Polish
- [ ] Move voice hint text to larger centered overlay on video frame until capture begins

## UI Polish
- [x] Move voice hint to larger centered text inside video frame (uses createPortal into video container)
- [x] Hide hint when capture begins (auto-hidden during capturing/countdown states)
- [x] Lower hologram mesh opacity to 0.08

## Live Coaching Refinement
- [x] Audit all tracked metrics across all motions (not just elbow/hip)
- [x] Replace generic feedback ("fix elbow angle") with actionable sports-science cues ("tuck your elbow tight")
- [x] Create motion-specific coaching cue mappings for each metric
- [x] Expand live coaching to cover all tracked metrics, not just elbow angle and hip rotation
- [x] Ensure cues are flow-friendly (short, actionable, no thinking required)
- [x] Write/update tests for new coaching cue system

## Phase-Aware Coaching
- [x] Define biomechanical phases for each motion type (setup, cocking, acceleration, release, follow-through, etc.)
- [x] Map expected metric values per phase per motion (what each metric should be doing at each phase)
- [x] Implement phase detection logic using metric snapshots during the rep
- [x] Create phase-aware coaching cue templates (e.g., "During the cocking phase, ___")
- [x] Update LiveCoachingOverlay to show phase-contextual feedback between reps
- [x] Write tests for phase detection and phase-aware cue generation

## Basketball Jump Shot - Comprehensive Motion Profile
- [x] Implement 6-phase basketball jump shot (Neutral/Reset, Ready Pocket, Dip/Load, Rise to Set Point, Release, Flight/Landing/Follow-Through)
- [x] Add all metrics per phase (shooting/off-hand elbow flexion, knee flexion, shoulder rotation, spine lean, weight transfer, elbow height index, hip-ball synch, release timing, landing recovery)
- [x] Implement phase timing targets and scoring (0.90-1.20s total motion window)
- [x] Add global motion events for phase detection anchoring
- [x] Implement phase-specific scoring logic with deductions and bonuses
- [x] Update coaching cues with user-specified instructional sentences
- [x] Update phase coaching with phase triggers and transition logic
- [x] Update professional references for basketball jump shot
- [x] Write tests for basketball jump shot motion profile

## Rep Detection Regression Fix
- [x] Investigate why rep detection no longer correctly identifies rep completion for football throw and basketball jump shot
- [x] Fix false rep detection during neutral standing
- [x] Fix missed rep detection during actual reps
- [x] Verify rep detection works correctly for both football throw and basketball jump shot
- [x] Write/update tests for rep detection

## Rep Detection & Replay Timing Bugs
- [x] Fix rep detection thresholds too strict — requiring 2-3 actual reps before counting one (football throw and basketball first rep)
- [x] Fix skeleton overlay timing delay in replay screen — skeleton is delayed from user's actual motion

## Football Throw Rep Detection Too Sensitive
- [x] Fix football throw counting a rep while user is standing in neutral listening to coaching feedback
- [x] Keep basketball jump shot detection unchanged (currently working perfectly)

## Bug Fixes (Round 7 - User Testing Feedback)
- [x] Football throw without coaching: requiring 2 physical reps for 1 counted rep (thresholds too strict)
- [x] Football throw with coaching: still counting neutral/resting as a rep (moves to rep 3 while resting after rep 1)
- [x] Basketball jump shot without coaching: 3rd rep occasionally needs 2 physical reps
- [x] Replay analysis: showing too much neutral/rest time instead of trimming to just the motion
- [x] Voice command "start/go": requiring user to say the command twice before it triggers

## Bug Fixes (Round 8 - Football Throw Overcorrected)
- [x] Football throw rep detection way too strict — requires 5-6 physical reps for 1 counted rep
- [x] Restore football throw to its previously perfect detection and only fix the coaching feedback false-rep issue

## Bug Fixes (Round 9 - Football Throw Rep 1 Still Needs 2 Reps)
- [x] Football throw: still requiring 2 physical reps for rep 1 (with coaching on or off)
- [x] Basketball jump shot: confirmed working perfectly - DO NOT TOUCH

## Bug Fixes (Round 10 - Football Throw Rep 1 Still Broken)
- [ ] Football throw: rep 1 still requires 2 physical reps despite matching old thresholds
- [ ] Investigate if metric pipeline changed since football was working (basketball metrics may have altered calculations)
- [ ] Consider implementing phase-aware rep detection for football (like basketball has)

## Bug Fixes (Round 11 - Football Throw Phase-Aware Detection Needed)
- [x] Football throw: system can't reliably detect when user returns to neutral after a throw (needs phase-aware detection like basketball)
- [x] Football throw: voice command auto-triggers without user saying anything (auto-starts the motion)
- [x] Basketball jump shot: confirmed working perfectly with voice commands - DO NOT TOUCH

## Bug Fixes (Round 12 - Football Throw Elbow-Based Detection)
- [x] Football throw: velocity-based detection still failing — needs biomechanics-based approach like basketball
- [x] Football throw: implement elbow-angle phase detection (ball at chest = bent elbow = neutral, throw = extended = execution)
- [x] Basketball: confirmed perfect — DO NOT TOUCH

## Bug Fixes (Round 13 - Restore Exact Working Football Code)
- [x] Football throw: elbow-based detection still broken — restore EXACT code from the commit where football was confirmed working
- [x] Stop overengineering — find the working commit and restore byte-for-byte

## Bug Fixes (Round 14 - Rep 1 Detection)
- [x] Both football throw and basketball jump shot: rep 1 requires performing the motion twice before it registers
- [x] Subsequent reps (2, 3, etc.) detect correctly — only rep 1 is affected
- [x] Root cause: countdown speech ("Perform your motion now!") triggered 5s coaching cooldown, blocking first rep start

## Feature: Motion-Specific Holograms
- [x] Upload MaleHologram.glb for basketball motions
- [x] Use MaleHologram.glb for all basketball motions except dribbling
- [x] Keep football hologram for football motions
- [x] Ensure each hologram plays the correct animation for its motion type (basketball jump shot vs football throw bone animations)

## Hologram Color Fix
- [x] Match basketball hologram color to football hologram color (same material/lighting, no other changes)

## Hologram Color Fix (Round 2)
- [x] Basketball hologram still different color from football — starts dark blue, gets lighter during replay
- [x] Root cause: denser geometry catches more light; fixed with model-specific material (lower metalness 0.2, higher roughness 0.8, reduced emissive)

## Hologram Color Fix (Round 3)
- [x] Basketball hologram wireframe not applied from start — appears only at end of replay
- [x] Color still shifts from dark blue to electric blue during replay
- [x] Root cause: SkinnedMesh wireframe was created as separate mesh not bound to skeleton; fixed by using clone() which preserves skeleton binding

## Hologram Color Fix (Round 4)
- [x] Basketball hologram still dark blue → electric blue transition with wireframe appearing late
- [x] Strip any baked animation from the GLB model (created clean version without animation data)
- [x] Fixed infinite clone bug: traverse() was adding cloned wireframe meshes during iteration, causing exponential mesh duplication
- [x] Match football hologram appearance exactly (same material, proper wireframe from frame 1)
