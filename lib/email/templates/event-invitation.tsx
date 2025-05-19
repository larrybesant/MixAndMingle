import type React from "react"
import { BaseEmailTemplate } from "./base-template"
import { Text } from "@react-email/text"
import { Button } from "@react-email/button"
import { Section } from "@react-email/section"

interface EventInvitationEmailProps {
  recipientName: string
  inviterName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  eventDescription?: string
  eventId: string
  appUrl?: string
}

export const EventInvitationEmail: React.FC<EventInvitationEmailProps> = ({
  recipientName,
  inviterName,
  eventTitle,
  eventDate,
  eventLocation,
  eventDescription,
  eventId,
  appUrl = "https://social-event-planning.vercel.app",
}) => {
  const eventUrl = `${appUrl}/events/${eventId}`

  return (
    <BaseEmailTemplate
      previewText={`${inviterName} invited you to ${eventTitle}`}
      heading="You're invited to an event!"
      appUrl={appUrl}
    >
      <Text style={textStyle}>Hello {recipientName},</Text>
      <Text style={textStyle}>
        {inviterName} has invited you to <strong>{eventTitle}</strong>.
      </Text>

      <Section style={detailsStyle}>
        <Text style={detailTextStyle}>
          <strong>Date:</strong> {eventDate}
        </Text>
        <Text style={detailTextStyle}>
          <strong>Location:</strong> {eventLocation}
        </Text>
        {eventDescription && (
          <Text style={detailTextStyle}>
            <strong>Description:</strong> {eventDescription}
          </Text>
        )}
      </Section>

      <Section style={buttonContainerStyle}>
        <Button href={eventUrl} style={buttonStyle}>
          View Event Details
        </Button>
      </Section>

      <Text style={textStyle}>We hope to see you there!</Text>
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
