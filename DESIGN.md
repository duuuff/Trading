# MarketLens Design System

> Dual-theme trading interface: **dark mode** inspired by Binance (void-black + yellow), **light mode** inspired by Finary (clean white + blue).
> Monospace numerics, high information density, CSS variable theming.

---

## 1. Visual Theme & Atmosphere

**Mood:** Professional, precise, trustworthy. The UI recedes — data takes center stage.
**Density:** High. Every pixel earns its place. Compact spacing, no decorative whitespace.
**Philosophy:** Terminal meets fintech. Clean enough for institutions, fast enough for traders.
**Reference:** Kraken (data density), Linear (precision), Vercel (restraint).

---

## 2. Color Palette & Roles

### Dark mode — Binance inspired

| Token | Hex | Role |
|-------|-----|------|
| `bg` | `#0B0E11` | Page background — Binance void |
| `surface` | `#1E2026` | Sidebars, elevated panels |
| `card` | `#252930` | Cards, modals |
| `border` | `#2B2F36` | Dividers, outlines |
| `primary` | `#F0B90B` | Binance yellow — CTAs, active states |
| `primary-dark` | `#D4A107` | Hover yellow |
| `primary-fg` | `#0B0E11` | Text ON yellow buttons (dark) |
| `success` | `#0ECB81` | Binance green — gains, bullish |
| `danger` | `#F6465D` | Binance red — losses, bearish |
| `text-primary` | `#EAECEF` | Body text |
| `text-secondary` | `#848E9C` | Labels, subtitles |
| `text-muted` | `#474D57` | Placeholders, disabled |

### Light mode — Finary inspired

| Token | Hex | Role |
|-------|-----|------|
| `bg` | `#F3F4F6` | Page background — soft gray |
| `surface` | `#FFFFFF` | White panels |
| `card` | `#FFFFFF` | White cards |
| `border` | `#E5E7EB` | Subtle dividers |
| `primary` | `#2563EB` | Finary blue — CTAs, links |
| `primary-dark` | `#1D4ED8` | Hover blue |
| `primary-fg` | `#FFFFFF` | White text on blue buttons |
| `success` | `#059669` | Emerald — gains |
| `danger` | `#DC2626` | Red — losses |
| `text-primary` | `#111827` | Near-black body text |
| `text-secondary` | `#4B5563` | Secondary labels |
| `text-muted` | `#9CA3AF` | Placeholders |

**Semantic rules (both themes):**
- Green = gains, bullish events, subscribed
- Red = losses, bearish events, errors
- Primary = all interactive elements
- `primary-fg` = always the text color ON primary buttons

---

## 3. Typography Rules

| Element | Font | Size | Weight | Notes |
|---------|------|------|--------|-------|
| Page title | Inter | 18px | 600 | Tight tracking |
| Section heading | Inter | 13px | 600 | Uppercase, 0.08em tracking |
| Body | Inter | 14px | 400 | Line height 1.5 |
| Small / label | Inter | 12px | 400–500 | |
| Micro / badge | Inter | 10px | 500 | Uppercase caps |
| Price / ticker | JetBrains Mono | 14–18px | 600 | Always monospace |
| Symbol | JetBrains Mono | 13px | 700 | Bold, uppercase |

**Rules:**
- All numbers, prices, percentages, tickers → `font-mono`
- Section labels → `uppercase tracking-wider text-text-muted text-xs`
- Never use font-weight below 400 for legibility on dark backgrounds

---

## 4. Component Stylings

### Buttons

```
Primary:   bg-primary text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-primary-dark active:scale-95
Ghost:     border border-border text-text-secondary bg-transparent rounded-xl hover:bg-card hover:text-text-primary
Danger:    bg-danger/10 text-danger border border-danger/30 rounded-xl
Disabled:  opacity-40 cursor-not-allowed
```

### Cards

```
Base:       bg-card border border-border rounded-2xl
Interactive: hover:border-primary/20 active:border-primary/40 transition-colors cursor-pointer
Dashed:     border-dashed (empty states only)
```

### Inputs

```
bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary
focus: border-primary outline-none ring-0
placeholder: text-text-muted
```

### Badges

