# Personal Portfolio Website — Build Log

A personal portfolio website built step by step, using a mix of AI coding tools. This file is a running log of every phase — what was built, how, and with which tool.

> **For Codex:** After you finish a phase, add a new entry under the matching phase heading below. Describe what you built, what commands you ran, what decisions you made, and any issues you hit.

---

## Tools used across this project

| Tool | Role |
|------|------|
| **Claude Code** | Planning, architecture, specs, skill writing, agent creation, commits |
| **Kilocode** | Implementation sessions (multi-file coding, letter QA agent) |
| **Codex** | Phase 2+ site implementation (handed off here) |

---

## Phase 1 — Font Maker Tool ✅

**Goal:** Build a phone-camera server that photographs water letters, removes their backgrounds, and saves them as PNGs.

**Built with:** Claude Code (planning + architecture) + Kilocode (implementation)

### What was built

- `tools/font-maker/server.js` — Express server on port 3333. The phone connects over WiFi, the UI tells you which letter to photograph, and each photo is uploaded and processed.
- `tools/font-maker/public/index.html` + `style.css` — Phone-facing UI. Shows the current letter, camera capture, live preview with checkerboard background (for transparency), and a "Next letter →" button. Compresses images client-side (Canvas API, 1024px max, 85% JPEG) before uploading.
- Background removal via `rembg` (Python, u2netp model, ~176MB). Runs as a persistent child HTTP server on port 5000 so the model stays loaded between photos — first upload is fast because it pre-warms on startup.
- Output PNGs land in `tools/font-maker/letters/` — one per character (A–Z, 0–9).
- `tools/font-maker/fix-letters.py` — Post-capture cleanup. Uses scipy connected-component analysis to remove stray pixel blobs smaller than 1500 px² without touching real letter parts.

### How to run it

```bash
# One-time setup
pip install --break-system-packages "rembg[cpu,cli]"
cd tools/font-maker && npm install

# Start (binds 0.0.0.0:3333, prints a QR code for your phone)
npm start
```

### Capture result at the end of Phase 1

The phone capture workflow successfully produced the full glyph set (`A-Z`, `0-9`) and the core toolchain for photographing, removing backgrounds, and saving transparent PNGs.

### Bug fixed during this phase

`rembg s` (the server subcommand) doesn't accept a `--model` flag — passing it caused a crash and "rembg failed: fetch failed" on every upload. Fix: removed the flag from the spawn args, moved model selection to the query param on each request (`?model=u2netp`).

### Additional utilities added during Phase 1

- `tools/font-maker/fix-letters.py` — Removes small detached blobs using connected-component analysis.
- `tools/font-maker/retry-mode.js` + `retry-mode.test.js` — Powers the retry-only capture queue for selected letters.

---

## Phase 1.5 — Glyph Cleanup and Font Assembly ✅

**Goal:** Turn the captured glyphs into clean final assets for the site: transparent PNGs, a color webfont, and real-photo wordmarks.

**Built with:** Codex

### What was built

- A full verification pass refreshed `tools/font-maker/letter-notes.md` so the report matches the current glyph set.
- A targeted GPT image cleanup pass improved the final silhouettes for every glyph, producing a cleaner and more consistent display-font look across the full set.
- `tools/font-maker/transparentize_letters.py` was added to remove solid black backgrounds from the AI-cleaned glyphs and convert them back to transparent PNGs.
- A repo-local builder under `tools/font-builder/` now turns the cleaned glyph PNGs into `water.ttf` and `water.woff2` without installing the font globally.
- The exported font includes `COLR/CPAL` color tables so the water font renders in a warm beige water tone instead of monochrome.
- `tools/font-builder/compose_wordmark.py` builds image-based wordmarks from the real water glyph PNGs. This is the recommended way to render the hero name and one or two standout section titles so they keep the photographed-water texture.

### Current result

- **36 PASS / 36 total** in `tools/font-maker/letter-notes.md`
- Built font artifacts:
  - `tools/font-builder/output/water.ttf`
  - `tools/font-builder/output/water.woff2`
- Built wordmark assets:
  - `tools/font-builder/output/wordmarks/amit.png`
  - `tools/font-builder/output/wordmarks/projects.png`

### Verification run

```bash
cd tools/font-builder
.venv/bin/python -m unittest test_prepare_glyphs.py test_build_font.py test_compose_wordmark.py
.venv/bin/python validate_font.py output/water.woff2
```

Validation confirmed:
- no missing glyphs
- `COLR` table present
- `CPAL` table present

### Additional utilities added during Phase 1.5

- `tools/font-maker/transparentize_letters.py` — Converts black backgrounds in the final glyph PNGs to transparency.
- `tools/font-maker/test_transparentize_letters.py` — Regression test for the black-to-transparent conversion logic.
- `tools/font-builder/` — Local-only color font build pipeline and exported webfont artifacts.
- `tools/font-builder/compose_wordmark.py` — Builds real-photo wordmark PNGs for website hero/section titles.

---

## Phase 2 — Site Foundation ✅

**Goal:** Scaffold the Next.js portfolio site — Tailwind, MDX utilities, custom font setup, nav bar, and a live Vercel deployment.

**Built with:** Codex

### What was built

