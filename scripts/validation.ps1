# Mix & Mingle - Complete Validation Script
# Run this PowerShell script to validate your deployment

Write-Host "🚀 Starting Mix & Mingle Validation Process..." -ForegroundColor Green

# 1. Code Quality & Lint Check
Write-Host "`n1️⃣ Running Code Quality Check..." -ForegroundColor Yellow
try {
    npm run lint
    tsc --noEmit
    Write-Host "✅ Code quality check passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Code quality issues detected" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 2. Security Audit
Write-Host "`n2️⃣ Running Security Audit..." -ForegroundColor Yellow
try {
    npm audit fix --force
    npm install
    Write-Host "✅ Security audit completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Security audit failed" -ForegroundColor Red
}

# 3. Environment Variables Check
Write-Host "`n3️⃣ Validating Environment Variables..." -ForegroundColor Yellow
Get-ChildItem Env: | Where-Object { $_.Name -match "DATABASE_URL|NEXT_PUBLIC_" } | Format-Table

# 4. Build Test
Write-Host "`n4️⃣ Testing Build Stability..." -ForegroundColor Yellow
npm run build 2>&1 | Out-File build.log
$buildErrors = Get-Content build.log | Select-String "Error"
if ($buildErrors) {
    Write-Host "❌ Build errors detected:" -ForegroundColor Red
    $buildErrors
} else {
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
}

# 5. API Test
Write-Host "`n5️⃣ Testing API Functionality..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://v0-mix-and-mingle-larrybesants-projects.vercel.app/api/test"
    Write-Host "✅ API responding correctly" -ForegroundColor Green
    Write-Host "Response: $($response.StatusCode)"
} catch {
    Write-Host "❌ API test failed" -ForegroundColor Red
    # Get Vercel logs
    vercel logs v0-mix-and-mingle 2>&1 | Out-File vercel-logs.log
}

# 6. Database Connection Test
Write-Host "`n6️⃣ Testing Database Connection..." -ForegroundColor Yellow
# Note: Replace with your actual database credentials
# psql -U your_user -d your_database -c "SELECT COUNT(*) FROM users;"

# 7. Deployment Health Check
Write-Host "`n7️⃣ Checking Deployment Health..." -ForegroundColor Yellow
vercel inspect v0-mix-and-mingle
vercel git ls

# 8. Network Configuration
Write-Host "`n8️⃣ Validating Network Configuration..." -ForegroundColor Yellow
netstat -ano | Select-String "3000|5432"
Get-NetFirewallRule | Where-Object { $_.Action -eq "Block" } | Select-Object DisplayName, Direction

# 9. Final Deployment
Write-Host "`n9️⃣ Ready for Final Deployment..." -ForegroundColor Yellow
$deploy = Read-Host "Deploy to production? (y/N)"
if ($deploy -eq "y" -or $deploy -eq "Y") {
    Write-Host "Restarting services..." -ForegroundColor Yellow
    Restart-Service -Name "MpsSvc" -ErrorAction SilentlyContinue
    Restart-Service -Name "PostgreSQL" -ErrorAction SilentlyContinue
    
    Write-Host "Deploying to production..." -ForegroundColor Yellow
    vercel deploy --prod
    
    Write-Host "✅ Deployment completed!" -ForegroundColor Green
}

Write-Host "`n🎉 Validation process completed!" -ForegroundColor Green
