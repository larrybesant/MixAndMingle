#!/bin/bash
echo "🔧 Fixing Node.js version issue..."

# Clear any problematic cache
npm cache clean --force

# Reinstall dependencies with correct Node version
rm -rf node_modules
rm package-lock.json
npm install

echo "✅ Node.js version issue fixed!"
echo "🚀 Try running your app again: npm run dev"
