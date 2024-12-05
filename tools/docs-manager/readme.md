# Documentation Manager

A comprehensive toolset for managing documentation in the Nx monorepo, including backup, validation, and formatting capabilities.

## Features

- **Backup Management**: Automated backup of documentation files with configurable retention policies
- **Documentation Validation**: Ensures documentation follows project standards
- **Formatting**: Consistent formatting of markdown files and diagrams
- **Cross-referencing**: Maintains relationships between related documentation

## Installation

```bash
cd tools/docs-manager
bun install
```

## Usage

From the root directory:

### Documentation Formatting

```bash
# Format documentation with preview
bun run docs:format

# Check documentation formatting without making changes
bun run docs:format:check

# Fix documentation formatting issues
bun run docs:format:fix

# Run all documentation maintenance tasks
bun run docs:maintain
```

### Options

- `--dry-run`: Preview changes without applying them
- `--verbose`: Show detailed output
- `--fix`: Automatically fix issues (for format:check)

## Directory Structure

```
/tools/docs-manager/
├── src/                    # Source code
│   ├── backup/            # Backup functionality
│   ├── validation/        # Documentation validation
│   ├── formatting/        # Markdown and diagram formatting
│   └── utils/             # Shared utilities
├── tests/                 # Test files
├── config/                # Configuration files
└── README.md             # This file

/artifacts/docs-manager/       # Tool output directory (gitignored)
├── backups/               # Documentation backups
└── reports/               # Validation and analysis reports
```

## Configuration

The tool uses two main configuration files:

- `config/docs.json`: General documentation settings
- `config/backup.json`: Backup-specific settings

### Example Configuration

```json
{
  "paths": {
    "diagramsRoot": "docs/architecture/diagrams",
    "backupDir": ".diagrams-backup"
  },
  "maintenance": {
    "maxBackupAge": "30d"
  },
  "validation": {
    "allowedDirections": ["TB", "BT", "RL", "LR", "TD"],
    "maxDiagramSize": 1000,
    "requiredSections": ["description", "components", "implementation"]
  },
  "formatting": {
    "lineLength": 80,
    "indentSize": 2,
    "trailingNewline": true,
    "trimTrailingWhitespace": true
  }
}
```

## What Gets Formatted

### Markdown Files

- Line endings normalized
- Consistent indentation
- Trailing whitespace removed
- Proper heading hierarchy
- Consistent list formatting
- Code block formatting
- Table alignment

### Diagrams

- Consistent layout direction
- Standard styling
- Proper spacing
- Node alignment
- Connection styling

## Implementation Details

The tool uses:

- TypeScript for type safety
- Commander.js for CLI interface
- Chalk for colored output
- Zod for configuration validation

## Security

- No sensitive information exposure
- Safe file operations
- Backup before formatting
- Configuration validation
