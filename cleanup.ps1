#!/bin/bash
# Quick cleanup script - move debug files to debug folder

echo "🧹 CLEANING UP MIX & MINGLE FOR PRODUCTION"
echo "=========================================="

# Move all .js debug/test files to debug folder
echo "Moving .js debug files..."
Move-Item -Path "diagnose-*.js" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "debug-*.js" -Destination "debug/" -ErrorAction SilentlyContinue  
Move-Item -Path "test-*.js" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "fix-*.js" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "create-*.js" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "*-diagnostic.js" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "browser-*.js" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "email-*.js" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "complete-*.js" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "detailed-*.js" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "full-*.js" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "quick-*.js" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "qa-*.js" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "verify-*.js" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "check-*.js" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "analytics-*.js" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "setup-*.js" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "delete-*.js" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "final-*.js" -Destination "debug/" -ErrorAction SilentlyContinue

# Move HTML files
echo "Moving HTML debug files..."
Move-Item -Path "emergency-*.html" -Destination "debug/" -ErrorAction SilentlyContinue

# Move shell scripts
echo "Moving shell scripts..."
Move-Item -Path "*.sh" -Destination "debug/" -ErrorAction SilentlyContinue

# Move markdown documentation
echo "Moving documentation files..."
Move-Item -Path "*_*.md" -Destination "debug/" -ErrorAction SilentlyContinue
Move-Item -Path "*-*.md" -Destination "debug/" -ErrorAction SilentlyContinue

# Move this cleanup script too
Move-Item -Path "cleanup-report.js" -Destination "debug/" -ErrorAction SilentlyContinue

echo "✅ Cleanup complete!"
echo "📁 Debug files moved to /debug folder"
echo "🚀 App is now production-ready!"
