# Animation vs. Physics — complete revision audit

## Scope and evidence

Source branch: `animation-vs-physics-2026-10-15-758066`, verified remote HEAD `1c6dce3d232179e41629414db70513dc69205853`.

All six versions were inspected: the original and V2–V6. This audit compares their source architecture, relevant movement and contact tests, existing validation reports, actual MP4 metadata, and **189 freshly decoded reference frames**. There are 96 frames in dense temporal samples and 93 take/chapter overview frames. The twelve sheets in this folder were visually inspected. This is sampled visual analysis, not uninterrupted manual viewing of every frame of all six films. Historical test results below were read from the committed reports and test implementations; the six historical suites were not rerun for this audit.

`source-comparison.json` records source paths, module inventories, frame counts, and full source hashes. The paired `*-overview.jpg` and `*-motion.jpg` sheets correspond to the six rows below, in order.

| Version | Actual export | Useful contribution | Limits for the requested new film |
|---|---|---|---|
| Original | 125s, 24fps, 3,000 frames | Fixed-step physical integration, gravity, mass, impulses, friction, restitution, plane collision, actor–box contact, deterministic director | One character; distant framing and a deliberately sparse visual style |
| V2 Viva | 125s, 24fps, 3,000 frames | Expressive pose cues, foot release at stops, contact/reaction inserts, deeper environment, event-driven visual responses | Retains the original physics but not the later V3 articulation corrections; numerous editorial cuts |
| V3 Articulation corrections | 125s, 60fps, 7,500 frames | Facing-aware elbows/knees, opposing hand/foot swing, extension through turns, secondary action, closer camera, dedicated articulation tests | Single-character direction and timestamps belong to the older story and must be adapted |
| V4 Trio | 150s, 60fps, 9,000 frames | Three-character staging, mechanism library, polar-arc gestures, explicit hand contacts, foot planting, shot bounds and clearance tests | Six explicit station changes; long low-activity periods; custom directed paths rather than the earlier general physics loop |
| V5 Comedy | 78s, 60fps, 4,680 frames | Dense original gag choreography, staggered reactions, interacting mechanisms and overlapping action | A time map compresses each 25s base chapter into 8.6s, followed by 4.4s of new gag choreography; the time map does not meet the current request for natural-time action |
| V6 Continuous story | 150s, 60fps, 9,000 frames | Persistent room and props, causal events, gait by distance, explicit cart/orb/brake/rescue contacts, continuous chapter boundaries | Still uses an authored trajectory/IK layer rather than restoring the original physics engine; continuity alone does not ensure sufficient pace or simultaneous activity |

## Important source-level findings

### The latest version is not a superset of all previous systems

SHA-256 comparison confirms that `physics.js` and `collisions.js` are identical in the original, V2 and V3. The trio implementations V4–V6 do not contain those active solver modules. They produce poses and object states through their own directors, curves and IK. Those choices can be valid for authored animation, but inheriting V6 does not automatically inherit the older physical collision behavior.

The model profile, FK controller and legacy drawing functions are byte-identical across all six versions. The V3 rig adapter is also byte-identical in V4, V5 and V6, but later trio modules implement substantial pose solving themselves and reuse the adapter chiefly for shared lengths and record generation. A preserved controller therefore does not establish that all later movement, contacts and orientation behavior remain equivalent.

### The V3 fixes directly address the reported joint problems

Inspect `revisions/v3-60fps-articulacoes-corrigidas/src/performance.js`, `src/acting-v3.js`, `src/rig-adapter.js` and `tests/limbs-v3.mjs` in the reference branch. The implementation coordinates elbow and knee bend direction with facing, keeps hands opposed to corresponding feet, preserves planted support, and briefly extends limbs through genuine turns. The committed articulation report checks 60,004 limb cases, records no reversed limbs under its convention and measures a maximum local turn-joint change of about 5.35 units per 1/120s step.

The original solver test also checks stroke-aware floor penetration, exact active contacts, momentum exchange, damped bounce order and swimming without unphysical propulsion. Those checks cover behavior that bone-length and finite-number tests alone cannot establish.

### V5 has reusable action, but its time remapping must stay out

`src/tempo-v5.js` explicitly maps base chapter time `[0,25]` into `[0,8.6]`. Its six newly authored 4.4s gags are a separate contribution. Reuse the gag construction and concurrent reactions in native story time; do not apply `oldAt`, `forward` or the compression map to the 210s film.

The committed comparison measures V4 at 34.22 mean joint units/s and V5 at 114.54, with quiet intervals dropping from 6.13s to 0.83s under that comparison's threshold. These are historical diagnostics, not a blanket recommendation to make every gesture faster.

## Findings in the delivered One More Take

A fresh 60Hz diagnostic covered all 37,800 actor poses. See `current-film-diagnostics.json` and `audit-current-motion.mjs`.

- Feet, including stroke thickness, reach approximately **16.39 world units below the rendered floor**. The original/V3 committed solver report is below one unit under its plane checks. The current film needs an actual final support check.
- At least two actors exceed a mean movement threshold of 40 world units/s in only **16.99%** of the film. The longest interval with no actor above that threshold is about **4s**. Breathing and decorative motion do not provide the requested concurrent action.
- The new performance layer chooses opposite elbow poles by arm index, unlike the V3 facing-aware rule. Its angular smoothing is applied after IK. This can preserve bone lengths while moving a hand or foot away from the contact it was meant to satisfy.
- Characters and cake have independently authored position tracks. There is no general actor–actor or cake–actor collision/occlusion system; the painter order is fixed. A conservative head/cake proximity diagnostic flags many samples, but it is not an exact visible-overlap test.
- Uniform easing between widely spaced keys repeatedly slows both transport and airborne movement. A bounded angular step reduces pops but does not give jumps correct acceleration, make support believable or create convincing action overlap.
- The added faces, neckerchiefs and hollow heads for all three actors diverge from the established cast presentation. V4/V5 use solid heads; V6 deliberately outlines only the hero. Those presentation choices need an explicit consistent decision, not accidental propagation.

These observations explain why the MP4 could decode correctly and pass finite-number/bone-length checks while still looking physically wrong and slow. The earlier validation did not establish the visual and physical quality requested by the user.

## Recommended implementation base

1. Reuse the original/V3 `physics.js` and `collisions.js` for genuine gravity, airborne integration and collision response. Retain explicit cartoon rules only where the story shows the mechanism causing them.
2. Reuse the V3 calibrated rig adapter, facing rules, planted-foot transitions and articulation regression checks. Solve active contacts after secondary acting; do not move locked targets with a later smoothing filter.
3. Adapt the V6 persistent-state and causal-event structure to the undo-button story. A rewind must restore object positions, velocities, ownership and mechanism state together.
4. Reuse V4 mechanisms and contact staging. Reuse V5's separately authored gag ideas and staggered reactions at natural speed, with no time-compression map.
5. Schedule meaningful independent jobs for all three actors. A primary catch can overlap a brake operation and a third character's recovery, with clear visual priority. Keep reactions short while another action develops.
6. Make physical clearance, hand ownership and draw order agree. Validate head/prop and actor/actor intersections, floor support including stroke, contact error and camera bounds.
7. Retain the current requirements: approximately 210s, native 1080p60, color, English visible text, production in internal parts and MP4 delivery under `Arckkiller/Animação/Vídeos/`. Reuse the already generated ElevenLabs assets and resynchronize them to actual revised events.

The audit supplies a concrete reuse map and regression targets. It does not represent a newly rendered or corrected revision of One More Take.
