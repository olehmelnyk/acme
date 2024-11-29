# Commit Message Conventions

This document outlines our commit message conventions. We follow a modified version of the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Commit Message Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

We support the following commit types:

| Type          | Description                                             | Example                                               |
| ------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| `feat`        | New feature                                             | `feat(auth): Add OAuth2 authentication`               |
| `fix`         | Bug fix                                                 | `fix(api): Handle null response from user service`    |
| `docs`        | Documentation only changes                              | `docs(readme): Update installation instructions`      |
| `style`       | Changes that do not affect code meaning                 | `style(components): Format according to style guide`  |
| `refactor`    | Code change that neither fixes a bug nor adds a feature | `refactor(utils): Simplify error handling logic`      |
| `perf`        | Performance improvements                                | `perf(queries): Optimize database indexing`           |
| `test`        | Adding or correcting tests                              | `test(api): Add integration tests for user endpoints` |
| `build`       | Changes affecting build system or dependencies          | `build(deps): Update React to v18`                    |
| `ci`          | Changes to CI configuration                             | `ci(github): Add new deployment workflow`             |
| `chore`       | Other changes not modifying src or test files           | `chore(git): Update .gitignore`                       |
| `revert`      | Reverting previous changes                              | `revert: feat(auth): Remove OAuth2 authentication`    |
| `security`    | Security improvements                                   | `security(deps): Update vulnerable packages`          |
| `temp`        | Temporary changes or work in progress                   | `temp(feature): Initial implementation of chat`       |
| `translation` | Internationalization and localization                   | `translation(fr): Add French translations`            |
| `changeset`   | Version management and changelogs                       | `changeset: Prepare release v1.2.0`                   |

## Scope

The scope should be a noun describing the section of the codebase you're modifying:

- Component names (e.g., `button`, `modal`)
- Feature areas (e.g., `auth`, `api`)
- Package names (e.g., `core`, `ui`)
- Module names (e.g., `utils`, `types`)

## Subject

- Use imperative, present tense: "Add" not "Added" or "Adds"
- Start with capital letter
- No period at the end
- Maximum length of 100 characters

## Body

- Use to explain the motivation for the change
- Wrap at 72 characters
- Use to explain what and why vs. how

## Footer

- Reference issues and pull requests
- Note breaking changes with `BREAKING CHANGE:`
- List related issues: `Fixes #123, #456`

## Examples

```
feat(auth): Add social login with Google

Implement Google OAuth2 authentication flow to allow users to sign in with their Google accounts.
- Add GoogleAuthProvider
- Create OAuth callback handler
- Update user model to store Google ID

Fixes #123
```

```
fix(api): Handle empty response in user service

Previously the application would crash when the user service returned an empty response.
Now we properly handle this case by returning a default user object.

Fixes #456
```

```
docs(readme): Update deployment instructions

- Add section about environment variables
- Update Docker commands
- Add troubleshooting guide
```

## Tools and Enforcement

We use several tools to enforce these conventions:

1. **Commitlint**: Validates commit messages against our rules
2. **Husky**: Runs commit message validation as a pre-commit hook
3. **AI-assisted Generation**: Our pre-commit hook includes AI-powered commit message generation

## Best Practices

1. **Keep commits atomic**: Each commit should represent one logical change
2. **Write meaningful messages**: Help others understand your changes
3. **Reference issues**: Always link to relevant issues or pull requests
4. **Use AI assistance**: Leverage our AI-powered commit message generator for consistency

## Breaking Changes

When introducing breaking changes:

1. Add `BREAKING CHANGE:` in the footer
2. Explain what breaks and how to migrate
3. Consider using a migration guide for major changes

Example:

```
feat(api): Restructure response format

BREAKING CHANGE: API response format has changed from array to object structure.
Migration guide: https://docs.example.com/migrations/v2-response-format
```
