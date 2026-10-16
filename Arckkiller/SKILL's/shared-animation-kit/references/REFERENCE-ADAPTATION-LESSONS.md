# Reference adaptation lessons — The Wrong Door

The supplied clip contains 2,850 frames at 24 fps and lasts 118.75 seconds. The new delivery uses 7,125 frames at 60 fps. Converting frame rate does not change the story clock or soundtrack speed. Source sound begins at zero, and the six internal section boundaries are 0, 20, 40, 60, 80, 100 and 118.75 seconds.

## Preserve the programmed character

The reference has a very large head and short body. Our character has different fixed bone ratios. Preserve the model, circular head, original FK and drawing code; adapt the contact points and scene geometry. It is misleading to call different-proportion retargeting a perfect joint-for-joint copy. Keep action timing and emotional cause/effect, and document the geometric adaptation.

The example records fixed model ratios and a stable scale between real camera changes. Source facial squash does not resize the whole character. Facial lines are normalized vectors drawn inside the programmed head, rather than replacement character silhouettes or source-video pixels.

## Inspect and correct measurements

An eye or mouth hole can fool a circle/ellipse detector. Fit the external head contour, use plausible radius and body-distance bounds, and handle inverted poses separately. A headstand needs a head candidate below the torso, while a side-lying pose needs a candidate beside it. Recalibrate those rules from the actual video rather than transferring this example's times to another film.

Assign limbs in torso coordinates. Repair isolated measurement errors and refine targets before IK; do not smooth recorded joint angles after solving contacts. A genuinely held pose can be authored as a stable hold when automatic endpoints fluctuate. Preserve genuine flips, strong gestures and source-time changes rather than imposing a universal slow-motion limit.

The elevator contains three commuters. Facial fragments initially produced a fourth false actor and changing sizes. The corrected example uses three explicit stable character IDs, fixed proportions, authored gait, irritated expressions and briefcases, following the group's measured departure timing. Automated segmentation is evidence to review, not an authoritative cast list.

## Visibility, support and depth

The preserved FK has a small time tolerance around sparse tracks. A pose from before a long absence can briefly reappear just before the next entrance. A separate visibility adapter rejects those gap frames, with a small numerical tolerance for rounded source timestamps. Preserve the original controller file.

Check the actual quadratic drawing curves and stroke radii against the floor. Testing joint centers alone missed penetration in the adapted crouch and secondary cast. Compute quadratic extrema and head bounds, then apply an explicit whole-pose floor projection outside the preserved controller. Translation preserves all bone ratios. Respect actual airborne phases and document that a support projection can shift a measured screen-space trajectory.

The clean studio and theatre require their own coherent floor, door swing, toilet seat and front/back layers. Reference paper artwork may not share a physical baseline. Adapt support and prop dimensions to the programmed character rather than leaving the character or props floating. Review doors before entry and after exit, including the opening anticipation.

## Audio, review and export

The reference audio is a stereo mix, including any original music. The example retains that complete track and adds quiet new Python music. It does not claim sound isolation or removal of the old music. No human listening assessment is claimed.

Review nearby frames around the leap, ejection, headstand, sit-up, lift crowd, angry gestures, water gags and stage reactions. Decode and inspect the actual final MP4 as well as the source canvas. Numerical rig/support checks do not prove every visual overlap correct or establish perfect fidelity.

Keep five 1,200-frame sections and one 1,125-frame section internal. Concatenate video through an elementary stream so repeated AAC priming cannot shift the picture, then add one continuous soundtrack. Validate all sections and the complete file before moving the complete MP4 into Vídeos. Intermediate renders and QA stay outside that delivery folder.

For future chat uploads, provide portable skill ZIPs below the environment's 32 MiB transfer limit. The complete source archive can remain larger on GitHub, with smaller packages carrying all code, reusable effects, current reference audio and selected visual reviews.
