# Phase 6: Polish & Deploy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add scroll animations, a water ripple cursor effect, performance improvements, and deploy to Vercel production.

**Architecture:** Framer Motion handles scroll-triggered fade/slide animations. A canvas-based ripple effect follows the cursor to reinforce the water theme. `next/image` and font preloading are tuned for Core Web Vitals. Final step is `vercel --prod`.

**Tech Stack:** Framer Motion 11, HTML Canvas API (vanilla JS), Next.js built-in image optimization

## Global Constraints
- Animations must respect `prefers-reduced-motion` — wrap all motion with `useReducedMotion()` or CSS `@media (prefers-reduced-motion: reduce)`
- Client components must be explicitly marked `'use client'`
- No animation libraries other than Framer Motion

---

### Task 1: Framer Motion setup and scroll animations

**Files:**
- Create: `components/FadeIn.tsx`
- Modify: `components/Hero.tsx`, `components/About.tsx`, `components/Projects.tsx`, `components/GitHubActivity.tsx`, `components/Contact.tsx`

**Interfaces:**
- Produces: `<FadeIn>` wrapper that fades + slides children in when scrolled into view

- [ ] **Step 1: Install Framer Motion**

```bash
npm install framer-motion
```

- [ ] **Step 2: Create `components/FadeIn.tsx`**

```tsx
'use client'
import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

export default function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 3: Wrap Hero content in FadeIn**

In `components/Hero.tsx`, import `FadeIn` and wrap the tagline, name, subtitle, and CTA button each in their own `<FadeIn delay={0}>`, `<FadeIn delay={0.1}>`, `<FadeIn delay={0.2}>`, `<FadeIn delay={0.3}>` respectively. Leave the glow blob unwrapped.

```tsx
import FadeIn from './FadeIn'

// Inside the JSX, replace the five content elements with:
<FadeIn delay={0}>
  <p className="text-sm tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--accent)' }}>
    Developer · Builder · Creator
  </p>
</FadeIn>
<FadeIn delay={0.1}>
  <h1 className="text-[clamp(3rem,12vw,9rem)] font-black leading-none mb-6 relative"
      style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
    Amit<br /><span style={{ color: 'var(--accent)' }}>Elgabsy</span>
  </h1>
</FadeIn>
<FadeIn delay={0.2}>
  <p className="text-lg md:text-xl max-w-xl mb-10 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
    I build things that feel as good as they look.<br />Full-stack developer obsessed with bold ideas.
  </p>
</FadeIn>
<FadeIn delay={0.3}>
  <a href="#projects" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all hover:scale-105 active:scale-95"
     style={{ background: 'var(--accent)', color: '#000' }}>
    See My Work ↓
  </a>
</FadeIn>
```

- [ ] **Step 4: Wrap About section headings and cards in FadeIn**

In `components/About.tsx`:
- Wrap the `<p>` label, `<h2>`, and bio `<p>` each in `<FadeIn>` with delays 0, 0.1, 0.2
- Wrap each strength card in `<FadeIn delay={i * 0.05}>` using the map index `i`

```tsx
import FadeIn from './FadeIn'

// Strengths map becomes:
{strengths.map((s, i) => (
  <FadeIn key={s.title} delay={i * 0.05}>
    <div className="rounded-2xl p-6 transition-transform hover:-translate-y-1"
         style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="text-3xl mb-3">{s.emoji}</div>
      <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text)' }}>{s.title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
    </div>
  </FadeIn>
))}
```

- [ ] **Step 5: Wrap Projects, GitHubActivity, and Contact section headings in FadeIn**

In each of `components/Projects.tsx`, `components/GitHubActivity.tsx`, `components/Contact.tsx`:
- Wrap the label `<p>` in `<FadeIn delay={0}>`
- Wrap the `<h2>` in `<FadeIn delay={0.1}>`
- Wrap each card/repo in `<FadeIn delay={index * 0.05}>` using the map index

- [ ] **Step 6: Verify animations in browser**

```bash
npm run dev
```

Scroll through the page — each section should fade and slide in smoothly. Open DevTools → Rendering → Enable "Emulate CSS media feature prefers-reduced-motion: reduce" and verify content still appears (no animation, instant show).

- [ ] **Step 7: Commit**

```bash
git add components/ && \
git commit -m "feat: add scroll-triggered fade-in animations with Framer Motion"
```

---

### Task 2: Water ripple cursor effect

**Files:**
- Create: `components/WaterRipple.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: Canvas overlay that draws fading concentric circles at every click position

