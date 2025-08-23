# Technology Stack

## Core Framework
- **Next.js 15** with App Router architecture
- **TypeScript 5** for type safety
- **React 19** with React Strict Mode disabled
- **Node.js** runtime with custom server setup

## Database & ORM
- **Prisma** as the ORM with SQLite database
- Database located at `db/custom.db`
- Schema defines comprehensive LMS entities (Users, Courses, Lessons, Quizzes, etc.)

## UI & Styling
- **Tailwind CSS 4** for styling
- **shadcn/ui** component library (New York style)
- **Radix UI** primitives for accessible components
- **Lucide React** for icons
- **Framer Motion** for animations
- **Next Themes** for dark/light mode

## State Management & Data
- **Zustand** for client-side state management
- **TanStack Query** for server state and caching
- **React Hook Form** with **Zod** validation
- **Axios** for HTTP requests

## Real-time Features
- **Socket.IO** server and client for real-time communication
- Custom server setup in `server.ts` integrating Next.js with Socket.IO

## Development Tools
- **ESLint** with Next.js config (build errors ignored)
- **TypeScript** with relaxed settings (`noImplicitAny: false`)
- **Nodemon** for development server restarts
- **tsx** for TypeScript execution

## Common Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm start              # Start production server

# Database
npm run db:push        # Push schema changes to database
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run database migrations
npm run db:reset       # Reset database

# Code Quality
npm run lint           # Run ESLint
```

## Configuration Notes
- TypeScript build errors are ignored in production
- ESLint errors ignored during builds
- Hot reloading disabled in favor of nodemon
- Custom server handles both Next.js and Socket.IO on port 3000