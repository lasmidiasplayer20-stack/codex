# R3 urgency revision

R2 was accepted as a visual base but Cyan still looked relaxed when walking and running. R3 keeps that rig/set and authors urgency through shorter frequent steps, forward lean, raised arm drive and stronger travel. The source audio clock and full runtime stay at native speed.

## Same-time comparison with R2

- Opening 0.5–5.3 s: authored footfalls 6 → 17; mean forward torso lean 1.7° → 17.3°. Root travel and scene cue times are unchanged.
- Corridor 72.5–84.1 s: footfalls 29 → 45; mean travel 338.1 → 422.9 pixels/s; lean 4.1° → 21.1°. The authored 72–84.4-second route is 25% longer.
- Quick steps have their own cadence. Every stance foot is locked; its next landing is predicted and fixed at lift-off. Startup, stop, jump recovery, turns and door approach remain separate transitions before final IK.
- The camera trails slightly. The rear passerby exits beyond the changed frame edge, and the final lift approach follows the opening cue.

## Fresh validation

11,581 visible 120 Hz poses passed finite-coordinate and fixed-proportion checks. 5,487 stance checks measured 0-pixel foot slide, actual FK contact residual below 0.001 pixels, 0 unreachable leg targets and no drawn floor penetration. The original model, controller and actor renderer match their pinned hashes.

Largest visible per-frame joint displacement: 69.02 pixels; during gait: 52.84. Offscreen cuts are excluded. All 12 deterministic seek comparisons passed. Review includes 66 full canvas frames, 23 neighboring-frame groups and 38 decoded final-film samples. The player passed seek/play/pause with no browser errors. Eight pencil/eraser jobs retain their shared prop paths.

All six internal sections and the complete film fully decoded: 1920×1080, 60 fps, 7,125 frames, 118.75 s, H.264/AAC stereo at 48 kHz. File size 38,619,040 bytes; SHA-256 `c38c45cc8ab2f82985f6a7aff90db9750105bc31e96978e364e87148254fc2cd`. Section 4 was rendered again after the final rear-exit adjustment; that change affects only 68.5–73.2 s.

## Delivery and limits

Only the complete MP4 is in `Vídeos/The-Wrong-Door-R3/`. Earlier complete versions are preserved. Intermediate renders remain in ignored `production/parts/`.

This is authored body acting around reference events, not literal source-joint tracing or a general dynamic simulation. Contacts and cadence measurements support the change but do not prove artistic quality. Source soundtrack and original quiet Python music are byte-identical to R2; no separated Foley, one-to-one isolated footstep alignment, new API generation or human listening is claimed. Rig proportions and the faceless profile are preserved.
