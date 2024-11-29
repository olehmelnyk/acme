#!/usr/bin/env sh

echo "🛠 Setting up security tools..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "⚠️ Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [ -f /opt/homebrew/bin/brew ]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    echo "✅ Homebrew is already installed"
fi

# Function to install or update a brew package
install_or_update_package() {
    package_name=$1
    if ! command -v "$package_name" &> /dev/null; then
        echo "⚠️ $package_name not found. Installing..."
        brew install "$package_name"
    else
        echo "✅ $package_name is already installed, checking for updates..."
        brew upgrade "$package_name" || true
    fi
}

# Install/update required tools
echo "📦 Installing required security tools..."
install_or_update_package "trivy"
install_or_update_package "gitleaks"

# Prompt for Snyk installation
echo ""
echo "🤔 Would you like to install Snyk for additional dependency scanning? (y/N)"
read -r install_snyk

if [ "$install_snyk" = "y" ] || [ "$install_snyk" = "Y" ]; then
    install_or_update_package "snyk"
    echo ""
    echo "🔐 To complete Snyk setup, please run:"
    echo "snyk auth"
    echo ""
    echo "This will open your browser to authenticate with Snyk."
    echo "You'll need a Snyk account - create one at https://snyk.io"
else
    echo ""
    echo "ℹ️  Skipping Snyk installation. You can install it later with:"
    echo "brew install snyk"
fi

echo ""
echo "✅ Security tools setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Run 'bun run security:check' to verify your setup"
echo "2. If you installed Snyk, run 'snyk auth' to authenticate"
