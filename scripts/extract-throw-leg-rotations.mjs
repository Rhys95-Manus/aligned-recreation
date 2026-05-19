/**
 * Extract actual rotation keyframe values from the throw animation for leg bones.
 * This tells us the sign convention used by the throw animation.
 */
import { readFileSync } from 'fs';

const glbPath = '/tmp/fotball2.glb';
const buffer = readFileSync(glbPath);
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const dataView = new DataView(arrayBuffer);

// GLB header
const chunk0Length = dataView.getUint32(12, true);
const jsonBytes = new Uint8Array(arrayBuffer, 20, chunk0Length);
const jsonStr = new TextDecoder().decode(jsonBytes);
const gltf = JSON.parse(jsonStr);

// Binary chunk starts after JSON chunk
const binChunkOffset = 20 + chunk0Length;
const binChunkLength = dataView.getUint32(binChunkOffset, true);
const binChunkData = new Uint8Array(arrayBuffer, binChunkOffset + 8, binChunkLength);

// Helper to read accessor data
function readAccessor(accessorIndex) {
  const accessor = gltf.accessors[accessorIndex];
  const bufferView = gltf.bufferViews[accessor.bufferView];
  const offset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
  
  let componentSize;
  switch (accessor.componentType) {
    case 5126: componentSize = 4; break; // FLOAT
    case 5123: componentSize = 2; break; // UNSIGNED_SHORT
    default: componentSize = 4;
  }
  
  let numComponents;
  switch (accessor.type) {
    case 'SCALAR': numComponents = 1; break;
    case 'VEC2': numComponents = 2; break;
    case 'VEC3': numComponents = 3; break;
    case 'VEC4': numComponents = 4; break;
    default: numComponents = 1;
  }
  
  const count = accessor.count;
  const values = [];
  
  for (let i = 0; i < count * numComponents; i++) {
    const byteOffset = offset + i * componentSize;
    if (accessor.componentType === 5126) {
      values.push(dataView.getFloat32(binChunkOffset + 8 + byteOffset, true));
    }
  }
  
  return { values, count, numComponents };
}

// Find the main "Action" animation
const mainAnim = gltf.animations.find(a => a.name === 'Action');
if (!mainAnim) {
  console.error('No "Action" animation found!');
  process.exit(1);
}

// Extract rotation data for leg bones
const legBones = [
  'mixamorig:Hips',
  'mixamorig:RightUpLeg', 'mixamorig:RightLeg', 'mixamorig:RightFoot', 'mixamorig:RightToeBase',
  'mixamorig:LeftUpLeg', 'mixamorig:LeftLeg', 'mixamorig:LeftFoot', 'mixamorig:LeftToeBase',
];

console.log('=== THROW ANIMATION - LEG BONE ROTATIONS ===\n');
console.log('Format: quaternion [x, y, z, w] at each keyframe\n');

for (const boneName of legBones) {
  // Find the node index for this bone
  const nodeIndex = gltf.nodes.findIndex(n => n.name === boneName);
  if (nodeIndex === -1) continue;
  
  // Find the rotation channel for this bone
  const rotChannel = mainAnim.channels.find(ch => 
    ch.target.node === nodeIndex && ch.target.path === 'rotation'
  );
  
  if (!rotChannel) {
    console.log(`${boneName}: NO ROTATION CHANNEL`);
    continue;
  }
  
  const sampler = mainAnim.samplers[rotChannel.sampler];
  const timeData = readAccessor(sampler.input);
  const rotData = readAccessor(sampler.output);
  
  console.log(`${boneName}:`);
  console.log(`  Keyframes: ${timeData.count}`);
  console.log(`  Time range: ${timeData.values[0].toFixed(3)}s - ${timeData.values[timeData.count - 1].toFixed(3)}s`);
  
  // Show first, middle, and last keyframe rotations (as quaternions)
  const showFrames = [0, Math.floor(timeData.count / 4), Math.floor(timeData.count / 2), Math.floor(3 * timeData.count / 4), timeData.count - 1];
  
  for (const fi of showFrames) {
    const t = timeData.values[fi];
    const qx = rotData.values[fi * 4];
    const qy = rotData.values[fi * 4 + 1];
    const qz = rotData.values[fi * 4 + 2];
    const qw = rotData.values[fi * 4 + 3];
    
    // Convert quaternion to Euler (approximate, XYZ order)
    // Using standard quaternion to euler conversion
    const sinr_cosp = 2 * (qw * qx + qy * qz);
    const cosr_cosp = 1 - 2 * (qx * qx + qy * qy);
    const xRad = Math.atan2(sinr_cosp, cosr_cosp);
    
    const sinp = 2 * (qw * qy - qz * qx);
    let yRad;
    if (Math.abs(sinp) >= 1) {
      yRad = Math.sign(sinp) * Math.PI / 2;
    } else {
      yRad = Math.asin(sinp);
    }
    
    const siny_cosp = 2 * (qw * qz + qx * qy);
    const cosy_cosp = 1 - 2 * (qy * qy + qz * qz);
    const zRad = Math.atan2(siny_cosp, cosy_cosp);
    
    const xDeg = (xRad * 180 / Math.PI).toFixed(1);
    const yDeg = (yRad * 180 / Math.PI).toFixed(1);
    const zDeg = (zRad * 180 / Math.PI).toFixed(1);
    
    console.log(`  t=${t.toFixed(3)}s: euler(${xDeg}°, ${yDeg}°, ${zDeg}°) quat(${qx.toFixed(4)}, ${qy.toFixed(4)}, ${qz.toFixed(4)}, ${qw.toFixed(4)})`);
  }
  console.log('');
}

