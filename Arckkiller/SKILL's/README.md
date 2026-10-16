# Arckkiller animation skills

Two separate skills share the same preserved character, physics, sound library and production tools:

| Skill | When to use |
| --- | --- |
| [Animation from reference](animation-from-reference/SKILL.md) | Recreate the action, emotions and sound timing of a supplied video or image with our character and an original environment. |
| [Original stick animation](original-stick-animation/SKILL.md) | Invent a new story, environment and choreography from scratch. |

For new chat attachments, use a portable ZIP below 32 MiB:

- **[Reference-video skill ZIP](animation-from-reference.zip)**
- **[Original-creation skill ZIP](original-stick-animation.zip)**

Each contains its skill plus the shared code, reusable effects, current reference-example audio and selected visual reviews. Repeated historical mixed soundtracks and large archival image sheets stay in the complete archive and browsable GitHub library.

Download **[animation-skills.zip](animation-skills.zip)** for both skills and their shared source/asset library. Extract all three sibling folders together: `animation-from-reference`, `original-stick-animation` and `shared-animation-kit`. The shared kit contains the original rig, six Animation vs Physics reference versions, Arckkiller project sources, visual reviews, reusable ElevenLabs effects and practical production scripts. Complete movies are catalogued by links and hashes instead of duplicated. Temporary renders, installed dependencies and credentials are excluded.

## Use in a new request

Attach the ZIP to the new conversation and tell the agent which SKILL.md to read. If the tool supports local skill installation, copy all three sibling folders into its skill directory (for Codex, typically `$CODEX_HOME/skills`) and start a new session. Only the first two directories contain active `SKILL.md` entry points. A GitHub folder alone does not automatically activate a skill.

> Use $animation-from-reference with the attached video. Recreate the first two minutes with Cyan and his preserved proportions, in a new clean setting. Keep the source sound timing, compose quiet original music in Python, work in six internal sections and export one complete 1080p60 film into Arckkiller/Animação/Vídeos.

> Use $original-stick-animation to invent a 3:30 colorful film in a clockwork greenhouse. Keep the original rig proportions, continuous native-time action, concurrent character tasks and polished contacts. English visible text. Complete MP4s go in Arckkiller/Animação/Vídeos.

Without installed skill discovery, replace the `$skill-name` phrase with “Read and follow the attached [skill folder]/SKILL.md”. Attach new visual references separately.

## Verification and source history

`PACKAGE-MANIFEST.json` contains SHA-256 hashes for the complete bundle. `PACKAGE-REPORT.json` records package checks, and the ZIP has a separate `.sha256` file. `shared-animation-kit/PROVENANCE.json` records source paths and hashes; its `MANIFEST.json` checks shared files. `verify-bundle.py` verifies extracted content.

Historical source instructions and skill documents are preserved as `SOURCE-INSTRUCTIONS.md` and `SOURCE-SKILL.md`, so they do not appear as extra active skills. The original combined skill's production guide remains in `shared-animation-kit/WORKFLOW.md` as reference documentation. User instructions always take precedence over historical material.

The library includes the latest reference-adaptation example and the earlier original factory/bakery projects. Their quality notes and limitations are documented; inclusion does not mean every historical frame is a recommended result. Packaging grants no new third-party license or audio rights. No API credentials are included.
