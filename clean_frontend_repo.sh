#!/bin/bash

echo "🧹 Cleaning up amond-frontend repository..."

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "Created temp directory: $TEMP_DIR"

# Copy ONLY the frontend folder contents (not the folder itself)
echo "📁 Copying frontend files..."
cd frontend
cp -r * "$TEMP_DIR/"
cp -r .eslintrc.json .gitignore "$TEMP_DIR/" 2>/dev/null || true
cd ..

# Remove any accidentally copied git directory
rm -rf "$TEMP_DIR/.git" 2>/dev/null || true

# Move to temp directory
cd "$TEMP_DIR"

# Initialize new git repo
echo "🔧 Initializing clean git repository..."
git init
git add .
git commit -m "Frontend application files only"

# Add remote and force push
git remote add origin https://github.com/amondbymond/amond-frontend.git
git branch -M main

echo "🚀 Force pushing clean frontend files..."
git push -u origin main --force

echo "✅ Done! The amond-frontend repository now contains only frontend files."
echo "📁 Repository should now contain:"
echo "  - src/"
echo "  - public/"
echo "  - package.json"
echo "  - next.config.js"
echo "  - amplify.yml"
echo "  - etc. (only frontend files)"

cd -
rm -rf "$TEMP_DIR"