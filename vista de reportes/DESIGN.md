---
name: Cinematic Pro Dark
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  on-surface: '#dfe2f1'
  on-surface-variant: '#d8c3ad'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#a08e7a'
  outline-variant: '#534434'
  surface-tint: '#ffb95f'
  primary: '#ffc174'
  on-primary: '#472a00'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#855300'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#54ddfc'
  on-tertiary: '#003640'
  tertiary-container: '#29c1df'
  on-tertiary-container: '#004b58'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#0f131d'
  on-background: '#dfe2f1'
  surface-variant: '#313540'
typography:
  headline-xl:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  headline-sm:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  metric-display:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-xs:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1.5rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers a high-performance, command-center aesthetic tailored for cinema enterprise operations, entertainment management, and high-density executive analytics. It merges modern deep dark mode utility with cinematic ambiance, evoking immersion, surgical precision, and low-light ergonomic comfort. 

The visual style blends **Modern Dark Mode Minimalism** with **Tonal Glass Layers** and **Vibrant Data Emissive Accents**. High-contrast typography on midnight canvas surfaces prioritizes readability during late-hour venue administration and control-room environments. The key emotional response is control, rapid readability, and sophisticated modern authority.

## Colors

The palette is engineered around deep, low-luminance canvas tones paired with luminous status and categorical signals:

- **Canvas & Backgrounds:** The base app background uses `#0B0F19` with sidebars and navigation panels set to `#111827`. Primary structural cards and modular widgets rest on `#161F30` with hover/active interactive tiers using `#1E293B`.
- **Primary Amber (`#F59E0B` / `#D97706`):** Reserved for primary navigation active indicators, prominent primary CTA buttons, filter triggers, and key highlight badges.
- **Categorical & Semantic Spectrum:**
  - **Emerald Green (`#10B981`):** Represents live connectivity (`EN LÍNEA`), financial performance/revenue gains, and primary trend metrics.
  - **Cyan / Sky Blue (`#06B6D4` / `#3B82F6`):** Dedicated to ticketing metrics, admission statistics, and dual-axis chart lines.
  - **Electric Purple (`#8B5CF6` / `#A855F7`):** Represents confectionery/dulcería sales and auxiliary inventory streams.
- **Typography & Neutral Hierarchy:** Primary headers and metric values utilize pure white (`#FFFFFF`). Body copy, table cells, and contextual headers resolve to slate grey (`#E2E8F0` and `#94A3B8`). De-emphasized labels, subtitles, and ghost iconography utilize `#64748B`.
- **Borders & Separators:** Thin, high-clarity structural borders utilize `rgba(255, 255, 255, 0.08)` or `#1E293B` to maintain structure without clutter.

## Typography

The typography strategy leverages **Outfit** for headers, navigational titles, and heavy numeric dashboard readouts to infuse a modern, geometric, cinematic punch. **Plus Jakarta Sans** powers all body copy, table structures, and granular metadata due to its exceptional legibility and optical balance at compact scales on dark OLED/LCD panels.

All section tags and operational badges (e.g., `CU05 • DATOS REALES`, `MÓDULOS DE CONTROL`) are rendered in uppercase using `label-xs` or `label-sm` with expanded letter-spacing (`0.05em`–`0.08em`) to enforce visual distinction against variable table strings.

## Layout & Spacing

The layout model employs an operational fixed-sidebar architecture paired with a fluid dashboard workspace:
- **Left Sidebar:** Fixed at 260px on desktop screens, housing system branding, status indicators, and modular control routing.
- **Top Utility Navigation:** Persistent bar organizing quick switches, session health, live clock counters, and user credentials.
- **Main Canvas:** Structured on a 12-column responsive grid with `1rem` (16px) gutters on standard desktop views and `1.5rem` (24px) gutters on wide displays (`>= 1600px`).
- **Card Padding:** Internal card padding strictly enforces `1.25rem` (20px) to `1.5rem` (24px) for data modules, while compact metric stat boxes maintain `1rem` (16px).

## Elevation & Depth

Visual depth avoids excessive drop shadows in favor of **Tonal Layering** and **Subtle Boundary Borders**:

1. **Level 0 (Base Canvas):** `#0B0F19` flat substrate.
2. **Level 1 (Structural Containers & Cards):** `#161F30` background bordered with `1px solid rgba(255, 255, 255, 0.07)` or `#1E293B`.
3. **Level 2 (Active States, Inputs, Floating Pills):** `#1E293B` surfaces with refined ambient rim lighting (`box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4)`).
4. **Level 3 (Emissive Highlights & Primary Overlays):** Glowing amber/emerald accent shadows applied sparingly to active action controls (e.g., `box-shadow: 0 4px 14px 0 rgba(245, 158, 11, 0.35)`).

## Shapes

The design uses a rounded geometry (`roundedness: 2`) tailored for modern dark visual dashboards:
- **Metric Cards & Data Panels:** `12px` to `16px` border radius (`rounded-lg` / `rounded-xl`).
- **Buttons & Control Pills:** Fully rounded pill shapes (`9999px`) or `10px` rounded rectangles for form controls.
- **Progress & Category Bars:** Rounded ends (`9999px`) inside track elements.
- **Sidebar Selection Markers:** `10px`–`12px` radius for smooth capsule grouping.

## Components

- **Buttons:**
  - *Primary Action:* Radiant amber `#F59E0B` to `#D97706` gradient or solid fill, text in dark navy `#0B0F19` with bold weight, pill-shaped or `rounded-lg`.
  - *Secondary / Utility:* Dark translucent `#161F30` background with `1px solid #1E293B`, white text, and icon adornment.
  - *Status Buttons (Tactile / Voice):* Interactive amber or muted charcoal toggles with embedded lead icons.
- **Metric Stat Cards:**
  - Enclosed `#161F30` containers with an icon glyph tile on the left (housed in a tinted rounded box matching the metric hue: amber, emerald, cyan, or purple).
  - Label in `label-xs` uppercase `#94A3B8`.
  - Huge metric readout in `metric-display` (`#FFFFFF` or accented color).
  - Compact footer indicating relative trend percentage (`+35% vs. período anterior`) with micro-indicator arrow.
- **Data Tables:**
  - Header line in uppercase `label-xs` text (`#64748B`).
  - Alternating or seamless dark rows with subtle dividing borders (`rgba(255, 255, 255, 0.05)`).
  - Right-aligned performance bars visualizing share of total (`% DEL TOTAL`) with pill sliders color-coded by category.
- **Navigation Items:**
  - Active item features an amber background (`#F59E0B` / `#D97706`) with high-contrast text (`#0B0F19` or bold `#FFFFFF`) and matching active icon.
  - Inactive links render in slate `#94A3B8` over transparent background, transitioning to `#1E293B` on hover.
- **Status Pills:**
  - Capsule-shaped chips (`padding: 0.25rem 0.75rem`) using dark green alpha surfaces (`rgba(16, 185, 129, 0.15)`) with an emerald green pulsing bullet and label for system telemetry.