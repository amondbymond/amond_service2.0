#!/bin/bash
# Start MySQL (macOS Homebrew)
brew services start mysql

# Start backend
cd backend
npx nodemon app.ts &
cd ..

# Start frontend
cd frontend
npm run dev &
cd ..

wait