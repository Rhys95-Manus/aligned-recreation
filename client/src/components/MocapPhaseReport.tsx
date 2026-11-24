import React from "react";
import type { MocapClipConfig } from "@/data/mocapClips";
import { MOCAP_ANGLE_LABELS, compareAngleToRange, getMocapReference, getMocapReferencePhase, type MocapAngleId, type PhaseAngleComparison } from "@/lib/mocapAngles";
import type { MocapPhaseMarkerReport } from "@/lib/mocapPipeline";
import { correctionAtMarker, requestMocapCorrection, TOO_FAR_MESSAGE, type CorrectedMocap } from "@/lib/mocapCorrection";
import type { AnchoredMocap, MocapPhaseTiming } from "@/lib/mocapPhaseAnchors";

function differenceText(row: PhaseAngleComparison): string {
  if (row.difference === null) return "Unavailable";
  if (row.difference === 0) return "In range · 0.0° difference";
  return `Out of range · ${Math.abs(row.difference).toFixed(1)}° ${row.direction}`;
}
const degrees = (value: number | null | undefined) => value != null ? `${value.toFixed(1)}°` : "Unavailable";
const seconds = (value: number | null | undefined) => value != null ? `${value.toFixed(3)} s` : "Not detected";
const candidateButtonClass = "rounded border border-slate-600 px-2 py-1 font-mono text-xs text-cyan-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300";

