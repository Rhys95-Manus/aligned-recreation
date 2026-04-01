import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type MotionType = 'football_throw' | 'basketball_jumpshot' | 'basketball_dribble' | 'golf_swing' | 'kettlebell' | 'generic';

// CDN URLs for hologram models
const FOOTBALL_MODEL_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663143408740/Gd6AiijCmPwLtcbfaErCFP/fotball2_b7f18e4a.glb';
const BASKETBALL_MODEL_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663143408740/Gd6AiijCmPwLtcbfaErCFP/MaleHologram_quant_d74b85d9.glb';

// Models that should keep their original materials and play built-in animation
const ORIGINAL_MATERIAL_MODELS = new Set([FOOTBALL_MODEL_URL]);

// Map motion types to model URLs
export function getModelUrlForMotion(motionType: MotionType): string {
  switch (motionType) {
    case 'basketball_jumpshot':
      return BASKETBALL_MODEL_URL;
    case 'basketball_dribble':
      return FOOTBALL_MODEL_URL;
    case 'football_throw':
    case 'golf_swing':
    case 'kettlebell':
    case 'generic':
    default:
      return FOOTBALL_MODEL_URL;
  }
}

// Detect motion type from motion name string
export function detectMotionType(motionName: string): MotionType {
  const name = motionName.toLowerCase();
  if (name.includes('jump shot') || name.includes('jumpshot') || name.includes('layup') || 
      name.includes('free throw') || name.includes('three point') || name.includes('3-point')) {
    return 'basketball_jumpshot';
  }
  if (name.includes('dribbl')) {
    return 'basketball_dribble';
  }
  if (name.includes('football') || name.includes('throw') || name.includes('quarterback')) {
    return 'football_throw';
  }
  if (name.includes('kettlebell') || name.includes('snatch')) {
    return 'kettlebell';
  }
  if (name.includes('golf') || name.includes('swing')) {
    return 'golf_swing';
  }
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('basketball') && !name.includes('dribbl')) {
      return 'basketball_jumpshot';
    }
  }
  return 'generic';
}

interface Hologram3DProps {
  landmarks: any[];
  rotationAngle?: number;
  isRightHanded?: boolean;
  motionType?: MotionType;
  isPlaying?: boolean;
  /** 0.0–1.0 progress through the current rep, used to sync built-in animation to replay timeline */
  playbackProgress?: number;
  metrics?: {
    hipRotation: number;
    shoulderRotation: number;
    rightElbowAngle: number;
    leftElbowAngle: number;
    rightKneeFlexion: number;
    leftKneeFlexion: number;
    spineAngle: number;
    rightShoulderAngle: number;
    leftShoulderAngle: number;
    footPositioning: number;
    weightTransfer: number;
  };
  onRotationChange?: (angle: number) => void;
  onLoadComplete?: () => void;
}

