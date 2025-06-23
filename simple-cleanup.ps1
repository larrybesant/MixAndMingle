# Simple Emergency Cleanup
Write-Host "🚨 Emergency User Cleanup Starting..." -ForegroundColor Yellow

$baseUrl = "http://localhost:3006/api/admin/emergency-cleanup"

# Nuclear option - delete all users
Write-Host "💥 Using nuclear option to delete ALL users..." -ForegroundColor Red

$body = '{"action": "delete_all_users", "confirm": "YES_DELETE_ALL"}'

try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $body
    Write-Host "✅ Deletion successful!" -ForegroundColor Green
    Write-Host $result
} catch {
    Write-Host "❌ API call failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Wait and verify
Start-Sleep -Seconds 2
Write-Host "🔍 Verifying cleanup..." -ForegroundColor Cyan

$verifyBody = '{"action": "verify_cleanup"}'
try {
    $verifyResult = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $verifyBody
    Write-Host "🔍 Verification result:" -ForegroundColor Cyan
    Write-Host $verifyResult
} catch {
    Write-Host "❌ Verification failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "🏁 Done!" -ForegroundColor Green
