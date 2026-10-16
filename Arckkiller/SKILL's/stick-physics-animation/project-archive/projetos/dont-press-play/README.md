# Don't Press Play

**3:30 · 1920×1080 · 60 fps · English visible text**

Ink, Cyan and Amber test an automated gift factory. The PLAY button disappears behind a safety shutter, the conveyors reverse, the return system backs up and ribbon tangles across the workshop. They finally coordinate three safety levers—but one oversized present is still on its way.

This is an original scenario and choreography. The earlier One More Take films remain preserved; their pending animation corrections are outside this project.

## Delivery and production layout

Only the [complete film](../../Vídeos/Dont-Press-Play/Dont-Press-Play-1080p60.mp4) belongs in Vídeos. Seven 30-second production parts, smoke tests, raw streams and their metadata are generated locally in `production/parts/`, which is ignored by Git. Review reports and contact sheets are in `qa/`.

Install Node dependencies with `npm install` and Python dependencies with `python3 -m pip install -r requirements.txt`. Chromium and FFmpeg must be installed. Then:

```sh
npm test
node review.mjs
python3 score.py
node check-player.mjs
node render-parts.mjs
python3 assemble.py
python3 review-decoded.py
```

Serve `index.html` over HTTP to use the interactive player. The complete MP4 is the primary delivery.

## Motion and collisions

- Three directed action paths run simultaneously on separate, persistent factory levels. Forward playback uses one story second per second; the MP4 is not accelerated.
- The original profile, FK controller and drawing functions are preserved byte for byte. Facing changes pass through extended limbs, and gestures use polar transitions instead of crossing through the shoulder.
- Feet plant on the appropriate platform. Lower-level jumps respect the overhead platform clearance; larger jumps are reserved for the upper route. Holds and the PLAY/safety-lever contacts are solved before recording FK poses, without post-IK smoothing.
- Free parcels use the original V3 body integrator at 120 Hz, positive masses, gravity, restitution and moving-belt drive. They collide with platform slabs using the projected support of the drawn rounded boxes, with each other through conservative bounds, and with capsules sampled along the actual quadratic actor drawing curves. Held packages have explicit ownership and parcel-edge hand targets.
- Parcel collision circles conservatively enclose the drawn rotated boxes and ribbons. An eight-pass contact solve resolves supports, moving actor silhouettes and package pairs. Collection columns visibly identify where parcels leave the room.
- The machine, conveyors, return hose, shutter, ribbon and camera retain their state across all seven production boundaries. Factory modes change within the same room.

This combines directed character acting and dynamic parcels. The actors are kinematic collision surfaces, rather than a full rigid-body humanoid simulation.

## Sound

Four new ElevenLabs effects were generated for the machine startup, wrapped parcels, safety shutter and pneumatic printer. They complement 24 existing reusable effects and a newly arranged procedural score at 144 BPM. Every scheduled effect records its provider in `qa/audio-production.json`. Credentials remain outside the repository. No human listening assessment is claimed.

## Review

`qa/performance.json` measures actual FK playback over 37,800 actor poses, including final hand targets, support clearance, pairwise curved actor silhouettes, held-package/head clearance, dynamic parcel/actor/parcel/slab contacts, actor clearance beneath overhead platforms, camera framing and simultaneous motion. `qa/export-validation.json` records exact frame counts, audio, full decoding and SHA-256 for the complete film and the seven local production parts. Temporal and decoded-image review complement these checks; they do not claim a proof covering every possible visual occlusion.
