# Validation and known limits

Run the checks on the new authored scene. Do not present archived reports as fresh validation. Adapt fixed-duration loops and factory assumptions before using them for another story.

1. Check actual FK playback for finite positions, fixed bone lengths, facing-aware poles, contact residuals, floor penetration and per-frame joint movement. Final contact solving must survive all pose processing.
2. Check real drawn curved actor silhouettes, held-object/head clearance, dynamic prop/actor and prop/prop separation, rotated prop support, overhead platform clearance and camera bounds. Respect intended grips; avoid treating intentional finger contact as a collision defect.
3. Check all production boundaries immediately before/after the boundary: pose, prop ownership, world mode, camera, audio and timestamps. Repeated seeks must render identical images.
4. Inspect nearby frames around high-risk motion. Review depth planes and drawing decorations as well as collider measurements. At least two actors should often be active when the brief asks for concurrency; the example's numeric threshold is scene-specific, not a universal quality score.
5. Generate current audio events, inspect peak/loudness results, verify cue timing and check for abrupt cuts. Listen when audio playback is available and report the scope honestly.
6. Verify the assembled movie's duration, exact frame count, resolution, frame rate, H.264 video, AAC stereo audio and full decode. Review decoded frames, not only source canvas images. Confirm complete exports alone enter `Vídeos`.

The latest archived example tested 37,800 actor poses over 210 seconds, final contact error below 0.05 pixels, zero measured floor/actor/overhead penetration and native-time concurrent motion. These are historical measurements of that specific scene, using conservative approximations. They do not prove every visual occlusion correct or validate a new choreography.

Package integrity is separate: `scripts/verify-package.py` checks every listed file and rejects unlisted files. ZIP SHA-256 is recorded alongside the archive. No installed dependencies, browser binaries, credentials, raw video streams, uncompressed working audio or duplicate completed movies are required inside the archive.
