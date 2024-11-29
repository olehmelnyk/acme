# AI Instructions

This document provides guidelines for AI agents working with this codebase.

## Architecture Overview

This project follows a strict layered architecture with feature-sliced design in a monorepo setup. Refer to `/docs/architecture/OVERVIEW.md` for the complete architecture documentation.

## Key Principles

1. **Strict Layer Separation**
   - No direct dependencies between layers
   - Clear interfaces between layers
   - Each layer has its own responsibility

2. **Feature-Sliced Architecture**
   - Code is organized by features
   - Features are independent
   - Shared code goes to `/libs` or `/packages`

3. **Type Safety**
   - Use TypeScript everywhere
   - Maintain proper type definitions
   - No `any` types unless absolutely necessary

## Guidelines for AI Agents

### Code Generation

1. **Layer Compliance**
   - Generate code in the correct layer
   - Follow layer-specific patterns
   - Maintain layer isolation

2. **Feature Organization**
   - Put feature code in appropriate directories
   - Create shared code in `/libs` or `/packages`
   - Follow feature-sliced structure

3. **Type Safety**
   - Generate TypeScript code
   - Include type definitions
   - Use proper typing

### Documentation

1. **Keep Documentation Updated**
   - Update relevant .md files
   - Maintain architecture diagrams
   - Document new patterns

2. **Code Comments**
   - Add JSDoc comments
   - Explain complex logic
   - Document edge cases

### Testing

1. **Test Coverage**
   - Generate tests for new code
   - Follow testing patterns
   - Include edge cases

2. **Mock Data**
   - Create realistic test data
   - Use proper typing for mocks
   - Follow existing patterns

## Layer-Specific Instructions

### UI Layer
- Follow Atomic Design
- Use shadcn components
- Implement proper a11y
- Support i18n
- Support themes

### DAL Layer
- Use proper API patterns
- Implement caching
- Handle errors
- Generate types
- Follow security practices

### Business Logic Layer
- Pure business logic
- No UI/DAL dependencies
- Proper validation
- Error handling
- Domain modeling

## Error Handling

1. **Type-Safe Errors**
   - Create proper error types
   - Handle all cases
   - Provide meaningful messages

2. **Layer-Specific Handling**
   - UI: User-friendly messages
   - DAL: Data validation
   - BL: Business rules

## Security Considerations

1. **Authentication**
   - Use NextAuth.js
   - Implement proper JWT
   - Handle 2FA

2. **Data Safety**
   - Validate inputs
   - Sanitize outputs
   - Follow security best practices

## Performance Guidelines

1. **Optimization**
   - Proper caching
   - Code splitting
   - Bundle optimization

2. **State Management**
   - Efficient updates
   - Proper invalidation
   - Optimistic updates

Remember to always refer to the architecture documentation when making changes or additions to the codebase.

- After making changes to the stack, update configs or file/folder structure - don't forget to update docs.

- "+" is the alias for "continue"
- dont forget we are using bun, not npm
- dont forget bun does not have bun audit command

- when I ask to "commit" staged - I want you to generate a commit message baased on changes in staged that also follows our commit conventions