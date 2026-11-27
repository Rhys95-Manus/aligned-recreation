import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/** Live-tunable values. Ring shape is unit geometry; radius/width use world units. */
export const HOLOGRAM_V2_CONFIG = {
  rimColor: 0x00ffff,
  rimStrength: 1.65,
  rimPower: 2.4,
  bodyIntensity: 0.16,
  facingOpacity: 0.12,
  opacity: 0.85,
  bloomStrength: 0.45,
  bloomRadius: 0.35,
  bloomThreshold: 0.45,
  scanLineSpeed: 0.12,
  scanLineFrequency: 24,
  scanLineStrength: 0.10,
  flickerEnabled: false,
  flickerStrength: 0.025,
  flickerSpeed: 7.5,
  projectorRadius: 0.48,
  projectorWidth: 0.008,
  projectorOpacity: 0.18,
  projectorIntensity: 3.5,
  projectorFloorOffset: 0.003,
  maxDeltaSeconds: 0.1,
};

export interface MocapHologramV2 {
  setEnabled(enabled: boolean): void;
  setFlicker(enabled: boolean): void;
  /** CSS-pixel dimensions; matches the renderer's current pixel ratio. */
  setSize(width: number, height: number): void;
  render(deltaSeconds: number): void;
  dispose(): void;
}

const BLOOM_LAYER = 1;
const OVERLAY_LAYER = 2;
const normalChunks = `#include <beginnormal_vertex>
#include <morphnormal_vertex>
#include <skinbase_vertex>
#include <skinnormal_vertex>
#include <defaultnormal_vertex>`;

function createBodyMaterial() {
  const uniforms = {
    uHologramTime: { value: 0 },
    uHologramColor: { value: new THREE.Color(HOLOGRAM_V2_CONFIG.rimColor) },
    uHologramRimStrength: { value: HOLOGRAM_V2_CONFIG.rimStrength },
    uHologramRimPower: { value: HOLOGRAM_V2_CONFIG.rimPower },
    uHologramBodyIntensity: { value: HOLOGRAM_V2_CONFIG.bodyIntensity },
    uHologramFacingOpacity: { value: HOLOGRAM_V2_CONFIG.facingOpacity },
    uHologramScanSpeed: { value: HOLOGRAM_V2_CONFIG.scanLineSpeed },
    uHologramScanFrequency: { value: HOLOGRAM_V2_CONFIG.scanLineFrequency },
    uHologramScanStrength: { value: HOLOGRAM_V2_CONFIG.scanLineStrength },
    uHologramFlickerEnabled: { value: 0 },
    uHologramFlickerStrength: { value: HOLOGRAM_V2_CONFIG.flickerStrength },
    uHologramFlickerSpeed: { value: HOLOGRAM_V2_CONFIG.flickerSpeed },
  };
  const material = new THREE.MeshBasicMaterial({
    name: 'mocap_hologram_v2_body',
    color: HOLOGRAM_V2_CONFIG.rimColor,
    transparent: true,
    opacity: HOLOGRAM_V2_CONFIG.opacity,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
  });
  material.customProgramCacheKey = () => 'mocap-hologram-v2-three-r182-1';
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    // r182 MeshBasic only runs normals for envmaps OR skinned meshes. Make the
    // existing chain unconditional, including morph and skin normals. Never
    // duplicate skinbase_vertex: skinning_vertex reuses those bone matrices.
    shader.vertexShader = shader.vertexShader.replace(
      /#if defined \( USE_ENVMAP \) \|\| defined \( USE_SKINNING \)\s*#include <beginnormal_vertex>\s*#include <morphnormal_vertex>\s*#include <skinbase_vertex>\s*#include <skinnormal_vertex>\s*#include <defaultnormal_vertex>\s*#endif/,
      normalChunks,
    );
    shader.vertexShader = `varying vec3 vHologramWorldPosition;
varying vec3 vHologramViewNormal;
varying vec3 vHologramViewPosition;
${shader.vertexShader}`.replace('#include <project_vertex>', `#include <project_vertex>
// transformed has already passed through morph and skinning_vertex.
vec4 hologramWorldPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
  hologramWorldPosition = batchingMatrix * hologramWorldPosition;
#endif
#ifdef USE_INSTANCING
  hologramWorldPosition = instanceMatrix * hologramWorldPosition;
#endif
vHologramWorldPosition = ( modelMatrix * hologramWorldPosition ).xyz;
// defaultnormal_vertex applies normalMatrix AFTER skinnormal_vertex.
vHologramViewNormal = transformedNormal;
vHologramViewPosition = -mvPosition.xyz;`);
    shader.fragmentShader = `uniform float uHologramTime;
uniform vec3 uHologramColor;
uniform float uHologramRimStrength;
uniform float uHologramRimPower;
uniform float uHologramBodyIntensity;
uniform float uHologramFacingOpacity;
uniform float uHologramScanSpeed;
uniform float uHologramScanFrequency;
uniform float uHologramScanStrength;
uniform float uHologramFlickerEnabled;
uniform float uHologramFlickerStrength;
uniform float uHologramFlickerSpeed;
varying vec3 vHologramWorldPosition;
varying vec3 vHologramViewNormal;
varying vec3 vHologramViewPosition;
${shader.fragmentShader}`.replace('#include <opaque_fragment>', `
vec3 hologramViewDirection = isOrthographic ? vec3( 0.0, 0.0, 1.0 ) : normalize( vHologramViewPosition );
float hologramFacing = clamp( dot( normalize( vHologramViewNormal ), hologramViewDirection ), 0.0, 1.0 );
float hologramRim = pow( 1.0 - hologramFacing, uHologramRimPower );
// y - time * speed makes these WORLD-space stripes travel upward.
float hologramScanWave = sin( ( vHologramWorldPosition.y - uHologramTime * uHologramScanSpeed ) * uHologramScanFrequency * 6.28318530718 );
float hologramScan = 1.0 + uHologramScanStrength * smoothstep( 0.85, 1.0, hologramScanWave );
// Bounded, deterministic and opt-in; no random noise or hard flashes.
float hologramFlickerWave = 0.5 + 0.5 * sin( uHologramTime * uHologramFlickerSpeed ) * sin( uHologramTime * uHologramFlickerSpeed * 0.37 + 1.2 );
float hologramFlicker = 1.0 - uHologramFlickerEnabled * uHologramFlickerStrength * hologramFlickerWave;
outgoingLight = uHologramColor * ( uHologramBodyIntensity + uHologramRimStrength * hologramRim ) * hologramScan * hologramFlicker;
diffuseColor.a *= mix( uHologramFacingOpacity, 1.0, hologramRim );
#include <opaque_fragment>`);
  };
  return { material, uniforms };
}

