---
name: Radical Precision & Rationalist Monolith
colors:
  surface: '#fbf8ff'
  surface-dim: '#dad9e3'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fd'
  surface-container: '#eeedf7'
  surface-container-high: '#e8e7f1'
  surface-container-highest: '#e3e1ec'
  on-surface: '#1a1b22'
  on-surface-variant: '#46464b'
  inverse-surface: '#2f3038'
  inverse-on-surface: '#f1effa'
  outline: '#77777b'
  outline-variant: '#c7c6cb'
  surface-tint: '#5e5e62'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1f'
  on-primary-container: '#848387'
  inverse-primary: '#c7c6ca'
  secondary: '#b32100'
  on-secondary: '#ffffff'
  secondary-container: '#e02c00'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1f1b16'
  on-tertiary-container: '#8a827c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3e2e6'
  primary-fixed-dim: '#c7c6ca'
  on-primary-fixed: '#1b1b1f'
  on-primary-fixed-variant: '#46464a'
  secondary-fixed: '#ffdad3'
  secondary-fixed-dim: '#ffb4a4'
  on-secondary-fixed: '#3e0500'
  on-secondary-fixed-variant: '#8c1800'
  tertiary-fixed: '#ebe1d9'
  tertiary-fixed-dim: '#cec5be'
  on-tertiary-fixed: '#1f1b16'
  on-tertiary-fixed-variant: '#4c4640'
  background: '#fbf8ff'
  on-background: '#1a1b22'
  surface-variant: '#e3e1ec'
typography:
  display:
    fontFamily: Inter
    fontSize: 4.5rem
    fontWeight: '800'
    lineHeight: 4.5rem
    letterSpacing: -0.04em
  display-mobile:
    fontFamily: Inter
    fontSize: 2.75rem
    fontWeight: '800'
    lineHeight: 2.875rem
    letterSpacing: -0.035em
  headline-lg:
    fontFamily: Inter
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: 3.25rem
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.025em
  headline-md:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.375rem
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Inter
    fontSize: 1.375rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: 0em
  label-index:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.08em
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.125rem
    letterSpacing: 0.02em
  caption:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.01em
spacing:
  gutter: 1.5rem
  gutter-desktop: 2rem
  margin: 1.25rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 3rem
---

## Brand & Style

This design system translates the principles of the mid-century International Typographic Style (Swiss Style) into a contemporary digital publishing and portfolio environment. Every element exists as a logical consequence of a mathematical framework. The visual tone is authoritative, objective, cerebral, and unyielding—communicating intellectual clarity and engineering precision over decorative embellishment.

### Target Audience & Tone
Engineers, system architects, industrial designers, and rationalist critics. The interface rejects ephemeral digital trends (glassmorphism, saturated neon gradients, pill buttons, decorative drop shadows) in favor of structural order, strict modularity, structural 1px hairline rules, and asymmetric visual balance. Whitespace is treated as active architectural space rather than empty canvas.

## Colors

The palette is rigorously calibrated around high-contrast monochrome values with a single functional accent:

- **Primary Black (`#0E0F12`)**: Deep carbon ink, serving as the dominant color for structural grids, heavy typographic displays, and high-impact framing.
- **Pure Canvas White (`#FFFFFF`)**: High-luminance paper base providing sharp, absolute contrast against ink elements.
- **Signal Red / Orange (`#FF3300`)**: The definitive Swiss accent. Strictly functional; reserved exclusively for active states, critical status indicators, index numerals, and anchor points. Never applied across large decorative fills.
- **Cool Neutral Grays**:
  - `Surface Alt / Cool Tint`: `#F5F6F8` (used for secondary modular panels and editorial meta blocks).
  - `Grid Line / Hairline Rule`: `#E5E7EB` (neutral layout demarcations and table dividers).
  - `Meta / Secondary Text`: `#71717A` (used for running heads, tabular indexes, and publication credits).

## Typography

Typography is the foundational structure of the product. The primary typeface is **Inter**, configured for neutral, utilitarian grotesque clarity reminiscent of Max Miedinger's Neue Haas Grotesk. Display typography uses tight tracking and solid leading to create dense, architectural word-blocks.

