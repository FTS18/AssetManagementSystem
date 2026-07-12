# AssetFlow Product Context

This document registers the design tokens, product rules, and anti-references for AssetFlow. This context steers AI design commands to keep visual styling consistent, accessible, and high-fidelity.

## Metadata

- **Name**: AssetFlow
- **Register**: Product
- **Platform**: Web
- **Voice**: Clean, professional, structured, reliable

## Design System

### Colors (OKLCH)

We use a premium, dark glassmorphism system with high-contrast indicator highlights.

- **Background**: `oklch(15.24% 0.015 258.2)` (Deep dark slate background, `#0b0f19` fallback)
- **Surface**: `oklch(22.68% 0.024 254.9)` (Translucent slate panels, `#161d30` fallback)
- **Border**: `oklch(28.4% 0.024 254.9 / 40%)` (Subtle glassmorphic border separator)
- **Ink (Primary Text)**: `oklch(96.12% 0.008 254.5)` (Near white, highly readable)
- **Muted (Secondary Text)**: `oklch(74.5% 0.015 254.5)` (Slightly dimmed grey for secondary details)
- **Accent (Indigo)**: `oklch(58.62% 0.175 268.4)` (Used for active navigation links, highlights, and primary actions)
- **Success (Mint/Green)**: `oklch(76.12% 0.125 160.2)` (Used for Available, Approved, and Resolved states)
- **Warning (Orange/Yellow)**: `oklch(81.24% 0.152 75.4)` (Used for Reserved and Under Maintenance states)
- **Danger (Red)**: `oklch(62.45% 0.198 28.5)` (Used for Overdue allocations, Lost assets, and Discrepancies)

### Typography

- **System Font**: Inter, system-ui, sans-serif
- **Code Font**: JetBrains Mono, monospace
- **Body Line Length**: 65-75ch
- **Text Wrap**: `text-wrap: balance` for display titles; `text-wrap: pretty` for descriptions.

### Spatial Scale & Grid

- **Layout Grid**: Responsive flexbox / CSS grid matching `repeat(auto-fit, minmax(280px, 1fr))` for list items.
- **Base Padding**: `1.5rem` (`24px`) for card interiors; `1rem` (`16px`) for mobile viewports.
- **Gap Scale**: `0.75rem`, `1rem`, `1.5rem`, `2rem` (never arbitrary spacing).

## Anti-References (What NOT to do)

- **No generic purple-to-blue SaaS gradients**: Keep panels flat, dark slate, or subtly translucent with backdrop blur.
- **No nested cards**: Never place a card directly inside another card. Use clean list tables or key-value structures instead.
- **No arbitrary z-indices**: Adhere strictly to the z-index scale: dropdown (100) -> sticky navigation (200) -> modal backdrop (300) -> modal (400) -> toast alert (500) -> tooltips (600).
- **No low-contrast text**: Body text must hit a minimum of 4.5:1 against its background. Do not use very light gray on white or dark gray on slate.
