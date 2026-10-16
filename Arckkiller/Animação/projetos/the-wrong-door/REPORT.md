# Production report — The Wrong Door

## Deliverable

A complete 118.75-second reference adaptation at 1920×1080, 60 fps and 7,125 frames, built internally as five 20-second sections and one 18.75-second section. The complete MP4 alone belongs in Vídeos/The-Wrong-Door. Internal parts and working files remain in ignored production directories.

The supplied file is 852×480 at 24 fps, with 2,850 frames and stereo 44.1 kHz AAC audio. Its visible watermark identifies the source as Pencilmation; the exact source title is not asserted. Source metadata and SHA-256 are in reference/source.json. The uploaded source video remains outside Git.

## Character and adaptation

Cyan uses the original model, FK controller and drawing code unchanged. All bones retain the model's exact ratios and the head retains its circular profile. New adapters control source visibility and floor contact without editing the original files. qa/preservation.json records exact hashes.

The numeric capture measures head/body trajectories, limb endpoints, facial vectors and prop transforms. It refines external head contours, handles inverted/side-lying poses, assigns stable limbs in torso space and repairs isolated endpoint measurements before IK. A stable headstand hold and the floor-seated transition receive directed corrections. Three explicit irritated commuters replace false extra figures from facial segmentation. Secondary gait and briefcase gestures are authored; their positions and departures follow the reference group.

The floor projection evaluates actual quadratic drawing extrema, stroke widths and head bounds over every output-frame pose. It translates a pose to preserve support without changing its proportions; secondary walking cast align to the floor. This can shift measured screen-space trajectories. Door anticipation/front layers, seated support and source-timed curtain reveal are adapted to the original clean studio/theatre.

This is a fixed-proportion, source-timed adaptation. It is not a claim of pixel-identical reproduction, exact automatic motion capture or full rigid-body character physics. Some source endpoints are unreachable with our character's different anatomy; the report records those residuals. Structural/support measurements do not prove every possible visual occlusion correct.

## Sound

The original reference audio is copied into audio/reference-track.m4a and kept at time zero and 1× speed. It includes the source's mixed effects, vocalizations and any existing music; no source separation is claimed. A quiet new 112 BPM score is composed in Python/NumPy using a reproducible seed, pizzicato, bass and reed responses at selected beats. The final mix is stereo 48 kHz AAC with limiting. qa/audio-production.json and qa/loudness.json record production and measurement. No human listening assessment is claimed.

## Verification

- qa/performance.json: every 60 fps output time, finite FK positions, model bone ratios, circular heads, exact drawn-curve floor bounds and deterministic seeks. Rapid reference transitions remain diagnostic entries, not a universal smoothness pass.
- qa/player.json: seeking to 86 seconds and play/pause with the 118.75-second soundtrack, without browser errors.
- qa/temporal-review.json, temporal/contact sheets and source frame reviews: nearby samples around the fastest turns, leap, ejection, headstand, sit-up, anger, water and stage actions.
- qa/export-validation.json: exact frames, duration, resolution, frame rate, audio format, SHA-256 and full decode for all six internal sections and the complete movie.
- qa/decoded-review.json and decoded-overview.jpg: actual encoded-frame review, separate from canvas images.

Source, reports and reusable workflows are also included in the rewritten Arckkiller skill library. Separate reference-video and original-creation skills share the same rig, physics and asset library; portable ZIPs omit repeated historical mixes and large archival image sheets, while the complete ZIP retains the full source/asset collection.

## Final export

SHA-256: `3c63b9ba9178da49ff2d5dc4e2dd4738f85368df1cd1a9da6e8129f7d68171cb`. Size: 33396401 bytes. Full decode passed for the complete movie and all six internal sections. The delivery stays below 32 MiB for later reference uploads. Measured final mix: -17.26 LUFS and -2.20 dBTP.
