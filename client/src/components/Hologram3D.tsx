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

    // Camera - Macro Mode (Close up)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.8, 4.5); // Closer and higher
    camera.lookAt(0, 0.8, 0); // Look at chest/head area
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

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Reduced lighting intensity to prevent washout
    const mainLight = new THREE.DirectionalLight(0x00ffff, 0.8); // Reduced from 2
    mainLight.position.set(2, 2, 5);
    scene.add(mainLight);

    // Removed pink rim light to keep it pure blue
    // const rimLight = new THREE.SpotLight(0xff00ff, 5);
    // rimLight.position.set(-2, 1, -2);
    // rimLight.lookAt(0, 0, 0);
    // scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x0000ff, 0.5); // Deep blue fill, reduced intensity
    fillLight.position.set(0, -2, 2);
    scene.add(fillLight);

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
        model.position.y = -box.min.y * scale - 1.6; // Shift up so feet are visible
        model.position.z = -center.z * scale;

        // Apply Materials
        // Inner Body (Solid Ghost)
        const innerMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x0000ff, // Pure Deep Blue
          emissive: 0x0000aa, // Darker blue glow
          emissiveIntensity: 0.2, // Very low emissive to avoid whiteout
          metalness: 0.6, // Reduced metalness to reduce white reflections
          roughness: 0.7, // Increased roughness to diffuse light (less shiny/white)
          transparent: true,
          opacity: 0.85, // Slightly more opaque for better visibility
          transmission: 0.2,
          side: THREE.DoubleSide
        });

        // Outer Wireframe (Neon Cyan)
        const wireframeMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          wireframe: true,
          transparent: true,
          opacity: 0.4
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
       // Base rotation + hip rotation
       const baseRot = (rotationAngle * Math.PI) / 180;
       
       // CORRECTED LOGIC (User Request):
       // 90° = Closed (Sideways to target) -> Model should be at 90° relative to camera
       // 0° = Square (Facing target) -> Model should be at 0° relative to camera
       // So we map 90 -> 90 (PI/2) and 0 -> 0 (0)
       // Formula: hipRotation directly maps to model rotation
       
       const hipRotRad = (metrics.hipRotation * Math.PI) / 180;
       modelRef.current.rotation.y = baseRot + hipRotRad;
    }

    // Spine (Lean)
    // Map spine angle (0-180) to spine bone z-axis (side lean) or x-axis (forward lean)
    // Usually spine angle in throw is side lean
    rotateBone('spine', 'z', metrics.spineAngle, -90, true); 

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
    
    // 1. Lift Arm (Abduction)
    rotateBone('rightArm', 'z', metrics.rightShoulderAngle, -90, true);
    
    // 2. Horizontal Adduction (Bring arm across body)
    // FIX: Ensure arm stays wide in closed stance (90 deg rotation)
    // When shoulderRotation is 90 (closed), arm should be back/wide (-45)
    // When shoulderRotation is 0 (square), arm should be forward (+45)
    // We need to invert the relationship: Higher rotation (90) = More back (-45)
    // Formula: (90 - shoulderRotation) - 45
    rotateBone('rightArm', 'x', (90 - metrics.shoulderRotation), -45, false);

    // 3. Elbow Flexion
    // Mixamo Forearm: X is usually flexion. If Z was twisting, revert to X but check direction.
    // Let's try X again but with different offset/invert
    rotateBone('rightForearm', 'x', metrics.rightElbowAngle, -180, false);

    // Left Arm (Non-throwing)
    rotateBone('leftArm', 'z', metrics.leftShoulderAngle, -90, false);
    rotateBone('leftArm', 'x', 20, 0, false); // Slight forward pose
    rotateBone('leftForearm', 'x', metrics.leftElbowAngle, -180, false);

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
