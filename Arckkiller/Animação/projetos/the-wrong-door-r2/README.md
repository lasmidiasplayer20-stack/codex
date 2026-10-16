# The Wrong Door — R2

A body-acting revision of the 118.75-second reference adaptation. Cyan keeps the original head, model proportions, FK controller and curved drawing functions. There are no facial features. The first film remains in its original delivery folder.

Walks and runs use authored 120 Hz targets, alternate planted support and lifted swing feet, and final fixed-length IK. Urgency, hope, impact and frustration are carried by posture, neck, hands and balance. Source event times and the existing soundtrack remain the timing reference; the movements are an adaptation, not a pixel-perfect trace. No detected reference limb endpoints or source images drive the new renderer.

The original vector set has a fixed floor, projected hinged/sliding doors, readable symbols, a path-following pencil and eraser, a tiered fountain and a rock waterfall. Water and the smaller rear passerby use a background depth plane. There is no motion-blur effect. The H.264 target is 5.6 Mbps, increased from R1's 3.2 Mbps.

Run `npm install`, `npm test`, `node review.mjs`, `node review-temporal.mjs` and `node check-player.mjs`. Chromium, Playwright 1.64.0 and FFmpeg render with `node render-parts.mjs`, then `python3 assemble.py`. Six internal sections stay in ignored `production/parts/`. Only the complete **1920×1080, 60 fps** movie goes to `../../Vídeos/The-Wrong-Door-R2/The-Wrong-Door-R2-1080p60.mp4`. `ANIMATION_VIDEO_DIR` overrides the destination.

Fresh reports live in `qa/`. `rig-preservation.json` pins the three original file hashes. The user-authorized source audio and quiet original Python score remain unchanged from R1. No new API request or human listening is claimed.
