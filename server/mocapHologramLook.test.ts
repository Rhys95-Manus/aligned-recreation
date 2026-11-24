import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import {
  applyMocapHologramLook,
  configureMocapHologramScene,
} from '../client/src/lib/mocapHologramLook';

function overlays(model: THREE.Object3D): THREE.Mesh[] {
  const result: THREE.Mesh[] = [];
  model.traverse(object => {
    if (object.userData.mocapWireframeOverlay) result.push(object as THREE.Mesh);
  });
  return result;
}

function rigFixture(bindMode: THREE.SkinnedMesh['bindMode'] = 'attached') {
  const model = new THREE.Group();
  model.position.set(-2, 3, 1);
  model.rotation.set(0.1, -0.2, 0.3);
  model.scale.setScalar(0.014);
  const armature = new THREE.Group();
  armature.name = 'Armature';
  armature.position.set(1, 2, -3);
  model.add(armature);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0, 1, 0, 0, 0, 1, 0,
  ], 3));
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute([
    0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
  ], 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute([
    1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
  ], 4));
  const originalMaterial = new THREE.MeshStandardMaterial();
  const mesh = new THREE.SkinnedMesh(geometry, originalMaterial);
  mesh.name = 'Body';
  mesh.position.set(2, -3, 4);
  mesh.quaternion.setFromEuler(new THREE.Euler(0.4, -0.6, 0.2));
  mesh.scale.set(2, 0.75, 1.25);
  mesh.renderOrder = 8;
  armature.add(mesh);
  const hips = new THREE.Bone();
  hips.name = 'Hips';
  hips.position.set(0, 1, 0);
  const knee = new THREE.Bone();
  knee.name = 'Knee';
  knee.position.set(0.2, -1, 0.1);
  hips.add(knee);
  mesh.add(hips);
  model.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton([hips, knee]);
  mesh.bind(skeleton, mesh.matrixWorld.clone());
  mesh.bindMode = bindMode;
  // Start in a posed state, not the bind pose, to catch accidental pose()/bind().
  hips.rotation.set(0.1, 0.2, -0.3);
  knee.rotation.set(-0.45, 0.1, 0.25);
  model.updateMatrixWorld(true);
  skeleton.update();
  const clip = new THREE.AnimationClip('OriginalMotion', 1, [
    new THREE.QuaternionKeyframeTrack('Knee.quaternion', [0, 1], [
      0, 0, 0, 1, 0.2, 0, 0, Math.sqrt(0.96),
    ]),
  ]);
  model.animations = [clip];
  return { model, armature, mesh, geometry, originalMaterial, hips, knee, skeleton, clip };
}

function transformSnapshot(object: THREE.Object3D) {
  return {
    parent: object.parent,
    children: [...object.children],
    position: object.position.toArray(),
    quaternion: object.quaternion.toArray(),
    scale: object.scale.toArray(),
    matrix: object.matrix.toArray(),
    matrixWorld: object.matrixWorld.toArray(),
    matrixAutoUpdate: object.matrixAutoUpdate,
    matrixWorldAutoUpdate: object.matrixWorldAutoUpdate,
    matrixWorldNeedsUpdate: object.matrixWorldNeedsUpdate,
  };
}

function expectTransformUnchanged(object: THREE.Object3D, before: ReturnType<typeof transformSnapshot>) {
  expect(object.parent).toBe(before.parent);
  expect(object.position.toArray()).toEqual(before.position);
  expect(object.quaternion.toArray()).toEqual(before.quaternion);
  expect(object.scale.toArray()).toEqual(before.scale);
  expect(object.matrix.toArray()).toEqual(before.matrix);
  expect(object.matrixWorld.toArray()).toEqual(before.matrixWorld);
  expect(object.matrixAutoUpdate).toBe(before.matrixAutoUpdate);
  expect(object.matrixWorldAutoUpdate).toBe(before.matrixWorldAutoUpdate);
  expect(object.matrixWorldNeedsUpdate).toBe(before.matrixWorldNeedsUpdate);
}

function collectBones(root: THREE.Object3D): THREE.Bone[] {
  const bones: THREE.Bone[] = [];
  root.traverse(object => {
    if ((object as THREE.Bone).isBone) bones.push(object as THREE.Bone);
  });
  return bones;
}

