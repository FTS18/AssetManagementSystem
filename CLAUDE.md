# Claude Project Rules - AssetFlow

This file contains instructions for AI coding assistants working on the AssetFlow repository.

## Commands

- **Development Server**: `npm run dev` (starts server on http://localhost:3000)
- **Production Build**: `npm run build`
- **Lint Code**: `npm run lint`
- **Prisma Database Sync**: `npx prisma db push` (runs migrations locally)
- **Prisma Studio GUI**: `npx prisma studio` (opens database browser on http://localhost:5555)

## Coding Guidelines

### Technology Stack
- **Framework**: Next.js App Router (React Server Components and Server Actions)
- **Language**: TypeScript (enforce strict typing, avoid `any`)
- **Database Access**: Prisma Client instantiated with `@prisma/adapter-libsql` and `@libsql/client` (do not use default `new PrismaClient()` without the adapter)
- **Data Validation**: Zod schemas
- **Styling**: Tailwind CSS matching the design specs in PRODUCT.md. **Crucial**: Use Tailwind v4 canonical syntax for CSS variables (e.g., `bg-(--bg)`, `text-(--text)`) instead of the arbitrary value syntax (`bg-[var(--bg)]`). Use standard updated classes like `shrink-0` instead of `flex-shrink-0`.

### Security & Authentication
- All backend routes must enforce security checks.
- Do not trust client-supplied user roles; parse and decode JWT tokens server-side.
- Reject unauthenticated requests with `401 Unauthorized` and unauthorized operations with `403 Forbidden`.

### Design & Aesthetics (No Emojis)
- Follow the design system outlined in PRODUCT.md.
- Maintain a modern, high-density ERP layout with warm cream backgrounds, animated mesh gradients, noise grain overlays, and soft shadows.
- Enforce consistent rounded corners: inputs, buttons, and badges must be round and soft (using `--radius-sm` / 8px); cards, tables, and panels must use `--radius-md` / 12px. No sharp `rounded-sm` / `rounded-none` boxes.
- Do not use emojis in UI text, code, or documentation (including commit messages). Keep the vocabulary professional.
