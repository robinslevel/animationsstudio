# Project: CSS Animation Library Web App

## Goal
Build a small, contributor-friendly CSS animation library website with:
- A gallery of animations with clickable previews
- A detail view (modal) with controls
- A playground to tweak settings
- Export options (copy + download CSS)
- Share options (copy a link that restores state)

## Tech constraints
- Use **HTML + CSS + Vanilla JS** (no frameworks).
- No external dependencies unless absolutely necessary.
- Must work by opening `site/index.html` locally (or via a simple static server).
- Keep code modular, readable, and beginner-contributor friendly.

## Folder structure (must follow)
- /site
  - index.html (gallery + modal)
  - playground.html (playground UI)
  - assets/ (optional icons/images)
  - css/
    - styles.css
  - js/
    - app.js (gallery logic)
    - playground.js (playground logic)
    - ui.js (shared UI helpers)
    - export.js (copy/download helpers)
    - share.js (URL state helpers)
- /library
  - animations.json (metadata)
  - animations.css (keyframes + classes)
- /docs
  - CONTRIBUTING.md
  - ANIMATION_TEMPLATE.md

## Data model (library/animations.json)
Store an array of animation objects like:

{
  "id": "fade-in",
  "name": "Fade In",
  "category": "Entrances",
  "tags": ["fade", "opacity"],
  "className": "animlib-fade-in",
  "keyframesName": "animlib-fade-in",
  "defaults": {
    "durationMs": 700,
    "delayMs": 0,
    "easing": "ease-out",
    "iterations": 1,
    "direction": "normal",
    "fillMode": "both"
  }
}

Rules:
- `id` must be unique and URL-safe.
- `className` and `keyframesName` must be namespaced with `animlib-`.
- Keep categories consistent (e.g., Entrances, Exits, Attention, Background, Text).

## CSS rules (library/animations.css)
- Each animation has:
  1) a `@keyframes <keyframesName>`
  2) a class `. <className>` that applies the animation using CSS variables, like:

.animlib-fade-in {
  animation-name: animlib-fade-in;
  animation-duration: var(--animlib-duration, 700ms);
  animation-delay: var(--animlib-delay, 0ms);
  animation-timing-function: var(--animlib-easing, ease-out);
  animation-iteration-count: var(--animlib-iterations, 1);
  animation-direction: var(--animlib-direction, normal);
  animation-fill-mode: var(--animlib-fill, both);
}

## Required pages & behaviors

### 1) Gallery (site/index.html)
- Load `/library/animations.json` and `/library/animations.css`
- Render a card grid:
  - Name, category, tags
  - Demo element inside card
  - Play button that triggers the animation on the demo element
  - Clicking the card opens a modal (detail view)
- Replay must work reliably (even clicking multiple times quickly)

Implementation note:
- Use a "restart animation" technique (reflow trick):
  - remove class -> force reflow -> add class

### 2) Detail modal (on index.html)
- Opens on card click
- Has:
  - Bigger preview element
  - Controls:
    - duration (ms)
    - delay (ms)
    - easing (select + custom)
    - iterations
    - direction
    - fill-mode
  - Buttons:
    - Replay
    - Copy CSS
    - Download CSS
    - Copy Share Link
- Accessibility:
  - ESC closes
  - Focus trap in modal (basic is fine)
  - Focus returns to last clicked card on close

### 3) Playground (site/playground.html)
- Animation picker dropdown
- Preview stage with same controls as modal
- Switch demo element type:
  - Text
  - Button
  - Card
- Export + Share controls included

## Share link behavior (site/js/share.js)
- Encode state in query params:
  - `anim`, `dur`, `delay`, `ease`, `iter`, `dir`, `fill`, `demo`
- When a page loads:
  - If params exist, restore state automatically
- Provide `copyShareLink(state)` helper

Example:
?anim=fade-in&dur=700&delay=0&ease=ease-out&iter=1&dir=normal&fill=both&demo=text

## Export behavior (site/js/export.js)
- Provide functions:
  - `buildAnimationCss(animation)` -> string containing keyframes + class
  - `copyToClipboard(text)`
  - `downloadTextFile(filename, text)`
- Copy should show a toast
- Download should name file `{id}.css`

## prefers-reduced-motion
- If `prefers-reduced-motion: reduce`:
  - Do not autoplay animations
  - Provide a toggle "Allow motion previews" (default off in reduce mode)

## Code quality
- Small functions, clear naming, comments.
- Avoid globals: use modules (plain JS files with exported functions via ES modules).
- Handle fetch errors gracefully with visible UI feedback.
- No dead code, no placeholder TODOs in final implementation.

## Deliverable definition
MVP is done when:
- Gallery loads and previews work
- Modal controls work
- Playground works
- Export works (copy + download)
- Share link restores state
- Works locally without a build step
