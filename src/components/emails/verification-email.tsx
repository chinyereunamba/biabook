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

interface VerificationEmailProps {
  verificationUrl?: string;
  email?: string;
}

export const VerificationEmail = ({
  verificationUrl,
  email,
}: VerificationEmailProps) => {
  const previewText = "Confirm your email address for BiaBook";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            {/* If you have a logo, you can use it here */}
            {/* <Img src="https://yourdomain.com/logo.png" alt="BiaBook Logo" width="120" /> */}
            <Heading style={brand}>BiaBook</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={title}>Confirm your email address</Heading>
            <Text style={paragraph}>Hi there,</Text>
            <Text style={paragraph}>
              Welcome to <strong>BiaBook</strong>! To complete your registration
              and start booking appointments, please confirm your email address
              by clicking the button below.
            </Text>

            <Section style={buttonContainer}>
              <Link style={button} href={verificationUrl}>
                Confirm Email Address
              </Link>
            </Section>

            <Text style={paragraph}>
              Or copy and paste this link in your browser:
            </Text>
            <Text style={linkText}>{verificationUrl}</Text>

            <Text style={paragraph}>
              This link will expire in 24 hours for security reasons.
            </Text>

            <Text style={paragraph}>
              If you didn’t create an account with BiaBook, you can safely
              ignore this email.
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
              <span style={{ color: "#111827" }}>{email}</span>. If you didn't request this verification, you can
              safely ignore this email.
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

export default VerificationEmail;

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
  color: "#7c3aed", // your brand purple
  margin: 0,
};

const content = {
  padding: "32px 0",
};

const title = {
  fontSize: "22px",
  fontWeight: 600,
  color: "#111827",
  margin: "0 0 16px 0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#374151",
  margin: "16px 0",
};

const linkText = {
  fontSize: "14px",
  color: "#7c3aed",
  wordBreak: "break-all" as const,
  marginBottom: "24px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#7c3aed",
  color: "#ffffff",
  textDecoration: "none",
  padding: "12px 32px",
  borderRadius: "6px",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: 600,
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
