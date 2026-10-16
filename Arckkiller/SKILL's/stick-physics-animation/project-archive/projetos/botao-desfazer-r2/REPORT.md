# Revision 2 — production checks

The film is produced as seven native 30-second parts, assembled without forward-time speed changes. The explicit rewind effects restore recorded scene history.

## Playback and constraints

- Actor poses checked: 37,800.
- Hand targets checked: 18,046.
- Maximum hand-target error: 0.01485 scene units.
- Maximum bone-length error: 2.56e-13.
- Maximum foot-stroke penetration below the floor: 0.
- Minimum pairwise head clearance: 48.35 scene units.
- Minimum conservative cake/head clearance: 10.90 scene units.
- Maximum rewind-boundary discontinuity: 0.00126 scene units.
- Cake flight endpoint error: 0.
- Longest whole-cast quiet interval under the documented movement threshold: 2.57 seconds; the cake and production line can still move during an actor-quiet interval.

These checks measure the rendered FK playback. They complement temporal frame review, rather than claiming universal collision handling.

## Scene review

Reviewed launch, landing, reverse, tray placement and curtain-lift sequences. Removed the unused first-version workbench and the plant on the walking route. The birthday table uses the rear floor line; the trolley and actors share the foreground support line. A bounded camera lag and smooth lens changes make travel visible while preserving the action's speed.

The final camera check covered 226,800 projected actor landmarks, with all actors and the cake remaining inside the frame throughout the film.

The original V6 test suite and preservation checks passed. Original FK, drawing and model files are unchanged; V3 math and body integration are reused byte for byte.

## Audio and exports

The new soundtrack contains 73 sound events and 155 scheduled footsteps using the existing ElevenLabs assets, plus original procedural music and ambience. The measured AAC master is -18.25 LUFS integrated, 4.40 LU loudness range and -1.21 dBTP. No human listening assessment is claimed.

The delivered export report records full decoding, exact frame counts, resolution, audio and SHA-256 hashes for the final film and all seven parts. See `qa/export-validation.json`.