- [ ] **Step 1: Create `components/WaterRipple.tsx`**

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

type Ripple = { x: number; y: number; r: number; alpha: number }

export default function WaterRipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ripplesRef = useRef<Ripple[]>([])
  const rafRef = useRef<number>(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onClick = (e: MouseEvent) => {
      ripplesRef.current.push({ x: e.clientX, y: e.clientY, r: 0, alpha: 0.6 })
    }
    window.addEventListener('click', onClick)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ripplesRef.current = ripplesRef.current
        .map(rip => ({ ...rip, r: rip.r + 3, alpha: rip.alpha - 0.012 }))
        .filter(rip => rip.alpha > 0)

      for (const rip of ripplesRef.current) {
        ctx.beginPath()
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0, 212, 255, ${rip.alpha})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('click', onClick)
    }
  }, [reduced])

  if (reduced) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden="true"
    />
  )
}
```

- [ ] **Step 2: Add `<WaterRipple />` to `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { GeistSans } from 'geist/font/sans'
import Nav from '@/components/Nav'
import WaterRipple from '@/components/WaterRipple'
import './globals.css'

const waterFont = localFont({
  src: '../public/fonts/water.woff2',
  variable: '--font-water',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: 'Amit Elgabsy — Portfolio',
  description: 'Personal portfolio of Amit Elgabsy — developer, builder, creator.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${waterFont.variable} ${GeistSans.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
        <WaterRipple />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verify ripple effect**

```bash
npm run dev
```

Click anywhere on the page — cyan concentric rings should radiate outward from each click point and fade away.

- [ ] **Step 4: Commit**

```bash
git add components/WaterRipple.tsx app/layout.tsx && \
git commit -m "feat: add water ripple cursor effect on canvas"
```

---

### Task 3: Performance tuning

**Files:**
- Modify: `next.config.ts`
- Modify: `app/layout.tsx` (add meta tags)

**Interfaces:**
- Produces: proper `<meta>` tags for SEO and social sharing; Next.js image domains configured

- [ ] **Step 1: Update `next.config.ts`**

```ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'opengraph.githubassets.com' },
    ],
  },
}

export default config
```

- [ ] **Step 2: Update metadata in `app/layout.tsx`**

Replace the `metadata` export with:

```ts
export const metadata: Metadata = {
  title: {
    default: 'Amit Elgabsy — Portfolio',
    template: '%s — Amit Elgabsy',
  },
  description: 'Full-stack developer building bold, creative products. Portfolio of Amit Elgabsy.',
  openGraph: {
    title: 'Amit Elgabsy — Portfolio',
    description: 'Full-stack developer building bold, creative products.',
    url: 'https://amitelgabsy.vercel.app',
    siteName: 'Amit Elgabsy',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amit Elgabsy — Portfolio',
    description: 'Full-stack developer building bold, creative products.',
  },
  robots: { index: true, follow: true },
}
```

- [ ] **Step 3: Run Lighthouse (optional but recommended)**

```bash
npm run build && npm start
```

Open `http://localhost:3000` in Chrome, open DevTools → Lighthouse → run for Desktop. Target: Performance ≥ 90, Accessibility ≥ 90.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts app/layout.tsx && \
git commit -m "feat: add SEO metadata and image domain config"
```

---

### Task 4: Production deploy

**Files:**
- No new files

**Interfaces:**
- Produces: live production URL on Vercel

- [ ] **Step 1: Add environment variables to Vercel**

```bash
vercel env add GITHUB_USERNAME production
# Enter: amitelgabsy

vercel env add GROQ_API_KEY production
# Enter: your Groq API key
```

- [ ] **Step 2: Deploy to production**

```bash
vercel --prod
```

- [ ] **Step 3: Verify production site**

Open the production URL printed by the CLI. Check:
- [ ] Hero loads with correct name
- [ ] About section visible
- [ ] Projects section shows the sample project
- [ ] GitHub Activity section loads (may take a moment on first request)
- [ ] Blog at `/blog` shows "No posts published yet" (expected until a post is published)
- [ ] Water ripple effect works on click
- [ ] Scroll animations trigger on scroll
- [ ] Nav links scroll to correct sections

- [ ] **Step 4: Final commit**

```bash
git commit --allow-empty -m "chore: phase 6 complete — production deployed"
```
