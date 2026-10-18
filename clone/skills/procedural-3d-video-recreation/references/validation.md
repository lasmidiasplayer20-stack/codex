# Review criteria

First apply `failure-modes.md` to the new source and initialize `../templates/review-ledger.json`. Maintain reproducing intervals and verification evidence for every user-reported correction. The catalog contains reusable rules; its checks are not automatically satisfied by importing the rig.

Record measurements and visual evidence. Syntax checks do not establish a working renderer; IK tests do not establish artistic fidelity.

1. **Timeline:** complete coverage, correct order, full duration, cuts and camera compared with the source. Use frame indices at segment boundaries.
2. **Rig:** constant arm, leg, and torso lengths across poses; no NaNs; clamped and reported unreachable targets; intended elbow/knee bend direction.
3. **Contacts:** foot–floor distance and stance drift; hip–seat and body–mattress clearance; knees/feet–desk supports; hand–object; wheels–road. Account for thickness, orientation, and scale, not just centers. Review intermediate transitions and times immediately before/after cuts.
4. **Props and proportions:** coherent dimensions, explicitly boolean visibility, no duplicated/ghost vehicle. Add regression checks at concrete times for observed defects.
5. **Rendering:** browser errors absent, actual frames generated, FFprobe confirms duration/FPS/resolution. Render natively at the requested dimensions. Review every shot's start/middle/end and assembly joins. Compare visual output as well as speed when optimizing.
6. **Audio:** duration, channels, alignment, no repeated/dropped intervals. For retained audio, compare matching samples near the start, middle, and end. The validator optionally correlates decoded PCM. For recreated audio, compare events and disclose differences.
7. **MP4:** run `scripts/validate_export.py output.mp4 --duration SECONDS --fps 30 --width 1920 --height 1080 [--audio-reference soundtrack.m4a]`. Decode the entire file with fatal errors enabled. Check hash and size; meet destination limits without silently lowering resolution.
8. **Publication:** executable sources, lockfile, report, and final video at the authorized destination. Verify the remote commit. Keep previews inside the project and only the complete film in the final-video directory. Do not describe a pending push as completed.

Reports must distinguish passed, failed, unexecuted checks, and coverage limits. Keep artistic review separate from numerical checks.
