import {
  Html,
  Head,
  Font,
  Button,
  Container,
  Section,
  Heading,
  Text,
  type HtmlProps,
} from "@react-email/components";
interface WelcomeEmailProps extends HtmlProps {
  tokenLink: string;
  name: string;
}
const styles = {
  main: {
    padding: "20px",
    backgroundColor: "#f9f9f9",
  },
  box: {
    margin: "0 auto",
    maxWidth: "600px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center" as const,
    padding: "20px 0",
  },
  paragraph: {
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#666666",
    marginBottom: "16px",
  },
  otpStyle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center" as const,
    margin: "20px 0",
  },
};
export default function ResetPassword({
  name,
  tokenLink,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head>
        <title>
          <Font
            fontFamily="Roboto"
            fallbackFontFamily={"Verdana"}
            webFont={{
              url: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap",
              format: "woff2",
            }}
            fontWeight={400}
            fontStyle="normal"
          />
        </title>
      </Head>
      <Container style={styles.main}>
        <Section style={styles.box}>
          <Heading style={styles.heading}>Your Reset Password Link</Heading>
          <Text style={styles.paragraph}>Hello {name},</Text>
          <Text style={styles.paragraph}>
            It is your reset password link , Click on the button below{" "}
          </Text>
          <Text style={styles.paragraph}>
            It is valid for 15 minutes only :{" "}
          </Text>
          <Button
            href={tokenLink}
            style={{ color: "#61dafb", padding: "10px 20px" }}
          >
            Click me
          </Button>
          <Text style={styles.paragraph}>
            Please Click on this link to regenerate your password.
          </Text>
          <Text style={styles.paragraph}>
            If you did not Reset or Forget your Password for this account, please ignore this email.
          </Text>
          <Text style={styles.paragraph}>
            Best regards,
            <br />
            The Ratso Team
          </Text>
        </Section>
      </Container>
    </Html>
  );
}
