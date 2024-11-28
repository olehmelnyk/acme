# Architecture Overview

This document outlines the high-level architecture of our application, which follows a layered architecture pattern combined with feature-sliced design principles in a monorepo setup.

## Core Principles

- **Strict Layer Separation**: Each layer has clear responsibilities and boundaries
- **Feature-Sliced Design**: Code is organized by features rather than technical concerns
- **Monorepo Structure**: Code is split into reusable pieces under `/libs` or `/packages`
- **Type Safety**: Comprehensive TypeScript usage throughout the application
- **Documentation First**: All architectural decisions and patterns are well-documented

## Layer Structure

### 1. UI Layer
- Atomic Design methodology
- Component library: shadcn
- Styling: Tailwind CSS
- Component development: Storybook
- Accessibility (a11y) compliance
- Internationalization (i18n)
- Theming: Light and Dark modes

### 2. Data Access Layer (DAL)
- API Integration:
  - RESTful API
  - GraphQL API
  - tRPC API
- Data Management:
  - React Query for data fetching
  - Caching (Redis, localStorage, React Query)
  - Mock Service Worker (MSW) for testing
  - Local state management with Zustand
- API Documentation:
  - OpenAPI/Swagger for REST and tRPC
  - GraphQL Playground
- Authentication:
  - NextAuth.js
  - JWT tokens
  - Two-factor authentication (2FA)
- Database:
  - Prisma ORM
  - Drizzle ORM
  - Schema synchronization and introspection
  - Code generation:
    - TypeScript definitions
    - Zod validations
    - API clients (REST, tRPC, GraphQL)
    - DTOs
    - Test mocks and seeds

### 3. Business Logic Layer (BL)
- Core business rules and logic
- Domain models
- Service layer
- Business validations

## Monorepo Structure

```
root/
├── apps/                    # Application entries
│   ├── web/                # Main web application
│   └── admin/              # Admin panel
├── packages/               # Shared packages
│   ├── ui/                # UI components
│   ├── config/            # Shared configurations
│   └── types/             # Shared TypeScript types
├── libs/                  # Feature libraries
│   ├── auth/             # Authentication feature
│   ├── users/            # User management
│   └── products/         # Product management
└── docs/                 # Documentation
    ├── architecture/     # Architecture docs
    └── guides/          # Development guides
```

For detailed documentation on each layer and feature, please refer to their respective documentation files in this directory.
