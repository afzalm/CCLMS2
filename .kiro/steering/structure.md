# Project Structure

## Root Directory Organization

```
├── src/                    # Main source code
├── prisma/                 # Database schema and migrations
├── db/                     # SQLite database files
├── public/                 # Static assets
├── .kiro/                  # Kiro AI assistant configuration
├── .next/                  # Next.js build output
├── node_modules/           # Dependencies
└── examples/               # Example implementations
```

## Source Code Structure (`src/`)

### App Router (`src/app/`)
- **Next.js 15 App Router** with file-based routing
- **Route Groups**: 
  - `/admin/` - Administrative interface
  - `/auth/` - Authentication pages
  - `/courses/` - Course browsing and management
  - `/instructor/` - Trainer/instructor dashboard
  - `/learn/` - Student learning interface
- **API Routes**: `/api/` for backend endpoints
- **Global Files**: `layout.tsx`, `page.tsx`, `globals.css`

### Components (`src/components/`)
- **UI Components**: `ui/` contains shadcn/ui components
- **Reusable Components**: Custom application components
- **Component Organization**: Group by feature or functionality

### Utilities (`src/lib/`)
- **Database**: `db.ts` - Prisma client configuration
- **Authentication**: `auth.tsx` - NextAuth.js setup
- **Socket.IO**: `socket.ts` - Real-time communication setup
- **Utilities**: `utils.ts` - Common helper functions

### Hooks (`src/hooks/`)
- **Custom React Hooks**: Reusable stateful logic
- **UI Hooks**: `use-mobile.ts`, `use-toast.ts`

## Database Structure (`prisma/`)
- **Schema**: `schema.prisma` - Complete LMS data model
- **Migrations**: `db/` - Database migration files
- **Seed Data**: `seed/` - Initial data setup

## Configuration Files
- **shadcn/ui**: `components.json` - UI component configuration
- **TypeScript**: `tsconfig.json` - Compiler settings
- **Tailwind**: `tailwind.config.ts` - Styling configuration
- **Next.js**: `next.config.ts` - Framework configuration
- **Server**: `server.ts` - Custom server with Socket.IO

## Naming Conventions
- **Files**: kebab-case for components, camelCase for utilities
- **Components**: PascalCase React components
- **Database**: snake_case table names, camelCase field names
- **Routes**: lowercase with hyphens for URL segments

## Import Aliases
- `@/*` maps to `src/*` for clean imports
- `@/components` for UI components
- `@/lib` for utilities and configurations
- `@/hooks` for custom React hooks