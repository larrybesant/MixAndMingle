// 🔧 TARGETED EMAIL DIAGNOSTIC
console.log("🔧 TARGETED EMAIL DIAGNOSTIC - Finding the exact issue");
console.log("=====================================================");
console.log("");

const http = require("http");

async function diagnoseSpecificIssue() {
  // First, let's test the basic API endpoint
  console.log("1️⃣ Testing basic API connectivity...");

  const postData = JSON.stringify({
    email: "larrybesant@gmail.com",
  });

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/auth/reset-password",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": postData.length,
    },
  };

  const req = http.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log("📡 Status:", res.statusCode);
      console.log("");

      try {
        const response = JSON.parse(data);
        console.log("📦 Full Response:");
        console.log(JSON.stringify(response, null, 2));
        console.log("");

        // Analyze the specific failure
        if (response.email_sent === false) {
          console.log("🔍 ANALYSIS: Email sending failed");
          console.log("");

          if (response.reason === "User not found") {
            console.log("❌ ISSUE: User does not exist in Supabase");
            console.log("");
            console.log("🔧 SOLUTION: Create the user first");
            console.log("   1. Go to your signup page");
            console.log("   2. Sign up with: larrybesant@gmail.com");
            console.log("   3. Or use a different email that exists");
            console.log("");
          } else if (response.troubleshooting) {
            console.log("❌ ISSUE: Both Supabase and Resend email failed");
            console.log("");
            console.log("🔧 IMMEDIATE SOLUTIONS:");
            console.log("");
            console.log("Option A - Use Direct Reset Link:");
            if (response.reset_link) {
              console.log("   Copy this URL and paste in browser:");
              console.log("   " + response.reset_link);
            } else {
              console.log("   (No direct link available)");
            }
            console.log("");
            console.log("Option B - Fix Email System:");
            console.log("   1. Get Resend API key from https://resend.com");
            console.log("   2. Add to .env.local: RESEND_KEY=your_key");
            console.log("   3. Restart app: npm run dev");
            console.log("");
            console.log("Option C - Check Supabase:");
            console.log("   1. Go to Supabase dashboard");
            console.log("   2. Check Auth > Settings > SMTP settings");
            console.log("   3. Verify email templates are active");
            console.log("");
          }
        } else if (response.email_sent === true) {
          console.log("✅ SUCCESS: Email was sent!");
          console.log("📧 Method:", response.method);
          console.log("");
          console.log("🔍 CHECK GMAIL NOW:");
          console.log("   1. Inbox, Spam, Promotions tabs");
          console.log('   2. Search: "password reset"');
          console.log('   3. Search: "mixandmingle"');
          console.log("   4. Look for recent emails (last 10 minutes)");
          console.log("");
        }
      } catch (parseError) {
        console.log("❌ Could not parse JSON response");
        console.log("Raw response:", data);
      }

      console.log("");
      console.log("🚀 QUICK TEST: Try creating a user first");
      console.log("=======================================");
      console.log("");
      console.log("If user doesn't exist, try this:");
      console.log("1. Go to: http://localhost:3000/signup");
      console.log("2. Create account with: larrybesant@gmail.com");
      console.log("3. Then try password reset again");
      console.log("");
    });
  });

  req.on("error", (error) => {
    console.log("❌ Connection Error:", error.message);
    console.log("");
    console.log("Make sure Next.js is running: npm run dev");
  });

  req.write(postData);
  req.end();
}

// Run the diagnostic
diagnoseSpecificIssue();
