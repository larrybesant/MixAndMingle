import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import { getFirestore } from "@/lib/firebase-admin"
import { serverNotificationService } from "@/lib/server/notification-service"
import { generateWeeklyReport } from "./report-generator"
import { sendReportEmail } from "./email-service"

// Schedule function to run every Monday at 8:00 AM
export const generateWeeklyBetaReport = functions.pubsub
  .schedule("0 8 * * 1") // Cron syntax: minute hour day-of-month month day-of-week
  .timeZone("America/New_York")
  .onRun(async (context) => {
    try {
      const db = getFirestore()

      // Get the date range for the past week
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)

      console.log(`Generating weekly report from ${startDate.toISOString()} to ${endDate.toISOString()}`)

      // Generate the report
      const report = await generateWeeklyReport(startDate, endDate)

      // Save the report to Firestore
      const reportRef = db.collection("betaReports").doc()
      await reportRef.set({
        ...report,
        id: reportRef.id,
        period: {
          start: admin.firestore.Timestamp.fromDate(startDate),
          end: admin.firestore.Timestamp.fromDate(endDate),
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      console.log(`Report saved with ID: ${reportRef.id}`)

      // Get admin users to send the report to
      const adminsSnapshot = await db.collection("users").where("role", "==", "admin").get()
      const adminEmails: string[] = []
      const adminIds: string[] = []

      adminsSnapshot.forEach((doc) => {
        const userData = doc.data()
        if (userData.email) {
          adminEmails.push(userData.email)
          adminIds.push(doc.id)
        }
      })

      // Send email to admins
      if (adminEmails.length > 0) {
        await sendReportEmail(adminEmails, report, startDate, endDate, reportRef.id)
        console.log(`Report email sent to ${adminEmails.length} admins`)
      }

      // Send in-app notification to admins
      for (const adminId of adminIds) {
        await serverNotificationService.createNotification(
          adminId,
          "system",
          "Weekly Beta Report Available",
          `The beta metrics report for ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()} is now available.`,
          {
            reportId: reportRef.id,
            reportUrl: `/admin/reports/${reportRef.id}`,
          },
        )
      }

      return null
    } catch (error) {
      console.error("Error generating weekly report:", error)
      return null
    }
  })
