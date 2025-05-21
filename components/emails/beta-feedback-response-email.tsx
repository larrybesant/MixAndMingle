import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"

interface BetaFeedbackResponseEmailProps {
  username: string
  feedbackTitle: string
  responseMessage: string
  loginUrl: string
}

export const BetaFeedbackResponseEmail = ({
  username = "Beta Tester",
  feedbackTitle = "Video Room Audio Quality",
  responseMessage = "Thank you for your feedback about the audio quality in video rooms. We've identified the issue and are working on a fix that will be released in the next update.",
  loginUrl = "https://mix-and-mingle.vercel.app/login",
}: BetaFeedbackResponseEmailProps) => {
  const previewText = `Response to your Mix & Mingle feedback: ${feedbackTitle}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>We've Reviewed Your Feedback</Heading>

          <Section style={section}>
            <Text style={text}>Hi {username},</Text>
            <Text style={text}>
              Thank you for taking the time to provide feedback on Mix & Mingle. Your insights are incredibly valuable
              to us.
            </Text>

            <Section style={feedbackSection}>
              <Text style={feedbackTitle}>Re: {feedbackTitle}</Text>
              <Text style={text}>{responseMessage}</Text>
            </Section>

            <Text style={text}>
              We truly appreciate your participation in our beta program. Your feedback helps us create a better
              experience for everyone.
            </Text>

            <Button style={button} href={loginUrl}>
              Return to Mix & Mingle
            </Button>

            <Text style={text}>
              If you have any additional thoughts or questions, please don't hesitate to use the in-app feedback form or
              reply to this email.
            </Text>

            <Text style={signature}>The Mix & Mingle Team</Text>
          </Section>

          <Text style={footer}>
            © 2025 Mix & Mingle. All rights reserved.
            <br />
            123 Social Street, Network City, CA 94103
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0",
  borderRadius: "8px",
  maxWidth: "600px",
}

const heading = {
  fontSize: "32px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
  padding: "17px 0 0",
  textAlign: "center" as const,
}

const section = {
  padding: "0 48px",
}

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#484848",
}

const feedbackSection = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "16px",
  marginTop: "16px",
  marginBottom: "16px",
}

const feedbackTitle = {
  fontSize: "18px",
  lineHeight: "24px",
  fontWeight: "bold",
  color: "#5e5ce6",
  marginBottom: "8px",
}

const button = {
  backgroundColor: "#5e5ce6",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
  marginTop: "26px",
  marginBottom: "26px",
}

const signature = {
  fontSize: "16px",
  lineHeight: "26px",
  fontWeight: "bold",
  color: "#484848",
  marginTop: "32px",
}

const footer = {
  fontSize: "12px",
  lineHeight: "16px",
  color: "#9ca299",
  textAlign: "center" as const,
  marginTop: "48px",
}

export default BetaFeedbackResponseEmail
