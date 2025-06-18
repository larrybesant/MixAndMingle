import { Resend } from "resend"

const resendKey = process.env.RESEND_KEY
const resend = resendKey ? new Resend(resendKey) : null

export interface BetaTester {
  email: string
  name: string
  role?: string
  signupDate?: Date
}

export class BetaTestingEmail {
  static async sendBetaInvite(tester: BetaTester) {
    if (!resend) {
      console.error("Resend API key missing. Skipping email send.")
      return { success: false, error: "Resend API key missing" }
    }

    const betaLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://mixandmingle.live"}/beta`

    try {
      const { data, error } = await resend.emails.send({
        from: "Mix & Mingle <beta@mixandmingle.live>",
        to: [tester.email],
        subject: "🎵 You're Invited to Beta Test Mix & Mingle!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mix & Mingle Beta Invitation</title>
          </head>
          <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #000000 0%, #4c1d95 50%, #000000 100%); font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              
              <!-- Header -->
              <div style="text-align: center; padding: 40px 20px;">
                <h1 style="font-size: 48px; font-weight: 900; margin: 0; color: #ffffff;">
                  <span style="color: #fb923c; text-shadow: 0 0 15px rgba(251, 146, 60, 0.8);">MIX</span>
                  <span style="font-size: 56px; margin: 0 10px;">🎵</span>
                  <span style="color: #22d3ee; text-shadow: 0 0 15px rgba(34, 211, 238, 0.8);">MINGLE</span>
                </h1>
                <div style="background: linear-gradient(90deg, #ef4444, #ec4899); color: white; padding: 8px 20px; border-radius: 25px; display: inline-block; font-weight: bold; margin-top: 20px;">
                  🚀 EXCLUSIVE BETA INVITATION
                </div>
              </div>

              <!-- Main Content -->
              <div style="background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(147, 51, 234, 0.3); border-radius: 20px; padding: 30px; margin: 20px 0; backdrop-filter: blur(10px);">
                <h2 style="color: #ffffff; font-size: 24px; margin-bottom: 20px;">Hey ${tester.name || "DJ"}! 👋</h2>
                
                <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  You've been selected to be one of the first to experience <strong style="color: #22d3ee;">Mix & Mingle</strong> - the revolutionary platform where DJs stream live and music lovers connect globally!
                </p>

                <div style="background: rgba(147, 51, 234, 0.2); border: 1px solid rgba(147, 51, 234, 0.4); border-radius: 15px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #a855f7; margin-top: 0;">🎯 What You'll Be Testing:</h3>
                  <ul style="color: #d1d5db; margin: 0; padding-left: 20px;">
                    <li>Live DJ streaming with webcam & audio</li>
                    <li>Real-time chat and audience interaction</li>
                    <li>Room discovery and social features</li>
                    <li>Mobile and desktop experience</li>
                    <li>User profiles and DJ communities</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${betaLink}" style="background: linear-gradient(90deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; padding: 15px 40px; border-radius: 15px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);">
                    🎵 START BETA TESTING
                  </a>
                </div>

                <div style="background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 15px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #22c55e; margin-top: 0;">💡 How to Help:</h3>
                  <p style="color: #d1d5db; margin: 0;">
                    Try everything! Sign up, create rooms, go live, chat with others. Report any bugs, suggest improvements, and let us know what you love (or don't love) about the experience.
                  </p>
                </div>

                <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
                  <strong>Beta Testing Period:</strong> ${new Date().toLocaleDateString()} - ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}<br>
                  <strong>Feedback Email:</strong> <a href="mailto:beta@mixandmingle.live" style="color: #22d3ee;">beta@mixandmingle.live</a><br>
                  <strong>Beta Testing Page:</strong> <a href="${betaLink}" style="color: #22d3ee;">${betaLink}</a>
                </p>
              </div>

              <!-- Footer -->
              <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
                <p>This is an exclusive beta invitation. Please don't share this link publicly.</p>
                <p>© 2025 Mix & Mingle. All rights reserved.</p>
              </div>

            </div>
          </body>
          </html>
        `,
      })

      if (error) {
        console.error("Error sending beta invite:", error)
        return { success: false, error }
      }

      console.log("Beta invite sent successfully:", data)
      return { success: true, data }
    } catch (error) {
      console.error("Failed to send beta invite:", error)
      return { success: false, error }
    }
  }

  static async sendBulkBetaInvites(testers: BetaTester[]) {
    const results = []

    for (const tester of testers) {
      const result = await this.sendBetaInvite(tester)
      results.push({ email: tester.email, ...result })

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    return results
  }

  static async sendFeedbackConfirmation(email: string, name: string, feedback: string) {
    if (!resend) {
      console.error("Resend API key missing. Skipping email send.")
      return { success: false, error: "Resend API key missing" }
    }

    try {
      const { data, error } = await resend.emails.send({
        from: "Mix & Mingle <beta@mixandmingle.live>",
        to: [email],
        subject: "🎉 Thanks for Your Beta Feedback!",
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #000000 0%, #4c1d95 50%, #000000 100%); font-family: Arial, sans-serif;">
            <div style="text-align: center; padding: 20px;">
              <h1 style="color: #22d3ee; font-size: 36px; margin: 0;">Thanks ${name}! 🎉</h1>
              <p style="color: #d1d5db; font-size: 18px;">Your feedback helps make Mix & Mingle better!</p>
            </div>
            
            <div style="background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(34, 211, 238, 0.3); border-radius: 15px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #22d3ee;">Your Feedback:</h3>
              <p style="color: #d1d5db; font-style: italic;">"${feedback}"</p>
            </div>
            
            <div style="text-align: center; color: #9ca3af; font-size: 14px;">
              <p>Keep testing and send us more feedback anytime!</p>
              <p><a href="mailto:beta@mixandmingle.live" style="color: #22d3ee;">beta@mixandmingle.live</a></p>
            </div>
          </div>
        `,
      })

      return { success: true, data }
    } catch (error) {
      console.error("Failed to send feedback confirmation:", error)
      return { success: false, error }
    }
  }
}
