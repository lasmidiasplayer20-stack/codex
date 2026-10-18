# Using the procedural visual reference

`../assets/reference/3d-cozy-snow-plow-game.zip` preserves the complete supplied reference, totaling 587,298 bytes. Its visual style is mainly procedural: Three.js code generates geometry and materials. This does not mean another video's motion or physics can be inferred automatically.

## Relevant archive files

| File | Role |
| --- | --- |
| `index.html` | Main reference: procedural geometry, cartoon materials, outlines, lighting, and composition. Approximately 491 KB. |
| `README.md`, `package.json`, lockfile, configuration | Original application context and versions; retained with original notices. |
| `src/App.tsx` and other React files | Supporting scaffold rather than the visual core. Preserve embedded notices. |
| `server.ts` | Original application service; unnecessary for reproducing the style. |
| `.env.example` | Original application's example configuration. Checked fields contain placeholders, not actual credentials. This skill's mesh/shader workflow needs no Gemini API key. |

The original ZIP loads Three.js r128 from a CDN. The new template uses Three.js 0.180.0 locally. Adapt and test older shaders/APIs rather than copying them unchanged.

## Style characteristics to interpret

- Simple rounded volumes, clear silhouettes, limited fine detail.
- Approximately three cel-shading bands and slightly cool/purple shadows.
- Dark inverted-hull outlines and subtle rim light.
- Gentle halftone shading in shadow regions.
- Controlled palette, readable composition, and action-oriented framing.

`templates/three-rig/src/rig.js` offers a new interpretation of these principles with articulated volumes, a shader, and IK. It is not a literal extraction of the game's character. Adapt proportions, colors, and accessories to the current source. Snow, gameplay, UI, and game audio must not carry over when only visual style was requested.

Extract the archive into a temporary directory with path checks. Inspect contents before running code. Do not run the original server or install AI integrations merely to study its appearance. The original archive remains unchanged, including any original-language content.
