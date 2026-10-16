# References studied and applied

- `Arckkiller/Animação/AGENTS.md`, `README.md`, `docs/ROTEIRO-V6.md`, `RELATORIO.md`: global continuity, visible causes and consequences, acting in native time, preserved FK and drawing.
- `src/story-v6.js`: continuous position curves, direction changes, persistent props, ballistic trajectories.
- `src/rig-v6.js`: hand motion in arcs, distance-driven alternating supports, anticipation, effort, explicit contacts and recovery.
- `src/model.js`, `rig-adapter.js`, `legacy-renderer.js`, `vendor/rig-controller.js`: preserved local copies of the actual model, FK and drawing code, rather than a newly invented character style.
- `exports/rig-and-continuity-v6.json`: fixed bones, contact errors, chapter-boundary continuity.
- `exports/visual-review-v6.json`: encoded temporal-sequence review and the limits of frame sampling.
- `exports/story-and-events-v6.json`, `audio-generation-v6.json`, `scripts/score-v6.py`: action-timed foley, footsteps, spatial sound and one continuous master.
- `OanimadordeIA/Animação/REFINO-R2.md` through `REFINO-R5.md`, head/torso regression and geometry JSON reports: intact torso and head silhouette, planted supports, real contact points, anticipation and persistent corrections.

The R2 uses a single 210-second clock and continuous world positions. Seven render sections do not reset the story. The new performance module changes choreography and object bindings, preserving the actual bone profile and reconstruction path. No facial features, goggles, costumes or unrelated character models were added.

## Exact GitHub revision

Inspected `videos/animation-vs-physics/revisions/v6-historia-continua-150s-1080p60/` at commit `1c6dce3d232179e41629414db70513dc69205853` on `animation-vs-physics-2026-10-15-758066`. The source, directions and selected JSON reports were compared byte for byte with the local Arckkiller reference. See `qa/exact-github-reference.json`.
