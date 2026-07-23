# Toggl 2.0 — Prototype Shell

A working replica of the Toggl Focus app shell, built from tokens measured out of the live product. **This is the canvas. Build your feature into it — don't rebuild it.**

No build step, no npm, no Node. Just files.

---

## Files

| File | What it is | Touch it? |
|---|---|---|
| `index.html` | Entry point | Rarely |
| `styles.css` | Real Toggl tokens + component CSS | Add to the bottom |
| `data.js` | All mock data + formatting helpers | **Yes — this is your data layer** |
| `icons.js` | 60+ icons matching Toggl's stroke weight | Add as needed |
| `app.js` | The shell: rail, sidebar, topbar, 5 views, task drawer, AI popover | **Add your feature here** |

---

## What already works

- **Sidebar navigation** between Tasks, Calendar, Timeline, Reports, Projects
- **Tasks — List view** with real columns, hover, click-to-open
- **Tasks — Board view** grouped by status, with metadata chips
- **Calendar** with a week grid and positioned time entries from real mock data
- **Timeline** with per-day capacity bars and over-capacity warnings
- **Reports** with KPI cards and a line chart
- **Projects** with budget progress bars
- **Task detail drawer** — slides in, Esc to close, all eight property rows
- **Running timer** in the topbar, ticking, start/stop works
- **AI sparkle popover** — the real three options, and generating tasks actually adds them (with `estH: null`, exactly like the real product)
- Toasts, tooltips, empty states, reduced-motion support

## Deliberately not built
Search, filters, group-by, sort, settings, members, approvals, time off. These are dead controls — the brief explicitly allows that. Don't waste clock time on them.

---

## The mock data

`data.js` holds a freelance product designer with ~6 months of history. It is built to make one thing visible:

- `history` — 20 finished tasks, tagged by `kind`, each with **estimate vs actual**
- The variance is deliberate and patterned:
  - `revisions` → estimated ~2h, actually took **8–12h** every single time
  - `research` → consistently **over**-estimated
  - `wireframes` → consistently ~1.6× over
- `tasks` t1–t6 are marked `aiGenerated: true` and have `estH: null` — they land bare, like the real product
- `historyFor(kind)` returns count, average estimate, average actual, median, and ratio

If your feature is about learning from past time data, the shape is already there. If it isn't, `data.js` is easy to rewrite.

---

## Conventions to keep (this is the "attention to detail" score)

- `rounded` = **8px**, not 4px
- Body text is 14px at weight **500**
- Accent is `#a84c9d`
- Unset values render as the literal word **`Empty`** in `--fg-tertiary`
- Durations: `1h 41m` · Dates: `Jul 21` · Timer: `0:14:57`
- Sentence case everywhere. Contractions. No emoji in prose, no exclamation marks.
- Toolbar controls show their active value in accent: `Group by: Status`
- Premium features get a ★

Full spec in `../02-design-system/components.md`.

---

## Adding your feature

1. Add data to `data.js`
2. Add a component near the bottom of `app.js`, above `App()`
3. Mount it — there's a marked spot in `TaskDrawer`, or add a new view
4. Add styles at the bottom of `styles.css`
5. Re-drag the folder to Netlify

Keep it to **one thing done completely.** Narrow and finished beats broad and rough.
