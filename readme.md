# ACME Project

## Disclaimer

This project was heavily generated by Windsurf AI. I was wondering how far I can go with just AI prompts and trying not to write anything by myself. I started with the prompt - something like "I want to create a monorepo with Nx.dev, I want to use NextJS for FE and BFF, I want to use Vitest and Playwrite for testing, storybook with shadcn/ui, I want to use bun instead of npm or pnpm" - maybe not exact prompt, but close.

Then I realised that new AIs and VS Code forks appears every day or two, and I need a way to share my ideas and vision with other AIs or humans who might be interested in the project or who might be able to help. So I throw into AI some architecture ideas / patterns / tools and best practices and asked to put them into /docs section in .md files - so other AIs or humans might read, understand and follow them. I also asked AI to update docs when I make changes and vice versa - when I manually update .md files - this means we need to update the codebase. So far this strategy works pretty well, and highly effective.

## Overview

This repository contains the source code for the ACME project.
It's a blueprint / playground for a common projects.

It suppose to have some core features, pretty much any project should have:

- auth
- roles:user / customer / admin
- admin dashboard
- user dashboard
- some basic CRUD operations (basic API patterns, search, filtering, sorting, pagination, etc)
- some UI components
- send emails / push notifications
- upload files / images
- messanger (text chat, voice chat, video chat, AI chat, group chat, file sharing, etc)

Might be extended to have more specific features like:

- blog
- forum
- knowledge base / FAQ / support
- social media / networking
- e-commerce / app store / online store / marketplace
- AI / chatbot
- job board / recruiting / freelance
- dating app
- events / calendar
- media (news aggregator, music, radio, podcasts, video, games, etc.)
- web scraping / crawling / scraping
- analytics / monitoring
- SaaS / CRM / ORM
- crowdfunding / venture capital / startup
- internal tools for business operations and automation
- etc.

## Repository Structure

```
/acme
├── .windsurfrules       # AI guidelines and instructions for Windsurf
├── .cursorrules         # Symlink to .windsurfrules for Cursor
├── .github
│   ├── workflows        # GitHub Actions workflows
│   ├── PULL_REQUEST_TEMPLATE
│   └── copilot-instructions.md  # Symlink to .windsurfrules for GitHub Copilot
│
├── /apps                  # Application-specific code
│   ├── /web              # Next.js web application (including admin)
│   ├── /mobile           # Expo mobile application
│   ├── /desktop          # Nextron desktop application
│   ├── /services         # Backend services (Hono/Elysia)
│   └── /chatbots         # Various chatbot implementations
│
├── /packages             # Shared packages
│   ├── /ui              # UI components and design system
│   ├── /config          # Shared configuration
│   └── /types           # Shared TypeScript types
│
├── /libs                 # Feature libraries
│   ├── /auth            # Authentication and authorization
│   ├── /user            # User management
│   ├── /blog            # Blog functionality
│   ├── /chat            # Messaging system
│   └── /media           # Media handling
│
├── /docs                # Project documentation
│   ├── /architecture    # Architecture diagrams and decisions
│   ├── /development    # Development guidelines
│   ├── /deployment     # Deployment procedures
│   ├── /security       # Security guidelines
│   └── /testing        # Testing strategies
│
├── /templates           # Project templates
│   ├── /ui             # UI component templates
│   │   └── /component  # Basic component template
│   │       ├── [name].tsx
│   │       ├── [name].stories.tsx
│   │       ├── [name].spec.tsx
│   │       ├── README.md
│   │       └── index.ts
│   │
│   └── /feature        # Feature implementation templates
│       └── /[name]     # Feature template structure
│           ├── /docs   # Feature documentation
│           │   ├── REQUIREMENTS.md
│           │   ├── TECHNICAL.md
│           │   └── TESTING.md
│           ├── /design # Design assets
│           │   ├── /wireframes
│           │   ├── /mockups
│           │   └── /user-flows
│           ├── /src    # Implementation
│           └── README.md
│
├── /tools               # Internal tooling
│   ├── /scripts        # Utility scripts
│   ├── /generators     # Code generators
│   └── /helpers        # Helper utilities
│
├── /.husky             # Git hooks for code quality and security
│   ├── /pre-commit    # Pre-commit validation and checks
│   ├── /commit-msg    # Commit message validation
│   └── /post-checkout # Environment and dependency management
│
├── /specs               # Detailed specifications
│   ├── /requirements   # Feature requirements
│   ├── /ui-ux          # UI/UX specifications
│   ├── /technical      # Technical specifications
│   └── /testing        # Test specifications
│
├── /ideas              # Project ideas and proposals
│   ├── /features      # Feature ideas
│   ├── /improvements  # Improvement proposals
│   └── /experiments   # Experimental concepts
│
└── /tmp                 # Temporary files and drafts
```

