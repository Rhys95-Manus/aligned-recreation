import type { MocapClipConfig } from "@/data/mocapClips";
import { MOCAP_ANGLE_LABELS, compareAngleToRange, getMocapReference, getMocapReferencePhase, type MocapAngleId, type PhaseAngleComparison } from "@/lib/mocapAngles";
import type { MocapPhaseMarkerReport } from "@/lib/mocapPipeline";

function differenceText(row: PhaseAngleComparison): string {
  if (row.difference === null) return "—";
  if (row.difference === 0) return "0.0° · within range";
  return `${Math.abs(row.difference).toFixed(1)}° ${row.direction} range`;
}

export default function MocapPhaseReport({ config, reports, selectedIndex, onSelect }: {
  config: MocapClipConfig;
  reports: readonly MocapPhaseMarkerReport[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const reference = getMocapReference(config);
  const report = reports[selectedIndex];
  const referencePhase = report ? getMocapReferencePhase(config, report.phase) : undefined;
  const comparable = report?.comparisons.filter((row) => row.status !== "unavailable") ?? [];
  const unavailable = report?.comparisons.filter((row) => row.status === "unavailable") ?? [];
  const separationRange = referencePhase?.metrics.find((metric) => metric.name === "Hip-Shoulder Separation");
  const peakComparison = report?.separationPeak && separationRange ? compareAngleToRange(report.separationPeak.value, separationRange.min, separationRange.max) : null;

  return (
    <section className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/70 p-5 sm:p-6" aria-label="Phase angle report">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Phase angle report</h2>
          <p className="mt-1 text-sm text-slate-400">World-position geometry · limb interior angles: 180° straight, 90° bent.</p>
        </div>
        {reference && <span className="text-xs text-slate-400">Codebase reference: {reference.motionName}</span>}
      </div>
      {!reference && <p role="status" className="mb-4 rounded-lg bg-amber-950/40 p-3 text-sm text-amber-200">No reference data for this motion ({config.referenceKey ?? config.id}). Geometry is still available; no substitute ranges are applied.</p>}
      {reference && !reference.phases?.length && <p className="mb-4 rounded-lg bg-amber-950/40 p-3 text-sm text-amber-200">This motion has no phase-structured reference data. Flat whole-motion ranges are not substituted.</p>}
      {config.phases.length === 0 && <p className="text-sm text-slate-400">No phase markers are configured for this motion.</p>}
      <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5" role="group" aria-label="Choose phase marker">
        {config.phases.map((phase, index) => (
          <button key={phase.name} disabled={!reports[index]} aria-pressed={selectedIndex === index} onClick={() => onSelect(index)} className={`rounded-xl border p-3 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:opacity-40 ${selectedIndex === index ? "border-cyan-400 bg-cyan-950/50 text-cyan-100" : "border-slate-700 text-slate-300 hover:bg-slate-800"}`}>
            <span className="mb-1 block text-xs text-slate-400">Marker {index + 1} · {phase.startTime.toFixed(2)} s</span>
            <span className="font-medium">{phase.name}</span>
          </button>
        ))}
      </div>
      {report && (
        <>
          <div className="mb-4">
            <h3 className="font-semibold">{report.phase.name}</h3>
            <p className="mt-1 text-xs text-slate-400">Fixed sample at this phase’s start marker: source {report.sourceTime.toFixed(2)} s · clip {report.clipTime.toFixed(2)} s. Selecting a marker pauses and seeks there; scrubbing does not change this saved sample.</p>
            {referencePhase && report.phase.referenceName && <p className="mt-1 text-xs text-amber-200">Comparison benchmark: {report.phase.referenceName}. The clip starts loaded, not in a verified neutral stance.</p>}
          </div>
          {reference?.phases?.length && !referencePhase ? <p className="mb-4 text-sm text-amber-200">No reference data for this configured phase. Check its exact referenceName; no other phase is substituted.</p> : null}
          {!referencePhase && <dl className="mb-4 grid gap-3 sm:grid-cols-2">{(Object.keys(MOCAP_ANGLE_LABELS) as MocapAngleId[]).map((id) => <div key={id} className="rounded-lg bg-slate-800 p-3"><dt className="text-xs text-slate-400">{MOCAP_ANGLE_LABELS[id]}</dt><dd className="mt-1 font-mono text-sm">{report.angles[id].value != null ? `${report.angles[id].value!.toFixed(1)}° · No reference range` : `Unavailable · ${report.angles[id].reason}`}</dd></div>)}</dl>}
          {comparable.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" aria-label="Phase marker joint angle comparisons">
                <thead className="text-xs uppercase tracking-wide text-slate-400"><tr><th className="pb-3 pr-4">Angle</th><th className="pb-3 pr-4">Measured</th><th className="pb-3 pr-4">Reference</th><th className="pb-3 pr-4">Status</th><th className="pb-3">Difference</th></tr></thead>
                <tbody>
                  {comparable.map((row) => (
                    <tr key={row.metric.name} className="border-t border-slate-800">
                      <th scope="row" className="py-3 pr-4 font-medium">{row.metric.name}{row.measurement === "hipShoulderSeparation" && <span className="mt-1 block text-xs font-normal text-slate-400">Horizontal axes · marker snapshot, not peak</span>}</th>
                      <td className="py-3 pr-4 font-mono">{row.value?.toFixed(1)}°</td>
                      <td className="py-3 pr-4 whitespace-nowrap text-slate-300">{row.metric.min}–{row.metric.max}°</td>
                      <td className={`py-3 pr-4 whitespace-nowrap ${row.status === "in-range" ? "text-emerald-300" : "text-amber-300"}`}>{row.status === "in-range" ? "In range" : "Out of range"}</td>
                      <td className="py-3 whitespace-nowrap text-slate-300">{differenceText(row)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {referencePhase && comparable.length === 0 && <p className="mb-3 text-sm text-slate-400">No valid comparable angle at this marker. See unavailable metrics below; geometry may be missing or the reference may require a different measurement convention.</p>}
          {report.separationPeak && separationRange && peakComparison && (
            <p className="mt-4 rounded-lg bg-slate-800 p-3 text-sm text-slate-300">
              <strong className="font-medium text-slate-100">Phase peak separation:</strong> {report.separationPeak.value.toFixed(1)}° at source {report.separationPeak.sourceTime.toFixed(2)} s · reference {separationRange.min}–{separationRange.max}° · <span className={peakComparison.status === "in-range" ? "text-emerald-300" : "text-amber-300"}>{peakComparison.status === "in-range" ? "In range · 0.0° difference" : `Out of range · ${Math.abs(peakComparison.difference).toFixed(1)}° ${peakComparison.direction}`}</span>. Sampled at {config.fps ?? 24} fps over this phase, separately from the marker snapshot.
            </p>
          )}
          {unavailable.length > 0 && (
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer text-slate-300">Unavailable reference metrics ({unavailable.length})</summary>
              <div className="mt-3 space-y-3">
                {unavailable.map((row) => <div key={row.metric.name} className="rounded-lg bg-slate-800/60 p-3"><p className="font-medium">{row.metric.name} · {row.metric.min}–{row.metric.max} {row.metric.unit} · Unavailable</p><p className="mt-1 text-xs text-slate-400">{row.reason}</p></div>)}
              </div>
            </details>
          )}
          {referencePhase && <p className="mt-4 text-xs leading-relaxed text-slate-400">Reference cue: {referencePhase.instruction}</p>}
        </>
      )}
      <p className="mt-5 text-xs leading-relaxed text-slate-500">These are estimates from the retargeted rig, whose proportions and joint centers can differ from the performer. Phase timing is manual. Range labels are evaluation comparisons—not a validated assessment, clinical advice, or a movement score.</p>
    </section>
  );
}