```
Bullish:  bg-success/10 text-success border border-success/20 rounded-full px-2 py-0.5 text-[10px] font-medium
Bearish:  bg-danger/10  text-danger  border border-danger/20  rounded-full px-2 py-0.5 text-[10px] font-medium
Neutral:  bg-surface    text-text-secondary border border-border rounded-full
Asset type: inline badge, monospace, very subtle
```

### Navigation (Mobile — Bottom Bar)

```
Height: 56px
Items: icon (20px) + label (10px), flex-col, flex-1
Active: text-primary
Inactive: text-text-muted hover:text-text-secondary
```

### Navigation (Desktop — Sidebar)

```
Width: 224px (w-56)
Items: icon (16px) + label, flex-row, gap-3, rounded-xl px-3 py-2.5
Active: bg-primary/10 text-primary
Inactive: text-text-muted hover:bg-card hover:text-text-primary
```

### Chart

```
Background: #07070f (matches bg)
Line: indigo #6366f1, lineWidth 2, LineType.Curved
Area fill: rgba(99,102,241,0.15) → transparent
Grid lines: #1e1e2e (very subtle)
Crosshair: primary color, dashed
Event markers: ↑ success green, ↓ danger red, — neutral slate
```

---

## 5. Layout Principles

**Spacing scale:** 4px base unit — use multiples: 4, 8, 12, 16, 20, 24, 32, 40, 48
**Page padding:** 16px horizontal on mobile, 24px on desktop
**Card gap:** 8px between cards in lists
**Section gap:** 24px between major sections
**Border radius:** `rounded-xl` (12px) for inputs/buttons, `rounded-2xl` (16px) for cards

**Mobile:** Single column, max-w-lg (512px) centered
**Desktop:** Sidebar 224px fixed + fluid content up to max-w-5xl

---

## 6. Depth & Elevation

```
Level 0 (page bg):  #07070f
Level 1 (surface):  #0f0f1a  — sidebars, nav
Level 2 (card):     #16161f  — content cards, modals
Level 3 (overlay):  #1e1e2e  — dropdowns, tooltips
```

No box shadows — elevation is conveyed through background lightness only.
Borders (`border-border`) define containment, not depth.

---

## 7. Do's and Don'ts

**Do:**
- Use monospace for all numeric data (prices, percentages, timestamps)
- Keep sentiment colors semantic: green = good, red = bad, always
- Compress section labels: uppercase + tracking + muted color
- Use `border-dashed` only for empty/placeholder states
- Show loading skeletons that match the shape of the actual content

**Don't:**
- Don't use colored backgrounds for primary content — save color for accents
- Don't mix rounded-full and rounded-xl on the same component type
- Don't use opacity hacks for disabled states — use explicit muted colors
- Don't center-align data tables or lists
- Don't use more than 3 font weights in a single view

---

## 8. Responsive Behavior

| Breakpoint | Layout | Navigation |
|------------|--------|------------|
| < 768px (mobile) | Single column, max-w-lg | Bottom tab bar |
| ≥ 768px (desktop) | Sidebar + fluid content | Left sidebar, 224px |

**Toggle:** Users can manually switch between modes via the header button (persisted in localStorage).
**Touch targets:** Minimum 44×44px on mobile.
**Chart height:** 320px on mobile, can expand on desktop.

---

## 9. Agent Prompt Guide

**Quick color reference:**
```
--bg:           #07070f
--surface:      #0f0f1a
--card:         #16161f
--border:       #252535
--primary:      #6366f1
--success:      #10b981
--danger:       #ef4444
--text:         #f1f5f9
--text-muted:   #3f3f5a
```

**Tailwind class cheatsheet:**
```
Dark card:        card p-4
Primary button:   btn-primary
Ghost button:     btn-ghost
Section label:    text-xs font-semibold text-text-muted uppercase tracking-wider
Ticker/price:     font-mono font-semibold
Bullish badge:    badge-bullish
Bearish badge:    badge-bearish
Skeleton pulse:   bg-border/60 rounded animate-pulse
```

**Ready-to-use prompts:**
- "Build a component using the MarketLens DESIGN.md — dark card, indigo accent, monospace prices"
- "Add a new page following the DESIGN.md layout principles — 16px padding, 8px card gaps, section labels in uppercase muted text"
- "Style this data table per the DESIGN.md — no shadows, border-only elevation, monospace numbers"
