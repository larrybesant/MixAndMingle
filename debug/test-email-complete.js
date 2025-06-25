// Email system test script
require("dotenv").config({ path: ".env.local" });

const { emailService } = require("./lib/email-client");

async function testEmailSystem() {
  console.log("🧪 TESTING EMAIL SYSTEM");
  console.log("=======================");

  // 1. Check configuration status
  console.log("\n1️⃣ Configuration Status:");
  const status = emailService.getStatus();
  console.log("Resend configured:", status.resend.configured);
  console.log("Resend API key:", status.resend.apiKey);
  console.log("Supabase configured:", status.supabase.configured);
  console.log("Supabase URL:", status.supabase.url);
  console.log("Supabase service key:", status.supabase.serviceKey);

  // 2. Test email sending (replace with your actual email)
  const testEmail = "your-email@gmail.com"; // CHANGE THIS TO YOUR EMAIL

  console.log("\n2️⃣ Testing Email Delivery:");
  console.log("Test email address:", testEmail);

  if (testEmail === "your-email@gmail.com") {
    console.log(
      "⚠️ Please update the testEmail variable with your actual email address",
    );
    return;
  }

  try {
    const result = await emailService.sendTestEmail(testEmail);

    if (result.success) {
      console.log("✅ Email sent successfully!");
      console.log("Provider:", result.provider);
      console.log("Email ID:", result.id || "N/A");
      console.log("📧 Check your email inbox (and spam folder)");
    } else {
      console.log("❌ Email sending failed");
      console.log("Error:", result.error);
      console.log("Provider:", result.provider);
    }
  } catch (error) {
    console.log("❌ Unexpected error:", error.message);
  }

  // 3. Next steps
  console.log("\n3️⃣ Next Steps:");

  if (!status.resend.configured) {
    console.log("📝 To enable Resend:");
    console.log("1. Get API key from https://resend.com/api-keys");
    console.log("2. Update RESEND_KEY in .env.local");
    console.log("3. Restart the application");
  }

  if (!status.supabase.configured) {
    console.log("📝 To check Supabase email:");
    console.log("1. Go to Supabase dashboard > Authentication > Email");
    console.log("2. Configure SMTP settings or use default");
    console.log('3. Test with "Send test email" button');
  }

  console.log("\n🎯 RECOMMENDATION:");
  if (status.resend.configured) {
    console.log("✅ Resend is configured - emails should be reliable");
  } else if (status.supabase.configured) {
    console.log(
      "⚠️ Only Supabase configured - may be unreliable for transactional emails",
    );
    console.log("💡 Consider setting up Resend for better deliverability");
  } else {
    console.log("❌ No email service properly configured");
    console.log("🚨 Set up either Resend or Supabase SMTP immediately");
  }
}

// Run the test
testEmailSystem().catch(console.error);
