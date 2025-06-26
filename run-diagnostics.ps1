# Mix & Mingle - Comprehensive System Diagnostic
Write-Host "🚀 Starting Mix & Mingle System Diagnostic..." -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run from project root." -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
npm install

# Run system scan
Write-Host "🔍 Running comprehensive system scan..." -ForegroundColor Cyan
npx ts-node scripts/comprehensive-system-scan.ts

# Apply automatic fixes
Write-Host "🔧 Applying automatic fixes..." -ForegroundColor Cyan
npx ts-node scripts/auto-fix-engine.ts

# Run QA tests
Write-Host "🧪 Running frontend QA tests..." -ForegroundColor Cyan
npx ts-node scripts/frontend-qa-test.ts

Write-Host "✅ Diagnostic complete! Check the generated reports." -ForegroundColor Green