const Hologram3D: React.FC<Hologram3DProps> = ({
  landmarks,
  rotationAngle = 0,
  isRightHanded = true,
  motionType = 'generic',
  isPlaying = true,
  playbackProgress = 0,
  metrics,
  onRotationChange,
  onLoadComplete
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const bonesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const animationFrameRef = useRef<number>(0);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const clipDurationRef = useRef<number>(0);
  const useOriginalMaterialsRef = useRef<boolean>(false);
  const baseRotationRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Touch/mouse drag rotation
  const isDraggingRef = useRef(false);
  const lastDragXRef = useRef(0);
  const currentRotationRef = useRef(rotationAngle);
  currentRotationRef.current = rotationAngle;

  const modelUrl = getModelUrlForMotion(motionType);

  // Initialize Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Track whether this model keeps its original materials
    const keepOriginalMaterials = ORIGINAL_MATERIAL_MODELS.has(modelUrl);
    useOriginalMaterialsRef.current = keepOriginalMaterials;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 4.5); 
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.id = 'hologram-3d-canvas';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // LIGHTING SETUP
    const ambientLight = new THREE.AmbientLight(
      keepOriginalMaterials ? 0xffffff : 0x110022,
      keepOriginalMaterials ? 1.0 : 0.4
    );
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(
      keepOriginalMaterials ? 0xffffff : 0x4488ff,
      keepOriginalMaterials ? 2.0 : 1.5
    );
    mainLight.position.set(0, 5, 5);
    scene.add(mainLight);

    if (keepOriginalMaterials) {
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
      fillLight.position.set(-3, 3, -3);
      scene.add(fillLight);

      const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
      backLight.position.set(0, 2, -5);
      scene.add(backLight);
    } else {
      const rimLightLeft = new THREE.SpotLight(0x00ffff, 5.0);
      rimLightLeft.position.set(-5, 2, -5);
      rimLightLeft.lookAt(0, 0, 0);
      scene.add(rimLightLeft);

      const rimLightRight = new THREE.SpotLight(0xff00ff, 6.0);
      rimLightRight.position.set(5, 2, -5);
      rimLightRight.lookAt(0, 0, 0);
      scene.add(rimLightRight);
    }

    // Load Model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf: any) => {
        const model = gltf.scene;
        modelRef.current = model;

        // Clear previous bone mappings
        bonesRef.current.clear();

        if (keepOriginalMaterials) {
          // ============================================================
          // ORIGINAL MATERIALS MODE: Keep the model's textures, colors,
          // and animation exactly as the creator designed them.
          // ============================================================

          // Remove extra objects (Plane, football, etc.) — keep only the Armature
          const toRemove: THREE.Object3D[] = [];
          model.children.forEach((child: any) => {
            const name = (child.name || '').toLowerCase();
            if (name === 'armature') return;
            toRemove.push(child);
          });
          toRemove.forEach((obj) => model.remove(obj));

          // Compute bounding box from only the Armature
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);

          const scale = 3.5 / maxDim;
          model.scale.set(scale, scale, scale);

          const center = box.getCenter(new THREE.Vector3());
          model.position.x = -center.x * scale;
          // Position: place feet near bottom of frame, lower than before
          model.position.y = -center.y * scale - 0.8;
          model.position.z = -center.z * scale;

          baseRotationRef.current = 0;

          model.traverse((child: any) => {
            if ((child as THREE.Bone).isBone) {
              mapBone(child, bonesRef.current);
            }
            if ((child as THREE.Mesh).isMesh) {
              child.frustumCulled = false;
            }
          });

          // Set up animation — time is controlled externally via playbackProgress
          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            mixerRef.current = mixer;
            const clip = gltf.animations[0];
            clipDurationRef.current = clip.duration;
            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.setEffectiveWeight(1);
            action.play();
            actionRef.current = action;
            // Set initial pose at time 0
            mixer.setTime(0);
          }

        } else {
          // ============================================================
          // HOLOGRAM MODE: Replace materials with volumetric hologram
          // shader and add wireframe overlay.
          // ============================================================

          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);

          const scale = 3.5 / maxDim;
          model.scale.set(scale, scale, scale);

          const center = box.getCenter(new THREE.Vector3());
          model.position.x = -center.x * scale;
          model.position.y = -box.min.y * scale - 1.6;
          model.position.z = -center.z * scale;

          const innerMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a006e,
            emissive: 0x220044,
            emissiveIntensity: 0.8,
            metalness: 0.6,
            roughness: 0.4,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
          });

          const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.08,
            depthTest: true,
            depthWrite: false
          });

          // Collect meshes FIRST, then process AFTER traverse
          const meshesToProcess: { mesh: THREE.Mesh; parent: THREE.Object3D }[] = [];

          model.traverse((child: any) => {
            if ((child as THREE.Mesh).isMesh) {
              meshesToProcess.push({
                mesh: child as THREE.Mesh,
                parent: child.parent || model
              });
            }
            if ((child as THREE.Bone).isBone) {
              mapBone(child, bonesRef.current);
            }
          });

          for (const { mesh, parent } of meshesToProcess) {
            if (mesh.material) {
              const origMat = mesh.material as THREE.MeshStandardMaterial;
              if (origMat.map) { origMat.map.dispose(); origMat.map = null; }
              if (origMat.emissiveMap) { origMat.emissiveMap.dispose(); origMat.emissiveMap = null; }
              if (origMat.normalMap) { origMat.normalMap.dispose(); origMat.normalMap = null; }
              origMat.dispose();
            }

            if ((mesh as any).isSkinnedMesh) {
              const skinnedMesh = mesh as THREE.SkinnedMesh;
              const wireframe = new THREE.SkinnedMesh(
                skinnedMesh.geometry,
                wireframeMaterial
              );
              wireframe.position.copy(skinnedMesh.position);
              wireframe.rotation.copy(skinnedMesh.rotation);
              wireframe.scale.copy(skinnedMesh.scale);
              wireframe.bind(skinnedMesh.skeleton, skinnedMesh.bindMatrix.clone());
              wireframe.bindMatrixInverse.copy(skinnedMesh.bindMatrixInverse);
              wireframe.name = 'wireframe_overlay';
              wireframe.frustumCulled = false;
              parent.add(wireframe);
            } else {
              const wireframeMesh = mesh.clone();
              wireframeMesh.material = wireframeMaterial;
              wireframeMesh.name = 'wireframe_overlay';
              parent.add(wireframeMesh);
            }

            mesh.material = innerMaterial;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.frustumCulled = false;
          }

          // Create mixer but don't play — bones driven by metrics
          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            mixerRef.current = mixer;
          }
        }

        scene.add(model);
        setIsLoading(false);
        if (onLoadComplete) onLoadComplete();
      },
      (xhr: any) => {
        if (xhr.total > 0) {
          setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (error: any) => {
        console.error('An error happened loading the model:', error);
        setIsLoading(false);
      }
    );

    // Render loop — only renders, does NOT advance the mixer (that's done via playbackProgress)
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Touch/mouse drag for rotation
    const el = renderer.domElement;
    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      lastDragXRef.current = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastDragXRef.current;
      lastDragXRef.current = e.clientX;
      if (onRotationChange) {
        const newAngle = ((currentRotationRef.current + dx * 0.5) % 360 + 360) % 360;
        onRotationChange(newAngle > 180 ? newAngle - 360 : newAngle);
      }
    };
    const onPointerUp = () => {
      isDraggingRef.current = false;
    };
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointerleave', onPointerUp);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointerleave', onPointerUp);
      if (containerRef.current && rendererRef.current) {
        try {
          containerRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) { /* ignore */ }
      }
      rendererRef.current?.dispose();
      mixerRef.current = null;
      actionRef.current = null;
    };
  }, [modelUrl]);

  // Sync built-in animation to replay timeline via playbackProgress (0.0–1.0)
  // This handles play, pause, rewind, scrub — all driven by the parent's frame index
  useEffect(() => {
    if (!mixerRef.current || !actionRef.current || clipDurationRef.current <= 0) return;
    // Only applies to original-material models with built-in animation
    if (!useOriginalMaterialsRef.current) return;

    // Map progress (0–1) to animation time (0–clipDuration)
    const targetTime = Math.min(playbackProgress, 0.9999) * clipDurationRef.current;
    // Directly set the action's time and force the mixer to apply it
    actionRef.current.time = targetTime;
    mixerRef.current.update(0); // delta=0 applies current time without advancing
  }, [playbackProgress]);

  // Handle rotation for original-material models
  useEffect(() => {
    if (!modelRef.current) return;
    if (useOriginalMaterialsRef.current) {
      const viewRotationRad = (rotationAngle * Math.PI) / 180;
      modelRef.current.rotation.y = viewRotationRad + baseRotationRef.current;
    }
  }, [rotationAngle]);

  // Handle Metrics Animation — only for hologram-mode models (not original-material models)
  useEffect(() => {
    if (!metrics || bonesRef.current.size === 0) return;
    if (useOriginalMaterialsRef.current) return;

    const rotateBone = (name: string, axis: 'x' | 'y' | 'z', angleDeg: number, offsetDeg: number = 0, invert: boolean = false) => {
      const bone = bonesRef.current.get(name);
      if (bone) {
        const rad = (angleDeg + offsetDeg) * (Math.PI / 180);
        bone.rotation[axis] = invert ? -rad : rad;
      }
    };

    if (motionType === 'basketball_jumpshot') {
      if (modelRef.current) {
        const viewRotationRad = (rotationAngle * Math.PI) / 180;
        const stanceOffset = -Math.PI / 2;
        const hipActionRad = ((90 - metrics.hipRotation) * Math.PI) / 180;
        modelRef.current.rotation.y = viewRotationRad + stanceOffset + (hipActionRad * 0.3);
      }

      const spineTilt = Math.min(metrics.spineAngle, 12);
      rotateBone('spine', 'x', spineTilt, 0, false);
      rotateBone('spine', 'y', metrics.shoulderRotation * 0.3, -90, true);

      rotateBone('rightArm', 'x', metrics.rightShoulderAngle, 0, false);
      const shootingAbduction = Math.max(-20, Math.min(20, (90 - metrics.shoulderRotation) * 0.3));
      rotateBone('rightArm', 'z', shootingAbduction, 0, false);
      rotateBone('rightForearm', 'x', metrics.rightElbowAngle, -180, false);

      rotateBone('leftArm', 'z', metrics.leftShoulderAngle, -90, false);
      rotateBone('leftArm', 'x', metrics.leftShoulderAngle * 0.5, 0, false);
      rotateBone('leftForearm', 'x', metrics.leftElbowAngle, -180, false);

      rotateBone('rightLeg', 'x', metrics.rightKneeFlexion, -180, false);
      rotateBone('leftLeg', 'x', metrics.leftKneeFlexion, -180, false);
      
    } else {
      if (modelRef.current) {
        const viewRotationRad = (rotationAngle * Math.PI) / 180;
        const stanceOffset = -Math.PI / 2;
        const hipActionRad = ((90 - metrics.hipRotation) * Math.PI) / 180;
        modelRef.current.rotation.y = viewRotationRad + stanceOffset + (hipActionRad * 0.5);
      }

      const spineTilt = metrics.spineAngle > 15 ? 15 : metrics.spineAngle; 
      rotateBone('spine', 'x', spineTilt, 0, false);
      rotateBone('spine', 'y', metrics.shoulderRotation, -90, true);

      rotateBone('rightArm', 'x', metrics.rightShoulderAngle, 0, false);
      const armAdduction = (90 - metrics.shoulderRotation) - 45;
      rotateBone('rightArm', 'z', armAdduction, 0, false);
      rotateBone('rightForearm', 'x', metrics.rightElbowAngle, -180, false);

      rotateBone('leftArm', 'z', metrics.leftShoulderAngle, -90, false);
      rotateBone('leftArm', 'x', 20, 0, false);
      rotateBone('leftForearm', 'x', metrics.leftElbowAngle, -180, false);

      rotateBone('rightLeg', 'x', metrics.rightKneeFlexion, -180, false);
      rotateBone('leftLeg', 'x', metrics.leftKneeFlexion, -180, false);
    }

  }, [metrics, rotationAngle, motionType]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'grab'
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-cyan-400 font-mono text-lg animate-pulse">
            LOADING HOLOGRAM {loadProgress}%
          </div>
        </div>
      )}
    </div>
  );
};

