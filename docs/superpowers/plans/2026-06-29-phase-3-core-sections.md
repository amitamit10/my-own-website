# Phase 3: Core Sections — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Hero, About/Strengths, Projects grid, and Contact sections with a real sample project MDX file.

**Architecture:** All sections are React Server Components rendered on `app/page.tsx`. Each section is a separate component in `components/`. The Projects section reads from `content/projects/` via `lib/content.ts` from Phase 2. Bold, dark, creative aesthetic with cyan accent throughout.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v4, `lib/content.ts` from Phase 2

## Global Constraints
- All section components are Server Components (no `'use client'` unless interactivity required)
- Section IDs must match Nav links from Phase 2: `#about`, `#projects`, `#contact`
- Color tokens from Phase 2: `--bg`, `--surface`, `--accent`, `--text`, `--text-muted`, `--font-display`

---

### Task 1: Hero section

**Files:**
- Create: `components/Hero.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: `<Hero />` — full-viewport hero with name, tagline, and scroll CTA

- [ ] **Step 1: Create `components/Hero.tsx`**

```tsx
export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Glow blob */}
      <div
        className="absolute rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{
          width: '60vw',
          height: '60vw',
          background: 'var(--accent)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
        }}
      />

      <p className="text-sm tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--accent)' }}>
        Developer · Builder · Creator
      </p>

      <h1
        className="text-[clamp(3rem,12vw,9rem)] font-black leading-none mb-6 relative"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
      >
        Amit
        <br />
        <span style={{ color: 'var(--accent)' }}>Elgabsy</span>
      </h1>

      <p
        className="text-lg md:text-xl max-w-xl mb-10 leading-relaxed"
        style={{ color: 'var(--text-muted)' }}
      >
        I build things that feel as good as they look.
        <br />
        Full-stack developer obsessed with bold ideas.
      </p>

      <a
        href="#projects"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all hover:scale-105 active:scale-95"
        style={{ background: 'var(--accent)', color: '#000' }}
      >
        See My Work ↓
      </a>
    </section>
  )
}
```

- [ ] **Step 2: Update `app/page.tsx`**

```tsx
import Hero from '@/components/Hero'

export default function Home() {
  return (
    <>
      <Hero />
    </>
  )
}
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Full-screen dark hero with name, tagline, and cyan CTA button should be visible.

- [ ] **Step 4: Commit**

```bash
git add components/Hero.tsx app/page.tsx && \
git commit -m "feat: add Hero section"
```

---

### Task 2: About / Strengths section

**Files:**
- Create: `components/About.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: `<About />` — bio paragraph + strengths grid

- [ ] **Step 1: Create `components/About.tsx`**

```tsx
const strengths = [
  { emoji: '⚡', title: 'Fast Learner', desc: 'New stack? I'm shipping in days, not weeks.' },
  { emoji: '🎨', title: 'Design Sense', desc: 'I care about how things look AND how they work.' },
  { emoji: '🤖', title: 'AI Integration', desc: 'Building with LLMs before it was cool.' },
  { emoji: '🔧', title: 'Full-Stack', desc: 'From database schema to pixel-perfect UI.' },
  { emoji: '🚀', title: 'Ships Fast', desc: 'Working software over perfect architecture.' },
  { emoji: '💡', title: 'Creative Problem Solver', desc: 'I find the elegant solution, not the obvious one.' },
]

export default function About() {
  return (
    <section id="about" className="py-32 px-6 max-w-5xl mx-auto">
      <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--accent)' }}>
        About Me
      </p>
      <h2
        className="text-4xl md:text-6xl font-black mb-8"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
      >
        Who I Am
      </h2>
      <p className="text-lg leading-relaxed max-w-2xl mb-20" style={{ color: 'var(--text-muted)' }}>
        I'm Amit — a developer who loves building things that push boundaries.
        I combine technical depth with a sharp eye for design, and I'm
        obsessed with using AI to build smarter, faster products.
        When I'm not coding, I'm exploring new tools, new ideas, and new ways
        to make software that feels alive.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {strengths.map(s => (
          <div
            key={s.title}
            className="rounded-2xl p-6 transition-transform hover:-translate-y-1"
            style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="text-3xl mb-3">{s.emoji}</div>
            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text)' }}>{s.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add `<About />` to `app/page.tsx`**

```tsx
import Hero from '@/components/Hero'
import About from '@/components/About'

export default function Home() {
  return (
    <>
      <Hero />
      <About />
    </>
  )
}
```

- [ ] **Step 3: Verify in browser**

Scroll past the Hero — you should see the About section with the strengths grid.

- [ ] **Step 4: Commit**

```bash
git add components/About.tsx app/page.tsx && \
git commit -m "feat: add About and Strengths section"
```

---

### Task 3: Sample project MDX file

**Files:**
- Create: `content/projects/personal-website.mdx`

**Interfaces:**
- Produces: one `Project` object returned by `getProjects()` from `lib/content.ts`

- [ ] **Step 1: Create `content/projects/personal-website.mdx`**

```mdx
---
title: Personal Portfolio Website
description: My own portfolio site built with Next.js, featuring a custom water-photography font and AI-generated blog posts via Groq.
tech: [Next.js, TypeScript, Tailwind CSS, Groq, Vercel]
highlights:
  - Custom font made from water photographs
  - AI auto-generates blog posts when new projects are added
  - Live GitHub activity feed
  - Bold creative design
github: https://github.com/amitelgabsy/personal-website
live: https://amitelgabsy.vercel.app
date: "2026-06-29"
---

Building my portfolio was a project in itself. I wanted something that didn't look like every other dev portfolio — so I made a custom font from water photographs and wired up Groq to write blog posts automatically when I publish new projects.
```

- [ ] **Step 2: Verify `getProjects()` returns it**

Create a temporary test file `lib/__test-content.ts`:

```ts
import { getProjects } from './content'
getProjects().then(projects => {
  console.log('Projects found:', projects.length)
  console.log('First project:', projects[0]?.title)
})
```

Run:

```bash
npx tsx lib/__test-content.ts
```

Expected:
```
Projects found: 1
First project: Personal Portfolio Website
```

Delete the test file:

```bash
rm lib/__test-content.ts
```

- [ ] **Step 3: Commit**

```bash
git add content/projects/ && \
git commit -m "feat: add sample project MDX file"
```

---

### Task 4: Projects section

**Files:**
- Create: `components/ProjectCard.tsx`
- Create: `components/Projects.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `Project` type and `getProjects()` from `lib/content.ts`
- Produces: `<Projects />` — grid of project cards

- [ ] **Step 1: Create `components/ProjectCard.tsx`**

```tsx
import type { Project } from '@/lib/content'
import Link from 'next/link'

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      className="rounded-2xl p-6 flex flex-col gap-4 transition-transform hover:-translate-y-1"
      style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
        {project.title}
      </h3>
      <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-muted)' }}>
        {project.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {project.tech.map(t => (
          <span
            key={t}
            className="text-xs px-3 py-1 rounded-full"
            style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent)' }}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="flex gap-4">
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            GitHub ↗
          </a>
        )}
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            Live ↗
          </a>
        )}
        <Link
          href={`/blog/${project.slug}-post`}
          className="text-sm font-medium hover:underline ml-auto"
          style={{ color: 'var(--text-muted)' }}
        >
          Read post →
        </Link>
      </div>
    </article>
  )
}
```

- [ ] **Step 2: Create `components/Projects.tsx`**

```tsx
import { getProjects } from '@/lib/content'
import ProjectCard from './ProjectCard'