Meta-information, tabular indexes, footnotes, and publication registries use **JetBrains Mono**. All index numbers (`01`, `02.A`, `REF-84`) are set in uppercase, tracked monospace to clearly separate content from taxonomic infrastructure.

## Layout & Spacing

Layouts are governed by an asymmetric 12-column modular grid on desktop (8-column on tablet, 4-column on mobile). Margins and gutters act as strict coordinate axes.

- **Grid Alignment**: Grid boundaries are visually demarcated using persistent 1px hairline rules (`#E5E7EB` or `#0E0F12`), creating explicit module containers.
- **Asymmetric Composition**: Text and visual modules align to alternating column spreads (e.g., 4 columns for metadata/index, 8 columns for discourse and project visual artifacts).
- **Rhythm & Padding**: Vertical progression operates on a consistent 8px mathematical baseline. Padding within containers is uniform and square; content hugs the internal grid lines with systematic discipline.

## Elevation & Depth

This design system avoids z-plane elevation through shadows, blurs, or skeuomorphic layering. The interface is strictly planar.

- **Zero Shadows**: No `box-shadow` or ambient blur properties exist within the system.
- **Hairline Rules**: Depth and separation are produced solely via 1px crisp, non-retina-blurred borders in `#E5E7EB` or `#0E0F12`.
- **Tonal Contrast**: Hierarchy is established using stark binary shifts—solid `#0E0F12` inverted blocks against `#FFFFFF` or subtle neutral backdrops (`#F5F6F8`).
- **Active Focus**: Interactive surfaces shift states via inversion (background switches from `#FFFFFF` to `#0E0F12`, text from `#0E0F12` to `#FFFFFF`) or a sharp 1px focus ring of `#FF3300`.

## Shapes

The geometric form factor is completely unyielding:
- **`roundedness: 0` (Sharp)**: All interactive controls, cards, modals, media containers, and tags feature an absolute 0px border-radius.
- **Razor Geometry**: Curves are intentionally omitted. Every element resolves into clean 90-degree right angles, reinforcing the mechanical, industrial print tradition of Swiss typography.

## Components

### Buttons
- **Primary**: Solid `#0E0F12` fill, `#FFFFFF` text, 0px border-radius. Monospace or uppercase grotesque tracking. Hover state triggers a direct background inversion to `#FF3300` with text remaining `#FFFFFF`.
- **Secondary**: 1px solid `#0E0F12` outline, `#0E0F12` text, transparent background. Hover state fills solid `#0E0F12` with `#FFFFFF` text.
- **Text / Inline Action**: `#0E0F12` text accompanied by a terminal index arrow (`→`), transitioning to `#FF3300` on hover with a 2px horizontal translation.

### Form Controls (Inputs, Checkboxes & Radio Buttons)
- **Input Fields**: 1px `#0E0F12` bottom border only (or full 1px box). Crisp rectangular frame, no background shading. Input text set in `body-md`; labels set in tracked `label-index` above the field. Focused state applies a 2px solid `#FF3300` rule without glow.
- **Checkboxes & Radios**: Strictly square (radios remain square to honor rationalist geometry). Checkbox selected state is filled `#0E0F12` with a stark geometric white crosshair or inner square. Focus ring is 1px offset `#FF3300`.

### Cards & Modular Containers
- Framed by a 1px solid `#E5E7EB` border. Headers feature an index tag (e.g., `[ 01 / ARCHIVE ]`) set in `label-index` with `#71717A`. No hover elevation shadows; hover triggers a 1px border shift to `#0E0F12` or an inner text color change.

### Chips & Badges
- Sharp rectangular enclosures. 1px solid `#E5E7EB` or `#0E0F12`. Typeface is `JetBrains Mono` (`label-index`), uppercase with leading slash or index notation (e.g., `/RELEASE-04`). In active states, background becomes `#FF3300` with `#FFFFFF` type.

### Lists & Data Tables
- Continuous horizontal 1px hairline rules (`#E5E7EB`) separating rows. Monospace index identifiers in the left column. Numerical data is right-aligned and set using tabular figures (`tnum`). Hovering across a row highlights the background in `#F5F6F8`.