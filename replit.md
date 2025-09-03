# Overview

TaskFlow is a role-based task management application that enables seamless task assignment, progress tracking, and evidence submission between administrators and team members. The system supports two distinct user roles: admins who can create and assign tasks to linked users, and users who can view their assigned tasks, submit evidence of completion, and track their progress through a calendar interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side is built with React 18 using TypeScript and modern development patterns:

- **UI Framework**: React with functional components and hooks
- **Routing**: Wouter for client-side routing with role-based navigation
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

The application follows a component-based architecture with clear separation between pages, reusable components, hooks, and utilities. The routing system automatically redirects users to appropriate dashboards based on their roles.

## Backend Architecture

The server is built with Express.js following RESTful API patterns:

- **Runtime**: Node.js with ES modules and TypeScript
- **Framework**: Express.js with middleware for logging, error handling, and file uploads
- **Authentication**: Replit Auth integration with OpenID Connect and Passport.js
- **Session Management**: Express sessions with PostgreSQL storage
- **File Handling**: Multer middleware for evidence file uploads with type and size validation
- **API Structure**: Role-based route protection with separate endpoints for admin and user operations

The server implements comprehensive logging for API requests and includes proper error handling with status codes and structured error responses.

## Database Design

The system uses PostgreSQL with Drizzle ORM for type-safe database operations:

- **ORM**: Drizzle ORM for schema definition and query building
- **Connection**: Neon Database serverless PostgreSQL with connection pooling
- **Schema**: Shared schema definitions between client and server for type consistency

Key database tables include:
- **Users**: Stores user profiles with role-based access (admin/user), admin linking system
- **Tasks**: Task entities with assignment relationships, deadlines, and completion tracking
- **Sessions**: PostgreSQL session storage for authentication persistence

The database design supports a hierarchical relationship where users are linked to specific admins through unique admin numbers.

## Authentication and Authorization

The application implements Replit's authentication system:

- **Provider**: Replit OpenID Connect integration
- **Session Strategy**: Server-side sessions stored in PostgreSQL
- **Role Management**: Two-tier role system (admin/user) with registration flow
- **Admin Linking**: Users connect to admins via unique generated numbers
- **Route Protection**: Middleware-based authentication checks for API endpoints

The authentication flow includes a registration step where users select their role and admins generate unique numbers for user linking.

## File Management

Evidence submission includes file upload capabilities:

- **Storage**: Local file system storage with configurable upload directory
- **Validation**: File type restrictions (images, documents, videos) and size limits (50MB)
- **Processing**: Multer middleware handles multipart form data with proper error handling

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database migration and schema management tools

## Authentication Services
- **Replit Auth**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware with OpenID Connect strategy

## UI and Styling
- **shadcn/ui**: Pre-built component library based on Radix UI
- **Radix UI**: Headless UI primitives for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Frontend build tool with development server and hot module replacement
- **TypeScript**: Type safety across the entire application stack
- **Replit Integration**: Development environment plugins for enhanced debugging

## Form and Data Management
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation for runtime type checking
- **TanStack Query**: Server state management with caching and synchronization
- **date-fns**: Date manipulation and formatting utilities

The application is designed to run seamlessly in the Replit environment with specific integrations for development tooling and authentication.