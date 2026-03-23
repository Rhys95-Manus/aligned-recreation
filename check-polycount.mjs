import fs from 'fs';

function parseGLB(filepath) {
  const buf = fs.readFileSync(filepath);
  // GLB header: magic(4) + version(4) + length(4)
  // Chunk 0: length(4) + type(4) + JSON data
  const jsonLen = buf.readUInt32LE(12);
  const jsonStr = buf.slice(20, 20 + jsonLen).toString('utf-8');
  const gltf = JSON.parse(jsonStr);
  
  let totalVertices = 0;
  let totalTriangles = 0;
  
  if (gltf.meshes) {
    for (const mesh of gltf.meshes) {
      for (const prim of mesh.primitives) {
        // Get vertex count from POSITION accessor
        if (prim.attributes && prim.attributes.POSITION !== undefined) {
          const accessor = gltf.accessors[prim.attributes.POSITION];
          totalVertices += accessor.count;
        }
        // Get triangle count from indices accessor
        if (prim.indices !== undefined) {
          const accessor = gltf.accessors[prim.indices];
          totalTriangles += Math.floor(accessor.count / 3);
        }
      }
    }
  }
  
  return { totalVertices, totalTriangles, meshCount: gltf.meshes?.length || 0 };
}

// Check both models
const footballPath = '/home/ubuntu/aligned-recreation/client/public/Hologram1.0.glb';
const basketballPath = '/home/ubuntu/upload/MaleHologram.glb';

console.log('=== Football Model ===');
const fb = parseGLB(footballPath);
console.log(`Meshes: ${fb.meshCount}, Vertices: ${fb.totalVertices}, Triangles: ${fb.totalTriangles}`);

console.log('\n=== Basketball Model ===');
const bb = parseGLB(basketballPath);
console.log(`Meshes: ${bb.meshCount}, Vertices: ${bb.totalVertices}, Triangles: ${bb.totalTriangles}`);

console.log(`\nRatio: Basketball has ${(bb.totalVertices / fb.totalVertices).toFixed(1)}x more vertices and ${(bb.totalTriangles / fb.totalTriangles).toFixed(1)}x more triangles`);
