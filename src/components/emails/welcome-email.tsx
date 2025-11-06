import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  name?: string;
  email?: string;
}

export const WelcomeEmail = ({ name, email }: WelcomeEmailProps) => {
  const previewText = `Welcome to BiaBook, ${name || "there"}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            {/* Optional: Add your logo image here */}
            {/* <Img src="https://biabook.app/logo.png" width="120" alt="BiaBook Logo" /> */}
            <Heading style={brand}>BiaBook</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={title}>Welcome to BiaBook 🎉</Heading>

            <Text style={paragraph}>Hi {name || "there"},</Text>

            <Text style={paragraph}>
              We're thrilled to have you join our growing community of service
              providers and customers!
            </Text>

            <Text style={paragraph}>Here’s what you can do with BiaBook:</Text>

            <ul style={list}>
              <li style={listItem}>✨ Book appointments in seconds</li>
              <li style={listItem}>💬 Get instant WhatsApp notifications</li>
              <li style={listItem}>📅 Manage all your bookings easily</li>
              <li style={listItem}>🤝 Connect with trusted local providers</li>
            </ul>

            <Section style={buttonContainer}>
              <Link
                style={button}
                href={`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`}
              >
                Get Started
              </Link>
            </Section>

            <Text style={paragraph}>
              If you ever have questions or need help, our support team is just
              a click away.
            </Text>

            <Text style={signature}>
              Warm regards,
              <br />
              <strong>The BiaBook Team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent to{" "}
              <span style={{ color: "#111827" }}>{email}</span>.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} BiaBook. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

// ============================
// Styles
// ============================

const main = {
  backgroundColor: "#f9fafb",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
  color: "#111827",
  margin: 0,
  padding: "24px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "32px 24px",
  maxWidth: "600px",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
};

const header = {
  textAlign: "center" as const,
  paddingBottom: "24px",
  borderBottom: "1px solid #e5e7eb",
};

const brand = {
  fontSize: "28px",
  fontWeight: 700,
  color: "#7c3aed", // brand purple
  margin: 0,
};

const content = {
  padding: "32px 0",
};

const title = {
  fontSize: "24px",
  fontWeight: 600,
  color: "#111827",
  margin: "0 0 16px 0",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#374151",
  margin: "16px 0",
};

const list = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "16px 0",
  paddingLeft: "24px",
};

const listItem = {
  margin: "8px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#7c3aed",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const signature = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#111827",
  marginTop: "32px",
};

const footer = {
  borderTop: "1px solid #e5e7eb",
  marginTop: "32px",
  paddingTop: "16px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "8px 0",
};
