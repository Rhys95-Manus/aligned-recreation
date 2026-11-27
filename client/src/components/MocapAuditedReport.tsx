import React from "react";
import type { MocapClipConfig } from "@/data/mocapClips";
import { getMocapAuditRows, countAuditedMocapComparisons, type AuditedMocapCheckpoint } from "@/lib/mocapAuditedComparisons";
import { NEW_MEASUREMENT_LABELS, MOCAP_MEASUREMENT_DEFINITIONS } from "@/lib/mocapMeasurements";

export default function MocapAuditedReport({ config, raw, corrected, selectedIndex }: { config: MocapClipConfig; raw: readonly AuditedMocapCheckpoint[]; corrected: readonly AuditedMocapCheckpoint[]; selectedIndex: number }) {
  const rows = getMocapAuditRows(config);
  const selected = raw[selectedIndex];
  const after = corrected[selectedIndex];
  const counts = countAuditedMocapComparisons(raw);
  const format = (v: number | null | undefined, unit: string) => v == null ? "Unavailable" : `${v.toFixed(1)}${unit.startsWith("percent") ? "%" : "°"}`;
  return <section className="mt-6 rounded-2xl border border-cyan-800/60 bg-slate-900/70 p-5 sm:p-6" aria-label="Audited mocap measurement report">
    <h2 className="text-xl font-semibold">Audited measurements · report-only expansion</h2>
    <p className="mt-2 text-sm text-slate-300">Correct body side and explicit convention conversions are applied here. Production reference values are unchanged. Ambiguous ranges are not compared. New measurements never drive correction.</p>
    <p className="mt-2 text-xs text-slate-400">All rotation baselines use the pelvis orientation at the first RAW trimmed frame, shared by both modes. Weight transfer is a pelvis-between-feet geometry proxy, not weight, center of mass, balance, force, or pressure. Shoulder external rotation is a guarded axial-orientation proxy, not clinical humeral rotation. Neither trunk tilt nor this rig measures individual lumbar extension.</p>
    <p className="mt-3 rounded-lg bg-slate-950/60 p-3 font-mono text-sm">Raw assigned checkpoints: {counts.inRange} in range / {counts.outOfRange} out of range / {counts.tooFar} legacy safety refusals / {counts.unavailable} unavailable or ambiguous</p>
    <p className="mt-2 text-xs text-slate-400">Counts are metric/checkpoint comparisons, not scores. “Too far” applies only to the existing elbow/spine 20° request test; all new or converted-only metrics are report-only. Flat ranges are explicitly mapped once to evaluation checkpoints, not invented phase-specific professional ranges.</p>
    {selected && <>
      <h3 className="mt-5 font-semibold">{selected.phase.name} · source {selected.sourceTime.toFixed(3)} s</h3>
      <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-xs" aria-label="Audited checkpoint comparisons">
        <thead className="text-slate-400"><tr><th className="p-2">Metric</th><th className="p-2">Measurer / side</th><th className="p-2">Convention / conversion</th><th className="p-2">Raw → existing corrected</th><th className="p-2">Unchanged range</th><th className="p-2">Status / limits</th></tr></thead>
        <tbody>{selected.comparisons.map((row,index) => {
          const changed = after?.comparisons.find(item => item.audit.metricName === row.audit.metricName);
          return <tr key={`${row.audit.metricName}-${index}`} className="border-t border-slate-800 align-top">
            <th className="max-w-[170px] p-2 font-medium">{row.audit.metricName}</th>
            <td className="max-w-[180px] p-2"><code>{row.measurer}</code><span className="mt-1 block text-slate-400">{row.audit.sideRole} → {row.audit.physicalSide}</span></td>
            <td className="max-w-[230px] p-2">{row.audit.convention}<span className="mt-1 block text-slate-400">{row.conversion}</span>{row.audit.convention === "flexion" && <span className="mt-1 block font-mono">Geometric interior: {format(row.geometricValue,"degrees")}</span>}</td>
            <td className="whitespace-nowrap p-2 font-mono">{format(row.value,row.unit)} → {format(changed?.value,row.unit)}{row.value === null && row.candidateValue !== null && <span className="mt-2 block text-amber-200">Unscored flexion candidate:<br />{format(row.candidateValue,row.unit)} → {format(changed?.candidateValue,row.unit)}</span>}</td>
            <td className="p-2 font-mono">{row.min}–{row.max} {row.unit}</td>
            <td className="max-w-[330px] p-2"><span className={row.status === "in-range" ? "text-green-300" : row.status === "out-of-range" ? "text-red-300" : "text-slate-300"}>{row.status}{row.tooFar ? " · too far under legacy correction cap" : ""}</span><span className="mt-1 block text-slate-400">{row.correctionPolicy === "report-only" ? "Report-only; no correction" : "Existing elbow/spine correction policy only"}</span><details className="mt-2 text-amber-200/90"><summary className="cursor-pointer">Audit rationale / limits</summary><p className="mt-2">{row.reason}</p></details></td>
          </tr>;
        })}</tbody>
      </table></div>
      {!selected.comparisons.length && <p className="mt-3 text-sm text-slate-400">No reference metric is assigned to this phase. All live geometry remains available in Full overlay mode.</p>}
    </>}
    <details className="mt-5"><summary className="cursor-pointer font-medium">Complete reference audit · {rows.length} metric occurrences</summary>
      <p className="mt-2 text-xs text-slate-400">Flat entries and phase entries are retained separately because their descriptions or conventions may disagree.</p>
      <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-xs" aria-label="Complete mocap reference audit">
        <thead className="text-slate-400"><tr><th className="p-2">Phase / metric</th><th className="p-2">Original description / note</th><th className="p-2">Side</th><th className="p-2">Convention / measurer</th><th className="p-2">Label issues / ambiguities</th></tr></thead>
        <tbody>{rows.map((row,index) => <tr key={`${row.phaseName}-${row.metricName}-${index}`} className="border-t border-slate-800 align-top"><th className="max-w-[220px] p-2 font-medium">{row.phaseName ?? "Flat whole-motion"}<span className="mt-1 block">{row.metricName}</span></th><td className="max-w-[330px] p-2 text-slate-300">{row.description}</td><td className="p-2">{row.sideRole} → {row.physicalSide}</td><td className="max-w-[190px] p-2">{row.convention}<code className="mt-1 block break-all">{row.measurer}</code><span className="mt-1 block text-slate-400">{row.resolution}</span></td><td className="max-w-[350px] p-2 text-amber-200">{[row.labelIssue,...row.ambiguities,row.rationale].filter(Boolean).join(" · ")}</td></tr>)}</tbody>
      </table></div>
    </details>
    <details className="mt-4"><summary className="cursor-pointer font-medium">Measurement definitions and limits</summary><dl className="mt-3 grid gap-3 sm:grid-cols-2">{Object.entries(MOCAP_MEASUREMENT_DEFINITIONS).map(([id,definition]) => <div key={id} className="rounded-lg bg-slate-950/50 p-3 text-xs"><dt className="font-semibold text-cyan-200">{NEW_MEASUREMENT_LABELS[id as keyof typeof NEW_MEASUREMENT_LABELS] ?? id}</dt><dd className="mt-2 text-slate-300">{definition.method}</dd><dd className="mt-2 text-amber-200/90">{definition.limits}</dd></div>)}</dl></details>
  </section>;
}
