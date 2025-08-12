# Project: CompassLMS

## Project Overview

This is a modern, production-ready web application scaffold for a Learning Management System (LMS) called CompassLMS. It's built with a comprehensive stack of technologies designed to accelerate development with AI-powered coding assistance. The application is a Next.js project using the App Router, with a TypeScript and Tailwind CSS foundation. It includes a rich set of features for a learning platform, including user authentication, course management, lessons, quizzes, and payments.

## Building and Running

### Prerequisites

*   Node.js
*   npm
*   Prisma

### Installation

```bash
npm install
```

### Development

To run the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Production

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

### Database

The project uses Prisma as its ORM. The database schema is defined in `prisma/schema.prisma`. The following scripts are available for database management:

*   `npm run db:push`: Push the schema to the database.
*   `npm run db:generate`: Generate the Prisma client.
*   `npm run db:migrate`: Run database migrations.
*   `npm run db:reset`: Reset the database.

## Development Conventions

*   **Framework:** Next.js with App Router
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS with shadcn/ui components
*   **State Management:** Zustand
*   **Data Fetching:** TanStack Query with Axios
*   **Database:** Prisma with a SQLite database
*   **Authentication:** NextAuth.js
*   **Linting:** ESLint
*   **Code Formatting:** Prettier (assumed, based on common practice)

The project has some specific configurations in `next.config.ts`:

*   TypeScript build errors are ignored.
*   Webpack's Hot Module Replacement (HMR) is disabled in favor of `nodemon` for recompilation.
*   ESLint errors are ignored during builds.

## Key Files

*   `README.md`: Project overview and setup instructions.
*   `package.json`: Project dependencies and scripts.
*   `next.config.ts`: Next.js configuration.
*   `prisma/schema.prisma`: Database schema definition.
*   `src/app/`: Main application source code.
*   `src/components/`: Reusable React components.
*   `src/lib/`: Utility functions and configurations.