function isSkeletonOverlay(object: THREE.Object3D): boolean {
  return object.name === 'mocap_live_skeleton_overlay' || object.userData.mocapSkeletonOverlay === true;
}

function belongsToSkeletonOverlay(object: THREE.Object3D): boolean {
  for (let ancestor: THREE.Object3D | null = object; ancestor; ancestor = ancestor.parent) {
    if (isSkeletonOverlay(ancestor)) return true;
  }
  return false;
}

/**
 * Create AFTER applyMocapHologramLook(). Starts disabled (production mode).
 * Layer 1 is reserved for the body/projector bloom selection. Parent assigns
 * skeleton group descendants layers 0 + 2; layer 2 is overlay-exclusive.
 * No mesh cloning, binding, posing, clip edits, or caller-resource disposal.
 */
export function createMocapHologramV2(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  camera: THREE.Camera,
  model: THREE.Object3D,
  floorY: number,
): MocapHologramV2 {
  const bodies: THREE.Mesh[] = [];
  let pelvis: THREE.Bone | undefined;
  model.traverse(object => {
    if ((object as THREE.Bone).isBone && /(?:hips|pelvis)$/i.test(object.name.replace(/:/g, ''))) {
      pelvis ??= object as THREE.Bone;
    }
    if ((object as THREE.Mesh).isMesh && !object.userData.mocapWireframeOverlay && !belongsToSkeletonOverlay(object)) {
      bodies.push(object as THREE.Mesh);
    }
  });
  const bodyIds = new Set(bodies.map(mesh => mesh.uuid));
  const body = createBodyMaterial();
  // MeshBasic is self-lit (the emissive equivalent without physical lighting).
  const ringMaterial = new THREE.MeshBasicMaterial({
    name: 'mocap_hologram_v2_projector',
    color: HOLOGRAM_V2_CONFIG.rimColor,
    transparent: true,
    opacity: HOLOGRAM_V2_CONFIG.projectorOpacity,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 1, 96), ringMaterial);
  ring.name = 'mocap_hologram_v2_projector';
  ring.userData.mocapHologramV2Projector = true;
  ring.rotation.x = -Math.PI / 2;
  ring.layers.enable(BLOOM_LAYER);
  ring.visible = false;
  scene.add(ring);
  const position = new THREE.Vector3();

  // A separate bloom input guarantees that grids, skeletons, and unrelated bright
  // scene objects cannot bloom. The final beauty pass still keeps the scene recipe.
  const size = renderer.getSize(new THREE.Vector2());
  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  const bloomRenderPass = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(size, HOLOGRAM_V2_CONFIG.bloomStrength, HOLOGRAM_V2_CONFIG.bloomRadius, HOLOGRAM_V2_CONFIG.bloomThreshold);
  bloomComposer.addPass(bloomRenderPass);
  bloomComposer.addPass(bloomPass);
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  const combinePass = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, tBloom: { value: null } },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform sampler2D tDiffuse; uniform sampler2D tBloom; varying vec2 vUv; void main() { vec4 base = texture2D(tDiffuse, vUv); gl_FragColor = vec4(base.rgb + texture2D(tBloom, vUv).rgb, base.a); }',
  });
  const outputPass = new OutputPass();
  composer.addPass(renderPass);
  composer.addPass(combinePass);
  composer.addPass(outputPass);
  // ShaderPass clones its uniforms. Render-target textures MUST be assigned
  // afterward: UniformsUtils deliberately refuses to clone those textures.
  combinePass.uniforms.tBloom.value = bloomPass.renderTargetsHorizontal[0].texture;
  const black = new THREE.Color(0x000000);
  let enabled = false;
  let disposed = false;
  let flicker = HOLOGRAM_V2_CONFIG.flickerEnabled;
  const originals = new Map<THREE.Mesh, { material: THREE.Material | THREE.Material[]; layers: number }>();
  const wireVisibility = new Map<THREE.Object3D, boolean>();
  let ringRadius = -1;
  let ringInnerRadius = -1;

  function setEnabled(next: boolean) {
    if (disposed || enabled === next) return;
    if (next) {
      for (const mesh of bodies) {
        originals.set(mesh, { material: mesh.material, layers: mesh.layers.mask });
        mesh.material = Array.isArray(mesh.material) ? mesh.material.map(() => body.material) : body.material;
        mesh.layers.enable(0);
        mesh.layers.enable(BLOOM_LAYER);
        mesh.layers.disable(OVERLAY_LAYER);
      }
      scene.traverse(object => {
        if (object.userData.mocapWireframeOverlay === true && bodyIds.has(object.userData.mocapWireframeSourceUuid)) {
          wireVisibility.set(object, object.visible);
          object.visible = false;
        }
      });
    } else {
      originals.forEach((state, mesh) => { mesh.material = state.material; mesh.layers.mask = state.layers; });
      wireVisibility.forEach((visible, object) => { object.visible = visible; });
      originals.clear();
      wireVisibility.clear();
    }
    enabled = next;
    ring.visible = next;
  }

  function updateStyle(delta: number) {
    const c = HOLOGRAM_V2_CONFIG;
    const u = body.uniforms;
    u.uHologramTime.value += delta;
    u.uHologramColor.value.setHex(c.rimColor);
    u.uHologramRimStrength.value = c.rimStrength;
    u.uHologramRimPower.value = c.rimPower;
    u.uHologramBodyIntensity.value = c.bodyIntensity;
    u.uHologramFacingOpacity.value = c.facingOpacity;
    u.uHologramScanSpeed.value = c.scanLineSpeed;
    u.uHologramScanFrequency.value = c.scanLineFrequency;
    u.uHologramScanStrength.value = c.scanLineStrength;
    u.uHologramFlickerEnabled.value = flicker ? 1 : 0;
    u.uHologramFlickerStrength.value = c.flickerStrength;
    u.uHologramFlickerSpeed.value = c.flickerSpeed;
    body.material.color.setHex(c.rimColor);
    body.material.opacity = c.opacity;
    bloomPass.strength = c.bloomStrength;
    bloomPass.radius = c.bloomRadius;
    bloomPass.threshold = c.bloomThreshold;
    ringMaterial.color.setHex(c.rimColor).multiplyScalar(c.projectorIntensity);
    ringMaterial.opacity = c.projectorOpacity;
    // A unit RingGeometry with radii .5/1 becomes the configured thin annulus
    // through an owned position buffer. Never touch any model geometry.
    const radius = Math.max(0.001, c.projectorRadius);
    const innerRadius = Math.max(0, radius - Math.max(0, c.projectorWidth));
    if (radius !== ringRadius || innerRadius !== ringInnerRadius) {
      const attribute = ring.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < attribute.count; i++) {
        const angle = (i % 97) / 96 * Math.PI * 2;
        const r = i < 97 ? innerRadius : radius;
        attribute.setXYZ(i, Math.cos(angle) * r, Math.sin(angle) * r, 0);
      }
      attribute.needsUpdate = true;
      ring.geometry.computeBoundingSphere();
      ringRadius = radius;
      ringInnerRadius = innerRadius;
    }
    (pelvis ?? model).getWorldPosition(position);
    ring.position.set(position.x, floorY + c.projectorFloorOffset, position.z);
  }

  return {
    setEnabled,
    setFlicker(next) { if (!disposed) flicker = next; },
    setSize(width, height) {
      if (disposed) return;
      const w = Number.isFinite(width) ? Math.max(1, Math.round(width)) : 1;
      const h = Number.isFinite(height) ? Math.max(1, Math.round(height)) : 1;
      for (const pipeline of [bloomComposer, composer]) {
        pipeline.setPixelRatio(renderer.getPixelRatio());
        pipeline.setSize(w, h);
      }
    },
    render(deltaSeconds) {
      if (disposed) return;
      if (!enabled) { renderer.render(scene, camera); return; }
      const delta = Number.isFinite(deltaSeconds) ? THREE.MathUtils.clamp(deltaSeconds, 0, Math.max(0, HOLOGRAM_V2_CONFIG.maxDeltaSeconds)) : 0;
      updateStyle(delta);
      const overlays: { object: THREE.Object3D; visible: boolean }[] = [];
      scene.traverse(object => { if (isSkeletonOverlay(object)) overlays.push({ object, visible: object.visible }); });
      const old = {
        background: scene.background,
        overrideMaterial: scene.overrideMaterial,
        cameraLayers: camera.layers.mask,
        autoClear: renderer.autoClear,
        autoClearColor: renderer.autoClearColor,
        autoClearDepth: renderer.autoClearDepth,
        autoClearStencil: renderer.autoClearStencil,
        toneMapping: renderer.toneMapping,
        exposure: renderer.toneMappingExposure,
        outputColorSpace: renderer.outputColorSpace,
        clearColor: renderer.getClearColor(new THREE.Color()),
        clearAlpha: renderer.getClearAlpha(),
        target: renderer.getRenderTarget(),
        cubeFace: renderer.getActiveCubeFace(),
        mipLevel: renderer.getActiveMipmapLevel(),
        viewport: renderer.getViewport(new THREE.Vector4()),
        scissor: renderer.getScissor(new THREE.Vector4()),
        scissorTest: renderer.getScissorTest(),
      };
      try {
        overlays.forEach(({ object }) => { object.visible = false; });
        camera.layers.set(BLOOM_LAYER);
        scene.background = black;
        bloomComposer.render(delta);
        scene.background = old.background;
        camera.layers.mask = old.cameraLayers;
        composer.render(delta);
        overlays.forEach(({ object, visible }) => { object.visible = visible; });
        // OutputPass already wrote the beauty+bloom to the screen. Only reserved
        // overlay layer 2 is composited here, with no clear and no second bloom.
        scene.background = null;
        camera.layers.set(OVERLAY_LAYER);
        renderer.setRenderTarget(null);
        renderer.autoClear = false;
        renderer.render(scene, camera);
      } finally {
        overlays.forEach(({ object, visible }) => { object.visible = visible; });
        scene.background = old.background;
        scene.overrideMaterial = old.overrideMaterial;
        camera.layers.mask = old.cameraLayers;
        renderer.autoClear = old.autoClear;
        renderer.autoClearColor = old.autoClearColor;
        renderer.autoClearDepth = old.autoClearDepth;
        renderer.autoClearStencil = old.autoClearStencil;
        renderer.toneMapping = old.toneMapping;
        renderer.toneMappingExposure = old.exposure;
        renderer.outputColorSpace = old.outputColorSpace;
        renderer.setClearColor(old.clearColor, old.clearAlpha);
        renderer.setRenderTarget(old.target, old.cubeFace, old.mipLevel);
        renderer.setViewport(old.viewport);
        renderer.setScissor(old.scissor);
        renderer.setScissorTest(old.scissorTest);
      }
    },
    dispose() {
      if (disposed) return;
      setEnabled(false);
      disposed = true;
      scene.remove(ring);
      ring.geometry.dispose();
      ringMaterial.dispose();
      body.material.dispose();
      bloomRenderPass.dispose();
      bloomPass.dispose();
      // r182 UnrealBloomPass.dispose() omits its high-pass shader material.
      bloomPass.materialHighPassFilter.dispose();
      bloomComposer.dispose();
      renderPass.dispose();
      combinePass.dispose();
      outputPass.dispose();
      composer.dispose();
    },
  };
}
