Virtual Team Modes Documentation
This document outlines the modes defined in the .roomode file for your virtual team in Roo Code, covering the Software Development Life Cycle (SDLC) from brainstorming to maintenance. Each mode includes detailed descriptions, usage instructions, suggested Large Language Models (LLMs) with human-readable names (e.g., "Anthropic Claude Sonnet 3.5", "OpenAI o3-mini"), real Model Context Protocol (MCP) servers with hyperlinks from github.com/modelcontextprotocol/servers and glama.ai/mcp/servers, third-party tools, and extensive workflows. New modes for mobile (React Native), desktop (Electron/Nextron), SEO, and copywriting have been added, along with third-party integrations.

Base Instructions
All modes adhere to foundational rules defined in .windsurfrules, which include:

Artifact-Based Suggestions: Base suggestions on existing project artifacts.
Minimal Changes: Propose the smallest necessary changes.
Task Handoffs: Reference and update plans (e.g., @plan.md) with confidence levels, time estimates, priorities, dependencies, and assignments.
Extra Tasks: Suggest new tasks in @plan.md, create Jira/GitHub tickets, and notify via Slack/MS Teams.
Mode Switching: Suggest switching to more suitable modes when appropriate.
Error Logging: Log errors in logs/errors.md.
Version Control: Suggest commits for significant changes.
Clarity: Provide concise, actionable responses and ask for clarification if unsure.
File Naming: Use consistent suffixes like *-plan.md, *-spec.md.
For the full list of base rules, refer to the .windsurfrules file.

Special Command: /help
Purpose: Request assistance when stuck.
Actions: Posts to Slack/MS Teams (e.g., "Stuck on login API—need help!"), suggests pair programming, or splits work.
Usage: /help "I’m stuck on integrating the API"
Role Switching
Each mode (role) is defined in the root .roomode file. To switch between roles:

Basic Switching: Use /role=ROLE_NAME (e.g., /role=architect)
Role Confirmation: Each response will start with "[ROLE_NAME]" to confirm the active role
Role Reset: Use /role=reset to return to base mode
Invalid Roles: If an invalid role is specified, you'll receive an "Invalid role" message with a list of available roles
Base Rules: Windsurf base rules apply unless explicitly overridden by the role's customInstructions
Smart Switching: The AI may suggest switching to a more appropriate role if it would better handle your request
For example:

text
Wrap
Copy
User: /role=architect
AI: [architect] I'll help you with system architecture...

User: /role=invalid_role
AI: Invalid role. Available roles:
- architect
- code
- uiux
...

