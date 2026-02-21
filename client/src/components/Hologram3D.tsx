import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Hologram3DProps {
  landmarks: any[];
  rotationAngle?: number;
  isRightHanded?: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Initialize Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27); // Deep dark blue background
    sceneRef.current = scene;

    // Camera - Full Body Mode (Pan Down to Feet)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // Move camera DOWN (Y: 0.5) to look at legs/feet
    camera.position.set(0, 0.5, 4.5); 
    camera.lookAt(0, 0.5, 0); // Look at knees
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // VOLUMETRIC LIGHTING SETUP
    const ambientLight = new THREE.AmbientLight(0x110022, 0.4); // Deep Purple Ambient
    scene.add(ambientLight);

    // Main Light (Cool Blue/Cyan Mix)
    const mainLight = new THREE.DirectionalLight(0x4488ff, 1.5);
    mainLight.position.set(0, 5, 5);
    scene.add(mainLight);

    // Rim Light Left (Cyan Edge)
    const rimLightLeft = new THREE.SpotLight(0x00ffff, 5.0);
    rimLightLeft.position.set(-5, 2, -5);
    rimLightLeft.lookAt(0, 0, 0);
    scene.add(rimLightLeft);

    // Rim Light Right (Intense Magenta Edge)
    const rimLightRight = new THREE.SpotLight(0xff00ff, 6.0); // Strong Magenta rim to pop the core
    rimLightRight.position.set(5, 2, -5);
    rimLightRight.lookAt(0, 0, 0);
    scene.add(rimLightRight);

    // Load Model
    const loader = new GLTFLoader();
    loader.load(
      '/Hologram1.0.glb',
      (gltf: any) => {
        const model = gltf.scene;
        modelRef.current = model;

        // Auto-scale logic
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // Scale to be huge (Macro Mode)
        const scale = 3.5 / maxDim; 
        model.scale.set(scale, scale, scale);

        // Center the model vertically
        const center = box.getCenter(new THREE.Vector3());
        model.position.x = -center.x * scale;
        // RESET MODEL TO GROUND (Fix Jumping)
        model.position.y = -box.min.y * scale - 1.6; // Back to ground level
        model.position.z = -center.z * scale;

        // Apply Materials
        // Inner Body (Solid Ghost)
        // VOLUMETRIC CORE MATERIAL (Rich Purple Mass)
        const innerMaterial = new THREE.MeshStandardMaterial({
          color: 0x3a006e, // Richer Deep Purple Base
          emissive: 0x220044, // Stronger Purple Glow
          emissiveIntensity: 0.8, // More vibrant core
          metalness: 0.6, // Less metallic to show color better
          roughness: 0.4, // Catch more light
          transparent: true,
          opacity: 0.9, // Almost solid to be the main focus
          side: THREE.DoubleSide
        });

        // Outer Wireframe (Barely-There Digital Edge)
        const wireframeMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ffff, // Cyan Highlights
          wireframe: true,
          transparent: true,
          opacity: 0.1, // Just a whisper of structure
          depthTest: true,
          depthWrite: false
        });

        model.traverse((child: any) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            
            // Clone mesh for wireframe overlay
            const wireframeMesh = mesh.clone();
            wireframeMesh.material = wireframeMaterial;
            model.add(wireframeMesh);

            // Apply inner material to original mesh
            mesh.material = innerMaterial;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }

          // Map Bones
          if ((child as THREE.Bone).isBone) {
            // Map standard Mixamo names to our internal map
            // We store the bone reference for animation
            const name = child.name.toLowerCase();
            console.log('Bone found:', name); // LOG BONES FOR DEBUGGING
            if (name.includes('hips')) bonesRef.current.set('hips', child);
            if (name.includes('spine')) bonesRef.current.set('spine', child);
            if (name.includes('neck') || name.includes('head')) bonesRef.current.set('head', child);
            
            if (name.includes('leftshoulder')) bonesRef.current.set('leftShoulder', child);
            if (name.includes('rightshoulder')) bonesRef.current.set('rightShoulder', child);
            
            if (name.includes('leftarm')) bonesRef.current.set('leftArm', child);
            if (name.includes('rightarm')) bonesRef.current.set('rightArm', child);
            
            if (name.includes('leftforearm')) bonesRef.current.set('leftForearm', child);
            if (name.includes('rightforearm')) bonesRef.current.set('rightForearm', child);
            
            if (name.includes('leftupleg')) bonesRef.current.set('leftUpLeg', child);
            if (name.includes('rightupleg')) bonesRef.current.set('rightUpLeg', child);
            
            if (name.includes('leftleg')) bonesRef.current.set('leftLeg', child);
            if (name.includes('rightleg')) bonesRef.current.set('rightLeg', child);
          }
        });

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
        // Rotate model slowly if no metrics
        if (modelRef.current && !metrics) {
           // modelRef.current.rotation.y += 0.002;
        }
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  // Handle Metrics Animation
  useEffect(() => {
    if (!metrics || bonesRef.current.size === 0) return;

    // Helper to safely rotate bone
    const rotateBone = (name: string, axis: 'x' | 'y' | 'z', angleDeg: number, offsetDeg: number = 0, invert: boolean = false) => {
      const bone = bonesRef.current.get(name);
      if (bone) {
        const rad = (angleDeg + offsetDeg) * (Math.PI / 180);
        bone.rotation[axis] = invert ? -rad : rad;
      }
    };

    // --- Apply Metrics to Skeleton ---
    
    // Hips (Global Rotation)
    // We rotate the whole model group for hip rotation usually, or the hip bone
    if (modelRef.current) {
       // FIX: Rotate entire model 180 degrees to face Left (Target)
       // Base rotation: -90 degrees (Facing Left)
       // As hips open (metric 0 -> 90), we rotate towards 0 (Facing Front)
       // NOTE: We apply this to the HIP BONE or internal group, NOT the modelRef directly
       // because modelRef is controlled by the OrbitControls/View Angle slider.
       // However, since we don't have a separate hip bone reference easily accessible here without traversing,
       // we will apply this rotation offset to the *bones* themselves or a child group if possible.
       // For now, let's try to respect the `rotationAngle` prop passed from parent (View Angle slider).
       
       const viewRotationRad = (rotationAngle * Math.PI) / 180;
       const stanceOffset = -Math.PI / 2; // -90 degrees (Facing Left/Target)
       const hipActionRad = ((90 - metrics.hipRotation) * Math.PI) / 180; // Invert logic
       
       // Combine: View Angle + Stance Offset + Animation
       modelRef.current.rotation.y = viewRotationRad + stanceOffset + (hipActionRad * 0.5);
    }

    // Spine (Posture)
    // "Stand Tall" -> Spine Angle should be close to 0 (upright)
    // Only allow slight forward lean (5-15 deg) in Follow-Through phase
    // Force upright posture for Neutral/Cocking phases
    const spineTilt = metrics.spineAngle > 15 ? 15 : metrics.spineAngle; 
    rotateBone('spine', 'x', spineTilt, 0, false); // Forward/Back tilt (X-axis)

    // Shoulders
    // Shoulder rotation usually means chest rotation relative to hips
    // We already rotated hips, so we rotate spine/chest further
    rotateBone('spine', 'y', metrics.shoulderRotation, -90, true);

    // Arms (The Throw)
    // Right Arm (Throwing Arm)
    // Shoulder Angle: 0 (down) to 180 (up) -> Z axis
    // Right Arm (Throwing Arm)
    // Shoulder Angle: 0 (down) to 180 (up) -> Z axis
    // NOTE: Mixamo rigs often have X as the twist axis and Z as the lift axis
    // Right Arm (Throwing Arm)
    // RE-CALIBRATION: 
    // Shoulder Z: Abduction (Lift arm up/down)
    // Shoulder X: Flexion/Extension (Move arm forward/back)
    // Shoulder Y: Internal/External Rotation (Twist)
    
    // STANDARD THROWING POSE (Reverted T-Pose)
    // Arms start at chest/ready position, not extended T-Pose.
    
    // Right Arm (Throwing Arm)
    rotateBone('rightArm', 'x', metrics.rightShoulderAngle, 0, false); // Lift
    // Map Adduction: 90->0 rotation maps to -45->+45 arm angle
    const armAdduction = (90 - metrics.shoulderRotation) - 45;
    rotateBone('rightArm', 'z', armAdduction, 0, false);
    rotateBone('rightForearm', 'x', metrics.rightElbowAngle, -180, false);

    // Left Arm (Non-throwing)
    rotateBone('leftArm', 'z', metrics.leftShoulderAngle, -90, false);
    rotateBone('leftArm', 'x', 20, 0, false); // Slight forward pose
    rotateBone('leftForearm', 'x', metrics.leftElbowAngle, -180, false);

    // 3. Elbow Flexion (Handled above in new logic)
    // rotateBone('rightForearm', 'x', metrics.rightElbowAngle, -180, false);

    // Left Arm (Handled above in new logic)
    // rotateBone('leftArm', 'z', metrics.leftShoulderAngle, -90, false);
    // rotateBone('leftArm', 'x', 20, 0, false); // Slight forward pose
    // rotateBone('leftForearm', 'x', metrics.leftElbowAngle, -180, false);

    // Legs (Stance)
    // Knee Flexion: 180 (straight) to 90 (bent) -> X axis
    rotateBone('rightLeg', 'x', metrics.rightKneeFlexion, -180, false);
    rotateBone('leftLeg', 'x', metrics.leftKneeFlexion, -180, false);

  }, [metrics, rotationAngle]);

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
