import { BetaTestingEmail, type BetaTester } from "../lib/email/beta-testing"

// 🎵 BETA TESTERS LIST - ADD YOUR TESTERS HERE
const betaTesters: BetaTester[] = [
  // Example testers - replace with real emails
  { email: "dj.testuser1@example.com", name: "DJ TestMaster", role: "DJ" },
  { email: "music.lover@example.com", name: "Music Lover", role: "Listener" },
  { email: "beta.tester@example.com", name: "Beta Tester", role: "Tester" },

  // ADD YOUR REAL BETA TESTERS HERE:
  // { email: 'real.tester@gmail.com', name: 'Real Tester', role: 'DJ' },
  // { email: 'another.tester@gmail.com', name: 'Another Tester', role: 'Listener' },
]

async function sendBetaInvites() {
  console.log("🎵 MIX & MINGLE - SENDING BETA INVITES")
  console.log("====================================")
  console.log(`📧 Sending invites to ${betaTesters.length} beta testers...`)

  const results = await BetaTestingEmail.sendBulkBetaInvites(betaTesters)

  console.log("\n📊 RESULTS:")
  console.log("===========")

  let successCount = 0
  let failureCount = 0

  results.forEach((result, index) => {
    if (result.success) {
      console.log(`✅ ${result.email} - Sent successfully`)
      successCount++
    } else {
      console.log(`❌ ${result.email} - Failed: ${result.error}`)
      failureCount++
    }
  })

  console.log(`\n📈 SUMMARY:`)
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${failureCount}`)
  console.log(`📧 Total: ${betaTesters.length}`)

  if (successCount > 0) {
    console.log("\n🎉 BETA INVITES SENT SUCCESSFULLY!")
    console.log("🔗 Beta Testing Link: https://mixandmingle.live/beta")
    console.log("📧 Feedback Email: beta@mixandmingle.live")
  }
}

// Run the script
sendBetaInvites().catch(console.error)
