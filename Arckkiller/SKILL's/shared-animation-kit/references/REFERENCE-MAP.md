# Reference map

| Material | Best use | Limits |
| --- | --- | --- |
| Original | Preserved profile, renderer, FK, base solver and visual-reference workflow | 24 fps and early acting |
| V2 | Livelier acting and composition comparisons | Early limb/turn behavior |
| V3 | Fixed limb directions, 60 fps, positive-mass dynamics and contacts | Earlier story pacing |
| V4 | Three actors and six mechanism sections | Section resets are not continuous storytelling |
| V5 | Comic cause/effect and denser visual activity | Compresses time; do not copy speed-up for native-time requests |
| V6 | Persistent room, grip constraints, causal state and continuous 150-second story | Directed trajectories; not an active general physics solver |
| One More Take R1 | Negative examples and audit of slow movement, penetration and overlap | Do not use as production default |
| One More Take R2 | Native acting and genuine full-state rewind mechanism | Further visual fixes were deferred |
| The Wrong Door R1 | Historical capture diagnostics and rejected staging | Noisy limbs, faces and rough props; do not use as the production scaffold |
| The Wrong Door R2 | Reference beat/audio timing, faceless body acting, authored fixed-rig gait and coherent drawn props | Directed adaptation; not a pixel-perfect trace or general physics solver |
| Don't Press Play | Current 210-second colorful production, concurrent routes, parcel dynamics, audio and export | Factory-specific choreography and fixed duration |

Browse `versions/<version>/src`, `tests`, `exports` and source documentation. For a concise cross-version comparison and images, see `../project-archive/projetos/botao-desfazer/qa/reference-audit/`. For current visual examples see `../project-archive/projetos/dont-press-play/qa/`.

The bundled contact sheets cover the original reference films and produced films. Full MP4s are not duplicated into this source package: links, sizes and hashes are recorded in `VIDEO-CATALOG.json`, and `scripts/fetch-videos.py` can download a selected complete film into a `Vídeos` directory and verify its SHA-256. The six reference movie hashes are derived from the inspected source files. Historical film quality varies; inclusion is not an endorsement of every frame.

For external reference videos use `scripts/extract-reference.py INPUT OUTPUT --interval 5`. The output contains timed JPEG samples, a contact sheet and FFprobe metadata. Add tighter samples around contacts and turns, using a smaller interval or direct FFmpeg seek extraction. Record screen directions, proportions, depth, contact points, timing, color and camera before implementing motion. Still-image references supply composition and design information, not reliable velocities or physical parameters.