export default async function Projects() {
  const projects = await getProjects()

  return (
    <section id="projects" className="py-32 px-6 max-w-5xl mx-auto">
      <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--accent)' }}>
        Work
      </p>
      <h2
        className="text-4xl md:text-6xl font-black mb-16"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
      >
        Projects
      </h2>
      {projects.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No projects yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map(p => <ProjectCard key={p.slug} project={p} />)}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 3: Add `<Projects />` to `app/page.tsx`**

```tsx
import Hero from '@/components/Hero'
import About from '@/components/About'
import Projects from '@/components/Projects'

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
    </>
  )
}
```

- [ ] **Step 4: Verify in browser**

Scroll to the Projects section — the sample project card should appear with tech tags and links.

- [ ] **Step 5: Commit**

```bash
git add components/ProjectCard.tsx components/Projects.tsx app/page.tsx && \
git commit -m "feat: add Projects section with MDX-powered project cards"
```

---

### Task 5: Contact section

**Files:**
- Create: `components/Contact.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: `<Contact />` — social links and email CTA

- [ ] **Step 1: Create `components/Contact.tsx`**

```tsx
const links = [
  { label: 'GitHub', href: 'https://github.com/amitelgabsy' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/amitelgabsy' },
  { label: 'Email', href: 'mailto:amit.elgabsy@gmail.com' },
]

export default function Contact() {
  return (
    <section id="contact" className="py-32 px-6 text-center max-w-3xl mx-auto">
      <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--accent)' }}>
        Get In Touch
      </p>
      <h2
        className="text-4xl md:text-6xl font-black mb-6"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
      >
        Let's Build
        <br />
        <span style={{ color: 'var(--accent)' }}>Something.</span>
      </h2>
      <p className="text-lg mb-12" style={{ color: 'var(--text-muted)' }}>
        Open to freelance projects, collaborations, and full-time roles.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {links.map(l => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 active:scale-95"
            style={
              l.label === 'Email'
                ? { background: 'var(--accent)', color: '#000' }
                : { border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text)' }
            }
          >
            {l.label}
          </a>
        ))}
      </div>
      <p className="mt-20 text-xs" style={{ color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} Amit Elgabsy. Built with Next.js & bold ideas.
      </p>
    </section>
  )
}
```

- [ ] **Step 2: Add `<Contact />` to `app/page.tsx`**

```tsx
import Hero from '@/components/Hero'
import About from '@/components/About'
import Projects from '@/components/Projects'
import Contact from '@/components/Contact'

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Contact />
    </>
  )
}
```

- [ ] **Step 3: Verify in browser**

Scroll to the bottom — Contact section with GitHub, LinkedIn, and Email buttons should appear.

- [ ] **Step 4: Run build to verify no errors**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript or lint errors.

- [ ] **Step 5: Commit**

```bash
git add components/Contact.tsx app/page.tsx && \
git commit -m "feat: add Contact section — phase 3 complete"
```
