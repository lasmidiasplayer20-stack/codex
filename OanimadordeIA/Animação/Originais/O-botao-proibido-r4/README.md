# The Forbidden Button — R4

**150 seconds · 1920×1080 · 60fps · English text · three original V6 characters.** This is the button story, not the V6 delivery story with a different background.

The impatient amber character presses the forbidden gravity control, lands upside down on the ceiling and needs a rope rescue. The winch releases, lifting the helpers too. Cyan reaches the emergency brake; everyone lands. Amber tries the wrong reset, destabilizing the bridge. Hero catches cyan, amber anchors the rescue chain, and the trio pulls cyan onto the bank. Coordinated controls stabilize the field. The friends stop one last attempt to touch the button.

## Character reuse

The model, dimensions, bone lengths, scale, FK controller, rig adapter and original character drawing functions match the linked Animation vs. Physics V6 byte for byte. The original V6 performance source is retained in `preserved/rig-v6-source.js`. Its pose vocabulary, angular gesture blending, distance-driven planted gait, 120Hz recording and FK playback are reused and adapted to this story's actions.

The new performance specifies floor, ceiling, suspended, rope and bank contacts explicitly. It never guesses a floor support from pelvis height. Grip targets remain within fixed-length limbs. Ceiling steps settle smoothly when stopping, turns use authored preparation, wrists follow arcs into grips, and the rescue and final wrist stops have separate reachable contact points. Characters retain their original colors, shapes and hollow/solid heads; no costumes or replacement drawing engine are introduced.

Actor movement is authored choreography with fixed-length IK/FK. Three props use a persistent 120Hz gravity/drag/restitution simulation. This is not a general collision simulator for every character limb.

## Files and reproduction

- Complete movie: `../../Vídeos/The-Forbidden-Button-R4-1080p60.mp4`
- Technical report: `REPORT.md`; source/rig provenance and checks: `qa/`
- Story and camera: `src/story.js`, `src/world.js`
- Character acting/supports: `src/performance.js`; prop physics: `src/physics.js`
- Sound provenance/cues: `audio/elevenlabs/manifest.json`, `audio/generation.json`

Use the existing parent dependencies or run `npm ci` in this folder. Node >=22, Chromium, FFmpeg and Python with NumPy are required. In this cloud workspace Python with NumPy is `/workspace/animation-dev/venv/bin/python`.

```sh
npm test
cp /workspace/animation-production-r4/story.json qa/story.json
/workspace/animation-dev/venv/bin/python score.py
node scripts/render-parts.mjs
node scripts/assemble.mjs
npm run serve
```

The six contiguous 25-second render parts stay in `/workspace/animation-production-r4/parts`, outside the checkout. One continuous mastered AAC track is attached to the assembled video. Only completed full-film MP4 files belong in Vídeos; validation JSON, parts, previews and this README remain outside it.

The soundtrack uses authentic ElevenLabs library assets already generated in the repository, with provider prompts, model and SHA256 provenance. They are retimed to the new story; music is procedural. No new successful API generation is claimed.

GitHub output folder: https://github.com/lasmidiasplayer20-stack/codex/tree/entrega-animacao-20261014-caf07810/OanimadordeIA/Anima%C3%A7%C3%A3o/V%C3%ADdeos
