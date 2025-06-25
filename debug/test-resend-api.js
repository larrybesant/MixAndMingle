/**
 * Test script to verify the new Resend API key works
 * Run this in browser console to test email functionality
 */

async function testResendAPI() {
  console.log("🔬 Testing new Resend API key...");

  try {
    const response = await fetch("/api/auth/test-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "test@example.com",
        subject: "Resend API Test",
        html: "<p>This is a test email to verify the Resend API key works.</p>",
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Resend API key is working!", result);
      return true;
    } else {
      console.error("❌ Resend API test failed:", result);
      return false;
    }
  } catch (error) {
    console.error("❌ Error testing Resend API:", error);
    return false;
  }
}

// Test the API
testResendAPI();
