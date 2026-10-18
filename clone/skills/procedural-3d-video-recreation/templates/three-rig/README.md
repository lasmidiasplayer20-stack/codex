# Articulated Three.js starting rig

Requires Node.js 22+, Chromium, and FFmpeg/FFprobe. In this directory:

```sh
npm ci
npm run check
npm run dev
```

The local server uses port 3000; set `PORT` to choose another. Its process must be restarted in a new execution session. The demo renders actual 3D at 1920×1080 and exposes `window.renderAt(seconds)` and `window.capture()` for an external Chromium exporter. Space toggles playback. It is a six-second walking demonstration, not a video recreation.

`src/rig.js` contains a two-bone IK solver, fixed segment lengths, rounded body volumes, cartoon shading, instanced parts, and example directed poses. Scale/proportions are specific to the example. Adapt character design, limits, contact targets, and scenes for a new production. Clothing is rigid stylized geometry; collision and cloth simulation are not included.

`npm run check` exercises 2,000 IK cases, 1,210 poses, fixed limb/torso lengths, seated pelvis height, and world-space foot stance. Scene-level collision review and encoded-video validation are separate requirements.

For export, drive `renderAt(frame / fps)` from Playwright or another Chromium automation tool and pipe native canvas frames to FFmpeg. Set the renderer canvas size before capture, wait for required fonts/assets, propagate browser/encoder failures, count frames, and keep the complete audio aligned once during assembly. The parent skill includes a portable FFprobe/FFmpeg validator.

A small operational exporter is included:

```sh
npm run render -- --duration=6 --width=1920 --height=1080 --fps=30 --output=demo.mp4
python ../../scripts/validate_export.py demo.mp4 --duration 6
```

Set `CHROMIUM_PATH` if Chromium is elsewhere. `--audio=/path/to/soundtrack.m4a` retains an authorized compatible track; the default demo is silent. Outputs are not overwritten unless `--overwrite=true` is given. Modify the six-second looping demonstration into a complete shot timeline before producing longer work. The exporter uses a separate local server on port 3012 by default (`--port=NUMBER` overrides it).

Three.js 0.180.0 is pinned in the lockfile and distributed under MIT. Preserve its included license when redistributing dependencies.
