# Phase 3: Core Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Hero, About, Projects, and Contact sections in the approved white-paper, water-palette, low-FPS handmade direction.

**Architecture:** `app/page.tsx` remains the single server-rendered landing page. Section components live in `components/` and stay focused by responsibility: Hero composition, About narrative, project card/grid rendering, and Contact CTA. The page uses the existing `lib/content.ts` loader from Phase 2, real assets from `tools/font-builder/output/wordmarks/`, and a refreshed global token system in `app/globals.css`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, existing `lib/content.ts`, local font and wordmark assets, optional generated collage textures under `public/`

---

## File Structure

- Modify: `app/globals.css`
  - Replace the dark/cyan token set with white-paper, ink, sand, and water-beige tokens.
  - Add low-FPS motion utilities and handmade divider helpers.
- Modify: `app/page.tsx`
  - Compose the final Phase 3 landing page from section components.
- Modify: `components/Nav.tsx`
  - Restyle the nav to match the paper layout and calmer palette.
- Create: `components/Hero.tsx`
  - Wordmark-led hero using real generated water assets and handmade composition.
- Create: `components/About.tsx`
  - Editorial introduction plus strengths list in readable paper blocks.
- Create: `components/ProjectCard.tsx`
  - Reusable project card with sketch-border framing.
- Create: `components/Projects.tsx`
  - Server component that loads MDX projects and renders the grid.
- Create: `components/Contact.tsx`
  - Final CTA section using the same paper/ink system.
- Create: `content/projects/personal-website.mdx`
  - Real sample project entry for the landing page.
- Create: `public/wordmarks/amit.png`
  - Copy of the generated real wordmark for direct page use.
- Create: `public/wordmarks/projects.png`
  - Copy of the generated section wordmark for direct page use.
- Create: `public/textures/paper-ripple-01.png` (optional if needed during implementation)
  - Supporting handmade texture only if the existing font assets are not enough.

---

### Task 1: Bring the real wordmark assets into the site and retune global tokens

**Files:**
- Create: `public/wordmarks/amit.png`
- Create: `public/wordmarks/projects.png`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: reusable public assets and a global visual system that matches the approved art direction

- [x] **Step 1: Copy the existing real wordmarks into `public/wordmarks/`**

Run:

```bash
mkdir -p public/wordmarks
cp tools/font-builder/output/wordmarks/amit.png public/wordmarks/amit.png
cp tools/font-builder/output/wordmarks/projects.png public/wordmarks/projects.png
```

Expected: `public/wordmarks/amit.png` and `public/wordmarks/projects.png` exist.

- [x] **Step 2: Replace the dark token CSS in `app/globals.css`**

