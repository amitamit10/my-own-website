---
name: letter-quality-review
description: Use when setting up or running the letter quality review process for the water font. Two-phase: first prints a kilocode prompt to generate the agent guide, then (after the guide exists) creates the kilocode agent and prints the inspection prompt.
---

# Letter Quality Review

This skill runs in two phases depending on whether `docs/kilocode-agent-guide.md` exists yet.

## Phase detection

Check if `docs/kilocode-agent-guide.md` exists:
- If it does NOT exist → run Phase 1
- If it DOES exist → run Phase 2

---

## Phase 1 — Get kilocode to document its own agent format

Tell the user to paste this prompt into kilocode (any agent):

```
Write a file at docs/kilocode-agent-guide.md that documents the complete format
for creating a kilocode subagent. Include:
- All YAML frontmatter fields and their valid values
- How permissions work (read, edit, bash, mcp, question)
- How to restrict edit access to specific files
- What goes in the system prompt body
- A minimal working example

Base it on the existing agents in .kilo/agent/ as reference.
```

Then tell the user: "After kilocode writes that file, come back and run /letter-quality-review again."

Stop here. Do not proceed to Phase 2 until the guide exists.

---

## Phase 2 — Create the agent and print the inspection prompt

1. Read `docs/kilocode-agent-guide.md` carefully.

2. Create `.kilo/agent/letter-reviewer.md` following the exact format described in the guide. The agent should:
   - `displayName: Letter Reviewer`
   - `id: letter-reviewer`
   - Have `read: allow` (needs to open PNG files)
   - Only be able to edit `tools/font-maker/letter-notes.md`
   - Have `bash: deny` and `mcp: deny`
   - System prompt: "You are a font quality inspector. Visually inspect letter PNG images and write detailed quality findings to tools/font-maker/letter-notes.md."

3. Print this message to the user:

---

**Agent created.** Now paste this prompt into kilocode with the **Letter Reviewer** agent selected:

```
Inspect every PNG in tools/font-maker/letters/ — all 36 files (A.png through Z.png and 0.png through 9.png).

Open and visually examine each image. For each letter evaluate:
- Background removal: any leftover pixels or halos?
- Shape clarity: is the water letter clearly readable?
- Artifacts: blurs, blobs, disconnected parts, missing strokes?
- Overall usability as a display font glyph

Write ALL findings to tools/font-maker/letter-notes.md using this exact format:

# Letter Quality Notes

## A — PASS
**Problem:** None

---

## B — NEEDS WORK
**Problem:** Halo artifact on bottom-left edge, approx 20px wide
**Manually fixable:** Yes
**How to fix:** Open B.png in an image editor, use eraser at 100% opacity to remove the leftover pixels on the bottom-left edge

---

Cover all 36 letters in order (A-Z then 0-9). For letters that need work, be specific about pixel locations so someone can fix them without seeing the image.
```
