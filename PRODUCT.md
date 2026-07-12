# AssetFlow Product Context

This document registers the design tokens, product rules, and anti-references for AssetFlow. This context steers AI design commands to keep visual styling consistent, accessible, and high-fidelity.

## Metadata

- **Name**: AssetFlow
- **Register**: Product
- **Platform**: Web
- **Voice**: Clean, professional, structured, reliable

## Design System

### Colors (OKLCH)

We use a modern, flat, high-density enterprise ERP theme with solid backgrounds and crisp 1px borders.

- **Background**: `oklch(10% 0 0)` (Flat deep dark zinc background, `#09090b` fallback)
- **Surface**: `oklch(15% 0 0)` (Solid dark charcoal container surface, `#121214` fallback)
- **Border**: `oklch(25% 0 0)` (Sharp 1px solid dark gray line separator, `#27272a` fallback)
- **Ink (Primary Text)**: `oklch(98% 0 0)` (Crisp off-white, highly readable)
- **Muted (Secondary Text)**: `oklch(70% 0 0)` (Mid-tone gray for table headers and secondary details)
- **Accent (Zinc/White)**: `oklch(100% 0 0)` (Pure white for active indicators, primary buttons, and selected states)
- **Success (Available / Approved / Resolved)**:
  - Text: `oklch(62% 0.16 150)` (Solid emerald text)
  - Background: `oklch(20% 0.05 150 / 20%)` (Subtle dark emerald tint background)
- **Warning (Reserved / Under Maintenance)**:
  - Text: `oklch(75% 0.15 75)` (Solid amber text)
  - Background: `oklch(22% 0.05 75 / 20%)` (Subtle dark amber tint background)
- **Danger (Overdue / Lost)**:
  - Text: `oklch(60% 0.18 28)` (Solid crimson text)
  - Background: `oklch(18% 0.06 28 / 20%)` (Subtle dark crimson tint background)

### Typography

- **Primary Font**: Inter, system-ui, sans-serif
- **Mono Font**: JetBrains Mono, SF Mono, monospace (used for asset tags, serial numbers, timestamps, and cost fields)
- **Body Line Length**: 65-75ch
- **Text Wrap**: `text-wrap: balance` for headers; `text-wrap: pretty` for long lists/descriptions.

### Spatial Scale & Layout Density

- **Density**: High-density spacing for maximum scannability. Compact tables, dense grids, and tight padding.
- **Base Padding**: `0.75rem` (`12px`) for table cells and minor panels; `1.25rem` (`20px`) for major screen margins.
- **Layout Grid**: Flexbox for single-direction layouts; CSS Grid `repeat(auto-fit, minmax(280px, 1fr))` for list collections.

## Anti-References (What NOT to do)

- **No Glassmorphism**: Avoid transparent backgrounds, backdrop blurs (`backdrop-filter`), and floating panels.
- **No Drop Shadows**: Keep panels flat and flush. Use 1px solid borders for visual separation instead of depth shadows.
- **No Saturated Blue/Purple SaaS Gradients**: Backgrounds and containers must remain solid neutral zinc/gray.
- **No Nested Cards**: Do not nest visual card containers. Present layered data using clean tables or flat grid sections.
- **No Arbitrary z-indices**: Adhere strictly to: dropdown (100) -> sticky navigation (200) -> modal backdrop (300) -> modal (400) -> toast alert (500) -> tooltips (600).
- **No Low-Contrast Text**: Ensure all text elements exceed a contrast ratio of 4.5:1 against their container surfaces.
