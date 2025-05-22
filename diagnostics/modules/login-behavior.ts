import fetch from "node-fetch"

export async function analyzeLoginBehavior() {
  console.log("  Analyzing login and password reset functionality...")

  const results = {
    loginEndpointWorking: false,
    forgotPasswordEndpointWorking: false,
    resetPasswordEndpointWorking: false,
    routesCorrectlyMapped: false,
    loginPerformance: {
      responseTime: 0,
      timeouts: false,
    },
    criticalIssues: [] as string[],
  }

  // Check login endpoint
  try {
    const startTime = Date.now()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/diagnostic`, {
      timeout: 10000, // 10 second timeout
    })
    const responseTime = Date.now() - startTime

    results.loginPerformance.responseTime = responseTime

    if (responseTime > 5000) {
      console.log(`  ⚠️ Login endpoint response time is slow: ${responseTime}ms`)
      results.loginPerformance.timeouts = true
      results.criticalIssues.push("Login endpoint response time is too slow, may cause timeouts")
    }

    if (response.ok) {
      results.loginEndpointWorking = true
      console.log("  ✅ Login diagnostic endpoint is working")
    } else {
      console.log("  ❌ Login diagnostic endpoint returned an error:", await response.text())
      results.criticalIssues.push("Login endpoint is not working properly")
    }
  } catch (error) {
    console.error("  ❌ Failed to check login endpoint:", error)
    results.criticalIssues.push("Failed to connect to login endpoint")
  }

  // Check forgot password endpoint
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
      }),
    })

    // We expect a 200 response even if the email doesn't exist (for security reasons)
    if (response.ok) {
      results.forgotPasswordEndpointWorking = true
      console.log("  ✅ Forgot password endpoint is working")
    } else {
      console.log("  ❌ Forgot password endpoint returned an error:", await response.text())
      results.criticalIssues.push("Forgot password endpoint is not working properly")
    }
  } catch (error) {
    console.error("  ❌ Failed to check forgot password endpoint:", error)
    results.criticalIssues.push("Failed to connect to forgot password endpoint")
  }

  // Check reset password endpoint
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: "test-token",
        password: "NewPassword123!",
        confirmPassword: "NewPassword123!",
      }),
    })

    // We expect a 400 response for an invalid token, but the endpoint should be working
    if (response.status === 400) {
      results.resetPasswordEndpointWorking = true
      console.log("  ✅ Reset password endpoint is working (returned expected 400 for invalid token)")
    } else if (response.ok) {
      results.resetPasswordEndpointWorking = true
      console.log("  ✅ Reset password endpoint is working")
    } else {
      console.log("  ❌ Reset password endpoint returned an unexpected error:", await response.text())
      results.criticalIssues.push("Reset password endpoint is not working properly")
    }
  } catch (error) {
    console.error("  ❌ Failed to check reset password endpoint:", error)
    results.criticalIssues.push("Failed to connect to reset password endpoint")
  }

  // Check route mapping
  try {
    const loginPageResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    const forgotPasswordPageResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/forgot-password`)
    const resetPasswordPageResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/reset-password`)

    if (loginPageResponse.ok && forgotPasswordPageResponse.ok && resetPasswordPageResponse.ok) {
      results.routesCorrectlyMapped = true
      console.log("  ✅ Authentication routes are correctly mapped")
    } else {
      console.log("  ❌ Some authentication routes are not correctly mapped")
      if (!loginPageResponse.ok) results.criticalIssues.push("Login page route is not correctly mapped")
      if (!forgotPasswordPageResponse.ok)
        results.criticalIssues.push("Forgot password page route is not correctly mapped")
      if (!resetPasswordPageResponse.ok)
        results.criticalIssues.push("Reset password page route is not correctly mapped")
    }
  } catch (error) {
    console.error("  ❌ Failed to check route mapping:", error)
    results.criticalIssues.push("Failed to check authentication route mapping")
  }

  return results
}
