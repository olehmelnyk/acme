# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| CVSS v3.0 | Supported Versions                |
| --------- | --------------------------------- |
| 9.0-10.0  | Releases within the last 6 months |
| 7.0-8.9   | Releases within the last 3 months |
| 4.0-6.9   | Most recent release               |
| 0.0-3.9   | No support                        |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please send an email to [INSERT SECURITY EMAIL]. All security vulnerabilities will be promptly addressed.

Please include the following information (if possible):

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

## Security Measures

This project implements several security measures:

### Pre-commit Security

- Automated secret detection
- API key and token scanning
- Protected branch enforcement
- Large file detection
- See [Git Hooks Documentation](../docs/git_hooks.md) for details

### Automated Security Tools

1. **Dependabot**

   - Weekly dependency updates
   - Automated security updates
   - Dependency version monitoring

2. **CodeQL Analysis**
   - Runs on all pull requests
   - Weekly scheduled scans
   - Extended security queries enabled
   - JavaScript/TypeScript analysis

### Security Headers

Our Next.js application implements various security headers:

- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

### Rate Limiting

API endpoints are protected with rate limiting:

- 100 requests per minute per IP
- Configurable limits and windows
- Proper error handling and headers

## Recent Security Updates

- [Date] Added CodeQL analysis
- [Date] Implemented rate limiting
- [Date] Added security headers
- [Date] Set up Dependabot
