# System Layers Architecture

This diagram illustrates the main architectural layers of the system and their interactions.

## Layer Diagram

```mermaid
graph TB
    subgraph "UI Layer"
        UI[UI Components]
        Stories[Storybook]
        Theme[Theme System]
        I18n[i18n]
    end

    subgraph "Data Access Layer"
        API[API Layer]
        Cache[Cache]
        State[State Management]
        Auth[Authentication]
    end

    subgraph "Business Logic Layer"
        BL[Business Logic]
        Valid[Validation]
        Rules[Business Rules]
    end

    subgraph "Database Layer"
        Prisma[Prisma ORM]
        Drizzle[Drizzle ORM]
        DB[(Database)]
    end

    UI --> API
    API --> BL
    BL --> Prisma
    BL --> Drizzle
    Prisma --> DB
    Drizzle --> DB
    API --> Cache
    UI --> State
    Auth --> API
```

## Description

The system is divided into four main layers:

1. **UI Layer**: Handles all user interface components and interactions
2. **Data Access Layer**: Manages data access, caching, and state
3. **Business Logic Layer**: Contains core business rules and validation
4. **Database Layer**: Handles data persistence through ORMs

## Key Points

- Clear separation of concerns between layers
- Multiple ORM support for flexibility
- Centralized authentication and caching
- State management integrated with UI layer