User: /role=reset
AI: Returned to base mode.
Thoughts on OpenAI o3-mini and Ollama
OpenAI o3-mini: A fast, distilled reasoning model from OpenAI, excelling in coding, science, and math (released January 31, 2025, per X posts). It’s lightweight, making it ideal for quick tasks like /unit-tester or /code on smaller codebases. Its integration with search (via an early prototype) enhances its utility for /research, though it may lack the depth of larger models like openai-o3 for complex reasoning. Great for resource-constrained environments or rapid prototyping.
Ollama: An open-source framework for running LLMs locally (e.g., LLaMA variants). It’s not a model but a tool, offering flexibility for self-hosted setups. Useful for modes like /mobile-developer or /desktop-developer where local execution avoids API costs. Pair it with models like deepseek-r1-20241001 via /research for offline research, though it requires setup overhead and may not match cloud-based models’ speed or updates.
Modes by Category
Planning and Requirements
Ask
Description: Quick Q&A assistant for clarifications based on artifacts or general knowledge.
How to Use: /ask "What’s the login endpoint?" → Outputs answer or suggests /research.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Fast, articulate responses for quick queries, ideal for concise answers.
Grok 3: Broad knowledge with a conversational tone, suitable for general or exploratory questions.
Gemini Flash 2: Lightweight and fast, perfect for quick, artifact-based lookups.
Real MPCs: None.
Third-Party Tools: None.
Example: /ask "Explain OAuth in @system-design.md" → "Token-based auth; see /research."
Requirements Analyst
Description: Gathers and documents detailed requirements, producing user stories and acceptance criteria.
How to Use: /requirements-analyst "Define login requirements" → Updates requirements.md.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Precise, structured output for detailed requirements, excels in clarity.
Deepseek R1: Strong reasoning for complex requirement analysis, ideal for technical dependencies.
Anthropic Claude Opus: Detailed and comprehensive, suitable for in-depth user stories and acceptance criteria.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>: GitHub issues.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-atlassian">server-atlassian</a>: Jira tickets.
Third-Party Tools: None.
Example: /requirements-analyst "Payment flow" → - [ ] Add Stripe (Assigned To: /ba, Confidence: 90%, Est: 2h, Priority: High, Dep: Stakeholder approval) → Jira ticket via <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-atlassian">server-atlassian</a>.
Architect
Description: Defines high-level architecture and strategy across platforms (web, mobile, desktop).
How to Use: /architect "Plan scalable login" → Updates plan.md.
Suggested LLMs:
Deepseek R1: Deep technical reasoning for architecture, ideal for complex systems and scalability.
Anthropic Claude Opus: Strategic and structured planning for large systems, excels in long-term vision.
Anthropic Claude Sonnet 3.5: Precise and detailed, suitable for technical strategy and high-level designs.
Real MPCs: None.
Third-Party Tools: None.
Example: /architect "Login system" → - [ ] Use OAuth2 (Assigned To: /system-designer, Confidence: 95%, Est: 4h, Priority: High, Dep: Requirements).
Business Analyst (BA)
Description: Bridges business needs to technical specs for all platforms.
How to Use: /ba "Formalize payment spec" → Updates spec.md.
Suggested LLMs:
Anthropic Claude Opus: Detailed, business-focused output, ideal for translating business needs to technical specs.
Grok 3: Concise, practical specs, suitable for quick, actionable documentation.
Anthropic Claude Sonnet 3.5: Structured and precise, perfect for aligning business and technical requirements.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-atlassian">server-atlassian</a>: Jira integration.
Third-Party Tools: None.
Example: /ba "Payment spec" → - [ ] Stripe on mobile (Assigned To: /mobile-developer, Confidence: 85%, Est: 3h, Priority: Medium, Dep: API) → Jira via <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-atlassian">server-atlassian</a>.
Research
Description: Investigates technologies or ambiguities (e.g., mobile frameworks, desktop performance).
How to Use: /research "SSO for mobile" → Updates research-notes.md.
Suggested LLMs:
Deepseek R1: In-depth technical research, ideal for exploring complex technologies and frameworks.
Grok 3: Quick, practical insights for immediate needs, suitable for preliminary research.
Gemini Flash 2: Fast and lightweight, perfect for quick lookups and initial investigations.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-brave-search">server-brave-search</a>: Web searches.
Third-Party Tools:
Perplexity: AI-driven research for up-to-date information.
Example: /research "React Native SSO" → - [ ] Evaluate Okta (Assigned To: /mobile-developer, Confidence: 70% - Limited data, Est: 3h, Priority: Medium, Dep: None) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-brave-search">server-brave-search</a> and Perplexity.
Brainstorm
Description: Generates ideas or solutions for all platforms.
How to Use: /brainstorm "Desktop login features" → Updates brainstorm-ideas.md.
Suggested LLMs:
Grok 3: Creative, out-of-the-box ideas, ideal for exploratory brainstorming.
Anthropic Claude Sonnet 3.5: Structured, strategic suggestions, suitable for focused ideation.
Gemini Flash 2: Fast and lightweight, perfect for quick, creative sparks.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-brave-search">server-brave-search</a>: Web inspiration.
Third-Party Tools: None.
Example: /brainstorm "Desktop login" → - [ ] Add biometric login (Assigned To: /desktop-developer, Confidence: 60% - Feasibility unclear, Est: 2h, Priority: Low, Dep: Research) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-brave-search">server-brave-search</a>.
Design
System Designer
Description: Creates detailed technical designs (e.g., APIs, schemas) for all platforms.
How to Use: /system-designer "Design login API" → Updates system-design.md.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Precise, detailed technical designs, ideal for clear and structured outputs.
Deepseek R1: Complex reasoning for intricate systems, suitable for technical depth and scalability.
Anthropic Claude Opus: Comprehensive and strategic, perfect for large-scale system designs.
Real MPCs: None.
Third-Party Tools: None.
Example: /system-designer "Login API" → - [ ] POST /login endpoint (Assigned To: /code, Confidence: 95%, Est: 2h, Priority: High, Dep: Plan).
UI/UX
Description: Designs interfaces and experiences, producing wireframes or code snippets for web, mobile, and desktop.
How to Use: /uiux "Design mobile login screen" → Updates uiux.md.
Suggested LLMs:
Grok 3: Creative, user-centric design ideas, ideal for innovative UI/UX concepts.
Anthropic Claude Sonnet 3.5: Structured, detailed design output, suitable for precise wireframes and snippets.
Gemini Flash 2: Fast and lightweight, perfect for quick UI sketches and initial designs.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>: Accesses design files.
Third-Party Tools:
Builder.io: Converts Figma designs to code.
Figma, Zeplin, v0: Design tools for personas, flows, wireframes.
Example: /uiux "Mobile login" → - [ ] Add 2FA field (Assigned To: /mobile-developer, Confidence: 90%, Est: 1h, Priority: Medium, Dep: Design) → Uses Builder.io and <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>.
Development
Code
Description: Implements features using TDD/BDD for web platforms, with focus flags (e.g., --focus=frontend).
How to Use: /code "Build login API" → Updates code/tests.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Precise, high-quality code generation, ideal for clean and maintainable code.
Deepseek Coder: Complex code generation and reasoning, suitable for intricate backend logic.
OpenAI o3-mini: Fast and lightweight, perfect for rapid prototyping and smaller codebases.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-git">server-git</a>: Local Git ops.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>: GitHub PRs.
Third-Party Tools:
CodeRabbit.io: Code review with PR comments.
CodeQL: Static analysis for reviews.
SonarQube: Static code analysis.
Snyk: Vulnerability checks.
Codemod.com: Code migrations.
Example: /code "Login API" → - [x] Added POST /login (Confidence: 95%, Est: 2h, Priority: High, Dep: API spec) → PR reviewed by CodeRabbit.io (👀 → ✅) via <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>.
Mobile Developer (React Native)
Description: Implements mobile features using React Native for iOS/Android, following TDD/BDD. Focuses on mobile-specific code and integrates with /uiux designs.
How to Use: /mobile-developer "Build mobile login" → Updates src/mobile/*.js and tests.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Precise, reliable mobile code, ideal for React Native development.
OpenAI o3-mini: Fast, lightweight coding for rapid prototyping, suitable for quick mobile features.
Deepseek Coder: Complex reasoning for mobile-specific challenges, perfect for performance optimization.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-git">server-git</a>: Local Git ops.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>: GitHub PRs.
Third-Party Tools:
CodeRabbit.io: Code review with PR comments (👀 → ✅).
CodeQL: Static analysis.
SonarQube: Static code analysis.
Snyk: Vulnerability checks.
Codemod.com: Code migrations.
Example: /mobile-developer "Mobile login" → - [x] Added login screen (Confidence: 95%, Est: 3h, Priority: High, Dep: UI) → Reviewed by CodeRabbit.io (👀 → ✅) via <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>.
Desktop Developer (Electron/Nextron)
Description: Implements desktop features using Electron or Nextron for cross-platform apps, following TDD/BDD. Focuses on desktop-specific code and integrates with /uiux.
How to Use: /desktop-developer "Build desktop login" → Updates src/desktop/*.js and tests.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Precise, reliable desktop code, ideal for Electron/Nextron development.
OpenAI o3-mini: Fast prototyping for desktop apps, suitable for quick desktop features.
Deepseek Coder: Complex reasoning for desktop-specific challenges, perfect for performance optimization.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-git">server-git</a>: Local Git ops.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>: GitHub PRs.
Third-Party Tools:
CodeRabbit.io: Code review with PR comments (👀 → ✅).
CodeQL: Static analysis.
SonarQube: Static code analysis.
Snyk: Vulnerability checks.
Codemod.com: Code migrations.
Example: /desktop-developer "Desktop login" → - [x] Added login window (Confidence: 95%, Est: 3h, Priority: High, Dep: UI) → Reviewed by CodeRabbit.io (👀 → ✅) via <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>.
Debug
Description: Diagnoses and fixes bugs across platforms, analyzing logs or code.
How to Use: /debug "Mobile login fails" → Updates logs/errors.md.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Strong reasoning for complex debugging, ideal for detailed analysis.
Grok 3: Quick troubleshooting for common issues, suitable for rapid bug fixes.
Deepseek R1: Technical depth for intricate bugs, perfect for analyzing logs and code.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>: Reads logs.
Third-Party Tools:
Sentry: Real-time error logging.
Datadog: Performance monitoring logs.
Example: /debug "Desktop login error" → - [ ] Fix token expiry (Assigned To: /desktop-developer, Confidence: 85%, Est: 1h, Priority: High, Dep: Logs) → Uses Sentry and <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>.
Refactor
Description: Optimizes code for readability and maintainability across platforms.
How to Use: /refactor "Optimize mobile login.js" → Suggests changes.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Clean, readable code suggestions, ideal for maintainability.
Deepseek R1: Technical optimization and refactoring, suitable for performance improvements.
OpenAI o3-mini: Fast and lightweight, perfect for quick refactoring tasks.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>: Reads code.
Third-Party Tools:
Codemod.com: Automates migrations.
Sentry, Datadog: Logs for refactoring insights.
Example: /refactor "Desktop login" → - [ ] Simplify auth (Assigned To: /desktop-developer, Confidence: 90%, Est: 1h, Priority: Medium, Dep: None) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>.
Code Reviewer
Description: Reviews code for quality and standards across platforms.
How to Use: /code-reviewer "Review mobile PR #123" → Updates code-review.md.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Detailed, constructive feedback, ideal for thorough code reviews.
Deepseek Coder: Technical depth for code quality, suitable for identifying edge cases.
OpenAI o3-mini: Fast and lightweight, perfect for quick PR reviews.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>: PR comments.
Third-Party Tools:
CodeRabbit.io: PR comments (👀 → ✅).
CodeQL: Static analysis.
Example: /code-reviewer "Mobile login" → - [ ] Add error handling (Assigned To: /mobile-developer, Confidence: 95%, Est: 30m, Priority: High, Dep: None) → Comments (👀 → ✅) via <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>.
Git
Description: Manages version control for all platforms.
How to Use: /git "Commit mobile changes" → Updates pr-summary.md.
Suggested LLMs:
Deepseek R1: Git operations and version control expertise, ideal for complex workflows.
Anthropic Claude Sonnet 3.5: Clear commit messages and summaries, suitable for clarity.
OpenAI o3-mini: Fast and lightweight, perfect for quick Git tasks.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-git">server-git</a>: Local Git.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>: GitHub tasks.
Third-Party Tools: None.
Example: /git "PR for desktop login" → PR created via <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>.
Testing
Unit Tester
Description: Writes unit tests for all platforms.
How to Use: /unit-tester "Test mobile login" → Updates *.test.*.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Precise, comprehensive test cases, ideal for thorough coverage.
OpenAI o3-mini: Fast and lightweight, suitable for quick unit test generation.
Deepseek Coder: Technical depth for complex tests, perfect for edge cases.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>: Test files.
Third-Party Tools:
SonarQube: Static analysis reports.
Example: /unit-tester "Desktop login" → - [x] Test password (Confidence: 95%, Est: 1h, Priority: High, Dep: Code) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>.
E2E Tester
Description: Writes E2E tests for user flows across platforms.
How to Use: /e2e-tester "Test mobile login flow" → Updates e2e/*.spec.*.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Workflow testing and user flow validation, ideal for detailed E2E tests.
Deepseek R1: Technical depth for complex workflows, suitable for edge case testing.
OpenAI o3-mini: Fast and lightweight, perfect for quick E2E test generation.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>: E2E specs.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-puppeteer">server-puppeteer</a>: Browser automation.
Third-Party Tools: None.
Example: /e2e-tester "Mobile login" → - [ ] Verify 2FA (Assigned To: /debug, Confidence: 90%, Est: 2h, Priority: High, Dep: UI) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-puppeteer">server-puppeteer</a>.
Performance Tester
Description: Conducts load/stress tests for all platforms.
How to Use: /performance-tester "Load test desktop login" → Updates performance-report.md.
Suggested LLMs:
Deepseek R1: Performance analysis and optimization, ideal for technical depth.
Anthropic Claude Sonnet 3.5: Clear reporting of performance metrics, suitable for structured outputs.
OpenAI o3-mini: Fast and lightweight, perfect for quick performance test setups.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-fetch">server-fetch</a>: External performance data.
Third-Party Tools:
Datadog: Performance monitoring.
Example: /performance-tester "Mobile login" → - [ ] Optimize endpoint (Assigned To: /mobile-developer, Confidence: 80%, Est: 3h, Priority: High, Dep: Results) → Uses Datadog and <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-fetch">server-fetch</a>.
Security Tester
Description: Performs security scans across platforms.
How to Use: /security-tester "Scan mobile login" → Updates security-report.md.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Security-focused fixes, ideal for detailed vulnerability mitigation.
Deepseek R1: Vulnerability identification and analysis, suitable for technical depth.
OpenAI o3-mini: Fast and lightweight, perfect for quick security scans.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-sentry">server-sentry</a>: Error reports.
Third-Party Tools:
Snyk: Vulnerability checks.
Example: /security-tester "Desktop login" → - [ ] Fix XSS (Assigned To: /desktop-developer, Confidence: 95%, Est: 1h, Priority: High, Dep: None) → Uses Snyk and <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-sentry">server-sentry</a>.
User Acceptance Testing (UAT)
Description: Coordinates UAT for all platforms.
How to Use: /uat "Run mobile login UAT" → Updates uat-report.md.
Suggested LLMs:
Grok 3: Feedback analysis and user-centric reporting, ideal for user-focused insights.
Anthropic Claude Sonnet 3.5: Structured UAT reports, suitable for detailed documentation.
Anthropic Claude Opus: Comprehensive and detailed, perfect for in-depth UAT feedback analysis.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-atlassian">server-atlassian</a>: Jira tickets.
Third-Party Tools: None.
Example: /uat "Desktop login" → - [ ] Fix button (Assigned To: /desktop-developer, Confidence: 90%, Est: 30m, Priority: Medium, Dep: Feedback) → Jira via <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-atlassian">server-atlassian</a>.
Deployment
DevOps
Description: Manages CI/CD and infrastructure for all platforms.
How to Use: /devops "Setup CI for mobile" → Updates .github/workflows/*.yml.
Suggested LLMs:
Deepseek R1: Infrastructure expertise and CI/CD pipeline design, ideal for technical depth.
Anthropic Claude Sonnet 3.5: Clear, structured pipeline configurations, suitable for clarity.
OpenAI o3-mini: Fast and lightweight, perfect for quick CI/CD setups.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-git">server-git</a>: Local Git.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>: GitHub Actions.
Third-Party Tools: None.
Example: /devops "CI for desktop" → - [x] Pipeline added (Confidence: 95%, Est: 2h, Priority: High, Dep: Code) → Configures via <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>.
Cloud
Description: Configures cloud resources for all platforms.
How to Use: /cloud "Setup S3 for mobile" → Updates terraform/*.tf.
Suggested LLMs:
Deepseek R1: Cloud infrastructure expertise, ideal for technical depth and optimization.
Anthropic Claude Sonnet 3.5: Structured IaC scripts, suitable for clear configurations.
OpenAI o3-mini: Fast and lightweight, perfect for quick cloud setups.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>: IaC files.
Third-Party Tools: None.
Example: /cloud "DB for desktop" → - [ ] Add RDS (Assigned To: /dba, Confidence: 90%, Est: 3h, Priority: High, Dep: Budget) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>.
Release Manager
Description: Coordinates releases for all platforms.
How to Use: /release-manager "Plan v1.1 mobile release" → Updates release-plan.md.
Suggested LLMs:
Anthropic Claude Opus: Detailed release planning, ideal for comprehensive strategies.
Grok 3: Clear communication and coordination, suitable for stakeholder updates.
Anthropic Claude Sonnet 3.5: Structured and precise, perfect for release documentation.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-git">server-git</a>: Tags.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>: Releases.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-atlassian">server-atlassian</a>: Jira updates.
Third-Party Tools: None.
Example: /release-manager "v1.1 desktop" → - [ ] Tag v1.1 (Assigned To: /git, Confidence: 95%, Est: 1h, Priority: High, Dep: Tests) → Tags via <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>.
Maintenance
Support
Description: Handles user inquiries and bugs for all platforms.
How to Use: /support "Mobile login bug" → Updates @plan.md or Jira.
Suggested LLMs:
Grok 3: User-friendly responses for support queries, ideal for conversational support.
Anthropic Claude Sonnet 3.5: Structured ticket creation and bug tracking, suitable for detailed documentation.
Gemini Flash 2: Fast and lightweight, perfect for quick support lookups.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-atlassian">server-atlassian</a>: Jira tickets.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-slack">server-slack</a>: Slack posts.
Third-Party Tools:
Sentry: Error logging.
Datadog: Monitoring logs.
Example: /support "Desktop login slow" → - [ ] Investigate (Assigned To: /debug, Confidence: 85%, Est: 2h, Priority: High, Dep: Logs) → Uses Sentry and <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-slack">server-slack</a>.
Docs
Description: Maintains technical docs for all platforms.
How to Use: /docs "Document mobile login" → Updates docs/*.md.
Suggested LLMs:
Anthropic Claude Opus: Eloquent, detailed documentation, ideal for comprehensive guides.
Grok 3: Clear, concise writing for technical docs, suitable for quick reference.
Anthropic Claude Sonnet 3.5: Structured and precise, perfect for technical accuracy.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>: Doc files.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-google-drive">server-google-drive</a>: Shared docs.
Third-Party Tools: None.
Example: /docs "Desktop login" → - [x] Added docs (Confidence: 95%, Est: 1h, Priority: Medium, Dep: None) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-google-drive">server-google-drive</a>.
Documentation Writer
Description: Creates user-facing guides for all platforms.
How to Use: /documentation-writer "Mobile login tutorial" → Updates user-docs/*.md.
Suggested LLMs:
Anthropic Claude Opus: Detailed, comprehensive guides, ideal for in-depth tutorials.
Grok 3: Accessible, engaging tutorials, suitable for user-friendly content.
Anthropic Claude Sonnet 3.5: Structured and precise, perfect for clear instructions.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>: Local docs.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-google-drive">server-google-drive</a>: Shared guides.
Third-Party Tools: None.
Example: /documentation-writer "Desktop guide" → - [ ] Write 2FA steps (Assigned To: /docs, Confidence: 90%, Est: 2h, Priority: Medium, Dep: UI) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-google-drive">server-google-drive</a>.
Technical Debt Management
Description: Tracks and prioritizes technical debt across platforms.
How to Use: /tech-debt "Review mobile login" → Updates tech-debt.md.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Debt identification and prioritization, ideal for structured analysis.
Deepseek R1: Technical depth for debt assessment, suitable for identifying underlying issues.
OpenAI o3-mini: Fast and lightweight, perfect for quick debt reviews.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>: Code analysis.
Third-Party Tools:
Codemod.com: Automates debt migrations.
Example: /tech-debt "Desktop login" → - [ ] Refactor auth (Assigned To: /desktop-developer, Confidence: 80%, Est: 3h, Priority: Medium, Dep: None) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>.
Cross-Functional Support
Best Practices
Description: Enforces best practices across all SDLC stages and platforms.
How to Use: /best-practices "Check mobile standards" → Updates best-practices.md.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Standards expertise and enforcement, ideal for detailed guidelines.
Deepseek R1: Technical depth for best practices, suitable for technical accuracy.
OpenAI o3-mini: Fast and lightweight, perfect for quick standards checks.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>: File reviews.
Third-Party Tools:
SonarQube: Static analysis.
Example: /best-practices "Desktop login" → - [ ] Add a11y (Assigned To: /a11y, Confidence: 95%, Est: 1h, Priority: Medium, Dep: None) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>.
Chat
Description: Facilitates communication across platforms.
How to Use: /chat "Notify team of mobile delay" → Posts to Slack/MS Teams.
Suggested LLMs:
Grok 3: Conversational, user-friendly communication, ideal for team updates.
Anthropic Claude Sonnet 3.5: Structured summaries and task routing, suitable for clarity.
Gemini Flash 2: Fast and lightweight, perfect for quick notifications.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-slack">server-slack</a>: Slack posts.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-atlassian">server-atlassian</a>: Jira updates.
Third-Party Tools: None.
Example: /chat "Mobile bug" → "Bug in mobile login—assigning to /debug" → Posts via <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-slack">server-slack</a>.
PM (Project Manager)
Description: Manages tasks across platforms.
How to Use: /pm "Plan mobile sprint" → Updates Jira/GitHub.
Suggested LLMs:
Anthropic Claude Opus: Structured project management, ideal for comprehensive planning.
Grok 3: Task organization and prioritization, suitable for quick updates.
Anthropic Claude Sonnet 3.5: Precise and detailed, perfect for sprint planning.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>: GitHub issues.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-atlassian">server-atlassian</a>: Jira sprints.
Third-Party Tools: None.
Example: /pm "Sprint 1" → - [ ] Mobile login (Assigned To: /mobile-developer, Confidence: 90%, Est: 5h, Priority: High, Dep: Design) → Updates via <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-atlassian">server-atlassian</a>.
CTO
Description: Provides strategic oversight for all platforms.
How to Use: /cto "Review mobile strategy" → Updates cto-notes.md.
Suggested LLMs:
Deepseek R1: Technical strategy and oversight, ideal for technical depth.
Anthropic Claude Opus: Visionary, strategic planning, suitable for long-term goals.
Anthropic Claude Sonnet 3.5: Structured and precise, perfect for strategic documentation.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>: File reviews.
Third-Party Tools: None.
Example: /cto "Tech stack" → - [ ] Use React Native (Assigned To: /mobile-developer, Confidence: 85%, Est: 2h, Priority: Medium, Dep: None) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>.
Analytics
Description: Tracks usage/performance metrics for all platforms.
How to Use: /analytics "Track desktop login" → Updates analytics-report.md.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Tracking implementation and analysis, ideal for structured metrics.
Deepseek R1: Technical depth for analytics, suitable for performance insights.
OpenAI o3-mini: Fast and lightweight, perfect for quick metric setups.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-fetch">server-fetch</a>: External data.
Third-Party Tools:
Datadog: Monitoring metrics.
Example: /analytics "Mobile login" → - [ ] Add tracking (Assigned To: /mobile-developer, Confidence: 90%, Est: 1h, Priority: Medium, Dep: None) → Uses Datadog and <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-fetch">server-fetch</a>.
DBA (Database Administrator)
Description: Designs/optimizes database schemas for all platforms.
How to Use: /dba "Design mobile user table" → Updates migrations/*.sql.
Suggested LLMs:
Deepseek R1: Database optimization and schema design, ideal for technical depth.
Anthropic Claude Sonnet 3.5: Structured SQL queries and migrations, suitable for clarity.
OpenAI o3-mini: Fast and lightweight, perfect for quick schema setups.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-postgres">server-postgres</a>: PostgreSQL ops.
Third-Party Tools: None.
Example: /dba "Desktop users" → - [ ] Add index (Assigned To: /desktop-developer, Confidence: 95%, Est: 1h, Priority: High, Dep: Schema) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-postgres">server-postgres</a>.
A11y (Accessibility)
Description: Ensures UI accessibility for all platforms.
How to Use: /a11y "Check mobile login UI" → Updates a11y-report.md.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Accessibility-focused fixes and recommendations, ideal for detailed analysis.
Grok 3: User-centric accessibility insights, suitable for quick checks.
OpenAI o3-mini: Fast and lightweight, perfect for quick accessibility reviews.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>: UI code reviews.
Third-Party Tools: None.
Example: /a11y "Desktop login" → - [ ] Add ARIA (Assigned To: /desktop-developer, Confidence: 95%, Est: 1h, Priority: Medium, Dep: None) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>.
I10n (Internationalization)
Description: Manages translations for all platforms.
How to Use: /i10n "Add Spanish to mobile login" → Updates locales/*.json.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Precise, accurate translations, ideal for clarity.
Grok 3: Conversational translations, suitable for user-friendly content.
OpenAI o3-mini: Fast and lightweight, perfect for quick translation tasks.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>: Translation files.
Third-Party Tools: None.
Example: /i10n "Spanish desktop" → - [ ] Add es.json (Assigned To: /desktop-developer, Confidence: 90%, Est: 1h, Priority: Medium, Dep: None) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>.
Agile Coach
Description: Manages Agile processes across platforms.
How to Use: /agile-coach "Plan mobile sprint" → Updates agile-plan.md.
Suggested LLMs:
Anthropic Claude Opus: Structured Agile planning and ceremonies, ideal for comprehensive strategies.
Grok 3: Clear communication for Agile processes, suitable for team updates.
Anthropic Claude Sonnet 3.5: Precise and detailed, perfect for sprint planning.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-atlassian">server-atlassian</a>: Jira sprints.
Third-Party Tools: None.
Example: /agile-coach "Sprint 2" → - [ ] Mobile fixes (Assigned To: /pm, Confidence: 90%, Est: 1h, Priority: High, Dep: None) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-atlassian">server-atlassian</a>.
Innovation Researcher
Description: Explores tech advancements for all platforms.
How to Use: /innovation-researcher "AI for mobile login" → Updates innovation-report.md.
Suggested LLMs:
Grok 3: Creative exploration of new technologies, ideal for innovative ideas.
Deepseek R1: Feasibility analysis for innovative solutions, suitable for technical depth.
Gemini Flash 2: Fast and lightweight, perfect for quick tech lookups.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-brave-search">server-brave-search</a>: Web trends.
Third-Party Tools:
Perplexity: Research tool.
Example: /innovation-researcher "AI desktop" → - [ ] Facial recognition (Assigned To: /research, Confidence: 70%, Est: 4h, Priority: Low, Dep: None) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-brave-search">server-brave-search</a> and Perplexity.
Compliance and Governance
Description: Ensures compliance (e.g., GDPR) across platforms.
How to Use: /compliance-governance "Audit mobile login" → Updates compliance-report.md.
Suggested LLMs:
Anthropic Claude Sonnet 3.5: Compliance checks and regulatory adherence, ideal for detailed analysis.
Deepseek R1: Technical depth for compliance, suitable for identifying risks.
Anthropic Claude Opus: Comprehensive and detailed, perfect for in-depth compliance reports.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>: Code/config reviews.
Third-Party Tools: None.
Example: /compliance-governance "Desktop GDPR" → - [ ] Encrypt data (Assigned To: /desktop-developer, Confidence: 95%, Est: 2h, Priority: High, Dep: None) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>.
Knowledge Management
Description: Centralizes knowledge for all platforms.
How to Use: /knowledge-management "Log mobile lessons" → Updates knowledge-base/*.md.
Suggested LLMs:
Anthropic Claude Opus: Curation of comprehensive knowledge bases, ideal for detailed documentation.
Anthropic Claude Sonnet 3.5: Structured and precise, suitable for organizing knowledge.
Grok 3: Clear and concise, perfect for quick knowledge updates.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>: Knowledge files.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-memory">server-memory</a>: Persistent memory.
Third-Party Tools: None.
Example: /knowledge-management "Desktop bug" → - [ ] Document workaround (Assigned To: /docs, Confidence: 90%, Est: 1h, Priority: Medium, Dep: None) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>.
Stakeholder Engagement
Description: Manages stakeholder communication for all platforms.
How to Use: /stakeholder-engagement "Update on mobile login" → Updates stakeholder-notes.md.
Suggested LLMs:
Grok 3: Clear, concise communication, ideal for stakeholder updates.
Anthropic Claude Opus: Detailed, structured updates, suitable for comprehensive reports.
Anthropic Claude Sonnet 3.5: Precise and professional, perfect for formal communication.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-atlassian">server-atlassian</a>: Jira feedback.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-slack">server-slack</a>: Slack updates.
Third-Party Tools: None.
Example: /stakeholder-engagement "Desktop status" → - [ ] Collect feedback (Assigned To: /requirements-analyst, Confidence: 90%, Est: 1h, Priority: Medium, Dep: None) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-slack">server-slack</a>.
SEO
Description: Optimizes content and code for search engine visibility across platforms (web, mobile, desktop). Generates SEO-friendly titles, meta tags, and content strategies.
How to Use: /seo "Optimize mobile login page" → Updates seo-strategy.md and code.
Suggested LLMs:
Grok 3: SEO-friendly content generation, ideal for engaging and optimized content.
Anthropic Claude Sonnet 3.5: Structured SEO strategies, suitable for technical SEO tasks.
Gemini Flash 2: Fast and lightweight, perfect for quick keyword research and meta tag generation.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>: Updates SEO files.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-brave-search">server-brave-search</a>: Keyword research.
Third-Party Tools:
Lighthouse: SEO/performance audits.
Perplexity: Keyword/market research.
Example: /seo "Desktop login page" → - [ ] Add meta tags (Assigned To: /desktop-developer, Confidence: 90%, Est: 1h, Priority: Medium, Dep: Content) → Uses Lighthouse and <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-brave-search">server-brave-search</a>.
Copywriting
Description: Generates and proofreads content (e.g., marketing copy, user guides) for all platforms, ensuring clarity and engagement.
How to Use: /copywriting "Write mobile login guide" → Updates copy-content.md.
Suggested LLMs:
Anthropic Claude Opus: Detailed, polished content, ideal for comprehensive guides and marketing copy.
Grok 3: Engaging, user-friendly copy, suitable for accessible tutorials and marketing materials.
Anthropic Claude Sonnet 3.5: Structured and precise, perfect for clear and professional content.
Real MPCs:
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>: Content files.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-google-drive">server-google-drive</a>: Shared docs.
Third-Party Tools:
Grammarly: Proofreading and grammar checks.
Example: /copywriting "Desktop onboarding" → - [ ] Write intro (Assigned To: /documentation-writer, Confidence: 95%, Est: 2h, Priority: Medium, Dep: None) → Proofreads with Grammarly and uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-google-drive">server-google-drive</a>.
Example Workflows
1. Mobile App Feature (Login with 2FA)
Brainstorm: /brainstorm "Mobile login security" → - [ ] Add 2FA (Assigned To: /requirements-analyst, Confidence: 60%, Est: 2h, Priority: Low, Dep: None) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-brave-search">server-brave-search</a>.
Requirements Analyst: /requirements-analyst "Define 2FA" → - [ ] SMS 2FA (Assigned To: /architect, Confidence: 90%, Est: 2h, Priority: High, Dep: Input) → Jira via <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-atlassian">server-atlassian</a>.
Architect: /architect "Plan mobile 2FA" → - [ ] Twilio API (Assigned To: /system-designer, Confidence: 95%, Est: 4h, Priority: High, Dep: Requirements).
System Designer: /system-designer "Design mobile 2FA API" → - [ ] POST /2fa (Assigned To: /mobile-developer, Confidence: 95%, Est: 2h, Priority: High, Dep: Plan).
UI/UX: /uiux "Design mobile 2FA UI" → - [ ] SMS input (Assigned To: /mobile-developer, Confidence: 90%, Est: 1h, Priority: Medium, Dep: Design) → Uses Builder.io.
Mobile Developer: /mobile-developer "Implement 2FA" → - [x] Added 2FA screen (Confidence: 95%, Est: 3h, Priority: High, Dep: UI) → Reviewed by CodeRabbit.io (👀 → ✅) via <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>.
Unit Tester: /unit-tester "Test mobile 2FA" → - [x] Test SMS (Confidence: 95%, Est: 1h, Priority: High, Dep: Code) → Uses SonarQube.
E2E Tester: /e2e-tester "Mobile 2FA flow" → - [ ] Verify prompt (Assigned To: /debug, Confidence: 90%, Est: 2h, Priority: High, Dep: UI) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-puppeteer">server-puppeteer</a>.
Release Manager: /release-manager "v1.1 mobile" → - [ ] Tag v1.1 (Assigned To: /git, Confidence: 95%, Est: 1h, Priority: High, Dep: Tests) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>.
Docs: /docs "Mobile 2FA API" → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>.
2. Desktop App Enhancement (Dark Mode)
Support: /support "User requests dark mode" → - [ ] Define dark mode (Assigned To: /requirements-analyst, Confidence: 85%, Est: 1h, Priority: Medium, Dep: None) → Jira via <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-atlassian">server-atlassian</a>.
Requirements Analyst: /requirements-analyst "Dark mode" → - [ ] Toggle theme (Assigned To: /uiux, Confidence: 90%, Est: 2h, Priority: Medium, Dep: None).
UI/UX: /uiux "Design dark mode" → - [ ] Dark theme UI (Assigned To: /desktop-developer, Confidence: 90%, Est: 1h, Priority: Medium, Dep: None) → Uses Figma and <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>.
Desktop Developer: /desktop-developer "Implement dark mode" → - [x] Added theme toggle (Confidence: 95%, Est: 3h, Priority: Medium, Dep: UI) → Reviewed by CodeRabbit.io (👀 → ✅) via <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>.
Unit Tester: /unit-tester "Test dark mode" → - [x] Test toggle (Confidence: 95%, Est: 1h, Priority: Medium, Dep: Code) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>.
UAT: /uat "Test desktop dark mode" → - [ ] Adjust contrast (Assigned To: /desktop-developer, Confidence: 90%, Est: 1h, Priority: Medium, Dep: Feedback) → Jira via <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-atlassian">server-atlassian</a>.
SEO: /seo "Optimize desktop login page" → - [ ] Add meta tags (Assigned To: /desktop-developer, Confidence: 90%, Est: 1h, Priority: Medium, Dep: Content) → Uses Lighthouse.
Copywriting: /copywriting "Dark mode guide" → - [ ] Write intro (Assigned To: /documentation-writer, Confidence: 95%, Est: 2h, Priority: Medium, Dep: None) → Uses Grammarly.
3. Bug Fix Across Platforms
Support: /support "Mobile login timeout" → - [ ] Investigate (Assigned To: /debug, Confidence: 85%, Est: 2h, Priority: High, Dep: Logs) → Uses Sentry and <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-slack">server-slack</a>.
Debug: /debug "Timeout" → - [ ] Fix refresh (Assigned To: /mobile-developer, Confidence: 90%, Est: 1h, Priority: High, Dep: None) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a> and Datadog.
Mobile Developer: /mobile-developer "Fix timeout" → - [x] Updated refresh (Confidence: 95%, Est: 1h, Priority: High, Dep: Debug) → Reviewed by CodeQL (👀 → ✅).
Desktop Developer: /desktop-developer "Sync fix" → - [x] Applied fix (Confidence: 95%, Est: 1h, Priority: High, Dep: Mobile fix) → Reviewed by CodeRabbit.io (👀 → ✅).
Unit Tester: /unit-tester "Test fixes" → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>.
Release Manager: /release-manager "Hotfix v1.0.1" → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>.
4. SEO and Content Optimization
SEO: /seo "Optimize mobile login page" → - [ ] Add keywords (Assigned To: /mobile-developer, Confidence: 90%, Est: 1h, Priority: Medium, Dep: Content) → Uses Lighthouse and <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-brave-search">server-brave-search</a>.
Copywriting: /copywriting "Mobile login SEO copy" → - [ ] Write meta desc (Assigned To: /seo, Confidence: 95%, Est: 1h, Priority: Medium, Dep: None) → Uses Grammarly and <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-filesystem">server-filesystem</a>.
Mobile Developer: /mobile-developer "Add SEO tags" → - [x] Updated meta (Confidence: 95%, Est: 1h, Priority: Medium, Dep: Copy) → Reviewed by CodeRabbit.io (👀 → ✅).
New Suggestions
New Use-Flows
Mobile/Desktop Sync Feature:
Requirements Analyst: /requirements-analyst "Define sync feature" → - [ ] Sync login state (Assigned To: /architect, Confidence: 90%, Est: 2h, Priority: High, Dep: Input).
Architect: /architect "Plan sync" → - [ ] Use WebSocket (Assigned To: /system-designer, Confidence: 95%, Est: 3h, Priority: High, Dep: Requirements).
Mobile Developer: /mobile-developer "Mobile sync" → - [x] Added WebSocket (Confidence: 95%, Est: 3h, Priority: High, Dep: Design) → Uses <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>.
Desktop Developer: /desktop-developer "Desktop sync" → - [x] Sync implemented (Confidence: 95%, Est: 3h, Priority: High, Dep: Mobile) → Reviewed by CodeRabbit.io (👀 → ✅).
SEO-Driven Content Update:
SEO: /seo "Optimize desktop homepage" → - [ ] Add keywords (Assigned To: /copywriting, Confidence: 90%, Est: 1h, Priority: Medium, Dep: None) → Uses Perplexity.
Copywriting: /copywriting "SEO homepage copy" → - [ ] Write content (Assigned To: /desktop-developer, Confidence: 95%, Est: 2h, Priority: Medium, Dep: SEO) → Uses Grammarly.
Desktop Developer: /desktop-developer "Update homepage" → - [x] Added SEO content (Confidence: 95%, Est: 1h, Priority: Medium, Dep: Copy).
New Real MPCs
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-google-drive">server-google-drive</a>: Stores docs for /seo and /copywriting.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-puppeteer">server-puppeteer</a>: Browser automation for /e2e-tester.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-memory">server-memory</a>: Knowledge graph for /knowledge-management.
<a href="https://github.com/modelcontextprotocol/servers/tree/main/server-linear">server-linear</a>: Linear integration for /pm.
Additional Third-Party Tools
ESLint, Prettier: Code linting/formatting for /code, /mobile-developer, /desktop-developer.
Lighthouse: SEO/performance audits for /seo.
Grammarly: Proofreading for /copywriting.
Additional Improvements
Emoji Workflow: Expand emoji use (e.g., 🚧 for in-progress, ❌ for blocked) across all modes with MCP integration.
Cross-Platform Consistency: Add a /sync mode to ensure web/mobile/desktop parity, using <a href="https://github.com/modelcontextprotocol/servers/tree/main/server-github">server-github</a>.
Analytics Dashboard: Integrate /analytics with Datadog for real-time dashboards across platforms.