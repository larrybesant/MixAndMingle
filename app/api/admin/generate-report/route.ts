import { type NextRequest, NextResponse } from "next/server"
import { getFirestore, Timestamp, FieldValue } from "@/lib/firebase-admin"
import { generateWeeklyReport } from "@/functions/report-generator"
import { serverNotificationService } from "@/lib/server/notification-service"
import { sendReportEmail } from "@/functions/email-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = getFirestore()
    const userDoc = await db.collection("users").where("email", "==", session.user.email).get()

    if (userDoc.empty || userDoc.docs[0].data().role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { startDate, endDate } = body

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Generate the report
    const report = await generateWeeklyReport(start, end)

    // Save the report to Firestore
    const reportRef = db.collection("betaReports").doc()
    await reportRef.set({
      ...report,
      id: reportRef.id,
      period: {
        start: Timestamp.fromDate(start),
        end: Timestamp.fromDate(end),
      },
      createdAt: FieldValue.serverTimestamp(),
    })

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
      await sendReportEmail(adminEmails, report, start, end, reportRef.id)
    }

    // Send in-app notification to admins
    for (const adminId of adminIds) {
      await serverNotificationService.createNotification(
        adminId,
        "system",
        "Beta Report Generated",
        `A new beta metrics report for ${start.toLocaleDateString()} - ${end.toLocaleDateString()} is now available.`,
        {
          reportId: reportRef.id,
          reportUrl: `/admin/reports/${reportRef.id}`,
        },
      )
    }

    return NextResponse.json({
      success: true,
      reportId: reportRef.id,
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
