# Body acting and clean reference adaptation

The user rejected The Wrong Door R1 for dull acting, rough walks/runs, blur, a rectangular waterfall, disconnected pencil/door motion and unclear symbols. R2 addresses these with the original faceless Cyan rig. The original model, FK and drawing functions stay byte-identical.

- Use the reference for event time, direction, intent and audio alignment. Author normal-proportion rig motion instead of copying unstable detected endpoints or short source legs.
- Express urgency through compressed posture and balance, hope through anticipation and extension, frustration through weight and hands, and impact through recoil and recovery. Faces are not the default.
- Preserve a planted foot in world coordinates until lift-off. Give the other foot a visible lift arc. Choose gait cadence from distance and scale; changing stride length halfway through a cycle teleports feet. Keep a gait mode stable through an uninterrupted movement.
- Smooth root/orientation/hand targets before final IK. Use polar hand arcs to avoid crossing the shoulder origin. A knee or elbow pole changes side through an extended limb, not through a bent-limb flip. Do not filter angles after contact solving.
- Feet remain planted during an idle hold. Do not slide them inward to fake clenching. Separate get-up, landing, turning and entry transitions from the gait loop.
- An outlined drawing follows its pencil tip on one shared arc-length path. Fill/material appears after the outline; symbols have enough screen area to read. The eraser physically reaches the handle it removes.
- Treat doorway back wall, opening, moving panel, jamb and threshold as distinct depth layers. Clip intentional entry at the interior plane. Do not randomly cover limbs with a closed panel.
- Shape a fountain's arcs, basin and falling droplets. Give a waterfall rock banks, a shaped stream, a pool, foam and ballistic spray. Avoid a flat moving rectangle. Put rear water/actors on a coherent depth plane and keep Cyan's silhouette distinct from the water color.
- Crisp output requires clean vectors, continuous high-rate targets and an adequate H.264 bitrate. More bitrate cannot fix pose discontinuities.

The new production checks 120 Hz poses, actual FK support positions, planted-foot drift, fixed bone ratios, drawn floor extrema and 60 fps visible joint changes. Review nearby frames and decoded output as well. A passing contact check does not prove artistic quality, perfect reference synchronization or every possible overlap.

Use `project-archive/projetos/the-wrong-door-r2` as the current reference scaffold. Its soundtrack retains the authorized reference mix plus original quiet Python music at source time; no isolated-effects or human-listening claim is made. The historical first attempt remains for comparison.