// Helper: Map bone names from Mixamo convention
function mapBone(child: THREE.Object3D, boneMap: Map<string, THREE.Object3D>) {
  const name = child.name.toLowerCase();
  if (name.includes('hips')) boneMap.set('hips', child);
  if (name.includes('spine') && !name.includes('spine1') && !name.includes('spine2')) boneMap.set('spine', child);
  if (name.includes('spine1')) boneMap.set('spine1', child);
  if (name.includes('spine2')) boneMap.set('spine2', child);
  if (name.includes('neck')) boneMap.set('neck', child);
  if (name.includes('head') && !name.includes('top')) boneMap.set('head', child);
  
  if (name.includes('leftshoulder')) boneMap.set('leftShoulder', child);
  if (name.includes('rightshoulder')) boneMap.set('rightShoulder', child);
  
  if (name.includes('leftarm') && !name.includes('forearm')) boneMap.set('leftArm', child);
  if (name.includes('rightarm') && !name.includes('forearm')) boneMap.set('rightArm', child);
  
  if (name.includes('leftforearm')) boneMap.set('leftForearm', child);
  if (name.includes('rightforearm')) boneMap.set('rightForearm', child);
  
  if (name.includes('lefthand') && name === 'mixamorig:lefthand') boneMap.set('leftHand', child);
  if (name.includes('righthand') && name === 'mixamorig:righthand') boneMap.set('rightHand', child);
  
  if (name.includes('leftupleg')) boneMap.set('leftUpLeg', child);
  if (name.includes('rightupleg')) boneMap.set('rightUpLeg', child);
  
  if (name.includes('leftleg') && !name.includes('upleg')) boneMap.set('leftLeg', child);
  if (name.includes('rightleg') && !name.includes('upleg')) boneMap.set('rightLeg', child);
  
  if (name.includes('leftfoot') && !name.includes('toe')) boneMap.set('leftFoot', child);
  if (name.includes('rightfoot') && !name.includes('toe')) boneMap.set('rightFoot', child);
}

export default Hologram3D;
