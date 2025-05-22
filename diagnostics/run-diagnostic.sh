#!/bin/bash

echo "Mix & Mingle System Diagnostic Tool"
echo "=================================="
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js to run this diagnostic."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm to run this diagnostic."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run the diagnostic
echo "🔍 Running system diagnostic..."
npm start

# Ask if user wants to apply fixes
echo
echo "Do you want to apply fixes for identified issues? (y/n)"
read -r apply_fixes

if [[ $apply_fixes =~ ^[Yy]$ ]]; then
    echo "🔧 Applying fixes..."
    npm run fix-all
else
    echo "Fixes not applied. You can apply them later with 'npm run fix-all'"
fi

echo
echo "Diagnostic completed."
