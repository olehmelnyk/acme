# Architecture Diagrams

This document serves as the central reference for all architecture diagrams in the project. Each diagram follows our [standardized diagram guidelines](diagrams/README.md).

## System Architecture

### Core Architecture

- [System Layers](diagrams/system/layers.md) - Core system layering and boundaries
- [API Architecture](diagrams/system/api-architecture.md) - REST and GraphQL API design
- [System Workflow](diagrams/system/workflow.md) - End-to-end system processes
- [Error Handling](diagrams/system/error-flow.md) - Error handling and recovery patterns

### Data Management

- [Database Sharding](diagrams/system/sharding.md) - Database scaling strategy
- [Event Sourcing](diagrams/system/event-sourcing.md) - Event-driven architecture
- [Service Discovery](diagrams/system/service-discovery.md) - Service mesh and discovery
- [Code Generation](diagrams/system/code-generation.md) - Automated code generation pipeline

## Component Architecture

- [Atomic Design](diagrams/components/atomic-design.md) - UI component hierarchy and patterns
- [Component Interactions](diagrams/components/interactions.md) - Component communication flows
- [State Management](diagrams/components/state-patterns.md) - Component state handling

## Infrastructure

- [Deployment Architecture](diagrams/infrastructure/deployment.md) - Deployment strategy and environments
- [Monitoring Setup](diagrams/infrastructure/monitoring.md) - Monitoring and alerting architecture
- [CI/CD Pipeline](diagrams/infrastructure/ci-cd-pipeline.md) - Continuous integration and deployment
- [Production Environment](diagrams/infrastructure/production-environment.md) - Production infrastructure

## Data Flow

- [State Management](diagrams/data-flow/state-management.md) - Application state flow
- [Data Processing](diagrams/data-flow/processing.md) - Data transformation pipelines
- [Caching Strategy](diagrams/data-flow/caching.md) - Multi-level caching architecture

## Security

- [Security Layers](diagrams/security/security-layers.md) - Security architecture and controls
- [Authentication Flow](diagrams/security/auth-flow.md) - Authentication process
- [Authorization Model](diagrams/security/authorization.md) - Role-based access control

## Related Documentation

- [Development Guidelines](./DEVELOPMENT.md)
- [State Architecture](./diagrams/data-flow/state-architecture.md)
- [Security Architecture](./diagrams/system/security.md)
- [Performance Guidelines](./diagrams/system/performance.md)

## Contributing

Please refer to our [diagram standards and guidelines](diagrams/README.md) when adding or updating diagrams.