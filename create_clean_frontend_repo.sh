#!/bin/bash

echo "🚀 Creating a truly clean frontend-only repository..."

# Create a fresh temporary directory
TEMP_DIR="/tmp/amond-frontend-final"
rm -rf "$TEMP_DIR" 2>/dev/null
mkdir -p "$TEMP_DIR"

echo "📁 Copying ONLY frontend files..."
# Copy only the contents of frontend directory
cp -r frontend/* "$TEMP_DIR/"
cp frontend/.eslintrc.json "$TEMP_DIR/" 2>/dev/null || true
cp frontend/.gitignore "$TEMP_DIR/" 2>/dev/null || true

# Move to temp directory
cd "$TEMP_DIR"

echo "🔍 Verifying contents..."
echo "Files in root:"
ls -la

echo -e "\n📝 Creating clean git repository..."
git init
git add .
git commit -m "Frontend application - Next.js SSR"

echo -e "\n🌐 Setting up remote..."
git remote add origin https://github.com/amondbymond/amond-frontend.git
git branch -M main

echo -e "\n🚀 Force pushing clean repository..."
git push -u origin main --force

echo -e "\n✅ Done! Repository now contains ONLY:"
echo "  - src/ (components)"
echo "  - public/ (assets)"
echo "  - pages/ (routes)"
echo "  - package.json, tsconfig.json, etc."
echo "  - NO backend, scripts, or root config files!"

cd -