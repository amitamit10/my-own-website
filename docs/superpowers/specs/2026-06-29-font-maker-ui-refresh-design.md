# Font Maker UI Refresh — Design Spec

**Date:** 2026-06-29
**Status:** Approved

## Goal
Refresh the font-maker phone capture UI to feel calmer, more intentional, and visually polished while keeping the single-purpose workflow obvious.

## Design Direction
Clean and minimal.

- Softer near-black background (`#0d0d0f`) replaces pure black for less eye strain in a phone camera workflow.
- Warm off-white text (`#f5f5f7`) and muted secondary grays (`#9aa0a6`, `#5f6368`).
- Accent color is a soft cyan/white (`#e8f7ff`) for the letter and primary capture button.
- Generous vertical spacing and large tap targets optimized for phone use.
- Reset control is a subtle, out-of-the-way pill in the top-right corner.
- Preview screen uses a rounded container for the photo with clear primary/secondary actions.

## Screens

### Capture Screen
- Large letter centered, taking most of the viewport height.
- Short instruction line below the letter.
- Primary "Capture" button at the bottom.
- Progress line below the button.
- "Reset all" as a small corner pill.

### Preview Screen
- Full-width rounded photo preview.
- "Use this photo" (primary) and "Retake" (secondary) buttons side by side below.

## Files to Change
- `tools/font-maker/public/index.html` — update element IDs/classes as needed.
- `tools/font-maker/public/style.css` — complete visual refresh.

## Constraints
- Keep the existing DOM structure and JavaScript logic mostly intact (only add classes/states as needed).
- Do not change server behavior.
