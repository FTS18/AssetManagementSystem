# AssetFlow Product Context

This document registers the design tokens, product rules, and anti-references for AssetFlow. This context steers AI design commands to keep visual styling consistent, accessible, and high-fidelity.

## Metadata

- **Name**: AssetFlow
- **Register**: Product
- **Platform**: Web
- **Voice**: Warm, modern, professional, structured, reliable

## Design System

### Colors (OKLCH)

We use a modern, warm-cream and near-black theme with soft surfaces, subtle shadows, and responsive layouts. When applying these colors in Tailwind, always use the v4 syntax for referencing variables directly (e.g., `bg-(--bg-name)` instead of `bg-[var(--bg-name)]`).

- **Background**: `oklch(96% 0.014 80)` (Warm cream content background)
- **Surface**: `oklch(99.5% 0.005 80)` (Solid warm off-white container surface)
- **Surface 2**: `oklch(93% 0.018 80)` (Tinted mid-tone cream for list hover and active items)
- **Border**: `oklch(84% 0.016 80)` (Warm border line separator)
- **Border Subtle**: `oklch(90% 0.01 80)` (Light separator line)
- **Ink (Primary Text)**: `oklch(14% 0.008 80)` (Near-black body and heading text)
- **Muted (Secondary Text)**: `oklch(46% 0.01 80)` (Medium gray for secondary details)
- **Accent**: `oklch(16% 0.008 80)` (Near-black for primary active indicators, buttons)
- **Accent Hover**: `oklch(10% 0.005 80)` (Darker black on hover)
- **Accent FG**: `oklch(96% 0.01 80)` (Cream text for primary buttons)
- **Accent Subtle**: `oklch(91% 0.016 80)` (Soft accent background)
- **Sidebar**:
  - Background: `oklch(13% 0.006 80)` (Near-black warm sidebar background)
  - Text (FG): `oklch(96% 0.008 80)` (Bright cream active sidebar text)
  - Muted: `oklch(52% 0.008 80)` (Mid-tone warm gray sidebar text)
  - Hover: `oklch(19% 0.006 80)` (Slightly lighter dark pill on hover)
  - Border: `oklch(21% 0.005 80)` (Dark sidebar border)

### Typography

- **Primary Font**: Bricolage Grotesque, system-ui, sans-serif (Expressive, warm typography)
- **Mono Font**: JetBrains Mono, SF Mono, monospace (used for asset tags, serial numbers, timestamps, and cost fields)
- **Body Line Length**: 65-75ch
- **Text Wrap**: `text-wrap: balance` for headers; `text-wrap: pretty` for long lists/descriptions.

### Spatial Scale & Layout Density

- **Density**: High-density spacing for maximum scannability. Compact tables, dense grids, and tight padding.
- **Base Padding**: `0.75rem` (`12px`) for table cells and minor panels; `1.25rem` (`20px`) for major screen margins.
- **Layout Grid**: Flexbox for single-direction layouts; CSS Grid `repeat(auto-fit, minmax(280px, 1fr))` for list collections.

### Aesthetics & Decorative Elements

- **Mesh Background**: We use an animated, subtle warm cream mesh gradient (`.mesh-bg`) with an SVG noise grain overlay (`.sidebar-grain` and `.mesh-bg::before`) to create depth and texture on content panels.
- **Soft Shadows**: Elements use gentle, diffuse shadows (`--shadow-xs`, `--shadow-sm`, `--shadow-md`) to separate panels from the background.
- **Soften Corners (Consistent Radii)**: All interactive controls (buttons, inputs), status badges, cards, table wrappers, and alerts must have consistent rounded corners (never sharp `rounded-sm`/`2px` or `rounded-none`).
  - Small radii: `8px` (`var(--radius-sm)`) for inputs, buttons, and badges.
  - Medium radii: `12px` (`var(--radius-md)`) for cards, tables, and alerts.
  - Large radii: `18px` (`var(--radius-lg)`) for major dialogs or main sections.

## Anti-References (What NOT to do)

- **No Sharp/Boxy Elements**: Avoid sharp square borders on components. Do not use `rounded-sm` (2px) or sharp raw boxes for buttons, inputs, alerts, and badges.
- **No Flat Hard Colors**: Use the warm oklch scales defined in globals.css.
- **No Arbitrary z-indices**: Adhere strictly to: dropdown (100) -> sticky navigation (200) -> modal backdrop (300) -> modal (400) -> toast alert (500) -> tooltips (600).
- **No Low-Contrast Text**: Ensure all text elements exceed a contrast ratio of 4.5:1 against their container surfaces.
