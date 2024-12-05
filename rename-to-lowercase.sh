#!/bin/bash

# Find all .md files, excluding node_modules
find . -type f -name "*.md" -not -path "*/node_modules/*" | while read file; do
    # Convert filename to lowercase
    dirname=$(dirname "$file")
    basename=$(basename "$file")
    newname=$(echo "$basename" | tr '[:upper:]' '[:lower:]')
    
    # Only rename if the filename is different
    if [ "$basename" != "$newname" ]; then
        # Use git mv if the file is tracked by git
        if git ls-files --error-unmatch "$file" > /dev/null 2>&1; then
            git mv "$file" "$dirname/tmp_$newname"
            git mv "$dirname/tmp_$newname" "$dirname/$newname"
        else
            mv "$file" "$dirname/tmp_$newname"
            mv "$dirname/tmp_$newname" "$dirname/$newname"
        fi
        echo "Renamed: $file -> $dirname/$newname"
    fi
done
