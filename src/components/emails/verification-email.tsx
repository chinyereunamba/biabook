import {
  Body,
  Container,
  Head,
  Heading,
  Html,
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
          <Section style={logoContainer}>
            <Heading style={h1}>BiaBook</Heading>
          </Section>

          <Heading style={h2}>Confirm your email address</Heading>

          <Text style={text}>Hi there,</Text>

          <Text style={text}>
            Welcome to BiaBook! To complete your registration and start booking
            appointments, please confirm your email address by clicking the
            button below.
          </Text>

          <Section style={buttonContainer}>
            <Link style={button} href={verificationUrl}>
              Confirm Email Address
            </Link>
          </Section>

          <Text style={text}>Or copy and paste this link in your browser:</Text>

          <Text style={linkText}>{verificationUrl}</Text>

          <Text style={text}>
            This link will expire in 24 hours for security reasons.
          </Text>

          <Text style={text}>
            If you didn't create an account with BiaBook, you can safely ignore
            this email.
          </Text>

          <Text style={footer}>
            Best regards,
            <br />
            The BiaBook Team
          </Text>

          <Text style={footerText}>
            This email was sent to {email}. If you didn't request this
            verification, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationEmail;

// Styles
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const logoContainer = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "32px",
  fontWeight: "700",
  margin: "0",
  padding: "0",
  textAlign: "center" as const,
};

const h2 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "16px 0",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "16px 0",
};

const linkText = {
  color: "#3b82f6",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "16px 0",
  wordBreak: "break-all" as const,
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footer = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "32px 0 16px",
};

const footerText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "16px 0",
};
