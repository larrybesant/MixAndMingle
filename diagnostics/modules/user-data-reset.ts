import { getAuth } from "firebase-admin/auth"

export async function resetUserData() {
  console.log("  Resetting corrupted user data...")

  const results = {
    usersChecked: 0,
    usersReset: 0,
    sessionsRevoked: 0,
    errors: [] as string[],
  }

  try {
    const auth = getAuth()

    // List users (limit to 1000 for safety)
    const listUsersResult = await auth.listUsers(1000)
    results.usersChecked = listUsersResult.users.length

    console.log(`  Checking ${results.usersChecked} users for issues...`)

    // Check each user for issues
    for (const user of listUsersResult.users) {
      try {
        // Check for signs of corruption (this is a simplified example)
        const needsReset =
          user.disabled || (user.customClaims && user.customClaims.corrupted) || user.tokensValidAfterTime === null

        if (needsReset) {
          // Revoke all sessions for this user
          await auth.revokeRefreshTokens(user.uid)
          results.sessionsRevoked++

          // Reset user if needed
          if (user.disabled) {
            await auth.updateUser(user.uid, { disabled: false })
          }

          // Clear any corrupted claims
          if (user.customClaims && user.customClaims.corrupted) {
            const { corrupted, ...otherClaims } = user.customClaims
            await auth.setCustomUserClaims(user.uid, otherClaims)
          }

          results.usersReset++
          console.log(`  ✅ Reset user ${user.uid} (${user.email || "no email"})`)
        }
      } catch (error) {
        console.error(`  ❌ Error resetting user ${user.uid}:`, error)
        results.errors.push(
          `Failed to reset user ${user.uid}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }

    console.log(
      `  ✅ User data reset complete. Reset ${results.usersReset} users and revoked ${results.sessionsRevoked} sessions.`,
    )
  } catch (error) {
    console.error("  ❌ Error during user data reset:", error)
    results.errors.push(`Failed to reset user data: ${error instanceof Error ? error.message : String(error)}`)
  }

  return results
}
