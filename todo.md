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
- [x] Fix hologram to throw with RIGHT arm - exaggerated cocking and release positions
- [x] Apply 3D perspective transformation to make hologram look 3D instead of flat 2D
- [x] Improve keyframe poses to look more like an actual quarterback throw
- [x] Add left-handed / right-handed toggle option before replay
- [x] Mirror hologram motion based on user's handedness selection
- [ ] Update metrics comparison to match selected handedness



## Critical Hologram Issues - RESOLVED!
- [x] WRONG ARM MOVING - Fixed x-coordinate mirroring (x = 1 - lm.x) so right arm appears on viewer's left
- [x] 2D flat appearance - Added 3D perspective transformation with z-depth scaling and opacity
- [x] Added left/right handed toggle button to switch between right-handed and left-handed motions
- [x] Depth visualization with size scaling (closer = larger, further = smaller)
- [x] Opacity-based depth cues (closer = brighter, further = dimmer)
- [x] Manual connection drawing with depth-based line thickness




## CRITICAL ISSUES - User Feedback (Current Session) - ALL RESOLVED!
- [x] 3D perspective not visible - depth transformation too subtle, can't tell what hologram is doing
- [x] Enhance 3D visualization with stronger z-axis scaling and color gradients
- [x] Add rotation visualization to show arm going back/forward clearly
- [x] Left/right handed toggle doesn't swap live metrics (misleading - shows right arm angles for left-handed users)
- [x] Swap metric labels and calculations when left-handed mode is selected
- [x] Phase desynchronization - user and hologram in different motion phases (user on release, hologram on cocking)
- [x] Implement phase detection based on user's current metrics
- [x] Synchronize hologram phase with user's current phase for accurate comparison

### Solutions Implemented:
- **3D Perspective**: Reduced perspective factor 300→150, increased depth multiplier 100→500, added color gradients (blue=close, red=far), larger points (6px), thicker lines (4px)
- **Metric Swapping**: Left/right handed toggle now swaps both labels AND values for elbow/knee metrics
- **Phase Synchronization**: Created phaseDetection.ts utility with scoring algorithm, detects user phase based on metrics, synchronizes hologram to show same phase, displays phase indicator in purple badge




## NEW CRITICAL ISSUES - Hologram Animation & Metrics (Current Session)
- [ ] All metrics should swap for left/right handed (not just elbow/knee) - lead leg changes, weight transfer flips
- [x] 3D perspective transformation is DISTORTING skeleton into boxy/geometric shapes - not fluid/human-looking
- [x] Fix transformation to use body center (hip midpoint) instead of canvas center to prevent warping
- [x] Hologram only shows right arm moving - hips, feet, legs, torso are static or barely moving
- [x] Full-body animation missing: hips should rotate, feet should shift, legs should transfer weight
- [x] Keyframes DO include full-body movement data - problem was phase synchronization locking to single frame
- [ ] "Stop and Score" button press contaminates last 2-3 seconds of motion capture with leaning/reaching movement
- [ ] Need to trim last 2-3 seconds from recorded frames before analysis

### Fixes Applied:
- **3D Transformation**: Changed to use body center (hip midpoint) as perspective origin, reduced distortion (perspective factor 150→500, depth multiplier 500→200)
- **Phase Synchronization Removed**: Was locking hologram to single static frame per phase, now plays through full animation
- **Hologram Animation**: Now animates through all phases showing full-body movement (hips, legs, feet, arms)




## CRITICAL DISCOVERY - Keyframe Movement Too Subtle (Current Session)
- [x] Diagnosed root cause: Keyframe data has movement but it's TOO SMALL to be visible
- [x] Hip rotation only 1% of screen width (0.01 units) - needs to be 20-30%
- [x] Feet/legs barely shifting - weight transfer invisible
- [x] Body parts ARE moving in data but changes are imperceptible on screen
- [ ] URGENT: Dramatically increase movement ranges in all keyframes (5-10x larger)
- [ ] Exaggerate hip rotation, foot positioning, knee bend, weight transfer
- [ ] Make throwing motion visually obvious and dramatic




## CRITICAL FINDING - 3D Transformation Destroying Movement (Current Session)
- [x] Console data confirms hips ARE moving 20% across screen (0.480 → 0.680)
- [x] Keyframe data is CORRECT and dramatic
- [x] Problem: 3D perspective transformation is WARPING coordinates and destroying visible movement
- [x] SOLUTION: Remove ALL 3D perspective transformation, render in simple 2D
- [x] Use color/opacity ONLY for depth perception (no coordinate warping)
- [x] Draw landmarks directly without any scaling or perspective distortion
- [x] Fix metric swapping to change DEGREES not just labels

