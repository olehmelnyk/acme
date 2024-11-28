# Template System

This document describes the template system used in the ACME project. Templates ensure consistency across the codebase and make it easy to create new components, features, and documentation.

## Directory Structure

```
templates/
├── ui/
│   ├── component/
│   ├── page/
│   └── template/
├── feature/
│   └── [name]/
└── docs/
    ├── component/
    ├── feature/
    └── idea/
```

## UI Templates

### Component Template

Basic React component template with TypeScript, Storybook, and testing.

```typescript
// [name].tsx
import React from 'react'
import styles from './[name].module.css'

export interface [name]Props {
  children?: React.ReactNode
}

export const [name]: React.FC<[name]Props> = ({ children }) => {
  return (
    <div className={styles.root}>
      {children}
    </div>
  )
}
```

### Story Template

Storybook story template with common scenarios.

```typescript
// [name].stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { [name] } from './[name]'

const meta: Meta<typeof [name]> = {
  title: '[type]/[name]',
  component: [name],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof [name]>

export const Default: Story = {
  args: {
    children: 'Default [name]',
  },
}
```

### Test Template

Jest/Vitest test template with common test cases.

```typescript
// [name].test.tsx
import { render, screen } from '@testing-library/react'
import { [name] } from './[name]'

describe('[name]', () => {
  it('renders children correctly', () => {
    render(<[name]>Test Content</[name]>)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })
})
```

## Feature Templates

### Feature Structure

```
[name]/
├── src/
│   ├── index.ts
│   ├── types.ts
│   └── components/
├── tests/
│   └── integration/
└── docs/
    ├── REQUIREMENTS.md
    ├── TECHNICAL.md
    └── README.md
```

### Entry Point Template

```typescript
// index.ts
export * from './types'
export * from './components'

// Add feature-specific exports here
```

### Types Template

```typescript
// types.ts
export interface [Name]Config {
  // Configuration options
}

export interface [Name]Props {
  // Component props
}

export interface [Name]State {
  // State management
}
```

## Documentation Templates

### Component Documentation

```markdown
# [name]

[description]

## Usage

\```tsx
import { [name] } from '@acme/ui'

function Example() {
  return <[name]>Content</[name]>
}
\```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| prop | type | default | description |

## Examples

### Basic Usage

\```tsx
<[name]>Basic example</[name]>
\```

### Advanced Usage

\```tsx
<[name] customProp="value">
  Advanced example
</[name]>
\```

## Best Practices

- Usage guideline 1
- Usage guideline 2

## Accessibility

- A11y consideration 1
- A11y consideration 2

## Related Components

- Related component 1
- Related component 2
```

### Feature Documentation

#### Requirements Template

```markdown
# [name] Requirements

## Overview

[description]

## User Stories

### Story 1
As a [user type]
I want to [action]
So that [benefit]

### Story 2
...

## Functional Requirements

1. Requirement 1
2. Requirement 2

## Non-functional Requirements

1. Performance
2. Security
3. Accessibility

## Constraints

1. Technical constraints
2. Business constraints

## Dependencies

1. External system 1
2. Internal system 2
```

#### Technical Specification Template

```markdown
# [name] Technical Specification

## Architecture

### Components

1. Component 1
   - Purpose
   - Responsibilities
   - Interfaces

2. Component 2
   ...

### Data Model

\```typescript
interface Model {
  // Type definitions
}
\```

### APIs

#### Endpoint 1

\```typescript
POST /api/[name]
{
  // Request body
}
\```

## Implementation Details

### Phase 1
- Task 1
- Task 2

### Phase 2
...

## Testing Strategy

1. Unit Tests
2. Integration Tests
3. E2E Tests
```

## Template Customization

### Adding New Placeholders

1. Add placeholder to template:
```
[newPlaceholder]
```

2. Update replacement logic in `create.ts`:
```typescript
const replacements = {
  name: config.name,
  description: config.description,
  newPlaceholder: config.newValue,
}
```

### Creating New Templates

1. Create directory:
```bash
mkdir -p templates/[category]/[type]
```

2. Add template files:
```bash
touch templates/[category]/[type]/[name].[ext]
```

3. Update generator in `create.ts`

### Modifying Existing Templates

1. Locate template:
```bash
templates/[category]/[type]/
```

2. Edit template files
3. Test with generator:
```bash
bun run create:[type]
```

## Best Practices

1. **Template Design**
   - Keep templates simple and focused
   - Use meaningful placeholders
   - Include comprehensive documentation
   - Follow project conventions

2. **Placeholder Usage**
   - Use descriptive names
   - Document all placeholders
   - Maintain consistency across templates

3. **Documentation**
   - Include usage examples
   - Document all props/options
   - Add accessibility guidelines
   - Reference related components/features

4. **Testing**
   - Include test templates
   - Cover common scenarios
   - Add performance tests
   - Include accessibility tests

## Contributing

To contribute new templates:

1. Create feature branch
2. Add/modify templates
3. Update documentation
4. Add tests
5. Submit pull request

## Template Validation

The template system includes validation to ensure:

1. **Naming Conventions**
   - Component names (PascalCase)
   - Feature names (kebab-case)
   - File names match component/feature

2. **Required Files**
   - Implementation files
   - Test files
   - Documentation files
   - Type definitions

3. **Code Quality**
   - TypeScript support
   - ESLint configuration
   - Prettier formatting
   - Import organization

## Future Improvements

1. **Template Features**
   - More component variants
   - Additional documentation templates
   - Integration test templates
   - Performance test templates

2. **Tooling**
   - Template validation
   - Automated updates
   - Migration tools
   - Template analytics

3. **Documentation**
   - Interactive examples
   - Visual guides
   - Video tutorials
   - Best practices guide
