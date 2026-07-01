# AegisAgent — Figma Screen Generator

A Figma plugin that builds **all 13 AegisAgent screens** as native, editable Figma
frames, using the same dark-theme design tokens, type scale, and layouts as the
React app.

## What it creates

One frame per screen, laid out in a 4-across grid on the current page:

1. Login · 2. Onboarding · 3. Dashboard · 4. Agents · 5. Agent Detail ·
6. Policy Studio · 7. Policy Editor · 8. Red Team · 9. Compliance ·
10. Shadow Radar · 11. Review Queue · 12. Settings · 13. Trace Viewer

Everything is real Figma layers (frames, rectangles, text, ellipses) — fully
editable, not images.

## How to run it (≈30 seconds)

1. Open the **Figma desktop app** (plugins only run there, not in the browser).
2. Open the file you want the screens in (or any file).
3. Menu → **Plugins → Development → Import plugin from manifest…**
4. Select **`figma-plugin/manifest.json`** from this project.
5. Run it: **Plugins → Development → AegisAgent Screen Generator**.
6. The 13 frames appear on the canvas and the view zooms to fit them.

To re-run after edits, just pick it again from the Development menu.

## Notes

- Fonts used are **Inter** and **Roboto Mono**, both bundled with Figma (the React
  app uses Geist; Inter is the closest always-available substitute).
- A few decorative glyphs (icons drawn as symbols) may render as placeholder boxes
  if a font lacks them — swap them for Figma components/icons as you like.
- Colors come straight from `src/app/globals.css` (dark theme): navy `#070b16`,
  surface `#0c1322`, accent teal `#2dd4bf`, allow `#34d399`, block `#f43f5e`,
  review `#f59e0b`.
