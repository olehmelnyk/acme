#!/usr/bin/env sh

echo "🔒 Running security checks..."

# Function to check if a tool is installed
check_security_tool() {
    if ! command -v "$1" &> /dev/null; then
        echo "⚠️ $1 not found."
        echo "Run './tools/scripts/setup-security-tools.sh' to install required security tools"
        missing_tools=1
    fi
}

# Check for required security tools
missing_tools=0
check_security_tool "trivy"
check_security_tool "gitleaks"

# Exit if any required tools are missing
if [ "$missing_tools" = "1" ]; then
    exit 1
fi

# Check for environment variables
echo "🔐 Checking for exposed environment variables..."
if git grep -l "process.env" -- "*.{js,ts,tsx}"; then
  echo "⚠️  Warning: Found potential environment variable usage. Please ensure they are properly secured."
fi

# Run trivy filesystem scan
echo "🔍 Running Trivy filesystem scan..."
if ! trivy fs --scanners vuln,secret,misconfig . --severity HIGH,CRITICAL; then
    echo "❌ High or critical vulnerabilities found!"
    echo "Please review the Trivy output and fix the identified issues"
    exit 1
fi

# Run snyk test if available (optional)
if command -v snyk &> /dev/null; then
    echo "🛡️ Running Snyk security test..."
    if ! snyk test --severity-threshold=high; then
        echo "😩 Snyk test failed. This is optional - you can configure Snyk later."
        echo "To set up Snyk:"
        echo "1. Install: brew install snyk"
        echo "2. Authenticate: snyk auth"
    fi
else
    echo "⚠️ Snyk not installed (optional). Can be installed with: brew install snyk"
fi

# Check for secrets in the codebase
echo "🕵️ Checking for potential secrets in codebase..."
if ! gitleaks detect --verbose -s . --no-git; then
    echo "⚠️ Potential secrets found. Please review the findings above."
    echo "Note: Some findings might be false positives. Check .gitleaks.toml for known exceptions."
    echo "If a finding is a false positive, add it to .gitleaks.toml allowlist"
fi

# Check for security headers in Next.js config
echo "🔒 Checking Next.js security headers..."
if [ -f "next.config.js" ]; then
    if ! grep -q "securityHeaders" next.config.js; then
        echo "⚠️ Security headers not found in Next.js config"
        echo "Consider adding security headers: https://nextjs.org/docs/advanced-features/security-headers"
    fi
fi

echo "✅ Security checks completed!"
exit 0
