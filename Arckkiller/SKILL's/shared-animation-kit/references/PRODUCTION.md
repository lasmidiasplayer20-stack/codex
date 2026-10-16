# Production guide

## Working layout

`project-archive/` is the original Arckkiller animation source tree without completed MP4s or temporary raw renders. It retains the root V6 implementation, three authored projects, source instructions, audio, tests, reports and visual review sheets. `references/versions/` contains the six inspected Animation vs Physics versions. `references/original-docs/` includes the earlier visual-reference animation workflow and template. `PROVENANCE.json` records exact copied-file hashes. Historical JSON paths can refer to the original machine; they are evidence, not installation configuration.

Create a working copy outside the skill with `scripts/init-project.py`. It keeps the latest story as a runnable example, clears historical QA and updates browser and delivery path handling. Install dependencies in that working copy. Node 24, Python 3.12, FFmpeg/FFprobe, Chromium, the pinned Playwright dependency and `requirements.txt` were used. Example commands:

```sh
python3 scripts/init-project.py /tmp/my-animation --name "My Animation"
cd /tmp/my-animation
npm install
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
npx playwright install chromium
npm test
node review.mjs
.venv/bin/python score.py
node check-player.mjs
node render-parts.mjs
ANIMATION_VIDEO_DIR=/absolute/path/to/Animação/Vídeos/My-Animation .venv/bin/python assemble.py
ANIMATION_VIDEO_DIR=/absolute/path/to/Animação/Vídeos/My-Animation .venv/bin/python review-decoded.py
```

If using a system browser, export `CHROMIUM_PATH=/usr/bin/chromium` instead of downloading Playwright Chromium. Do not put the example's final factory film into a newly named delivery without authoring the new story. The scaffold retains its original output basename until the author updates the assembly script.

## Authoring modules

- `src/story.js`: native-time actor paths, tasks, state changes, explicit contact events, platform routes and jump schedules.
- `src/performance.js`: 120 Hz pose generation, distance-based gait, foot plants, facing transitions, polar hand trajectories, exact final contacts and FK records.
- `src/parcels.js`: held/free ownership, release velocities, V3 integration, repeated prop/actor/platform contacts and collection exits.
- `src/world.js`: scene geometry, depth ordering, original drawing calls, deterministic camera, labels and visual effects. Keep collider and drawing bounds in agreement.
- `score.py`: event-synchronized Foley and music; `audio/elevenlabs/` contains 28 reusable effects and their prompt manifests.
- `render-parts.mjs`: frame-accurate native-rate part rendering using Chromium/WebCodecs and FFmpeg. `assemble.py`: remux, decode and validate, then atomically move the complete movie to delivery.

## Staging and polish

Preserve final rig constraints while improving paths and cadence. Make new mechanical consequences persist; avoid resetting all actors at chapter boundaries. Let one actor prepare the next action while another resolves the previous one. Use anticipation, transfer, follow-through and recovery with unequal timing. Keep the scene active during a pause in an individual actor's motion.

Review forward and backward seeks at the same time to catch hidden state accumulation. Review at least four nearby frames around turns, pickups, releases, impact contacts and shot boundaries. A montage at distant timestamps cannot reveal a one-frame elbow flip.

Sound generators in the archived project are historical implementations reading an external account-marked credential file. No credential is supplied. Reusing included effects needs no API request. If adding effects, prefer a fresh external `ELEVENLABS_API_KEY` binding, keep requests outside versioned content, record prompt/model/duration provenance and synchronize from the current scene's events. Do not claim that generated sound was listened to by a human unless it was.
