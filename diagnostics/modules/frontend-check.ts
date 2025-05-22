import fetch from "node-fetch"
import { JSDOM } from "jsdom"

export async function verifyFrontendRendering() {
  console.log("  Verifying frontend rendering...")

  const results = {
    homePageRendering: false,
    loginPageRendering: false,
    forgotPasswordPageRendering: false,
    uiConsistency: true,
    hydrationErrors: false,
    criticalIssues: [] as string[],
  }

  // Check home page rendering
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/`)
    if (response.ok) {
      const html = await response.text()
      const dom = new JSDOM(html)

      // Check for Next.js data attributes that indicate successful hydration
      const nextData = dom.window.document.getElementById("__NEXT_DATA__")
      if (nextData) {
        results.homePageRendering = true
        console.log("  ✅ Home page renders correctly")
      } else {
        console.log("  ⚠️ Home page may have hydration issues")
        results.hydrationErrors = true
        results.criticalIssues.push("Home page may have hydration issues")
      }
    } else {
      console.log("  ❌ Home page returned an error:", response.status)
      results.criticalIssues.push(`Home page returned error ${response.status}`)
    }
  } catch (error) {
    console.error("  ❌ Failed to check home page rendering:", error)
    results.criticalIssues.push("Failed to check home page rendering")
  }

  // Check login page rendering
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    if (response.ok) {
      const html = await response.text()
      const dom = new JSDOM(html)

      // Check for login form elements
      const emailInput = dom.window.document.querySelector('input[type="email"]')
      const passwordInput = dom.window.document.querySelector('input[type="password"]')
      const submitButton = dom.window.document.querySelector('button[type="submit"]')

      if (emailInput && passwordInput && submitButton) {
        results.loginPageRendering = true
        console.log("  ✅ Login page renders correctly")
      } else {
        console.log("  ❌ Login page is missing form elements")
        results.uiConsistency = false
        results.criticalIssues.push("Login page is missing form elements")
      }
    } else {
      console.log("  ❌ Login page returned an error:", response.status)
      results.criticalIssues.push(`Login page returned error ${response.status}`)
    }
  } catch (error) {
    console.error("  ❌ Failed to check login page rendering:", error)
    results.criticalIssues.push("Failed to check login page rendering")
  }

  // Check forgot password page rendering
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/forgot-password`)
    if (response.ok) {
      const html = await response.text()
      const dom = new JSDOM(html)

      // Check for forgot password form elements
      const emailInput = dom.window.document.querySelector('input[type="email"]')
      const submitButton = dom.window.document.querySelector('button[type="submit"]')

      if (emailInput && submitButton) {
        results.forgotPasswordPageRendering = true
        console.log("  ✅ Forgot password page renders correctly")
      } else {
        console.log("  ❌ Forgot password page is missing form elements")
        results.uiConsistency = false
        results.criticalIssues.push("Forgot password page is missing form elements")
      }
    } else {
      console.log("  ❌ Forgot password page returned an error:", response.status)
      results.criticalIssues.push(`Forgot password page returned error ${response.status}`)
    }
  } catch (error) {
    console.error("  ❌ Failed to check forgot password page rendering:", error)
    results.criticalIssues.push("Failed to check forgot password page rendering")
  }

  return results
}
