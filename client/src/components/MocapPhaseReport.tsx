import type { MocapClipConfig } from "@/data/mocapClips";
import { MOCAP_ANGLE_LABELS, compareAngleToRange, getMocapReference, getMocapReferencePhase, type MocapAngleId, type PhaseAngleComparison } from "@/lib/mocapAngles";
import type { MocapPhaseMarkerReport } from "@/lib/mocapPipeline";
import { correctionAtMarker, TOO_FAR_MESSAGE, type CorrectedMocap } from "@/lib/mocapCorrection";

function differenceText(row: PhaseAngleComparison): string {
  if (row.difference === null) return "Unavailable";
  if (row.difference === 0) return "In range · 0.0° difference";
  return `Out of range · ${Math.abs(row.difference).toFixed(1)}° ${row.direction}`;
}
const degrees = (value: number | null | undefined) => value != null ? `${value.toFixed(1)}°` : "Unavailable";

export default function MocapPhaseReport({ config, reports, correctedReports, correction, selectedIndex, onSelect }: {
  config: MocapClipConfig;
  reports: readonly MocapPhaseMarkerReport[];
  correctedReports: readonly MocapPhaseMarkerReport[];
  correction: CorrectedMocap | null;
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const reference = getMocapReference(config);
  const report = reports[selectedIndex];
  const correctedReport = correctedReports[selectedIndex];
  const referencePhase = report ? getMocapReferencePhase(config, report.phase) : undefined;
  const comparable = report?.comparisons.filter((row) => row.status !== "unavailable") ?? [];
  const unavailable = report?.comparisons.filter((row) => row.status === "unavailable") ?? [];
  const separationRange = referencePhase?.metrics.find((metric) => metric.name === "Hip-Shoulder Separation");
  const phaseSamples = correction?.samples.filter((sample) => sample.phaseIndex === selectedIndex) ?? [];
  const refused = phaseSamples.filter((sample) => sample.status === "too-far");
  const refusalMetrics = Array.from(new Set(refused.map((sample) => sample.metricName)));

  return (
    <section className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/70 p-5 sm:p-6" aria-label="Phase angle report">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Phase angle report · raw vs corrected</h2>
          <p className="mt-1 text-sm text-slate-400">Measured from both clips, independent of playback mode · limb interior angles: 180° straight, 90° bent.</p>
        </div>
        {reference && <span className="text-xs text-slate-400">Codebase reference: {reference.motionName}</span>}
      </div>
      {!reference && <p role="status" className="mb-4 rounded-lg bg-amber-950/40 p-3 text-sm text-amber-200">No reference data for this motion ({config.referenceKey ?? config.id}). Geometry is still available; the corrected clip is an unchanged copy. No substitute ranges are applied.</p>}
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
          {!referencePhase && <dl className="mb-4 grid gap-3 sm:grid-cols-2">{(Object.keys(MOCAP_ANGLE_LABELS) as MocapAngleId[]).map((id) => <div key={id} className="rounded-lg bg-slate-800 p-3"><dt className="text-xs text-slate-400">{MOCAP_ANGLE_LABELS[id]}</dt><dd className="mt-1 font-mono text-sm">Raw {degrees(report.angles[id].value)} · corrected {degrees(correctedReport?.angles[id].value)} · No reference range</dd></div>)}</dl>}
          {comparable.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[740px] text-left text-sm" aria-label="Phase marker joint angle comparisons">
                <thead className="text-xs uppercase tracking-wide text-slate-400"><tr><th className="pb-3 pr-4">Angle</th><th className="pb-3 pr-4">Raw mocap</th><th className="pb-3 pr-4">Metric-corrected</th><th className="pb-3 pr-4">Reference</th><th className="pb-3">Correction / safety</th></tr></thead>
                <tbody>
                  {comparable.map((row) => {
                    const after = correctedReport?.comparisons.find((candidate) => candidate.metric.name === row.metric.name);
                    const sample = correction && row.measurement ? correctionAtMarker(correction, selectedIndex, row.measurement, report.clipTime) : undefined;
                    const label = sample?.status === "too-far" ? TOO_FAR_MESSAGE : sample?.status === "report-only" ? "Report-only · knees / foot planting" : sample?.status === "corrected" ? "Corrected" : sample?.status === "in-range" ? "Already in range · unchanged" : sample?.status === "easing" ? "Easing / residual deviation" : "Unavailable";
                    return (
                      <tr key={row.metric.name} className="border-t border-slate-800">
                        <th scope="row" className="py-3 pr-4 font-medium">{row.metric.name}{row.measurement === "hipShoulderSeparation" && <span className="mt-1 block text-xs font-normal text-slate-400">Horizontal axes · marker snapshot, not peak</span>}</th>
                        <td className="py-3 pr-4"><span className="font-mono">{degrees(row.value)}</span><span className={`mt-1 block text-xs ${row.status === "in-range" ? "text-emerald-300" : "text-amber-300"}`}>{differenceText(row)}</span></td>
                        <td className="py-3 pr-4"><span className="font-mono">{degrees(after?.value)}</span><span className={`mt-1 block text-xs ${after?.status === "in-range" ? "text-emerald-300" : "text-amber-300"}`}>{after ? differenceText(after) : "Unavailable"}</span></td>
                        <td className="py-3 pr-4 whitespace-nowrap text-slate-300">{row.metric.min}–{row.metric.max}°</td>
                        <td className="max-w-[230px] py-3 text-xs text-slate-300" title={sample?.reason}><span className={sample?.status === "too-far" ? "text-amber-300" : ""}>{label}</span>{sample && sample.status !== "report-only" && <span className="mt-1 block font-mono">Needed {Math.abs(sample.required).toFixed(1)}° · applied {Math.abs(sample.applied).toFixed(1)}°{sample.target != null && sample.required !== 0 ? ` · target ${sample.target.toFixed(1)}°` : ""}</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {referencePhase && comparable.length === 0 && <p className="mb-3 text-sm text-slate-400">No valid comparable angle at this marker. See unavailable metrics below.</p>}
          {separationRange && <div className="mt-4 rounded-lg bg-slate-800 p-3 text-sm text-slate-300">{([['Raw', report], ['Corrected', correctedReport]] as const).map(([label, sampled]) => {
            const peak = sampled?.separationPeak;
            const compared = peak ? compareAngleToRange(peak.value, separationRange.min, separationRange.max) : null;
            return <p key={label}><strong className="font-medium text-slate-100">{label} phase peak separation:</strong> {degrees(peak?.value)}{peak && ` at source ${peak.sourceTime.toFixed(2)} s`}{compared && ` · ${compared.status === "in-range" ? "In range" : "Out of range"}`}</p>;
          })}<p className="mt-1 text-xs text-slate-400">Sampled at {config.fps ?? 24} fps; the two peak times may differ. This is separate from the marker snapshot.</p></div>}
          {refused.length > 0 && <p className="mt-4 rounded-lg bg-amber-950/30 p-3 text-xs text-amber-200">Some samples elsewhere in this phase are also “{TOO_FAR_MESSAGE}”: {refusalMetrics.join(", ")}. Refusals are checked throughout the bake, not just at markers.</p>}
          {unavailable.length > 0 && (
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer text-slate-300">Unavailable reference metrics ({unavailable.length})</summary>
              <div className="mt-3 space-y-3">{unavailable.map((row) => <div key={row.metric.name} className="rounded-lg bg-slate-800/60 p-3"><p className="font-medium">{row.metric.name} · {row.metric.min}–{row.metric.max} {row.metric.unit} · Unavailable</p><p className="mt-1 text-xs text-slate-400">{row.reason}</p></div>)}</div>
            </details>
          )}
          {referencePhase && <p className="mt-4 text-xs leading-relaxed text-slate-400">Reference cue: {referencePhase.instruction}</p>}
        </>
      )}
      <p className="mt-5 text-xs leading-relaxed text-slate-400">Safe offsets ease across neighboring frames and toward zero before refused samples; transition samples may remain outside range. Required changes over 20° are refused, never partially clamped. Only elbow hinge and distributed spine quaternion tracks are changed. No knee, hip, translation, or foot-plant correction is applied.</p>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">These are estimates from the retargeted rig, whose proportions and joint centers can differ from the performer. Phase timing is manual. Range labels are evaluation comparisons—not a validated assessment, clinical advice, or a movement score.</p>
    </section>
  );
}
