#!/usr/bin/env sh

# Get the current branch name
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

# Read protected branches from .branchnaming using node
PROTECTED_BRANCHES=$(node -e "const config = require('$(pwd)/.branchnaming'); console.log(config.protected.join('|'))")

# Check if current branch is protected
if echo "$BRANCH_NAME" | grep -E "^($PROTECTED_BRANCHES)$" > /dev/null; then
    echo "❌ Direct changes to protected branch '$BRANCH_NAME' are not allowed."
    echo "Please create a feature branch and submit a pull request."
    echo "Protected branches: $(echo $PROTECTED_BRANCHES | sed 's/|/, /g')"
    exit 1
fi

exit 0
