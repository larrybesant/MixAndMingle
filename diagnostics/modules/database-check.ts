import fetch from "node-fetch"
import { createClient } from "redis"
import twilio from "twilio"

export async function checkDatabaseConnections() {
  console.log("  Checking database and service connections...")

  const results = {
    redisConnected: false,
    twilioConnected: false,
    webhooksWorking: false,
    criticalIssues: [] as string[],
  }

  // Check Redis connection
  if (process.env.REDIS_URL) {
    try {
      const redisClient = createClient({
        url: process.env.REDIS_URL,
      })

      await redisClient.connect()
      await redisClient.ping()
      await redisClient.disconnect()

      results.redisConnected = true
      console.log("  ✅ Redis connection successful")
    } catch (error) {
      console.error("  ❌ Redis connection failed:", error)
      results.criticalIssues.push("Redis connection failed")
    }
  } else {
    console.log("  ⚠️ REDIS_URL environment variable not set")
  }

  // Check Twilio connection
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      const account = await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch()

      if (account.status === "active") {
        results.twilioConnected = true
        console.log("  ✅ Twilio connection successful")
      } else {
        console.log(`  ⚠️ Twilio account status: ${account.status}`)
        results.criticalIssues.push(`Twilio account is not active (status: ${account.status})`)
      }
    } catch (error) {
      console.error("  ❌ Twilio connection failed:", error)
      results.criticalIssues.push("Twilio connection failed")
    }
  } else {
    console.log("  ⚠️ Twilio credentials not set")
  }

  // Check webhook integration
  if (process.env.ALERT_WEBHOOK) {
    try {
      const response = await fetch(process.env.ALERT_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "diagnostic_test",
          message: "This is a test webhook from the Mix & Mingle diagnostic tool",
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        results.webhooksWorking = true
        console.log("  ✅ Webhook test successful")
      } else {
        console.log("  ❌ Webhook test failed:", await response.text())
        results.criticalIssues.push("Webhook integration failed")
      }
    } catch (error) {
      console.error("  ❌ Webhook test failed:", error)
      results.criticalIssues.push("Webhook integration failed")
    }
  } else {
    console.log("  ⚠️ ALERT_WEBHOOK environment variable not set")
  }

  return results
}
