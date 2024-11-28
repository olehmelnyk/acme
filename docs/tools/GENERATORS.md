# Code Generation Tools

This document describes the code generation tools available in the ACME project. These tools help maintain consistency, reduce boilerplate, and enforce best practices across the codebase.

## Quick Start

```bash
# Create a new UI component
bun run create:component

# Create a new feature
bun run create:feature

# Implement an idea from the ideas directory
bun run implement:idea
```

## Component Generator

The component generator helps create UI components following our atomic design system.

### Usage

```bash
bun run create:component
```

### Options

- **Type**: Choose the component type
  - `atom`: Basic building blocks (buttons, inputs)
  - `molecule`: Simple combinations of atoms
  - `organism`: Complex UI components
  - `template`: Page-level components
  - `page`: Next.js pages

- **Name**: Component name (PascalCase)
  - Must start with capital letter
  - Can contain letters and numbers
  - Examples: `Button`, `UserProfile`, `DashboardLayout`

- **Description**: Brief component description
  - Minimum 10 characters
  - Used for documentation and AI generation

- **Features**:
  - TypeScript support
  - Storybook stories
  - Unit tests
  - Documentation

- **AI Generation**: Optional AI-assisted code generation

### Generated Structure

```
components/[type]s/[ComponentName]/
├── [ComponentName].tsx          # Component implementation
├── [ComponentName].stories.tsx  # Storybook stories
├── [ComponentName].test.tsx     # Unit tests
└── README.md                    # Component documentation
```

## Feature Generator

The feature generator creates new feature libraries with all necessary scaffolding.

### Usage

```bash
bun run create:feature
```

### Options

- **Name**: Feature name (kebab-case)
  - Must be lowercase
  - Words separated by hyphens
  - Examples: `user-authentication`, `data-export`

- **Description**: Feature description
  - Minimum 10 characters
  - Used for documentation generation

- **Documentation**:
  - Requirements specification
  - Technical design
  - Design assets
  - Testing strategy

- **AI Documentation**: Optional AI-assisted documentation generation

### Generated Structure

```
libs/[feature-name]/
├── src/
│   ├── index.ts
│   ├── types.ts
│   └── components/
├── tests/
│   └── integration/
├── docs/
│   ├── REQUIREMENTS.md
│   ├── TECHNICAL.md
│   ├── DESIGN.md
│   └── TESTING.md
└── README.md
```

## Idea Implementation

The idea implementation tool helps convert feature ideas into concrete implementation plans.

### Usage

```bash
bun run implement:idea
```

### Options

- **Path**: Path to the idea markdown file
  - Must be an existing file
  - Should be in the ideas directory

- **Type**:
  - `feature`: New feature implementation
  - `improvement`: Enhancement to existing feature
  - `experiment`: Experimental concept

- **Documentation**:
  - Analysis document
  - Technical design
  - Timeline estimation
  - Risk assessment

### Generated Structure

```
implementations/[idea-name]/
├── ANALYSIS.md
├── IMPLEMENTATION.md
├── TIMELINE.md
└── RISKS.md
```

## Template Customization

All generators use customizable templates located in the `templates` directory.

### Component Templates

```
templates/ui/component/
├── [name].tsx
├── [name].stories.tsx
├── [name].test.tsx
└── README.md
```

### Feature Templates

```
templates/feature/[name]/
├── src/
│   └── index.ts
├── tests/
│   └── integration/
└── docs/
    └── README.md
```

### Customizing Templates

1. Navigate to the appropriate template directory
2. Modify the template files
3. Use the following placeholders:
   - `[name]`: Component/Feature name
   - `[description]`: Component/Feature description
   - `[type]`: Component type
   - Additional placeholders can be added in `create.ts`

## AI Integration

The generators can optionally use AI to:

1. Generate component implementation
2. Create comprehensive documentation
3. Analyze feature ideas
4. Suggest implementation strategies

### AI Configuration

AI generation can be customized in `create.ts`:

```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }],
  temperature: 0.7,
  max_tokens: 2000,
});
```

## Best Practices

1. **Naming Conventions**
   - Components: PascalCase
   - Features: kebab-case
   - Files: Follow component/feature name

2. **Documentation**
   - Always include a description
   - Generate comprehensive documentation
   - Keep documentation up-to-date

3. **Testing**
   - Include unit tests for components
   - Add integration tests for features
   - Document testing strategy

4. **Code Organization**
   - Follow atomic design principles
   - Maintain clear separation of concerns
   - Use appropriate directory structure

## Troubleshooting

Common issues and solutions:

1. **Invalid Component Name**
   - Ensure name starts with capital letter
   - Use PascalCase format
   - Avoid special characters

2. **Invalid Feature Name**
   - Use lowercase letters
   - Separate words with hyphens
   - Avoid special characters

3. **AI Generation Issues**
   - Check OpenAI API key
   - Ensure description is detailed enough
   - Try adjusting AI parameters

## Contributing

To enhance the generators:

1. Add new templates in `templates/`
2. Modify generation logic in `create.ts`
3. Update validation rules in `validation.ts`
4. Add new prompts in `prompts.ts`
5. Update this documentation
