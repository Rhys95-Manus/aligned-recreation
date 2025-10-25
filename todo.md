# Aligned Recreation - TODO

## Bugs to Fix
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