## Security

This project implements comprehensive security measures:

### Automated Security Tools

- **Dependabot**: Automated dependency updates and security patches
- **CodeQL Analysis**: Continuous code scanning for vulnerabilities
- **Security Headers**: Robust HTTP security headers implementation
- **Rate Limiting**: API protection against abuse

For detailed security information and vulnerability reporting guidelines, see our [Security Documentation](docs/security/readme.md).

## Template System

### UI Component Template

The UI component template provides a standardized structure for creating new components:

```
/templates/ui/component
├── [name].tsx           # Component implementation
├── [name].stories.tsx   # Storybook stories
├── [name].spec.tsx      # Component tests
├── README.md            # Component documentation
└── index.ts            # Public exports
```

### Feature Template

The feature template includes everything needed for full feature implementation:

```
/templates/feature/[name]
├── /docs
│   ├── REQUIREMENTS.md  # Customer requirements
│   ├── TECHNICAL.md     # Technical specifications
│   └── TESTING.md       # Testing strategy
├── /design
│   ├── /wireframes     # Low-fidelity designs
│   ├── /mockups        # High-fidelity designs
│   └── /user-flows     # User flow diagrams
├── /src                # Implementation
└── README.md           # Feature overview
```

### Ideas Directory

The ideas directory is organized to capture various types of proposals:

```
/ideas
├── /features          # New feature proposals
│   ├── FEATURE_1.md
│   └── FEATURE_2.md
├── /improvements     # Improvement suggestions
│   ├── IMPROVEMENT_1.md
│   └── IMPROVEMENT_2.md
└── /experiments      # Experimental concepts
    ├── EXPERIMENT_1.md
    └── EXPERIMENT_2.md
```

## Template Usage

We provide CLI tools to scaffold new components and features:

```bash
# Create a new UI component
bun run create:component Button

# Create a new feature
bun run create:feature UserAuthentication

# Generate implementation from idea
bun run implement:idea features/FEATURE_1.md
```

These commands will:

1. Copy the appropriate template
2. Replace placeholders with actual names
3. Prompt for additional information
4. Use AI to help generate initial content
5. Set up the required file structure

## Core Features

1. **Authentication & Authorization**

   - Multi-factor authentication
   - Role-based access control
   - OAuth2 integration
   - JWT implementation

2. **User Management**

   - User profiles
   - Role management (user/customer/admin)
   - Account settings
   - Preferences management

3. **Dashboard Systems**

   - Admin dashboard
   - User dashboard
   - Analytics and reporting
   - Activity monitoring

4. **API Features**

   - RESTful and GraphQL endpoints
   - Advanced CRUD operations
   - Search functionality
   - Filtering and sorting
   - Pagination
   - Rate limiting
   - Caching

5. **UI Components**

   - shadcn/ui integration
   - Responsive design
   - Theme customization
   - Accessibility compliance

6. **Communication**

   - Email notifications
   - Push notifications
   - Real-time updates
   - Webhook integrations

7. **File Management**

   - File upload/download
   - Image processing
   - Document handling
   - Cloud storage integration

8. **Messaging System**

   - Text chat
   - Voice chat
   - Video chat
   - AI chat integration
   - Group chat
   - File sharing
   - Message encryption

9. **Security Infrastructure**
   - Automated security scanning with Trivy
   - Secret detection with Gitleaks
   - Dependency vulnerability scanning
   - Pre-commit security hooks
   - Environment variable protection
   - See [Security Documentation](docs/security/readme.md) for details

## Extended Features (Optional)

1. **Content Management**

   - Blog system
   - Forum functionality
   - Knowledge base
   - FAQ management
   - Support ticketing

2. **Social Features**

   - User profiles
   - Social connections
   - Activity feeds
   - Content sharing

3. **E-commerce**

   - Product management
   - Shopping cart
   - Payment processing
   - Order management
   - Inventory tracking

