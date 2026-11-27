import type { MocapMeasurementId } from "@/lib/mocapMeasurements";

/** Read-only interpretation metadata. Source ranges are read at comparison time;
 * this data NEVER changes professionalReferences or feeds correction/scoring.
 * Every flat and phase occurrence was audited separately from its name AND text.
 */
export interface MocapReferenceAuditRow {
  referenceKey: string; clipId: string; phaseName: string | null; metricName: string;
  description: string; min: number; max: number; unit: string;
  sideRole: string; physicalSide: string;
  convention: "interior" | "flexion" | "relative-rotation" | "percent" | "ambiguous" | "unsupported";
  measurer: MocapMeasurementId | "unsupported";
  labelIssue: string; ambiguities: string[];
  resolution: "resolved" | "proxy" | "ambiguous" | "unsupported";
  rationale: string;
}
export const mocapReferenceAudit: readonly MocapReferenceAuditRow[] = [
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": null,
    "metricName": "Shoulder External Rotation",
    "description": "Maximum shoulder rotation when arm is cocked back",
    "min": 125,
    "max": 145,
    "unit": "degrees",
    "sideRole": "throwing",
    "physicalSide": "right",
    "convention": "relative-rotation",
    "measurer": "rightShoulderExternalRotationProxy",
    "labelIssue": "Clinical shoulder external rotation is overstated by an uncalibrated arm-rotation proxy.",
    "ambiguities": [
      "The cocked-back throwing-arm wording supports an arm axial-rotation interpretation, but does not specify anatomical axes or calibration.",
      "The proxy is an unsigned angle of projected forearm versus projected trunk-up in the plane normal to the upper arm; it cannot distinguish calibrated internal from external rotation.",
      "Proxy validity requires actual elbow interior angle 45–135 degrees and nondegenerate projections; the ambiguous flat Elbow Flexion range does not establish that gate.",
      "Max-cocking detection uses minimum throwing-elbow interior angle, not observed maximum shoulder external rotation."
    ],
    "resolution": "proxy",
    "rationale": "Label AND description concern the cocked throwing arm, not torso turn, so bind the right arm axial-rotation proxy only as a qualified proxy. It is not clinical glenohumeral ER and the immutable 125–145 degree reference is not calibrated to its zero or sign. Apply the measured-elbow validity gate and disclose definition/calibration limits; a numerical in-range result would not establish clinical ER. Retain this flat maximum definition without inventing a phase assignment. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": null,
    "metricName": "Elbow Flexion",
    "description": "Elbow bend at maximal shoulder external rotation",
    "min": 90,
    "max": 110,
    "unit": "degrees",
    "sideRole": "throwing",
    "physicalSide": "right",
    "convention": "ambiguous",
    "measurer": "rightElbowAngle",
    "labelIssue": "Flexion label and elbow-bend description do not establish ROM flexion versus interior angle.",
    "ambiguities": [
      "Description says elbow bend, not its angle zero or whether straight is 0 or 180 degrees.",
      "Registry-wide interior-angle claim is not occurrence-specific confirmation of this research-style max-external-rotation definition.",
      "Minimum elbow angle is a timing proxy, not confirmation of maximal shoulder external rotation."
    ],
    "resolution": "ambiguous",
    "rationale": "The max-shoulder-external-rotation context identifies the throwing elbow; detected activeSide makes it right. rightElbowAngle measures the adjacent-segment interior angle with 180 degrees straight. The wording does not settle interior versus anatomical flexion, and 90–110 alone cannot settle it. Keep 90–110 unchanged; if ROM flexion is confirmed, compare using a documented 180-minus-angle conversion rather than silently using the interior value. Convention and research-to-rig compatibility remain unverified; no phase is assigned. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": null,
    "metricName": "Hip Rotation",
    "description": "Total hip rotation from foot contact to follow-through",
    "min": 50,
    "max": 70,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "relative-rotation",
    "measurer": "hipRotation",
    "labelIssue": "Total hip rotation over an event interval is not a single first-frame-relative pelvis angle.",
    "ambiguities": [
      "Total may mean net angular change or accumulated/peak excursion.",
      "Reference interval begins at foot contact, but the new measurer zero is first-frame pelvis orientation.",
      "No verified foot-contact endpoint or interval aggregation is supplied by this definition."
    ],
    "resolution": "ambiguous",
    "rationale": "This description explicitly defines whole-motion change from foot contact to follow-through, not an absolute open angle. hipRotation supplies pelvis orientation relative to first-frame pelvis orientation. A validated foot-contact-to-follow-through temporal delta/aggregation could cancel that baseline, but a raw checkpoint angle cannot be compared to this total. Retain 50–70 and phaseName null; do not substitute a release angle or invent a phase."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": null,
    "metricName": "Hip-Shoulder Separation",
    "description": "Peak dynamic separation between hip and shoulder rotation during late cocking",
    "min": 30,
    "max": 45,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "relative-rotation",
    "measurer": "hipShoulderSeparation",
    "labelIssue": "No label conflict; separation is a between-axis rotation, not a limb interior angle.",
    "ambiguities": [
      "Reference does not state a clinical anatomical-axis protocol; the rig uses horizontal pelvis and shoulder axes.",
      "A single auto max-cocking checkpoint need not be the peak dynamic separation."
    ],
    "resolution": "resolved",
    "rationale": "The described hip-versus-shoulder rotation separation matches the unsigned horizontal difference of left-to-right pelvis and shoulder axes. No absolute target direction is needed for this inter-axis difference. The flat definition is a peak during late cocking, so obtain a peak over the corresponding interval rather than assume any elbow-minimum checkpoint is that peak. The semantic measurer binding is resolved; phaseName remains null and the source study claim is not independently verified."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": null,
    "metricName": "Spine Extension",
    "description": "Lumbar extension at maximal shoulder external rotation",
    "min": 18,
    "max": 28,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "unsupported",
    "measurer": "unsupported",
    "labelIssue": "Lumbar spinal extension cannot be relabeled as gross trunk tilt.",
    "ambiguities": [
      "No segment-level lumbar curvature/extension measurer or clinical neutral calibration is provided.",
      "trunkTilt is unsigned hip-center-to-shoulder-center axis versus world vertical; it does not measure lumbar extension."
    ],
    "resolution": "unsupported",
    "rationale": "The verbatim description specifically requires lumbar extension at maximum shoulder external rotation. That anatomical quantity is not equivalent to either a whole-torso lean angle or a signed backward trunk angle. Do not bind trunkTilt, do not convert 18–28 into a lean benchmark, and do not assign a flat metric to a phase."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": null,
    "metricName": "Knee Flexion",
    "description": "Stride leg knee bend",
    "min": 30,
    "max": 50,
    "unit": "degrees",
    "sideRole": "stride",
    "physicalSide": "left",
    "convention": "ambiguous",
    "measurer": "leftKneeAngle",
    "labelIssue": "Stride knee bend leaves flexion-zero versus interior-zero unspecified; flat and phase knee semantics must not be collapsed.",
    "ambiguities": [
      "Stride leg knee bend does not explicitly define anatomical ROM flexion or an interior angle.",
      "Registry header cannot settle the possible conflict between the flat knee-bend definition and phase knee-flexion labels.",
      "No event/phase is specified in the flat description."
    ],
    "resolution": "ambiguous",
    "rationale": "The stride leg is the detected left lead/plant leg. leftKneeAngle is an interior angle with 180 degrees straight. Unlike an explicit ROM-flexion definition, this description only says knee bend; the 30–50 magnitude is not sufficient to infer its convention. Clinical flexion is a plausible but unverified interpretation, requiring 180-minus-interior conversion if confirmed. Do not silently compare 30–50 to the interior measurer, replace it with any phase range, or invent a phase. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": null,
    "metricName": "Foot Positioning",
    "description": "Front foot angle relative to target line",
    "min": 35,
    "max": 55,
    "unit": "degrees",
    "sideRole": "lead",
    "physicalSide": "left",
    "convention": "unsupported",
    "measurer": "unsupported",
    "labelIssue": "Foot-positioning angle is not a supported knee, hip, or shoulder metric.",
    "ambiguities": [
      "Front-foot orientation relative to a target line has no allowed validated measurer.",
      "Absolute target direction is not configured."
    ],
    "resolution": "unsupported",
    "rationale": "Front means the detected left lead foot, but this is a foot-axis-to-target-line angle. Neither leftKneeAngle nor hipRotation measures it, and no target-line/foot orientation measurer is available. Keep the immutable 35–55 degree range without fabricated mapping or phase assignment. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": null,
    "metricName": "Weight Transfer",
    "description": "Percentage of weight transferred from back to front foot",
    "min": 60,
    "max": 80,
    "unit": "percent",
    "sideRole": "lead",
    "physicalSide": "left",
    "convention": "percent",
    "measurer": "weightTransfer",
    "labelIssue": "Weight/force transfer is represented only by a geometric lead-foot position proxy.",
    "ambiguities": [
      "Pelvis position between feet is not ground-reaction force, mass distribution, or measured percentage body weight.",
      "The geometry proxy is not validated against the professional reference percentage."
    ],
    "resolution": "proxy",
    "rationale": "Description explicitly states back-to-front transfer, and front is the detected left lead foot. weightTransfer measures pelvis-center position between the feet toward that lead foot, not force or actual weight. Lead direction is semantically compatible, permitting only a labeled geometric proxy for 60–80 percent. No clinical weight claim or flat-to-phase assignment is made. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Neutral / Ready Position",
    "metricName": "Weight Distribution",
    "description": "Note: Balanced base\nUnit: percent\nRelated flat description (distribution/transfer normalization is not established) [Weight Transfer]: Percentage of weight transferred from back to front foot",
    "min": -5,
    "max": 5,
    "unit": "percent",
    "sideRole": "both",
    "physicalSide": "both",
    "convention": "percent",
    "measurer": "weightTransfer",
    "labelIssue": "Balanced signed distribution percentage is not the new lead-foot geometric percentage.",
    "ambiguities": [
      "Symmetric -5 to 5 requires an explicit zero-centered conversion; its zero is not a foot endpoint.",
      "Registry prose describes heel/toe bias, whereas quarterback descriptions concern back/front feet.",
      "Geometry cannot measure actual weight distribution."
    ],
    "resolution": "ambiguous",
    "rationale": "Balanced base concerns both feet. The related flat definition refers to back-to-front transfer, but does not define the signed distribution scale. The new pelvis-center-between-feet lead-foot percentage does not have this documented centered zero. An explicit normalization/offset and direction convention is required; no conversion or comparison is assumed. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Neutral / Ready Position",
    "metricName": "Back Knee Flexion",
    "description": "Note: Athletic bend\nUnit: degrees\nRelated flat description (stride leg only; not automatically a back-leg or extension definition) [Knee Flexion]: Stride leg knee bend",
    "min": 150,
    "max": 170,
    "unit": "degrees",
    "sideRole": "back",
    "physicalSide": "right",
    "convention": "ambiguous",
    "measurer": "rightKneeAngle",
    "labelIssue": "Flexion label and qualitative coaching note do not explicitly define interior versus ROM flexion.",
    "ambiguities": [
      "Occurrence note does not define straight-leg zero or the angle between adjacent segments.",
      "The registry-wide interior header and existing clip binding do not independently validate this specific flexion definition.",
      "Related flat Knee Flexion is stride-leg bend and is not a definition of back-knee flexion or this phase's angle convention."
    ],
    "resolution": "ambiguous",
    "rationale": "Role is explicit in the metric name, so detected laterality resolves the limb even though the convention remains unverified. The note 'Athletic bend' describes coaching purpose, not an angle zero. The apparent fit of this range to a knee interior angle is not sufficient evidence by itself. The clip's existing binding is the correct side's interior measurer, but direct comparison requires confirming that convention; if ROM flexion is intended, an explicit 180-minus-angle conversion is needed. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Neutral / Ready Position",
    "metricName": "Lead Knee Flexion",
    "description": "Note: Ready to step\nUnit: degrees\nRelated flat description (stride leg only; not automatically a back-leg or extension definition) [Knee Flexion]: Stride leg knee bend",
    "min": 150,
    "max": 170,
    "unit": "degrees",
    "sideRole": "lead",
    "physicalSide": "left",
    "convention": "ambiguous",
    "measurer": "leftKneeAngle",
    "labelIssue": "Flexion label and qualitative coaching note do not explicitly define interior versus ROM flexion.",
    "ambiguities": [
      "Occurrence note does not define straight-leg zero or the angle between adjacent segments.",
      "The registry-wide interior header and existing clip binding do not independently validate this specific flexion definition.",
      "Related flat Knee Flexion is stride-leg bend and is not a definition of back-knee flexion or this phase's angle convention."
    ],
    "resolution": "ambiguous",
    "rationale": "Role is explicit in the metric name, so detected laterality resolves the limb even though the convention remains unverified. The note 'Ready to step' describes coaching purpose, not an angle zero. The apparent fit of this range to a knee interior angle is not sufficient evidence by itself. The clip's existing binding is the correct side's interior measurer, but direct comparison requires confirming that convention; if ROM flexion is intended, an explicit 180-minus-angle conversion is needed. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Neutral / Ready Position",
    "metricName": "Spine Angle",
    "description": "Note: Tall posture\nUnit: degrees\nRelated flat description (lumbar extension is NOT the same quantity as gross trunk posture) [Spine Extension]: Lumbar extension at maximal shoulder external rotation",
    "min": 0,
    "max": 10,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "relative-rotation",
    "measurer": "trunkTilt",
    "labelIssue": "Spine Angle denotes gross posture here; trunkTilt is not a spinal-segment or lumbar-extension measurement.",
    "ambiguities": [
      "Tall posture is represented by a gross torso-axis-to-world-vertical proxy, not spinal curvature.",
      "The related flat Spine Extension description specifies lumbar extension and is explicitly not an equivalent definition."
    ],
    "resolution": "proxy",
    "rationale": "The note 'Tall posture' and phase tall-spine context support generic near-upright gross trunk posture, with no requested backward/forward sign in this occurrence. trunkTilt is the unsigned hip-center-to-shoulder-center axis versus world vertical, allowing a qualified posture proxy for this unsigned range. Do not call it lumbar extension or claim equivalence to the related flat anatomical definition; the registry Spine Lean from-vertical remark is only supporting gross-posture context."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Neutral / Ready Position",
    "metricName": "Hip Rotation",
    "description": "Note: Closed hips\nUnit: degrees\nMatching flat description [Hip Rotation]: Total hip rotation from foot contact to follow-through",
    "min": 0,
    "max": 10,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "hipRotation",
    "labelIssue": "Phase hip opening/orientation is not the matching flat total foot-contact-to-follow-through rotation.",
    "ambiguities": [
      "Absolute target direction is not configured.",
      "New measurer is relative to first-frame pelvis orientation, not calibrated target-line open/closed orientation.",
      "Neither note nor unit establishes that reference zero and sign equal the first-frame-pelvis baseline.",
      "Matching flat Hip Rotation defines a temporal total, not this phase orientation."
    ],
    "resolution": "ambiguous",
    "rationale": "The phase context (Closed hips; unit degrees) describes hips or torso shoulders opening/closing toward the throwing target. hipRotation measures horizontal-axis orientation relative to first-frame pelvis orientation. No absolute target direction is configured, so an open/closed target-facing range cannot be silently compared to a relative-baseline value, even when the unit omits the word open. Require calibrated target direction/reference zero and validated sign before direct comparison; no invented offset is applied. The flat total-rotation description remains distinct."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Neutral / Ready Position",
    "metricName": "Shoulder Rotation",
    "description": "Note: Closed shoulders\nUnit: degrees\nRelated flat description (arm cocking is NOT the same quantity as torso shoulder turn) [Shoulder External Rotation]: Maximum shoulder rotation when arm is cocked back",
    "min": 0,
    "max": 10,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "shoulderTurn",
    "labelIssue": "Phase shoulder rotation is torso shoulder turn, not the flat cocked-arm Shoulder External Rotation.",
    "ambiguities": [
      "Absolute target direction is not configured.",
      "New measurer is relative to first-frame pelvis orientation, not calibrated target-line open/closed orientation.",
      "Neither note nor unit establishes that reference zero and sign equal the first-frame-pelvis baseline.",
      "The related flat shoulder external-rotation description concerns the arm and supplies no torso-turn zero."
    ],
    "resolution": "ambiguous",
    "rationale": "The phase context (Closed shoulders; unit degrees) describes hips or torso shoulders opening/closing toward the throwing target. shoulderTurn measures horizontal-axis orientation relative to first-frame pelvis orientation. No absolute target direction is configured, so an open/closed target-facing range cannot be silently compared to a relative-baseline value, even when the unit omits the word open. Require calibrated target direction/reference zero and validated sign before direct comparison; no invented offset is applied. Use torso shoulderTurn as the candidate, never an arm external-rotation proxy; the flat cocked-arm definition is explicitly not a semantic match."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Neutral / Ready Position",
    "metricName": "Throwing Elbow Flexion",
    "description": "Note: Relaxed arm\nUnit: degrees\nRelated flat description (max-cocking elbow bend; not automatically a non-throwing-arm or extension definition) [Elbow Flexion]: Elbow bend at maximal shoulder external rotation",
    "min": 80,
    "max": 120,
    "unit": "degrees",
    "sideRole": "throwing",
    "physicalSide": "right",
    "convention": "ambiguous",
    "measurer": "rightElbowAngle",
    "labelIssue": "Elbow flexion/bend wording does not settle ROM flexion versus interior-angle convention.",
    "ambiguities": [
      "Occurrence note provides no straight-arm zero or adjacent-segment angle definition.",
      "A compact or L-shaped elbow does not disambiguate flexion versus interior convention near a right angle.",
      "Related flat Elbow Flexion also says elbow bend without establishing its zero."
    ],
    "resolution": "ambiguous",
    "rationale": "The explicit throwing/non-throwing role maps to the detected right arm, so side selection is resolved. The note 'Relaxed arm' does not establish an interior-angle convention. An L-shape or the range magnitude alone cannot settle whether the source uses flexion or its supplementary interior angle. Use the named elbow interior measurer only after convention confirmation; preserve this occurrence and do not silently convert or rely on the blanket registry header/clip binding. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Neutral / Ready Position",
    "metricName": "Non-Throwing Elbow Flexion",
    "description": "Note: Balanced counter\nUnit: degrees\nRelated flat description (max-cocking elbow bend; not automatically a non-throwing-arm or extension definition) [Elbow Flexion]: Elbow bend at maximal shoulder external rotation",
    "min": 70,
    "max": 120,
    "unit": "degrees",
    "sideRole": "non-throwing",
    "physicalSide": "left",
    "convention": "ambiguous",
    "measurer": "leftElbowAngle",
    "labelIssue": "Elbow flexion/bend wording does not settle ROM flexion versus interior-angle convention.",
    "ambiguities": [
      "Occurrence note provides no straight-arm zero or adjacent-segment angle definition.",
      "A compact or L-shaped elbow does not disambiguate flexion versus interior convention near a right angle.",
      "Related flat Elbow Flexion describes the throwing elbow at maximal shoulder ER; it cannot supply a phase-specific non-throwing or extension convention."
    ],
    "resolution": "ambiguous",
    "rationale": "The explicit throwing/non-throwing role maps to the detected left arm, so side selection is resolved. The note 'Balanced counter' does not establish an interior-angle convention. An L-shape or the range magnitude alone cannot settle whether the source uses flexion or its supplementary interior angle. Use the named elbow interior measurer only after convention confirmation; preserve this occurrence and do not silently convert or rely on the blanket registry header/clip binding. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Early Cocking",
    "metricName": "Weight Distribution",
    "description": "Note: Load the back leg\nUnit: percent\nRelated flat description (distribution/transfer normalization is not established) [Weight Transfer]: Percentage of weight transferred from back to front foot",
    "min": -20,
    "max": -10,
    "unit": "percent",
    "sideRole": "back",
    "physicalSide": "right",
    "convention": "percent",
    "measurer": "weightTransfer",
    "labelIssue": "Negative back-leg distribution range is not directly a lead-foot geometric percentage.",
    "ambiguities": [
      "-20 to -10 is a signed bias, not a documented percentage coordinate toward the lead foot.",
      "Mapping back-leg loading to the lead-foot proxy needs an explicit sign/offset/normalization conversion.",
      "Registry heel/toe convention conflicts with phase back-leg wording; geometry is not force."
    ],
    "resolution": "ambiguous",
    "rationale": "Load the back leg explicitly identifies the detected right trailing leg. weightTransfer is directed toward the left lead foot, not the right back foot. The related flat back-to-front description does not supply the signed scale conversion needed here; do not negate or complement the range by assumption. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Early Cocking",
    "metricName": "Back Knee Flexion",
    "description": "Note: Absorb load\nUnit: degrees\nRelated flat description (stride leg only; not automatically a back-leg or extension definition) [Knee Flexion]: Stride leg knee bend",
    "min": 140,
    "max": 160,
    "unit": "degrees",
    "sideRole": "back",
    "physicalSide": "right",
    "convention": "ambiguous",
    "measurer": "rightKneeAngle",
    "labelIssue": "Flexion label and qualitative coaching note do not explicitly define interior versus ROM flexion.",
    "ambiguities": [
      "Occurrence note does not define straight-leg zero or the angle between adjacent segments.",
      "The registry-wide interior header and existing clip binding do not independently validate this specific flexion definition.",
      "Related flat Knee Flexion is stride-leg bend and is not a definition of back-knee flexion or this phase's angle convention."
    ],
    "resolution": "ambiguous",
    "rationale": "Role is explicit in the metric name, so detected laterality resolves the limb even though the convention remains unverified. The note 'Absorb load' describes coaching purpose, not an angle zero. The apparent fit of this range to a knee interior angle is not sufficient evidence by itself. The clip's existing binding is the correct side's interior measurer, but direct comparison requires confirming that convention; if ROM flexion is intended, an explicit 180-minus-angle conversion is needed. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Early Cocking",
    "metricName": "Lead Knee Flexion",
    "description": "Note: Free to pivot\nUnit: degrees\nRelated flat description (stride leg only; not automatically a back-leg or extension definition) [Knee Flexion]: Stride leg knee bend",
    "min": 150,
    "max": 170,
    "unit": "degrees",
    "sideRole": "lead",
    "physicalSide": "left",
    "convention": "ambiguous",
    "measurer": "leftKneeAngle",
    "labelIssue": "Flexion label and qualitative coaching note do not explicitly define interior versus ROM flexion.",
    "ambiguities": [
      "Occurrence note does not define straight-leg zero or the angle between adjacent segments.",
      "The registry-wide interior header and existing clip binding do not independently validate this specific flexion definition.",
      "Related flat Knee Flexion is stride-leg bend and is not a definition of back-knee flexion or this phase's angle convention."
    ],
    "resolution": "ambiguous",
    "rationale": "Role is explicit in the metric name, so detected laterality resolves the limb even though the convention remains unverified. The note 'Free to pivot' describes coaching purpose, not an angle zero. The apparent fit of this range to a knee interior angle is not sufficient evidence by itself. The clip's existing binding is the correct side's interior measurer, but direct comparison requires confirming that convention; if ROM flexion is intended, an explicit 180-minus-angle conversion is needed. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Early Cocking",
    "metricName": "Spine Angle",
    "description": "Note: Stay tall\nUnit: degrees\nRelated flat description (lumbar extension is NOT the same quantity as gross trunk posture) [Spine Extension]: Lumbar extension at maximal shoulder external rotation",
    "min": 0,
    "max": 10,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "relative-rotation",
    "measurer": "trunkTilt",
    "labelIssue": "Spine Angle denotes gross posture here; trunkTilt is not a spinal-segment or lumbar-extension measurement.",
    "ambiguities": [
      "Tall posture is represented by a gross torso-axis-to-world-vertical proxy, not spinal curvature.",
      "The related flat Spine Extension description specifies lumbar extension and is explicitly not an equivalent definition."
    ],
    "resolution": "proxy",
    "rationale": "The note 'Stay tall' and phase tall-spine context support generic near-upright gross trunk posture, with no requested backward/forward sign in this occurrence. trunkTilt is the unsigned hip-center-to-shoulder-center axis versus world vertical, allowing a qualified posture proxy for this unsigned range. Do not call it lumbar extension or claim equivalence to the related flat anatomical definition; the registry Spine Lean from-vertical remark is only supporting gross-posture context."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Early Cocking",
    "metricName": "Hip Rotation",
    "description": "Note: Hips start first\nUnit: degrees open\nMatching flat description [Hip Rotation]: Total hip rotation from foot contact to follow-through",
    "min": 10,
    "max": 25,
    "unit": "degrees open",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "hipRotation",
    "labelIssue": "Phase hip opening/orientation is not the matching flat total foot-contact-to-follow-through rotation.",
    "ambiguities": [
      "Absolute target direction is not configured.",
      "New measurer is relative to first-frame pelvis orientation, not calibrated target-line open/closed orientation.",
      "Neither note nor unit establishes that reference zero and sign equal the first-frame-pelvis baseline.",
      "Matching flat Hip Rotation defines a temporal total, not this phase orientation."
    ],
    "resolution": "ambiguous",
    "rationale": "The phase context (Hips start first; unit degrees open) describes hips or torso shoulders opening/closing toward the throwing target. hipRotation measures horizontal-axis orientation relative to first-frame pelvis orientation. No absolute target direction is configured, so an open/closed target-facing range cannot be silently compared to a relative-baseline value, even when the unit omits the word open. Require calibrated target direction/reference zero and validated sign before direct comparison; no invented offset is applied. The flat total-rotation description remains distinct."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Early Cocking",
    "metricName": "Shoulder Rotation",
    "description": "Note: Shoulders stay closed\nUnit: degrees open\nRelated flat description (arm cocking is NOT the same quantity as torso shoulder turn) [Shoulder External Rotation]: Maximum shoulder rotation when arm is cocked back",
    "min": 0,
    "max": 10,
    "unit": "degrees open",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "shoulderTurn",
    "labelIssue": "Phase shoulder rotation is torso shoulder turn, not the flat cocked-arm Shoulder External Rotation.",
    "ambiguities": [
      "Absolute target direction is not configured.",
      "New measurer is relative to first-frame pelvis orientation, not calibrated target-line open/closed orientation.",
      "Neither note nor unit establishes that reference zero and sign equal the first-frame-pelvis baseline.",
      "The related flat shoulder external-rotation description concerns the arm and supplies no torso-turn zero."
    ],
    "resolution": "ambiguous",
    "rationale": "The phase context (Shoulders stay closed; unit degrees open) describes hips or torso shoulders opening/closing toward the throwing target. shoulderTurn measures horizontal-axis orientation relative to first-frame pelvis orientation. No absolute target direction is configured, so an open/closed target-facing range cannot be silently compared to a relative-baseline value, even when the unit omits the word open. Require calibrated target direction/reference zero and validated sign before direct comparison; no invented offset is applied. Use torso shoulderTurn as the candidate, never an arm external-rotation proxy; the flat cocked-arm definition is explicitly not a semantic match."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Early Cocking",
    "metricName": "Throwing Elbow Height",
    "description": "Note: Elbow up, not flared\nUnit: degrees from shoulder level\nMatching flat description: none; no flat definition of this quantity is supplied.",
    "min": -5,
    "max": 5,
    "unit": "degrees from shoulder level",
    "sideRole": "throwing",
    "physicalSide": "right",
    "convention": "unsupported",
    "measurer": "unsupported",
    "labelIssue": "Elbow height relative to shoulder level is not elbow flexion or arm axial rotation.",
    "ambiguities": [
      "No allowed measurer implements elbow-height/elevation relative to shoulder level.",
      "Elbow interior angle and shoulder external-rotation proxy cannot establish shoulder-level elbow position."
    ],
    "resolution": "unsupported",
    "rationale": "The degrees-from-shoulder-level unit defines elevation/alignment, not the adjacent-segment elbow angle. Detected right throwing side resolves laterality only. No flat description defines this quantity and no validated allowed elevation measurer exists; preserve -5–5 without a false elbow-angle binding. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Early Cocking",
    "metricName": "Throwing Elbow Flexion",
    "description": "Note: Compact arm\nUnit: degrees\nRelated flat description (max-cocking elbow bend; not automatically a non-throwing-arm or extension definition) [Elbow Flexion]: Elbow bend at maximal shoulder external rotation",
    "min": 80,
    "max": 100,
    "unit": "degrees",
    "sideRole": "throwing",
    "physicalSide": "right",
    "convention": "ambiguous",
    "measurer": "rightElbowAngle",
    "labelIssue": "Elbow flexion/bend wording does not settle ROM flexion versus interior-angle convention.",
    "ambiguities": [
      "Occurrence note provides no straight-arm zero or adjacent-segment angle definition.",
      "A compact or L-shaped elbow does not disambiguate flexion versus interior convention near a right angle.",
      "Related flat Elbow Flexion also says elbow bend without establishing its zero."
    ],
    "resolution": "ambiguous",
    "rationale": "The explicit throwing/non-throwing role maps to the detected right arm, so side selection is resolved. The note 'Compact arm' does not establish an interior-angle convention. An L-shape or the range magnitude alone cannot settle whether the source uses flexion or its supplementary interior angle. Use the named elbow interior measurer only after convention confirmation; preserve this occurrence and do not silently convert or rely on the blanket registry header/clip binding. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Early Cocking",
    "metricName": "Non-Throwing Elbow Flexion",
    "description": "Note: Counterbalance\nUnit: degrees\nRelated flat description (max-cocking elbow bend; not automatically a non-throwing-arm or extension definition) [Elbow Flexion]: Elbow bend at maximal shoulder external rotation",
    "min": 30,
    "max": 70,
    "unit": "degrees",
    "sideRole": "non-throwing",
    "physicalSide": "left",
    "convention": "ambiguous",
    "measurer": "leftElbowAngle",
    "labelIssue": "Elbow flexion/bend wording does not settle ROM flexion versus interior-angle convention.",
    "ambiguities": [
      "Occurrence note provides no straight-arm zero or adjacent-segment angle definition.",
      "A compact or L-shaped elbow does not disambiguate flexion versus interior convention near a right angle.",
      "Related flat Elbow Flexion describes the throwing elbow at maximal shoulder ER; it cannot supply a phase-specific non-throwing or extension convention."
    ],
    "resolution": "ambiguous",
    "rationale": "The explicit throwing/non-throwing role maps to the detected left arm, so side selection is resolved. The note 'Counterbalance' does not establish an interior-angle convention. An L-shape or the range magnitude alone cannot settle whether the source uses flexion or its supplementary interior angle. Use the named elbow interior measurer only after convention confirmation; preserve this occurrence and do not silently convert or rely on the blanket registry header/clip binding. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Late Cocking / Max Torque",
    "metricName": "Weight Distribution",
    "description": "Note: Energy moves forward\nUnit: percent\nRelated flat description (distribution/transfer normalization is not established) [Weight Transfer]: Percentage of weight transferred from back to front foot",
    "min": 0,
    "max": 10,
    "unit": "percent",
    "sideRole": "lead",
    "physicalSide": "left",
    "convention": "percent",
    "measurer": "weightTransfer",
    "labelIssue": "Forward distribution bias has a possible centered-zero convention distinct from lead-foot position percent.",
    "ambiguities": [
      "Note says forward but does not define percent zero, denominator, or whether 0 means balanced.",
      "The surrounding ready/back-loading phases use signed percentages, so 0 to 10 cannot silently be treated as an endpoint-based foot-position percentage.",
      "Any signed-to-geometric conversion must be explicit; geometry is not actual weight."
    ],
    "resolution": "ambiguous",
    "rationale": "Energy moves forward and the phase instruction describe shifting toward the lead/front foot, consistent with the related flat transfer direction. However, this phase uses plain percent within a signed distribution sequence, not the explicit percent-on-lead-foot unit used later. Direction alone does not establish the scale of 0–10; require an explicit conversion before binding the range to the new geometric lead-foot percentage. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Late Cocking / Max Torque",
    "metricName": "Back Knee Flexion",
    "description": "Note: Drive from back leg\nUnit: degrees\nRelated flat description (stride leg only; not automatically a back-leg or extension definition) [Knee Flexion]: Stride leg knee bend",
    "min": 150,
    "max": 165,
    "unit": "degrees",
    "sideRole": "back",
    "physicalSide": "right",
    "convention": "ambiguous",
    "measurer": "rightKneeAngle",
    "labelIssue": "Flexion label and qualitative coaching note do not explicitly define interior versus ROM flexion.",
    "ambiguities": [
      "Occurrence note does not define straight-leg zero or the angle between adjacent segments.",
      "The registry-wide interior header and existing clip binding do not independently validate this specific flexion definition.",
      "Related flat Knee Flexion is stride-leg bend and is not a definition of back-knee flexion or this phase's angle convention."
    ],
    "resolution": "ambiguous",
    "rationale": "Role is explicit in the metric name, so detected laterality resolves the limb even though the convention remains unverified. The note 'Drive from back leg' describes coaching purpose, not an angle zero. The apparent fit of this range to a knee interior angle is not sufficient evidence by itself. The clip's existing binding is the correct side's interior measurer, but direct comparison requires confirming that convention; if ROM flexion is intended, an explicit 180-minus-angle conversion is needed. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Late Cocking / Max Torque",
    "metricName": "Lead Knee Flexion",
    "description": "Note: Prepare to brace\nUnit: degrees\nRelated flat description (stride leg only; not automatically a back-leg or extension definition) [Knee Flexion]: Stride leg knee bend",
    "min": 140,
    "max": 160,
    "unit": "degrees",
    "sideRole": "lead",
    "physicalSide": "left",
    "convention": "ambiguous",
    "measurer": "leftKneeAngle",
    "labelIssue": "Flexion label and qualitative coaching note do not explicitly define interior versus ROM flexion.",
    "ambiguities": [
      "Occurrence note does not define straight-leg zero or the angle between adjacent segments.",
      "The registry-wide interior header and existing clip binding do not independently validate this specific flexion definition.",
      "Related flat Knee Flexion is stride-leg bend and is not a definition of back-knee flexion or this phase's angle convention."
    ],
    "resolution": "ambiguous",
    "rationale": "Role is explicit in the metric name, so detected laterality resolves the limb even though the convention remains unverified. The note 'Prepare to brace' describes coaching purpose, not an angle zero. The apparent fit of this range to a knee interior angle is not sufficient evidence by itself. The clip's existing binding is the correct side's interior measurer, but direct comparison requires confirming that convention; if ROM flexion is intended, an explicit 180-minus-angle conversion is needed. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Late Cocking / Max Torque",
    "metricName": "Spine Angle",
    "description": "Note: Tall with control\nUnit: degrees\nRelated flat description (lumbar extension is NOT the same quantity as gross trunk posture) [Spine Extension]: Lumbar extension at maximal shoulder external rotation",
    "min": -5,
    "max": 5,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "trunkTilt",
    "labelIssue": "Signed backward spinal/trunk angle cannot be equated to unsigned whole-trunk tilt.",
    "ambiguities": [
      "-5 to 5 is signed, but trunkTilt is nonnegative and cannot represent backward versus forward lean.",
      "Phase cue explicitly calls for slight backward tilt; no calibrated sagittal direction or sign is provided.",
      "Related flat definition specifies lumbar extension, a different unsupported quantity."
    ],
    "resolution": "ambiguous",
    "rationale": "Tall with control must be read with the phase cue's slight backward tilt and the signed -5–5 degree range. trunkTilt is only the unsigned hip-center-to-shoulder-center axis versus world vertical; it cannot verify signed sagittal backward lean or lumbar spinal extension. It is a candidate for gross uprightness only, not an equivalent measurer for this signed reference. Do not compare the range without a validated sagittal-plane/sign definition and corresponding measurement; the related flat lumbar-extension definition must not be substituted."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Late Cocking / Max Torque",
    "metricName": "Hip Rotation",
    "description": "Note: Hips lead power\nUnit: degrees open\nMatching flat description [Hip Rotation]: Total hip rotation from foot contact to follow-through",
    "min": 30,
    "max": 45,
    "unit": "degrees open",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "hipRotation",
    "labelIssue": "Phase hip opening/orientation is not the matching flat total foot-contact-to-follow-through rotation.",
    "ambiguities": [
      "Absolute target direction is not configured.",
      "New measurer is relative to first-frame pelvis orientation, not calibrated target-line open/closed orientation.",
      "Neither note nor unit establishes that reference zero and sign equal the first-frame-pelvis baseline.",
      "Matching flat Hip Rotation defines a temporal total, not this phase orientation."
    ],
    "resolution": "ambiguous",
    "rationale": "The phase context (Hips lead power; unit degrees open) describes hips or torso shoulders opening/closing toward the throwing target. hipRotation measures horizontal-axis orientation relative to first-frame pelvis orientation. No absolute target direction is configured, so an open/closed target-facing range cannot be silently compared to a relative-baseline value, even when the unit omits the word open. Require calibrated target direction/reference zero and validated sign before direct comparison; no invented offset is applied. The flat total-rotation description remains distinct."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Late Cocking / Max Torque",
    "metricName": "Shoulder Rotation",
    "description": "Note: Delay shoulders\nUnit: degrees open\nRelated flat description (arm cocking is NOT the same quantity as torso shoulder turn) [Shoulder External Rotation]: Maximum shoulder rotation when arm is cocked back",
    "min": 5,
    "max": 15,
    "unit": "degrees open",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "shoulderTurn",
    "labelIssue": "Phase shoulder rotation is torso shoulder turn, not the flat cocked-arm Shoulder External Rotation.",
    "ambiguities": [
      "Absolute target direction is not configured.",
      "New measurer is relative to first-frame pelvis orientation, not calibrated target-line open/closed orientation.",
      "Neither note nor unit establishes that reference zero and sign equal the first-frame-pelvis baseline.",
      "The related flat shoulder external-rotation description concerns the arm and supplies no torso-turn zero."
    ],
    "resolution": "ambiguous",
    "rationale": "The phase context (Delay shoulders; unit degrees open) describes hips or torso shoulders opening/closing toward the throwing target. shoulderTurn measures horizontal-axis orientation relative to first-frame pelvis orientation. No absolute target direction is configured, so an open/closed target-facing range cannot be silently compared to a relative-baseline value, even when the unit omits the word open. Require calibrated target direction/reference zero and validated sign before direct comparison; no invented offset is applied. Use torso shoulderTurn as the candidate, never an arm external-rotation proxy; the flat cocked-arm definition is explicitly not a semantic match."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Late Cocking / Max Torque",
    "metricName": "Hip-Shoulder Separation",
    "description": "Note: Peak dynamic torque window\nUnit: degrees\nMatching flat description [Hip-Shoulder Separation]: Peak dynamic separation between hip and shoulder rotation during late cocking",
    "min": 30,
    "max": 45,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "relative-rotation",
    "measurer": "hipShoulderSeparation",
    "labelIssue": "No label conflict; this is relative pelvis-to-shoulder-axis separation.",
    "ambiguities": [
      "Peak dynamic torque window does not imply that the automatically chosen elbow-minimum checkpoint is the actual peak separation."
    ],
    "resolution": "resolved",
    "rationale": "Note and matching flat description explicitly identify dynamic hip-versus-shoulder rotation separation during late cocking. The unsigned horizontal angle between pelvis and shoulder axes measures that separation without an absolute target direction. Keep this phase occurrence separate from the flat peak definition; peak aggregation versus checkpoint timing must be respected."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Late Cocking / Max Torque",
    "metricName": "Throwing Elbow Flexion",
    "description": "Note: Strong L-shape\nUnit: degrees\nRelated flat description (max-cocking elbow bend; not automatically a non-throwing-arm or extension definition) [Elbow Flexion]: Elbow bend at maximal shoulder external rotation",
    "min": 85,
    "max": 100,
    "unit": "degrees",
    "sideRole": "throwing",
    "physicalSide": "right",
    "convention": "ambiguous",
    "measurer": "rightElbowAngle",
    "labelIssue": "Elbow flexion/bend wording does not settle ROM flexion versus interior-angle convention.",
    "ambiguities": [
      "Occurrence note provides no straight-arm zero or adjacent-segment angle definition.",
      "A compact or L-shaped elbow does not disambiguate flexion versus interior convention near a right angle.",
      "Related flat Elbow Flexion also says elbow bend without establishing its zero."
    ],
    "resolution": "ambiguous",
    "rationale": "The explicit throwing/non-throwing role maps to the detected right arm, so side selection is resolved. The note 'Strong L-shape' does not establish an interior-angle convention. An L-shape or the range magnitude alone cannot settle whether the source uses flexion or its supplementary interior angle. Use the named elbow interior measurer only after convention confirmation; preserve this occurrence and do not silently convert or rely on the blanket registry header/clip binding. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Late Cocking / Max Torque",
    "metricName": "Throwing Elbow Height",
    "description": "Note: Protect shoulder\nUnit: degrees from shoulder level\nMatching flat description: none; no flat definition of this quantity is supplied.",
    "min": -5,
    "max": 5,
    "unit": "degrees from shoulder level",
    "sideRole": "throwing",
    "physicalSide": "right",
    "convention": "unsupported",
    "measurer": "unsupported",
    "labelIssue": "Elbow height relative to shoulder level is not elbow flexion or arm axial rotation.",
    "ambiguities": [
      "No allowed measurer implements elbow-height/elevation relative to shoulder level.",
      "Elbow interior angle and shoulder external-rotation proxy cannot establish shoulder-level elbow position."
    ],
    "resolution": "unsupported",
    "rationale": "The degrees-from-shoulder-level unit defines elevation/alignment, not the adjacent-segment elbow angle. Detected right throwing side resolves laterality only. No flat description defines this quantity and no validated allowed elevation measurer exists; preserve -5–5 without a false elbow-angle binding. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Late Cocking / Max Torque",
    "metricName": "Non-Throwing Elbow Extension",
    "description": "Note: Pull torso through\nUnit: degrees\nRelated flat description (max-cocking elbow bend; not automatically a non-throwing-arm or extension definition) [Elbow Flexion]: Elbow bend at maximal shoulder external rotation",
    "min": 30,
    "max": 70,
    "unit": "degrees",
    "sideRole": "non-throwing",
    "physicalSide": "left",
    "convention": "ambiguous",
    "measurer": "leftElbowAngle",
    "labelIssue": "Non-throwing extension label is not established by the pull-torso-through note or by a max-cocking throwing-elbow flexion description.",
    "ambiguities": [
      "Occurrence note provides no straight-arm zero or adjacent-segment angle definition.",
      "A compact or L-shaped elbow does not disambiguate flexion versus interior convention near a right angle.",
      "Related flat Elbow Flexion describes the throwing elbow at maximal shoulder ER; it cannot supply a phase-specific non-throwing or extension convention."
    ],
    "resolution": "ambiguous",
    "rationale": "The explicit throwing/non-throwing role maps to the detected left arm, so side selection is resolved. The note 'Pull torso through' does not establish an interior-angle convention. An L-shape or the range magnitude alone cannot settle whether the source uses flexion or its supplementary interior angle. Use the named elbow interior measurer only after convention confirmation; preserve this occurrence and do not silently convert or rely on the blanket registry header/clip binding. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Acceleration / Release",
    "metricName": "Weight Distribution",
    "description": "Note: Finish into throw\nUnit: percent on lead foot\nRelated flat description (distribution/transfer normalization is not established) [Weight Transfer]: Percentage of weight transferred from back to front foot",
    "min": 20,
    "max": 40,
    "unit": "percent on lead foot",
    "sideRole": "lead",
    "physicalSide": "left",
    "convention": "percent",
    "measurer": "weightTransfer",
    "labelIssue": "Weight on lead foot is only approximated by a pelvis-position geometry proxy.",
    "ambiguities": [
      "The proxy does not measure force or actual percentage body weight on the lead foot.",
      "Professional percentage thresholds are not calibrated against the geometric proxy."
    ],
    "resolution": "proxy",
    "rationale": "Both the explicit percent-on-lead-foot unit and the phase transfer note support direction toward the detected left lead foot. The related flat description also defines back-to-front transfer. Use weightTransfer only as a labeled pelvis-center-between-feet position proxy, keeping this occurrence's exact range distinct from signed earlier distribution ranges; no force equivalence is asserted. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Acceleration / Release",
    "metricName": "Lead Knee Extension",
    "description": "Note: Dynamic brace from 150 degrees toward 170-180 degrees\nUnit: degrees\nRelated flat description (stride leg only; not automatically a back-leg or extension definition) [Knee Flexion]: Stride leg knee bend",
    "min": 150,
    "max": 180,
    "unit": "degrees",
    "sideRole": "lead",
    "physicalSide": "left",
    "convention": "interior",
    "measurer": "leftKneeAngle",
    "labelIssue": "Extension wording is compatible with interior angle; this is not ROM extension from zero.",
    "ambiguities": [],
    "resolution": "resolved",
    "rationale": "The note explicitly describes extension from 150 degrees toward 170–180 degrees, identifying increasing adjacent-segment interior angle toward a straight leg, not increasing ROM flexion. Bind to the corresponding detected-side knee interior measurer. The related flat Knee Flexion description is only stride-leg bend and does not override this occurrence's extension semantics. The convention is supported by extension description/direction, not range magnitude alone; preserve original values. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Acceleration / Release",
    "metricName": "Back Knee Extension",
    "description": "Note: Dynamic drive from 150 degrees toward 170-180 degrees\nUnit: degrees\nRelated flat description (stride leg only; not automatically a back-leg or extension definition) [Knee Flexion]: Stride leg knee bend",
    "min": 150,
    "max": 180,
    "unit": "degrees",
    "sideRole": "back",
    "physicalSide": "right",
    "convention": "interior",
    "measurer": "rightKneeAngle",
    "labelIssue": "Extension wording is compatible with interior angle; this is not ROM extension from zero.",
    "ambiguities": [],
    "resolution": "resolved",
    "rationale": "The note explicitly describes extension from 150 degrees toward 170–180 degrees, identifying increasing adjacent-segment interior angle toward a straight leg, not increasing ROM flexion. Bind to the corresponding detected-side knee interior measurer. The related flat Knee Flexion description is only stride-leg bend and does not override this occurrence's extension semantics. The convention is supported by extension description/direction, not range magnitude alone; preserve original values. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Acceleration / Release",
    "metricName": "Spine Angle",
    "description": "Note: No collapse\nUnit: degrees\nRelated flat description (lumbar extension is NOT the same quantity as gross trunk posture) [Spine Extension]: Lumbar extension at maximal shoulder external rotation",
    "min": 0,
    "max": 10,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "relative-rotation",
    "measurer": "trunkTilt",
    "labelIssue": "Spine Angle denotes gross posture here; trunkTilt is not a spinal-segment or lumbar-extension measurement.",
    "ambiguities": [
      "Tall posture is represented by a gross torso-axis-to-world-vertical proxy, not spinal curvature.",
      "The related flat Spine Extension description specifies lumbar extension and is explicitly not an equivalent definition."
    ],
    "resolution": "proxy",
    "rationale": "The note 'No collapse' and phase tall-spine context support generic near-upright gross trunk posture, with no requested backward/forward sign in this occurrence. trunkTilt is the unsigned hip-center-to-shoulder-center axis versus world vertical, allowing a qualified posture proxy for this unsigned range. Do not call it lumbar extension or claim equivalence to the related flat anatomical definition; the registry Spine Lean from-vertical remark is only supporting gross-posture context."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Acceleration / Release",
    "metricName": "Hip Rotation",
    "description": "Note: Hips finish first\nUnit: degrees\nMatching flat description [Hip Rotation]: Total hip rotation from foot contact to follow-through",
    "min": 45,
    "max": 60,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "hipRotation",
    "labelIssue": "Phase hip opening/orientation is not the matching flat total foot-contact-to-follow-through rotation.",
    "ambiguities": [
      "Absolute target direction is not configured.",
      "New measurer is relative to first-frame pelvis orientation, not calibrated target-line open/closed orientation.",
      "Neither note nor unit establishes that reference zero and sign equal the first-frame-pelvis baseline.",
      "Matching flat Hip Rotation defines a temporal total, not this phase orientation."
    ],
    "resolution": "ambiguous",
    "rationale": "The phase context (Hips finish first; unit degrees) describes hips or torso shoulders opening/closing toward the throwing target. hipRotation measures horizontal-axis orientation relative to first-frame pelvis orientation. No absolute target direction is configured, so an open/closed target-facing range cannot be silently compared to a relative-baseline value, even when the unit omits the word open. Require calibrated target direction/reference zero and validated sign before direct comparison; no invented offset is applied. The flat total-rotation description remains distinct."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Acceleration / Release",
    "metricName": "Shoulder Rotation",
    "description": "Note: Shoulders whip\nUnit: degrees\nRelated flat description (arm cocking is NOT the same quantity as torso shoulder turn) [Shoulder External Rotation]: Maximum shoulder rotation when arm is cocked back",
    "min": 45,
    "max": 60,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "shoulderTurn",
    "labelIssue": "Phase shoulder rotation is torso shoulder turn, not the flat cocked-arm Shoulder External Rotation.",
    "ambiguities": [
      "Absolute target direction is not configured.",
      "New measurer is relative to first-frame pelvis orientation, not calibrated target-line open/closed orientation.",
      "Neither note nor unit establishes that reference zero and sign equal the first-frame-pelvis baseline.",
      "The related flat shoulder external-rotation description concerns the arm and supplies no torso-turn zero."
    ],
    "resolution": "ambiguous",
    "rationale": "The phase context (Shoulders whip; unit degrees) describes hips or torso shoulders opening/closing toward the throwing target. shoulderTurn measures horizontal-axis orientation relative to first-frame pelvis orientation. No absolute target direction is configured, so an open/closed target-facing range cannot be silently compared to a relative-baseline value, even when the unit omits the word open. Require calibrated target direction/reference zero and validated sign before direct comparison; no invented offset is applied. Use torso shoulderTurn as the candidate, never an arm external-rotation proxy; the flat cocked-arm definition is explicitly not a semantic match."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Acceleration / Release",
    "metricName": "Throwing Elbow Extension",
    "description": "Note: Dynamic extension toward 170-180 degrees; elbow leads hand\nUnit: degrees\nRelated flat description (max-cocking elbow bend; not automatically a non-throwing-arm or extension definition) [Elbow Flexion]: Elbow bend at maximal shoulder external rotation",
    "min": 90,
    "max": 180,
    "unit": "degrees",
    "sideRole": "throwing",
    "physicalSide": "right",
    "convention": "interior",
    "measurer": "rightElbowAngle",
    "labelIssue": "Extension is a changing elbow interior angle, not clinical extension excursion.",
    "ambiguities": [],
    "resolution": "resolved",
    "rationale": "The note explicitly says dynamic extension toward 170–180 degrees, which establishes the adjacent-segment interior convention approaching a straight arm. Detected throwing side is right. The related flat Elbow Flexion description concerns elbow bend at maximal ER, not this release/extension definition. Preserve this separate dynamic or finish occurrence and original range; release detection is peak wrist speed, not observed ball separation. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Acceleration / Release",
    "metricName": "Throwing Elbow Alignment",
    "description": "Note: Throw straight\nUnit: degrees from target line\nMatching flat description: none; no flat definition of this quantity is supplied.",
    "min": -5,
    "max": 5,
    "unit": "degrees from target line",
    "sideRole": "throwing",
    "physicalSide": "right",
    "convention": "unsupported",
    "measurer": "unsupported",
    "labelIssue": "Throwing-elbow target-line alignment is not an elbow interior angle.",
    "ambiguities": [
      "No allowed measurer implements elbow trajectory/axis alignment relative to target line.",
      "Absolute target direction is not configured."
    ],
    "resolution": "unsupported",
    "rationale": "Degrees from target line and Throw straight require target-relative elbow alignment on the right throwing side. The registry and clip offer no calibrated target vector or validated alignment measurer. rightElbowAngle measures bend, not alignment; no flat definition matches this quantity. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Acceleration / Release",
    "metricName": "Non-Throwing Elbow Flexion",
    "description": "Note: Pull torso through\nUnit: degrees\nRelated flat description (max-cocking elbow bend; not automatically a non-throwing-arm or extension definition) [Elbow Flexion]: Elbow bend at maximal shoulder external rotation",
    "min": 40,
    "max": 90,
    "unit": "degrees",
    "sideRole": "non-throwing",
    "physicalSide": "left",
    "convention": "ambiguous",
    "measurer": "leftElbowAngle",
    "labelIssue": "Elbow flexion/bend wording does not settle ROM flexion versus interior-angle convention.",
    "ambiguities": [
      "Occurrence note provides no straight-arm zero or adjacent-segment angle definition.",
      "A compact or L-shaped elbow does not disambiguate flexion versus interior convention near a right angle.",
      "Related flat Elbow Flexion describes the throwing elbow at maximal shoulder ER; it cannot supply a phase-specific non-throwing or extension convention."
    ],
    "resolution": "ambiguous",
    "rationale": "The explicit throwing/non-throwing role maps to the detected left arm, so side selection is resolved. The note 'Pull torso through' does not establish an interior-angle convention. An L-shape or the range magnitude alone cannot settle whether the source uses flexion or its supplementary interior angle. Use the named elbow interior measurer only after convention confirmation; preserve this occurrence and do not silently convert or rely on the blanket registry header/clip binding. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Acceleration / Release",
    "metricName": "Wrist Flexion",
    "description": "Note: Tight spiral\nUnit: degrees\nMatching flat description: none; no flat definition of this quantity is supplied.",
    "min": 20,
    "max": 40,
    "unit": "degrees",
    "sideRole": "throwing",
    "physicalSide": "right",
    "convention": "unsupported",
    "measurer": "unsupported",
    "labelIssue": "Wrist-flexion metric has no supported wrist/hand articulation measurer.",
    "ambiguities": [
      "No allowed measurer defines a wrist/hand/forearm joint angle.",
      "Tight spiral is a coaching outcome, not a quantitative angle-zero definition."
    ],
    "resolution": "unsupported",
    "rationale": "Release context and wrist-snap cue identify the throwing/right wrist, but neither elbow angle nor shoulder axial-rotation proxy measures wrist flexion. No matching flat wrist definition or supported wrist-angle measurer exists, so the exact 20–40 degrees remains unsupported rather than inventing a mapping or convention. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Follow-Through",
    "metricName": "Weight Distribution",
    "description": "Note: Complete transfer\nUnit: percent on lead foot\nRelated flat description (distribution/transfer normalization is not established) [Weight Transfer]: Percentage of weight transferred from back to front foot",
    "min": 60,
    "max": 80,
    "unit": "percent on lead foot",
    "sideRole": "lead",
    "physicalSide": "left",
    "convention": "percent",
    "measurer": "weightTransfer",
    "labelIssue": "Weight on lead foot is only approximated by a pelvis-position geometry proxy.",
    "ambiguities": [
      "The proxy does not measure force or actual percentage body weight on the lead foot.",
      "Professional percentage thresholds are not calibrated against the geometric proxy."
    ],
    "resolution": "proxy",
    "rationale": "Both the explicit percent-on-lead-foot unit and the phase transfer note support direction toward the detected left lead foot. The related flat description also defines back-to-front transfer. Use weightTransfer only as a labeled pelvis-center-between-feet position proxy, keeping this occurrence's exact range distinct from signed earlier distribution ranges; no force equivalence is asserted. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Follow-Through",
    "metricName": "Lead Knee Extension",
    "description": "Note: Stable finish\nUnit: degrees\nRelated flat description (stride leg only; not automatically a back-leg or extension definition) [Knee Flexion]: Stride leg knee bend",
    "min": 170,
    "max": 180,
    "unit": "degrees",
    "sideRole": "lead",
    "physicalSide": "left",
    "convention": "interior",
    "measurer": "leftKneeAngle",
    "labelIssue": "Extension wording is compatible with interior angle; this is not ROM extension from zero.",
    "ambiguities": [
      "Stable finish alone does not define an angle zero; convention is supported by the same Lead Knee Extension metric's explicit dynamic-brace description in Acceleration / Release."
    ],
    "resolution": "resolved",
    "rationale": "Stable finish and the same Lead Knee Extension metric's explicit prior dynamic-brace note establish extension toward 170–180 degrees as the straight-leg interior convention. Bind to the corresponding detected-side knee interior measurer. The related flat Knee Flexion description is only stride-leg bend and does not override this occurrence's extension semantics. The convention is supported by extension description/direction, not range magnitude alone; preserve original values. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Follow-Through",
    "metricName": "Back Knee Flexion",
    "description": "Note: Trail release\nUnit: degrees\nRelated flat description (stride leg only; not automatically a back-leg or extension definition) [Knee Flexion]: Stride leg knee bend",
    "min": 150,
    "max": 170,
    "unit": "degrees",
    "sideRole": "back",
    "physicalSide": "right",
    "convention": "ambiguous",
    "measurer": "rightKneeAngle",
    "labelIssue": "Flexion label and qualitative coaching note do not explicitly define interior versus ROM flexion.",
    "ambiguities": [
      "Occurrence note does not define straight-leg zero or the angle between adjacent segments.",
      "The registry-wide interior header and existing clip binding do not independently validate this specific flexion definition.",
      "Related flat Knee Flexion is stride-leg bend and is not a definition of back-knee flexion or this phase's angle convention."
    ],
    "resolution": "ambiguous",
    "rationale": "Role is explicit in the metric name, so detected laterality resolves the limb even though the convention remains unverified. The note 'Trail release' describes coaching purpose, not an angle zero. The apparent fit of this range to a knee interior angle is not sufficient evidence by itself. The clip's existing binding is the correct side's interior measurer, but direct comparison requires confirming that convention; if ROM flexion is intended, an explicit 180-minus-angle conversion is needed. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Follow-Through",
    "metricName": "Spine Angle",
    "description": "Note: Natural deceleration\nUnit: degrees forward\nRelated flat description (lumbar extension is NOT the same quantity as gross trunk posture) [Spine Extension]: Lumbar extension at maximal shoulder external rotation",
    "min": 5,
    "max": 15,
    "unit": "degrees forward",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "trunkTilt",
    "labelIssue": "Degrees forward requires directional trunk lean; unsigned trunk tilt cannot establish forwardness.",
    "ambiguities": [
      "Unsigned trunkTilt includes forward, backward, and lateral lean; it is not a signed sagittal-forward angle.",
      "No calibrated forward/sagittal direction is configured.",
      "Related flat lumbar-extension definition is not a gross forward-lean definition."
    ],
    "resolution": "ambiguous",
    "rationale": "The unit explicitly specifies degrees forward and phase instruction says relaxed forward lean. trunkTilt measures only total unsigned tilt of the torso axis versus vertical. It can approximate tilt magnitude only after an independent calibrated forward-direction/sagittal check; it cannot by itself distinguish the demanded forward lean from backward or sideways lean. No direct comparison or substitution of lumbar extension is justified."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Follow-Through",
    "metricName": "Shoulder Rotation",
    "description": "Note: Full rotation\nUnit: degrees\nRelated flat description (arm cocking is NOT the same quantity as torso shoulder turn) [Shoulder External Rotation]: Maximum shoulder rotation when arm is cocked back",
    "min": 60,
    "max": 90,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "shoulderTurn",
    "labelIssue": "Phase shoulder rotation is torso shoulder turn, not the flat cocked-arm Shoulder External Rotation.",
    "ambiguities": [
      "Absolute target direction is not configured.",
      "New measurer is relative to first-frame pelvis orientation, not calibrated target-line open/closed orientation.",
      "Neither note nor unit establishes that reference zero and sign equal the first-frame-pelvis baseline.",
      "The related flat shoulder external-rotation description concerns the arm and supplies no torso-turn zero."
    ],
    "resolution": "ambiguous",
    "rationale": "The phase context (Full rotation; unit degrees) describes hips or torso shoulders opening/closing toward the throwing target. shoulderTurn measures horizontal-axis orientation relative to first-frame pelvis orientation. No absolute target direction is configured, so an open/closed target-facing range cannot be silently compared to a relative-baseline value, even when the unit omits the word open. Require calibrated target direction/reference zero and validated sign before direct comparison; no invented offset is applied. Use torso shoulderTurn as the candidate, never an arm external-rotation proxy; the flat cocked-arm definition is explicitly not a semantic match."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Follow-Through",
    "metricName": "Throwing Elbow Extension",
    "description": "Note: Full release\nUnit: degrees\nRelated flat description (max-cocking elbow bend; not automatically a non-throwing-arm or extension definition) [Elbow Flexion]: Elbow bend at maximal shoulder external rotation",
    "min": 170,
    "max": 180,
    "unit": "degrees",
    "sideRole": "throwing",
    "physicalSide": "right",
    "convention": "interior",
    "measurer": "rightElbowAngle",
    "labelIssue": "Extension is a changing elbow interior angle, not clinical extension excursion.",
    "ambiguities": [
      "Full release note is supported by the same metric's explicit dynamic extension toward 170–180 degrees in Acceleration / Release."
    ],
    "resolution": "resolved",
    "rationale": "Full release uses the same Throwing Elbow Extension definition whose prior phase explicitly extends toward 170–180 degrees, establishing a straight-arm interior convention. Detected throwing side is right. The related flat Elbow Flexion description concerns elbow bend at maximal ER, not this release/extension definition. Preserve this separate dynamic or finish occurrence and original range; release detection is peak wrist speed, not observed ball separation. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "football-throw",
    "clipId": "quarterback-throw",
    "phaseName": "Follow-Through",
    "metricName": "Non-Throwing Elbow Flexion",
    "description": "Note: Absorb rotation\nUnit: degrees\nRelated flat description (max-cocking elbow bend; not automatically a non-throwing-arm or extension definition) [Elbow Flexion]: Elbow bend at maximal shoulder external rotation",
    "min": 30,
    "max": 70,
    "unit": "degrees",
    "sideRole": "non-throwing",
    "physicalSide": "left",
    "convention": "ambiguous",
    "measurer": "leftElbowAngle",
    "labelIssue": "Elbow flexion/bend wording does not settle ROM flexion versus interior-angle convention.",
    "ambiguities": [
      "Occurrence note provides no straight-arm zero or adjacent-segment angle definition.",
      "A compact or L-shaped elbow does not disambiguate flexion versus interior convention near a right angle.",
      "Related flat Elbow Flexion describes the throwing elbow at maximal shoulder ER; it cannot supply a phase-specific non-throwing or extension convention."
    ],
    "resolution": "ambiguous",
    "rationale": "The explicit throwing/non-throwing role maps to the detected left arm, so side selection is resolved. The note 'Absorb rotation' does not establish an interior-angle convention. An L-shape or the range magnitude alone cannot settle whether the source uses flexion or its supplementary interior angle. Use the named elbow interior measurer only after convention confirmation; preserve this occurrence and do not silently convert or rely on the blanket registry header/clip binding. Detected laterality is medium-confidence: right throwing arm, left lead/plant/stride leg, right back/trailing leg. Evidence: Source right elbow extends 19→171° in the delivery burst. Left foot is 0.67 m forward and travels 0.0095 m during delivery versus right 0.1407 m: left lead/plant, right trailing."
  },
  {
    "referenceKey": "baseball-fastball",
    "clipId": "baseball-fastball",
    "phaseName": null,
    "metricName": "Shoulder External Rotation",
    "description": "Maximum shoulder external rotation at late cocking",
    "min": 155,
    "max": 185,
    "unit": "degrees",
    "sideRole": "throwing",
    "physicalSide": "right",
    "convention": "relative-rotation",
    "measurer": "rightShoulderExternalRotationProxy",
    "labelIssue": "The label and description genuinely concern throwing-arm axial rotation, but the proposed measurer must be labeled an unsigned geometric shoulder-rotation proxy, not clinical shoulder external rotation or measured maximum external rotation.",
    "ambiguities": [
      "The professional reference is unverified; its anatomical coordinate system and external-rotation zero calibration are unspecified.",
      "The proxy is the unsigned angle between the forearm and trunk-up projected onto the plane normal to the upper arm; it does not distinguish calibrated internal from external rotation and is not clinical glenohumeral external rotation.",
      "The proxy is valid only while elbow interior angle is 45–135 degrees and both projected vectors are nondegenerate; invalid samples must remain unavailable.",
      "The reference upper bound of 185 degrees exceeds the unsigned proxy's 0–180-degree domain; no wrapping, offset, clamping, or replacement range is authorized.",
      "The configured max-cocking anchor is an elbow-minimum proxy, explicitly not measured shoulder maximum external rotation; maximum valid proxy over late cocking and a checkpoint value are different statistics."
    ],
    "resolution": "proxy",
    "rationale": "Both the metric name and its description explicitly request shoulder external rotation, so an arm-axial geometric proxy is semantically eligible rather than shoulderTurn. The supplied clip config identifies right as the active throwing side with medium confidence, supported by dominant right-wrist speed during elbow extension. Bind only the right proxy under its 45–135-degree elbow-interior validity gate and disclose its unsigned definition and missing clinical calibration. This is a proxy binding, not permission to directly score the unverified 155–185-degree clinical-looking benchmark. Keep this flat occurrence phaseName null; the description's late-cocking context does not create a phase metric."
  },
  {
    "referenceKey": "baseball-fastball",
    "clipId": "baseball-fastball",
    "phaseName": null,
    "metricName": "Elbow Flexion",
    "description": "Elbow angle at max external rotation",
    "min": 80,
    "max": 110,
    "unit": "degrees",
    "sideRole": "throwing",
    "physicalSide": "right",
    "convention": "ambiguous",
    "measurer": "rightElbowAngle",
    "labelIssue": "Flexion may denote ROM flexion, while the configured rightElbowAngle reports an interior joint angle; the description only says elbow angle and does not settle the convention.",
    "ambiguities": [
      "The description does not explicitly establish interior angle versus ROM flexion; the registry-wide interior header and the 80–110-degree magnitude alone do not resolve the flexion-label ambiguity.",
      "The current binding computes an interior joint angle with 180 degrees straight; direct comparison or a 180-minus conversion needs a verified reference convention.",
      "The reference is unverified and requests the elbow value at shoulder maximum external rotation, not at maximum elbow bend.",
      "The clip's Max Cocking checkpoint is explicitly an elbow-minimum anchor, not observed shoulder maximum external rotation; event equivalence is unverified."
    ],
    "resolution": "ambiguous",
    "rationale": "The config explicitly binds Elbow Flexion to rightElbowAngle, and detected laterality identifies right as the throwing arm with medium confidence. Thus the physical joint is resolved, but the neutral description 'Elbow angle at max external rotation' does not decide interior versus ROM flexion. Do not infer the angle convention from the numeric range, force the global header to settle it, or silently convert the bounds. The configured Max Cocking flat-reference assignment supplies an existing checkpoint but does not establish the required shoulder-MER event or create a separate reference.phase.metrics occurrence. Retain the original range and phaseName null."
  },
  {
    "referenceKey": "baseball-fastball",
    "clipId": "baseball-fastball",
    "phaseName": null,
    "metricName": "Hip Rotation",
    "description": "Hip rotation at foot contact",
    "min": 45,
    "max": 65,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "hipRotation",
    "labelIssue": "Hip Rotation denotes pelvis orientation here, not a unilateral hip-joint interior angle; the intended orientation baseline is absent.",
    "ambiguities": [
      "The description and unit do not specify whether rotation is relative to the initial pelvis, an absolute target line, a neutral anatomical frame, or another baseline.",
      "The proposed hipRotation measurer is relative to first-frame pelvis orientation; absolute target direction is not configured.",
      "Neither rotation sign nor open/closed direction is defined, so the preserved 45–65-degree benchmark cannot silently be treated as first-frame-relative yaw.",
      "The reference is unverified and foot contact is a kinematic/manual plant proxy rather than a validated contact observation."
    ],
    "resolution": "ambiguous",
    "rationale": "Hip rotation in this pitching description concerns whole-pelvis orientation at foot contact, making hipRotation the candidate measurer and torso a nonlateral role. However, the supplied new measurer uses first-frame pelvis orientation as its zero, while this reference supplies no matching zero or signed convention. Absolute target direction is not configured; do not reinterpret an unspecified or potentially target-line range as relative rotation and do not substitute hipShoulderSeparation. The left stride/plant evidence identifies the contact context but cannot establish the rotation frame. Keep the unverified original bounds and this flat metric's phaseName null."
  },
  {
    "referenceKey": "baseball-fastball",
    "clipId": "baseball-fastball",
    "phaseName": null,
    "metricName": "Spine Extension",
    "description": "Trunk tilt at ball release",
    "min": 12,
    "max": 28,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "relative-rotation",
    "measurer": "trunkTilt",
    "labelIssue": "Spine Extension is a misleading label for the stated trunk-tilt description; whole-trunk inclination is not lumbar spinal extension.",
    "ambiguities": [
      "The reference is unverified and does not explicitly document the tilt baseline; world vertical is the proposed measurer's disclosed baseline, consistent with the registry's vertical-lean convention rather than its generic interior-angle claim.",
      "trunkTilt is unsigned inclination of the hips-center-to-shoulders-center axis versus world vertical; it cannot distinguish forward from backward lean, isolate sagittal tilt, or measure lumbar extension.",
      "If Spine Extension was intended to require signed backward sagittal lean or lumbar extension despite the description, trunkTilt is not equivalent and that alternate interpretation remains unsupported.",
      "The clip's release anchor is a wrist-speed/extension proxy, not observed ball release."
    ],
    "resolution": "resolved",
    "rationale": "Read the description as authoritative: it explicitly asks for trunk tilt at ball release, not lumbar extension or signed backward lean. This supports the supplied unsigned trunkTilt measurer with a disclosed world-vertical zero; relative-rotation here means trunk-axis inclination relative to vertical, not pelvis-relative yaw or a limb interior angle. Resolve the described observable while flagging the misleading Spine Extension label and unverified reference baseline. Do not claim clinical spinal extension, backward direction, or actual ball release from this measurement. No reference phase metric exists, so leave phaseName null."
  },
  {
    "referenceKey": "baseball-fastball",
    "clipId": "baseball-fastball",
    "phaseName": null,
    "metricName": "Knee Flexion",
    "description": "Stride leg knee flexion at foot contact",
    "min": 35,
    "max": 60,
    "unit": "degrees",
    "sideRole": "stride",
    "physicalSide": "left",
    "convention": "flexion",
    "measurer": "leftKneeAngle",
    "labelIssue": "The label and explicit stride-knee-flexion description imply ROM flexion, but the stored binding supplies an interior knee angle; retaining the range under a global interior header does not resolve that contradiction.",
    "ambiguities": [
      "ROM flexion is an explicit semantic inference from 'Stride leg knee flexion at foot contact', not an inference from range magnitude; its provenance remains unverified.",
      "The reference's global interior convention and clip timingNote retaining 35–60 degrees as interior conflict with the metric-specific flexion meaning.",
      "leftKneeAngle measures the raw interior knee angle with 180 degrees straight; a verified, explicitly declared flexion/interior conversion is required before comparison, and none is authorized here.",
      "The left stride/plant identification has medium confidence, and the Stride / Plant Proxy checkpoint does not establish validated physical foot contact."
    ],
    "resolution": "ambiguous",
    "rationale": "The description explicitly names the stride leg and knee flexion at foot contact. Detected laterality says leadLeg left, with left-foot lift/stride followed by left plant and right trail; the config also binds Knee Flexion to leftKneeAngle. Therefore side and candidate joint measurer are resolved. Per the metric-specific wording, infer flexion convention explicitly but mark it unverified; do not let the registry header override the contradiction or infer it solely from 35–60 degrees. Because the candidate measurer produces interior angles and no verified conversion exists, the measurement-to-reference comparison remains ambiguous. Preserve min 35 and max 60 unchanged, apply no silent conversion, and retain phaseName null despite the existing configured flat-reference plant assignment."
  },
  {
    "referenceKey": "baseball-fastball",
    "clipId": "baseball-fastball",
    "phaseName": null,
    "metricName": "Weight Transfer",
    "description": "Weight on stride leg at release",
    "min": 65,
    "max": 85,
    "unit": "percent",
    "sideRole": "stride",
    "physicalSide": "left",
    "convention": "percent",
    "measurer": "weightTransfer",
    "labelIssue": "The described weight percentage must not be presented as measured force or weight distribution; weightTransfer is pelvis-between-feet geometry toward the stride/lead foot.",
    "ambiguities": [
      "The reference is unverified and refers to weight on the stride leg; bone positions alone do not measure ground-reaction force, limb loading, or body-weight distribution.",
      "The proposed measurer is pelvis-center position between the feet toward the lead foot, a geometric proxy that is not a force percentage.",
      "The registry-wide Weight Transfer header describes signed heels/toes displacement around mid-foot, which differs from both stride-leg loading and the proposed lead-foot geometry; the metric-specific description supports lead direction but does not validate interchangeability of the percentage scales.",
      "The clip's release event is a kinematic proxy, and detected left stride/lead laterality has medium confidence."
    ],
    "resolution": "proxy",
    "rationale": "The description explicitly requests weight on the stride leg at release. The clip's detected leadLeg is left and its evidence identifies left plant/right trail, so stride means left lead foot rather than the right throwing-side foot. The supplied weightTransfer geometry can therefore be bound directionally toward left as a proxy. This is not a symmetric signed or back-foot reference requiring a direction reversal; nevertheless the unverified 65–85-percent loading benchmark is not validated against pelvis position and must not be reported as measured loading or a biomechanical pass/fail. Keep the stored bounds and unit unchanged and phaseName null; do not invent a release phase assignment."
  },
  {
    "referenceKey": "baseball-batting-swing",
    "clipId": "baseball-batting-swing",
    "phaseName": null,
    "metricName": "Hip Rotation",
    "description": "Hip rotation during swing",
    "min": 55,
    "max": 85,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "hipRotation",
    "labelIssue": "No anatomical label mismatch, but the label and description do not define the rotation baseline, direction, or sampling statistic.",
    "ambiguities": [
      "The reference does not establish whether rotation is relative to the first frame, relative to an absolute target direction, or a whole-swing excursion.",
      "Absolute target direction is not configured; target-line or open-angle interpretations cannot be compared silently to first-frame-relative rotation.",
      "Sign and peak-versus-checkpoint interpretation are unspecified; 'during swing' does not supply a phase assignment.",
      "The professional reference has verificationLevel 'unverified'."
    ],
    "resolution": "ambiguous",
    "rationale": "The described quantity is pelvic rotation, so hipRotation is the appropriate candidate, not hipShoulderSeparation. The new measurer is relative to first-frame pelvis orientation, but the immutable reference does not establish that zero convention. The registry's interior-joint-angle header cannot define torso rotation. Preserve 55–85 degrees without inventing a target axis, phase, sign, or calibration. This flat whole-motion occurrence remains unassigned to a phase."
  },
  {
    "referenceKey": "baseball-batting-swing",
    "clipId": "baseball-batting-swing",
    "phaseName": null,
    "metricName": "Elbow Flexion",
    "description": "Lead arm elbow angle at contact",
    "min": 90,
    "max": 120,
    "unit": "degrees",
    "sideRole": "lead",
    "physicalSide": "left",
    "convention": "ambiguous",
    "measurer": "leftElbowAngle",
    "labelIssue": "'Elbow Flexion' suggests range-of-motion flexion, whereas the description says generic elbow angle and the bound measurer returns an interior angle; the occurrence does not explicitly settle the convention.",
    "ambiguities": [
      "Interior angle versus range-of-motion flexion is not established by the name and description; range magnitude alone does not settle it.",
      "Laterality is detected with medium confidence, not independently verified.",
      "The configured strike checkpoint is a coupled-hand speed proxy, not verified bat-ball contact; no tool tracking is available.",
      "The professional reference and its explicit flat checkpoint comparison are unverified."
    ],
    "resolution": "ambiguous",
    "rationale": "The supplied clip evidence identifies a right-handed swing with the left lead arm: hands sweep anatomical right to left and the left lead elbow is less folded than the right trailing elbow. The explicit clip binding to leftElbowAngle therefore matches the described role. Source mocapAngles.ts measures the shoulder–elbow–wrist interior angle, with 180 degrees straight. 'Lead arm elbow angle at contact' does not explicitly distinguish this from flexion despite the registry's broad interior claim. Do not infer convention from 90–120 or silently apply a supplement conversion. The clip explicitly proposes a Strike Proxy checkpoint, but that is not a reference.phases metric occurrence: phaseName remains null."
  },
  {
    "referenceKey": "baseball-batting-swing",
    "clipId": "baseball-batting-swing",
    "phaseName": null,
    "metricName": "Knee Flexion",
    "description": "Back leg knee bend at load",
    "min": 115,
    "max": 145,
    "unit": "degrees",
    "sideRole": "back",
    "physicalSide": "right",
    "convention": "ambiguous",
    "measurer": "rightKneeAngle",
    "labelIssue": "'Knee Flexion' and 'knee bend' do not explicitly identify an interior angle, while rightKneeAngle measures an interior angle; the current binding does not resolve reference semantics.",
    "ambiguities": [
      "The description specifies back-leg bend at load, but not whether the numeric angle is interior or range-of-motion flexion.",
      "Neither the 115–145-degree range nor the registry header alone establishes the convention.",
      "The inferred right back leg follows medium-confidence laterality evidence.",
      "The clip's explicit load comparison and the professional reference are unverified."
    ],
    "resolution": "ambiguous",
    "rationale": "The supplied evidence identifies the left lead/plant foot and a right-handed swing, so the back leg is anatomical right; the explicit rightKneeAngle binding matches that role. Source mocapAngles.ts computes hip–knee–ankle interior angle with 180 degrees straight. The exact occurrence says 'Back leg knee bend at load', not an explicitly calibrated flexion or interior definition. This batting reference is 115–145 degrees for the back leg; it must not be replaced by or conflated with a different baseball stride-leg 35–60-degree occurrence. Preserve the values without conversion. The clip names Leg Lift / Load as an unverified flat-reference checkpoint, not a professional reference phase, so phaseName stays null."
  },
  {
    "referenceKey": "baseball-batting-swing",
    "clipId": "baseball-batting-swing",
    "phaseName": null,
    "metricName": "Spine Extension",
    "description": "Trunk tilt at contact",
    "min": 10,
    "max": 25,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "trunkTilt",
    "labelIssue": "The label says spinal extension, but the description specifies whole-trunk tilt; those are not equivalent anatomical measurements.",
    "ambiguities": [
      "The occurrence does not explicitly specify unsigned tilt from world vertical, a signed sagittal lean, or a lumbar-extension angle.",
      "The registry defines Spine Lean from vertical, but this differently named occurrence does not independently resolve the extension-versus-tilt mismatch.",
      "Unsigned whole-trunk tilt cannot identify backward versus forward lean, sagittal versus lateral tilt, or lumbar extension.",
      "Contact is not instrumented; the clip's strike event is a hand-speed proxy, and this flat metric has no explicit clip checkpoint assignment.",
      "The professional reference has verificationLevel 'unverified'."
    ],
    "resolution": "ambiguous",
    "rationale": "Reading the description rather than just the label makes trunkTilt the appropriate candidate: the new measurer is the unsigned angle of the hips-center-to-shoulder-center trunk axis against world vertical. It is not an interior limb angle and is not lumbar spinal extension. If the reference means generic unsigned whole-trunk tilt, that geometry can serve it; if 'Spine Extension' requires signed sagittal backward lean or anatomical lumbar extension, it cannot. The source does not sufficiently calibrate this distinction for unconditional comparison of 10–25 degrees. No phase assignment or signed extension value is invented."
  },
  {
    "referenceKey": "baseball-batting-swing",
    "clipId": "baseball-batting-swing",
    "phaseName": null,
    "metricName": "Weight Transfer",
    "description": "Weight to front leg at contact",
    "min": 60,
    "max": 80,
    "unit": "percent",
    "sideRole": "lead",
    "physicalSide": "left",
    "convention": "percent",
    "measurer": "weightTransfer",
    "labelIssue": "The reference describes weight on the front leg; the new measurer estimates pelvis position toward the lead foot, not weight, force, or pressure distribution. The registry's generic heel/toe signed-percentage claim also conflicts with this occurrence's front-leg description.",
    "ambiguities": [
      "Pelvis-center position between feet is not a measured center of mass or force/weight distribution; numeric equivalence to 60–80 percent body weight is unverified.",
      "The registry header's negative-heels/positive-toes convention must not be applied to this explicitly front-leg occurrence without a separate conversion.",
      "Lead-foot direction relies on medium-confidence left lead/plant evidence.",
      "Bat-ball contact is not tracked; the configured strike event is only a hand-speed proxy, and this flat metric has no explicit clip checkpoint assignment.",
      "The professional reference has verificationLevel 'unverified'."
    ],
    "resolution": "proxy",
    "rationale": "'Weight to front leg at contact' explicitly supports a front/lead-foot direction, unlike an unspecified symmetric or back-foot percentage. The supplied clip identifies the left lead/plant foot, so the new weightTransfer measurer can be bound toward anatomical left as a clearly disclosed pelvis-center-between-feet geometry proxy. Preserve 60–80 percent exactly, but do not claim force, weight, ground-reaction-force, or pressure accuracy and do not silently apply the registry's heel/toe signed scale. The professional reference has no phase metrics, and the clip does not assign this flat metric to a checkpoint; phaseName remains null."
  },
  {
    "referenceKey": "golf-driver-swing",
    "clipId": "golf-driver-swing",
    "phaseName": null,
    "metricName": "Hip Rotation",
    "description": "Hip rotation at impact",
    "min": 45,
    "max": 65,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "hipRotation",
    "labelIssue": "Not an interior joint angle; the registry's blanket interior-angle header cannot establish this axial rotation's zero reference.",
    "ambiguities": [
      "The description does not specify rotation zero, reference direction, sign, or whether the range is absolute relative to the target line or relative to address.",
      "Absolute target direction is not configured.",
      "The professional reference is unverified.",
      "Strike / Impact Proxy is a motion-event proxy, not observed club-ball impact."
    ],
    "resolution": "ambiguous",
    "rationale": "This describes pelvis/torso rotation, not a unilateral joint angle. hipRotation is the candidate new measurer, defined relative to first-frame pelvis orientation, but the immutable 45–65 degree range has no documented matching zero. Do not silently compare an absolute target-line/open angle to first-frame-relative rotation; absolute target direction is not configured. The label and description do not establish a compatible relative-rotation convention, so the range remains ambiguous. The supplied laterality evidence identifies right active/left lead, but pelvis rotation has no unilateral physical side. This is a flat occurrence; its impact wording does not create a phase assignment."
  },
  {
    "referenceKey": "golf-driver-swing",
    "clipId": "golf-driver-swing",
    "phaseName": null,
    "metricName": "Shoulder External Rotation",
    "description": "Shoulder turn at top of backswing",
    "min": 75,
    "max": 105,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "shoulderTurn",
    "labelIssue": "The name says shoulder external rotation, but the description specifies torso shoulder turn; this is not glenohumeral external rotation.",
    "ambiguities": [
      "The description does not establish the angular zero, target-line orientation, rotation sign, or whether the reference is relative to initial shoulders or initial pelvis.",
      "Absolute target direction is not configured.",
      "The professional reference is unverified.",
      "Top / Reversal Proxy is not an observed club-top event."
    ],
    "resolution": "ambiguous",
    "rationale": "Read the description, not the misleading name: this is shoulder-girdle/torso turn at the top of backswing, so the candidate is shoulderTurn and not either shoulder external-rotation proxy. The new shoulderTurn measurer is relative to first-frame pelvis orientation; the source does not establish that the preserved 75–105 degree range uses that zero. A range defined relative to an absolute target line cannot silently be compared to this relative value, and absolute target direction is not configured. No arm axial-rotation binding is justified. The arm proxy's unsigned projected forearm-versus-trunk-up angle, elbow-interior validity window of 45–135 degrees, and lack of clinical/internal-external calibration would not fix this torso/arm mismatch. Right-active/left-lead evidence does not make a torso turn a unilateral shoulder measure. The flat metric remains phase-neutral despite its top-of-backswing wording."
  },
  {
    "referenceKey": "golf-driver-swing",
    "clipId": "golf-driver-swing",
    "phaseName": null,
    "metricName": "Knee Flexion",
    "description": "Lead knee flexion at impact",
    "min": 125,
    "max": 155,
    "unit": "degrees",
    "sideRole": "lead",
    "physicalSide": "left",
    "convention": "interior",
    "measurer": "leftKneeAngle",
    "labelIssue": "Flexion is a misleading label for this golf lead-knee interior-angle range; it is not a 125–155 degree ROM-flexion range.",
    "ambiguities": [
      "The professional reference is unverified; resolved identifies the convention and side, not benchmark validation.",
      "Detected right-active/left-lead laterality has medium confidence.",
      "The explicitly configured impact checkpoint is a strike proxy, not observed club-ball impact."
    ],
    "resolution": "resolved",
    "rationale": "The supplied golf-specific interpretation establishes this lead-knee 125–155 degree range as interior, not ROM flexion; preserve the reference values without conversion. This does not infer other entries' conventions solely from range magnitude or rely on the registry header to settle contradictory semantics. The detected config states leadLeg left and explicitly binds Knee Flexion to leftKneeAngle. Evidence is the right-to-left hand-midpoint progression, right trailing elbow folding to 46 degrees versus left lead 121 degrees, and left ankle horizontal travel 0.0056 m versus right 0.0358 m, supporting left brace/right pivot with medium confidence. leftKneeAngle measures the hip–knee–ankle interior angle, 180 degrees straight. The clip explicitly opts this existing flat range into Strike / Impact Proxy, but reference.phases and phase.metrics are absent; that runtime checkpoint does not create a separate source reference occurrence, and phaseName remains null."
  },
  {
    "referenceKey": "golf-driver-swing",
    "clipId": "golf-driver-swing",
    "phaseName": null,
    "metricName": "Spine Extension",
    "description": "Spine tilt at address and through impact",
    "min": 20,
    "max": 40,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "trunkTilt",
    "labelIssue": "Spine Extension names spinal extension, whereas the description says spine tilt; neither is automatically equivalent to unsigned whole-trunk tilt from vertical.",
    "ambiguities": [
      "The description does not define the anatomical axis, reference zero, sagittal versus lateral plane, or sign of tilt.",
      "The registry header defines Spine Lean from vertical, but this occurrence is named Spine Extension and described as spine tilt; that related label does not fully define this metric.",
      "Unsigned trunk tilt cannot distinguish forward from backward lean or measure lumbar spinal extension.",
      "The professional reference is unverified.",
      "The description spans address and through impact without a source phase assignment or specified aggregation/checkpoint."
    ],
    "resolution": "ambiguous",
    "rationale": "The description makes trunkTilt a plausible geometric candidate, but does not establish equivalence of the preserved 20–40 degree range to its definition: unsigned angle between the hips-center-to-shoulders-center trunk axis and world vertical. That measurer is not lumbar spinal extension and not signed sagittal backward lean; if the label's extension is literal, those requested quantities are not equivalent. The source does not explicitly require signed backward lean, but also does not settle the tilt axis/plane/zero enough to resolve the range comparison. This is not an interior limb angle. The allowed convention vocabulary has no dedicated tilt-from-vertical value, and the source convention itself remains ambiguous. No address or impact phase is invented for this flat, multi-time description."
  },
  {
    "referenceKey": "golf-driver-swing",
    "clipId": "golf-driver-swing",
    "phaseName": null,
    "metricName": "Weight Transfer",
    "description": "Weight to front foot at impact",
    "min": 70,
    "max": 90,
    "unit": "percent",
    "sideRole": "lead",
    "physicalSide": "left",
    "convention": "percent",
    "measurer": "weightTransfer",
    "labelIssue": "The source names weight distribution, but the available measurer is a pelvis-position geometry proxy, not force or actual foot loading.",
    "ambiguities": [
      "Pelvis-center position between feet does not establish the true percentage of body weight or ground-reaction force on the lead foot.",
      "The registry header's signed heels/toes percentage conflicts with this entry's front-foot description; the description supports lead-foot direction rather than heels/toes.",
      "The professional reference is unverified and its weight percentages are not calibrated to this geometry proxy.",
      "Detected right-active/left-lead laterality has medium confidence.",
      "Impact timing is a motion proxy, not observed club-ball contact."
    ],
    "resolution": "proxy",
    "rationale": "The description explicitly directs weight to the front foot in this golf swing. The configured leadLeg left, supported by left brace/right pivot and right-to-left swing evidence, identifies front/lead as the anatomical left foot with medium confidence. The new weightTransfer measurer locates pelvis center between the feet toward the lead foot; this provides a leadward geometry percentage, not measured weight, pressure, force, or calibrated center of mass. Direction is compatible with the description, so bind only as a disclosed proxy while preserving 70–90 percent unchanged; do not claim these are validated loading thresholds. The registry's generic signed heels/toes header cannot override the entry's lead-foot semantics. This is not a symmetric -5..5 or back-foot reference, so no signed-center or complementary back-foot conversion is silently introduced. This flat entry receives no invented impact phase."
  },
  {
    "referenceKey": "golf-driver-swing",
    "clipId": "golf-driver-swing",
    "phaseName": null,
    "metricName": "Foot Positioning",
    "description": "Stance width and foot flare",
    "min": 25,
    "max": 45,
    "unit": "degrees",
    "sideRole": "both",
    "physicalSide": "both",
    "convention": "unsupported",
    "measurer": "unsupported",
    "labelIssue": "One degree range conflates stance width, a distance, with foot flare, an angle, without separate definitions or a specified foot.",
    "ambiguities": [
      "The source does not separate stance width from foot flare or explain how width is expressed in degrees.",
      "Foot flare has no specified reference axis, target direction, sign, or individual lead/back-foot definition.",
      "None of the permitted measurers measures stance width and foot flare as this combined quantity.",
      "The professional reference is unverified."
    ],
    "resolution": "unsupported",
    "rationale": "Stance is bilateral, so sideRole and physicalSide are both; the detected left-lead/right-back configuration does not select one foot for this combined stance metric. Preserve the immutable 25–45 degrees but do not treat knee angle, hip rotation, shoulder turn, trunk tilt, or weight transfer as foot positioning. Width and flare are different physical quantities, and the source supplies neither a valid combined definition nor a supported measurer. This unsound combined metric is unsupported, with no fabricated measurement or phase assignment."
  },
  {
    "referenceKey": "soccer-passing",
    "clipId": "soccer-passing",
    "phaseName": null,
    "metricName": "Hip Rotation",
    "description": "Hip rotation during pass",
    "min": 25,
    "max": 45,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "hipRotation",
    "labelIssue": "The label and description do not distinguish pelvis yaw from anatomical hip-joint rotation or define its zero direction.",
    "ambiguities": [
      "The reference does not specify whether rotation is relative to the starting pelvis orientation, absolute to a target line, or rotation at a particular hip joint.",
      "The hipRotation measurer is relative to first-frame pelvis orientation; the reference does not establish this same zero convention.",
      "Absolute target direction is not configured; target-line or open-position angles cannot silently be compared with first-frame-relative values.",
      "The flat metric has no reference phase or measurement checkpoint.",
      "The professional reference is explicitly unverified."
    ],
    "resolution": "ambiguous",
    "rationale": "hipRotation is only a candidate if the reference means pelvis rotation. Its first-frame-relative definition is not established by 'Hip rotation during pass', so direct comparison to 25–45 degrees is not justified. No limb side is assigned to the candidate pelvis measure, and no clip phase is invented."
  },
  {
    "referenceKey": "soccer-passing",
    "clipId": "soccer-passing",
    "phaseName": null,
    "metricName": "Knee Flexion",
    "description": "Passing leg knee angle",
    "min": 125,
    "max": 155,
    "unit": "degrees",
    "sideRole": "back",
    "physicalSide": "right",
    "convention": "ambiguous",
    "measurer": "rightKneeAngle",
    "labelIssue": "'Knee Flexion' names flexion, whereas 'Passing leg knee angle' does not establish whether the values are anatomical flexion or the knee interior angle.",
    "ambiguities": [
      "Neither the generic knee-angle description nor the existing binding settles interior-angle versus flexion convention; range magnitude alone is insufficient.",
      "rightKneeAngle measures the joint interior angle. An anatomical flexion reference would need an explicit conversion such as 180 degrees minus interior angle, rather than direct comparison.",
      "The flat reference does not specify a phase or checkpoint. The clip's Strike Proxy referenceMetrics annotation does not create a separate phase.metrics occurrence or establish the reference's measurement timing.",
      "The clip timing note explicitly calls the existing flat active-knee range unverified and keeps knees report-only.",
      "Laterality confidence is medium and applies only to the selected repetition; other repetitions include left-foot kicks."
    ],
    "resolution": "ambiguous",
    "rationale": "The selected right foot reaches 7.496 m/s versus the left foot's 0.018 m/s, its knee folds then extends, and it travels 0.574 m versus the left foot's 0.0036 m around strike. Together with activeSide right and leadLeg left, this identifies the right passing knee and supports the supplied rightKneeAngle binding. 'Back' denotes the configured non-lead active leg, not a claim that it remains spatially behind throughout the kick. Side identity is supported, but the reference convention remains unverified; 125–155 degrees is preserved without treating its magnitude as proof of an interior-angle convention."
  },
  {
    "referenceKey": "soccer-passing",
    "clipId": "soccer-passing",
    "phaseName": null,
    "metricName": "Spine Extension",
    "description": "Upright posture during pass",
    "min": 3,
    "max": 18,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "trunkTilt",
    "labelIssue": "'Spine Extension' implies spinal extension, but the description instead asks for upright posture; an unsigned trunk tilt is not lumbar extension.",
    "ambiguities": [
      "The reference does not define the spinal segments, angle origin, plane, or sign convention for extension.",
      "trunkTilt is the unsigned angle between the hips-center-to-shoulders-center trunk axis and world vertical; it cannot distinguish backward from forward or lateral lean.",
      "No equivalence or calibration is supplied between the 3–18 degree reference range and unsigned trunk tilt.",
      "The flat metric has no reference phase or measurement checkpoint, and the professional reference is unverified."
    ],
    "resolution": "proxy",
    "rationale": "The explicit description 'Upright posture during pass' supports trunkTilt as a geometry proxy for uprightness. This does not resolve the original angle convention or validate direct threshold comparison. It must be presented as unsigned trunk tilt, not clinical lumbar extension or signed backward lean; if those literal extension quantities are intended, this proxy is not equivalent. No phase is assigned."
  },
  {
    "referenceKey": "soccer-passing",
    "clipId": "soccer-passing",
    "phaseName": null,
    "metricName": "Foot Positioning",
    "description": "Plant foot positioning",
    "min": 30,
    "max": 50,
    "unit": "degrees",
    "sideRole": "lead",
    "physicalSide": "left",
    "convention": "unsupported",
    "measurer": "unsupported",
    "labelIssue": "A positioning metric expressed in degrees does not identify the foot axis, reference axis, plane, or intended angle.",
    "ambiguities": [
      "Foot orientation, foot-to-target angle, and placement relative to the ball are distinct quantities; the description does not select one.",
      "No valid foot-positioning measurer is available in the allowed measurer set.",
      "Absolute target direction and actual ball/contact geometry are not configured or observable in the supplied clip evidence.",
      "The flat metric has no reference phase or measurement checkpoint, and the professional reference is unverified."
    ],
    "resolution": "unsupported",
    "rationale": "The configured leadLeg is left, and the left foot moves only 0.0036 m around strike while the right foot moves 0.574 m, supporting left as the plant foot for this selected repetition. This establishes the intended physical side but not an implementable angular definition. Preserve 30–50 degrees without inventing a foot measurer or mapping it to hip rotation."
  },
  {
    "referenceKey": "soccer-passing",
    "clipId": "soccer-passing",
    "phaseName": null,
    "metricName": "Weight Transfer",
    "description": "Weight distribution",
    "min": 50,
    "max": 70,
    "unit": "percent",
    "sideRole": "unknown",
    "physicalSide": "unknown",
    "convention": "percent",
    "measurer": "weightTransfer",
    "labelIssue": "'Weight Transfer' suggests directional change, while 'Weight distribution' does not specify the foot receiving the percentage. The candidate measurer is a geometric pelvis-position proxy, not weight or force.",
    "ambiguities": [
      "The reference does not identify whether 50–70 percent targets the lead/plant foot, the active passing foot, or another distribution definition.",
      "Although the clip identifies the left lead/plant foot and right passing foot, this does not establish which side is the reference percentage's numerator.",
      "weightTransfer uses pelvis-center position between the feet toward the lead foot. It is not measured ground reaction force, actual weight distribution, or calibrated center-of-mass loading.",
      "The description does not explicitly support direction toward the lead foot, so the geometry proxy cannot be accepted as a resolved directional binding.",
      "A back-foot interpretation would require an explicit percentage conversion; no such interpretation or conversion is supplied.",
      "The flat metric has no reference phase or measurement checkpoint, and the professional reference is unverified."
    ],
    "resolution": "ambiguous",
    "rationale": "The percent unit is explicit and preserved. weightTransfer is only a candidate geometry proxy: its lead-directed endpoint would be the configured left plant foot, but 'Weight distribution' does not connect the 50–70 percent range to that foot. Therefore the reference's side remains unknown and comparison remains ambiguous rather than silently treating pelvis geometry as weight/force or choosing a directional conversion."
  },
  {
    "referenceKey": "soccer-power-shot",
    "clipId": "soccer-power-shot",
    "phaseName": null,
    "metricName": "Hip Rotation",
    "description": "Hip rotation during kicking",
    "min": 40,
    "max": 60,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "hipRotation",
    "labelIssue": "The label and description identify pelvis rotation but do not define its baseline, rotation axis, sign, or angle zero.",
    "ambiguities": [
      "The reference does not say whether 40–60 degrees is rotation from the first-frame pelvis orientation, orientation relative to a target line, or a rotation excursion.",
      "Absolute target direction is not configured; an absolute target-line/open angle cannot be compared directly with a first-frame-relative measurement.",
      "The description supplies no phase-specific sampling rule or signed rotation direction.",
      "The professional reference has verificationLevel unverified."
    ],
    "resolution": "ambiguous",
    "rationale": "Pelvis rotation is a torso quantity, not the right kicking limb's interior joint angle. The specified new hipRotation measurer is relative to the first-frame pelvis orientation. It is a candidate only: the immutable description does not establish that reference zero, so direct range comparison is not resolved. Absolute target direction is not configured. No reference phase is supplied and none is invented."
  },
  {
    "referenceKey": "soccer-power-shot",
    "clipId": "soccer-power-shot",
    "phaseName": null,
    "metricName": "Knee Flexion",
    "description": "Kicking leg knee extension at contact",
    "min": 120,
    "max": 155,
    "unit": "degrees",
    "sideRole": "back",
    "physicalSide": "right",
    "convention": "ambiguous",
    "measurer": "rightKneeAngle",
    "labelIssue": "Knee Flexion labels a metric whose description explicitly concerns kicking-leg knee extension at contact; the reference does not specify the angle-zero convention.",
    "ambiguities": [
      "The description identifies an extending knee but does not explicitly say whether the range is a segment interior angle (180 degrees straight) or a flexion angle (0 degrees straight).",
      "The range magnitude alone and the registry-wide interior-angle claim do not settle this label/description conflict.",
      "Contact is unverified: the clip uses peak active-foot speed during extension as a strike proxy and does not verify ball impact.",
      "The laterality inference has medium confidence, and the professional reference has verificationLevel unverified."
    ],
    "resolution": "ambiguous",
    "rationale": "The detected activeSide is right and leadLeg is left. Evidence reports right-foot speed 9.414 m/s versus left 0.081 m/s during extension, with left ankle travel 0.038 m versus right 1.878 m across the strike band, establishing the right kicking knee as the correct physical-side candidate. The existing exact metric binding is rightKneeAngle, a world-position hip–knee–ankle interior angle with 180 degrees straight. The sideRole back means the non-lead/right leg in this configuration, not a new claim about its position at every instant. Side binding is resolved, but reference convention is not: extension at contact does not alone define numerical angle zero. Do not convert or compare the immutable 120–155 range as verified interior or flexion. The clip's explicit Strike Proxy referenceMetrics assignment is not a reference.phase.metrics entry; retain this occurrence as flat with phaseName null, and preserve the report-only/no-knee-correction timing caveat."
  },
  {
    "referenceKey": "soccer-power-shot",
    "clipId": "soccer-power-shot",
    "phaseName": null,
    "metricName": "Spine Extension",
    "description": "Trunk lean at contact",
    "min": 8,
    "max": 22,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "trunkTilt",
    "labelIssue": "Spine Extension suggests spinal extension, while the description requests trunk lean; these are not interchangeable anatomical measurements.",
    "ambiguities": [
      "The reference does not define whether trunk lean is unsigned inclination from vertical, signed backward sagittal lean, or spinal/lumbar extension.",
      "The specified trunkTilt measurer cannot distinguish forward, backward, and lateral lean of equal magnitude and cannot measure lumbar spinal extension.",
      "The registry header defines Spine Lean from vertical, but this metric is labeled Spine Extension and its description does not explicitly establish that convention.",
      "Contact is only a strike proxy in this clip, and the professional reference has verificationLevel unverified."
    ],
    "resolution": "ambiguous",
    "rationale": "The description makes trunkTilt a candidate for whole-torso lean, but not a validated replacement for the label Spine Extension. The specified measurer is the unsigned angle of the hips-center-to-shoulder-center trunk axis versus world vertical. If the intended quantity is signed sagittal backward lean or lumbar extension, that measurer is not equivalent and must not be used for the reference comparison. The exact reference does not settle which definition is intended. Preserve the 8–22 degree range without inventing sign, anatomical segmentation, or a reference phase."
  },
  {
    "referenceKey": "soccer-power-shot",
    "clipId": "soccer-power-shot",
    "phaseName": null,
    "metricName": "Foot Positioning",
    "description": "Plant foot angle",
    "min": 40,
    "max": 60,
    "unit": "degrees",
    "sideRole": "lead",
    "physicalSide": "left",
    "convention": "unsupported",
    "measurer": "unsupported",
    "labelIssue": "Foot Positioning is generic; Plant foot angle identifies the support foot but omits the foot axis and the reference direction needed for an angle.",
    "ambiguities": [
      "The reference does not define foot yaw versus another angle, the toe/heel landmarks, angle zero, or target-line orientation.",
      "Absolute target direction is not configured, and no permitted plant-foot-angle measurer is available.",
      "The left support-foot role is inferred with medium confidence; ground contact and forces are not measured.",
      "The professional reference has verificationLevel unverified."
    ],
    "resolution": "unsupported",
    "rationale": "Detected laterality identifies left as leadLeg and explicitly describes the left approach/support leg and right kick, so the plant-foot candidate is left. Foot Positioning is unsupported by the permitted measurers; a knee angle, hip rotation, or pelvis-center proxy does not measure plant-foot angle. Preserve the immutable 40–60 degree range but do not synthesize a measurement, a target direction, verified contact, or a reference phase."
  },
  {
    "referenceKey": "soccer-power-shot",
    "clipId": "soccer-power-shot",
    "phaseName": null,
    "metricName": "Weight Transfer",
    "description": "Weight on plant foot",
    "min": 65,
    "max": 85,
    "unit": "percent",
    "sideRole": "lead",
    "physicalSide": "left",
    "convention": "percent",
    "measurer": "weightTransfer",
    "labelIssue": "Weight Transfer is described as weight on the plant foot, but the candidate measurer supplies pelvis-center geometry, not measured weight, load, or force.",
    "ambiguities": [
      "A percentage of pelvis-center position between the feet is not a percentage of body weight or ground-reaction force on the support foot.",
      "The reference's 65–85 percent range is unverified and is not validated as a pelvis-position benchmark.",
      "The registry-wide heel/toe signed-percentage convention differs from this occurrence's specific plant-foot percentage description; the occurrence-specific lead-foot direction is used for the proxy only.",
      "The left plant/support role is a medium-confidence geometric inference; forces and contact are not measured."
    ],
    "resolution": "proxy",
    "rationale": "The exact description Weight on plant foot supplies a direction toward the support foot, and detected leadLeg left identifies that foot. This supports the specified weightTransfer measurer only as a pelvis-center-between-feet percentage toward the left lead foot. Resolve the directional geometry proxy, not physical weight transfer: do not present it as force or load, and do not treat the preserved 65–85 percent range as a validated force or proxy benchmark. This occurrence is not a symmetric signed or back-foot range and requires no invented sign conversion. No reference phase or contact instant is supplied by this flat description."
  },
  {
    "referenceKey": "tennis-serve",
    "clipId": "tennis-serve",
    "phaseName": null,
    "metricName": "Shoulder External Rotation",
    "description": "Maximum shoulder rotation in trophy position",
    "min": 145,
    "max": 175,
    "unit": "degrees",
    "sideRole": "throwing",
    "physicalSide": "right",
    "convention": "ambiguous",
    "measurer": "unsupported",
    "labelIssue": "The label specifies external rotation, but the description only says shoulder rotation and does not establish upper-arm axial rotation, an anatomical plane, or a calibrated external-rotation zero.",
    "ambiguities": [
      "The description does not distinguish arm axial rotation from shoulder-girdle or torso rotation; a label-only shoulder-ER binding is insufficient.",
      "The stored range has no definition of zero, sign, segment axes, or internal-versus-external calibration.",
      "A potential rightShoulderExternalRotationProxy would measure an unsigned angle between the forearm projected onto the plane normal to the upper arm and projected trunk-up, not clinical shoulder external rotation.",
      "That proxy is valid only when elbow interior angle is 45–135 degrees and its projections are non-degenerate; validity across the trophy-like preparation has not been established.",
      "The source is explicitly unverified, and the clip is serve-like rather than an equipment-verified serve."
    ],
    "resolution": "ambiguous",
    "rationale": "The clip's right wrist extends overhead after the left off-arm raise, with recorded right-versus-left wrist speeds of 7.34 versus 1.60 m/s; this supports the right arm as the throwing/striking arm at medium laterality confidence. However, both metric label and description must substantiate arm axial rotation before binding the ER proxy. Here the generic description is insufficient, so no proxy is bound and unsupported denotes the absent defensible measurer binding, not a fabricated measurement. Even if axial rotation is clarified, the unsigned projected-forearm proxy requires elbow-interior validity gating and external-rotation calibration before the immutable 145–175-degree range could be compared. The registry's blanket interior-joint header cannot define shoulder axial rotation. This remains a flat occurrence; no trophy phase row is invented."
  },
  {
    "referenceKey": "tennis-serve",
    "clipId": "tennis-serve",
    "phaseName": null,
    "metricName": "Elbow Flexion",
    "description": "Elbow angle at trophy position",
    "min": 85,
    "max": 115,
    "unit": "degrees",
    "sideRole": "throwing",
    "physicalSide": "right",
    "convention": "ambiguous",
    "measurer": "rightElbowAngle",
    "labelIssue": "Flexion in the label can mean ROM flexion, whereas the configured measurer produces an interior joint angle; the description only says elbow angle.",
    "ambiguities": [
      "Neither the label plus description nor the unverified reference specifies whether zero is full extension (ROM flexion) or full folding (interior angle).",
      "The registry header asserts interior angles, but the individual description does not independently settle the flexion/interior terminology conflict; range magnitude cannot resolve it.",
      "The clip explicitly assigns this flat range only to Trophy-Like Preparation, but that assignment does not validate its professional phase-specific meaning.",
      "Laterality confidence is medium, and actual serve versus smash cannot be confirmed without equipment."
    ],
    "resolution": "ambiguous",
    "rationale": "The immutable clip binding names rightElbowAngle, consistent with the right overhead active arm and the left off-arm raise. The local measurer computes the shoulder–elbow–wrist interior angle, with 180 degrees straight and 90 degrees bent. Its side is resolved, but the stored Elbow Flexion/Elbow angle wording does not establish whether the 85–115-degree reference is interior or ROM flexion. Do not settle that question from the numerical range or blanket registry header, and do not silently convert the original range. The existing configuration confines this benchmark to trophy-like preparation and explicitly excludes stroke contact. This audit preserves the original flat occurrence with phaseName null; the configured referenceMetrics checkpoint pointer is not an additional phase.metrics entry. Reference verification remains unverified."
  },
  {
    "referenceKey": "tennis-serve",
    "clipId": "tennis-serve",
    "phaseName": null,
    "metricName": "Hip Rotation",
    "description": "Hip rotation during serve",
    "min": 35,
    "max": 55,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "ambiguous",
    "measurer": "hipRotation",
    "labelIssue": "The name identifies pelvis rotation, but the description gives no reference frame, zero, sign, or whole-motion aggregation definition.",
    "ambiguities": [
      "The source does not say whether the range is pelvis rotation relative to initial posture, absolute orientation relative to the court/target line, or total rotational excursion.",
      "The proposed hipRotation measurer is relative to first-frame pelvis orientation; the source does not establish that same zero convention.",
      "Absolute target direction is not configured, so any absolute target-line/open interpretation cannot be compared to first-frame-relative values.",
      "Hip rotation during serve does not specify a checkpoint, peak, excursion, or averaging interval.",
      "The reference is unverified."
    ],
    "resolution": "ambiguous",
    "rationale": "This is a torso/pelvis-axis metric involving both hips, not unilateral hip flexion or an interior limb angle, so physicalSide is none. hipRotation identifies the applicable proposed relative-pelvis measurer only as a candidate; resolution ambiguous prohibits treating its values as directly comparable to 35–55 degrees. The exact description neither defines the first-frame-relative convention nor explicitly requires an absolute target-line convention. Absolute target direction is not configured, and no absolute-to-relative conversion can be invented. Keep the reference flat and leave whole-motion sampling semantics unspecified rather than inventing a phase."
  },
  {
    "referenceKey": "tennis-serve",
    "clipId": "tennis-serve",
    "phaseName": null,
    "metricName": "Knee Flexion",
    "description": "Knee bend during loading",
    "min": 100,
    "max": 140,
    "unit": "degrees",
    "sideRole": "back",
    "physicalSide": "right",
    "convention": "ambiguous",
    "measurer": "rightKneeAngle",
    "labelIssue": "The label says flexion and the description says bend, but neither establishes the angle zero; the clip binds an interior-angle measurer.",
    "ambiguities": [
      "Knee bend during loading does not explicitly specify interior angle versus ROM flexion; the 100–140-degree range alone must not decide this.",
      "The registry-wide interior claim does not eliminate the individual label/description convention uncertainty in this unverified reference.",
      "The reference itself does not name the knee; right/back pre-drive support is a clip-specific binding rather than a verified property of the professional benchmark.",
      "The left leg is the landing/receiving lead, and neither foot is securely planted at peak extension; loading support must not be confused with contact or landing support.",
      "The reference and its explicit Loaded Stance checkpoint assignment remain unverified."
    ],
    "resolution": "ambiguous",
    "rationale": "The clip explicitly binds Knee Flexion to rightKneeAngle and states that the loaded knee is the right pre-drive support leg. With left identified as the landing/receiving lead leg, right is the back/support role for this loading interpretation, at medium laterality confidence. The measurer computes the hip–knee–ankle interior angle, 180 degrees straight. Neither Knee Flexion nor Knee bend during loading independently settles whether the stored 100–140-degree range uses that convention or ROM flexion. Preserve the range unchanged and flag ambiguity instead of assuming interior from its magnitude or copying a flexion inference from another sport. The existing Loaded Stance referenceMetrics pointer is not a phase.metrics occurrence; this original reference remains phaseName null."
  },
  {
    "referenceKey": "tennis-serve",
    "clipId": "tennis-serve",
    "phaseName": null,
    "metricName": "Spine Extension",
    "description": "Back arch at trophy position",
    "min": 15,
    "max": 35,
    "unit": "degrees",
    "sideRole": "torso",
    "physicalSide": "none",
    "convention": "unsupported",
    "measurer": "unsupported",
    "labelIssue": "Spine extension/back arch is not an unsigned rigid trunk-axis inclination from world vertical.",
    "ambiguities": [
      "The source does not define lumbar versus whole-spine extension, the anatomical segment landmarks, or the neutral baseline.",
      "If back arch instead intends signed sagittal backward lean, an anatomical sagittal frame and backward sign are still required.",
      "trunkTilt is unsigned hips-center-to-shoulders-center inclination versus world vertical; it cannot distinguish backward from forward or lateral lean and does not measure spinal curvature.",
      "The reference is unverified."
    ],
    "resolution": "unsupported",
    "rationale": "Read together, Spine Extension and Back arch at trophy position request spinal extension/arching rather than merely inclination of a single torso axis. The proposed trunkTilt measurer is therefore not equivalent: an upright but arched spine and a straight tilted trunk need not yield the same extension, and the unsigned angle loses backward direction. Neither clinical/anatomical lumbar extension nor signed backward sagittal lean has a defensible binding among the allowed measurers for this description. Do not relabel the immutable 15–35-degree arch range as trunk tilt. This torso metric has no unilateral physical side and remains a flat occurrence despite the trophy-position wording."
  },
  {
    "referenceKey": "tennis-serve",
    "clipId": "tennis-serve",
    "phaseName": null,
    "metricName": "Weight Transfer",
    "description": "Weight transfer into court",
    "min": 60,
    "max": 80,
    "unit": "percent",
    "sideRole": "unknown",
    "physicalSide": "unknown",
    "convention": "percent",
    "measurer": "weightTransfer",
    "labelIssue": "Weight implies force/load transfer, while the proposed measurer is a pelvis-position geometry proxy; into court is not explicitly toward the lead foot.",
    "ambiguities": [
      "The reference specifies courtward direction but does not identify transfer toward the lead foot, the destination foot, or a configured court axis.",
      "The proposed weightTransfer measurer locates pelvis center between the feet toward the lead foot; the reference does not establish equivalence to its direction or percentage scale.",
      "The clip identifies left as the landing/receiving lead, but that alone does not establish that transfer into court means pelvis position toward the left foot.",
      "Pelvis geometry cannot measure ground-reaction forces or actual weight distribution, especially when neither foot is securely planted at peak extension.",
      "The registry header describes a signed heels/toes-centered scale, whereas the new proxy is lead-foot-directed; no explicit conversion or calibration is supplied.",
      "The reference is unverified and provides no peak, checkpoint, or averaging definition."
    ],
    "resolution": "ambiguous",
    "rationale": "The unit explicitly establishes a percentage, so convention is percent, but the quantity and direction remain unresolved. weightTransfer is retained only as the proposed candidate geometry measurer, not as an authorized direct comparison to 60–80 percent. A proxy resolution would require the description to support transfer toward the lead foot or an explicit validated courtward-to-lead-foot mapping and scale conversion. Neither is present. Although the clip's receiving lead is left and pre-drive support is right, assigning the benchmark's destination side from that fact would invent semantics; sideRole and physicalSide therefore remain unknown. Absolute court/target direction is not configured. No force-based claim or phase assignment is created."
  }
];

