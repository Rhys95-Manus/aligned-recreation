import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import MocapPhaseReport from "@/components/MocapPhaseReport";
import { DEFAULT_MOCAP_CLIP_ID, getActivePhaseIndex, getMocapClip, mocapClips, sourceTimeToClipTime, validateMocapConfig, type MocapClipConfig } from "@/data/mocapClips";
import { MOCAP_ANGLE_LABELS, measureMocapAngles, type MocapAngleId, type MocapAngleMeasurements } from "@/lib/mocapAngles";
import { prepareMocapClip, sampleMocapPhaseMarkers, type MocapPhaseMarkerReport } from "@/lib/mocapPipeline";
import { bakeMetricCorrectedClip, type CorrectedMocap } from "@/lib/mocapCorrection";

const READOUT_BONES = ["mixamorigSpine", "mixamorigRightArm", "mixamorigRightForeArm"] as const;
const buttonClass = "rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:opacity-40";
type Readout = Record<string, { x: number; y: number; z: number }>;
type ClipInfo = { originalDuration: number; duration: number; sourceTargets: number; matchedTargets: number; missing: string[] };
type PlaybackMode = "raw" | "corrected";
type Runtime = { seek: (time: number) => void; switchMode: (mode: PlaybackMode) => void; playing: boolean; time: number; duration: number };

function signedDegrees(radians: number) {
  const degrees = THREE.MathUtils.radToDeg(radians);
  return ((degrees + 180) % 360 + 360) % 360 - 180;
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (!material) continue;
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
      material.dispose();
    }
  });
}

/** URL routing wrapper; an unknown id never silently loads another motion. */
export default function MocapPreview() {
  const params = useParams<{ motionId?: string }>();
  const id = params.motionId ?? DEFAULT_MOCAP_CLIP_ID;
  const config = getMocapClip(id);
  if (!config) return (
    <main className="min-h-screen bg-[#061019] p-8 text-slate-100">
      <h1 className="mb-3 text-2xl font-semibold">Motion not found</h1>
      <p role="alert" className="mb-5 text-slate-300">No mocap clip config exists for “{id}”. No model or clip was loaded.</p>
      <div className="flex flex-wrap gap-3">{mocapClips.map((clip) => <a key={clip.id} className={buttonClass} href={`/test/mocap-preview/${clip.id}`}>{clip.name}</a>)}</div>
    </main>
  );
  return <ConfiguredMocapPreview key={config.id} config={config} />;
}

