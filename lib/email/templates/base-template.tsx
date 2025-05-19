import type React from "react"
import { Html } from "@react-email/html"
import { Head } from "@react-email/head"
import { Preview } from "@react-email/preview"
import { Body } from "@react-email/body"
import { Container } from "@react-email/container"
import { Section } from "@react-email/section"
import { Text } from "@react-email/text"
import { Link } from "@react-email/link"
import { Hr } from "@react-email/hr"
import { Img } from "@react-email/img"

interface BaseEmailTemplateProps {
  previewText: string
  heading: string
  children: React.ReactNode
  footerText?: string
  appUrl?: string
}

export const BaseEmailTemplate: React.FC<BaseEmailTemplateProps> = ({
  previewText,
  heading,
  children,
  footerText = "© 2023 Social Event Planning. All rights reserved.",
  appUrl = "https://social-event-planning.vercel.app",
}) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Img src={`${appUrl}/logo.png`} width="120" height="40" alt="Social Event Planning" style={logoStyle} />
          </Section>
          <Section style={contentStyle}>
            <Text style={headingStyle}>{heading}</Text>
            {children}
          </Section>
          <Hr style={hrStyle} />
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>{footerText}</Text>
            <Text style={footerTextStyle}>
              <Link href={`${appUrl}/notifications/preferences`} style={linkStyle}>
                Manage notification preferences
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const bodyStyle = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: 0,
}

const containerStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  margin: "40px auto",
  maxWidth: "600px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
}

const headerStyle = {
  backgroundColor: "#f8fafc",
  padding: "20px",
  textAlign: "center" as const,
  borderBottom: "1px solid #e2e8f0",
}

const logoStyle = {
  display: "inline-block",
}

const contentStyle = {
  padding: "30px 40px",
}

const headingStyle = {
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px",
  color: "#1a202c",
}

const hrStyle = {
  borderColor: "#e2e8f0",
  margin: "0",
}

const footerStyle = {
  padding: "20px 40px",
  textAlign: "center" as const,
}

const footerTextStyle = {
  color: "#718096",
  fontSize: "14px",
  margin: "8px 0",
}

const linkStyle = {
  color: "#3182ce",
  textDecoration: "underline",
}
