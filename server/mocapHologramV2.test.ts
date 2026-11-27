import { afterEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { applyMocapHologramLook } from '../client/src/lib/mocapHologramLook';
import { createMocapHologramV2, HOLOGRAM_V2_CONFIG } from '../client/src/lib/mocapHologramV2';

const defaults = { ...HOLOGRAM_V2_CONFIG };
afterEach(() => { vi.restoreAllMocks(); Object.assign(HOLOGRAM_V2_CONFIG, defaults); });

function rendererFixture() {
  const clearColor = new THREE.Color(0x182030);
  let clearAlpha = 0.7;
  let target: THREE.WebGLRenderTarget | null = null;
  let face = 3;
  let mip = 2;
  const viewport = new THREE.Vector4(2, 3, 640, 480);
  const scissor = new THREE.Vector4(4, 5, 600, 400);
  let scissorTest = true;
  const frames: { mask: number; background: THREE.Scene['background']; visible: THREE.Object3D[]; autoClear: boolean; target: THREE.WebGLRenderTarget | null }[] = [];
  const renderer = {
    autoClear: true,
    autoClearColor: true,
    autoClearDepth: true,
    autoClearStencil: false,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.2,
    outputColorSpace: THREE.SRGBColorSpace,
    getPixelRatio: vi.fn(() => 2),
    getSize: (v: THREE.Vector2) => v.set(320, 240),
    getClearColor: (c: THREE.Color) => c.copy(clearColor),
    getClearAlpha: () => clearAlpha,
    setClearColor: (c: THREE.Color, a = clearAlpha) => { clearColor.copy(c); clearAlpha = a; },
    getRenderTarget: () => target,
    getActiveCubeFace: () => face,
    getActiveMipmapLevel: () => mip,
    setRenderTarget: vi.fn((t: THREE.WebGLRenderTarget | null, f = 0, m = 0) => { target = t; face = f; mip = m; }),
    getViewport: (v: THREE.Vector4) => v.copy(viewport),
    setViewport: (v: THREE.Vector4) => viewport.copy(v),
    getScissor: (v: THREE.Vector4) => v.copy(scissor),
    setScissor: (v: THREE.Vector4) => scissor.copy(v),
    getScissorTest: () => scissorTest,
    setScissorTest: (value: boolean) => { scissorTest = value; },
    render: vi.fn((scene: THREE.Scene, camera: THREE.Camera) => {
      const visible: THREE.Object3D[] = [];
      scene.traverseVisible(object => { if (object.layers.test(camera.layers)) visible.push(object); });
      frames.push({ mask: camera.layers.mask, background: scene.background, visible, autoClear: renderer.autoClear, target });
    }),
  };
  return { renderer: renderer as unknown as THREE.WebGLRenderer, state: renderer, frames };
}

/** Real Three CPU objects; only composer.render is mocked (there is no Node WebGL). */
function fixture({ array = false, visibleWire = true, attached = true } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e27);
  const camera = new THREE.PerspectiveCamera();
  const model = new THREE.Group();
  model.position.set(2, -0.5, -3);
  model.scale.set(0.02, 0.03, 0.04);
  const geometry = new THREE.BoxGeometry();
  const positions = geometry.getAttribute('position').count;
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(new Uint16Array(positions * 4), 4));
  const weights = new Float32Array(positions * 4);
  for (let i = 0; i < positions; i++) weights[i * 4] = 1;
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));
  const mesh: THREE.SkinnedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> = new THREE.SkinnedMesh(geometry, new THREE.MeshStandardMaterial());
  mesh.position.set(1, 2, 3);
  mesh.rotation.set(0.1, 0.2, 0.3);
  const hips = new THREE.Bone();
  hips.name = 'mixamorig:Hips';
  hips.position.set(3, 80, -2);
  mesh.add(hips);
  model.add(mesh);
  scene.add(model);
  model.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton([hips]), mesh.matrixWorld.clone());
  mesh.bindMode = attached ? 'attached' : 'detached';
  hips.rotation.set(0.2, -0.1, 0.5);
  const clip = new THREE.AnimationClip('source', 1, []);
  model.animations = [clip];
  applyMocapHologramLook(model);
  const wire = model.children.find(object => object.userData.mocapWireframeOverlay) as THREE.Mesh;
  wire.visible = visibleWire;
  const productionMaterial = array ? [mesh.material as THREE.Material, new THREE.MeshStandardMaterial()] : mesh.material;
  mesh.material = productionMaterial;
  const skeletonGroup = new THREE.Group();
  skeletonGroup.name = 'mocap_live_skeleton_overlay';
  const line = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x00ff00, depthTest: false }));
  skeletonGroup.add(line);
  skeletonGroup.traverse(object => object.layers.enable(2));
  scene.add(skeletonGroup);
  const grid = new THREE.GridHelper();
  scene.add(grid);
  const r = rendererFixture();
  const pipelines: EffectComposer[] = [];
  const addPass = EffectComposer.prototype.addPass;
  vi.spyOn(EffectComposer.prototype, 'addPass').mockImplementation(function (this: EffectComposer, pass) {
    if (!pipelines.includes(this)) pipelines.push(this);
    addPass.call(this, pass);
  });
  const renderComposer = vi.spyOn(EffectComposer.prototype, 'render').mockImplementation(function (this: EffectComposer) {
    const pass = this.passes[0] as RenderPass;
    this.renderer.render(pass.scene, pass.camera);
  });
  const v2 = createMocapHologramV2(scene, r.renderer, camera, model, -0.7);
  const ring = scene.children.find(object => object.userData.mocapHologramV2Projector) as THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  return { scene, camera, model, mesh, hips, clip, geometry, productionMaterial, wire, skeletonGroup, line, grid, ...r, pipelines, renderComposer, v2, ring };
}

