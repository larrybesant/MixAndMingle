# Emergency User Cleanup PowerShell Script
Write-Host "🚨 Starting Emergency User Cleanup..." -ForegroundColor Yellow

$baseUrl = "http://localhost:3006/api/admin/emergency-cleanup"
$headers = @{"Content-Type" = "application/json"}

# Step 1: Check current users
Write-Host "📊 Checking current user count..." -ForegroundColor Cyan
$countBody = @{action = "count_users"} | ConvertTo-Json
try {
    $countResult = Invoke-RestMethod -Uri $baseUrl -Method POST -Headers $headers -Body $countBody
    Write-Host "👥 Current users:" $countResult.authUsers "auth," $countResult.profiles "profiles" -ForegroundColor Green
} catch {
    Write-Host "❌ Error checking users:" $_.Exception.Message -ForegroundColor Red
    exit 1
}

if ($countResult.totalUsers -eq 0) {
    Write-Host "✅ No users found - database is already clean!" -ForegroundColor Green
    exit 0
}

# Step 2: Delete specific user
Write-Host "🎯 Targeting specific user: 48a955b2-040e-4add-9342-625e1ffdca43" -ForegroundColor Yellow
$deleteBody = @{
    action = "delete_specific_user"
    userId = "48a955b2-040e-4add-9342-625e1ffdca43"
    confirm = "YES_DELETE_SPECIFIC"
} | ConvertTo-Json

try {
    $deleteResult = Invoke-RestMethod -Uri $baseUrl -Method POST -Headers $headers -Body $deleteBody
    Write-Host "🗑️ Deletion result:" $deleteResult.message -ForegroundColor Green
} catch {
    Write-Host "❌ Specific deletion failed:" $_.Exception.Message -ForegroundColor Red
    Write-Host "💥 Trying nuclear option..." -ForegroundColor Yellow
    
    # Nuclear option
    $nuclearBody = @{
        action = "delete_all_users"
        confirm = "YES_DELETE_ALL"
    } | ConvertTo-Json
    
    try {
        $nuclearResult = Invoke-RestMethod -Uri $baseUrl -Method POST -Headers $headers -Body $nuclearBody
        Write-Host "💥 Nuclear deletion result:" $nuclearResult.message -ForegroundColor Green
    } catch {
        Write-Host "❌ Nuclear option failed:" $_.Exception.Message -ForegroundColor Red
        Write-Host "📋 Manual SQL cleanup required in Supabase dashboard" -ForegroundColor Red
        exit 1
    }
}

# Step 3: Verify cleanup
Start-Sleep -Seconds 2
Write-Host "🔍 Verifying cleanup..." -ForegroundColor Cyan
$verifyBody = @{action = "verify_cleanup"} | ConvertTo-Json

try {
    $verifyResult = Invoke-RestMethod -Uri $baseUrl -Method POST -Headers $headers -Body $verifyBody
    $totalUsers = $verifyResult.verification.totalUsers
    
    if ($totalUsers -eq 0) {
        Write-Host "🎉 SUCCESS: All users deleted! Database is clean!" -ForegroundColor Green
        Write-Host "✨ Ready for beta testing!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Warning: $totalUsers users still remain" -ForegroundColor Yellow
        Write-Host "📋 Manual cleanup may be required" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Verification failed:" $_.Exception.Message -ForegroundColor Red
}

Write-Host "🏁 Cleanup process complete!" -ForegroundColor Cyan
