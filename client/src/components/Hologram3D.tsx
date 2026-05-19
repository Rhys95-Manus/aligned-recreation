import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createPuntClip, createFieldGoalClip, PUNT_CLIP_DURATION, FIELD_GOAL_CLIP_DURATION } from '@/data/footballKickAnimations';

export type MotionType = 'football_throw' | 'football_punt' | 'football_fieldgoal' | 'basketball_jumpshot' | 'basketball_dribble' | 'golf_swing' | 'kettlebell' | 'generic';

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
    case 'football_punt':
    case 'football_fieldgoal':
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
  // Football kicking motions must be detected BEFORE generic football/throw
  if (name.includes('punt')) {
    return 'football_punt';
  }
  if (name.includes('field goal') || name.includes('fieldgoal') || name.includes('field-goal')) {
    return 'football_fieldgoal';
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
    // Also detect punt/field goal from URL path
    if (path.includes('punt')) {
      return 'football_punt';
    }
    if (path.includes('field-goal') || path.includes('fieldgoal') || path.includes('field_goal')) {
      return 'football_fieldgoal';
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
  /** Total duration of the current rep in seconds, used to calculate natural-speed animation timing */
  repDuration?: number;
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
  repDuration = 3.0,
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
          // Select the correct clip based on motion type:
          // - football_throw: uses the built-in GLB animation (clip index 0)
          // - football_punt: uses programmatic punt clip
          // - football_fieldgoal: uses programmatic field goal clip
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;

          let clip: THREE.AnimationClip | null = null;

          if (motionType === 'football_punt') {
            clip = createPuntClip();
            clipDurationRef.current = PUNT_CLIP_DURATION;
          } else if (motionType === 'football_fieldgoal') {
            clip = createFieldGoalClip();
            clipDurationRef.current = FIELD_GOAL_CLIP_DURATION;
          } else if (gltf.animations && gltf.animations.length > 0) {
            clip = gltf.animations[0];
            clipDurationRef.current = clip!.duration;
          }

          if (clip) {
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
  }, [modelUrl, motionType]);

  // Sync built-in animation to replay timeline via playbackProgress (0.0–1.0)
  // The hologram plays at natural speed, then snaps to neutral (no rewind).
  // Timing varies by motion type:
  //   - football_throw: ~1.8s motion, ~2.5s total cycle
  //   - football_punt: ~1.8s motion, ~2.3s total cycle
  //   - football_fieldgoal: ~1.6s motion, ~2.1s total cycle
  const prevProgressRef = useRef(0);
  const isInNeutralRef = useRef(false);
  
  useEffect(() => {
    if (!mixerRef.current || !actionRef.current || clipDurationRef.current <= 0) return;
    if (!useOriginalMaterialsRef.current) return;

    const clipDuration = clipDurationRef.current;
    const totalRepDuration = repDuration; // actual recording duration in seconds
    
    // Motion-specific timing targets
    let MOTION_DURATION: number;
    let TOTAL_REP_CYCLE: number;
    
    if (motionType === 'football_punt') {
      MOTION_DURATION = PUNT_CLIP_DURATION; // 1.8s
      TOTAL_REP_CYCLE = 2.3;
    } else if (motionType === 'football_fieldgoal') {
      MOTION_DURATION = FIELD_GOAL_CLIP_DURATION; // 1.6s
      TOTAL_REP_CYCLE = 2.1;
    } else {
      MOTION_DURATION = 1.8; // throw
      TOTAL_REP_CYCLE = 2.5;
    }
    
    // Convert playbackProgress (0–1) to elapsed seconds
    const elapsedSeconds = playbackProgress * totalRepDuration;
    
    // Detect if we rewound (user scrubbed backward)
    const didRewind = playbackProgress < prevProgressRef.current - 0.01;
    prevProgressRef.current = playbackProgress;
    
    let targetTime: number;
    
    if (elapsedSeconds <= MOTION_DURATION) {
      // Phase 1: Playing the motion at natural speed
      // Map 0–MOTION_DURATION seconds to 0–clipDuration
      const motionFraction = elapsedSeconds / MOTION_DURATION;
      targetTime = Math.min(motionFraction, 0.9999) * clipDuration;
      isInNeutralRef.current = false;
    } else if (elapsedSeconds <= TOTAL_REP_CYCLE) {
      // Phase 2: Quick snap to neutral — NOT a rewind
      targetTime = 0;
      isInNeutralRef.current = true;
    } else {
      // Phase 3: Hold at neutral for the rest of the recording
      targetTime = 0;
      isInNeutralRef.current = true;
    }
    
    // If user rewound into the motion phase, allow re-playing from that point
    if (didRewind && elapsedSeconds <= MOTION_DURATION) {
      isInNeutralRef.current = false;
    }
    
    actionRef.current.time = targetTime;
    mixerRef.current.update(0);
  }, [playbackProgress, repDuration, motionType]);

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