// Also check if control bones have significant rotation
console.log('\n=== CONTROL/IK BONE ROTATIONS (leg-related) ===\n');

const controlBones = [
  'Ctrl_UpLeg_FK_Right', 'Ctrl_Leg_FK_Right', 'Ctrl_Foot_FK_Right',
  'Ctrl_UpLeg_FK_Left', 'Ctrl_Leg_FK_Left', 'Ctrl_Foot_FK_Left',
  'UpLeg_IK_Right', 'Leg_IK_Right',
  'UpLeg_IK_Left', 'Leg_IK_Left',
  'Ctrl_Foot_IK_Right', 'Ctrl_Foot_IK_Left',
  'Ctrl_LegPole_IK_Right', 'Ctrl_LegPole_IK_Left',
];

for (const boneName of controlBones) {
  const nodeIndex = gltf.nodes.findIndex(n => n.name === boneName);
  if (nodeIndex === -1) continue;
  
  const rotChannel = mainAnim.channels.find(ch => 
    ch.target.node === nodeIndex && ch.target.path === 'rotation'
  );
  
  if (!rotChannel) {
    console.log(`${boneName}: NO ROTATION CHANNEL`);
    continue;
  }
  
  const sampler = mainAnim.samplers[rotChannel.sampler];
  const rotData = readAccessor(sampler.output);
  
  // Find max rotation range
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  for (let i = 0; i < rotData.count; i++) {
    const qx = rotData.values[i * 4];
    const qy = rotData.values[i * 4 + 1];
    const qz = rotData.values[i * 4 + 2];
    const qw = rotData.values[i * 4 + 3];
    
    const sinr_cosp = 2 * (qw * qx + qy * qz);
    const cosr_cosp = 1 - 2 * (qx * qx + qy * qy);
    const xDeg = Math.atan2(sinr_cosp, cosr_cosp) * 180 / Math.PI;
    
    const sinp = 2 * (qw * qy - qz * qx);
    const yDeg = (Math.abs(sinp) >= 1 ? Math.sign(sinp) * 90 : Math.asin(sinp) * 180 / Math.PI);
    
    const siny_cosp = 2 * (qw * qz + qx * qy);
    const cosy_cosp = 1 - 2 * (qy * qy + qz * qz);
    const zDeg = Math.atan2(siny_cosp, cosy_cosp) * 180 / Math.PI;
    
    minX = Math.min(minX, xDeg); maxX = Math.max(maxX, xDeg);
    minY = Math.min(minY, yDeg); maxY = Math.max(maxY, yDeg);
    minZ = Math.min(minZ, zDeg); maxZ = Math.max(maxZ, zDeg);
  }
  
  const rangeX = maxX - minX;
  const rangeY = maxY - minY;
  const rangeZ = maxZ - minZ;
  const totalRange = rangeX + rangeY + rangeZ;
  
  console.log(`${boneName}: X range ${rangeX.toFixed(1)}° (${minX.toFixed(1)} to ${maxX.toFixed(1)}), Y range ${rangeY.toFixed(1)}°, Z range ${rangeZ.toFixed(1)}° | TOTAL: ${totalRange.toFixed(1)}°`);
}