function compileMaterial(material: THREE.MeshBasicMaterial) {
  const shader = {
    vertexShader: THREE.ShaderLib.basic.vertexShader,
    fragmentShader: THREE.ShaderLib.basic.fragmentShader,
    uniforms: THREE.UniformsUtils.clone(THREE.ShaderLib.basic.uniforms),
  };
  material.onBeforeCompile(shader as Parameters<THREE.Material['onBeforeCompile']>[0], {} as THREE.WebGLRenderer);
  return shader;
}

function rendererSnapshot(f: ReturnType<typeof fixture>) {
  const r = f.renderer;
  return {
    autoClear: r.autoClear,
    autoClearColor: r.autoClearColor,
    autoClearDepth: r.autoClearDepth,
    autoClearStencil: r.autoClearStencil,
    toneMapping: r.toneMapping,
    exposure: r.toneMappingExposure,
    colorSpace: r.outputColorSpace,
    clearColor: r.getClearColor(new THREE.Color()).toArray(),
    clearAlpha: r.getClearAlpha(),
    target: r.getRenderTarget(),
    face: r.getActiveCubeFace(),
    mip: r.getActiveMipmapLevel(),
    viewport: r.getViewport(new THREE.Vector4()).toArray(),
    scissor: r.getScissor(new THREE.Vector4()).toArray(),
    scissorTest: r.getScissorTest(),
    cameraLayers: f.camera.layers.mask,
    background: f.scene.background,
    overrideMaterial: f.scene.overrideMaterial,
  };
}