```css
@import "tailwindcss";

:root {
  --paper: #f8f3ea;
  --paper-warm: #efe6d8;
  --paper-line: #d6cab7;
  --ink: #2f241b;
  --ink-soft: #5f5145;
  --water-beige: #c9af85;
  --water-sand: #b89a74;
  --wash: #e7dccd;
  --font-display: var(--font-water), system-ui, sans-serif;
  --font-body: var(--font-geist-sans), system-ui, sans-serif;
  --step-snap: steps(4, end);
}

@theme inline {
  --color-background: var(--paper);
  --color-foreground: var(--ink);
  --font-sans: var(--font-body);
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background:
    radial-gradient(circle at 20% 12%, rgba(201, 175, 133, 0.18), transparent 28%),
    radial-gradient(circle at 78% 10%, rgba(184, 154, 116, 0.14), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(248, 243, 234, 0.92)),
    var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  display: block;
  max-width: 100%;
}

h1,
h2,
h3 {
  margin: 0;
  color: var(--ink);
}

p {
  margin: 0;
}

::selection {
  background: rgba(201, 175, 133, 0.32);
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--paper);
}

::-webkit-scrollbar-thumb {
  background: rgba(95, 81, 69, 0.35);
}

.paper-panel {
  background: rgba(255, 250, 243, 0.88);
  border: 1px solid rgba(95, 81, 69, 0.18);
  box-shadow: 0 3px 12px rgba(90, 72, 54, 0.08);
}

.sketch-divider {
  position: relative;
}

.sketch-divider::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -10px;
  width: 88px;
  height: 10px;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='10' viewBox='0 0 88 10' fill='none'%3E%3Cpath d='M2 8C19 3 36 4 50 6C63 8 74 7 86 2' stroke='%235f5145' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")
      no-repeat center / contain;
  opacity: 0.72;
}

.fps-jitter {
  animation: jitter-frame 2.8s var(--step-snap) infinite;
  transform-origin: center;
}

.fps-drift {
  animation: drift-frame 6s steps(6, end) infinite;
}

.fps-hover:hover {
  animation: hover-nudge 260ms steps(3, end) forwards;
}

@keyframes jitter-frame {
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(1px, -1px) rotate(-0.3deg); }
  50% { transform: translate(-1px, 1px) rotate(0.25deg); }
  75% { transform: translate(1px, 0) rotate(-0.15deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}

@keyframes drift-frame {
  0% { transform: translate3d(0, 0, 0); }
  25% { transform: translate3d(4px, -3px, 0); }
  50% { transform: translate3d(-2px, 3px, 0); }
  75% { transform: translate3d(3px, 1px, 0); }
  100% { transform: translate3d(0, 0, 0); }
}

@keyframes hover-nudge {
  from { transform: translate3d(0, 0, 0) rotate(0deg); }
  to { transform: translate3d(2px, -2px, 0) rotate(-0.35deg); }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .fps-jitter,
  .fps-drift,
  .fps-hover:hover {
    animation: none !important;
    transform: none !important;
  }
}
```

- [x] **Step 3: Verify the CSS parses cleanly**

Run:

```bash
npm run build
```

Expected: build succeeds without CSS errors.

- [x] **Step 4: Commit**

```bash
git add app/globals.css public/wordmarks/
git commit -m "feat: add handmade paper design tokens and wordmark assets"
```

---

### Task 2: Restyle navigation for the paper layout

**Files:**
- Modify: `components/Nav.tsx`

**Interfaces:**
- Produces: readable top nav that fits the handmade paper composition without looking like a SaaS header

- [x] **Step 1: Replace `components/Nav.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#github", label: "GitHub" },
  { href: "/blog", label: "Blog" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8">
      <div
        className="mx-auto flex max-w-6xl items-center justify-between border px-4 py-3 md:px-5"
        style={{
          background: "rgba(255,250,243,0.86)",
          borderColor: "rgba(95,81,69,0.18)",
          boxShadow: "0 2px 10px rgba(90,72,54,0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Link href="/" className="text-sm font-semibold tracking-[0.08em]" style={{ color: "var(--ink)" }}>
          AMIT ELGABSY
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm transition-opacity duration-150 hover:opacity-65"
                style={{ color: "var(--ink-soft)" }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="text-sm font-medium md:hidden"
          aria-label="Toggle navigation"
          onClick={() => setOpen((value) => !value)}
          style={{ color: "var(--ink)" }}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <div
          className="mx-auto mt-2 max-w-6xl border px-4 py-3 md:hidden"
          style={{
            background: "rgba(255,250,243,0.95)",
            borderColor: "rgba(95,81,69,0.18)",
          }}
        >
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block text-sm"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
```

- [x] **Step 2: Verify the nav still works**

Run:

```bash
npm run dev
```

Expected: top nav is readable on desktop and mobile, and the mobile toggle opens/closes without layout breakage.

- [x] **Step 3: Commit**

```bash
git add components/Nav.tsx
git commit -m "feat: restyle navigation for the paper layout"
```

---

### Task 3: Build the wordmark-led Hero section

