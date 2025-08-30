# Overview

This is a full-stack web application built with React and Node.js, featuring a modern tech stack with TypeScript, Tailwind CSS, and shadcn/ui components. The project follows a monorepo structure with shared types and utilities between the frontend and backend. It uses Drizzle ORM with PostgreSQL for database operations and includes comprehensive UI components from Radix UI for building rich user interfaces.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and TypeScript, utilizing a component-based architecture with modern tooling:

- **Build System**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with CSS variables for theming and shadcn/ui component system
- **UI Components**: Comprehensive set of Radix UI primitives wrapped with custom styling
- **Form Handling**: React Hook Form with resolvers for form validation

The frontend follows a modular structure with clear separation of components, pages, hooks, and utilities. The shadcn/ui integration provides a consistent design system with customizable components.

## Backend Architecture
The server-side uses Node.js with Express.js (inferred from package naming), built with TypeScript for type safety:

- **Runtime**: Node.js with ES modules
- **Database Layer**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Session Management**: PostgreSQL-based session storage using connect-pg-simple
- **Build Process**: ESBuild for server-side bundling and compilation

## Data Storage
The application uses PostgreSQL as the primary database with Drizzle ORM providing the data access layer:

- **Database**: PostgreSQL with Neon Database serverless hosting
- **ORM**: Drizzle ORM for type-safe queries and schema management
- **Migrations**: Drizzle Kit for database schema migrations
- **Schema**: Centralized schema definition in shared directory for type consistency

## Development Workflow
The project supports both development and production environments with optimized build processes:

- **Development**: Hot reload with Vite for frontend and tsx for backend
- **Production**: Optimized builds with Vite (frontend) and ESBuild (server)
- **Type Checking**: Comprehensive TypeScript configuration across all layers
- **Code Organization**: Monorepo structure with shared types and utilities

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting for scalable database operations
- **PostgreSQL**: Primary relational database system

## UI and Styling
- **Radix UI**: Comprehensive set of low-level UI primitives for building accessible components
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **shadcn/ui**: Pre-built component system with customizable design tokens

## Development Tools
- **Vite**: Frontend build tool and development server
- **ESBuild**: Fast JavaScript/TypeScript bundler for server builds
- **Drizzle Kit**: Database migration and introspection toolkit
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer plugins

## Runtime Libraries
- **React**: Frontend framework for building user interfaces
- **TanStack Query**: Server state management and caching
- **Wouter**: Minimalist routing library for React
- **date-fns**: Modern JavaScript date utility library
- **class-variance-authority**: Utility for creating type-safe component variants

## Development Environment
- **Replit**: Cloud development environment with specialized plugins for error handling and code mapping
- **TypeScript**: Type system for JavaScript providing compile-time type checking