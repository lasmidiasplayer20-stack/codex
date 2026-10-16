# The Wrong Door

Reference-guided adaptation of the supplied 1:58.75 clip with the preserved Cyan character, original clean studio/theatre artwork and a new Python-composed score. Delivery: 1920×1080, 60 fps, 7,125 frames. Six internal production sections: five 20-second sections and an 18.75-second final section. Playback stays at native speed.

## Creative scope

The gag order, source-time actor trajectories, measured facial expressions and the original soundtrack follow the supplied reference. Our character retains its original circular head and exact body/bone proportions. Floor-impact, sitting and grip geometry are adapted to those proportions; the environment and props are newly drawn. Secondary actors retain the same programmed anatomy with authored gait following measured head tracks. This is a timed adaptation, not a claim of pixel-perfect replication or perfect automatic pose capture.

The source clip is a Pencilmation animation, as identified by its visible original watermark. That watermark is not reproduced in the new scene. The reference video remains outside the repository; extracted numeric measurements and visual review images document the adaptation. The reference soundtrack, including any existing music, is reused intact in source time. New quiet music is added underneath; no audio source separation or human listening assessment is claimed.

## Production

Use Node 24, Chromium, FFmpeg/FFprobe and Python 3.12 with the pinned requirements. Install JavaScript dependencies with `npm install` and Python dependencies in a virtual environment. No client computer installation is needed.

```sh
python scripts/capture-reference.py /path/to/reference.mp4
npm test
node review.mjs
node review-temporal.mjs
python score.py
node check-player.mjs
node render-parts.mjs
python assemble.py
python review-decoded.py
```

The numeric capture pipeline is specific to this clip's colored line art. For another reference, recalibrate the palette, actor visibility intervals, prop detectors, retarget constraints and scene timeline. `src/visibility.js` adds gap visibility handling without modifying the preserved FK file. New scene logic remains outside the original model and drawing code.

The complete film belongs in `../../Vídeos/The-Wrong-Door/`. Internal MP4 sections, test encodes and raw streams remain local in ignored `production/`. QA and contact sheets stay in `qa/`. Preserve all earlier films and URLs.
