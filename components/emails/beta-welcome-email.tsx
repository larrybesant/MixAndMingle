import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"

interface BetaWelcomeEmailProps {
  username: string
  loginUrl: string
  betaCode?: string
  password?: string
}

export const BetaWelcomeEmail = ({
  username = "Beta Tester",
  loginUrl = "https://mix-and-mingle.vercel.app/login",
  betaCode,
  password,
}: BetaWelcomeEmailProps) => {
  const previewText = `Welcome to the Mix & Mingle Beta Program!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome to Mix & Mingle Beta!</Heading>

          <Section style={section}>
            <Text style={text}>Hi {username},</Text>
            <Text style={text}>
              You've been selected to join our exclusive beta testing program for Mix & Mingle! We're thrilled to have
              you on board to help shape the future of social networking.
            </Text>

            <Text style={text}>
              <strong>Your Beta Access Details:</strong>
            </Text>

            {password ? (
              <Text style={codeBlock}>
                Email: Your registered email
                <br />
                Password: {password}
              </Text>
            ) : betaCode ? (
              <Text style={codeBlock}>
                Beta Invitation Code: <strong>{betaCode}</strong>
              </Text>
            ) : null}

            <Text style={text}>As a beta tester, you'll get:</Text>

            <ul>
              <li style={listItem}>Early access to all new features</li>
              <li style={listItem}>Exclusive beta tester badges</li>
              <li style={listItem}>Direct communication with our development team</li>
              <li style={listItem}>Influence over the platform's future direction</li>
              <li style={listItem}>Special rewards for active participation</li>
            </ul>

            <Button style={button} href={loginUrl}>
              {betaCode ? "Register with Beta Code" : "Login to Mix & Mingle"}
            </Button>

            <Text style={text}>
              We've created a special onboarding experience to help you get started. After logging in, you'll be guided
              through the key features and how to provide feedback.
            </Text>

            <Text style={text}>
              If you have any questions, simply reply to this email or use the in-app feedback form.
            </Text>

            <Text style={text}>Thank you for being part of our journey!</Text>

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

const codeBlock = {
  backgroundColor: "#f4f4f4",
  padding: "12px",
  borderRadius: "4px",
  border: "1px solid #e0e0e0",
  fontSize: "16px",
  lineHeight: "24px",
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

const listItem = {
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "8px",
  color: "#484848",
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

export default BetaWelcomeEmail
