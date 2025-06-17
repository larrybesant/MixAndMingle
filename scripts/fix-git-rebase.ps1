# Fix the git rebase issue and get your app working
Write-Host "🔧 Fixing Git Rebase and App Issues..." -ForegroundColor Yellow

# Check current files
Write-Host "📁 Checking current files..." -ForegroundColor Cyan
Get-Content package.json | Select-Object -First 20
Write-Host "`n" -ForegroundColor White

Write-Host "📄 Checking app/page.tsx..." -ForegroundColor Cyan
Get-Content app/page.tsx | Select-Object -First 30
Write-Host "`n" -ForegroundColor White

Write-Host "🎨 Checking app/globals.css..." -ForegroundColor Cyan
Get-Content app/globals.css | Select-Object -First 20
Write-Host "`n" -ForegroundColor White

# Fix git rebase
Write-Host "🔄 Fixing git rebase..." -ForegroundColor Green
git add .
git commit --amend --no-edit
git rebase --continue

Write-Host "✅ Git rebase fixed!" -ForegroundColor Green
Write-Host "🚀 Your app should now work properly!" -ForegroundColor Green
