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
- **Database Access**: Prisma Client
- **Data Validation**: Zod schemas
- **Styling**: Tailwind CSS matching the design specs in PRODUCT.md

### Security & Authentication
- All backend routes must enforce security checks.
- Do not trust client-supplied user roles; parse and decode JWT tokens server-side.
- Reject unauthenticated requests with `401 Unauthorized` and unauthorized operations with `403 Forbidden`.

### Design & Aesthetics (No Emojis)
- Follow the design system outlined in PRODUCT.md.
- Maintain a flat, high-density ERP layout using solid zinc surfaces (`#121214` containers on `#09090b` main backgrounds) separated by crisp 1px solid borders (`#27272a`).
- Avoid all glassmorphism, transparent blurs, drop shadows, and background gradients.
- Do not use emojis in UI text, code, or documentation (including commit messages). Keep the vocabulary professional.
