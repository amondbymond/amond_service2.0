#!/bin/bash

# Database Migration Script for Production
# Usage: ./apply_database_migration.sh YOUR_EC2_IP

if [ $# -eq 0 ]; then
    echo "❌ Please provide your EC2 IP address"
    echo "Usage: ./apply_database_migration.sh YOUR_EC2_IP"
    echo "Example: ./apply_database_migration.sh 13.124.123.45"
    exit 1
fi

EC2_IP=$1
EC2_USER="ec2-user"
SSH_KEY="mond.pem"

echo "🚀 Connecting to EC2 server: $EC2_USER@$EC2_IP"
echo "🔑 Using SSH key: $SSH_KEY"

# Test SSH connection first
echo "🔍 Testing SSH connection..."
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$EC2_USER@$EC2_IP" "echo 'SSH connection successful'"

if [ $? -ne 0 ]; then
    echo "❌ SSH connection failed. Please check:"
    echo "   - EC2 IP address is correct"
    echo "   - mond.pem key file exists and has correct permissions"
    echo "   - EC2 security group allows SSH access"
    exit 1
fi

echo "✅ SSH connection successful!"

# Apply database migration
echo "🗄️ Applying database migration..."
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$EC2_USER@$EC2_IP" << 'EOF'
    echo "Connecting to MySQL and applying migration..."
    
    # Add direction column to content table
    mysql -u root -p'amond123' amond << 'SQL_EOF'
        -- Add direction column if it doesn't exist
        ALTER TABLE content ADD COLUMN direction VARCHAR(50) DEFAULT '정보형';
        
        -- Update existing records
        UPDATE content SET direction = '정보형' WHERE direction IS NULL;
        
        -- Verify the migration
        SELECT COUNT(*) as total_records, COUNT(direction) as records_with_direction FROM content;
        
        -- Show table structure
        DESCRIBE content;
SQL_EOF
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database migration completed successfully!"
    
    # Restart the backend service
    echo "🔄 Restarting backend service..."
    ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$EC2_USER@$EC2_IP" << 'EOF'
        # Find and restart PM2 process
        pm2 list
        pm2 restart all
        echo "Backend service restarted"
EOF
    
    echo "🎉 Migration and restart completed!"
    echo "🔍 Check your application to ensure everything is working correctly."
else
    echo "❌ Database migration failed!"
    exit 1
fi 