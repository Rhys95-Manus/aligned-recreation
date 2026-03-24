import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type MotionType = 'football_throw' | 'basketball_jumpshot' | 'basketball_dribble' | 'golf_swing' | 'kettlebell' | 'generic';

// CDN URLs for hologram models
const FOOTBALL_MODEL_URL = '/Hologram1.0.glb';
const BASKETBALL_MODEL_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663143408740/Gd6AiijCmPwLtcbfaErCFP/MaleHologram_quant_d74b85d9.glb';

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
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const modelUrl = getModelUrlForMotion(motionType);

  // Initialize Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

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

    // VOLUMETRIC LIGHTING SETUP
    const ambientLight = new THREE.AmbientLight(0x110022, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x4488ff, 1.5);
    mainLight.position.set(0, 5, 5);
    scene.add(mainLight);

    const rimLightLeft = new THREE.SpotLight(0x00ffff, 5.0);
    rimLightLeft.position.set(-5, 2, -5);
    rimLightLeft.lookAt(0, 0, 0);
    scene.add(rimLightLeft);

    const rimLightRight = new THREE.SpotLight(0xff00ff, 6.0);
    rimLightRight.position.set(5, 2, -5);
    rimLightRight.lookAt(0, 0, 0);
    scene.add(rimLightRight);

    // Load Model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf: any) => {
        const model = gltf.scene;
        modelRef.current = model;

        // Auto-scale logic
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        const scale = 3.5 / maxDim; 
        model.scale.set(scale, scale, scale);

        const center = box.getCenter(new THREE.Vector3());
        model.position.x = -center.x * scale;
        model.position.y = -box.min.y * scale - 1.6;
        model.position.z = -center.z * scale;

        // VOLUMETRIC CORE MATERIAL — the solid inner body
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

        // Outer Wireframe — subtle cyan grid overlay
        const wireframeMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          wireframe: true,
          transparent: true,
          opacity: 0.08,
          depthTest: true,
          depthWrite: false
        });

        // Clear previous bone mappings
        bonesRef.current.clear();

        // ============================================================
        // Collect meshes and bones FIRST, then process AFTER traverse.
        // This prevents mutating the scene graph during iteration.
        // ============================================================
        const meshesToProcess: { mesh: THREE.Mesh; parent: THREE.Object3D }[] = [];

        model.traverse((child: any) => {
          if ((child as THREE.Mesh).isMesh) {
            // Record the mesh AND its parent so we add the wireframe
            // as a sibling, not at the model root. This ensures the
            // wireframe SkinnedMesh inherits the same world transform
            // and stays in sync with the original mesh.
            meshesToProcess.push({
              mesh: child as THREE.Mesh,
              parent: child.parent || model
            });
          }

          // Map Bones — both models use Mixamo naming convention
          if ((child as THREE.Bone).isBone) {
            const name = child.name.toLowerCase();
            if (name.includes('hips')) bonesRef.current.set('hips', child);
            if (name.includes('spine') && !name.includes('spine1') && !name.includes('spine2')) bonesRef.current.set('spine', child);
            if (name.includes('spine1')) bonesRef.current.set('spine1', child);
            if (name.includes('spine2')) bonesRef.current.set('spine2', child);
            if (name.includes('neck')) bonesRef.current.set('neck', child);
            if (name.includes('head') && !name.includes('top')) bonesRef.current.set('head', child);
            
            if (name.includes('leftshoulder')) bonesRef.current.set('leftShoulder', child);
            if (name.includes('rightshoulder')) bonesRef.current.set('rightShoulder', child);
            
            if (name.includes('leftarm') && !name.includes('forearm')) bonesRef.current.set('leftArm', child);
            if (name.includes('rightarm') && !name.includes('forearm')) bonesRef.current.set('rightArm', child);
            
            if (name.includes('leftforearm')) bonesRef.current.set('leftForearm', child);
            if (name.includes('rightforearm')) bonesRef.current.set('rightForearm', child);
            
            if (name.includes('lefthand') && name === 'mixamorig:lefthand') bonesRef.current.set('leftHand', child);
            if (name.includes('righthand') && name === 'mixamorig:righthand') bonesRef.current.set('rightHand', child);
            
            if (name.includes('leftupleg')) bonesRef.current.set('leftUpLeg', child);
            if (name.includes('rightupleg')) bonesRef.current.set('rightUpLeg', child);
            
            if (name.includes('leftleg') && !name.includes('upleg')) bonesRef.current.set('leftLeg', child);
            if (name.includes('rightleg') && !name.includes('upleg')) bonesRef.current.set('rightLeg', child);
            
            if (name.includes('leftfoot') && !name.includes('toe')) bonesRef.current.set('leftFoot', child);
            if (name.includes('rightfoot') && !name.includes('toe')) bonesRef.current.set('rightFoot', child);
          }
        });

        // Process meshes AFTER traverse is complete
        for (const { mesh, parent } of meshesToProcess) {
          // Dispose of original material and textures to prevent bleed-through
          if (mesh.material) {
            const origMat = mesh.material as THREE.MeshStandardMaterial;
            if (origMat.map) { origMat.map.dispose(); origMat.map = null; }
            if (origMat.emissiveMap) { origMat.emissiveMap.dispose(); origMat.emissiveMap = null; }
            if (origMat.normalMap) { origMat.normalMap.dispose(); origMat.normalMap = null; }
            origMat.dispose();
          }

          if ((mesh as any).isSkinnedMesh) {
            // For SkinnedMesh: create a wireframe overlay that shares the
            // SAME skeleton and is added to the SAME parent node.
            // This ensures identical world transforms so the wireframe
            // deforms perfectly in sync with the inner mesh.
            const skinnedMesh = mesh as THREE.SkinnedMesh;
            const wireframe = new THREE.SkinnedMesh(
              skinnedMesh.geometry,
              wireframeMaterial
            );
            // Copy the local transform so it sits in exactly the same spot
            wireframe.position.copy(skinnedMesh.position);
            wireframe.rotation.copy(skinnedMesh.rotation);
            wireframe.scale.copy(skinnedMesh.scale);
            // Share skeleton and bind to the same bind matrix
            wireframe.bind(skinnedMesh.skeleton, skinnedMesh.bindMatrix.clone());
            wireframe.bindMatrixInverse.copy(skinnedMesh.bindMatrixInverse);
            wireframe.name = 'wireframe_overlay';
            wireframe.frustumCulled = false; // Prevent culling glitches
            // Add as sibling — same parent as original mesh
            parent.add(wireframe);
          } else {
            const wireframeMesh = mesh.clone();
            wireframeMesh.material = wireframeMaterial;
            wireframeMesh.name = 'wireframe_overlay';
            parent.add(wireframeMesh);
          }

          // Apply inner material to the original mesh
          mesh.material = innerMaterial;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.frustumCulled = false; // Prevent culling glitches
        }

        // Stop any built-in animations — we drive bones from metrics
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;
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

    // Animation Loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (containerRef.current && rendererRef.current) {
        try {
          containerRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) { /* ignore */ }
      }
      rendererRef.current?.dispose();
      mixerRef.current = null;
    };
  }, [modelUrl]);

  // Handle Metrics Animation — motion-type-aware
  useEffect(() => {
    if (!metrics || bonesRef.current.size === 0) return;

    const rotateBone = (name: string, axis: 'x' | 'y' | 'z', angleDeg: number, offsetDeg: number = 0, invert: boolean = false) => {
      const bone = bonesRef.current.get(name);
      if (bone) {
        const rad = (angleDeg + offsetDeg) * (Math.PI / 180);
        bone.rotation[axis] = invert ? -rad : rad;
      }
    };

    if (motionType === 'basketball_jumpshot') {
      // ===== BASKETBALL JUMP SHOT ANIMATION =====
      if (modelRef.current) {
        const viewRotationRad = (rotationAngle * Math.PI) / 180;
        const stanceOffset = -Math.PI / 2;
        const hipActionRad = ((90 - metrics.hipRotation) * Math.PI) / 180;
        modelRef.current.rotation.y = viewRotationRad + stanceOffset + (hipActionRad * 0.3);
      }

      // Spine — slight backward lean during jump
      const spineTilt = Math.min(metrics.spineAngle, 12);
      rotateBone('spine', 'x', spineTilt, 0, false);
      
      // Shoulders — less rotation than football (basketball is more frontal)
      rotateBone('spine', 'y', metrics.shoulderRotation * 0.3, -90, true);

      // Right Arm (Shooting arm)
      rotateBone('rightArm', 'x', metrics.rightShoulderAngle, 0, false);
      const shootingAbduction = Math.max(-20, Math.min(20, (90 - metrics.shoulderRotation) * 0.3));
      rotateBone('rightArm', 'z', shootingAbduction, 0, false);
      rotateBone('rightForearm', 'x', metrics.rightElbowAngle, -180, false);

      // Left Arm (Guide hand)
      rotateBone('leftArm', 'z', metrics.leftShoulderAngle, -90, false);
      rotateBone('leftArm', 'x', metrics.leftShoulderAngle * 0.5, 0, false);
      rotateBone('leftForearm', 'x', metrics.leftElbowAngle, -180, false);

      // Legs
      rotateBone('rightLeg', 'x', metrics.rightKneeFlexion, -180, false);
      rotateBone('leftLeg', 'x', metrics.leftKneeFlexion, -180, false);
      
    } else {
      // ===== FOOTBALL THROW / DEFAULT ANIMATION =====
      if (modelRef.current) {
        const viewRotationRad = (rotationAngle * Math.PI) / 180;
        const stanceOffset = -Math.PI / 2;
        const hipActionRad = ((90 - metrics.hipRotation) * Math.PI) / 180;
        modelRef.current.rotation.y = viewRotationRad + stanceOffset + (hipActionRad * 0.5);
      }

      // Spine
      const spineTilt = metrics.spineAngle > 15 ? 15 : metrics.spineAngle; 
      rotateBone('spine', 'x', spineTilt, 0, false);

      // Shoulders
      rotateBone('spine', 'y', metrics.shoulderRotation, -90, true);

      // Right Arm (Throwing Arm)
      rotateBone('rightArm', 'x', metrics.rightShoulderAngle, 0, false);
      const armAdduction = (90 - metrics.shoulderRotation) - 45;
      rotateBone('rightArm', 'z', armAdduction, 0, false);
      rotateBone('rightForearm', 'x', metrics.rightElbowAngle, -180, false);

      // Left Arm (Non-throwing)
      rotateBone('leftArm', 'z', metrics.leftShoulderAngle, -90, false);
      rotateBone('leftArm', 'x', 20, 0, false);
      rotateBone('leftForearm', 'x', metrics.leftElbowAngle, -180, false);

      // Legs
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
        overflow: 'hidden'
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

export default Hologram3D;