describe('HOLOGRAM_V2_CONFIG', () => {
  it('has the exact tame cyan defaults and is mutable', () => {
    expect(HOLOGRAM_V2_CONFIG).toEqual({
      rimColor: 0x00ffff, rimStrength: 1.65, rimPower: 2.4,
      bodyIntensity: 0.16, facingOpacity: 0.12, opacity: 0.85,
      bloomStrength: 0.45, bloomRadius: 0.35, bloomThreshold: 0.45,
      scanLineSpeed: 0.12, scanLineFrequency: 24, scanLineStrength: 0.10,
      flickerEnabled: false, flickerStrength: 0.025, flickerSpeed: 7.5,
      projectorRadius: 0.48, projectorWidth: 0.008, projectorOpacity: 0.18,
      projectorIntensity: 3.5, projectorFloorOffset: 0.003, maxDeltaSeconds: 0.1,
    });
    HOLOGRAM_V2_CONFIG.rimStrength = 2;
    expect(HOLOGRAM_V2_CONFIG.rimStrength).toBe(2);
    expect(Object.isFrozen(HOLOGRAM_V2_CONFIG)).toBe(false);
  });
});

describe('V2 built-in material and shader', () => {
  it('uses FrontSide transparent additive MeshBasic and preserves the actual r182 skin chain', () => {
    const f = fixture();
    f.v2.setEnabled(true);
    const material = f.mesh.material as THREE.MeshBasicMaterial;
    expect(material).toBeInstanceOf(THREE.MeshBasicMaterial);
    expect(material.side).toBe(THREE.FrontSide);
    expect(material.blending).toBe(THREE.AdditiveBlending);
    expect(material.transparent).toBe(true);
    expect(material.depthWrite).toBe(false);
    expect(material.depthTest).toBe(true);
    expect(material.wireframe).toBe(false);
    expect(material.map).toBeNull();
    const shader = compileMaterial(material);
    expect(shader.vertexShader).not.toContain('#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )');
    const chain = ['beginnormal_vertex', 'morphnormal_vertex', 'skinbase_vertex', 'skinnormal_vertex', 'defaultnormal_vertex', 'begin_vertex', 'morphtarget_vertex', 'skinning_vertex', 'project_vertex'];
    let previous = -1;
    for (const name of chain) {
      const marker = `#include <${name}>`;
      const index = shader.vertexShader.indexOf(marker);
      expect(index).toBeGreaterThan(previous);
      expect(shader.vertexShader.split(marker)).toHaveLength(2);
      previous = index;
    }
    expect(shader.vertexShader.indexOf('vHologramViewNormal = transformedNormal')).toBeGreaterThan(shader.vertexShader.indexOf('#include <skinnormal_vertex>'));
    expect(shader.vertexShader.indexOf('vec4 hologramWorldPosition = vec4( transformed, 1.0 )')).toBeGreaterThan(shader.vertexShader.indexOf('#include <skinning_vertex>'));
    expect(shader.vertexShader).toContain('vHologramWorldPosition = ( modelMatrix * hologramWorldPosition ).xyz');
    expect(shader.vertexShader).toContain('vHologramViewPosition = -mvPosition.xyz');
    // The real normal chunk transforms through skin bind matrices; position is
    // the same transformed vertex used by Three's built-in projection chunk.
    expect(THREE.ShaderChunk.skinnormal_vertex).toContain('bindMatrixInverse * skinMatrix * bindMatrix');
    expect(THREE.ShaderChunk.defaultnormal_vertex).toContain('normalMatrix * transformedNormal');
    expect(THREE.ShaderChunk.skinning_vertex).toContain('transformed = ( bindMatrixInverse * skinned ).xyz');
    expect(shader.fragmentShader).toContain('1.0 - hologramFacing');
    expect(shader.fragmentShader).toContain('diffuseColor.a *= mix( uHologramFacingOpacity, 1.0, hologramRim )');
    expect(shader.fragmentShader).toContain('vHologramWorldPosition.y - uHologramTime * uHologramScanSpeed');
    expect(shader.fragmentShader).toContain('isOrthographic ?');
    expect(shader.fragmentShader).not.toMatch(/\brand\s*\(|\brandom\s*\(/);
    expect(shader.uniforms.uHologramFlickerEnabled.value).toBe(0);
    f.v2.dispose();
  });

  it('has an unconditional normal chain for unskinned meshes too', () => {
    const f = fixture();
    f.v2.setEnabled(true);
    const shader = compileMaterial(f.mesh.material as THREE.MeshBasicMaterial);
    expect(shader.vertexShader).toContain('#include <beginnormal_vertex>\n#include <morphnormal_vertex>\n#include <skinbase_vertex>\n#include <skinnormal_vertex>\n#include <defaultnormal_vertex>');
    // Only Three's chunk internals guard skinning; basic normal generation itself
    // must remain outside the envmap/skin guard for ordinary Mesh bodies.
    const ordinary = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
    const scene = new THREE.Scene();
    scene.add(ordinary);
    const v2 = createMocapHologramV2(scene, f.renderer, f.camera, ordinary, 0);
    v2.setEnabled(true);
    expect(compileMaterial(ordinary.material).vertexShader).toBe(shader.vertexShader);
    v2.dispose();
    f.v2.dispose();
  });

  it('updates shared uniforms live, clamps delta, and makes deterministic flicker opt-in', () => {
    const f = fixture();
    f.v2.setEnabled(true);
    const shader = compileMaterial(f.mesh.material as THREE.MeshBasicMaterial);
    f.v2.render(10);
    expect(shader.uniforms.uHologramTime.value).toBeCloseTo(0.1);
    for (const delta of [-1, NaN, Infinity]) f.v2.render(delta);
    expect(shader.uniforms.uHologramTime.value).toBeCloseTo(0.1);
    expect(shader.uniforms.uHologramFlickerEnabled.value).toBe(0);
    f.v2.setFlicker(true);
    Object.assign(HOLOGRAM_V2_CONFIG, { rimColor: 0x33ffff, rimStrength: 1.1, bloomStrength: 0.3, scanLineSpeed: 0.2 });
    f.v2.render(0.025);
    expect(shader.uniforms.uHologramTime.value).toBeCloseTo(0.125);
    expect(shader.uniforms.uHologramFlickerEnabled.value).toBe(1);
    expect(shader.uniforms.uHologramRimStrength.value).toBe(1.1);
    expect(shader.uniforms.uHologramScanSpeed.value).toBe(0.2);
    expect((shader.uniforms.uHologramColor.value as THREE.Color).getHex()).toBe(0x33ffff);
    expect((f.pipelines[0].passes[1] as UnrealBloomPass).strength).toBe(0.3);
    f.v2.setFlicker(false);
    f.v2.render(0);
    expect(shader.uniforms.uHologramFlickerEnabled.value).toBe(0);
    f.v2.dispose();
  });
});

describe('reversible look switching and rig ownership', () => {
  it.each([true, false])('restores exact production material arrays, layers, and initial wire visibility=%s', visibleWire => {
    const f = fixture({ array: true, visibleWire });
    f.mesh.layers.mask = 1 | (1 << 5);
    const mask = f.mesh.layers.mask;
    const array = f.mesh.material;
    const elements = [...array as THREE.Material[]];
    expect(f.ring.visible).toBe(false);
    expect(f.mesh.material).toBe(array);
    f.v2.setEnabled(false);
    f.v2.setEnabled(true);
    const v2Material = f.mesh.material;
    expect(Array.isArray(v2Material)).toBe(true);
    expect(v2Material).toHaveLength(2);
    expect((v2Material as THREE.Material[])[0]).toBe((v2Material as THREE.Material[])[1]);
    f.v2.setEnabled(true);
    expect(f.mesh.material).toBe(v2Material);
    expect(f.mesh.layers.isEnabled(0)).toBe(true);
    expect(f.mesh.layers.isEnabled(1)).toBe(true);
    expect(f.mesh.layers.isEnabled(2)).toBe(false);
    expect(f.wire.visible).toBe(false);
    expect(f.ring.visible).toBe(true);
    f.v2.setEnabled(false);
    f.v2.setEnabled(false);
    expect(f.mesh.material).toBe(array);
    expect(f.mesh.material).toEqual(elements);
    expect(f.mesh.layers.mask).toBe(mask);
    expect(f.wire.visible).toBe(visibleWire);
    expect(f.ring.visible).toBe(false);
    f.v2.dispose();
  });

  it('captures the latest production state on each transition, without touching other models', () => {
    const f = fixture();
    const other = new THREE.Mesh();
    other.userData.mocapWireframeOverlay = true;
    other.userData.mocapWireframeSourceUuid = 'some-other-model';
    f.scene.add(other);
    f.v2.setEnabled(true);
    expect(other.visible).toBe(true);
    f.v2.setEnabled(false);
    const latest = new THREE.MeshStandardMaterial();
    f.mesh.material = latest;
    f.wire.visible = false;
    f.mesh.layers.set(4);
    f.v2.setEnabled(true);
    f.v2.setEnabled(false);
    expect(f.mesh.material).toBe(latest);
    expect(f.mesh.layers.mask).toBe(1 << 4);
    expect(f.wire.visible).toBe(false);
    f.v2.dispose();
  });

  it.each([true, false])('does not clone/rebind or edit geometry, pose, scale, clips or %s bind mode', attached => {
    const f = fixture({ attached });
    const snapshot = {
      position: f.mesh.position.toArray(), quaternion: f.mesh.quaternion.toArray(), scale: f.model.scale.toArray(),
      hipsPosition: f.hips.position.toArray(), hipsQuaternion: f.hips.quaternion.toArray(),
      skeleton: f.mesh.skeleton, bindMode: f.mesh.bindMode,
      bind: f.mesh.bindMatrix.clone(), inverse: f.mesh.bindMatrixInverse.clone(),
      clips: f.model.animations, bones: [...f.mesh.skeleton.bones], attributes: { ...f.geometry.attributes },
    };
    const bind = vi.spyOn(f.mesh, 'bind');
    const pose = vi.spyOn(f.mesh.skeleton, 'pose');
    const clone = vi.spyOn(f.mesh, 'clone');
    f.v2.setEnabled(true);
    f.v2.render(0.016);
    f.v2.setEnabled(false);
    expect(f.mesh.position.toArray()).toEqual(snapshot.position);
    expect(f.mesh.quaternion.toArray()).toEqual(snapshot.quaternion);
    expect(f.model.scale.toArray()).toEqual(snapshot.scale);
    expect(f.hips.position.toArray()).toEqual(snapshot.hipsPosition);
    expect(f.hips.quaternion.toArray()).toEqual(snapshot.hipsQuaternion);
    expect(f.mesh.skeleton).toBe(snapshot.skeleton);
    expect(f.mesh.bindMode).toBe(snapshot.bindMode);
    expect(f.mesh.bindMatrix.equals(snapshot.bind)).toBe(true);
    expect(f.mesh.bindMatrixInverse.equals(snapshot.inverse)).toBe(true);
    expect(f.model.animations).toBe(snapshot.clips);
    expect(f.model.animations[0]).toBe(f.clip);
    expect(f.mesh.skeleton.bones).toEqual(snapshot.bones);
    expect(f.mesh.geometry).toBe(f.geometry);
    Object.entries(snapshot.attributes).forEach(([key, value]) => expect(f.geometry.getAttribute(key)).toBe(value));
    expect(bind).not.toHaveBeenCalled();
    expect(pose).not.toHaveBeenCalled();
    expect(clone).not.toHaveBeenCalled();
    f.v2.dispose();
  });
});

describe('selective bloom rendering and projector', () => {
  it('leaves production rendering unchanged when disabled', () => {
    const f = fixture();
    const snapshot = rendererSnapshot(f);
    f.v2.render(0.016);
    expect(f.renderComposer).not.toHaveBeenCalled();
    expect(f.renderer.render).toHaveBeenCalledTimes(1);
    expect(f.renderer.render).toHaveBeenCalledWith(f.scene, f.camera);
    expect(f.frames[0].visible).toContain(f.wire);
    expect(f.frames[0].visible).toContain(f.line);
    expect(f.frames[0].visible).not.toContain(f.ring);
    expect(rendererSnapshot(f)).toEqual(snapshot);
    f.v2.dispose();
  });

  it('blooms only layer-1 bodies/projector; draws beauty then an uncleared layer-2 skeleton only', () => {
    const f = fixture();
    const background = f.scene.background;
    f.v2.setEnabled(true);
    f.v2.render(0.016);
    expect(f.pipelines[0].passes[0]).toBeInstanceOf(RenderPass);
    expect(f.pipelines[0].passes[1]).toBeInstanceOf(UnrealBloomPass);
    expect(f.pipelines[1].passes.at(-1)).toBeInstanceOf(OutputPass);
    const bloomPass = f.pipelines[0].passes[1] as UnrealBloomPass;
    const combinePass = f.pipelines[1].passes[1] as ShaderPass;
    expect(combinePass.uniforms.tBloom.value).toBe(bloomPass.renderTargetsHorizontal[0].texture);
    expect(f.frames).toHaveLength(3);
    const [bloom, beauty, overlay] = f.frames;
    expect(bloom.mask).toBe(1 << 1);
    expect(bloom.visible).toContain(f.mesh);
    expect(bloom.visible).toContain(f.ring);
    expect(bloom.visible).not.toContain(f.line);
    expect(bloom.visible).not.toContain(f.grid);
    expect((bloom.background as THREE.Color).getHex()).toBe(0);
    expect(beauty.mask).toBe(1);
    expect(beauty.background).toBe(background);
    expect(beauty.visible).toContain(f.grid);
    expect(beauty.visible).not.toContain(f.line);
    expect(beauty.visible).not.toContain(f.wire);
    expect(overlay.mask).toBe(1 << 2);
    expect(overlay.autoClear).toBe(false);
    expect(overlay.background).toBeNull();
    expect(overlay.target).toBeNull();
    expect(overlay.visible).toContain(f.line);
    expect(overlay.visible).not.toContain(f.mesh);
    expect(overlay.visible).not.toContain(f.ring);
    expect(overlay.visible).not.toContain(f.grid);
    expect(f.skeletonGroup.visible).toBe(true);
    expect(f.scene.background).toBe(background);
    expect(f.camera.layers.mask).toBe(1);
    f.v2.dispose();
  });

  it('keeps a user-hidden skeleton hidden in both passes', () => {
    const f = fixture();
    f.skeletonGroup.visible = false;
    f.v2.setEnabled(true);
    f.v2.render(0.01);
    expect(f.frames.every(frame => !frame.visible.includes(f.line))).toBe(true);
    expect(f.skeletonGroup.visible).toBe(false);
    f.v2.dispose();
  });

  it.each([false, true])('restores scene/camera/renderer state even when composer throws=%s', throwRender => {
    const f = fixture();
    f.v2.setEnabled(true);
    f.camera.layers.enable(5);
    f.scene.overrideMaterial = new THREE.MeshBasicMaterial();
    const target = new THREE.WebGLRenderTarget(8, 8);
    f.renderer.setRenderTarget(target, 3, 2);
    const snapshot = rendererSnapshot(f);
    const mutate = () => {
      f.renderer.autoClear = false;
      f.renderer.autoClearColor = false;
      f.renderer.autoClearDepth = false;
      f.renderer.autoClearStencil = true;
      f.renderer.toneMapping = THREE.NoToneMapping;
      f.renderer.toneMappingExposure = 5;
      f.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      f.renderer.setClearColor(new THREE.Color(0xff0000), 0);
      f.renderer.setRenderTarget(null);
      f.renderer.setViewport(new THREE.Vector4(0, 0, 1, 1));
      f.renderer.setScissor(new THREE.Vector4(0, 0, 1, 1));
      f.renderer.setScissorTest(false);
      if (throwRender) throw new Error('simulated GPU error');
    };
    f.renderComposer.mockImplementation(mutate);
    if (throwRender) expect(() => f.v2.render(0.01)).toThrow('simulated GPU error');
    else f.v2.render(0.01);
    expect(rendererSnapshot(f)).toEqual(snapshot);
    expect(f.skeletonGroup.visible).toBe(true);
    f.v2.dispose();
    target.dispose();
  });

  it('keeps a thin flat additive ring centered under the actual moving pelvis', () => {
    const f = fixture();
    f.v2.setEnabled(true);
    f.v2.render(0);
    const p = f.hips.getWorldPosition(new THREE.Vector3());
    expect(f.ring.position.toArray()).toEqual([p.x, -0.7 + defaults.projectorFloorOffset, p.z]);
    expect(f.ring.rotation.x).toBe(-Math.PI / 2);
    expect(f.ring.material.blending).toBe(THREE.AdditiveBlending);
    expect(f.ring.material.opacity).toBe(defaults.projectorOpacity);
    expect(f.ring.material.depthWrite).toBe(false);
    const attr = f.ring.geometry.getAttribute('position');
    expect(Math.hypot(attr.getX(0), attr.getY(0))).toBeCloseTo(defaults.projectorRadius - defaults.projectorWidth);
    expect(Math.hypot(attr.getX(97), attr.getY(97))).toBeCloseTo(defaults.projectorRadius);
    const first = f.ring.position.clone();
    f.hips.position.x += 30;
    f.hips.position.z -= 10;
    f.v2.render(0);
    const next = f.hips.getWorldPosition(new THREE.Vector3());
    expect(f.ring.position.x).toBeCloseTo(next.x);
    expect(f.ring.position.z).toBeCloseTo(next.z);
    expect(f.ring.position.equals(first)).toBe(false);
    f.v2.dispose();
  });

  it('resizes owned pipelines in CSS pixels without resizing the renderer', () => {
    const f = fixture();
    const spy = vi.spyOn(f.pipelines[0], 'setSize');
    f.v2.setSize(640, 360);
    expect(f.pipelines[0].renderTarget1.width).toBe(1280);
    expect(f.pipelines[1].renderTarget1.height).toBe(720);
    f.v2.setSize(NaN, -1);
    expect(spy).toHaveBeenLastCalledWith(1, 1);
    expect(f.pipelines[0].renderTarget1.width).toBe(2);
    f.v2.dispose();
  });
});

describe('disposal', () => {
  it('restores production once and disposes every owned pass/target/material, never model resources', () => {
    const f = fixture({ array: true });
    f.v2.setEnabled(true);
    const newMaterial = (f.mesh.material as THREE.Material[])[0];
    const ownedDispose = [newMaterial, f.ring.geometry, f.ring.material, ...f.pipelines.flatMap(p => [
      p, p.renderTarget1, p.renderTarget2, p.copyPass, ...p.passes,
    ])].map(object => vi.spyOn(object, 'dispose'));
    const bloom = f.pipelines[0].passes[1] as UnrealBloomPass;
    const highPassDispose = vi.spyOn(bloom.materialHighPassFilter, 'dispose');
    const bloomTargetDispose = vi.spyOn(bloom.renderTargetBright, 'dispose');
    const modelResources = [f.geometry, f.mesh.skeleton, f.wire.material as THREE.Material, ...f.productionMaterial as THREE.Material[]];
    const sourceDispose = modelResources.map(object => vi.spyOn(object, 'dispose'));
    f.v2.dispose();
    f.v2.dispose();
    f.v2.setEnabled(true);
    f.v2.setFlicker(true);
    f.v2.setSize(10, 10);
    f.v2.render(0.1);
    expect(f.mesh.material).toBe(f.productionMaterial);
    expect(f.wire.visible).toBe(true);
    expect(f.scene.children).not.toContain(f.ring);
    ownedDispose.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
    expect(highPassDispose).toHaveBeenCalledTimes(1);
    expect(bloomTargetDispose).toHaveBeenCalledTimes(1);
    sourceDispose.forEach(spy => expect(spy).not.toHaveBeenCalled());
    expect(f.renderComposer).not.toHaveBeenCalled();
  });
});
