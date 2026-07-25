---
name: responsive-hero-table
description: >
  Apply the codebase's established responsive-table pattern to any table
  component in the Superheroes app that displays per-hero data (stats, images,
  attributes). The pattern hides verbose columns on narrow screens and replaces
  them with a single summary column.

  Use this skill whenever the user asks to make a table responsive, add mobile
  support to a table, hide columns on small screens, or add a summary column
  for narrow viewports — even if they don't use those exact words. Also invoke
  proactively when a new table component is being added and mobile layout
  hasn't been considered.
---

# Responsive Hero Table

This codebase has an established responsive-table pattern already wired into
`App.css`. Applying it to a new table requires no new CSS — just the right
class names on the right elements, and a summary value for the collapsed view.

## The Pattern

Two CSS utility classes control column visibility:

| Class | Default | Under 600px |
|-------|---------|-------------|
| `hide-sm` | visible | `display: none` |
| `show-sm` | `display: none` | `display: table-cell` |

Apply `hide-sm` to every `<th>` and `<td>` that should disappear on narrow
screens. Add one new column with `show-sm` that renders a compact summary to
replace everything that was hidden.

The breakpoint is **600px** (not 768px — that breakpoint only handles layout
and compare-view tweaks).

## Applying to a Table Component

### Step 1 — Mark columns to hide

Add `hide-sm` to the `<th>` and every corresponding `<td>` for:
- Image/avatar columns
- Individual stat columns (intelligence, strength, speed, durability, power, combat)
- Any other verbose columns that won't fit a phone screen

```jsx
<th className="hide-sm">Image</th>
<th className="stat-col hide-sm">Intelligence</th>
// ...
<td className="img-cell hide-sm">...</td>
<td className="stat-cell hide-sm">...</td>
```

### Step 2 — Add the summary column

Append a new `<th>` and `<td>` pair with `show-sm`. This column must be the
last one so it slots cleanly after the always-visible columns (checkbox, ID,
name).

```jsx
// In <thead>
<th className="stat-col show-sm">Best Stat</th>

// In each <tbody> row
<td className="stat-cell best-stat-cell show-sm">
  {(() => {
    const b = getBestStat(hero);
    return (
      <>
        <span className="best-stat-name">{b.name}</span>
        <span className="best-stat-val">{b.value}</span>
      </>
    );
  })()}
</td>
```

### Step 3 — Import getBestStat

`getBestStat` is already defined in `frontend/src/utils/heroStats.js`. Import
it at the top of the component file:

```js
import { getBestStat } from '../utils/heroStats';
```

`getBestStat(hero)` returns `{ name: string, value: number }` — the stat name
and its numeric value, picked by highest value across all six powerstats.

## CSS Classes Already in App.css

These styles exist globally — do not redefine them:

```css
/* show-sm hidden by default */
thead th.show-sm, td.show-sm { display: none; }

/* 600px breakpoint */
@media (max-width: 600px) {
  thead th.hide-sm, td.hide-sm { display: none; }
  thead th.show-sm, td.show-sm { display: table-cell; }
}

/* Best stat cell layout */
.best-stat-cell  { text-align: center; }
.best-stat-name  { display: block; font-size: 0.7rem; text-transform: capitalize; color: var(--text-dim); }
.best-stat-val   { display: block; font-size: 0.9rem; font-weight: 700; color: var(--accent); }
```

## When the Summary Isn't "Best Stat"

For tables where powerstats aren't the right summary (e.g., a table of teams
or items), write an inline derivation instead of using `getBestStat`. The
`show-sm` class and two-span stacked layout still apply — only the value
computation changes.

## Checklist

- [ ] Every hidden `<th>` has `hide-sm`
- [ ] Every hidden `<td>` in every row has `hide-sm` (easy to miss if added to header but not body)
- [ ] One `show-sm` column added as the last column
- [ ] `getBestStat` imported if used
- [ ] No new CSS added (all styles already exist in App.css)
- [ ] `colSpan` on state rows (loading/error/empty) updated to match the new total column count
