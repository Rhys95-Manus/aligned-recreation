/**
 * Automatic Rep Detection Utility
 * Detects individual reps within a continuous motion recording
 * by analyzing motion phases and key metric changes
 */

export type MotionState = 'neutral' | 'execution' | 'follow_through';

export interface RepBoundary {
  repNumber: number;
  startFrame: number;
  endFrame: number;
}

export interface FrameMetrics {
  hipRotation: number;
  shoulderRotation: number;
  rightElbowAngle: number;
  leftElbowAngle: number;
  spineAngle: number;
  weightTransfer: number;
}

/**
 * Detect the current motion state based on metrics
 */
export function detectMotionState(
  currentMetrics: FrameMetrics,
  previousMetrics: FrameMetrics | null,
  baselineMetrics: FrameMetrics
): MotionState {
  if (!previousMetrics) return 'neutral';
  
  // Calculate movement intensity (how much metrics have changed from baseline)
  const hipChange = Math.abs(currentMetrics.hipRotation - baselineMetrics.hipRotation);
  const shoulderChange = Math.abs(currentMetrics.shoulderRotation - baselineMetrics.shoulderRotation);
  const elbowChange = Math.abs(currentMetrics.rightElbowAngle - baselineMetrics.rightElbowAngle);
  const weightChange = Math.abs(currentMetrics.weightTransfer - baselineMetrics.weightTransfer);
  
  // Calculate velocity (rate of change between frames)
  const hipVelocity = Math.abs(currentMetrics.hipRotation - previousMetrics.hipRotation);
  const shoulderVelocity = Math.abs(currentMetrics.shoulderRotation - previousMetrics.shoulderRotation);
  const elbowVelocity = Math.abs(currentMetrics.rightElbowAngle - previousMetrics.rightElbowAngle);
  
  const totalChange = hipChange + shoulderChange + elbowChange + weightChange;
  const totalVelocity = hipVelocity + shoulderVelocity + elbowVelocity;
  
  // Thresholds for state detection (tuned for faster transitions)
  const NEUTRAL_THRESHOLD = 20; // Total change from baseline (lowered from 30 for faster detection)
  const EXECUTION_THRESHOLD = 40; // Significant movement (lowered from 50)
  const VELOCITY_THRESHOLD = 3; // High rate of change (lowered from 5 for quicker response)
  
  // Neutral: Close to baseline, low velocity
  if (totalChange < NEUTRAL_THRESHOLD && totalVelocity < VELOCITY_THRESHOLD) {
    return 'neutral';
  }
  
  // Execution: Significant change and high velocity
  if (totalChange > EXECUTION_THRESHOLD || totalVelocity > VELOCITY_THRESHOLD) {
    return 'execution';
  }
  
  // Follow-through: Significant change but slowing down
  return 'follow_through';
}

/**
 * Detect rep boundaries in a sequence of frames
 * Returns array of rep segments with start/end frame indices
 */
export function detectRepBoundaries(
  frames: Array<{ metrics: FrameMetrics }>,
  expectedReps: number
): RepBoundary[] {
  if (frames.length === 0) return [];
  
  // Calculate baseline metrics from first few frames (neutral position)
  const baselineFrames = frames.slice(0, Math.min(10, frames.length));
  const baselineMetrics: FrameMetrics = {
    hipRotation: average(baselineFrames.map(f => f.metrics.hipRotation)),
    shoulderRotation: average(baselineFrames.map(f => f.metrics.shoulderRotation)),
    rightElbowAngle: average(baselineFrames.map(f => f.metrics.rightElbowAngle)),
    leftElbowAngle: average(baselineFrames.map(f => f.metrics.leftElbowAngle)),
    spineAngle: average(baselineFrames.map(f => f.metrics.spineAngle)),
    weightTransfer: average(baselineFrames.map(f => f.metrics.weightTransfer))
  };
  
  const boundaries: RepBoundary[] = [];
  let currentState: MotionState = 'neutral';
  let previousState: MotionState = 'neutral';
  let repStartFrame = 0;
  let currentRepNumber = 1;
  
  for (let i = 1; i < frames.length; i++) {
    const previousMetrics = frames[i - 1].metrics;
    const currentMetrics = frames[i].metrics;
    
    currentState = detectMotionState(currentMetrics, previousMetrics, baselineMetrics);
    
    // Detect rep start: transition from neutral to execution
    if (previousState === 'neutral' && currentState === 'execution') {
      repStartFrame = i;
    }
    
    // Detect rep end: transition from follow_through/execution back to neutral
    if ((previousState === 'follow_through' || previousState === 'execution') && 
        currentState === 'neutral' && 
        i - repStartFrame > 15) { // Minimum rep duration (15 frames = ~0.5 seconds, lowered for faster detection)
      
      boundaries.push({
        repNumber: currentRepNumber,
        startFrame: repStartFrame,
        endFrame: i - 1
      });
      
      currentRepNumber++;
      
      // Stop if we've found all expected reps
      if (currentRepNumber > expectedReps) {
        break;
      }
    }
    
    previousState = currentState;
  }
  
  // If we didn't find enough reps, split recording evenly
  if (boundaries.length < expectedReps) {
    console.warn(`Only detected ${boundaries.length} reps, expected ${expectedReps}. Splitting evenly.`);
    return splitEvenly(frames.length, expectedReps);
  }
  
  return boundaries;
}

/**
 * Fallback: Split recording into equal segments if automatic detection fails
 */
function splitEvenly(totalFrames: number, repCount: number): RepBoundary[] {
  const framesPerRep = Math.floor(totalFrames / repCount);
  const boundaries: RepBoundary[] = [];
  
  for (let i = 0; i < repCount; i++) {
    boundaries.push({
      repNumber: i + 1,
      startFrame: i * framesPerRep,
      endFrame: i === repCount - 1 ? totalFrames - 1 : (i + 1) * framesPerRep - 1
    });
  }
  
  return boundaries;
}

/**
 * Calculate average of an array of numbers
 */
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

/**
 * Get the frames for a specific rep number
 */
export function getRepFrames<T>(
  allFrames: T[],
  boundaries: RepBoundary[],
  repNumber: number
): T[] {
  const boundary = boundaries.find(b => b.repNumber === repNumber);
  if (!boundary) return allFrames; // Fallback to all frames
  
  return allFrames.slice(boundary.startFrame, boundary.endFrame + 1);
}
