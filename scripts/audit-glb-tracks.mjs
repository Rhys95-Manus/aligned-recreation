/**
 * Audit the fotball2.glb animation tracks to identify which bone set
 * drives the legs in the throw animation.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// We need to set up a minimal DOM environment for Three.js
global.self = global;
global.window = global;
global.document = { createElementNS: () => ({ style: {} }) };

// Find the GLB file
const glbPath = '/tmp/fotball2.glb';

// Read the file
const buffer = readFileSync(glbPath);
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

// Parse GLTF manually to extract animation data
// Since GLTFLoader needs a browser environment, let's parse the binary GLB directly
const dataView = new DataView(arrayBuffer);

// GLB header: magic (4) + version (4) + length (4)
const magic = dataView.getUint32(0, true);
const version = dataView.getUint32(4, true);
const totalLength = dataView.getUint32(8, true);

console.log(`GLB Magic: 0x${magic.toString(16)}, Version: ${version}, Total Length: ${totalLength}`);

// First chunk: JSON
const chunk0Length = dataView.getUint32(12, true);
const chunk0Type = dataView.getUint32(16, true);
console.log(`JSON chunk length: ${chunk0Length}`);

const jsonBytes = new Uint8Array(arrayBuffer, 20, chunk0Length);
const jsonStr = new TextDecoder().decode(jsonBytes);
const gltf = JSON.parse(jsonStr);

// Extract node names for reference
const nodeNames = gltf.nodes.map((n, i) => ({ index: i, name: n.name }));

// Extract animations
console.log(`\n=== ANIMATIONS (${gltf.animations.length}) ===`);

for (const anim of gltf.animations) {
  console.log(`\nAnimation: "${anim.name}"`);
  console.log(`Channels: ${anim.channels.length}`);
  
  // Group channels by target node
  const legBoneKeywords = ['Leg', 'leg', 'Foot', 'foot', 'Toe', 'toe', 'Hip', 'hip', 'UpLeg'];
  const legChannels = [];
  const otherChannels = [];
  
  for (const channel of anim.channels) {
    const nodeIndex = channel.target.node;
    const nodeName = gltf.nodes[nodeIndex]?.name || `Node_${nodeIndex}`;
    const path = channel.target.path;
    
    const isLeg = legBoneKeywords.some(kw => nodeName.includes(kw));
    
    if (isLeg) {
      legChannels.push({ nodeName, path, nodeIndex });
    } else {
      otherChannels.push({ nodeName, path, nodeIndex });
    }
  }
  
  console.log(`\n--- LEG-RELATED CHANNELS (${legChannels.length}) ---`);
  // Sort by node name for clarity
  legChannels.sort((a, b) => a.nodeName.localeCompare(b.nodeName));
  for (const ch of legChannels) {
    console.log(`  ${ch.nodeName} [${ch.path}]`);
  }
  
  console.log(`\n--- OTHER CHANNELS (${otherChannels.length}) ---`);
  otherChannels.sort((a, b) => a.nodeName.localeCompare(b.nodeName));
  for (const ch of otherChannels) {
    console.log(`  ${ch.nodeName} [${ch.path}]`);
  }
}

// Also list all leg-related bones in the node list
console.log(`\n=== ALL LEG-RELATED NODES ===`);
const legNodes = nodeNames.filter(n => {
  const legBoneKeywords = ['Leg', 'leg', 'Foot', 'foot', 'Toe', 'toe', 'Hip', 'hip', 'UpLeg'];
  return legBoneKeywords.some(kw => n.name?.includes(kw));
});
for (const n of legNodes) {
  console.log(`  [${n.index}] ${n.name}`);
}
