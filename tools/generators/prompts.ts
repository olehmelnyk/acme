import type { Question, Answers } from 'inquirer'
import { ComponentAnswers, FeatureAnswers, IdeaAnswers } from './types'

type QuestionType = 'input' | 'number' | 'confirm' | 'list' | 'rawlist' | 'expand' | 'checkbox' | 'password' | 'editor'

interface Choice {
  name: string
  value: string
  checked?: boolean
}

interface PromptQuestion<T> {
  type: QuestionType
  name: keyof T & string
  message: string
  default?: any
  choices?: Choice[] | string[]
  validate?: (input: any) => boolean | string | Promise<boolean | string>
  when?: boolean | ((answers: T) => boolean)
}

export const componentPrompts: Array<PromptQuestion<ComponentAnswers>> = [
  {
    type: 'list',
    name: 'type',
    message: 'What type of component would you like to create?',
    choices: ['atom', 'molecule', 'organism', 'template', 'page']
  },
  {
    type: 'input',
    name: 'name',
    message: 'What is the name of your component?',
    validate: (input: string) => {
      if (input.length < 3) {
        return 'Component name must be at least 3 characters long'
      }
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
        return 'Component name must start with a capital letter and contain only alphanumeric characters'
      }
      return true
    }
  },
  {
    type: 'input',
    name: 'description',
    message: 'Provide a brief description of your component:',
    validate: (input: string) => {
      if (input.length < 10) {
        return 'Description must be at least 10 characters long'
      }
      return true
    }
  },
  {
    type: 'checkbox',
    name: 'customization',
    message: 'Select customization options:',
    choices: [
      { name: 'Styled Components', value: 'styled', checked: true },
      { name: 'TypeScript', value: 'typescript', checked: true },
      { name: 'Unit Tests', value: 'tests', checked: true },
      { name: 'Storybook', value: 'storybook', checked: true }
    ]
  },
  {
    type: 'confirm',
    name: 'useAI',
    message: 'Would you like to use AI to generate component implementation?',
    default: false
  }
]

export const featurePrompts: Array<PromptQuestion<FeatureAnswers>> = [
  {
    type: 'input',
    name: 'name',
    message: 'What is the name of your feature?',
    validate: (input: string) => {
      if (input.length < 3) {
        return 'Feature name must be at least 3 characters long'
      }
      if (!/^[a-z][a-zA-Z0-9-]*$/.test(input)) {
        return 'Feature name must start with a lowercase letter and contain only alphanumeric characters and hyphens'
      }
      return true
    }
  },
  {
    type: 'input',
    name: 'description',
    message: 'Provide a brief description of your feature:',
    validate: (input: string) => {
      if (input.length < 10) {
        return 'Description must be at least 10 characters long'
      }
      return true
    }
  },
  {
    type: 'checkbox',
    name: 'customization',
    message: 'Select customization options:',
    choices: [
      { name: 'API Integration', value: 'api', checked: true },
      { name: 'State Management', value: 'state', checked: true },
      { name: 'Unit Tests', value: 'tests', checked: true },
      { name: 'Documentation', value: 'docs', checked: true }
    ]
  },
  {
    type: 'confirm',
    name: 'generateDocs',
    message: 'Would you like to generate documentation?',
    default: true
  }
]

export const ideaPrompts: Array<PromptQuestion<IdeaAnswers>> = [
  {
    type: 'input',
    name: 'path',
    message: 'Where would you like to implement your idea? (relative path)',
    validate: (input: string) => {
      if (!input) {
        return 'Path is required'
      }
      if (!/^[a-zA-Z0-9-_/]+$/.test(input)) {
        return 'Path must contain only alphanumeric characters, hyphens, underscores, and forward slashes'
      }
      return true
    }
  },
  {
    type: 'list',
    name: 'type',
    message: 'What type of idea is this?',
    choices: ['feature', 'improvement', 'experiment']
  },
  {
    type: 'editor',
    name: 'content',
    message: 'Describe your idea in detail:',
    validate: (input: string) => {
      if (input.length < 50) {
        return 'Idea description must be at least 50 characters long'
      }
      return true
    }
  },
  {
    type: 'checkbox',
    name: 'customization',
    message: 'Select implementation options:',
    choices: [
      { name: 'POC Implementation', value: 'poc', checked: true },
      { name: 'Documentation', value: 'docs', checked: true },
      { name: 'Tests', value: 'tests', checked: true },
      { name: 'Metrics', value: 'metrics', checked: true }
    ]
  },
  {
    type: 'confirm',
    name: 'generateImplementation',
    message: 'Would you like to generate a basic implementation?',
    default: true
  }
]

