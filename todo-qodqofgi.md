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
- [ ] Push rewritten completed main to user_github/main with force-with-lease.
- [ ] Save the required managed WebDev checkpoint.
- [ ] Verify final GitHub main matches the final checkpoint SHA and report it.
