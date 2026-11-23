import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { retargetClip } from "three/examples/jsm/utils/SkeletonUtils.js";

const MODEL_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143408740/Gd6AiijCmPwLtcbfaErCFP/MaleHologram_quant_d74b85d9.glb";
const FBX_URL = "/manus-storage/Football_Quarterback_mixamo_25080ba4.fbx";
const FPS = 24;
const THROW_START = 23.33;
const THROW_END = 25.33;
const READOUT_BONES = ["mixamorigSpine", "mixamorigRightArm", "mixamorigRightForeArm"] as const;

type Readout = Record<string, { x: number; y: number; z: number }>;
type ClipInfo = { originalDuration: number; duration: number; sourceTargets: number; matchedTargets: number; missing: string[] };
type Runtime = { seek: (time: number) => void; playing: boolean; time: number; duration: number };

function signedDegrees(radians: number) {
  const degrees = THREE.MathUtils.radToDeg(radians);
  return ((degrees + 180) % 360 + 360) % 360 - 180;
}

function firstSkinnedMesh(root: THREE.Object3D) {
  let mesh: THREE.SkinnedMesh | undefined;
  root.traverse((node) => {
    if (!mesh && (node as THREE.SkinnedMesh).isSkinnedMesh) mesh = node as THREE.SkinnedMesh;
  });
  if (!mesh) throw new Error(`No skinned mesh found in ${root.name || "loaded rig"}.`);
  return mesh;
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (!material) continue;
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.dispose();
      }
      material.dispose();
    }
  });
}

