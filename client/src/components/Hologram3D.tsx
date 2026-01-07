import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

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
  const timeRef = useRef(0);
  const animationFrameRef = useRef<number>(0);
  const bonesRef = useRef<Map<string, THREE.Object3D>>(new Map());

  // Initialize Scene only once
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27); // Deep dark blue background
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0.0, 2.2); // Centered vertically
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Build High-Fidelity Wireframe Model with Edge-Glow ---
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    // === ENHANCED EDGE-GLOW SHADER MATERIAL ===
    const edgeGlowMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          // Calculate edge intensity based on view angle
          float edge = 1.0 - dot(normalize(vec3(0.0, 0.0, 1.0)), vNormal);
          
          // Enhance edge brightness with power function
          edge = pow(edge, 1.2);
          
          // Add extra glow with brighter intensity
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

    // Bright wireframe material
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });

    // Bright joint material
    const jointMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 1.0
    });

    // Helper to create body parts with edge glow
    const createLimb = (radius: number, length: number, name: string) => {
      const geometry = new THREE.CylinderGeometry(radius, radius * 0.8, length, 16, 8, true);
      
      // Main edge-glow mesh
      const mesh = new THREE.Mesh(geometry, edgeGlowMaterial);
      
      // Add wireframe overlay for extra definition
      const wireframeGeometry = new THREE.CylinderGeometry(radius, radius * 0.8, length, 16, 8, true);
      const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
      wireframeMesh.scale.multiplyScalar(0.95);
      mesh.add(wireframeMesh);

      mesh.name = name;
      return mesh;
    };

    const createJoint = (radius: number, name: string) => {
      const geometry = new THREE.IcosahedronGeometry(radius, 2);
      
      // Edge-glow mesh
      const mesh = new THREE.Mesh(geometry, edgeGlowMaterial);
      
      // Bright joint overlay
      const jointGeometry = new THREE.IcosahedronGeometry(radius * 0.9, 2);
      const jointMesh = new THREE.Mesh(jointGeometry, jointMaterial);
      mesh.add(jointMesh);

      mesh.name = name;
      return mesh;
    };

    const createFoot = (name: string) => {
      // Foot as a flat rectangular shape
      const geometry = new THREE.BoxGeometry(0.12, 0.08, 0.28);
      const mesh = new THREE.Mesh(geometry, edgeGlowMaterial);
      
      // Add wireframe overlay
      const wireframeGeometry = new THREE.BoxGeometry(0.12, 0.08, 0.28);
      const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
      wireframeMesh.scale.multiplyScalar(0.95);
      mesh.add(wireframeMesh);
      
      mesh.name = name;
      return mesh;
    };

    // --- Construct Skeleton Hierarchy ---
    // Hips (Root)
    const hips = createJoint(0.15, 'hips');
    modelGroup.add(hips);
    bonesRef.current.set('hips', hips);

    // Spine
    const spine = createLimb(0.12, 0.5, 'spine');
    spine.position.y = 0.25;
    hips.add(spine);
    bonesRef.current.set('spine', spine);

    // Chest
    const chest = createJoint(0.14, 'chest');
    chest.position.y = 0.25;
    spine.add(chest);
    bonesRef.current.set('chest', chest);

    // Neck
    const neck = createLimb(0.05, 0.15, 'neck');
    neck.position.y = 0.1;
    chest.add(neck);
    bonesRef.current.set('neck', neck);

    // Head
    const head = createJoint(0.18, 'head');
    head.position.y = 0.15;
    neck.add(head);
    bonesRef.current.set('head', head);

    // Shoulders
    const leftShoulder = createJoint(0.08, 'leftShoulder');
    leftShoulder.position.set(-0.25, 0.05, 0);
    chest.add(leftShoulder);
    bonesRef.current.set('leftShoulder', leftShoulder);

    const rightShoulder = createJoint(0.08, 'rightShoulder');
    rightShoulder.position.set(0.25, 0.05, 0);
    chest.add(rightShoulder);
    bonesRef.current.set('rightShoulder', rightShoulder);

    // Arms
    const leftUpperArm = createLimb(0.06, 0.35, 'leftUpperArm');
    leftUpperArm.position.y = -0.175;
    leftShoulder.add(leftUpperArm);
    bonesRef.current.set('leftUpperArm', leftUpperArm);

    const leftElbow = createJoint(0.07, 'leftElbow');
    leftElbow.position.y = -0.175;
    leftUpperArm.add(leftElbow);
    bonesRef.current.set('leftElbow', leftElbow);

    const leftForearm = createLimb(0.05, 0.3, 'leftForearm');
    leftForearm.position.y = -0.15;
    leftElbow.add(leftForearm);
    bonesRef.current.set('leftForearm', leftForearm);

    const rightUpperArm = createLimb(0.06, 0.35, 'rightUpperArm');
    rightUpperArm.position.y = -0.175;
    rightShoulder.add(rightUpperArm);
    bonesRef.current.set('rightUpperArm', rightUpperArm);

    const rightElbow = createJoint(0.07, 'rightElbow');
    rightElbow.position.y = -0.175;
    rightUpperArm.add(rightElbow);
    bonesRef.current.set('rightElbow', rightElbow);

    const rightForearm = createLimb(0.05, 0.3, 'rightForearm');
    rightForearm.position.y = -0.15;
    rightElbow.add(rightForearm);
    bonesRef.current.set('rightForearm', rightForearm);

    // Legs with feet
    const leftHipJoint = createJoint(0.09, 'leftHipJoint');
    leftHipJoint.position.set(-0.15, -0.1, 0);
    hips.add(leftHipJoint);
    bonesRef.current.set('leftHipJoint', leftHipJoint);

    const leftThigh = createLimb(0.09, 0.45, 'leftThigh');
    leftThigh.position.y = -0.225;
    leftHipJoint.add(leftThigh);
    bonesRef.current.set('leftThigh', leftThigh);

    const leftKnee = createJoint(0.08, 'leftKnee');
    leftKnee.position.y = -0.225;
    leftThigh.add(leftKnee);
    bonesRef.current.set('leftKnee', leftKnee);

    const leftShin = createLimb(0.07, 0.4, 'leftShin');
    leftShin.position.y = -0.2;
    leftKnee.add(leftShin);
    bonesRef.current.set('leftShin', leftShin);

    // LEFT FOOT
    const leftAnkle = createJoint(0.07, 'leftAnkle');
    leftAnkle.position.y = -0.2;
    leftShin.add(leftAnkle);
    bonesRef.current.set('leftAnkle', leftAnkle);

    const leftFoot = createFoot('leftFoot');
    leftFoot.position.set(0, -0.1, 0.1);
    leftAnkle.add(leftFoot);
    bonesRef.current.set('leftFoot', leftFoot);

    // Right leg
    const rightHipJoint = createJoint(0.09, 'rightHipJoint');
    rightHipJoint.position.set(0.15, -0.1, 0);
    hips.add(rightHipJoint);
    bonesRef.current.set('rightHipJoint', rightHipJoint);

    const rightThigh = createLimb(0.09, 0.45, 'rightThigh');
    rightThigh.position.y = -0.225;
    rightHipJoint.add(rightThigh);
    bonesRef.current.set('rightThigh', rightThigh);

    const rightKnee = createJoint(0.08, 'rightKnee');
    rightKnee.position.y = -0.225;
    rightThigh.add(rightKnee);
    bonesRef.current.set('rightKnee', rightKnee);

    const rightShin = createLimb(0.07, 0.4, 'rightShin');
    rightShin.position.y = -0.2;
    rightKnee.add(rightShin);
    bonesRef.current.set('rightShin', rightShin);

    // RIGHT FOOT
    const rightAnkle = createJoint(0.07, 'rightAnkle');
    rightAnkle.position.y = -0.2;
    rightShin.add(rightAnkle);
    bonesRef.current.set('rightAnkle', rightAnkle);

    const rightFoot = createFoot('rightFoot');
    rightFoot.position.set(0, -0.1, 0.1);
    rightAnkle.add(rightFoot);
    bonesRef.current.set('rightFoot', rightFoot);

    // === ENHANCED LIGHTING FOR HOLOGRAPHIC EFFECT ===
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Primary cyan point light - brighter
    const cyanLight = new THREE.PointLight(0x00ffff, 4, 20);
    cyanLight.position.set(2, 1, 3);
    scene.add(cyanLight);

    // Secondary magenta light for contrast
    const magentaLight = new THREE.PointLight(0xff00ff, 2.5, 18);
    magentaLight.position.set(-2, -1, 2);
    scene.add(magentaLight);

    // Back light for rim effect
    const rimLight = new THREE.PointLight(0x0088ff, 2, 12);
    rimLight.position.set(0, 0, -3);
    scene.add(rimLight);

    // Animation Loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.01;

      if (modelGroupRef.current && metrics) {
        // Apply hip rotation (Y-axis)
        const hipRotationRad = (metrics.hipRotation - 90) * (Math.PI / 180);
        modelGroupRef.current.rotation.y = hipRotationRad;

        // Apply shoulder rotation relative to hips
        const shoulderRotationRad = (metrics.shoulderRotation - 90) * (Math.PI / 180);
        const chestNode = bonesRef.current.get('chest');
        if (chestNode) {
          chestNode.rotation.y = shoulderRotationRad - hipRotationRad;
        }

        // Right elbow flexion
        const rightElbowNode = bonesRef.current.get('rightElbow');
        if (rightElbowNode) {
          rightElbowNode.rotation.z = (metrics.rightElbowAngle - 90) * (Math.PI / 180);
        }

        // Left elbow flexion
        const leftElbowNode = bonesRef.current.get('leftElbow');
        if (leftElbowNode) {
          leftElbowNode.rotation.z = -(metrics.leftElbowAngle - 90) * (Math.PI / 180);
        }

        // Right knee flexion
        const rightKneeNode = bonesRef.current.get('rightKnee');
        if (rightKneeNode) {
          rightKneeNode.rotation.x = (metrics.rightKneeFlexion - 180) * (Math.PI / 180);
        }

        // Left knee flexion
        const leftKneeNode = bonesRef.current.get('leftKnee');
        if (leftKneeNode) {
          leftKneeNode.rotation.x = (metrics.leftKneeFlexion - 180) * (Math.PI / 180);
        }

        // Spine angle
        const spineNode = bonesRef.current.get('spine');
        if (spineNode) {
          spineNode.rotation.z = metrics.spineAngle * (Math.PI / 180);
        }
      }

      // Subtle idle animation
      if (modelGroupRef.current) {
        modelGroupRef.current.position.y = Math.sin(timeRef.current * 0.5) * 0.01;
      }

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

  // Handle rotation angle changes
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
