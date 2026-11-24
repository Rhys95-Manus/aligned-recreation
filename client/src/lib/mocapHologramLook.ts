import * as THREE from 'three';

const disposedMaterials = new WeakSet<THREE.Material>();
const disposedTextures = new WeakSet<THREE.Texture>();

function materialTextures(material: THREE.Material): Set<THREE.Texture> {
  const textures = new Set<THREE.Texture>();
  const visited = new Set<object>();
  const collect = (value: unknown): void => {
    if (!value || typeof value !== 'object' || visited.has(value)) return;
    visited.add(value);
    if ((value as THREE.Texture).isTexture) {
      textures.add(value as THREE.Texture);
    } else if (Array.isArray(value)) {
      value.forEach(collect);
    } else if (Object.getPrototypeOf(value) === Object.prototype) {
      Object.values(value).forEach(collect);
    }
  };
  // Includes every texture slot, plus textures nested in ShaderMaterial uniforms.
  Object.values(material).forEach(collect);
  return textures;
}

function meshMaterials(mesh: THREE.Mesh): THREE.Material[] {
  return Array.isArray(mesh.material) ? mesh.material : [mesh.material];
}

/** Apply only the production hologram appearance, never the production rig logic. */
export function applyMocapHologramLook(model: THREE.Object3D): void {
  let hierarchyRoot = model;
  while (hierarchyRoot.parent) hierarchyRoot = hierarchyRoot.parent;

  const names = new Set<string>();
  hierarchyRoot.traverse(object => names.add(object.name));

  // Never add siblings during traversal, or process one of our own overlays.
  const sources: { mesh: THREE.Mesh; parent: THREE.Object3D }[] = [];
  model.traverse(object => {
    if (!(object as THREE.Mesh).isMesh || object.userData.mocapWireframeOverlay) return;
    const mesh = object as THREE.Mesh;
    const parent = mesh.parent;
    // A detached root Mesh cannot have a sibling without changing its hierarchy.
    if (!parent) return;
    const alreadyApplied = parent.children.some(sibling =>
      sibling.userData.mocapWireframeOverlay === true &&
      sibling.userData.mocapWireframeSourceUuid === mesh.uuid,
    );
    if (!alreadyApplied) sources.push({ mesh, parent });
  });
  if (sources.length === 0) return;

  const innerMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a006e,
    emissive: 0x220044,
    emissiveIntensity: 0.8,
    metalness: 0.6,
    roughness: 0.4,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });
  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
    depthTest: true,
    depthWrite: false,
  });
  const replacedMaterials = new Set<THREE.Material>();

  for (const { mesh, parent } of sources) {
    meshMaterials(mesh).forEach(material => replacedMaterials.add(material));
    let overlay: THREE.Mesh;
    if ((mesh as THREE.SkinnedMesh).isSkinnedMesh) {
      const source = mesh as THREE.SkinnedMesh;
      const skinnedOverlay = new THREE.SkinnedMesh(source.geometry, wireframeMaterial);
      // Do not bind()/pose()/clone(): preserve even a nonidentity/detached bind exactly.
      skinnedOverlay.skeleton = source.skeleton;
      skinnedOverlay.bindMode = source.bindMode;
      skinnedOverlay.bindMatrix.copy(source.bindMatrix);
      skinnedOverlay.bindMatrixInverse.copy(source.bindMatrixInverse);
      overlay = skinnedOverlay;
    } else {
      // Construct a mesh rather than clone(), which could duplicate children/bones.
      overlay = new THREE.Mesh(mesh.geometry, wireframeMaterial);
    }
    overlay.position.copy(mesh.position);
    overlay.quaternion.copy(mesh.quaternion);
    overlay.scale.copy(mesh.scale);
    overlay.matrix.copy(mesh.matrix);
    overlay.matrixWorld.copy(mesh.matrixWorld);
    overlay.matrixAutoUpdate = mesh.matrixAutoUpdate;
    overlay.matrixWorldAutoUpdate = mesh.matrixWorldAutoUpdate;
    overlay.matrixWorldNeedsUpdate = mesh.matrixWorldNeedsUpdate;
    overlay.layers.mask = mesh.layers.mask;
    overlay.visible = mesh.visible;
    overlay.morphTargetInfluences = mesh.morphTargetInfluences;
    overlay.morphTargetDictionary = mesh.morphTargetDictionary;
    overlay.renderOrder = mesh.renderOrder + 1;
    overlay.frustumCulled = false;
    overlay.userData.mocapWireframeOverlay = true;
    overlay.userData.mocapWireframeSourceUuid = mesh.uuid;
    const baseName = `mocap_wireframe_overlay_${mesh.uuid}`;
    let name = baseName;
    let suffix = 1;
    while (names.has(name)) name = `${baseName}_${suffix++}`;
    overlay.name = name;
    names.add(name);
    parent.add(overlay);

    mesh.material = innerMaterial;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
  }

  // Preserve assets still used by another mesh in this hierarchy. Arrays and
  // shared maps are deduplicated; originals are not mutated or nulled out.
  const retainedMaterials = new Set<THREE.Material>();
  const retainedTextures = new Set<THREE.Texture>();
  hierarchyRoot.traverse(object => {
    if (!(object as THREE.Mesh).isMesh) return;
    meshMaterials(object as THREE.Mesh).forEach(material => {
      retainedMaterials.add(material);
      materialTextures(material).forEach(texture => retainedTextures.add(texture));
    });
  });
  const replacedTextures = new Set<THREE.Texture>();
  replacedMaterials.forEach(material => {
    materialTextures(material).forEach(texture => replacedTextures.add(texture));
    if (!retainedMaterials.has(material) && !disposedMaterials.has(material)) {
      disposedMaterials.add(material);
      material.dispose();
    }
  });
  replacedTextures.forEach(texture => {
    if (!retainedTextures.has(texture) && !disposedTextures.has(texture)) {
      disposedTextures.add(texture);
      texture.dispose();
    }
  });
}

/** Configure the isolated preview scene with the production hologram light recipe. */
export function configureMocapHologramScene(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
): void {
  scene.background = new THREE.Color(0x0a0e27);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // Reconfiguration must not stack identical lights or remove caller-owned ones.
  if (scene.children.some(child => child.userData.mocapHologramSceneLight)) return;
  const ambient = new THREE.AmbientLight(0x110022, 0.4);
  const main = new THREE.DirectionalLight(0x4488ff, 1.5);
  main.position.set(0, 5, 5);
  const cyan = new THREE.SpotLight(0x00ffff, 5);
  cyan.position.set(-5, 2, -5);
  cyan.lookAt(0, 0, 0);
  const magenta = new THREE.SpotLight(0xff00ff, 6);
  magenta.position.set(5, 2, -5);
  magenta.lookAt(0, 0, 0);
  // SpotLight's default target is already the origin; do not attach new targets.
  for (const light of [ambient, main, cyan, magenta]) {
    light.userData.mocapHologramSceneLight = true;
    scene.add(light);
  }
}
