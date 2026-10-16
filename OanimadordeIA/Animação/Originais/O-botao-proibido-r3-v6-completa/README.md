# The Forbidden Button — R3 / complete V6 scenery adaptation

This revision starts from **all 90 files** in the requested V6 folder at commit `1c6dce3d232179e41629414db70513dc69205853`. `source-copy-manifest.json` records every original file and SHA256 before edits. Historical exports, JSON data, configuration, tests, vendor modules and preserved sources remain present. They are reference material, not new R3 deliveries.

The three original characters, exact drawing, bones, FK, pose records, hand/foot contacts, object trajectories, camera, timing, physics choreography and causal events are unchanged. Only `src/world-v6.js` scenery, object decoration and editorial labels change: a colorful sunset observatory, a red portable forbidden button, a gravity field and a reset socket. This is a scenery adaptation of the V6 story, not a newly choreographed film. It retains its **150 seconds / 9000 frames / 1080p60**, without acceleration, loops or padding. The user explicitly confirmed retaining the V6 duration of 2 minutes 30 seconds.

The soundtrack uses the original V6 event timestamps with authentic ElevenLabs effects reused from the repository and documented in `audio/elevenlabs/manifest.json`. New API generation is not claimed. Music and supplementary tones remain procedural.

## Deliveries

- Full film: `../../Vídeos/The-Forbidden-Button-R3-V6-1080p60.mp4`
- Six internal production parts: `../../Vídeos/R3-V6-parts/`
- Code player: `index.html`; exported-video player: `video.html`
- Review and validation: `RELATORIO.md`, `qa/`

GitHub output folder: https://github.com/lasmidiasplayer20-stack/codex/tree/entrega-animacao-20261014-caf07810/OanimadordeIA/Anima%C3%A7%C3%A3o/V%C3%ADdeos

## Run

Use Node >=20, Chromium, FFmpeg, Python with NumPy. The existing parent project dependencies can be reused; otherwise run `npm ci` here. Run `npm test`, then `python3 score-elevenlabs.py`, then `node scripts/render-adaptation.mjs`. `npm run serve` opens both players and serves the completed film through an explicit single-file alias with byte-range support. Original render and assembly commands are preserved as reference; use the adaptation command for new deliveries in Vídeos.

Original versions of edited V6 files are in `preserved/source-v6-originals/`. `src/story-v6.js`, `src/rig-v6.js`, `src/model.js`, `src/rig-adapter.js`, `src/legacy-renderer.js`, `src/math.js` and `vendor/rig-controller.js` remain byte identical to the linked project. No costumes, faces or replacement character engine have been introduced.
