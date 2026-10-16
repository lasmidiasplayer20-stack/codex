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

## Sound status

ElevenLabs was retried with the authorized attachment, including after an additional network grant. The environment's HTTPS proxy returned 403 before authentication. No ElevenLabs sound was generated and the key was not validated by the service. No credential is stored in this project.

The current internal master is provisional: original synthesized music and procedural foley derived from the V6 scoring pipeline, with new action and footstep timestamps. The sound stage is unfinished until ElevenLabs access works. The audio generator can consume generated ElevenLabs assets from the previous project's audio directory, and the movie can be remuxed without rendering its frames again.

The complete image revision must not be represented as a finished ElevenLabs soundtrack. See the validation and sound status in the output folder.
