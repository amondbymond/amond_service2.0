#!/bin/bash
set -e  # Exit on any error

echo "🚀 Starting deployment with database migration..."

# Source your deployment environment variables
source .env.deploy

echo "📌 Environment variables loaded:"
echo "EC2_HOST: $EC2_HOST"
echo "EC2_USER: $EC2_USER"
echo "DB_DATABASE: $DB_DATABASE"

# Step 1: Deploy code changes
echo "📦 Deploying code changes..."
./deploy_backend.sh

# Step 2: Run database migration
echo "🗄️ Running database migration..."
ssh -o StrictHostKeyChecking=no -i "$EC2_SSH_KEY" "$EC2_USER@$EC2_HOST" << 'EOF'
  # Connect to MySQL and run migration
  mysql -u root -p"$DB_PASSWORD" "$DB_DATABASE" << 'SQL_EOF'
    -- Add direction column if it doesn't exist
    ALTER TABLE content ADD COLUMN direction VARCHAR(50) DEFAULT '정보형';
    
    -- Update existing records
    UPDATE content SET direction = '정보형' WHERE direction IS NULL;
    
    -- Verify migration
    SELECT COUNT(*) as total_records, COUNT(direction) as records_with_direction FROM content;
SQL_EOF
EOF

# Step 3: Restart backend to pick up changes
echo "🔄 Restarting backend..."
ssh -o StrictHostKeyChecking=no -i "$EC2_SSH_KEY" "$EC2_USER@$EC2_HOST" << EOF
  cd /home/$EC2_USER/$EC2_FOLDER_NAME/backend
  pm2 restart $PM2_PROCESS_NAME
EOF

echo "✅ Deployment with database migration completed!"
echo "🔍 Check your application logs to ensure everything is working correctly." 