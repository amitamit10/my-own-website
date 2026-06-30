# Personal Portfolio Website — Design Spec

**Date:** 2026-06-29
**Status:** Draft

---

## Overview

A handmade-feeling personal portfolio website built with Next.js and deployed on Vercel. The site's job is to introduce Amit clearly, make his projects feel memorable, and prove taste as well as technical ability. A custom water-photography font is the visual anchor, but the content still needs to read like a real portfolio first. When a new project is published, a Groq-powered AI model auto-generates a blog post about it.

The page should feel like a designed paper composition assembled from water letters, rough dividers, taped notes, and stop-motion fragments rather than like a default portfolio template.

---

## Sections

1. **Hero** — Full-screen, wordmark-led intro with Amit's name rendered from the custom water assets, a punchy tagline, and a CTA
2. **About / Strengths** — Short bio, key skills, and what makes Amit stand out
3. **Projects** — Cards showcasing work, each linked to an auto-generated blog post
4. **GitHub Activity** — Live GitHub contribution graph and recent repos via GitHub API
5. **Blog** — AI-generated posts, one per project, browsable independently
6. **Contact** — Simple contact form or links

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Deployment | Vercel |
| Content | File-based MDX (projects + blog posts) |
| AI | Groq API (auto blog post generation) |
| GitHub data | GitHub REST API (public, no auth needed for basic data) |
| Font | Custom water-photography font (`.woff2`) |
| Styling | Tailwind CSS |

---

## Subject, Audience, and Single Job

- **Subject:** Amit Elgabsy's personal body of work as a developer and builder
- **Audience:** Employers, collaborators, and clients who need to understand both the quality of the work and the personality behind it
- **Single job of the page:** Make people remember Amit quickly, then give them a clear path into his projects

---

## Custom Font Pipeline

A dedicated tool (separate mini-app in this repo under `tools/font-maker/`) that:

1. **Phone camera server** — Runs a local Node.js web server accessible from the phone's browser on the same WiFi network. Displays which letter to photograph next with framing guides.
2. **Letter capture** — User photographs water forming each letter (A–Z, 0–9, punctuation as needed). Photos upload directly to the tool.
3. **Background removal** — Each photo is processed automatically (remove.bg API or local `rembg` Python library) to isolate the water letterform on a transparent background.
4. **Review & save** — Processed images are saved to `tools/font-maker/letters/` as PNGs, one per character.
5. **Font assembly** — Cleaned PNGs are processed by the local builder in `tools/font-builder/`, which exports `water.ttf`, `water.woff2`, and image-based wordmarks built from the photographed glyphs.

The font system is used primarily for display moments (hero name, section titles, special labels). Body text stays readable with a clean sans-serif companion face.

---

## AI Blog Generation

When a new project MDX file is added to `content/projects/`, running `npm run generate-post <project-slug>` calls the Groq API with the project metadata (name, description, tech stack, highlights) and writes a new MDX file to `content/blog/`. The prompt instructs Groq to write an engaging, first-person blog post about the project.

The generated post is saved as a draft (frontmatter `draft: true`) so Amit can review and publish it manually by flipping the flag.

---

## Content Structure

```
content/
  projects/
    project-name.mdx       # title, description, tech, links, highlights
  blog/
    project-name-post.mdx  # AI-generated, draft: true until reviewed
```

---

## Design Direction

### Core visual choice

The site should not use the earlier dark/cyan portfolio direction. The approved direction is **white paper + water-font palette + handmade stop-motion composition**.

### Palette

Colors should be sampled from the actual water glyphs and supporting assets rather than invented from generic UI defaults.

- **Paper:** warm off-white / watercolor paper base
- **Water beige:** the main headline and accent tone pulled from the real font
- **Sand / taupe washes:** for section framing, cutout fills, and project surfaces
- **Wet ink:** the primary text color and sketched line color
- **Soft gray wash:** for subtle structure and depth

The palette should feel calm, warm, and slightly tactile. No neon cyan-led UI, no purple bias, and no glossy dark SaaS treatment.

### Typography

- **Hero / signature headings:** use the real water-wordmark treatment or image-based wordmarks built from the photographed glyphs
- **Supporting section titles:** can use the custom water system selectively, but should not reduce readability
- **Body copy:** clean readable sans-serif for project and bio content

The font is a signature, not a replacement for all content text.

### Layout

- **Hero:** wordmark-led, no portrait or profile picture
- **Structure:** readable content core with handmade edges
- **Projects:** the clearest and most credibility-heavy section on the page
- **Frames:** rough dividers, sketched borders, pinned-paper compositions, taped notes, and cutout shapes can be used around the content

The page should feel composed by hand, but the project information should still scan quickly.

### Motion

Motion should feel intentionally low-FPS, like stop-motion or frame-by-frame collage movement.

- frame-stepped ripple swaps
- subtle jitter or nudge on hover / reveal
- slight misregistration of decorative pieces
- hand-cut movement instead of smooth glossy transitions

Animation is part of the identity system, not just a late polish layer.

### Image use

- Do not use a real profile photo of Amit in the hero
- Supporting generated imagery is allowed if needed, but should behave like handmade collage material rather than stock illustrations
- The strongest visual material should come from the actual water font assets wherever possible

### Signature element

The single memorable signature should be the **wordmark-led paper composition**: Amit's water-letter name as the visual anchor, surrounded by rough hand-drawn structure and low-FPS motion fragments.

---

## Phases (build order)

| Phase | Name | Goal |
|---|---|---|
| 1 | Font Maker Tool | Phone camera server + background removal + letter PNG storage |
| 2 | Site Foundation | Next.js scaffold, Tailwind, Vercel config, MDX, layout, custom font |
| 3 | Core Sections | Hero, About/Strengths, Projects grid, Contact |
| 4 | GitHub Activity | Live GitHub API — contribution graph + recent repos |
| 5 | AI Blog Generation | Groq integration, generate-post script, blog page, draft/publish flow |
| 6 | Polish & Deploy | Animations, ripple/particle effects, performance, production Vercel deploy |

---

## Working Method

- **Skills as needed** — custom Claude Code skills will be written along the way when a repeatable workflow emerges (e.g. a skill for generating a new project post, a skill for adding a new project, a skill for deploying). Skills live in `.claude/skills/`.

---

## Out of Scope (v1)

- CMS or visual admin dashboard
- Authentication
- Comments on blog posts
- Analytics
