# Isolated licensed mocap evaluation and history repair

- [x] Use only Football_Quarterback_mixamo.fbx and the existing MaleHologram model.
- [x] Keep Analysis.tsx, Replay.tsx, and Hologram3D.tsx unchanged.
- [x] Use SkeletonUtils.retargetClip with source reference wrapper, identity name map, and 0.01 unit scale.
- [x] Trim the approximate throw window to source 23.33–25.33 seconds at 24 fps.
- [x] Restore the isolated page after sandbox reset, including play/pause, scrubber, frame stepping, and local rotation readouts.
- [x] Refresh managed private FBX storage and validate same-origin binary delivery.
- [x] Revalidate proportions and controls in the live browser.
- [x] Provide byte-exact downloadable qb_video.mp4 and pose_data_full.json backups.
- [x] Receive explicit user confirmation that both backups have been downloaded.
- [x] Preserve a pre-rewrite repository bundle outside the project.
- [x] Remove both oversized file paths from Git history and verify protected production file hashes.
- [x] Pass TypeScript, production build, 135 tests, and diff checks.
- [x] Push rewritten completed main to user_github/main with force-with-lease.

GitHub independently confirmed commit `03fcf6ecd0b27addeda8cb7001f07c3c76dcd6d1` after the repaired code push. Managed checkpoint saving and final remote-SHA verification follow this record; the final checkpoint result and exact GitHub SHA are reported in the task delivery.

Checkpoint status: blocked by divergent managed S3 origin/main at 74e11897. The normal merge was not performed because it would undo the authorized historical-blob purge. Direct S3 access is unavailable by platform design, and no managed-history replacement tool is exposed. The cleaned, validated code is pushed to GitHub. A final documentation commit and independent GitHub SHA verification complete the task's available work; managed checkpoint saving remains unresolved.
