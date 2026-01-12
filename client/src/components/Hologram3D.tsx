import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Hologram3DProps {
  landmarks: any[];
  rotationAngle?: number;
  isRightHanded?: boolean;
  metrics?: {
    hipRotation?: number;
    shoulderRotation?: number;
    rightElbowAngle?: number;
    leftElbowAngle?: number;
    rightKneeFlexion?: number;
    leftKneeFlexion?: number;
    spineAngle?: number;
    rightShoulderAngle?: number;
    leftShoulderAngle?: number;
    footPositioning?: number;
    weightTransfer?: number;
  };
  onRotationChange?: (angle: number) => void;
}

const Hologram3D: React.FC<Hologram3DProps> = ({
  landmarks,
  rotationAngle = 0,
  isRightHanded = true,
  metrics,
  onRotationChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const bonesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const animationFrameRef = useRef<number>(0);

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
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 2.5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Edge-glow shader material
    const edgeGlowMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float edge = 1.0 - dot(normalize(vec3(0.0, 0.0, 1.0)), vNormal);
          edge = pow(edge, 1.2);
          float glow = edge * 2.0;
          gl_FragColor = vec4(glowColor * glow, edge * 0.9);
        }
      `,
      uniforms: {
        glowColor: { value: new THREE.Color(0x00ffff) }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });

    // Helper functions
    const createJoint = (radius: number, name: string) => {
      const geometry = new THREE.SphereGeometry(radius, 8, 8);
      const mesh = new THREE.Mesh(geometry, edgeGlowMaterial);
      mesh.name = name;
      return mesh;
    };

    const createLimb = (radius: number, height: number, name: string) => {
      const geometry = new THREE.CylinderGeometry(radius, radius, height, 8, 1);
      const mesh = new THREE.Mesh(geometry, edgeGlowMaterial);
      mesh.position.y = height / 2;
      mesh.name = name;
      return mesh;
    };

    const createFoot = (name: string) => {
      const geometry = new THREE.BoxGeometry(0.08, 0.05, 0.15);
      const mesh = new THREE.Mesh(geometry, edgeGlowMaterial);
      mesh.name = name;
      return mesh;
    };

    // Create model group (for 3D rotation)
    const modelGroup = new THREE.Group();
    // Rotate 180 degrees on X-axis to fix orientation (head up, feet down)
    modelGroup.rotation.x = Math.PI;
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // TORSO - Larger proportions
    const hips = createJoint(0.12, 'hips');
    hips.position.set(0, -0.15, 0);
    modelGroup.add(hips);
    bonesRef.current.set('hips', hips);

    // Spine - connects hips to chest
    const spine = createLimb(0.11, 0.35, 'spine');
    spine.position.y = 0.175;
    hips.add(spine);
    bonesRef.current.set('spine', spine);

    // Chest - larger upper body
    const chest = createJoint(0.13, 'chest');
    chest.position.y = 0.35;
    spine.add(chest);
    bonesRef.current.set('chest', chest);

    // Neck
    const neck = createLimb(0.08, 0.15, 'neck');
    neck.position.y = 0.075;
    chest.add(neck);
    bonesRef.current.set('neck', neck);

    // Head
    const head = createJoint(0.12, 'head');
    head.position.y = 0.15;
    neck.add(head);
    bonesRef.current.set('head', head);

    // RIGHT ARM - Proper throwing mechanics
    const rightShoulder = createJoint(0.105, 'rightShoulder');
    rightShoulder.position.set(0.18, 0.25, 0);
    chest.add(rightShoulder);
    bonesRef.current.set('rightShoulder', rightShoulder);

    const rightUpperArm = createLimb(0.08, 0.35, 'rightUpperArm');
    rightUpperArm.position.y = 0.175;
    rightShoulder.add(rightUpperArm);
    bonesRef.current.set('rightUpperArm', rightUpperArm);

    const rightElbow = createJoint(0.075, 'rightElbow');
    rightElbow.position.y = 0.35;
    rightUpperArm.add(rightElbow);
    bonesRef.current.set('rightElbow', rightElbow);

    const rightForearm = createLimb(0.065, 0.32, 'rightForearm');
    rightForearm.position.y = 0.16;
    rightElbow.add(rightForearm);
    bonesRef.current.set('rightForearm', rightForearm);

    const rightWrist = createJoint(0.06, 'rightWrist');
    rightWrist.position.y = 0.32;
    rightForearm.add(rightWrist);
    bonesRef.current.set('rightWrist', rightWrist);

    const rightHand = createLimb(0.05, 0.12, 'rightHand');
    rightHand.position.y = 0.06;
    rightWrist.add(rightHand);
    bonesRef.current.set('rightHand', rightHand);

    // LEFT ARM - Mirror of right
    const leftShoulder = createJoint(0.105, 'leftShoulder');
    leftShoulder.position.set(-0.18, 0.25, 0);
    chest.add(leftShoulder);
    bonesRef.current.set('leftShoulder', leftShoulder);

    const leftUpperArm = createLimb(0.08, 0.35, 'leftUpperArm');
    leftUpperArm.position.y = 0.175;
    leftShoulder.add(leftUpperArm);
    bonesRef.current.set('leftUpperArm', leftUpperArm);

    const leftElbow = createJoint(0.075, 'leftElbow');
    leftElbow.position.y = 0.35;
    leftUpperArm.add(leftElbow);
    bonesRef.current.set('leftElbow', leftElbow);

    const leftForearm = createLimb(0.065, 0.32, 'leftForearm');
    leftForearm.position.y = 0.16;
    leftElbow.add(leftForearm);
    bonesRef.current.set('leftForearm', leftForearm);

    const leftWrist = createJoint(0.06, 'leftWrist');
    leftWrist.position.y = 0.32;
    leftForearm.add(leftWrist);
    bonesRef.current.set('leftWrist', leftWrist);

    const leftHand = createLimb(0.05, 0.12, 'leftHand');
    leftHand.position.y = 0.06;
    leftWrist.add(leftHand);
    bonesRef.current.set('leftHand', leftHand);

    // LEGS
    const leftHipJoint = createJoint(0.095, 'leftHipJoint');
    leftHipJoint.position.set(-0.16, -0.12, 0);
    hips.add(leftHipJoint);
    bonesRef.current.set('leftHipJoint', leftHipJoint);

    const leftThigh = createLimb(0.095, 0.48, 'leftThigh');
    leftThigh.position.y = 0.24;
    leftHipJoint.add(leftThigh);
    bonesRef.current.set('leftThigh', leftThigh);

    const leftKnee = createJoint(0.085, 'leftKnee');
    leftKnee.position.y = 0.48;
    leftThigh.add(leftKnee);
    bonesRef.current.set('leftKnee', leftKnee);

    const leftShin = createLimb(0.075, 0.42, 'leftShin');
    leftShin.position.y = 0.21;
    leftKnee.add(leftShin);
    bonesRef.current.set('leftShin', leftShin);

    const leftAnkle = createJoint(0.075, 'leftAnkle');
    leftAnkle.position.y = 0.42;
    leftShin.add(leftAnkle);
    bonesRef.current.set('leftAnkle', leftAnkle);

    const leftFoot = createFoot('leftFoot');
    leftFoot.position.set(0, -0.1, 0.1);
    leftAnkle.add(leftFoot);
    bonesRef.current.set('leftFoot', leftFoot);

    // RIGHT LEG
    const rightHipJoint = createJoint(0.095, 'rightHipJoint');
    rightHipJoint.position.set(0.16, -0.12, 0);
    hips.add(rightHipJoint);
    bonesRef.current.set('rightHipJoint', rightHipJoint);

    const rightThigh = createLimb(0.095, 0.48, 'rightThigh');
    rightThigh.position.y = 0.24;
    rightHipJoint.add(rightThigh);
    bonesRef.current.set('rightThigh', rightThigh);

    const rightKnee = createJoint(0.085, 'rightKnee');
    rightKnee.position.y = 0.48;
    rightThigh.add(rightKnee);
    bonesRef.current.set('rightKnee', rightKnee);

    const rightShin = createLimb(0.075, 0.42, 'rightShin');
    rightShin.position.y = 0.21;
    rightKnee.add(rightShin);
    bonesRef.current.set('rightShin', rightShin);

    const rightAnkle = createJoint(0.075, 'rightAnkle');
    rightAnkle.position.y = 0.42;
    rightShin.add(rightAnkle);
    bonesRef.current.set('rightAnkle', rightAnkle);

    const rightFoot = createFoot('rightFoot');
    rightFoot.position.set(0, -0.1, 0.1);
    rightAnkle.add(rightFoot);
    bonesRef.current.set('rightFoot', rightFoot);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00ffff, 5, 25);
    cyanLight.position.set(2, 1, 3);
    scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xff00ff, 3, 20);
    magentaLight.position.set(-2, -1, 2);
    scene.add(magentaLight);

    const rimLight = new THREE.PointLight(0x0088ff, 2.5, 15);
    rimLight.position.set(0, 0, -3);
    scene.add(rimLight);

    // Animation loop
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
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  // Update bones based on metrics
  useEffect(() => {
    if (!metrics || !bonesRef.current) return;

    // Hip rotation (Y-axis) - rotate the entire lower body
    const hipRotationRad = (metrics.hipRotation || 0) * (Math.PI / 180);
    const hipsNode = bonesRef.current.get('hips');
    if (hipsNode) {
      hipsNode.rotation.y = hipRotationRad;
    }

    // Spine angle (X-axis for forward lean)
    const spineNode = bonesRef.current.get('spine');
    if (spineNode) {
      spineNode.rotation.x = (metrics.spineAngle || 0) * (Math.PI / 180);
    }

    // Chest/shoulder rotation (Y-axis, relative to hips)
    const shoulderRotationRad = (metrics.shoulderRotation || 0) * (Math.PI / 180);
    const chestNode = bonesRef.current.get('chest');
    if (chestNode) {
      chestNode.rotation.y = shoulderRotationRad - hipRotationRad;
    }

    // RIGHT SHOULDER - raise arm for throwing (X-axis)
    const rightShoulderNode = bonesRef.current.get('rightShoulder');
    if (rightShoulderNode) {
      const shoulderRaise = ((metrics.rightShoulderAngle || 0) - 45) * (Math.PI / 180);
      rightShoulderNode.rotation.x = shoulderRaise;
      // Add Y-axis rotation for external rotation in throwing
      rightShoulderNode.rotation.z = 0.3; // External rotation
    }

    // LEFT SHOULDER - lower for balance
    const leftShoulderNode = bonesRef.current.get('leftShoulder');
    if (leftShoulderNode) {
      const shoulderRaise = ((metrics.leftShoulderAngle || 0) - 45) * (Math.PI / 180);
      leftShoulderNode.rotation.x = -shoulderRaise;
    }

    // RIGHT ELBOW - flexion/extension (X-axis for forward/backward motion)
    const rightElbowNode = bonesRef.current.get('rightElbow');
    if (rightElbowNode) {
      // 90° = straight, 0° = fully bent
      const elbowFlexion = ((metrics.rightElbowAngle || 90) - 90) * (Math.PI / 180);
      rightElbowNode.rotation.x = -elbowFlexion; // Negative for proper bending
    }

    // LEFT ELBOW - flexion/extension
    const leftElbowNode = bonesRef.current.get('leftElbow');
    if (leftElbowNode) {
      const elbowFlexion = ((metrics.leftElbowAngle || 90) - 90) * (Math.PI / 180);
      leftElbowNode.rotation.x = elbowFlexion;
    }

    // RIGHT KNEE flexion (X-axis)
    const rightKneeNode = bonesRef.current.get('rightKnee');
    if (rightKneeNode) {
      const kneeFlexion = (180 - (metrics.rightKneeFlexion || 160)) * (Math.PI / 180);
      rightKneeNode.rotation.x = kneeFlexion;
    }

    // LEFT KNEE flexion (X-axis)
    const leftKneeNode = bonesRef.current.get('leftKnee');
    if (leftKneeNode) {
      const kneeFlexion = (180 - (metrics.leftKneeFlexion || 160)) * (Math.PI / 180);
      leftKneeNode.rotation.x = kneeFlexion;
    }
  }, [metrics]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle 3D rotation (separate from hip rotation)
  useEffect(() => {
    if (modelGroupRef.current) {
      const rotationRad = (rotationAngle * Math.PI) / 180;
      modelGroupRef.current.rotation.y = rotationRad;
    }
  }, [rotationAngle]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    />
  );
};

export default Hologram3D;
