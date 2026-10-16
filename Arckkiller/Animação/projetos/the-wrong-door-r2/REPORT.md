# R2 delivery report

The user rejected the first film's noisy motion, faces and rough props. This revision authors body acting and clean planted gait around the reference event/audio timeline. It replaces the stage set, waterfall/fountain, pencil and eraser, door animation and symbols. The original model, FK and actor drawing code remain byte-identical. No facial features, source video imagery or motion blur are rendered.

## Current evidence

- 11,581 visible 120 Hz rig poses checked; bone-ratio error below 1e-6.
- 5,655 stance checks: measured planted-foot drift 0 pixels, actual FK contact residual below 0.001 pixels, unreachable leg targets 0 pixels.
- Exact drawn curve extrema: no measured floor penetration. Falling-body support is resolved before FK recording; normal walking has no post-FK global correction.
- At 60 fps, largest visible joint displacement 59.03 pixels/frame, and 54.85 during gait. Intentional offscreen exits/re-entry are excluded. This measures continuity, not a universal artistic quality threshold.
- 66 full canvas samples, 23 temporal groups of four neighboring frames, 12 deterministic seek comparisons and 38 decoded final-film samples reviewed. The source player passed seek/play/pause with no browser errors.
- Eight pencil/eraser jobs share prop paths and show zero measured tip/path gap.
- All six intermediate sections and the complete film fully decoded. Output: 1920×1080, 60 fps, 7,125 frames, 118.75 seconds, H.264 and AAC stereo at 48 kHz. Complete file 39,063,813 bytes; SHA-256 `100d842c7cdeb63808ff00f0fb17a4b5f32180b62ef44f8999b42e95c769c036`.

## Scope and limits

The rig performance is an authored adaptation of the reference's action and emotional beats. It is not a literal trace of each source joint, pixel-perfect choreography or a general dynamic world simulation. Water and a smaller rear passerby intentionally occupy a rear depth plane. Source sound effects and voices remain in the original complete soundtrack, with the previously composed quiet Python music underneath; they are not separated stems. Audio files are byte-identical to R1. No new ElevenLabs request or human listening is claimed.

Only the complete final MP4 is delivered in `Vídeos/The-Wrong-Door-R2/`; intermediate parts remain in ignored `production/parts/`. The earlier film and its URL are preserved. The two reusable skills now default to faceless body acting, and the reference initializer uses R2 rather than the rejected tracing attempt.