/** Isolated evaluation only. Does not import or change production hologram components. */
function ConfiguredMocapPreview({ config }: { config: MocapClipConfig }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<Runtime | null>(null);
  const [status, setStatus] = useState("Loading hologram and licensed motion clip…");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<ClipInfo | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [readouts, setReadouts] = useState<Readout>({});
  const [angles, setAngles] = useState<MocapAngleMeasurements | null>(null);
  const [phaseReports, setPhaseReports] = useState<MocapPhaseMarkerReport[]>([]);
  const [correctedReports, setCorrectedReports] = useState<MocapPhaseMarkerReport[]>([]);
  const [correction, setCorrection] = useState<CorrectedMocap | null>(null);
  const [mode, setMode] = useState<PlaybackMode>("raw");
  const [selectedPhase, setSelectedPhase] = useState(0);
  const fps = config.fps ?? 24;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    try { validateMocapConfig(config); }
    catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setStatus("Invalid motion config");
      return;
    }
    let cancelled = false;
    let frame = 0;
    let model: THREE.Object3D | undefined;
    let fbx: THREE.Group | undefined;
    let sourceRig: THREE.Object3D | undefined;
    let mixer: THREE.AnimationMixer | undefined;
    let targetBones: THREE.Bone[] = [];
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); }
    catch (cause) {
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
      setAngles(measureMocapAngles(model, targetBones));
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
        if (runtime.time >= runtime.duration) { runtime.playing = false; setPlaying(false); }
      }
      controls.update();
      renderer.render(scene, camera);
      const now = performance.now();
      if (now - lastReadout > 80) { publishReadouts(); lastReadout = now; }
    };
    render();

    async function load() {
      let stage = "Hologram GLB loading";
      try {
        const gltf = await new GLTFLoader().loadAsync(config.targetModel);
        model = gltf.scene;
        if (cancelled) { disposeObject(model); return; }
        stage = `Motion FBX loading (${config.fbxUrl})`;
        fbx = await new FBXLoader().loadAsync(config.fbxUrl);
        if (cancelled) { disposeObject(model); disposeObject(fbx); return; }
        stage = "SkeletonUtils retargeting";
        const prepared = prepareMocapClip(model, fbx, config);
        sourceRig = prepared.sourceRig;
        targetBones = prepared.targetMesh.skeleton.bones;
        for (const name of READOUT_BONES) if (!model.getObjectByName(name)) console.warn(`[MocapPreview] Readout bone missing on hologram: ${name}`);
        stage = "Baking conservative metric corrections";
        const baked = bakeMetricCorrectedClip(model, prepared.targetMesh, prepared.clip, config);
        setCorrection(baked);
        mixer = new THREE.AnimationMixer(prepared.targetMesh);
        const actions = { raw: mixer.clipAction(prepared.clip), corrected: mixer.clipAction(baked.clip) };
        for (const candidate of Object.values(actions)) {
          candidate.setLoop(THREE.LoopOnce, 1);
          candidate.clampWhenFinished = true;
        }
        let action = actions.raw;
        action.play();
        const activate = (nextMode: PlaybackMode, nextTime: number) => {
          mixer?.stopAllAction();
          action = actions[nextMode];
          action.reset().play();
          seekPose(nextTime);
        };
        const seekPose = (nextTime: number) => {
          if (!mixer) return;
          action.paused = false;
          action.enabled = true;
          mixer.setTime(THREE.MathUtils.clamp(nextTime, 0, prepared.clip.duration));
          model?.updateMatrixWorld(true);
        };
        stage = "World-position phase sampling";
        const reports = sampleMocapPhaseMarkers(model, targetBones, config, prepared.clip.duration, seekPose);
        setPhaseReports(reports);
        activate("corrected", 0);
        setCorrectedReports(sampleMocapPhaseMarkers(model, targetBones, config, baked.clip.duration, seekPose));
        activate("raw", 0);
        // The sampler restores time zero: quarterback playback remains unchanged.
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
          duration: prepared.clip.duration,
          playing: false,
          switchMode: (nextMode) => {
            if (!runtimeRef.current) return;
            activate(nextMode, runtimeRef.current.time);
            publishReadouts();
          },
          seek: (nextTime) => {
            if (!runtimeRef.current) return;
            const clamped = THREE.MathUtils.clamp(nextTime, 0, prepared.clip.duration);
            seekPose(clamped);
            runtimeRef.current.time = clamped;
            publishReadouts();
          },
        };
        setInfo({ originalDuration: prepared.originalDuration, duration: prepared.clip.duration, sourceTargets: prepared.sourceTargets, matchedTargets: prepared.matchedTargets, missing: prepared.missing });
        setStatus("Ready for retargeting evaluation");
        publishReadouts();
        console.info("[MocapPreview] Retargeted clip ready", { motionId: config.id, sourceDuration: prepared.originalDuration, sourceWindow: [config.trimStart, config.trimEnd], duration: prepared.clip.duration, tracks: prepared.clip.tracks.length, missing: prepared.missing, phaseMarkers: reports.length });
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
  }, [config]);

  const seek = (nextTime: number) => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    runtime.playing = false;
    setPlaying(false);
    runtime.seek(nextTime);
  };
  const selectPhase = (index: number) => {
    const report = phaseReports[index];
    if (!report) return;
    setSelectedPhase(index);
    seek(report.clipTime);
  };
  const togglePlay = () => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    if (!runtime.playing && runtime.time >= runtime.duration) runtime.seek(0);
    runtime.playing = !runtime.playing;
    setPlaying(runtime.playing);
  };
  const progress = info ? time / info.duration * 100 : 0;
  const activePhase = getActivePhaseIndex(config, time);
  const markerPercent = (sourceTime: number) => info ? sourceTimeToClipTime(config, sourceTime, info.duration) / info.duration * 100 : 0;
  const switchMode = (nextMode: PlaybackMode) => {
    if (!runtimeRef.current) return;
    runtimeRef.current.switchMode(nextMode);
    setMode(nextMode);
  };

  return (
    <main className="min-h-screen bg-[#061019] px-4 py-7 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Aligned · isolated evaluation</p>
            <h1 className="text-3xl font-semibold tracking-tight">{config.name} mocap preview</h1>
            <p className="mt-2 text-sm text-slate-400">Configured Mixamo FBX → hologram · SkeletonUtils.retargetClip()</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="mocap-motion">Motion</label>
            <select id="mocap-motion" value={config.id} onChange={(event) => { window.location.href = `/test/mocap-preview/${event.target.value}`; }} className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm">{mocapClips.map((clip) => <option key={clip.id} value={clip.id}>{clip.name}</option>)}</select>
            <a href="/" className={buttonClass}>Back to Aligned</a>
          </div>
        </header>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="overflow-hidden rounded-2xl border border-slate-700 bg-[#07131d]">
            <div ref={containerRef} className="h-[440px] w-full sm:h-[560px]" aria-label="Interactive retargeted hologram viewer" />
            <div className="space-y-4 border-t border-slate-700 p-5">
              <p role="status" className={error ? "text-sm text-red-300" : "text-sm text-cyan-200"}>{status}</p>
              {error && <p role="alert" className="break-words text-sm text-red-200">{error}</p>}
              <div className="flex flex-wrap gap-2" role="group" aria-label="Playback mode">
                <button className={`${buttonClass} ${mode === "raw" ? "border-cyan-300 bg-cyan-950" : ""}`} aria-pressed={mode === "raw"} disabled={!info} onClick={() => switchMode("raw")}>Raw mocap</button>
                <button className={`${buttonClass} ${mode === "corrected" ? "border-cyan-300 bg-cyan-950" : ""}`} aria-pressed={mode === "corrected"} disabled={!info} onClick={() => switchMode("corrected")}>Metric-corrected</button>
              </div>
              <p className="text-xs text-slate-400">Separate baked clip · nearest boundary +2° · maximum 20° per elbow / total spine twist. Unsafe frames stay raw; safe offsets ease over 80 ms. Knees are report-only.</p>
              <div className="flex flex-wrap items-center gap-2">
                <button className={buttonClass} onClick={togglePlay} disabled={!info}>{playing ? "Pause" : "Play"}</button>
                <button className={buttonClass} onClick={() => seek(0)} disabled={!info}>Reset</button>
                <button className={buttonClass} onClick={() => seek((runtimeRef.current?.time ?? 0) - 1 / fps)} disabled={!info} aria-label="Previous frame">−1 frame</button>
                <button className={buttonClass} onClick={() => seek((runtimeRef.current?.time ?? 0) + 1 / fps)} disabled={!info} aria-label="Next frame">+1 frame</button>
                <span className="ml-auto font-mono text-sm text-slate-300">{time.toFixed(2)} / {info?.duration.toFixed(2) ?? "—"} s</span>
              </div>
              <label className="block text-sm text-slate-300" htmlFor="mocap-scrubber">Motion progress · {progress.toFixed(1)}%{activePhase >= 0 ? ` · ${config.phases[activePhase].name}` : ""}</label>
              <input id="mocap-scrubber" type="range" min="0" max="100" step="0.01" value={progress} disabled={!info} onChange={(event) => seek(Number(event.target.value) / 100 * (info?.duration ?? 0))} className="w-full accent-cyan-300" />
              <div className="relative mx-2 h-9" aria-label="Scrubber phase markers">
                {config.phases.map((phase, index) => (
                  <div key={phase.name}>
                    <div className={`absolute top-0 h-1 ${activePhase === index ? "bg-cyan-300" : "bg-slate-600"}`} style={{ left: `${markerPercent(phase.startTime)}%`, width: `${Math.max(0, markerPercent(phase.endTime) - markerPercent(phase.startTime))}%` }} />
                    <button disabled={!info} onClick={() => selectPhase(index)} aria-label={`Seek to phase ${index + 1}: ${phase.name}`} title={`${phase.name}: ${phase.startTime.toFixed(2)}–${phase.endTime.toFixed(2)} s (source)`} className={`absolute top-1 -translate-x-1/2 rounded-b px-2 pb-1 pt-2 font-mono text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:opacity-30 ${selectedPhase === index ? "bg-cyan-900 text-cyan-100" : "bg-slate-800 text-slate-300"}`} style={{ left: `${markerPercent(phase.startTime)}%` }}>{index + 1}</button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">Numbered phase markers seek and pause. Drag to orbit · scroll to zoom · frame steps use {fps} fps.</p>
            </div>
          </section>
          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
              <h2 className="mb-4 font-semibold">Motion window</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-slate-400">Original clip</dt><dd className="font-mono">{info?.originalDuration.toFixed(2) ?? "—"} s</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-400">Source interval</dt><dd className="font-mono">{config.trimStart.toFixed(2)}–{config.trimEnd.toFixed(2)} s</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-400">Current source time</dt><dd className="font-mono">{(config.trimStart + time).toFixed(2)} s</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-400">Binding coverage</dt><dd className="font-mono">{info ? `${info.matchedTargets}/${info.sourceTargets}` : "—"}</dd></div>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-slate-400">{config.timingNote ?? "Phase timing is manually configured on the source timeline, not automatically detected."}</p>
              {info?.missing.map((name) => <p key={name} className="mt-3 break-words text-xs text-amber-200">Source-only target: {name} (reported in console)</p>)}
            </section>
            <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5" aria-label="Current world-space angles">
              <h2 className="mb-4 font-semibold">Current geometric angles</h2>
              <dl className="space-y-3 text-sm">
                {(Object.keys(MOCAP_ANGLE_LABELS) as MocapAngleId[]).map((id) => <div key={id} className="flex justify-between gap-3"><dt className="max-w-[190px] text-slate-400">{MOCAP_ANGLE_LABELS[id]}</dt><dd className="font-mono" title={angles?.[id].reason}>{angles?.[id].value != null ? `${angles[id].value!.toFixed(1)}°` : "Unavailable"}</dd></div>)}
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-slate-400">Computed from bone world positions. Straight elbows/knees = 180°. Separation is the unsigned horizontal pelvis/shoulder axis difference.</p>
            </section>
            <details className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
              <summary className="cursor-pointer font-semibold">Local Euler debug readouts</summary>
              <div className="mt-4">
                {READOUT_BONES.map((name) => <div key={name} className="mb-4 last:mb-0"><h3 className="mb-2 text-xs text-slate-400">{name.replace("mixamorig", "mixamorig:")}</h3><div className="grid grid-cols-3 gap-2 font-mono text-sm">{(["x", "y", "z"] as const).map((axis) => <div key={axis} className={`rounded-lg p-2 ${name === "mixamorigSpine" && axis === "y" ? "bg-cyan-950 text-cyan-200" : "bg-slate-800"}`}><span className="block text-xs uppercase text-slate-400">{axis}</span>{readouts[name] ? `${readouts[name][axis].toFixed(1)}°` : "—"}</div>)}</div></div>)}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-400">Legacy local Euler readouts are debugging only. They are never used for joint-angle range comparisons.</p>
            </details>
          </aside>
        </div>
        <MocapPhaseReport config={config} reports={phaseReports} correctedReports={correctedReports} correction={correction} selectedIndex={selectedPhase} onSelect={selectPhase} />
        <p className="mt-5 text-xs text-slate-500">Evaluation only. No production analysis, replay, scoring, or coaching behavior is connected to this route.</p>
      </div>
    </main>
  );
}
