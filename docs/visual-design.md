# Visual Design

The visual language for BOEE: a calm, premium "engineering workbench". Every
value on screen must stay trustworthy; motion and depth are there to make the
numbers tangible, never to decorate over them.

## Principles

1. **Information first.** Vibrancy never competes with the estimate. Numbers
   keep strong contrast and tabular alignment.
2. **Hierarchy through depth.** Dark, layered surfaces with restrained shadows
   separate concerns (page → section → card → control).
3. **Purposeful motion.** Spring-based, native-driven, short. Motion clarifies
   cause and effect (a value changed, a node is selected). No infinite
   decoration on content.
4. **Graceful degradation.** Respect reduced-motion. Every critical action has a
   non-visual path. The scene always has an accessible text equivalent.
5. **One source of truth.** Color, spacing, type and motion live in
   `src/constants/theme.ts`. The scene is a projection of core metrics
   (`src/core/scene.ts`), never its own model.

## Color

Dark-first. Roles, not raw hex, are used by components.

| Role            | Token                                                   | Use                            |
| --------------- | ------------------------------------------------------- | ------------------------------ |
| Page            | `colors.background`                                     | app canvas                     |
| Section surface | `colors.surface`                                        | grouped panels                 |
| Card            | `colors.card` / `colors.cardRaised`                     | elevated content               |
| Text            | `colors.text` / `colors.textMuted` / `colors.textFaint` | primary / secondary / tertiary |
| Accent          | `colors.primary` (electric blue)                        | actions, active state, brand   |
| Accent 2        | `colors.accent` (cyan)                                  | data flow, cache               |
| Accent 3        | `colors.accentViolet`                                   | secondary highlights           |
| Status          | `colors.success` / `warning` / `danger` / `info`        | pressure and severity          |
| Borders         | `colors.border` / `colors.borderStrong`                 | hairlines, focus               |

Pressure mapping: `calm → success`, `watch → warning`, `critical → danger`.

## Typography

`typography` scale: `display`, `title`, `heading`, `body`, `bodyStrong`,
`label`, `caption`, `metric`, `metricLarge`. Labels are uppercase with letter
spacing; metrics are bold and use tabular figures where available.

## Spacing & radius

`spacing` (xs–xl) is a 4-based scale. `radius` runs `sm → xl → pill`. Prefer the
smallest radius that reads as intentional; use `pill` for chips and toggles.

## Elevation

`elevation.card` and `elevation.raised` are the only shadow recipes. Depth is
conveyed primarily by surface lightness; shadows are subtle and warm-free.

## Motion

Tokens live in `motion`:

- Durations: `instant 90` → `cinematic 720` ms.
- Easings: `standard`, `decelerate` (enter), `accelerate` (exit).
- Springs: `gentle`, `snappy`, `soft`.

Guidelines:

- Entrance: fade + small upward translate, staggered for lists (`Stagger`).
- Press: spring scale down ~0.97 (`PressableScale`).
- Value change: `AnimatedNumber` settles to the new formatted value; integer
  metrics may count up in bounded steps (ADR-009).
- Scene: idle float on nodes and slow flow along edges; pause when the screen
  is not focused or the app is backgrounded.
- Always honor reduced motion: skip stagger/entrance, snap values immediately.

## The system scene

`SystemScene` renders an interactive 2.5D view of the architecture derived from
the current estimate (traffic → load balancer → app servers → cache/storage).
Nodes carry a pressure ring, a headline metric and citations back to the rules
that fired. Tapping a node opens a native detail panel; the panel shows exactly
the metrics and implications from the text UI.

The renderer sits behind a seam (`SystemScene` → `IsometricScene`) with an
error boundary and a text fallback, so a future `expo-gl` /
`@react-three/fiber` renderer can drop in without touching callers (ADR-007).
