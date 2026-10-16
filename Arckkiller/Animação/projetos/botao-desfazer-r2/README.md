# One More Take — Revision 2

An original, colorful 210-second short with Ink, Cyan and Amber. A cake delivery becomes an increasingly unwise experiment with a five-charge undo remote. Once the charges run out, the three friends finish the job together.

The previous film remains in `../botao-desfazer/`. This is a separate rebuild of its staging and performance, following the reference audit in that project's `qa/reference-audit/`.

## Deliverables

The complete final film is in [the R2 video folder](../../Vídeos/O-botão-de-desfazer-R2/). The final MP4 is `O-botão-de-desfazer-1080p60.mp4`: 1920×1080, 60 fps, 12,600 frames, stereo AAC. All visible text is English.

Open `index.html` through a local server for the interactive player, or use the delivered MP4. Run `npm test`, `node review.mjs` and `node check-player.mjs` for the pose, continuity, temporal-frame and player checks. `node render-parts.mjs` renders seven parts; `score.py` creates the synchronized soundtrack; `assemble.py` assembles and fully decodes all eight deliverables for verification. Install Node dependencies with `npm install` and Python dependencies with `python3 -m pip install -r requirements.txt`. Chromium and FFmpeg must also be available. Python dependencies are NumPy for the soundtrack and Pillow/OpenCV for decoded-frame review.

## What changed

- Persistent cart, cake, camera and character staging replace independent drifting trajectories. Distinct work positions keep the silhouettes separated.
- Native forward time advances at one story second per second. Each rewind restores the same recorded history for props, feet and joint poses; it resumes at the exact restored state. The five reverse effects are deliberately presented as rewinds.
- The original V3 `Physics.advanceBody` integrates cake flights at 120 Hz. Character jumps use ballistic trajectories with gravity 900 scene units/s².
- V6's support and contact design informs planted feet, reachable cart holds and the serving-tray handoff. Final IK is recorded directly into the preserved FK; smoothing no longer breaks a solved contact.
- V3's facing convention informs the elbow and knee bend directions. Polar interpolation, walking-to-air blends and foot settling reduce abrupt gesture changes.
- Steam, airflow, sparks, frosting, a pastry conveyor, the clock and party effects provide simultaneous secondary action. The camera follows the same persistent delivery route.
- The final scene adds animated reactions to the frosting accident rather than holding the cast still.

## Sound and provenance

The soundtrack reuses 24 already generated ElevenLabs assets. The new edit schedules 73 sound events and 155 footsteps, with original procedural music and a low background motor/clock bed. No new API key is stored here, and no additional ElevenLabs generation was needed. `qa/audio-production.json` identifies every scheduled effect's provider. Automated audio checks do not imply human listening.

The original `src/model.js`, `src/legacy-renderer.js` and `vendor/rig-controller.js` remain byte-identical to the reference. `src/math.js` and `src/physics.js` come from V3. The new director, performance layer and colorful bakery are authored for this film; the V6 movie itself is not stretched, recolored or spliced into it.

## Validation scope

`qa/performance.json` reports checks of the actual FK playback over all 37,800 actor poses: fixed bone lengths, finite coordinates, final hand targets, floor clearance, pairwise head separation, conservative cake/head clearance and rewind boundaries. `qa/continuity.json` checks flight endpoints, native motion and quiet intervals. `qa/player.json` checks seek and play/pause synchronization. `qa/framing.json` checks 226,800 projected actor landmarks and cake bounds across the full timeline. `qa/export-validation.json` records dimensions, frame counts, audio streams, full decoding and SHA-256 for every delivered MP4.

This combines directed animation, constraints and free-flight integration. It is not a general rigid-body simulation of every character and prop. The head and cake clearance checks do not establish that every possible silhouette intersection has been mathematically excluded; temporal review complements them.

## Export organization

Only the complete film remains in the video delivery folder. Rendered parts and their metadata are preserved in `production/parts/`. Rendering and assembly now use this location.
