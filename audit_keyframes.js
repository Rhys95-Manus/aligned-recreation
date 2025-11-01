/**
 * Audit script to analyze keyframe 3D coordinates and proportions
 * Run with: node audit_keyframes.js
 */

// Import the keyframes
const { createThrowingKeyframes } = require('./client/src/utils/professionalMotionKeyframes.ts');

const keyframes = createThrowingKeyframes();

console.log('='.repeat(80));
console.log('KEYFRAME 3D COORDINATE AUDIT');
console.log('='.repeat(80));

keyframes.forEach((kf, idx) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`KEYFRAME ${idx + 1}: ${kf.phase} (Progress: ${kf.progress})`);
  console.log('='.repeat(80));
  
  const landmarks = kf.landmarks;
  
  // Extract key body parts
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  const leftFoot = landmarks[29];
  const rightFoot = landmarks[31];
  
  // Calculate z-rotation (difference between left and right z-coordinates)
  const shoulderZRotation = rightShoulder.z - leftShoulder.z;
  const hipZRotation = rightHip.z - leftHip.z;
  const kneeZRotation = rightKnee.z - leftKnee.z;
  const ankleZRotation = rightAnkle.z - leftAnkle.z;
  const footZRotation = rightFoot.z - leftFoot.z;
  
  console.log('\n📊 Z-AXIS ROTATION (Right - Left):');
  console.log(`  Shoulders: ${shoulderZRotation.toFixed(3)} (L: ${leftShoulder.z.toFixed(3)}, R: ${rightShoulder.z.toFixed(3)})`);
  console.log(`  Hips:      ${hipZRotation.toFixed(3)} (L: ${leftHip.z.toFixed(3)}, R: ${rightHip.z.toFixed(3)})`);
  console.log(`  Knees:     ${kneeZRotation.toFixed(3)} (L: ${leftKnee.z.toFixed(3)}, R: ${rightKnee.z.toFixed(3)})`);
  console.log(`  Ankles:    ${ankleZRotation.toFixed(3)} (L: ${leftAnkle.z.toFixed(3)}, R: ${rightAnkle.z.toFixed(3)})`);
  console.log(`  Feet:      ${footZRotation.toFixed(3)} (L: ${leftFoot.z.toFixed(3)}, R: ${rightFoot.z.toFixed(3)})`);
  
  // Check if rotation is coordinated
  const rotationDiff = Math.abs(shoulderZRotation - hipZRotation);
  const kneeHipDiff = Math.abs(kneeZRotation - hipZRotation);
  const ankleHipDiff = Math.abs(ankleZRotation - hipZRotation);
  
  console.log('\n⚠️  COORDINATION CHECK:');
  console.log(`  Shoulder-Hip rotation diff: ${rotationDiff.toFixed(3)} ${rotationDiff > 0.05 ? '❌ TOO LARGE' : '✅ OK'}`);
  console.log(`  Knee-Hip rotation diff:     ${kneeHipDiff.toFixed(3)} ${kneeHipDiff > 0.05 ? '❌ TOO LARGE' : '✅ OK'}`);
  console.log(`  Ankle-Hip rotation diff:    ${ankleHipDiff.toFixed(3)} ${ankleHipDiff > 0.05 ? '❌ TOO LARGE' : '✅ OK'}`);
  
  // Calculate body proportions
  const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
  const hipWidth = Math.abs(rightHip.x - leftHip.x);
  const torsoLength = Math.abs(leftShoulder.y - leftHip.y);
  const thighLength = Math.abs(leftHip.y - leftKnee.y);
  const shinLength = Math.abs(leftKnee.y - leftAnkle.y);
  
  console.log('\n📏 BODY PROPORTIONS:');
  console.log(`  Shoulder width: ${shoulderWidth.toFixed(3)}`);
  console.log(`  Hip width:      ${hipWidth.toFixed(3)}`);
  console.log(`  Torso length:   ${torsoLength.toFixed(3)}`);
  console.log(`  Thigh length:   ${thighLength.toFixed(3)}`);
  console.log(`  Shin length:    ${shinLength.toFixed(3)}`);
  
  // Store for comparison
  if (idx === 0) {
    global.baseProportions = {
      shoulderWidth,
      hipWidth,
      torsoLength,
      thighLength,
      shinLength
    };
  } else {
    const swDiff = Math.abs(shoulderWidth - global.baseProportions.shoulderWidth);
    const hwDiff = Math.abs(hipWidth - global.baseProportions.hipWidth);
    const tlDiff = Math.abs(torsoLength - global.baseProportions.torsoLength);
    
    console.log('\n🔍 PROPORTION CONSISTENCY (vs Neutral):');
    console.log(`  Shoulder width change: ${swDiff.toFixed(3)} ${swDiff > 0.02 ? '❌ INCONSISTENT' : '✅ OK'}`);
    console.log(`  Hip width change:      ${hwDiff.toFixed(3)} ${hwDiff > 0.02 ? '❌ INCONSISTENT' : '✅ OK'}`);
    console.log(`  Torso length change:   ${tlDiff.toFixed(3)} ${tlDiff > 0.02 ? '❌ INCONSISTENT' : '✅ OK'}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('AUDIT COMPLETE');
console.log('='.repeat(80));