function expectInnerMaterial(material: THREE.Material | THREE.Material[]) {
  expect(material).toBeInstanceOf(THREE.MeshStandardMaterial);
  const inner = material as THREE.MeshStandardMaterial;
  expect(inner.color.getHex()).toBe(0x3a006e);
  expect(inner.emissive.getHex()).toBe(0x220044);
  expect(inner.emissiveIntensity).toBe(0.8);
  expect(inner.metalness).toBe(0.6);
  expect(inner.roughness).toBe(0.4);
  expect(inner.transparent).toBe(true);
  expect(inner.opacity).toBe(0.9);
  expect(inner.side).toBe(THREE.DoubleSide);
  expect(inner.map).toBeNull();
}

function expectWireMaterial(material: THREE.Material | THREE.Material[]) {
  expect(material).toBeInstanceOf(THREE.MeshBasicMaterial);
  const wire = material as THREE.MeshBasicMaterial;
  expect(wire.color.getHex()).toBe(0x00ffff);
  expect(wire.wireframe).toBe(true);
  expect(wire.transparent).toBe(true);
  expect(wire.opacity).toBe(0.08);
  expect(wire.depthTest).toBe(true);
  expect(wire.depthWrite).toBe(false);
}

describe('applyMocapHologramLook', () => {
  it('matches the exact production inner and wireframe material recipe', () => {
    const { model, mesh, geometry } = rigFixture();
    const geometryDispose = vi.spyOn(geometry, 'dispose');
    applyMocapHologramLook(model);
    const [wire] = overlays(model);
    expectInnerMaterial(mesh.material);
    expectWireMaterial(wire.material);
    expect(mesh.geometry).toBe(geometry);
    expect(wire.geometry).toBe(geometry);
    expect(mesh.castShadow).toBe(true);
    expect(mesh.receiveShadow).toBe(true);
    expect(mesh.frustumCulled).toBe(false);
    expect(wire.frustumCulled).toBe(false);
    expect(wire.renderOrder).toBe(mesh.renderOrder + 1);
    expect(wire.userData.mocapWireframeOverlay).toBe(true);
    expect(wire.userData.mocapWireframeSourceUuid).toBe(mesh.uuid);
    expect(geometryDispose).not.toHaveBeenCalled();
  });

  it.each(['attached', 'detached'] as const)(
    'shares the exact skeleton and preserves %s bind state with a nonidentity mesh transform',
    bindMode => {
      const { model, armature, mesh, skeleton } = rigFixture(bindMode);
      const bindMatrix = mesh.bindMatrix.clone();
      const bindMatrixInverse = mesh.bindMatrixInverse.clone();
      const originalBindMatrix = mesh.bindMatrix;
      const originalBindMatrixInverse = mesh.bindMatrixInverse;
      const sourceTransform = transformSnapshot(mesh);
      const pose = vi.spyOn(skeleton, 'pose');
      const calculateInverses = vi.spyOn(skeleton, 'calculateInverses');
      const bind = vi.spyOn(THREE.SkinnedMesh.prototype, 'bind');
      applyMocapHologramLook(model);
      const [wire] = overlays(model) as THREE.SkinnedMesh[];
      expect(wire).toBeInstanceOf(THREE.SkinnedMesh);
      expect(wire.parent).toBe(armature);
      expect(mesh.parent).toBe(armature);
      expect(wire.skeleton).toBe(skeleton);
      expect(wire.bindMode).toBe(bindMode);
      expect(wire.bindMatrix.elements).toEqual(bindMatrix.elements);
      expect(wire.bindMatrixInverse.elements).toEqual(bindMatrixInverse.elements);
      expect(mesh.bindMatrix).toBe(originalBindMatrix);
      expect(mesh.bindMatrixInverse).toBe(originalBindMatrixInverse);
      expect(mesh.bindMatrix.elements).toEqual(bindMatrix.elements);
      expect(mesh.bindMatrixInverse.elements).toEqual(bindMatrixInverse.elements);
      expect(wire.position.toArray()).toEqual(sourceTransform.position);
      expect(wire.quaternion.toArray()).toEqual(sourceTransform.quaternion);
      expect(wire.scale.toArray()).toEqual(sourceTransform.scale);
      expect(wire.matrix.toArray()).toEqual(sourceTransform.matrix);
      expect(wire.matrixWorld.toArray()).toEqual(sourceTransform.matrixWorld);
      expect(wire.children).toHaveLength(0);
      expect(pose).not.toHaveBeenCalled();
      expect(calculateInverses).not.toHaveBeenCalled();
      expect(bind).not.toHaveBeenCalled();
      bind.mockRestore();
      model.updateMatrixWorld(true);
      expect(wire.matrixWorld.elements).toEqual(mesh.matrixWorld.elements);
      expect(wire.bindMatrixInverse.elements).toEqual(mesh.bindMatrixInverse.elements);
    },
  );

  it('does not change the pose, bone objects, geometry, clips, or existing rig hierarchy', () => {
    const { model, armature, mesh, skeleton, geometry, hips, knee, clip } = rigFixture();
    const objects = [model, armature, mesh, hips, knee];
    const snapshots = objects.map(transformSnapshot);
    const bones = [...skeleton.bones];
    const boneInverses = [...skeleton.boneInverses];
    const inverseValues = boneInverses.map(matrix => matrix.toArray());
    const boneMatrices = [...skeleton.boneMatrices];
    const attributes = { ...geometry.attributes };
    const positionValues = [...geometry.getAttribute('position').array];
    const skinIndexValues = [...geometry.getAttribute('skinIndex').array];
    const skinWeightValues = [...geometry.getAttribute('skinWeight').array];
    const animations = model.animations;
    const clipBefore = clip.toJSON();
    applyMocapHologramLook(model);
    objects.forEach((object, index) => expectTransformUnchanged(object, snapshots[index]));
    // Only the armature's mesh sibling list gains the overlay.
    for (const index of [0, 2, 3, 4]) {
      expect(objects[index].children).toEqual(snapshots[index].children);
    }
    expect(armature.children.filter(child => !child.userData.mocapWireframeOverlay))
      .toEqual(snapshots[1].children);
    expect(collectBones(model)).toEqual([hips, knee]);
    skeleton.bones.forEach((bone, index) => expect(bone).toBe(bones[index]));
    skeleton.boneInverses.forEach((matrix, index) => {
      expect(matrix).toBe(boneInverses[index]);
      expect(matrix.toArray()).toEqual(inverseValues[index]);
    });
    expect([...skeleton.boneMatrices]).toEqual(boneMatrices);
    expect(mesh.geometry).toBe(geometry);
    for (const [name, attribute] of Object.entries(attributes)) {
      expect(geometry.getAttribute(name)).toBe(attribute);
    }
    expect([...geometry.getAttribute('position').array]).toEqual(positionValues);
    expect([...geometry.getAttribute('skinIndex').array]).toEqual(skinIndexValues);
    expect([...geometry.getAttribute('skinWeight').array]).toEqual(skinWeightValues);
    expect(model.animations).toBe(animations);
    expect(model.animations[0]).toBe(clip);
    expect(clip.toJSON()).toEqual(clipBefore);
  });

  it('constructs non-skinned overlays without cloning child meshes, bones, or animation data', () => {
    const model = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
    mesh.position.set(2, 3, 4);
    mesh.quaternion.setFromEuler(new THREE.Euler(0.1, 0.2, 0.3));
    mesh.scale.set(2, 3, 4);
    mesh.renderOrder = -3;
    mesh.layers.set(2);
    const childMesh = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());
    const bone = new THREE.Bone();
    mesh.add(childMesh, bone);
    model.add(mesh);
    model.updateMatrixWorld(true);
    mesh.matrixAutoUpdate = false;
    mesh.matrixWorldAutoUpdate = false;
    mesh.morphTargetInfluences = [0.25, 0.75];
    mesh.morphTargetDictionary = { Smile: 0, Blink: 1 };
    const clone = vi.spyOn(mesh, 'clone');
    applyMocapHologramLook(model);
    const wires = overlays(model);
    expect(wires).toHaveLength(2);
    const wire = wires.find(item => item.userData.mocapWireframeSourceUuid === mesh.uuid)!;
    expect(wire).toBeInstanceOf(THREE.Mesh);
    expect((wire as THREE.SkinnedMesh).isSkinnedMesh).toBeUndefined();
    expect(wire.parent).toBe(model);
    expect(wire.geometry).toBe(mesh.geometry);
    expect(wire.children).toHaveLength(0);
    expect(wire.position.toArray()).toEqual(mesh.position.toArray());
    expect(wire.quaternion.toArray()).toEqual(mesh.quaternion.toArray());
    expect(wire.scale.toArray()).toEqual(mesh.scale.toArray());
    expect(wire.matrix.elements).toEqual(mesh.matrix.elements);
    expect(wire.matrixAutoUpdate).toBe(false);
    expect(wire.matrixWorldAutoUpdate).toBe(false);
    expect(wire.layers.mask).toBe(mesh.layers.mask);
    expect(wire.renderOrder).toBe(-2);
    expect(wire.frustumCulled).toBe(false);
    expect(wire.morphTargetInfluences).toBe(mesh.morphTargetInfluences);
    expect(wire.morphTargetDictionary).toBe(mesh.morphTargetDictionary);
    expect(clone).not.toHaveBeenCalled();
    expect(collectBones(model)).toEqual([bone]);
    expect(childMesh.parent).toBe(mesh);
    expect(wires.find(item => item.userData.mocapWireframeSourceUuid === childMesh.uuid)?.parent)
      .toBe(mesh);
  });

  it('uses unique nonconflicting names even for duplicate source names and existing overlay-like names', () => {
    const model = new THREE.Group();
    const first = new THREE.Mesh();
    const second = new THREE.Mesh();
    first.name = second.name = 'Body';
    const blocker = new THREE.Group();
    blocker.name = `mocap_wireframe_overlay_${first.uuid}`;
    model.add(first, second, blocker);
    applyMocapHologramLook(model);
    const wires = overlays(model);
    expect(wires).toHaveLength(2);
    expect(new Set(wires.map(wire => wire.name)).size).toBe(2);
    expect(wires.every(wire => !['Body', blocker.name].includes(wire.name))).toBe(true);
    expect(model.getObjectByName('Body')).toBe(first);
    expect(model.getObjectByName(blocker.name)).toBe(blocker);
  });

  it('is idempotent without replacing or disposing the new materials on repeated application', () => {
    const { model, mesh, originalMaterial } = rigFixture();
    const originalDispose = vi.spyOn(originalMaterial, 'dispose');
    applyMocapHologramLook(model);
    const [wire] = overlays(model);
    const inner = mesh.material as THREE.Material;
    const wireMaterial = wire.material as THREE.Material;
    const innerDispose = vi.spyOn(inner, 'dispose');
    const wireDispose = vi.spyOn(wireMaterial, 'dispose');
    applyMocapHologramLook(model);
    applyMocapHologramLook(model);
    // Applying to a source subtree must also recognize its existing sibling.
    applyMocapHologramLook(mesh);
    expect(overlays(model)).toEqual([wire]);
    expect(mesh.material).toBe(inner);
    expect(wire.material).toBe(wireMaterial);
    expect(originalDispose).toHaveBeenCalledTimes(1);
    expect(innerDispose).not.toHaveBeenCalled();
    expect(wireDispose).not.toHaveBeenCalled();
    expectInnerMaterial(mesh.material);
    expectWireMaterial(wire.material);
  });

  it('disposes each replaced material and texture once, including arrays, shared maps, and uniforms', () => {
    const model = new THREE.Group();
    const sharedTexture = new THREE.Texture();
    const normalTexture = new THREE.Texture();
    const uniformTexture = new THREE.Texture();
    const standard = new THREE.MeshStandardMaterial({
      map: sharedTexture,
      emissiveMap: sharedTexture,
      normalMap: normalTexture,
      roughnessMap: sharedTexture,
      metalnessMap: sharedTexture,
    });
    const basic = new THREE.MeshBasicMaterial({ map: sharedTexture, alphaMap: sharedTexture });
    const shader = new THREE.ShaderMaterial({
      uniforms: { maps: { value: [sharedTexture, uniformTexture] } },
    });
    const materialSpies = [standard, basic, shader].map(material => vi.spyOn(material, 'dispose'));
    const textureSpies = [sharedTexture, normalTexture, uniformTexture]
      .map(texture => vi.spyOn(texture, 'dispose'));
    const geometry = new THREE.BoxGeometry();
    const geometryDispose = vi.spyOn(geometry, 'dispose');
    model.add(
      new THREE.Mesh(geometry, [standard, basic, standard, shader]),
      new THREE.Mesh(geometry, [basic, standard]),
    );
    applyMocapHologramLook(model);
    applyMocapHologramLook(model);
    // Even if an old distinct resource object is reused later, do not dispose it twice.
    model.add(new THREE.Mesh(geometry, [standard, shader]));
    applyMocapHologramLook(model);
    materialSpies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
    textureSpies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
    expect(geometryDispose).not.toHaveBeenCalled();
    expect(standard.map).toBe(sharedTexture);
    expect(standard.normalMap).toBe(normalTexture);
    expect(shader.uniforms.maps.value).toEqual([sharedTexture, uniformTexture]);
    expect(overlays(model)).toHaveLength(3);
  });

  it('does not dispose shared materials or textures still used outside the selected subtree', () => {
    const scene = new THREE.Scene();
    const firstModel = new THREE.Group();
    const secondModel = new THREE.Group();
    const texture = new THREE.Texture();
    const sharedMaterial = new THREE.MeshStandardMaterial({ map: texture });
    const otherMaterial = new THREE.MeshStandardMaterial({ emissiveMap: texture });
    firstModel.add(new THREE.Mesh(new THREE.BoxGeometry(), [sharedMaterial, otherMaterial]));
    secondModel.add(new THREE.Mesh(new THREE.BoxGeometry(), sharedMaterial));
    scene.add(firstModel, secondModel);
    const sharedDispose = vi.spyOn(sharedMaterial, 'dispose');
    const otherDispose = vi.spyOn(otherMaterial, 'dispose');
    const textureDispose = vi.spyOn(texture, 'dispose');
    applyMocapHologramLook(firstModel);
    expect(sharedDispose).not.toHaveBeenCalled();
    expect(otherDispose).toHaveBeenCalledTimes(1);
    expect(textureDispose).not.toHaveBeenCalled();
    applyMocapHologramLook(secondModel);
    expect(sharedDispose).toHaveBeenCalledTimes(1);
    expect(otherDispose).toHaveBeenCalledTimes(1);
    expect(textureDispose).toHaveBeenCalledTimes(1);
  });

  it('has no side effects for a mesh-free model', () => {
    const model = new THREE.Group();
    const bone = new THREE.Bone();
    model.add(bone);
    const before = transformSnapshot(model);
    applyMocapHologramLook(model);
    expectTransformUnchanged(model, before);
    expect(model.children).toEqual([bone]);
    expect(overlays(model)).toHaveLength(0);
  });
});

