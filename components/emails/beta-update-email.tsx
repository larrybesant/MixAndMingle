import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr } from "@react-email/components"

interface BetaUpdateEmailProps {
  username: string
  loginUrl: string
  updates: {
    title: string
    description: string
  }[]
  tasks?: {
    title: string
    description: string
  }[]
}

export const BetaUpdateEmail = ({
  username = "Beta Tester",
  loginUrl = "https://mix-and-mingle.vercel.app/login",
  updates = [
    {
      title: "New Video Room Features",
      description: "We've added DJ mode and improved audio quality in video rooms.",
    },
  ],
  tasks = [],
}: BetaUpdateEmailProps) => {
  const previewText = `Mix & Mingle Beta Update: New Features Available!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Mix & Mingle Beta Update</Heading>

          <Section style={section}>
            <Text style={text}>Hi {username},</Text>
            <Text style={text}>
              We've just released some exciting new features and improvements to Mix & Mingle! We'd love for you to try
              them out and share your feedback.
            </Text>

            <Heading as="h2" style={subheading}>
              What's New
            </Heading>

            {updates.map((update, index) => (
              <div key={index}>
                <Text style={updateTitle}>{update.title}</Text>
                <Text style={text}>{update.description}</Text>
              </div>
            ))}

            {tasks.length > 0 && (
              <>
                <Hr style={divider} />

                <Heading as="h2" style={subheading}>
                  Your Beta Tasks
                </Heading>
                <Text style={text}>
                  We've added some new tasks for you to complete. These will help us gather valuable feedback:
                </Text>

                {tasks.map((task, index) => (
                  <div key={index} style={taskItem}>
                    <Text style={taskTitle}>{task.title}</Text>
                    <Text style={taskDescription}>{task.description}</Text>
                  </div>
                ))}
              </>
            )}

            <Button style={button} href={loginUrl}>
              Log In & Try New Features
            </Button>

            <Text style={text}>
              Your feedback is incredibly valuable to us. After trying these new features, please use the in-app
              feedback form to let us know what you think.
            </Text>

            <Text style={text}>Thank you for being an important part of our beta program!</Text>

            <Text style={signature}>The Mix & Mingle Team</Text>
          </Section>

          <Text style={footer}>
            © 2025 Mix & Mingle. All rights reserved.
            <br />
            123 Social Street, Network City, CA 94103
            <br />
            <br />
            <a href="#" style={unsubscribeLink}>
              Manage email preferences
            </a>
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

const subheading = {
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
  padding: "10px 0",
}

const section = {
  padding: "0 48px",
}

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#484848",
}

const updateTitle = {
  fontSize: "18px",
  lineHeight: "24px",
  fontWeight: "bold",
  color: "#5e5ce6",
  marginBottom: "4px",
}

const taskItem = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "12px",
  marginBottom: "12px",
}

const taskTitle = {
  fontSize: "16px",
  lineHeight: "24px",
  fontWeight: "bold",
  color: "#484848",
  marginBottom: "4px",
}

const taskDescription = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#666666",
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

const divider = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
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

const unsubscribeLink = {
  color: "#9ca299",
  textDecoration: "underline",
}

export default BetaUpdateEmail
