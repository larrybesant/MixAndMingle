import * as nodemailer from "nodemailer"
import * as functions from "firebase-functions"
import type { WeeklyReport } from "./report-generator"

// Configure email transport
const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password,
  },
})

export async function sendReportEmail(
  recipients: string[],
  report: WeeklyReport,
  startDate: Date,
  endDate: Date,
  reportId: string,
): Promise<void> {
  const appUrl = functions.config().app.url || "https://mix-and-mingle.vercel.app"
  const reportUrl = `${appUrl}/admin/reports/${reportId}`

  const mailOptions = {
    from: `"Mix & Mingle Beta" <${functions.config().email.user}>`,
    to: recipients.join(", "),
    subject: `Weekly Beta Report: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    html: generateEmailHtml(report, startDate, endDate, reportUrl),
  }

  try {
    await mailTransport.sendMail(mailOptions)
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

function generateEmailHtml(report: WeeklyReport, startDate: Date, endDate: Date, reportUrl: string): string {
  const { metrics, summary } = report

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          background-color: #6366f1;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
          background-color: #f9fafb;
          border-radius: 0 0 5px 5px;
        }
        .metrics {
          display: flex;
          flex-wrap: wrap;
          margin: 20px 0;
        }
        .metric {
          width: 33%;
          text-align: center;
          margin-bottom: 15px;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #6366f1;
        }
        .metric-label {
          font-size: 14px;
          color: #6b7280;
        }
        .section {
          margin: 25px 0;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #4f46e5;
        }
        .list {
          margin: 0;
          padding-left: 20px;
        }
        .list li {
          margin-bottom: 5px;
        }
        .button {
          display: inline-block;
          background-color: #6366f1;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin-top: 20px;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Mix & Mingle Beta Report</h1>
        <p>${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
      </div>
      <div class="content">
        <p>Here's your weekly summary of beta testing activity:</p>
        
        <div class="metrics">
          <div class="metric">
            <div class="metric-value">${metrics.activeTesters}</div>
            <div class="metric-label">Active Testers</div>
          </div>
          <div class="metric">
            <div class="metric-value">${metrics.newTesters}</div>
            <div class="metric-label">New Testers</div>
          </div>
          <div class="metric">
            <div class="metric-value">${metrics.newFeedback}</div>
            <div class="metric-label">New Feedback</div>
          </div>
          <div class="metric">
            <div class="metric-value">${metrics.bugReports}</div>
            <div class="metric-label">Bug Reports</div>
          </div>
          <div class="metric">
            <div class="metric-value">${metrics.suggestions}</div>
            <div class="metric-label">Suggestions</div>
          </div>
          <div class="metric">
            <div class="metric-value">${metrics.completionRate.toFixed(1)}%</div>
            <div class="metric-label">Completion Rate</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Highlights</div>
          <ul class="list">
            ${summary.highlights.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
        
        <div class="section">
          <div class="section-title">Areas of Concern</div>
          <ul class="list">
            ${summary.concerns.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
        
        <div class="section">
          <div class="section-title">Recommendations</div>
          <ul class="list">
            ${summary.recommendations.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
        
        <div style="text-align: center;">
          <a href="${reportUrl}" class="button">View Full Report</a>
        </div>
        
        <div class="footer">
          <p>This is an automated message from Mix & Mingle Beta Program.</p>
          <p>If you no longer wish to receive these reports, please update your notification settings.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
