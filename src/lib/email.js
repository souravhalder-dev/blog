
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Fallback for development if no credentials provided
if (!process.env.EMAIL_USER) {
    console.warn('No email credentials found. Emails will not be sent.');
}

export async function sendEmail({ to, subject, html }) {
  if (!process.env.EMAIL_USER) {
      console.log(`[Mock Email] To: ${to}, Subject: ${subject}`);
      return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Writer's Chronicle" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
