#!/bin/bash
echo "🔍 Checking what's actually deployed vs local code..."

# Check current git status
echo "📋 Current Git Status:"
git status

# Check what's in the actual deployed files
echo "📁 Checking actual file contents..."
echo "=== package.json ==="
head -20 package.json

echo "=== app/page.tsx ==="
head -30 app/page.tsx

echo "=== app/globals.css ==="
head -20 app/globals.css

# Check if there are uncommitted changes
echo "🔄 Checking for differences..."
git diff --name-only

echo "✅ Sync check complete!"
