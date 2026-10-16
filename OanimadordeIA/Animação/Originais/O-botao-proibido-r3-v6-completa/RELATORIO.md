# R3 — complete V6 project, scenery adaptation

The earlier R2 rewrote the choreography. This revision instead copies every file of the exact requested V6 and retains its original performance. The source commit is `1c6dce3d232179e41629414db70513dc69205853`; `source-copy-manifest.json` inventories all 90 files before edits. Original exports and review reports remain historical reference assets. Original versions of edited source files are backed up in `preserved/source-v6-originals/`.

## Scope and instructions

The source V6 AGENTS.md requires the original FK/profile/drawing, persistent character positions, natural 150-second timing, three characters, six 25-second sections, English visible text, tests, temporal/contact inspection and MP4 validation. Its parent instructions also forbid replacing the existing characters. Nothing in these instructions prevents reuse of the entire project. Earlier parent timings (125 seconds / 24fps) belong to older revisions; V6 is 150 seconds / 60fps. The current user's destination overrides the historical export directory: every new MP4 goes to `OanimadordeIA/Animação/Vídeos`.

`src/story-v6.js`, `src/rig-v6.js`, `src/model.js`, `src/rig-adapter.js`, `src/legacy-renderer.js`, `src/math.js` and `vendor/rig-controller.js` match the linked project byte for byte. This preserves object states, ballistic trajectories, FK, bones, poses, gait, contacts, camera and chronology, rather than importing a few components and creating another character system.

The scenery is now a warm sunset observatory with purple/orange sky, teal equipment, a red portable button, a gravity field and a reset socket. All original contact geometry stays fixed. The film remains the V6 causal story with new scenery and labels; it is not a completely new gravity-button screenplay. It lasts 150 seconds, as explicitly confirmed by the user for this revision. No slow-down, repetition or padding is used.

## Checks

The original npm test passes: 27,000 poses; 11,231 contacts; maximum bone error 1.99e-13; maximum contact error 2.55e-13; maximum joint movement 20.77 units per frame; maximum chapter-boundary displacement 0.0103; longest whole-cast quiet interval 1.34 seconds. All original backup hashes match. Geometry checks establish continuity, not humor or subjective motion quality.

Twelve rendered samples were inspected at 2, 12, 31.5, 43, 62.8, 78, 84, 88, 116.6, 127, 130 and 146 seconds. They show the retained original characters interacting with unchanged objects against the new scenery. `qa/scenery-review.jpg` records these samples. Export decoding and temporal review results are recorded separately after assembly. No human listening or full real-time viewing is claimed.

## Sound

The soundtrack is rebuilt from the original V6 event map: 156 timed events, 148 assigned authentic ElevenLabs effects, plus one additional gravity sweep (149 placements total), using 12 distinct library assets. Music and remaining tones are procedural. `audio/elevenlabs/manifest.json` preserves provider/model provenance and SHA256s; `audio/generation.json` lists event assignments. Existing repository assets are reused; no successful new ElevenLabs API generation is claimed.

## Output

Full film: `../../Vídeos/The-Forbidden-Button-R3-V6-1080p60.mp4`.
Six production parts: `../../Vídeos/R3-V6-parts/`.
Previous deliveries remain available.

## Completed export checks

All seven new MP4 files passed the original export validator and complete FFmpeg error-checked decoding. The full film has 9000 frames, 1920×1080, 60fps, exactly 150 seconds, H.264 yuv420p and AAC stereo at 48kHz; size 41,416,472 bytes; SHA256 `145abe93f1f36eac2f5426243df5213742684d0de779c9154f8378926e899bbe`. Six parts each have 1500 frames and 25 seconds. One continuous mastered soundtrack is used for the full movie.

The decoded movie review inspected 48 frames across eight temporal sequences and ten frames around five chapter boundaries (58 decoded samples total). Both temporal sheets and the boundary-pair montage were inspected. Chapter boundaries preserve positions; the original close overlaps during the floating interaction and final button-blocking gesture remain, since the choreography is deliberately unchanged. See `qa/encoded-review.json` and the review images. This sampled inspection does not constitute full real-time viewing or human audio listening.

The code player passed Play/Pause/seek checks. The exported player loaded the correct R3 film, reported 150 seconds and 1920×1080, and sought to all six chapter starts. CSS is served with the correct MIME type, and the single-file delivery alias returned HTTP 206 with the requested 1024-byte range. No page errors were recorded. `qa/player.json` records these checks.

All 90 original files remain present: 83 unchanged and seven edited files backed up byte for byte. The seven character/story/performance core modules remain unchanged. All 17 copied audio-asset hashes match their provider manifest. A scan of the new source and delivery files found no copies of the supplied API credential.
