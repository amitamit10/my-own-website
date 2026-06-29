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

### Letter QA and cleanup

After the first full capture pass, a Kilocode agent (`letter-reviewer` / "Letter QA & Fixer") reviewed every PNG for shape quality and ran `fix-letters.py` automatically to remove detached stray blobs.

From there, the workflow was refined further:

- The phone capture app was switched into a **retry-only mode** for problem glyphs so re-shooting did not require resetting the whole alphabet.
- A targeted **GPT image cleanup pass** was used to improve the final silhouettes for every glyph, producing a cleaner and more consistent display-font look across the full set.
- `tools/font-maker/transparentize_letters.py` was added to remove solid black backgrounds from the final AI-cleaned glyphs and convert them back to transparent PNGs.

Current result: **36 PASS / 36 total**. The current verified status lives in `tools/font-maker/letter-notes.md`.

### Bug fixed during this phase

`rembg s` (the server subcommand) doesn't accept a `--model` flag — passing it caused a crash and "rembg failed: fetch failed" on every upload. Fix: removed the flag from the spawn args, moved model selection to the query param on each request (`?model=u2netp`).

### Additional utilities added during cleanup

- `tools/font-maker/fix-letters.py` — Removes small detached blobs using connected-component analysis.
- `tools/font-maker/transparentize_letters.py` — Converts black backgrounds in the final glyph PNGs to transparency.
- `tools/font-maker/retry-mode.js` + `retry-mode.test.js` — Powers the retry-only capture queue for selected letters.
- `tools/font-maker/test_transparentize_letters.py` — Regression test for the black-to-transparent conversion logic.

---

## Phase 2 — Site Foundation 🔄

**Goal:** Scaffold the Next.js portfolio site — Tailwind, MDX utilities, custom font setup, nav bar, Vercel preview deploy.

**Built with:** Codex

> **Codex — fill this in after you complete Phase 2.**
>
> Include: what you scaffolded, any deviations from the plan, commands that needed changing, the Vercel preview URL.

---

## Phase 3 — Core Sections

**Goal:** Hero, About/Strengths, Projects grid, Contact section.

**Built with:** TBD

> To be filled in after Phase 3 is complete.

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
| `docs/kilocode-agent-guide.md` | Reference for creating Kilocode agents |
