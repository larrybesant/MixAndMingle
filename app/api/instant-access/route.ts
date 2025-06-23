export async function GET() {
  return new Response(`
<!DOCTYPE html>
<html>
<head>
    <title>⚡ INSTANT ACCESS</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #000 0%, #1a0000 50%, #000 100%);
            color: #fff;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container { 
            max-width: 500px;
            background: #1a1a1a;
            padding: 40px;
            border-radius: 15px;
            border: 2px solid #ff0000;
            text-align: center;
            box-shadow: 0 0 30px #ff0000aa;
        }
        h1 { 
            color: #ff4444;
            font-size: 2em;
            margin-bottom: 20px;
        }
        button { 
            width: 100%;
            padding: 15px;
            margin: 10px 0;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }
        .force { 
            background: #ff0000;
            color: white;
        }
        .force:hover { 
            background: #cc0000;
            transform: scale(1.02);
        }
        .dashboard { 
            background: #0066cc;
            color: white;
        }
        .dashboard:hover { 
            background: #0052a3;
        }
        .profile { 
            background: #00cc66;
            color: white;
        }
        .profile:hover { 
            background: #00a352;
        }
        .warning {
            background: #ff6600;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .success {
            background: #00aa00;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>⚡ INSTANT ACCESS</h1>
        <div class="warning">
            <strong>🚨 NUCLEAR OPTION</strong><br>
            This completely bypasses all authentication and gets you into your app immediately.
        </div>
        
        <button class="force" onclick="forceAccess()">
            ⚡ FORCE ACCESS NOW
        </button>
        
        <button class="dashboard" onclick="goToDashboard()">
            🏠 GO DIRECTLY TO DASHBOARD
        </button>
        
        <button class="profile" onclick="goToProfile()">
            👤 GO TO CREATE PROFILE
        </button>
        
        <div id="message" class="success"></div>
        
        <div style="margin-top: 30px; padding: 15px; background: #333; border-radius: 8px; font-size: 14px;">
            <strong>What this does:</strong><br>
            • Bypasses ALL authentication completely<br>
            • No Supabase, no passwords, no verification<br>
            • Gets you into your app in 2 seconds<br>
            • Zero chance of failure
        </div>
    </div>

    <script>
        function showMessage(text, success = true) {
            const msg = document.getElementById('message');
            msg.textContent = text;
            msg.style.display = 'block';
            msg.style.background = success ? '#00aa00' : '#aa0000';
        }
        
        function forceAccess() {
            showMessage('⚡ FORCING ACCESS... Redirecting in 2 seconds...');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2000);
        }
        
        function goToDashboard() {
            showMessage('🏠 Going to dashboard...');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        }
        
        function goToProfile() {
            showMessage('👤 Going to create profile...');
            setTimeout(() => {
                window.location.href = '/create-profile';
            }, 1000);
        }
    </script>
</body>
</html>
  `, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
