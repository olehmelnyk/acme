# Security Tooling

This document describes the security tools used in our project and how to set them up.

## Quick Start

```bash
# Install required security tools (includes optional Snyk installation prompt)
bun run security:setup

# If you installed Snyk, authenticate with:
snyk auth

# Run security checks manually
bun run security:check
```

## Security Tools Overview

### Core Tools

1. **Trivy**

   - Purpose: Comprehensive security scanner
   - Features:
     - Vulnerability scanning
     - Secret detection
     - Misconfiguration checking
     - License compliance
   - Installation: Automatically installed by `security:setup`

2. **Gitleaks**

   - Purpose: Secret detection in git repositories
   - Features:
     - Pre-commit secret scanning
     - CI/CD integration
     - Custom rules support
   - Installation: Automatically installed by `security:setup`

3. **Snyk** (Optional)
   - Purpose: Dependency vulnerability scanning
   - Features:
     - Real-time vulnerability monitoring
     - License compliance
     - Integration with package managers
   - Installation: Optional during `security:setup`
   - Setup:
     1. Choose 'y' when prompted during `security:setup`, or
     2. Install later with `brew install snyk`
     3. Authenticate with `snyk auth`

## Automated Checks

The following checks run automatically:

1. **Post-Install Check**

   - Runs after `bun install`
   - Checks for:
     - Missing security tools
     - High/Critical vulnerabilities
     - Exposed secrets
     - Environment variable usage

2. **Pre-Commit Check**
   - Runs before each commit
   - Checks for:
     - Secrets in staged files
     - Environment variable exposure
     - Security misconfigurations

## Manual Security Checks

You can run security checks manually:

```bash
# Full security check
bun run security:check

# Individual tools
trivy fs .                    # Scan filesystem
gitleaks detect              # Check for secrets
snyk test                    # Check dependencies
```

## Configuration

### Trivy Configuration

- Scans for HIGH and CRITICAL vulnerabilities
- Uses the following scanners:
  - `vuln`: Vulnerability scanning
  - `secret`: Secret detection
  - `misconfig`: Misconfiguration checking
- Excludes dev dependencies by default
- Run manually with:
  ```bash
  trivy fs --scanners vuln,secret,misconfig . --severity HIGH,CRITICAL
  ```

### Gitleaks Configuration

- Uses default ruleset
- Scans all files in the repository
- Configured to run in pre-commit hooks

## Continuous Integration

Our CI pipeline includes:

1. Security scanning on every pull request
2. Dependency vulnerability checking
3. Secret detection
4. Configuration validation

## Best Practices

1. **Keep Tools Updated**

   - Run `bun run security:setup` periodically
   - Update dependencies regularly
   - Monitor security advisories

2. **Handle Findings**

   - Review and triage security findings
   - Create issues for legitimate findings
   - Document false positives
   - Fix high-priority issues promptly

3. **Security Development**
   - Use security linting rules
   - Follow secure coding guidelines
   - Review security headers and configs
   - Validate environment variables

## Troubleshooting

### Common Issues

1. **Tool Installation Failures**

   ```bash
   # Retry installation
   brew update && bun run security:setup
   ```

2. **False Positives**

   - Review tool configurations
   - Update detection rules
   - Document known exceptions

3. **Performance Issues**
   - Use targeted scanning
   - Optimize configurations
   - Consider CI caching
