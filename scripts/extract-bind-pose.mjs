/**
 * Extract the bind/rest pose rotation for leg bones from the GLB.
 * The "bind pose" is the node's rotation property in the glTF JSON.
 * This is what the bone is at when no animation is applied.
 */
import { readFileSync } from 'fs';

const glbPath = '/tmp/fotball2.glb';
const buffer = readFileSync(glbPath);
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const dataView = new DataView(arrayBuffer);
const chunk0Length = dataView.getUint32(12, true);
const jsonBytes = new Uint8Array(arrayBuffer, 20, chunk0Length);
const jsonStr = new TextDecoder().decode(jsonBytes);
const gltf = JSON.parse(jsonStr);

const targetBones = [
  'mixamorig:Hips',
  'mixamorig:RightUpLeg', 'mixamorig:RightLeg', 'mixamorig:RightFoot', 'mixamorig:RightToeBase',
  'mixamorig:LeftUpLeg', 'mixamorig:LeftLeg', 'mixamorig:LeftFoot', 'mixamorig:LeftToeBase',
  'mixamorig:Spine', 'mixamorig:Spine1', 'mixamorig:Spine2',
  'mixamorig:RightArm', 'mixamorig:LeftArm',
  'mixamorig:RightForeArm', 'mixamorig:LeftForeArm',
  'mixamorig:Neck',
];

console.log('=== BIND POSE (node.rotation) FOR LEG BONES ===\n');
console.log('These are the rest rotations stored in the glTF node definitions.\n');

for (const boneName of targetBones) {
  const node = gltf.nodes.find(n => n.name === boneName);
  if (!node) {
    console.log(`${boneName}: NOT FOUND`);
    continue;
  }
  
  const rot = node.rotation || [0, 0, 0, 1]; // Default identity quaternion
  const [qx, qy, qz, qw] = rot;
  
  // Convert to Euler
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
  
  const xDeg = (xRad * 180 / Math.PI).toFixed(2);
  const yDeg = (yRad * 180 / Math.PI).toFixed(2);
  const zDeg = (zRad * 180 / Math.PI).toFixed(2);
  
  console.log(`${boneName}:`);
  console.log(`  Bind quat: [${qx.toFixed(6)}, ${qy.toFixed(6)}, ${qz.toFixed(6)}, ${qw.toFixed(6)}]`);
  console.log(`  Bind euler: (${xDeg}°, ${yDeg}°, ${zDeg}°)`);
  console.log('');
}

// Now let's look at what the FIRST FRAME of the throw animation has for these bones
// This is the actual starting pose of the animation
console.log('\n=== FIRST FRAME OF THROW ANIMATION ===\n');

const mainAnim = gltf.animations.find(a => a.name === 'Action');

// Binary chunk
const binChunkOffset = 20 + chunk0Length;
const binChunkLength = dataView.getUint32(binChunkOffset, true);

function readAccessor(accessorIndex) {
  const accessor = gltf.accessors[accessorIndex];
  const bufferView = gltf.bufferViews[accessor.bufferView];
  const offset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
  
  let numComponents;
  switch (accessor.type) {
    case 'SCALAR': numComponents = 1; break;
    case 'VEC3': numComponents = 3; break;
    case 'VEC4': numComponents = 4; break;
    default: numComponents = 1;
  }
  
  const count = accessor.count;
  const values = [];
  
  for (let i = 0; i < count * numComponents; i++) {
    const byteOffset = offset + i * 4;
    values.push(dataView.getFloat32(binChunkOffset + 8 + byteOffset, true));
  }
  
  return { values, count, numComponents };
}

for (const boneName of targetBones) {
  const nodeIndex = gltf.nodes.findIndex(n => n.name === boneName);
  if (nodeIndex === -1) continue;
  
  const rotChannel = mainAnim.channels.find(ch => 
    ch.target.node === nodeIndex && ch.target.path === 'rotation'
  );
  
  if (!rotChannel) continue;
  
  const sampler = mainAnim.samplers[rotChannel.sampler];
  const rotData = readAccessor(sampler.output);
  
  // First frame
  const qx = rotData.values[0];
  const qy = rotData.values[1];
  const qz = rotData.values[2];
  const qw = rotData.values[3];
  
  const sinr_cosp = 2 * (qw * qx + qy * qz);
  const cosr_cosp = 1 - 2 * (qx * qx + qy * qy);
  const xDeg = (Math.atan2(sinr_cosp, cosr_cosp) * 180 / Math.PI).toFixed(2);
  
  const sinp = 2 * (qw * qy - qz * qx);
  const yDeg = ((Math.abs(sinp) >= 1 ? Math.sign(sinp) * Math.PI / 2 : Math.asin(sinp)) * 180 / Math.PI).toFixed(2);
  
  const siny_cosp = 2 * (qw * qz + qx * qy);
  const cosy_cosp = 1 - 2 * (qy * qy + qz * qz);
  const zDeg = (Math.atan2(siny_cosp, cosy_cosp) * 180 / Math.PI).toFixed(2);
  
  console.log(`${boneName}: frame0 euler(${xDeg}°, ${yDeg}°, ${zDeg}°) quat(${qx.toFixed(6)}, ${qy.toFixed(6)}, ${qz.toFixed(6)}, ${qw.toFixed(6)})`);
}
