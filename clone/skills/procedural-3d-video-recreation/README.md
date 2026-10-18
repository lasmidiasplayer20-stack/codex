# Procedural 3D Video Recreation

A shareable English-language skill for rebuilding reference videos as procedural 3D animation. It covers full-source analysis, articulated rigs, proportions, contacts, camera direction, audio alignment, native-resolution exports, and honest validation.

## Install and use

Copy this entire folder into your assistant's skills directory, keeping `SKILL.md`, `references`, `assets`, `scripts`, and `templates` together. For Codex, use `$CODEX_HOME/skills/procedural-3d-video-recreation` (normally `~/.codex/skills/procedural-3d-video-recreation`), then restart the session if needed. Invoke `$procedural-3d-video-recreation` with your video, visual reference, output requirements, and authorized publication destination. Other compatible skill systems can load the same `SKILL.md` and relative resources.

## Included

- `SKILL.md`: the workflow and completion criteria.
- `references/`: visual-style guide, validation checklist, and provenance.
- `assets/reference/3d-cozy-snow-plow-game.zip`: the complete original visual reference, about 574 KiB. Its `index.html` is the main procedural visual source; its original contents are preserved unchanged.
- `templates/three-rig/`: executable Three.js rig demonstration with a pinned lockfile and technical checks.
- `scripts/inspect_reference.py`: source metadata and SHA-256.
- `scripts/package_skill.py`: reproducible shareable ZIP with an internal checksum manifest.
- `scripts/validate_export.py`: resolution, FPS, frame count, full decode, and optional audio-alignment checks. Requires Python 3.11+ and FFmpeg/FFprobe.

No source video, soundtrack, rendered MP4, live credential, cache, or installed dependency is included. The workflow requires no AI API key. See `references/provenance.md` for the reference archive's original notices and licensing scope.

The tested rig, browser capture, native MP4 smoke export, reference integrity, and validator results are recorded in `references/template-validation.json`.

To rebuild the distribution, run `python scripts/package_skill.py` from this folder. It excludes installed dependencies, caches, and local video outputs.

This skill guides an authored reconstruction. It cannot automatically guarantee exact matching motion, camera, cloth, physics, or artistic fidelity.
