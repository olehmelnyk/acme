# Glossary

This document provides definitions and explanations for terms, concepts, and patterns used throughout the ACME project.

## Architecture

### Components

- **Atom**: Smallest, indivisible UI components (buttons, inputs)
- **Molecule**: Simple groups of UI atoms (form fields, search bars)
- **Organism**: Complex UI components (navigation bars, forms)
- **Template**: Page-level components without content
- **Page**: Specific instances of templates with content

### Development

- **Monorepo**: Single repository containing multiple related projects
- **Workspace**: Logical grouping of related packages
- **Package**: Individual project within the monorepo
- **Library**: Shared code used across multiple packages

### Testing

- **Unit Test**: Tests individual components or functions
- **Integration Test**: Tests interactions between components
- **E2E Test**: Tests complete user flows
- **Snapshot Test**: Captures and compares component renders

### State Management

- **Store**: Central state container
- **Action**: Description of state change
- **Reducer**: Function that applies state changes
- **Selector**: Function that retrieves state

### Build System

- **Bundle**: Compiled and optimized code output
- **Chunk**: Portion of code split for optimization
- **Asset**: Static files (images, fonts, etc.)
- **Source Map**: Debug file mapping compiled to source

### Performance

- **TTI**: Time to Interactive
- **FCP**: First Contentful Paint
- **LCP**: Largest Contentful Paint
- **CLS**: Cumulative Layout Shift

### Development Process

- **Feature Flag**: Toggle for enabling/disabling features
- **Hot Reload**: Instant code updates during development
- **Code Split**: Dividing code into loadable chunks
- **Tree Shake**: Removing unused code

### API Patterns

- **REST**: Representational State Transfer
- **GraphQL**: Query language for APIs
- **Webhook**: HTTP callback for events
- **WebSocket**: Persistent connection protocol

### Database

- **Migration**: Database schema change
- **Seed**: Initial database data
- **Query**: Database data request
- **Index**: Database optimization structure

### Security

- **JWT**: JSON Web Token
- **OAuth**: Open Authorization
- **CORS**: Cross-Origin Resource Sharing
- **CSP**: Content Security Policy

### Tools

- **Bun**: JavaScript runtime and toolkit
- **Next.js**: React framework
- **TypeScript**: JavaScript with types
- **ESLint**: Code quality tool
- **Prettier**: Code formatter
- **Nx**: Monorepo build system
- **Vitest**: Testing framework
- **Playwright**: E2E testing tool
- **Storybook**: UI development environment

### Project Structure

- **apps**: Application code
- **packages**: Shared packages
- **libs**: Feature libraries
- **tools**: Development tools
- **docs**: Documentation
- **specs**: Technical specifications

### Version Control

- **Branch**: Code development line
- **Commit**: Code change record
- **PR**: Pull Request
- **Merge**: Combining code changes

### CI/CD

- **Pipeline**: Automated build and deploy process
- **Artifact**: Build output
- **Environment**: Deployment target
- **Release**: Production deployment

### Documentation

- **ADR**: Architecture Decision Record
- **RFC**: Request for Comments
- **API Doc**: API documentation
- **Changelog**: Version changes record

### Quality Assurance

- **Coverage**: Code testing extent
- **Lint**: Code style check
- **Benchmark**: Performance test
- **Audit**: Security check

### UI/UX

- **Design System**: UI component library
- **Design Token**: UI design variable
- **Wireframe**: Basic UI layout
- **Prototype**: Interactive design

### Monitoring

- **Metric**: Performance measure
- **Log**: Event record
- **Trace**: Request path
- **Alert**: Issue notification

### Infrastructure

- **Container**: Isolated runtime environment
- **Service**: Running application instance
- **Cache**: Temporary data store
- **CDN**: Content Delivery Network

### Development Methodology

- **TDD**: Test-Driven Development
- **BDD**: Behavior-Driven Development
- **DDD**: Domain-Driven Design
- **CI**: Continuous Integration
- **CD**: Continuous Deployment
