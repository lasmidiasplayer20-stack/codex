# The Wrong Door — R3: urgency

R2 remains the visual base. This revision makes Cyan hurry through posture, shorter frequent steps and stronger travel at native time. The torso leans into movement, arms drive higher, and the corridor covers 25% more distance over the same 72–84.4-second interval. Walking cadence is independent of root speed, so small urgent steps remain active as Cyan advances slowly toward a stop.

Each stance foot stays locked in world coordinates. At lift-off, the next landing is predicted and fixed; the swing reaches that point before the next plant. Startup/stop targets blend before final IK. Rig proportions, the original model/FK/actor drawing functions, the accepted doors/pencil/water designs and the faceless head remain intact. The reference soundtrack and original quiet Python music are byte-identical to R2, with no change in playback speed or duration.

Run `npm install`, `npm test`, `node review.mjs`, `node review-temporal.mjs` and `node check-player.mjs`. Render with `node render-parts.mjs`, then `python3 assemble.py`. Chromium, Playwright 1.64.0 and FFmpeg are required. Six internal parts stay in ignored `production/parts/`; only the complete **1920×1080, 60 fps, 118.75-second** film is delivered to `../../Vídeos/The-Wrong-Door-R3/`. Set `ANIMATION_VIDEO_DIR` to override the destination.

See `qa/urgency-comparison.json`, `qa/urgency-before-after.jpg`, movement strips and decoded output for the actual R2/R3 comparison. `rig-preservation.json` pins the unchanged original files. This is directed body acting around reference beats, not a frame-for-frame source trace or a general dynamic world simulation. No new external audio generation or human listening is claimed.