export default function MocapPhaseReport({ config, reports, correctedReports, correction, selectedIndex, onSelect, timing, detection, onSeekSource }: {
  config: MocapClipConfig;
  reports: readonly MocapPhaseMarkerReport[];
  correctedReports: readonly MocapPhaseMarkerReport[];
  correction: CorrectedMocap | null;
  selectedIndex: number;
  onSelect: (index: number) => void;
  timing?: readonly MocapPhaseTiming[];
  detection?: AnchoredMocap["detection"];
  /** Preview a candidate in the current readout; never replace a saved report. */
  onSeekSource?: (sourceTime: number) => void;
}) {
  const reference = getMocapReference(config);
  const report = reports[selectedIndex];
  const correctedReport = correctedReports[selectedIndex];
  const referencePhase = report ? getMocapReferencePhase(config, report.phase) : undefined;
  const explicitFlatAssignment = Boolean(report?.phase.referenceMetrics?.length && !reference?.phases?.length);
  const mappedFlatCheckpoints = config.phases.filter((phase) => phase.referenceMetrics?.length);
  const comparable = report?.comparisons.filter((row) => row.status !== "unavailable") ?? [];
  const unavailable = report?.comparisons.filter((row) => row.status === "unavailable") ?? [];
  const separationRange = referencePhase?.metrics.find((metric) => metric.name === "Hip-Shoulder Separation");
  const phaseSamples = correction?.samples.filter((sample) => sample.phaseIndex === selectedIndex) ?? [];
  const refused = phaseSamples.filter((sample) => sample.status === "too-far");
  const refusalMetrics = Array.from(new Set(refused.map((sample) => sample.metricName)));
  const selectedTiming = timing?.find((row) => row.phaseName === report?.phase.name);
  const fallbackPhases = detection ? config.phases.filter((phase) => phase.anchor && timing?.find((row) => row.phaseName === phase.name)?.autoSourceTime == null) : [];

  return (
    <section className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/70 p-5 sm:p-6" aria-label="Phase angle report">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Phase angle report · raw vs corrected</h2>
          <p className="mt-1 text-sm text-slate-400">Saved selected-checkpoint snapshots from both clips, independent of playback mode · limb interior angles: 180° straight, 90° bent.</p>
        </div>
        {reference && <div className="space-y-2 text-right">
          <span className={`inline-block rounded-lg border px-3 py-2 text-sm font-semibold ${reference.verificationLevel === "unverified" ? "border-amber-500/50 bg-amber-950/40 text-amber-200" : "border-slate-600 bg-slate-800 text-cyan-200"}`}>Reference verification: {reference.verificationLevel}</span>
          <p className="text-xs text-slate-400">Codebase reference: {reference.motionName}</p>
        </div>}
      </div>
      {!reference && <p role="status" className="mb-4 rounded-lg bg-amber-950/40 p-3 text-sm text-amber-200">No reference data for this motion ({config.referenceKey ?? config.id}). Geometry is still available; the corrected clip is an unchanged copy. No substitute ranges are applied.</p>}
      {reference?.verificationLevel === "unverified" && <p role="status" className="mb-4 rounded-lg bg-amber-950/40 p-3 text-sm text-amber-200">Unverified reference ranges are evaluation benchmarks, not validated biomechanical targets. Flat ranges require explicit per-checkpoint metric assignments; no phase-specific ranges are fabricated.</p>}
      {reference && !reference.phases?.length && <p className="mb-4 rounded-lg bg-amber-950/40 p-3 text-sm text-amber-200">This reference has flat whole-motion ranges, not phase-structured ranges. Explicit mapped checkpoint ranges are available when configured via referenceMetrics.{mappedFlatCheckpoints.length > 0 ? ` Configured checkpoints: ${mappedFlatCheckpoints.map((phase) => phase.name).join(", ")}. Only their named metrics are used; this does not validate a phase-specific benchmark.` : " No checkpoints have opted in; no ranges are substituted automatically."}</p>}
      <div className="mb-5 rounded-xl border border-slate-700 bg-slate-950/40 p-3 sm:p-4">
        <h3 className="font-semibold">Checkpoint timing · source timeline</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">Manual baselines and detected candidates remain separate. Anchors are resolved once from raw mocap before correction{detection ? ` at ${detection.sampleRate} Hz` : ""}; both saved reports use the selected checkpoint. Release / strike events are kinematic proxies, not observed ball separation or verified contact.</p>
        {config.phases.length > 0 && <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[660px] text-left text-xs" aria-label="Manual and detected checkpoint times">
            <thead className="text-slate-400"><tr><th className="pb-2 pr-3">Phase</th><th className="pb-2 pr-3">Manual baseline</th><th className="pb-2 pr-3">Detected candidate</th><th className="pb-2 pr-3">Selected checkpoint</th><th className="pb-2">Method / selection</th></tr></thead>
            <tbody>{config.phases.map((phase) => {
              const row = timing?.find((candidate) => candidate.phaseName === phase.name);
              const manualTime = row?.manualSourceTime ?? phase.checkpointTime ?? phase.startTime;
              const autoTime = row?.autoSourceTime;
              const selectedTime = row?.selectedSourceTime ?? phase.checkpointTime ?? phase.startTime;
              const selection = row?.timingSource === "auto" ? "Auto anchor selected" : config.phaseTiming === "manual" || phase.manualOverride ? "Manual override selected" : phase.anchor && row ? "Manual fallback selected" : "Configured checkpoint selected";
              return <tr key={phase.name} className="border-t border-slate-800">
                <th scope="row" className="py-2 pr-3 font-medium text-slate-200">{phase.name}</th>
                <td className="py-2 pr-3">{onSeekSource ? <button className={candidateButtonClass} onClick={() => onSeekSource(manualTime)} title={`Preview manual candidate for ${phase.name}; saved report is unchanged`}>{seconds(manualTime)}</button> : <span className="font-mono">{seconds(manualTime)}</span>}</td>
                <td className="py-2 pr-3">{autoTime != null ? onSeekSource ? <button className={candidateButtonClass} onClick={() => onSeekSource(autoTime)} title={`Preview detected candidate for ${phase.name}; saved report is unchanged`}>{seconds(autoTime)}</button> : <span className="font-mono">{seconds(autoTime)}</span> : <span className={phase.anchor && detection ? "text-amber-200" : "text-slate-400"}>{phase.anchor ? detection ? "Not detected / fallback" : "Pending detection" : "No event anchor"}</span>}</td>
                <td className="py-2 pr-3 font-mono text-cyan-200">{seconds(selectedTime)}<span className="mt-1 block font-sans text-slate-400">{row?.timingSource ?? "Configured"}</span></td>
                <td className="max-w-[300px] py-2 text-slate-300"><span>{row?.method ?? "Configured source-timeline checkpoint"}</span><span className="mt-1 block text-slate-400">{selection}</span></td>
              </tr>;
            })}</tbody>
          </table>
        </div>}
        {onSeekSource && <p className="mt-3 text-xs text-slate-400">Candidate buttons only pause and seek the viewer / current angle readout. They do not change the selected phase, timing configuration, or saved raw / corrected snapshots.</p>}
        {fallbackPhases.length > 0 && <p role="status" className="mt-3 rounded-lg bg-amber-950/40 p-3 text-xs text-amber-200">Auto anchoring unavailable for {fallbackPhases.map((phase) => phase.name).join(", ")}. Configured manual checkpoints are retained; no event time is invented.</p>}
        {detection && detection.warnings.length > 0 && <div role="status" className="mt-3 rounded-lg bg-amber-950/40 p-3 text-xs text-amber-200"><p className="font-semibold">Detection / fallback warnings</p><ul className="mt-2 list-disc space-y-1 pl-4">{detection.warnings.map((warning, index) => <li key={`${index}-${warning}`}>{warning}</li>)}</ul></div>}
      </div>
      {config.phases.length === 0 && <p className="text-sm text-slate-400">No phase checkpoints are configured for this motion.</p>}
      <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="group" aria-label="Choose saved phase checkpoint">
        {config.phases.map((phase, index) => (
          <button key={phase.name} disabled={!reports[index]} aria-pressed={selectedIndex === index} onClick={() => onSelect(index)} className={`rounded-xl border p-3 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:opacity-40 ${selectedIndex === index ? "border-cyan-400 bg-cyan-950/50 text-cyan-100" : "border-slate-700 text-slate-300 hover:bg-slate-800"}`}>
            <span className="mb-1 block text-xs text-slate-400">Checkpoint {index + 1} · {(phase.checkpointTime ?? phase.startTime).toFixed(3)} s</span>
            <span className="font-medium">{phase.name}</span>
            <span className="mt-1 block text-xs text-slate-400">Interval {phase.startTime.toFixed(3)}–{phase.endTime.toFixed(3)} s</span>
          </button>
        ))}
      </div>
      {report && (
        <>
          <div className="mb-4">
            <h3 className="font-semibold">{report.phase.name}</h3>
            <p className="mt-1 text-xs text-slate-400">Saved selected-checkpoint snapshot: source {report.sourceTime.toFixed(3)} s · clip {report.clipTime.toFixed(3)} s{selectedTiming ? ` · ${selectedTiming.timingSource} selection` : ""}. Selecting a card pauses and seeks this checkpoint, not necessarily the interval start; scrubbing and candidate previews do not change this saved sample.</p>
            {explicitFlatAssignment && <p className="mt-2 text-xs text-amber-200">Explicit flat-range checkpoint assignment: {report.phase.referenceMetrics?.join(", ")}. These are unverified whole-motion benchmark ranges mapped to this checkpoint by configuration, not published phase-specific ranges.</p>}
            {referencePhase && !explicitFlatAssignment && <p className="mt-2 text-xs text-slate-300">Structured comparison benchmark: {report.phase.referenceName ?? report.phase.name}. Reference verification level: {reference?.verificationLevel}.</p>}
            {report.phase.name === "Loaded / Ready" && <p className="mt-1 text-xs text-amber-200">The clip starts loaded, not in a verified neutral stance.</p>}
          </div>
          {reference?.phases?.length && !referencePhase ? <p className="mb-4 text-sm text-amber-200">No reference range is assigned to this configured phase. Check its exact referenceName; no other phase is substituted. Acceleration and Release are reported separately.</p> : null}
          {explicitFlatAssignment && !referencePhase && <p className="mb-4 text-sm text-amber-200">No configured flat metric names resolved to reference ranges at this checkpoint. Geometry is shown without substitute ranges.</p>}
          {!referencePhase && <dl className="mb-4 grid gap-3 sm:grid-cols-2">{(Object.keys(MOCAP_ANGLE_LABELS) as MocapAngleId[]).map((id) => <div key={id} className="rounded-lg bg-slate-800 p-3"><dt className="text-xs text-slate-400">{MOCAP_ANGLE_LABELS[id]}</dt><dd className="mt-1 font-mono text-sm">Raw {degrees(report.angles[id].value)} · corrected {degrees(correctedReport?.angles[id].value)} · No reference range</dd></div>)}</dl>}
          {comparable.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[740px] text-left text-sm" aria-label="Checkpoint joint angle comparisons">
                <thead className="text-xs uppercase tracking-wide text-slate-400"><tr><th className="pb-3 pr-4">Angle</th><th className="pb-3 pr-4">Raw mocap</th><th className="pb-3 pr-4">Metric-corrected</th><th className="pb-3 pr-4">Reference</th><th className="pb-3">Correction / safety</th></tr></thead>
                <tbody>
                  {comparable.map((row) => {
                    const after = correctedReport?.comparisons.find((candidate) => candidate.metric.name === row.metric.name);
                    const candidate = correction && row.measurement ? correctionAtMarker(correction, selectedIndex, row.measurement, report.clipTime) : undefined;
                    // A checkpoint may equal the next phase's onset. Never present
                    // a neighboring frame's correction as this exact checkpoint.
                    const sample = candidate && Math.abs(candidate.clipTime - report.clipTime) < 1e-5 ? candidate : undefined;
                    const correctable = row.measurement === "rightElbowAngle" || row.measurement === "leftElbowAngle" || row.measurement === "hipShoulderSeparation";
                    const knee = row.measurement === "rightKneeAngle" || row.measurement === "leftKneeAngle";
                    const checkpointRequest = !sample && correctable ? requestMocapCorrection(row.value, row.metric.min, row.metric.max) : undefined;
                    const label = sample?.status === "too-far" ? TOO_FAR_MESSAGE : sample?.status === "report-only" ? "Report-only · knees / foot planting" : sample?.status === "corrected" ? "Corrected" : sample?.status === "in-range" ? "Already in range · unchanged" : sample?.status === "easing" ? "Easing / residual deviation" : sample ? "Unavailable" : knee ? "Report-only · knees / foot planting" : checkpointRequest?.status === "too-far" ? TOO_FAR_MESSAGE : checkpointRequest?.status === "in-range" ? "Checkpoint in range · comparison only" : checkpointRequest?.status === "correctable" ? "Checkpoint correction request · comparison only" : "Unavailable";
                    const tooFar = sample?.status === "too-far" || checkpointRequest?.status === "too-far";
                    return (
                      <tr key={row.metric.name} className="border-t border-slate-800">
                        <th scope="row" className="py-3 pr-4 font-medium">{row.metric.name}{row.measurement === "hipShoulderSeparation" && <span className="mt-1 block text-xs font-normal text-slate-400">Horizontal axes · checkpoint snapshot, not peak</span>}</th>
                        <td className="py-3 pr-4"><span className="font-mono">{degrees(row.value)}</span><span className={`mt-1 block text-xs ${row.status === "in-range" ? "text-emerald-300" : "text-amber-300"}`}>{differenceText(row)}</span></td>
                        <td className="py-3 pr-4"><span className="font-mono">{degrees(after?.value)}</span><span className={`mt-1 block text-xs ${after?.status === "in-range" ? "text-emerald-300" : "text-amber-300"}`}>{after ? differenceText(after) : "Unavailable"}</span></td>
                        <td className="whitespace-nowrap py-3 pr-4 text-slate-300">{row.metric.min}–{row.metric.max}°{explicitFlatAssignment && <span className="mt-1 block whitespace-normal text-xs text-amber-200">Explicit flat benchmark · unverified</span>}</td>
                        <td className="max-w-[270px] py-3 text-xs text-slate-300" title={sample?.reason}>
                          <span className={tooFar ? "text-amber-300" : ""}>{label}</span>
                          {sample && sample.status !== "report-only" && <span className="mt-1 block font-mono">Needed {Math.abs(sample.required).toFixed(1)}° · applied {Math.abs(sample.applied).toFixed(1)}°{sample.target != null && sample.required !== 0 ? ` · target ${sample.target.toFixed(1)}°` : ""}</span>}
                          {!sample && checkpointRequest && <>
                            <span className="mt-1 block">Checkpoint comparison only; neighboring phase owns correction.</span>
                            <span className="mt-1 block font-mono">{checkpointRequest.status !== "unavailable" ? `Needed ${Math.abs(checkpointRequest.required).toFixed(1)}°` : "Needed unavailable"} · applied unavailable{checkpointRequest.target != null && checkpointRequest.required !== 0 ? ` · target ${checkpointRequest.target.toFixed(1)}°` : ""}</span>
                          </>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {referencePhase && comparable.length === 0 && <p className="mb-3 text-sm text-slate-400">No valid comparable angle at this checkpoint. See unavailable metrics below.</p>}
          {separationRange && <div className="mt-4 rounded-lg bg-slate-800 p-3 text-sm text-slate-300">{([['Raw', report], ['Corrected', correctedReport]] as const).map(([label, sampled]) => {
            const peak = sampled?.separationPeak;
            const compared = peak ? compareAngleToRange(peak.value, separationRange.min, separationRange.max) : null;
            return <p key={label}><strong className="font-medium text-slate-100">{label} phase peak separation:</strong> {degrees(peak?.value)}{peak && ` at source ${peak.sourceTime.toFixed(3)} s`}{compared && ` · ${compared.status === "in-range" ? "In range" : "Out of range"}`}</p>;
          })}<p className="mt-1 text-xs text-slate-400">Sampled across the phase interval {report.phase.startTime.toFixed(3)}–{report.phase.endTime.toFixed(3)} s at {config.fps ?? 24} fps; the two peak times may differ. This is separate from the selected-checkpoint snapshot{explicitFlatAssignment ? " and uses the explicitly mapped flat benchmark, not a phase-validated range" : ""}.</p></div>}
          {refused.length > 0 && <p className="mt-4 rounded-lg bg-amber-950/30 p-3 text-xs text-amber-200">Some samples in this phase are “{TOO_FAR_MESSAGE}”: {refusalMetrics.join(", ")}. Refusals are checked throughout the bake, not just at checkpoints.</p>}
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
      <p className="mt-3 text-xs leading-relaxed text-slate-500">These are estimates from the retargeted rig, whose proportions and joint centers can differ from the performer. Raw motion anchors are kinematic proxies with manual fallback, not validated ball-release / contact observations. Reference verification labels describe the stored reference, not this rig or event detection. Range labels are evaluation comparisons—not a validated assessment, clinical advice, or a motion score.</p>
    </section>
  );
}
