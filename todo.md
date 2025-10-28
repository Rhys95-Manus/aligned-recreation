# Aligned Recreation - TODO

## Bugs to Fix
- [ ] Test and verify peak value tracking works correctly during throwing motion
- [ ] Verify new code is loading in browser (check for fire emoji console log)
- [x] Fix powerGeneration and movementTiming to use peak values instead of state variables
- [x] Fix biomechanical calculations showing 0.0° - was using React state instead of local variables
- [x] Implement peak value tracking - capture MAXIMUM values during motion, not just final frame
- [x] Fix video frame height on desktop - too tall, requires scrolling to see Start Video/Capture buttons
- [x] Fix scoring system giving scores without motion (91 score while sitting still)
- [x] Add footwork metrics (Foot Positioning, Weight Transfer) to Biomechanical Analysis display
- [x] Fix contradictory feedback (elbow angle says "maintain 90°" but pro is 104°)
- [x] Fix repetitive/mock scores in detailed analysis - use actual captured data
- [x] Change audio cue from "position yourself and start capture" to "video capture is ready, press start capture when ready"
- [x] Fix "Back to Motions" button 404 error on detailed analysis page
- [x] Fix "Analyze Another Motion" not reinitializing camera and MediaPipe

## Features to Implement
- [x] Add footwork metrics to detailed analysis display
- [x] Show what detailed analysis should read from professional reference
- [x] Implement actual Power Generation calculation
- [x] Implement actual Movement Timing calculation
- [x] Add footwork tracking and comparison with professionals
- [x] Improve biomechanical metric logging to show actual values
- [x] Fix scoring algorithm to properly use professional reference
- [x] Build professional reference system for scoring
  - [x] Research 8 professional quarterbacks for Football Throw reference
  - [x] Create averaged professional reference data structure
  - [x] Implement comparison algorithm for user vs professional metrics
  - [x] Integrate professional reference into detailed analysis

## Completed
- [x] Video frame enlarged to 80% width
- [x] Motion-specific Pro Tips section
- [x] Fixed foot detection with distance calculation
- [x] Advanced biomechanical tracking (9 metrics)
- [x] Removed face landmarks, added custom landmarks (27 total)
- [x] Green head landmark at top of head
- [x] Teal neck landmark in middle of neck
- [x] 3 spine landmarks with visualization
- [x] Fixed back button navigation from Analysis page
- [x] Wide layout (max-w-7xl)


- [ ] Fix browser caching issue - new code changes not loading in browser despite dev server running


- [ ] Waiting for user to click "Stop and Score" and share console output with peak values


- [ ] CRITICAL: stopAndScore function not being called when "Stop and Score" button is clicked


- [x] FIX ROOT CAUSE: getProfessionalReference key mismatch - was using category ("sports") instead of subcategory ("football")


- [ ] CRITICAL: Peak tracking not working - sessionState closure issue in onResults callback, peaks stay at 0.0°



## New Features Requested - MAJOR UPGRADE
- [x] Add 5-second countdown after "Start Capture" with audio cues ("5, 4, 3, 2, 1, Perform your motion now")
- [x] Display countdown visually on video frame
- [x] Record ALL frames during motion capture (not just peak values) for replay
- [x] Create side-by-side replay page: User motion (left) vs 3D holographic professional reference (right)
- [x] Add 5-second countdown before replay begins
- [x] Add Play/Pause controls on replay page
- [ ] Implement phase detection (Wind-up → Cocking → Acceleration → Release → Follow-through)
- [ ] Show real-time metrics during replay that match current phase
- [ ] Visual comparison showing metric differences at each phase
- [ ] Interactive scrubbing to pause and compare at any moment
- [x] Fix angle calculations - now measuring flexion correctly (elbow, knee) and hip rotation deviation


- [ ] CRITICAL: Peak tracking logic is wrong - need MIN for flexion angles (elbow, knee) and MAX for rotation angles (hip, shoulder)



## Phase 3 Improvements Needed
- [x] Remove 5-second countdown before replay starts
- [x] Fix hologram to show PROFESSIONAL REFERENCE motion, not user motion duplicate (CRITICAL)
- [x] Generate professional reference motion sequence with phase-based pose landmarks
- [x] Generate professional reference metrics that change through motion phases (not static)
- [x] Sync professional motion timing with user motion duration
- [x] Add footwork metrics (foot positioning, weight transfer) to live metrics display
- [x] Add complete detailed analysis below live metrics after replay finishes
- [x] Include: Power Generation, Movement Timing, Posture & Alignment, Range of Motion, Joint Angles, Balance & Stability
- [x] Show overall score comparing user to professional reference
- [x] Add Improvement Recommendations section with drills/activities
- [x] Add Strengths section showing what user did well



## Phase 3 Fixes Needed
- [x] Fix professional hologram "spazzing out" - landmarks not generating realistic stable poses
- [x] Improve pose generation algorithm to create smooth, biomechanically accurate motion
- [x] Remove random variations that cause jittery movement
- [x] Filter face landmarks (0-10) from rendering so user can see their face, but keep calculating them for posture analysis



## Professional Hologram Motion - COMPLETE!
- [x] Create keyframe-based animation system for realistic throwing motion
- [x] Define 6 keyframe poses with precise landmark coordinates:
  - Keyframe 1: Neutral Stance (0-15%)
  - Keyframe 2: Wind-up (15-35%)
  - Keyframe 3: Cocking (35-55%) - arm back, hips rotated
  - Keyframe 4: Acceleration (55-75%) - hips forward, arm whipping
  - Keyframe 5: Release (75-85%) - arm extended
  - Keyframe 6: Follow-through (85-100%) - arm across body
- [x] Smooth interpolation between keyframes with easing
- [x] Match blue/pink glowing hologram aesthetic



## Hologram Fixes Needed
- [ ] Fix hologram to throw with RIGHT arm (currently throwing with left)
- [ ] Apply 3D perspective transformation to make hologram look 3D instead of flat 2D
- [ ] Improve keyframe poses to look more like an actual quarterback throw
- [ ] Add left-handed / right-handed toggle option before replay
- [ ] Mirror hologram motion based on user's handedness selection
- [ ] Update metrics comparison to match selected handedness