/** Isolated evaluation only. Does not import or alter production hologram components. */
export default function MocapPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<Runtime | null>(null);
  const [status, setStatus] = useState("Loading hologram and licensed quarterback clip…");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<ClipInfo | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [readouts, setReadouts] = useState<Readout>({});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let frame = 0;
    let model: THREE.Object3D | undefined;
    let fbx: THREE.Group | undefined;
    let sourceRig: (THREE.Group & { skeleton: THREE.Skeleton }) | undefined;
    let mixer: THREE.AnimationMixer | undefined;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch (cause) {
      setError(`WebGL renderer could not start: ${cause instanceof Error ? cause.message : String(cause)}`);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x07131d);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
    camera.position.set(3, 1.8, 4);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.9, 0);
    scene.add(new THREE.HemisphereLight(0xb6e9ff, 0x1b3044, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x38cfff, 2);
    rimLight.position.set(-3, 3, -3);
    scene.add(rimLight);
    const grid = new THREE.GridHelper(8, 32, 0x235267, 0x122d3c);
    scene.add(grid);
    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    const clock = new THREE.Clock();
    let lastReadout = 0;
    const publishReadouts = () => {
      if (!model || !runtimeRef.current || cancelled) return;
      const values: Readout = {};
      for (const name of READOUT_BONES) {
        const bone = model.getObjectByName(name);
        if (bone) values[name] = { x: signedDegrees(bone.rotation.x), y: signedDegrees(bone.rotation.y), z: signedDegrees(bone.rotation.z) };
      }
      setReadouts(values);
      setTime(runtimeRef.current.time);
    };
    const render = () => {
      if (cancelled) return;
      frame = requestAnimationFrame(render);
      const delta = Math.min(clock.getDelta(), 0.1);
      const runtime = runtimeRef.current;
      if (mixer && runtime?.playing) {
        mixer.update(delta);
        runtime.time = Math.min(mixer.time, runtime.duration);
        if (runtime.time >= runtime.duration) {
          runtime.playing = false;
          setPlaying(false);
        }
      }
      controls.update();
      renderer.render(scene, camera);
      const now = performance.now();
      if (now - lastReadout > 80) {
        publishReadouts();
        lastReadout = now;
      }
    };
    render();

    async function load() {
      let stage = "Hologram GLB loading";
      try {
        const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
        model = gltf.scene;
        if (cancelled) { disposeObject(model); return; }
        stage = `Quarterback FBX loading (${FBX_URL})`;
        fbx = await new FBXLoader().loadAsync(FBX_URL);
        if (cancelled) { disposeObject(model); disposeObject(fbx); return; }
        stage = "SkeletonUtils retargeting";
        const clip = fbx.animations[0];
        if (!clip) throw new Error("The selected FBX has no animation clip.");
        const targetMesh = firstSkinnedMesh(model);
        const sourceMesh = firstSkinnedMesh(fbx);
        const targets = Array.from(new Set(clip.tracks.map((track) => track.name.slice(0, track.name.lastIndexOf(".")))));
        const targetNames = new Set(targetMesh.skeleton.bones.map((bone) => bone.name));
        const missing = targets.filter((name) => !targetNames.has(name));
        for (const name of missing) console.warn(`[MocapPreview] Source animation target missing on hologram: ${name}`);
        for (const name of READOUT_BONES) {
          if (!targetNames.has(name)) console.warn(`[MocapPreview] Readout bone missing on hologram: ${name}`);
        }
        // Keep the animated FBX reference ancestor available to the source mixer.
        const sourceRoot = fbx.getObjectByName("mixamorigReference");
        if (!sourceRoot) throw new Error("The FBX reference root mixamorigReference is missing.");
        sourceRig = Object.assign(new THREE.Group(), { skeleton: sourceMesh.skeleton });
        sourceRig.name = "MocapSourceRig";
        sourceRig.add(sourceRoot);
        sourceRig.updateMatrixWorld(true);
        model.updateMatrixWorld(true);
        // SkeletonUtils requires an explicit target -> source map, even for identical names.
        const names = Object.fromEntries(targetMesh.skeleton.bones.map((bone) => [bone.name, bone.name]));
        const retargeted = retargetClip(targetMesh, sourceRig, clip, {
          names,
          fps: FPS,
          trim: [THROW_START, THROW_END],
          hip: "mixamorigHips",
          scale: 0.01,
          useFirstFramePosition: true,
          preserveHipPosition: false,
        });
        retargeted.name = "Quarterback throw · retargeted evaluation";
        mixer = new THREE.AnimationMixer(targetMesh);
        const action = mixer.clipAction(retargeted);
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.play();
        mixer.setTime(0);
        scene.add(model);
        model.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(model, true);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const extent = Math.max(size.x, size.y, size.z, 1.5);
        const distance = extent / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.55;
        controls.target.copy(center);
        camera.position.copy(center).add(new THREE.Vector3(0.65, 0.22, 1).normalize().multiplyScalar(distance));
        grid.position.y = box.min.y;
        camera.lookAt(center);
        controls.update();
        runtimeRef.current = {
          time: 0,
          duration: retargeted.duration,
          playing: false,
          seek: (nextTime) => {
            if (!mixer || !runtimeRef.current) return;
            action.paused = false;
            action.enabled = true;
            const clamped = THREE.MathUtils.clamp(nextTime, 0, retargeted.duration);
            mixer.setTime(clamped);
            runtimeRef.current.time = clamped;
            model?.updateMatrixWorld(true);
            publishReadouts();
          },
        };
        setInfo({ originalDuration: clip.duration, duration: retargeted.duration, sourceTargets: targets.length, matchedTargets: targets.length - missing.length, missing });
        setStatus("Ready for retargeting evaluation");
        publishReadouts();
        console.info("[MocapPreview] Retargeted clip ready", { sourceDuration: clip.duration, sourceWindow: [THROW_START, THROW_END], duration: retargeted.duration, tracks: retargeted.tracks.length, missing });
      } catch (cause) {
        if (cancelled) return;
        const message = `${stage}: ${cause instanceof Error ? cause.message : String(cause)}`;
        console.error("[MocapPreview]", message, cause);
        setError(message);
        setStatus("Evaluation could not load");
      }
    }
    void load();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      mixer?.stopAllAction();
      runtimeRef.current = null;
      if (model) disposeObject(model);
      if (fbx) disposeObject(fbx);
      if (sourceRig) disposeObject(sourceRig);
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const seek = (nextTime: number) => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    runtime.playing = false;
    setPlaying(false);
    runtime.seek(nextTime);
  };
  const togglePlay = () => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    if (!runtime.playing && runtime.time >= runtime.duration) runtime.seek(0);
    runtime.playing = !runtime.playing;
    setPlaying(runtime.playing);
  };
  const progress = info ? (time / info.duration) * 100 : 0;
  const buttonClass = "rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:opacity-40";

  return (
    <main className="min-h-screen bg-[#061019] px-4 py-7 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Aligned · isolated evaluation</p>
            <h1 className="text-3xl font-semibold tracking-tight">Quarterback mocap preview</h1>
            <p className="mt-2 text-sm text-slate-400">Licensed Mixamo FBX → existing hologram · SkeletonUtils.retargetClip()</p>
          </div>
          <a href="/" className={buttonClass}>Back to Aligned</a>
        </header>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="overflow-hidden rounded-2xl border border-slate-700 bg-[#07131d]">
            <div ref={containerRef} className="h-[440px] w-full sm:h-[560px]" aria-label="Interactive retargeted hologram viewer" />
            <div className="space-y-4 border-t border-slate-700 p-5">
              <p role="status" className={error ? "text-sm text-red-300" : "text-sm text-cyan-200"}>{status}</p>
              {error && <p role="alert" className="break-words text-sm text-red-200">{error}</p>}
              <div className="flex flex-wrap items-center gap-2">
                <button className={buttonClass} onClick={togglePlay} disabled={!info}>{playing ? "Pause" : "Play"}</button>
                <button className={buttonClass} onClick={() => seek(0)} disabled={!info}>Reset</button>
                <button className={buttonClass} onClick={() => seek((runtimeRef.current?.time ?? 0) - 1 / FPS)} disabled={!info} aria-label="Previous frame">−1 frame</button>
                <button className={buttonClass} onClick={() => seek((runtimeRef.current?.time ?? 0) + 1 / FPS)} disabled={!info} aria-label="Next frame">+1 frame</button>
                <span className="ml-auto font-mono text-sm text-slate-300">{time.toFixed(2)} / {info?.duration.toFixed(2) ?? "—"} s</span>
              </div>
              <label className="block text-sm text-slate-300" htmlFor="mocap-scrubber">Throw progress · {progress.toFixed(1)}%</label>
              <input id="mocap-scrubber" type="range" min="0" max="100" step="0.01" value={progress} disabled={!info} onChange={(event) => seek(Number(event.target.value) / 100 * (info?.duration ?? 0))} className="w-full accent-cyan-300" />
              <p className="text-xs text-slate-400">Drag to orbit · scroll to zoom · frame steps use the native 24 fps interval.</p>
            </div>
          </section>
          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
              <h2 className="mb-4 font-semibold">Throw window</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-slate-400">Original clip</dt><dd className="font-mono">{info?.originalDuration.toFixed(2) ?? "36.29"} s</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-400">Source interval</dt><dd className="font-mono">23.33–25.33 s</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-400">Current source time</dt><dd className="font-mono">{(THROW_START + time).toFixed(2)} s</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-400">Binding coverage</dt><dd className="font-mono">{info ? `${info.matchedTargets}/${info.sourceTargets}` : "—"}</dd></div>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-slate-400">Approximate loaded-arm → acceleration → release → follow-through window. Release is estimated around 24.25–24.50 s, not ball-tracking ground truth.</p>
              {info?.missing.map((name) => <p key={name} className="mt-3 break-words text-xs text-amber-200">Source-only target: {name} (reported in console)</p>)}
            </section>
            <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
              <h2 className="mb-4 font-semibold">Local rotation readouts</h2>
              {READOUT_BONES.map((name) => (
                <div key={name} className="mb-4 last:mb-0">
                  <h3 className="mb-2 text-xs text-slate-400">{name.replace("mixamorig", "mixamorig:")}{name === "mixamorigSpine" ? " · Y highlighted" : ""}</h3>
                  <div className="grid grid-cols-3 gap-2 font-mono text-sm">
                    {(["x", "y", "z"] as const).map((axis) => <div key={axis} className={`rounded-lg p-2 ${name === "mixamorigSpine" && axis === "y" ? "bg-cyan-950 text-cyan-200" : "bg-slate-800"}`}><span className="block text-xs uppercase text-slate-400">{axis}</span>{readouts[name] ? `${readouts[name][axis].toFixed(1)}°` : "—"}</div>)}
                  </div>
                </div>
              ))}
              <p className="mt-4 text-xs leading-relaxed text-slate-400">Euler rotations are relative to each bone’s parent. Spine Y is a local rotation proxy, not an anatomical shoulder-rotation or hip–shoulder-separation measurement. The 30–45° late-cocking reference cannot be validated from this value alone.</p>
            </section>
            <p className="px-1 text-xs leading-relaxed text-slate-500">Evaluation only. No production analysis, replay, scoring, or coaching behavior is connected to this route.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
