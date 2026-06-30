# Codex Handoff — Personal Portfolio Website

**Date:** 2026-06-29  
**Current phase: Phase 4 — GitHub Activity**

---

## What this project is

A personal portfolio website for Amit Elgabsy.  
Stack: **Next.js 16 App Router + TypeScript + Tailwind CSS v4**, deployed on Vercel.  
Content: file-based MDX files in `content/projects/` and `content/blog/`.  
Custom water-photography font for display headings (assembled from letter PNGs in `tools/font-maker/letters/`).

---

## Where we are

### Phase 1 — DONE
- `tools/font-maker/` is a fully working standalone Express server (port 3333).
- All 36 letter PNGs (A–Z, 0–9) were photographed on a phone via WiFi and processed with `rembg` (background removal).
- `tools/font-maker/fix-letters.py` was added to erase stray pixel blobs.

### Phase 1.5 — DONE
- `tools/font-maker/letter-notes.md` now reflects the final verified set: **36 PASS / 36 total**.
- The glyph cleanup pass is finished, including black-background removal via `tools/font-maker/transparentize_letters.py`.
- `tools/font-builder/` now builds the real site assets locally:
  - `tools/font-builder/output/water.ttf`
  - `tools/font-builder/output/water.woff2`
  - `tools/font-builder/output/wordmarks/amit.png`
  - `tools/font-builder/output/wordmarks/projects.png`
- The exported webfont includes `COLR/CPAL` color tables, so the water font is colorized instead of monochrome.
- The site no longer needs a fake placeholder font file; use the real generated `water.woff2` from `tools/font-builder/output/`.

### Phase 2 — DONE
- The repo root now contains the App Router site scaffold (`app/`, `public/`, `components/`, `lib/`, `content/`, package files).
- The site uses the real generated water font from `public/fonts/water.woff2`, copied from `tools/font-builder/output/water.woff2`.
- `lib/content.ts` exists for projects/blog MDX loading.
- `components/Nav.tsx` and the Phase 2 placeholder home page are in place.
- Vercel project `personal-website` is linked and deployed.
- Because this workspace path contains `!`, Next 15's Webpack build was not viable here. Phase 2 was completed on **Next.js 16.2.9 (Turbopack)** instead.

### Phase 3 — DONE
- `app/page.tsx` now composes `Hero`, `About`, `Projects`, and `Contact`.
- `app/globals.css` and `components/Nav.tsx` were retuned from the earlier dark placeholder direction into the approved white-paper, warm-water palette.
- The hero uses the real water-photography wordmark asset from `public/wordmarks/amit.png` and intentionally does not use a profile picture.
- `components/ProjectCard.tsx`, `components/Projects.tsx`, and `content/projects/personal-website.mdx` now provide the first real MDX-backed project section.
- `components/Contact.tsx` closes the page with the same handmade system instead of switching visual styles.
- Verification completed with:
  - `npx tsx lib/__test-content.ts`
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run build`
  - `npm run dev`
  - `curl -I http://localhost:3000`

### Phase 4 — START HERE
Build the GitHub activity section on top of the completed Phase 3 landing page.

---

## Phase 4 tasks (in order)

Read the full plan at `docs/superpowers/plans/2026-06-29-phase-4-github-activity.md`. Tick `- [ ]` checkboxes as you complete each step. The Phase 3 landing page is now the baseline, so the next work should layer the GitHub activity section into the existing white-paper composition instead of replacing it.

---

## Key constraints

- **No `src/` directory** — `app/` lives at the repo root
- **Tailwind v4** — CSS-only config (`@import "tailwindcss"` in globals.css, no `tailwind.config.js`)
- **TypeScript strict mode**
- **Node ≥ 20**
- Do not touch `tools/font-maker/` — it is a separate standalone tool

---

## Commit style

One commit per completed task, message format:
```
feat: scaffold Next.js 15 with Tailwind and TypeScript
feat: configure design tokens and global styles
feat: add custom font setup with water font variable
feat: add MDX content reading utilities
feat: add nav bar and layout shell
chore: add Vercel project config
```

---

## Full design spec

`docs/superpowers/specs/2026-06-29-personal-website-design.md` — full vision, tech choices, section list, all 6 phases.

---

## How to use Kilocode agents in this project

Kilocode is a separate AI coding tool (not Codex). It runs its own agent sessions. This project has custom agents in `.kilo/agent/` that Codex should know about so it can delegate the right tasks to them.

### When to hand off to Kilocode

| Task | Which agent | How to trigger |
|------|-------------|----------------|
| QA all 36 letter PNGs and auto-fix stray blobs | **Letter QA & Fixer** | Open a new Kilocode session, select "Letter QA & Fixer" from the agent picker |
| Implement code across many files | **Code** or **Orchestrator** | Open a new Kilocode session, pick the agent |
| Review code | **Code Reviewer** | Kilocode session → Code Reviewer agent |

### Prompt to use for the Letter QA & Fixer agent

Copy-paste this into a new Kilocode session with **Letter QA & Fixer** selected:

```
Review all 36 letter PNGs in tools/font-maker/letters/ for shape quality only (font will be black — ignore color/halos). Write the report to tools/font-maker/letter-notes.md, then automatically fix all manually fixable letters.
```

### How to create a new Kilocode agent (if needed)

Full format reference: `docs/kilocode-agent-guide.md`

Quick rules:
- Agent file goes in `.kilo/agent/<id>.md`
- `options.id` must exactly match the filename (without `.md`)
- `mode: primary` = appears in the user-facing agent picker
- `mode: subagent` = only callable by the Orchestrator
- Declare all five permissions explicitly: `read`, `edit`, `bash`, `mcp`, `question`
- Keep `edit` patterns as narrow as possible
- System prompt body: under ~30 lines, start with a role sentence

Minimal example:
```yaml
---
mode: subagent
description: Does one focused thing
options:
  displayName: My Agent
  id: my-agent
permission:
  read: allow
  edit:
    "some/path/*.md": allow
  bash: deny
  mcp: deny
  question: allow
---

You are a focused specialist. Your only job is X. Do not modify files outside your permitted paths.
```

### What agents already exist

- `orchestrator` — primary mode, delegates work to subagents in parallel
- `letter-reviewer` (Letter QA & Fixer) — primary mode, reviews letter PNGs and runs fix-letters.py
- `code`, `code-reviewer`, `debug`, `architect`, `plan`, `docs-specialist`, `frontend-specialist`, `test-engineer`, `ask`, `code-runner`, `skill-creator` — all subagents, used by the Orchestrator
