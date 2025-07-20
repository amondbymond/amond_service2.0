#!/bin/bash

echo "🚀 Setting up separate Frontend and Backend repositories..."
echo "================================================="

# Create a new parent directory for the separated projects
PARENT_DIR="/Users/taehyun/Downloads/Amond_separated"
mkdir -p "$PARENT_DIR"

# ============================
# FRONTEND SETUP
# ============================
echo -e "\n📦 Setting up Frontend Repository..."
FRONTEND_DIR="$PARENT_DIR/amond-frontend"
rm -rf "$FRONTEND_DIR" 2>/dev/null
mkdir -p "$FRONTEND_DIR"

# Copy frontend files
echo "  📁 Copying frontend files..."
cp -r /Users/taehyun/Downloads/Amond_new/frontend/* "$FRONTEND_DIR/"
cp /Users/taehyun/Downloads/Amond_new/frontend/.eslintrc.json "$FRONTEND_DIR/" 2>/dev/null || true
cp /Users/taehyun/Downloads/Amond_new/frontend/.gitignore "$FRONTEND_DIR/" 2>/dev/null || true

# Initialize frontend git
cd "$FRONTEND_DIR"
echo "  🔧 Initializing git for frontend..."
git init
git remote add origin https://github.com/amondbymond/amond-frontend.git
git add .
git commit -m "Frontend application - Clean separation from monorepo"
echo "  ✅ Frontend ready at: $FRONTEND_DIR"

# ============================
# BACKEND SETUP
# ============================
echo -e "\n📦 Setting up Backend Repository..."
BACKEND_DIR="$PARENT_DIR/amond-backend"
rm -rf "$BACKEND_DIR" 2>/dev/null
mkdir -p "$BACKEND_DIR"

# Copy backend files
echo "  📁 Copying backend files..."
cp -r /Users/taehyun/Downloads/Amond_new/backend/* "$BACKEND_DIR/"
cp /Users/taehyun/Downloads/Amond_new/backend/.gitignore "$BACKEND_DIR/" 2>/dev/null || true

# Create .github/workflows directory for deploy.yaml
mkdir -p "$BACKEND_DIR/.github/workflows"

# Copy and update deploy.yaml for backend-only deployment
echo "  📝 Creating backend deploy.yaml..."
cat > "$BACKEND_DIR/.github/workflows/deploy.yml" << 'EOF'
name: Deploy Backend to EC2

on:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Generate .env for backend
        run: |
          cat <<EOL > .env
          NODE_ENV=${{ secrets.NODE_ENV }}
          DB_HOST=${{ secrets.DB_HOST }}
          DB_DATABASE=${{ secrets.DB_DATABASE }}
          DB_PASSWORD=${{ secrets.DB_PASSWORD }}
          SESSION_SECRET=${{ secrets.SESSION_SECRET }}
          CRYPTO_KEY=${{ secrets.CRYPTO_KEY }}
          CRYPTO_DELETED_KEY=${{ secrets.CRYPTO_DELETED_KEY }}
          OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}
          AWS_ACCESS_KEY=${{ secrets.AWS_ACCESS_KEY }}
          AWS_SECRET_ACCESS=${{ secrets.AWS_SECRET_ACCESS }}
          GOOGLE_CLIENT_ID=${{ secrets.GOOGLE_CLIENT_ID }}
          GOOGLE_CLIENT_SECRET=${{ secrets.GOOGLE_CLIENT_SECRET }}
          GOOGLE_REFRESH_TOKEN=${{ secrets.GOOGLE_REFRESH_TOKEN }}
          KAKAO_REST_API=${{ secrets.KAKAO_REST_API }}
          YOUTUBE_API_KEY=${{ secrets.YOUTUBE_API_KEY }}
          CHROME_BIN=/usr/local/bin/chromium
          EOL

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Create PEM file
        run: |
          echo "${{ secrets.EC2_SSH_KEY }}" > key.pem
          chmod 600 key.pem

      - name: Deploy Backend via rsync to EC2
        run: |
          ssh -o StrictHostKeyChecking=no -i key.pem ${{ secrets.EC2_USER }}@${{ secrets.EC2_HOST }} "mkdir -p /home/${{ secrets.EC2_USER }}/${{ secrets.EC2_FOLDER_NAME }}/backend"

          rsync -avz --delete --exclude 'node_modules' \
            -e "ssh -i key.pem -o StrictHostKeyChecking=no" \
            ./ ${{ secrets.EC2_USER }}@${{ secrets.EC2_HOST }}:/home/${{ secrets.EC2_USER }}/${{ secrets.EC2_FOLDER_NAME }}/backend

          ssh -o StrictHostKeyChecking=no -i key.pem ${{ secrets.EC2_USER }}@${{ secrets.EC2_HOST }} "
            cd /home/${{ secrets.EC2_USER }}/${{ secrets.EC2_FOLDER_NAME }}/backend &&
            npm install &&
            pm2 restart ${{ secrets.PM2_PROCESS_NAME }} || pm2 start npm --name ${{ secrets.PM2_PROCESS_NAME }} -- start
          "

      - name: Remove PEM file
        run: rm key.pem
EOF

# Initialize backend git
cd "$BACKEND_DIR"
echo "  🔧 Initializing git for backend..."
git init
git remote add origin https://github.com/amondbymond/amond-backend.git
git add .
git commit -m "Backend application - Separated from monorepo with auto-deployment"
echo "  ✅ Backend ready at: $BACKEND_DIR"

# ============================
# SUMMARY
# ============================
echo -e "\n✅ ✅ ✅ SETUP COMPLETE! ✅ ✅ ✅"
echo "================================================="
echo ""
echo "📁 Frontend Repository:"
echo "   Location: $FRONTEND_DIR"
echo "   Remote: https://github.com/amondbymond/amond-frontend.git"
echo "   Next steps:"
echo "     cd $FRONTEND_DIR"
echo "     git push -u origin main --force"
echo ""
echo "📁 Backend Repository:"
echo "   Location: $BACKEND_DIR"
echo "   Remote: https://github.com/amondbymond/amond-backend.git"
echo "   Next steps:"
echo "     cd $BACKEND_DIR"
echo "     git push -u origin main"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Work in these separate directories from now on"
echo "   - Never copy the entire Amond_new directory"
echo "   - Each repo has its own git remote"
echo "   - Backend has deploy.yml for auto-deployment to EC2"
echo "   - Frontend deploys through AWS Amplify"
echo ""
echo "🔐 Don't forget to add secrets to the backend GitHub repo:"
echo "   Settings → Secrets → Actions → Add all the secrets from deploy.yml"