**Files:**
- Create: `components/Hero.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: first-screen hero anchored by the real wordmark, no profile image, low-FPS handmade motion

- [x] **Step 1: Create `components/Hero.tsx`**

```tsx
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-32 md:px-8 md:pb-24 md:pt-36">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm leading-6 md:text-base" style={{ color: "var(--ink-soft)" }}>
              Full-stack developer building products with strong visual instincts, fast execution, and a taste
              for weird ideas that still ship.
            </p>

            <div className="max-w-4xl fps-jitter">
              <Image
                src="/wordmarks/amit.png"
                alt="Amit wordmark"
                width={1200}
                height={430}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>

          <div className="relative max-w-2xl border px-5 py-5 md:px-6 md:py-6 paper-panel fps-hover">
            <p className="text-base leading-7 md:text-lg" style={{ color: "var(--ink)" }}>
              I design and build software that feels like somebody actually cared while making it.
              This site is part portfolio, part artifact, and part proof that code can still have a point of view.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              className="border px-5 py-3 text-sm font-medium transition-opacity duration-150 hover:opacity-70"
              style={{
                background: "var(--water-beige)",
                color: "#231a13",
                borderColor: "rgba(95,81,69,0.2)",
              }}
            >
              See projects
            </a>
            <a
              href="#contact"
              className="border px-5 py-3 text-sm font-medium transition-opacity duration-150 hover:opacity-70"
              style={{
                color: "var(--ink)",
                borderColor: "rgba(95,81,69,0.2)",
                background: "rgba(255,250,243,0.8)",
              }}
            >
              Work with me
            </a>
          </div>
        </div>

        <div className="relative min-h-[320px] lg:min-h-[480px]">
          <div
            className="absolute left-[8%] top-[6%] h-32 w-32 rounded-full fps-drift"
            style={{ background: "rgba(201,175,133,0.24)" }}
          />
          <div
            className="absolute right-[8%] top-[18%] h-28 w-40 rotate-[-7deg] border paper-panel fps-jitter"
            style={{ background: "rgba(255,250,243,0.8)", borderColor: "rgba(95,81,69,0.15)" }}
          />
          <div
            className="absolute left-[18%] top-[32%] w-[68%] rotate-[-3deg] border px-4 py-4 paper-panel fps-hover"
            style={{ borderColor: "rgba(95,81,69,0.18)" }}
          >
            <p className="text-sm leading-6" style={{ color: "var(--ink-soft)" }}>
              Building portfolio systems, AI-assisted flows, creative tooling, and product surfaces that do not
              look like copied startup templates.
            </p>
          </div>
          <div
            className="absolute bottom-[12%] right-[10%] w-[58%] rotate-[2deg] border px-4 py-4 fps-jitter"
            style={{
              background: "rgba(231,220,205,0.7)",
              borderColor: "rgba(95,81,69,0.14)",
            }}
          >
            <p className="text-xs uppercase tracking-[0.08em]" style={{ color: "var(--ink-soft)" }}>
              Handmade web presence
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [x] **Step 2: Add `Hero` to `app/page.tsx`**

```tsx
import Hero from "@/components/Hero";

export default function Home() {
  return <Hero />;
}
```

- [x] **Step 3: Verify in the browser**

Run:

```bash
npm run dev
```

Expected: white-paper first screen, real water wordmark, no portrait, and handmade cutout blocks on the right.

- [x] **Step 4: Commit**

```bash
git add app/page.tsx components/Hero.tsx
git commit -m "feat: add wordmark-led hero section"
```

---

### Task 4: Add the About section with readable handmade structure

**Files:**
- Create: `components/About.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: a clear self-introduction and strengths block without losing the handmade visual language

- [x] **Step 1: Create `components/About.tsx`**

```tsx
const strengths = [
  "Fast at turning vague ideas into working product.",
  "Strong taste across interface design and frontend craft.",
  "Comfortable across backend, content systems, and AI workflows.",
  "Likes building tools that feel specific instead of generic.",
];

