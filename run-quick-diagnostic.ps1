# Quick diagnostic script
Write-Host "🚀 Running Quick Diagnostic..." -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Not in a Node.js project directory" -ForegroundColor Red
    Write-Host "📁 Current directory contents:" -ForegroundColor Yellow
    Get-ChildItem | Select-Object Name, Mode | Format-Table
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "🔍 Running diagnostic..." -ForegroundColor Cyan
npx ts-node quick-diagnostic.ts

Write-Host "✅ Quick diagnostic complete!" -ForegroundColor Green
Write-Host "💡 Try running 'npm run dev' to start the development server" -ForegroundColor Blue
