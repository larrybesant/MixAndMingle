export function BetaInvitationEmail({ name, inviteCode }: { name: string; inviteCode: string }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Mix & Mingle Beta Program!</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #f8f8f8;
      background-color: #121212;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #333;
    }
    .logo {
      max-width: 180px;
    }
    .content {
      padding: 30px 0;
    }
    .button {
      display: inline-block;
      background-color: #8b5cf6;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 50px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #333;
    }
    .code {
      background-color: #333;
      padding: 10px 15px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 18px;
      letter-spacing: 2px;
      margin: 15px 0;
      display: inline-block;
    }
    h1, h2 {
      color: #fff;
    }
    .steps {
      background-color: #1a1a1a;
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
    }
    .step {
      margin-bottom: 15px;
    }
    .step-number {
      display: inline-block;
      background-color: #8b5cf6;
      color: white;
      width: 24px;
      height: 24px;
      text-align: center;
      border-radius: 50%;
      margin-right: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://mixandmingle.com/logo.png" alt="Mix & Mingle Logo" class="logo">
    </div>
    
    <div class="content">
      <h1>Welcome to the Mix & Mingle Beta!</h1>
      
      <p>Hi ${name},</p>
      
      <p>We're excited to welcome you to the Mix & Mingle beta program! Your application has been reviewed and approved, and we can't wait for you to start exploring our platform.</p>
      
      <p>Here's your exclusive beta access code:</p>
      
      <div style="text-align: center;">
        <div class="code">${inviteCode}</div>
      </div>
      
      <div class="steps">
        <h2>Getting Started</h2>
        
        <div class="step">
          <span class="step-number">1</span>
          <strong>Create Your Account</strong><br>
          Visit <a href="https://mixandmingle.com/signup" style="color: #8b5cf6;">mixandmingle.com/signup</a> and enter your beta code when prompted.
        </div>
        
        <div class="step">
          <span class="step-number">2</span>
          <strong>Complete Your Profile</strong><br>
          Add a profile picture, bio, and music preferences to enhance your experience.
        </div>
        
        <div class="step">
          <span class="step-number">3</span>
          <strong>Join Our Discord</strong><br>
          Connect with other beta testers and our team in the <a href="https://discord.gg/mixandmingle" style="color: #8b5cf6;">Mix & Mingle Discord</a>.
        </div>
        
        <div class="step">
          <span class="step-number">4</span>
          <strong>Start Exploring</strong><br>
          Check out the beta tasks in your dashboard and start testing features!
        </div>
      </div>
      
      <p>During the beta, you'll have access to all premium features at no cost. We encourage you to explore everything Mix & Mingle has to offer and provide feedback on your experience.</p>
      
      <div style="text-align: center;">
        <a href="https://mixandmingle.com/beta/onboarding" class="button">View Beta Onboarding Guide</a>
      </div>
      
      <p>If you have any questions or need assistance, please don't hesitate to reach out to our team at <a href="mailto:beta@mixandmingle.com" style="color: #8b5cf6;">beta@mixandmingle.com</a> or in the Discord #help channel.</p>
      
      <p>Thank you for being part of our journey!</p>
      
      <p>
        Best regards,<br>
        The Mix & Mingle Team
      </p>
    </div>
    
    <div class="footer">
      <p>© 2025 Mix & Mingle. All rights reserved.</p>
      <p>
        <a href="https://mixandmingle.com/terms" style="color: #8b5cf6; margin: 0 10px;">Terms</a>
        <a href="https://mixandmingle.com/privacy" style="color: #8b5cf6; margin: 0 10px;">Privacy</a>
        <a href="https://mixandmingle.com/contact" style="color: #8b5cf6; margin: 0 10px;">Contact</a>
      </p>
      <p>You're receiving this email because you applied to join the Mix & Mingle beta program.</p>
    </div>
  </div>
</body>
</html>
  `
}