- Scaffolded the repo root into a working App Router site with `app/`, `public/`, `package.json`, `tsconfig.json`, `next.config.ts`, and Tailwind CSS v4 wiring.
- Added the dark design-token global styles in `app/globals.css`.
- Wired the real generated water font into the site with `next/font/local` and `geist/font/sans`.
- Copied the current built font from `tools/font-builder/output/water.woff2` into `public/fonts/water.woff2` and documented that handoff in `public/fonts/README.md`.
- Added `lib/content.ts` plus `content/projects/.gitkeep` and `content/blog/.gitkeep` for the later MDX-based portfolio/blog phases.
- Added a fixed `components/Nav.tsx` shell and replaced the homepage with the simple Phase 2 placeholder.
- Linked the repo to Vercel project `personal-website` and deployed it successfully to Vercel. The current deployment target is `production` and the deployment status is `Ready`.

### Important deviations from the written plan

- `create-next-app .` cannot run directly in this repo root because the repo already contains docs/tools. The app was scaffolded in a temp directory and the generated root site files were copied back in.
- The written plan targeted **Next.js 15**, but this repo path is `/home/amit/Desktop/my own website!!!`. The `!` characters make Next 15's Webpack build fail validation, so the site was finalized on **Next.js 16.2.9 (Turbopack)** instead.
- The plan said to create an empty placeholder font file. Since the real font now exists from Phase 1.5, the site uses the actual generated `water.woff2`.

### Commands run

```bash
npx create-next-app@latest /tmp/personal-website-phase2 --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
cp tools/font-builder/output/water.woff2 public/fonts/water.woff2
npm install
npm install next@16 eslint-config-next@16 geist gray-matter next-mdx-remote
npx tsc --noEmit
npm run build
npm run dev
vercel project add personal-website --scope amits-projects-79cd529f
vercel link --yes --project personal-website --scope amits-projects-79cd529f
vercel --yes --scope amits-projects-79cd529f
```

### Verification

- `npx tsc --noEmit` passed
- `npm run build` passed on Next.js 16.2.9
- `npm run dev` started successfully on `http://localhost:3000`
- `curl -I http://localhost:3000` returned `200 OK`
- Vercel deployment completed successfully
- `vercel inspect personal-website-7qv3f9xec-amits-projects-79cd529f.vercel.app --scope amits-projects-79cd529f` reported `status: Ready`

### Vercel URLs

- Deployment URL: `https://personal-website-7qv3f9xec-amits-projects-79cd529f.vercel.app`
- Friendly alias: `https://personal-website-pink-six-96.vercel.app`
- Additional aliases:
  - `https://personal-website-amits-projects-79cd529f.vercel.app`
  - `https://personal-website-amitelgabsy-7297-amits-projects-79cd529f.vercel.app`

Note: the Vercel deployment is currently behind the team's deployment protection / SSO, so anonymous `curl` requests redirect through Vercel auth.

---

## Phase 3 — Core Sections ✅

**Goal:** Hero, About/Strengths, Projects grid, Contact section.

**Built with:** Codex

### What was built

- Replaced the dark placeholder direction with a white-paper landing page using warm ink, beige water tones, and lightweight handmade framing.
- Built a wordmark-led hero with the real photographed-water `amit.png` asset, low-FPS motion helpers, and no profile photo.
- Added the editorial `About` section, a real MDX-backed `Projects` section, and a matching `Contact` close.
- Added `content/projects/personal-website.mdx` as the first real project entry and rendered it through `lib/content.ts`.
- Restyled the nav to fit the calmer handmade composition while keeping it readable on mobile and desktop.

### Commands run

```bash
npx tsx lib/__test-content.ts
npx tsc --noEmit
npm run lint
npm run build
npm run dev
curl -I http://localhost:3000
```

### Verification

- `npx tsx lib/__test-content.ts` reported `Projects found: 1` and `First project: Personal Portfolio Website`
- `npx tsc --noEmit` passed
- `npm run lint` passed
- `npm run build` passed
- `curl -I http://localhost:3000` returned `200 OK`

### Notes

- The landing page keeps the handmade direction readable by using the real water texture for key wordmarks and a cleaner editorial treatment for the supporting sections.
- The current hero intentionally avoids a profile picture and uses composition, motion, and type instead.

---

## Phase 4 — GitHub Activity

**Goal:** Live GitHub contribution graph and recent repo cards via GitHub REST API.

**Built with:** TBD

> To be filled in after Phase 4 is complete.

---

## Phase 5 — AI Blog Generation

**Goal:** Groq API integration, `npm run generate-post <slug>` script, blog page, draft/publish flow.

**Built with:** TBD

> To be filled in after Phase 5 is complete.

---

## Phase 6 — Polish & Deploy

**Goal:** Framer Motion scroll animations, canvas water-ripple cursor, SEO metadata, production Vercel deploy.

**Built with:** TBD

> To be filled in after Phase 6 is complete.

---

## Key files

| File | Purpose |
|------|---------|
| `docs/superpowers/specs/2026-06-29-personal-website-design.md` | Full design spec — tech stack, sections, design direction |
| `docs/superpowers/plans/2026-06-29-phase-N-*.md` | Step-by-step plan for each phase |
| `AGENTS.md` | Repo layout, conventions, tooling notes |
| `CLAUDE.md` | Claude Code–specific guidance |
| `CODEX.md` | Codex handoff — current phase tasks and Kilocode agent guide |
| `tools/font-maker/letter-notes.md` | Per-glyph QA report (overwritten on each QA agent run) |
| `tools/font-maker/transparentize_letters.py` | Removes black backgrounds from glyph PNGs after cleanup |
| `tools/font-builder/` | Local-only builder for `water.ttf` and `water.woff2` |
| `tools/font-builder/output/wordmarks/` | Hero/title PNG assets composed from the real water glyph photos |
| `docs/kilocode-agent-guide.md` | Reference for creating Kilocode agents |
