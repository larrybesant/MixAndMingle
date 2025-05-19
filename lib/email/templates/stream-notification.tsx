import type React from "react"
import { BaseEmailTemplate } from "./base-template"
import { Text } from "@react-email/text"
import { Button } from "@react-email/button"
import { Section } from "@react-email/section"

interface StreamNotificationEmailProps {
  recipientName: string
  djName: string
  streamTitle: string
  streamTime: string
  streamDescription?: string
  streamId: string
  appUrl?: string
}

export const StreamNotificationEmail: React.FC<StreamNotificationEmailProps> = ({
  recipientName,
  djName,
  streamTitle,
  streamTime,
  streamDescription,
  streamId,
  appUrl = "https://social-event-planning.vercel.app",
}) => {
  const streamUrl = `${appUrl}/streams/${streamId}`

  return (
    <BaseEmailTemplate
      previewText={`${djName} is going live: ${streamTitle}`}
      heading="Live Stream Starting Soon!"
      appUrl={appUrl}
    >
      <Text style={textStyle}>Hello {recipientName},</Text>
      <Text style={textStyle}>
        DJ <strong>{djName}</strong> is going live with <strong>{streamTitle}</strong>.
      </Text>

      <Section style={detailsStyle}>
        <Text style={detailTextStyle}>
          <strong>Starting:</strong> {streamTime}
        </Text>
        {streamDescription && (
          <Text style={detailTextStyle}>
            <strong>Description:</strong> {streamDescription}
          </Text>
        )}
      </Section>

      <Section style={buttonContainerStyle}>
        <Button href={streamUrl} style={buttonStyle}>
          Join the Stream
        </Button>
      </Section>

      <Text style={textStyle}>Don't miss out on this live music experience!</Text>
    </BaseEmailTemplate>
  )
}

const textStyle = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4a5568",
  margin: "16px 0",
}

const detailsStyle = {
  backgroundColor: "#f7fafc",
  borderRadius: "6px",
  padding: "16px",
  margin: "24px 0",
}

const detailTextStyle = {
  fontSize: "15px",
  lineHeight: "22px",
  color: "#4a5568",
  margin: "8px 0",
}

const buttonContainerStyle = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const buttonStyle = {
  backgroundColor: "#4f46e5",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
}
