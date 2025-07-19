#!/bin/bash
echo "Stopping all services..."

# Stop MySQL
brew services stop mysql@8.0

# Kill any Node.js processes running on port 9988
echo "Killing processes on port 9988..."
lsof -ti:9988 | xargs kill -9 2>/dev/null || echo "No processes found on port 9988"

# Kill any Next.js processes
echo "Killing Next.js processes..."
pkill -f "next dev" 2>/dev/null || echo "No Next.js processes found"

# Kill any nodemon processes
echo "Killing nodemon processes..."
pkill -f "nodemon" 2>/dev/null || echo "No nodemon processes found"

echo "All services stopped!" 