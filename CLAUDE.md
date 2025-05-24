# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` or `yarn dev` - Start development server at http://localhost:3000
- `npm run build` or `yarn build` - Create production build
- `npm run lint` or `yarn lint` - Run ESLint checks
- `npm run start` or `yarn start` - Start production server

## Architecture Overview

This is a Next.js 15 developer tools collection using App Router. The application provides various utility tools for developers including formatters, encoders, color pickers, and password generators.

**Key Stack:**
- Next.js 15 with React 19 and TypeScript
- Tailwind CSS v4 for styling
- Radix UI for component primitives
- Monaco Editor for code editing interfaces

**Component Structure:**
- `src/app/` - App Router pages and layouts
- `src/components/layout/` - Main layout components (Header, Sidebar, Layout)
- `src/components/tools/` - Feature-specific tool components
- `src/components/ui/` - Reusable UI components (shadcn/ui style)
- `src/lib/` - Utility functions and helpers

**Tool Categories:**
The sidebar organizes tools into: Development, Text Processing, Image Processing, Date/Time, Security, and Network categories.

**Routing Pattern:**
Tools follow `/tools/{tool-name}` pattern with dedicated page components in `src/app/tools/{tool-name}/page.tsx`.

**Adding New Tools:**
1. Create page in `src/app/tools/{tool-name}/page.tsx`
2. Create component in `src/components/tools/{tool-name}/`
3. Add navigation entry to `src/components/layout/Sidebar.tsx`
4. Export page component that imports and renders the tool component

**TypeScript Configuration:**
- Path alias `@/*` maps to `./src/*`
- Strict mode enabled
- Type definitions in `src/types/`