# The Forbidden Button — R2

A complete reworking of the first attempt, based on the actual Animation vs. Physics V6 project in this repository. 210 seconds, three original stick-figure designs, one persistent laboratory, seven internal render parts. All visible text is English.

## What is reused

The model, scale, bone lengths, FK controller, rig adapter and character drawing functions are copied byte for byte from `Arckkiller/Animação`. The performance solver is adapted from `rig-v6.js`: distance-driven gait, planted supports, angular gesture blending, weight shifts, anticipation, turning, effort, and explicit hand contacts. The laboratory drawing and its physical props are adapted from `world-v6.js`. Previous projects remain untouched.

The new story uses absolute time throughout. Pressing a forbidden gravity control lifts cargo and an impatient friend. A rope rescue lifts the helpers too. The emergency brake brings them down, but a second wrong control destabilizes the bridge. A chain of helping hands rescues the cyan character; coordinated controls finally restore the laboratory. The friends stop one last attempt to touch the button.

This is authored animation with selected ballistic trajectories and fixed-length IK/FK, rather than a general rigid-body simulator. The field is an explicit fictional rule.

## Reproduction

From the parent `Animação` directory, with Node 22+, its locked Playwright dependency, `/usr/bin/chromium`, FFmpeg, Python and NumPy:

```sh
node Originais/O-botao-proibido-r2/render.mjs --qa true --width 1280 --output /tmp/button-r2-qa
# Copy the resulting qa.json and story.json into this project's qa/ directory.
python3 Originais/O-botao-proibido-r2/score.py
# Internal parts, numbered 0 through 6:
node Originais/O-botao-proibido-r2/render.mjs --part 0 --output /tmp/button-r2-parts
python3 Originais/O-botao-proibido-r2/assemble.py --parts /tmp/button-r2-parts
```

Run `node Originais/O-botao-proibido-r2/serve.mjs` from `Animação` to reuse the reference HTTP server with byte-range seeking. Then open `Originais/O-botao-proibido-r2/index.html` for the code player, or `Originais/O-botao-proibido-r2/video.html` for the encoded preview. Run `node Originais/O-botao-proibido-r2/check-player.mjs` after assembly to verify both players, all chapter seeks and HTTP 206 media requests. Rendering uses absolute `frame/60`; performance is sampled at 120Hz. The final movie concatenates video only, then applies one continuous 210-second stereo AAC master.

All delivered MP4 files belong in `../../Vídeos/`. Internal render intermediates stay outside the checkout. Preserve the first attempt as an earlier version.

## ElevenLabs sound integration

The final mix uses verified ElevenLabs Text to Sound v2 assets from `Arckkiller/Animação/projetos/botao-desfazer/audio/elevenlabs`, added by a repository update during this task. Seventeen relevant assets were copied with their prompts, provider metadata, SHA256 and source commit; the event sheet records which files actually play. Footsteps, buttons, impacts, landings, rope, electrical effects and success chimes are synchronized to this story's own timestamps. Music, room tone, field hum and short count-in tones remain synthesized.

Fresh API generation from this execution still returned HTTPS proxy 403 before authentication. No successful new API call or new generation in this task is claimed. Reusing the already generated library resolves the sound requirement without exposing or republishing the key.

`audio/elevenlabs/manifest.json` records provenance; `audio/generation.json` records the final event sources. The final movie is `../../Vídeos/The-Forbidden-Button-R2-1080p60.mp4`. The earlier `-preview` file is retained as the prior provisional mix. `video.html` and the player tests point to the final film.
