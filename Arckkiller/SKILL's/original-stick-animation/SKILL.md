---
name: original-stick-animation
description: Create an original colorful stick-character film from a new concept using the preserved character proportions, FK rig, explicit contacts, dynamic props, causal storytelling, sound design and verified 1080p60 export. Use when the movement and story should be authored from scratch rather than recreated from a supplied video.
---

# Original stick animation

Use for original films, new environments, new choreography and narrative revisions. For a supplied movement reference whose timing must be recreated, use `../animation-from-reference/SKILL.md`. Shared rig, physics, sound assets, reference versions and production tools live in `../shared-animation-kit/`; keep the sibling folders together.

## Begin the actual film

Carry out the requested work rather than stopping at ideas. Use the existing checkout; do not create a worktree unless requested. User instructions override defaults. Ask only for information that blocks useful work. Read the shared [production guide](../shared-animation-kit/references/PRODUCTION.md), [reference map](../shared-animation-kit/references/REFERENCE-MAP.md) and [validation guide](../shared-animation-kit/references/VALIDATION.md).

Default to an original colorful environment, English visible text, 1920×1080 at 60 fps and native-time continuous action. Keep the programmed character's profile, bone ratios, original FK and drawing functions. Read existing project versions so their improvements and known defects inform the new scene.

Start a working project with `python3 ../shared-animation-kit/scripts/init-project.py /absolute/path/to/project --template original --name "My Film"`. It copies the validated factory example as a technical scaffold. Write a new premise, environment, causal outline, actor paths and audio arrangement before calling the film original. Renaming the example is not a new creation. V3 supplies the actual positive-mass prop solver and limb direction fixes; V6 supplies persistent causal state, grip/root solving and continuous acting. V4–V6 do not contain an active general physics solver.

## Author story and concurrent choreography

Invent a clear objective, escalating mechanical consequences, character reactions and a payoff. Design mechanisms that alter the persistent world. Make every new problem follow a visible action. Divide the production into internal sections of roughly 20–30 seconds as appropriate; never reset the story at those boundaries.

For an energetic brief, overlap preparation, action and consequence across the cast. One character can recover while another responds and a prop continues moving. Maintain forward time at 1×; do not make the film frantic by multiplying playback speed. Use anticipation, weight transfer, asymmetrical timing, recoil, follow-through, recovery and eye/head direction. Add expressions only when consistent with the user's character design.

Write a depth/layer map and an object ownership map. Put obstacles on a reachable path and give the camera enough room for heads, hands, feet and large props. An environment may be simple, but objects must have coherent support, scale and depth.

## Build motion and physics

Prototype a representative turn, planted step, grip, release and impact before expanding the story. Use bounded curves, unwrapped rotations, facing-aware elbow/knee poles and extension during side changes. Plant feet in world space and drive gait from distance. Blend targets first and solve final IK last. Never smooth angles after final IK.

Distinguish directed character acting from dynamic prop simulation. Give free objects positive masses, 120 Hz fixed substeps, gravity, restitution, friction and repeated contacts. Keep explicit held/free ownership and transfer both position and velocity on release. Do not describe kinematic actors plus dynamic props as a fully simulated humanoid system.

Collide against the visible geometry: sampled quadratic limb curves, conservative heads, platform thickness and the projected support of rotated rounded boxes. Large circles used for box/floor support cause floating. Check undersides over lower routes; reserve larger jumps for routes with sufficient overhead clearance. Keep fascia, ribbons, rails and posts inside the intended collision/depth envelope.

## Polish internally

1. Author the world and action timeline in `src/story.js` or a new director.
2. Solve actor motion and contacts in the performance layer; review nearby frames.
3. Integrate free props and collision events; correct actual overlaps and ownership transitions.
4. Design camera and VFX after contacts work. Keep deterministic seeking and state continuity across parts.
5. Compose original music and synchronize Foley to the current action events. Reuse the included 28 ElevenLabs effects and manifests; use external credentials only for additional API calls already authorized by the user.
6. Render internal parts, inspect decoded sequences, assemble and validate the complete film.

The shared factory example is fixed at 210 seconds in seven parts. If changing duration, update all story/performance/physics sampling, audio duration, render counts, inspection loops, chapter metadata and export assertions together. Do not claim an arbitrary-duration configuration that has not been implemented.

## Evidence and delivery

Run meaningful current-scene checks for finite FK poses, bone ratios, hand/foot errors, floor/overhead penetration, curved silhouettes, prop/actor/prop contacts, camera bounds, native-time concurrency and deterministic seeking. Inspect temporal image sequences at high-risk actions; numerical bounds do not establish every visual overlap correct. Do not present historical reports as new test results.

Verify the complete MP4's exact duration and frame count, resolution, 60 fps, H.264, AAC stereo, complete decode and audio gain/timing. Keep only complete final MP4s inside the user's `Vídeos` folder. Keep intermediate parts, previews, raw streams and QA elsewhere, and preserve previous films and URLs. Publish within the authorized repository/branch. Report the delivered links, actual checks and remaining limitations in plain language. Do not claim human listening unless performed.
