import fetch from "node-fetch"

export async function testApiEndpoints() {
  console.log("  Testing API endpoints...")

  const results = {
    authEndpoints: {
      diagnostic: false,
      verifyConfig: false,
      forgotPassword: false,
      resetPassword: false,
    },
    dataEndpoints: {
      rooms: false,
      drinks: false,
    },
    notificationEndpoints: {
      vapidKey: false,
      registerToken: false,
      send: false,
    },
    criticalIssues: [] as string[],
  }

  // Test auth endpoints
  try {
    const diagnosticResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/diagnostic`)
    results.authEndpoints.diagnostic = diagnosticResponse.ok

    const verifyConfigResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-config`)
    results.authEndpoints.verifyConfig = verifyConfigResponse.ok

    const forgotPasswordResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    })
    results.authEndpoints.forgotPassword = forgotPasswordResponse.ok

    const resetPasswordResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "test-token",
        password: "NewPassword123!",
        confirmPassword: "NewPassword123!",
      }),
    })
    // We expect a 400 for invalid token, but the endpoint should be working
    results.authEndpoints.resetPassword = resetPasswordResponse.status === 400 || resetPasswordResponse.ok

    console.log("  ✅ Auth endpoints checked")

    if (!results.authEndpoints.diagnostic) results.criticalIssues.push("Auth diagnostic endpoint is not working")
    if (!results.authEndpoints.verifyConfig) results.criticalIssues.push("Auth verify-config endpoint is not working")
    if (!results.authEndpoints.forgotPassword) results.criticalIssues.push("Forgot password endpoint is not working")
    if (!results.authEndpoints.resetPassword) results.criticalIssues.push("Reset password endpoint is not working")
  } catch (error) {
    console.error("  ❌ Failed to test auth endpoints:", error)
    results.criticalIssues.push("Failed to test auth endpoints")
  }

  // Test data endpoints
  try {
    const roomsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/rooms`)
    results.dataEndpoints.rooms = roomsResponse.ok

    const drinksResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/drinks`)
    results.dataEndpoints.drinks = drinksResponse.ok

    console.log("  ✅ Data endpoints checked")

    if (!results.dataEndpoints.rooms) results.criticalIssues.push("Rooms endpoint is not working")
    if (!results.dataEndpoints.drinks) results.criticalIssues.push("Drinks endpoint is not working")
  } catch (error) {
    console.error("  ❌ Failed to test data endpoints:", error)
    results.criticalIssues.push("Failed to test data endpoints")
  }

  // Test notification endpoints
  try {
    const vapidKeyResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/firebase/vapid-key`)
    results.notificationEndpoints.vapidKey = vapidKeyResponse.ok

    const registerTokenResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/register-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test-user",
        token: "test-token",
        platform: "web",
      }),
    })
    results.notificationEndpoints.registerToken = registerTokenResponse.ok

    const sendResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test-user",
        title: "Test Notification",
        body: "This is a test notification",
      }),
    })
    results.notificationEndpoints.send = sendResponse.ok

    console.log("  ✅ Notification endpoints checked")

    if (!results.notificationEndpoints.vapidKey) results.criticalIssues.push("VAPID key endpoint is not working")
    if (!results.notificationEndpoints.registerToken)
      results.criticalIssues.push("Register token endpoint is not working")
    if (!results.notificationEndpoints.send) results.criticalIssues.push("Send notification endpoint is not working")
  } catch (error) {
    console.error("  ❌ Failed to test notification endpoints:", error)
    results.criticalIssues.push("Failed to test notification endpoints")
  }

  return results
}
