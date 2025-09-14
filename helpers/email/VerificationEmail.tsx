import { Html,Head,Font, Container, Section, Heading, Text, type HtmlProps } from '@react-email/components'
interface WelcomeEmailProps extends HtmlProps {
    name: string;
    otp: string;
}
const styles = {
  main: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
  },
  box: {
    margin: '0 auto',
    maxWidth: '600px',
    padding: '10px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center' as const,
    padding: '20px 0',
  },
  paragraph: {
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#666666',
    marginBottom: '16px',
  },
  otpStyle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center' as const,
    margin: '20px 0',
  },
};
export default function VerificationEmail({ name, otp }: WelcomeEmailProps) {
  return (
   <Html>
     <Head>
                <Font fontFamily='Roboto' fallbackFontFamily={'Verdana'} webFont={{
                    url : 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap',
                    format : 'woff2'
                }} 
                fontWeight={400}
                fontStyle='normal'
                />

            </Head> 
        <Container style={styles.main}>
            <Section style={styles.box}>
                <Heading style={styles.heading}>Welcome to Ratso</Heading>
                <Text style={styles.paragraph}>Hello {name},</Text>
                <Text style={styles.paragraph}>Thank you for signing up! We're excited to have you on board.</Text>
                <Text style={styles.paragraph}>Your verification code is:</Text>
                <Heading style={styles.otpStyle}>{otp}</Heading>
                <Text style={styles.paragraph}>Please enter this code in the app to verify your email address.</Text>
                <Text style={styles.paragraph}>If you did not sign up for this account, please ignore this email.</Text>
                <Text style={styles.paragraph}>Best regards,<br/>The Ratso Team</Text>
            </Section>
        </Container>
   
    </Html>
    
  );
}