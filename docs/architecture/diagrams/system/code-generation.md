# Code Generation Architecture

This diagram illustrates our code generation pipeline, showing how we generate type-safe code from various schema definitions.

```mermaid
graph TB
    subgraph "Schema Definitions"
        Proto[Protobuf]
        GraphQL[GraphQL Schema]
        DB[Database Schema]
    end

    subgraph "Generators"
        ProtoGen[Protocol Buffer Generator]
        GQLGen[GraphQL Generator]
        TypeGen[Type Generator]
        ORMGen[ORM Generator]
    end

    subgraph "Generated Code"
        Models[Domain Models]
        Types[TypeScript Types]
        Resolvers[GraphQL Resolvers]
        Client[API Client]
    end

    Proto-->ProtoGen
    GraphQL-->GQLGen
    DB-->ORMGen

    ProtoGen-->Types
    ProtoGen-->Client
    GQLGen-->Types
    GQLGen-->Resolvers
    ORMGen-->Models
    ORMGen-->Types
```

## Components

### Schema Definitions

- Protocol Buffers
- GraphQL Schema
- Database Schema
- Type Definitions

### Code Generators

- Protocol Buffer Generator
- GraphQL Code Generator
- TypeScript Generator
- ORM Generator

### Generated Artifacts

- Domain Models
- TypeScript Types
- GraphQL Resolvers
- API Client Code

## Implementation Details

### Protocol Buffers

- Service definitions
- Message types
- RPC endpoints
- Client/server stubs

### GraphQL

- Type definitions
- Resolvers
- Mutations
- Subscriptions

### Database

- Entity models
- Migrations
- Relationships
- Indices

### Type System

- Type safety
- Code completion
- Documentation
- Validation