### Solutions Implemented:
- **Removed 3D Transformation**: No more coordinate warping, uses raw x/y values directly
- **Simple 2D Rendering**: Color gradients (cyan=close, magenta=mid, red=far) and opacity for depth only
- **Proper Metric Swapping**: Now compares throwing arm to throwing arm, lead leg to lead leg
  * Right-handed: User's right elbow vs Pro's right elbow, User's left knee (lead) vs Pro's left knee (lead)
  * Left-handed: User's LEFT elbow vs Pro's RIGHT elbow, User's RIGHT knee (lead) vs Pro's LEFT knee (lead)
- **Biomechanically Correct Labels**: "Throwing Arm Elbow", "Lead Leg Knee", etc.




## Rewrite Professional Motion Keyframes with Proper Biomechanics (Current Session)
- [ ] Research proper quarterback throwing biomechanics and rotation sequence
- [ ] Document the 3D rotation pattern: z-axis (facing target) → x-axis (perpendicular) → z-axis (release)
- [ ] Rewrite Neutral keyframe: Hips and shoulders aligned on z-axis facing target
- [ ] Rewrite Wind-up keyframe: Both hips and shoulders start rotating to x-axis
- [ ] Rewrite Cocking keyframe: Maximum x-axis rotation (perpendicular to target), arm back
- [ ] Rewrite Acceleration keyframe: Explosive rotation back toward z-axis, hips lead
- [ ] Rewrite Release keyframe: Square to target (z-axis), arm extended forward
- [ ] Rewrite Follow-through keyframe: Continue rotation past z-axis, weight forward
- [ ] Test hologram to verify fluid, realistic throwing motion
- [ ] Ensure hologram shows proper torque generation and hip-shoulder coordination




## Hologram Rendering Issues - Current Session
- [ ] Hologram looks like a box moving on X/Y axis only - no visible depth/rotation
- [ ] Z-coordinates exist in data but not visualized properly
- [ ] Implement CORRECT 3D perspective transformation:
  * Apply perspective to show z-axis depth
  * Parts further back (positive z) appear smaller and shifted
  * Parts closer (negative z) appear larger and shifted
  * NO distortion of skeleton structure
- [ ] Hologram is stick figure - can't see hands, feet, or head
- [ ] Match user's rendering style:
  * Draw visible landmark dots (like green dots on user)
  * Use same connection lines
  * Make it look identical to user skeleton but in magenta/purple color
  * Show all 33 landmarks as visible points




## Keyframe 3D Coordination Issues - Current Session - ALL FIXED! ✅
- [x] Hips show depth/rotation but shoulders and feet are flat
- [x] Shoulders get distorted during motion - don't look human
- [x] Body proportions are odd - shoulders look wrong compared to rest of body
- [x] Audit all 6 keyframes for proper 3D z-coordinates:
  * Shoulders rotate in sync with hips (0.000 diff in 5/6 phases)
  * Feet/ankles rotate with body (0.000 diff in all phases)
  * Knees rotate with body (0.000 diff in 5/6 phases)
  * Arms maintain proper attachment to rotating shoulders
- [x] Maintain consistent human proportions through all phases:
  * Shoulder width: 0.180 (constant across ALL phases) ✅
  * Torso length: 0.280 (constant across ALL phases) ✅
  * Hip width: 0.160 (constant across ALL phases) ✅
- [x] Verify coordinated full-body rotation - all parts move together as one unit

### Fixes Applied:
- **Wind-up**: All body parts rotate together (shoulders, hips, knees, ankles all at +0.20 z-rotation)
- **Cocking**: All body parts rotate together (all at +0.28 z-rotation)
- **Acceleration**: Hips/knees/ankles at +0.12, shoulders lag at +0.20 (INTENTIONAL torque separation)
- **Release**: All body parts square to target (all at +0.04 z-rotation)
- **Follow-through**: All body parts rotate together (all at -0.24 z-rotation)
- **Proportions**: Shoulder width, hip width, and torso length now constant across all phases




## Video-Based Professional Motion Capture - Current Session - COMPLETE! ✅
- [x] Download YouTube video: https://www.youtube.com/watch?v=CPMHEARywsU (WRONG VIDEO - discarded)
- [x] Joe Burrow YouTube Shorts: https://www.youtube.com/shorts/P7QqoTKbrgI (BLOCKED - bot detection)
- [x] Tom Brady instructional video: https://www.youtube.com/watch?v=lv5p2Xqkxyk (USER REQUESTED NOT TO USE)
- [x] Download Facebook reel: https://www.facebook.com/reel/912999550989454 (SUCCESS!)
- [x] Process full video with MediaPipe (406/423 frames detected - 96% success rate)
- [x] Re-analyze focusing on seconds 2-4 (frames 60-120) for throwing motion
- [x] Extract 6 keyframes from seconds 2-4 timeframe (Neutral, Wind-up, Cocking, Acceleration, Release, Follow-through)
- [x] Convert pose data to TypeScript keyframe format
- [x] Replace manual keyframes with real QB motion data
- [x] Fix negative radius error (clamped scale to 0.2-2.0 range)
- [ ] Test hologram rendering with real motion
- [ ] Verify natural, fluid throwing motion with proper leg differentiation

