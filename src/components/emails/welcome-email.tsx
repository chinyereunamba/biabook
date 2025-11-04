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
  const previewText = `Welcome to BiaBook, ${name}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Heading style={h1}>BiaBook</Heading>
          </Section>

          <Heading style={h2}>Welcome to BiaBook! 🎉</Heading>

          <Text style={text}>Hi {name || "there"},</Text>

          <Text style={text}>
            Welcome to BiaBook! We're excited to have you join our community of
            service providers and customers.
          </Text>

          <Text style={text}>With BiaBook, you can:</Text>

          <ul style={list}>
            <li style={listItem}>Book appointments in just 60 seconds</li>
            <li style={listItem}>Get instant WhatsApp notifications</li>
            <li style={listItem}>Manage your bookings easily</li>
            <li style={listItem}>Connect with local service providers</li>
          </ul>

          <Section style={buttonContainer}>
            <Link
              style={button}
              href={`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`}
            >
              Get Started
            </Link>
          </Section>

          <Text style={text}>
            If you have any questions, feel free to reach out to us. We're here
            to help!
          </Text>

          <Text style={footer}>
            Best regards,
            <br />
            The BiaBook Team
          </Text>

          <Text style={footerText}>
            This email was sent to {email}. If you didn't sign up for BiaBook,
            you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

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

const list = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "16px 0",
  paddingLeft: "20px",
};

const listItem = {
  margin: "8px 0",
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