export default function About() {
  return (
    <section id="about" className="px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <h2 className="sketch-divider text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            About
          </h2>
          <p className="max-w-md text-sm leading-6 md:text-base" style={{ color: "var(--ink-soft)" }}>
            The site should feel personal, but not self-indulgent. This section explains how Amit works,
            what he values, and why the projects below matter.
          </p>
        </div>

        <div className="space-y-6">
          <div className="border px-5 py-5 paper-panel md:px-6 md:py-6">
            <p className="text-base leading-7 md:text-lg" style={{ color: "var(--ink)" }}>
              I like work that sits between product, engineering, and visual taste. I care about how things ship,
              how they read, and whether they leave any impression after the tab is closed.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {strengths.map((strength) => (
              <div
                key={strength}
                className="border px-4 py-4 paper-panel fps-hover"
                style={{ borderColor: "rgba(95,81,69,0.14)" }}
              >
                <p className="text-sm leading-6" style={{ color: "var(--ink-soft)" }}>
                  {strength}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [x] **Step 2: Add `About` below `Hero`**

```tsx
import About from "@/components/About";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
    </>
  );
}
```

- [x] **Step 3: Verify the section spacing and readability**

Run:

```bash
npm run build
```

Expected: build passes and the About section reads clearly without reverting to generic card UI.

- [x] **Step 4: Commit**

```bash
git add app/page.tsx components/About.tsx
git commit -m "feat: add editorial about section"
```

---

### Task 5: Add the real project content entry

**Files:**
- Create: `content/projects/personal-website.mdx`

**Interfaces:**
- Produces: one real project entry that can be rendered by `getProjects()`

- [x] **Step 1: Create `content/projects/personal-website.mdx`**

```mdx
---
title: Personal Portfolio Website
description: A portfolio built around a photographed water font, handmade paper composition, and AI-assisted publishing flow.
tech: [Next.js, TypeScript, Tailwind CSS, Vercel, Groq]
highlights:
  - Custom font and wordmarks built from photographed water letters
  - Handmade white-paper art direction with low-FPS motion
  - File-based content system for projects and blog posts
  - Designed to showcase both product taste and engineering range
github: https://github.com/amitelgabsy/personal-website
live: https://personal-website-pink-six-96.vercel.app
date: "2026-06-30"
---

This portfolio is meant to feel like an artifact, not a template. The goal was to make the identity system itself part of the project by building a font from photographed water letters, turning those glyphs into wordmarks, and designing the page around that handmade visual language.
```

- [x] **Step 2: Verify `getProjects()` returns the project**

Create `lib/__test-content.ts`:

```ts
import { getProjects } from "./content";

getProjects().then((projects) => {
  console.log("Projects found:", projects.length);
  console.log("First project:", projects[0]?.title);
});
```

Run:

```bash
npx tsx lib/__test-content.ts
```

Expected:

```text
Projects found: 1
First project: Personal Portfolio Website
```

Delete the temp file:

```bash
rm lib/__test-content.ts
```

- [x] **Step 3: Commit**

```bash
git add content/projects/personal-website.mdx
git commit -m "feat: add portfolio project content"
```

---

### Task 6: Build the Projects grid from MDX content

**Files:**
- Create: `components/ProjectCard.tsx`
- Create: `components/Projects.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `Project` type and `getProjects()` from `lib/content.ts`
- Produces: readable handmade project grid that still feels like a serious portfolio

- [x] **Step 1: Create `components/ProjectCard.tsx`**

```tsx
import type { Project } from "@/lib/content";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      className="flex h-full flex-col gap-5 border px-5 py-5 paper-panel fps-hover md:px-6 md:py-6"
      style={{ borderColor: "rgba(95,81,69,0.16)" }}
    >
      <div className="space-y-3">
        <h3 className="text-2xl font-semibold tracking-[-0.03em]" style={{ color: "var(--ink)" }}>
          {project.title}
        </h3>
        <p className="text-sm leading-6 md:text-base" style={{ color: "var(--ink-soft)" }}>
          {project.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {project.tech.map((item) => (
          <span
            key={item}
            className="border px-2 py-1 text-xs"
            style={{
              color: "var(--ink-soft)",
              borderColor: "rgba(95,81,69,0.16)",
              background: "rgba(239,230,216,0.65)",
            }}
          >
            {item}
          </span>
        ))}
      </div>

      <ul className="space-y-2">
        {project.highlights.slice(0, 3).map((highlight) => (
          <li key={highlight} className="text-sm leading-6" style={{ color: "var(--ink-soft)" }}>
            {highlight}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap gap-4 pt-3 text-sm">
        {project.github ? (
          <a href={project.github} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
            Source
          </a>
        ) : null}
        {project.live ? (
          <a href={project.live} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
            Live
          </a>
        ) : null}
      </div>
    </article>
  );
}
```

- [x] **Step 2: Create `components/Projects.tsx`**

```tsx
import { getProjects } from "@/lib/content";
import Image from "next/image";
import ProjectCard from "./ProjectCard";

export default async function Projects() {
  const projects = await getProjects();

  return (
    <section id="projects" className="px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="max-w-[360px] fps-jitter">
              <Image src="/wordmarks/projects.png" alt="Projects wordmark" width={720} height={220} className="h-auto w-full" />
            </div>
            <p className="max-w-xl text-sm leading-6 md:text-base" style={{ color: "var(--ink-soft)" }}>
              A selection of work across product design, frontend systems, AI-assisted tooling, and projects that
              try not to look like everybody else's.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [x] **Step 3: Add `Projects` below `About`**

```tsx
import About from "@/components/About";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
    </>
  );
}
```

- [x] **Step 4: Verify project rendering**

Run:

```bash
npm run dev
```

Expected: the Projects section renders one real project card with tech items and links.

- [x] **Step 5: Commit**

```bash
git add app/page.tsx components/ProjectCard.tsx components/Projects.tsx
git commit -m "feat: add handmade projects section"
```

---

### Task 7: Build the Contact section and finish page composition

**Files:**
- Create: `components/Contact.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: a final CTA that closes the page in the same handmade system without overpowering the projects

- [x] **Step 1: Create `components/Contact.tsx`**

```tsx
const links = [
  { label: "GitHub", href: "https://github.com/amitelgabsy" },
  { label: "LinkedIn", href: "https://linkedin.com/in/amitelgabsy" },
  { label: "Email", href: "mailto:amit.elgabsy@gmail.com" },
];

export default function Contact() {
  return (
    <section id="contact" className="px-4 pb-24 pt-12 md:px-8 md:pb-32">
      <div className="mx-auto max-w-4xl border px-6 py-8 paper-panel md:px-8 md:py-10">
        <div className="space-y-5">
          <h2 className="sketch-divider text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            Contact
          </h2>
          <p className="max-w-2xl text-sm leading-6 md:text-base" style={{ color: "var(--ink-soft)" }}>
            Open to product work, creative engineering, collaborations, and roles where design taste matters as
            much as implementation speed.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                className="border px-4 py-3 text-sm transition-opacity duration-150 hover:opacity-70"
                style={{
                  color: link.label === "Email" ? "#231a13" : "var(--ink)",
                  background: link.label === "Email" ? "var(--water-beige)" : "rgba(255,250,243,0.75)",
                  borderColor: "rgba(95,81,69,0.18)",
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [x] **Step 2: Add `Contact` below `Projects`**

```tsx
import About from "@/components/About";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Contact />
    </>
  );
}
```

- [x] **Step 3: Run the full verification set**

Run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Expected:
- no TypeScript errors
- lint passes
- build succeeds

- [x] **Step 4: Commit**

```bash
git add app/page.tsx components/Contact.tsx
git commit -m "feat: complete phase 3 landing page composition"
```

---

### Task 8: Refresh docs to match the implemented direction

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-06-29-phase-3-core-sections.md`
- Modify: `CODEX.md`

**Interfaces:**
- Produces: repo docs that reflect the real Phase 3 implementation and its handmade paper direction

- [x] **Step 1: Mark the Phase 3 plan checkboxes complete**

Update each `- [ ]` in this plan to `- [x]` for the implemented steps only.

- [x] **Step 2: Add the completed Phase 3 write-up to `README.md`**

Include:
- the white-paper art direction
- use of real wordmark assets
- low-FPS motion approach
- the sample project content
- verification commands run

- [x] **Step 3: Update `CODEX.md` handoff**

Move the current phase forward and summarize the completed Phase 3 structure.

- [ ] **Step 4: Commit**

```bash
git add README.md docs/superpowers/plans/2026-06-29-phase-3-core-sections.md CODEX.md
git commit -m "docs: record completed phase 3 work"
```
