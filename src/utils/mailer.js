import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (email, name) => {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Welcome to Our Platform!",
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Thank you for creating an account with us. We're excited to have you on board!</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The Team</p>
      `,
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
};
