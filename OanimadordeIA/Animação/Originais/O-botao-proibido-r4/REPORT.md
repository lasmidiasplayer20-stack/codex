# R4 production report — The Forbidden Button

## What changed

R3 incorrectly retained the V6 delivery/core screenplay. R4 retains The Forbidden Button screenplay and uses the reference's character model, bone dimensions, FK, adapter and drawing. These five files match source commit `1c6dce3d232179e41629414db70513dc69205853` byte for byte; `qa/character-provenance.json` records the hashes. The original V6 performance source is retained in `preserved/`.

New story choreography covers the forbidden press, ceiling landing and upside-down walking, rope throw and winch release, emergency brake, wrong reset, bridge collapse, rescue chain, bank climb, synchronized controls and final blocked temptation. There is no core-delivery task or seesaw launch. The user confirmed 150 seconds. All visible text is English, and the set uses warm cream, coral, teal, blue and gold.

The performance reuses V6 pose vocabulary, angular gesture blending, distance-driven planted gait, 120Hz pose records and FK playback. Explicit support weights replace the old pelvis-height heuristic. Ceiling feet settle rather than snapping when a walk stops; contact transitions follow arcs; low poses keep knees above the floor; stage paths separate character heads. Shared rescue/wrist contact points are individually reachable. Props use persistent fixed-step gravity, drag, restitution and floor/ceiling collision. Character paths remain authored IK/FK choreography, not a general rigid-body collision simulation.

## Validation

- 27,000 delivered-frame character poses checked; 37,685 explicit hand/foot contacts.
- Maximum bone error: 2.2e-13; maximum contact error: 2.54e-13; leg-target reach error: 0.
- Maximum joint step: 23.393 world units per frame; maximum root step: 3.189.
- Minimum sampled head-center separation: 44.768, greater than the unchanged combined head radius.
- Maximum chapter-boundary epsilon displacement: 0.00768; longest whole-cast quiet interval: 2.233s.
- No non-finite poses, unreachable full contacts, causal ordering errors or sampled actor-point framing failures.
- All six internal parts have exactly 1500 frames / 25 seconds / 1920×1080 / 60fps. They remain outside the checkout. The assembly checks every source hash before joining them.
- Full movie: 9000 frames, 150.0 seconds, H.264 yuv420p at 1920×1080 / 60fps, AAC stereo 48kHz; complete error-checked FFmpeg decode passed.
- File size: 34,247,537 bytes. SHA256: `17e9c39bbc7eac31213c654630f66ab035d6ac99861ff4cd2a8be9e5c8f8007b`.
- Both players passed loading/Play/Pause/seeking checks as applicable. The exported player loaded the correct R4 movie and sought to all six chapter starts; HTTP 206 returned the requested 1024-byte range. No page errors.

The visual review examined 36 story overview frames, 72 decoded frames in twelve temporal sequences, and ten decoded frames around five chapter boundaries. The decoded sheets and the combined boundary pairs were inspected. They cover the ducking pass, press, inverted landing, ceiling step/stop, rope catch, anchor release, emergency control, bridge failure, hanging catch, bank climb, center vault and final wrist stop. The original curved drawing produces broad limb silhouettes in deep crouches, and the coordinated holds deliberately retain planted contacts while the field and free limbs move. Geometry checks and sampled inspection do not prove subjective humor or perfect anatomy in every frame. No full real-time playback or human listening is claimed.

## Sound

All 144 timed action/footstep/prop-impact events use authentic reused ElevenLabs library effects; three additional layered gravity sweeps give 147 placements using 11 distinct assets. They are synchronized to this screenplay's own absolute timestamps. Music and room/field tone are procedural. Asset hashes match the provider/model/prompt manifest. No new API generation is claimed. Measured continuous AAC master: -16.78 LUFS, -1.64 dBTP, 2.8 LU loudness range. Human auditory review was not performed.

## Delivery layout

Only completed full-film MP4 exports remain in `OanimadordeIA/Animação/Vídeos`. Earlier internal part exports, the provisional R2 preview, validation JSON and the folder README were moved to `Originais/Arquivo-de-exportacoes` without deleting their contents. This revision's reports, screenshots and sound files stay in its source folder. The new full film is `The-Forbidden-Button-R4-1080p60.mp4`. Previous complete films remain available. A credential scan of new source/output files found no copy of the supplied API key.
