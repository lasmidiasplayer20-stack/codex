# Editable episode

See the [delivery README](../README.md). Serve this folder using `python -m http.server 8765` and open `http://localhost:8765`.

The bundled English narration has already been cleaned and balanced. Export the episode with `npm install`, followed by `python pipeline.py --workers 2`. No API key is required.

Edit `story.json` for scene and subtitle timings, run `python sync_story.py` to refresh the browser copy, and use `film.js` / `cta.js` for visual changes. Subtitles are timed to the supplied narration; narrative changes need corresponding audio and caption updates.