export const promptTemplates = {
  component: {
    atom: `Create a reusable atomic React component named [name].
Description: [description]

Requirements:
- TypeScript with strict typing
- Tailwind CSS for styling
- Accessibility considerations
- Error handling
- Loading states
- Interactive states (hover, focus, etc.)
- Proper prop documentation
- Unit test cases

Component should be:
- Self-contained
- Reusable
- Accessible
- Performance optimized`,

    molecule: `Create a composite React component named [name] that combines multiple atomic components.
Description: [description]

Requirements:
- TypeScript with strict typing
- Proper component composition
- State management if needed
- Event handling
- Loading states
- Error states
- Accessibility features
- Responsive design
- Unit and integration tests`,

    organism: `Create a complex React component named [name] that represents a complete interface section.
Description: [description]

Requirements:
- TypeScript with strict typing
- Complex state management
- Data fetching if needed
- Error boundary implementation
- Loading states
- Empty states
- Complex interactions
- Responsive design
- Comprehensive testing
- Performance optimization
- Accessibility compliance`,

    template: `Create a page template component named [name].
Description: [description]

Requirements:
- TypeScript with strict typing
- Flexible layout system
- Responsive design
- Theme support
- Loading states
- Error states
- SEO considerations
- Performance optimization
- Accessibility compliance
- Documentation for usage`,

    page: `Create a Next.js page component named [name].
Description: [description]

Requirements:
- TypeScript with strict typing
- SEO metadata
- Data fetching
- Error handling
- Loading states
- Layout integration
- Responsive design
- Analytics integration
- Performance optimization
- Accessibility compliance`
  },
  feature: {
    requirements: `Generate detailed requirements for a feature named [name].
Description: [description]

Include:
1. User Stories
   - As a [user type]
   - I want to [action]
   - So that [benefit]

2. Functional Requirements
   - Core functionality
   - Optional features
   - Edge cases
   - Error scenarios

3. Non-functional Requirements
   - Performance criteria
   - Security requirements
   - Accessibility requirements
   - SEO requirements
   - Analytics requirements

4. Technical Requirements
   - API endpoints
   - Database schema
   - State management
   - Cache strategy
   - Security measures

5. UI/UX Requirements
   - User flows
   - Interface elements
   - Responsive design
   - Animations/transitions
   - Error states
   - Loading states`,

    technical: `Generate technical specification for a feature named [name].
Description: [description]

Include:
1. Architecture Overview
   - Component structure
   - Data flow
   - State management
   - API design
   - Database design

2. Implementation Details
   - Frontend components
   - Backend services
   - Database schema
   - API endpoints
   - State management
   - Cache strategy
   - Security measures

3. Performance Considerations
   - Optimization strategies
   - Caching approach
   - Loading strategies
   - Bundle optimization

4. Security Considerations
   - Authentication
   - Authorization
   - Data protection
   - API security
   - Input validation

5. Testing Strategy
   - Unit tests
   - Integration tests
   - E2E tests
   - Performance tests
   - Security tests`,

    implementation: `Generate implementation plan for a feature named [name].
Description: [description]

Include:
1. Phase 1: Setup
   - Project structure
   - Dependencies
   - Configuration
   - Basic scaffolding

2. Phase 2: Core Implementation
   - Database schema
   - API endpoints
   - Core business logic
   - Basic UI components

3. Phase 3: Enhancement
   - Advanced features
   - Optimization
   - Polish UI/UX
   - Add animations

4. Phase 4: Testing
   - Unit tests
   - Integration tests
   - E2E tests
   - Performance testing
   - Security testing

5. Phase 5: Documentation
   - API documentation
   - Component documentation
   - Usage examples
   - Deployment guide`
  },
  idea: {
    analysis: `Analyze this feature idea and provide detailed feedback:

1. Feasibility Analysis
   - Technical feasibility
   - Resource requirements
   - Timeline estimation
   - Potential challenges

2. Impact Analysis
   - User benefits
   - Business value
   - Technical impact
   - Resource impact

3. Risk Analysis
   - Technical risks
   - Business risks
   - Security risks
   - Mitigation strategies

4. Implementation Recommendations
   - Technical approach
   - Resource allocation
   - Timeline planning
   - Success metrics`,

    implementation: `Generate implementation strategy for this idea:

1. Technical Architecture
   - Component structure
   - Data flow
   - API design
   - Database design

2. Implementation Phases
   - Setup phase
   - Core development
   - Enhancement
   - Testing
   - Documentation

3. Resource Requirements
   - Development team
   - Design resources
   - Infrastructure
   - External services

4. Timeline and Milestones
   - Phase durations
   - Key milestones
   - Dependencies
   - Critical path`
  }
}
