# Don't Press Play — final production report

Original 210-second factory film, seven reviewed production parts, 1920×1080 at 60fps, English visible text. Earlier films remain preserved; the export-folder reorganization is separate from this animation.

## Actual playback verification

- Actor poses: 37,800. Final hand contacts: 16,581.
- Maximum contact error: 0.04995 scene units.
- Maximum bone-length error: 1.81e-13.
- Maximum joint movement per frame: 24.77 scene units.
- Foot-stroke floor penetration: 0.
- Actor/actor curved silhouette penetration: 0.
- Actor/overhead-platform penetration: 0.
- Free-parcel/actor penetration: 0.
- Parcel/parcel conservative-bound penetration: 0.
- Held-parcel/head penetration: 0.
- Maximum projected rounded-box/support penetration: 0.226 scene units.
- Camera framing overflow: 0.
- At least two actors exceed the movement threshold in 84.5% of frames. This is an activity measurement, not a quality score.

Lower-level hops respect the actual overhead clearance. Platform artwork stays inside the same slab bounds used by physics. Rotated parcels rest using their drawn rounded-box projection, avoiding the gap a circular support approximation would produce. Conservative circles are retained for parcel/actor and parcel/parcel separation. Curved character outlines use sampled conservative capsules. These checks complement temporal and decoded-image review; they do not establish exact handling of every possible occlusion.

## Sound

Four new ElevenLabs effects: machine startup, cardboard parcel impact, safety shutter and pneumatic printer. Scheduled sounds: 455 events and 787 footsteps. Provider usage: {"ElevenLabs": 1242}. Music and sustained ambience are procedural.

Measured AAC: -17.85 LUFS integrated, -1.34 dBTP, 3.0 LU range. No human listening assessment is claimed.

## Delivery

Only the complete, validated film belongs in Vídeos/Dont-Press-Play/. Production parts stay local in production/parts/ and are ignored by Git. The final film is assembled and fully decoded outside Vídeos, then moved into place. Frame counts, audio, full decoding and SHA-256 are recorded in qa/export-validation.json.
