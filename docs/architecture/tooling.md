# Architecture Documentation Tooling

This guide explains the documentation tooling system we've implemented to maintain our architectural diagrams and documentation.

## Quick Start

```bash
# Validate all diagrams
bun run docs validate

# Generate cross-references and index
bun run docs generate --all

# Create a new diagram
bun run docs new "Authentication Flow" --category system --description "Describes the authentication process"

# Run all maintenance tasks
bun run docs maintain
```

## Available Commands

### Validation

```bash
# Validate all diagrams
bun run docs validate

# Validate and auto-fix common issues
bun run docs validate --fix

# Show detailed validation output
bun run docs validate --verbose
```

### Generation

```bash
# Generate cross-references
bun run docs generate --xref

# Generate diagram index
bun run docs generate --index

# Generate all artifacts
bun run docs generate --all
```

### Creating New Diagrams

```bash
# Create a new diagram
bun run docs new "Diagram Title" --category <category> --description "Description"

# Available categories:
# - system
# - components
# - data-flow
# - infrastructure
```

### Maintenance

```bash
# Run all maintenance tasks
bun run docs maintain

# Create backup before maintenance
bun run docs maintain --backup
```

## Configuration

The documentation tooling is configured via `docs/architecture/config.json`. Key configuration options:

### Diagram Validation

- Allowed diagram directions (TB, BT, RL, LR, TD)
- Maximum diagram size
- Required documentation sections
- Style rules

### Cross References

- Maximum number of references per diagram
- Minimum relevance score
- Topic keywords for relevance calculation

### Index Generation

- Diagram categories
- Excluded patterns
- Index sections

### Maintenance

- Validation on commit
- Auto-update index
- Backup settings
- Notification preferences

## Directory Structure

```
docs/architecture/
├── diagrams/
│   ├── components/     # Component-level diagrams
│   ├── data-flow/     # Data flow diagrams
│   ├── infrastructure/ # Infrastructure diagrams
│   └── system/        # System-level diagrams
├── DIAGRAM_INDEX.md   # Auto-generated index
├── config.json        # Tooling configuration
└── TOOLING.md        # This guide
```

## Automatic Maintenance

The following tasks run automatically:

1. **Pre-commit Hook**

   - Validates all diagrams
   - Updates cross-references
   - Regenerates index
   - Stages changes

2. **GitHub Action**
   - Runs on pull requests
   - Validates documentation
   - Comments on PR if issues found

## Best Practices

### Creating Diagrams

1. Use the `new` command to create diagrams:

   ```bash
   bun run docs new "Diagram Title" --category system
   ```

2. Follow the template structure:
   - Clear title and description
   - Well-organized sections
   - Proper Mermaid syntax
   - Implementation details

### Maintaining Diagrams

1. Run validation regularly:

   ```bash
   bun run docs validate
   ```

2. Fix issues promptly:

   ```bash
   bun run docs validate --fix
   ```

3. Keep cross-references updated:
   ```bash
   bun run docs generate --xref
   ```

### Backup and Recovery

1. Create manual backups:

   ```bash
   bun run docs maintain --backup
   ```

2. Automatic backups:
   - Created before major changes
   - Retained based on configuration
   - Include metadata

## Troubleshooting

### Common Issues

1. **Invalid Diagram Syntax**

   - Run validation with fix: `bun run docs validate --fix`
   - Check Mermaid syntax
   - Verify diagram direction

2. **Missing Cross-References**

   - Regenerate: `bun run docs generate --xref`
   - Check topic keywords
   - Verify file paths

3. **Outdated Index**
   - Regenerate: `bun run docs generate --index`
   - Check category configuration
   - Verify file structure

### Getting Help

1. Run commands with verbose output:

   ```bash
   bun run docs validate --verbose
   ```

2. Check logs in `.diagrams-backup`

3. Review GitHub Action outputs

## Contributing

1. **Adding Features**

   - Update configuration schema
   - Add tests
   - Update documentation

2. **Modifying Tools**
   - Follow TypeScript best practices
   - Maintain backward compatibility
   - Update this guide

## Future Improvements

1. **Planned Features**

   - Diagram preview in CLI
   - Interactive diagram creation
   - Automated testing of diagrams
   - Integration with documentation site

2. **Enhancement Ideas**
   - Visual diff tool
   - Diagram optimization
   - Custom validation rules
   - Documentation metrics