4. **AI Integration**

   - Chatbots
   - Content generation
   - Recommendation systems
   - Automated moderation

5. **Business Tools**

   - Job board
   - Recruiting system
   - Freelance marketplace
   - Project management

6. **Media Features**

   - News aggregation
   - Podcast system
   - Video streaming
   - Music playback
   - Gaming integration

7. **Data & Analytics**

   - Web scraping
   - Data visualization
   - Performance monitoring
   - User analytics

8. **Business Operations**
   - CRM functionality
   - SaaS features
   - Automation tools
   - Workflow management

## AI Integration Guidelines

This project uses a shared set of AI guidelines stored in `.windsurfrules`. To ensure consistent AI assistance across different tools, we maintain symlinks to this file:

- `.cursorrules` - Symlink for Cursor AI
- `.github/copilot-instructions.md` - Symlink for GitHub Copilot

These files contain shared instructions, best practices, and conventions that all AI assistants should follow when helping with this project. This ensures consistency in code generation, suggestions, and automated tasks across different AI tools.

## Documentation

For detailed documentation, please refer to:

- [System Architecture](docs/architecture/diagrams.md)
- [Development Guide](docs/architecture/development.md)
- [API Documentation](docs/architecture/api.md)

## New Tools and Scripts

### Package Management

The project uses Bun as the package manager. Here are the key commands:

```bash
# Install dependencies in all packages
bun run install:all

# Clean up dependencies and artifacts
bun run clean:all            # Clean with confirmation
bun run clean:all --force    # Clean without confirmation
bun run clean:all --dry-run  # Show what would be cleaned
```

### Documentation Management

We use a custom docs-manager tool to maintain documentation:

```bash
# Format documentation
bun run docs:format        # Format with preview
bun run docs:format:check  # Check formatting
bun run docs:format:fix    # Fix formatting issues
bun run docs:maintain      # Run all documentation maintenance tasks
```

These tools are located in the `/tools` directory:

- `cleanup` - Manages project cleanup (dependencies, artifacts, etc.)
- `docs-manager` - Handles documentation formatting and maintenance
- `docs-fetcher` - Fetches and processes documentation

## Build Output Structure

All build outputs, test results, and generated files are organized under the `artifacts` directory in the root:

```
artifacts/
├── apps/
│   ├── web/
│   │   ├── dist/           # Production build
│   │   ├── dev/            # Development build
│   │   ├── coverage/       # Test coverage
│   │   ├── storybook/      # Storybook static build
│   │   └── lint/           # ESLint output
│   └── web-e2e/
│       ├── playwright/     # Playwright test results
│       │   ├── html-report/
│       │   └── results.xml
│       ├── lint/           # ESLint output
│       └── types/          # TypeScript checking output
└── packages/               # (for future package outputs)
```

This structure ensures:

- All generated files are in one centralized location
- Clear separation between different types of outputs
- Easy cleanup of all generated files
- Prevention of source directory clutter
- Consistent structure across all projects
- Better CI/CD integration with predictable paths

### Cleanup Script

The project includes a cleanup script to manage generated files and caches:

```bash
# Basic cleanup
bun run cleanup

# Cleanup and reinstall dependencies
bun run cleanup --reinstall
```

The cleanup script handles:

- Build outputs (`artifacts` directory)
- Build caches (`.next`, `dist`, etc.)
- Test coverage directories
- Node modules and package manager files
- Nx cache
- Any stray output directories

## Development Stack

- **Runtime & Package Management**: Bun
- **Frontend**: Next.js, TypeScript, Tailwind CSS, shadcn/ui
- **Testing**: Vitest, Playwright
- **UI Development**: Storybook
- **Monorepo Management**: Nx.dev
- **Version Control**: Git
- **CI/CD**: GitHub Actions

## Development Setup

### Prerequisites

- Node.js >= 20.0.0
- Bun >= 1.0.0
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/acme.git
cd acme

# Install dependencies
bun install

# Set up security tools
bun run security:setup

# Start development server
bun run dev
```

### Development Tools

- Nx Console for VS Code
- ESLint + Prettier
- Husky for Git hooks
- Security scanning tools (Trivy, Gitleaks)

## Getting Started

Describe how to use the project here.

## Contributing

For information about contributing to this project, please see our [contributing guide](./contributing.md).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