/** Flat benchmarks: explicit test-only checkpoint choices, not professional phases.
 * Each metric is assigned once. Undefined semantics remain unavailable, not omitted.
 */
export const MOCAP_FLAT_AUDIT_CHECKPOINTS: Readonly<Record<string, Readonly<Record<string, readonly string[]>>>> = {
  "baseball-fastball": {
    "Stride / Plant Proxy": [
      "Knee Flexion",
      "Hip Rotation"
    ],
    "Max Cocking": [
      "Elbow Flexion",
      "Shoulder External Rotation"
    ],
    "Release Proxy": [
      "Weight Transfer",
      "Spine Extension"
    ]
  },
  "baseball-batting-swing": {
    "Leg Lift / Load": [
      "Knee Flexion"
    ],
    "Strike Proxy": [
      "Elbow Flexion",
      "Hip Rotation",
      "Weight Transfer",
      "Spine Extension"
    ]
  },
  "golf-driver-swing": {
    "Address": [
      "Spine Extension",
      "Foot Positioning"
    ],
    "Top / Reversal Proxy": [
      "Shoulder External Rotation"
    ],
    "Strike / Impact Proxy": [
      "Knee Flexion",
      "Hip Rotation",
      "Weight Transfer"
    ]
  },
  "soccer-passing": {
    "Setup": [
      "Spine Extension"
    ],
    "Strike Proxy": [
      "Knee Flexion",
      "Hip Rotation",
      "Foot Positioning",
      "Weight Transfer"
    ]
  },
  "soccer-power-shot": {
    "Strike Proxy": [
      "Knee Flexion",
      "Hip Rotation",
      "Spine Extension",
      "Foot Positioning",
      "Weight Transfer"
    ]
  },
  "tennis-serve": {
    "Trophy-Like Preparation": [
      "Elbow Flexion",
      "Shoulder External Rotation",
      "Spine Extension"
    ],
    "Loaded Stance": [
      "Knee Flexion"
    ],
    "Overhead Stroke Proxy": [
      "Hip Rotation",
      "Weight Transfer"
    ]
  }
};