describe('configureMocapHologramScene', () => {
  it('configures the exact production scene and renderer settings without requiring WebGL', () => {
    const scene = new THREE.Scene();
    const renderer = {
      outputColorSpace: THREE.LinearSRGBColorSpace,
      toneMapping: THREE.NoToneMapping,
      toneMappingExposure: 1,
    };
    configureMocapHologramScene(scene, renderer as THREE.WebGLRenderer);
    expect((scene.background as THREE.Color).getHex()).toBe(0x0a0e27);
    expect(renderer.outputColorSpace).toBe(THREE.SRGBColorSpace);
    expect(renderer.toneMapping).toBe(THREE.ACESFilmicToneMapping);
    expect(renderer.toneMappingExposure).toBe(1.2);
    expect(scene.children).toHaveLength(4);
    const [ambient, main, cyan, magenta] = scene.children as THREE.Light[];
    expect(ambient).toBeInstanceOf(THREE.AmbientLight);
    expect(ambient.color.getHex()).toBe(0x110022);
    expect(ambient.intensity).toBe(0.4);
    expect(main).toBeInstanceOf(THREE.DirectionalLight);
    expect(main.color.getHex()).toBe(0x4488ff);
    expect(main.intensity).toBe(1.5);
    expect(main.position.toArray()).toEqual([0, 5, 5]);
    for (const [light, color, intensity, position] of [
      [cyan, 0x00ffff, 5, [-5, 2, -5]],
      [magenta, 0xff00ff, 6, [5, 2, -5]],
    ] as const) {
      expect(light).toBeInstanceOf(THREE.SpotLight);
      expect(light.color.getHex()).toBe(color);
      expect(light.intensity).toBe(intensity);
      expect(light.position.toArray()).toEqual(position);
      const spot = light as THREE.SpotLight;
      const defaults = new THREE.SpotLight();
      expect(spot.target.position.toArray()).toEqual([0, 0, 0]);
      expect(spot.target.parent).toBeNull();
      expect(spot.distance).toBe(defaults.distance);
      expect(spot.angle).toBe(defaults.angle);
      expect(spot.penumbra).toBe(defaults.penumbra);
      expect(spot.decay).toBe(defaults.decay);
    }
    expect((main as THREE.DirectionalLight).target.position.toArray()).toEqual([0, 0, 0]);
  });

  it('does not duplicate its lights on repeat configuration or remove caller-owned scene objects', () => {
    const scene = new THREE.Scene();
    const existingLight = new THREE.AmbientLight(0xffffff, 0.2);
    const model = new THREE.Group();
    scene.add(existingLight, model);
    const renderer = {} as THREE.WebGLRenderer;
    configureMocapHologramScene(scene, renderer);
    const children = [...scene.children];
    renderer.toneMappingExposure = 4;
    configureMocapHologramScene(scene, renderer);
    expect(scene.children).toEqual(children);
    expect(scene.children).toContain(existingLight);
    expect(scene.children).toContain(model);
    expect(scene.children.filter(child => child.userData.mocapHologramSceneLight))
      .toHaveLength(4);
    expect(renderer.toneMappingExposure).toBe(1.2);
  });
});
