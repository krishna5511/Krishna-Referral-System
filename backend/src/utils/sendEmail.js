const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 5000, // 5 seconds
  socketTimeout: 5000,
  greetingTimeout: 5000,
});

async function sendEmail({ to, subject, html }) {
  try {
    // Send Email
    const info = await transporter.sendMail({
      from: `"Referral & Ambassador System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email Sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("❌ Email Error:", error);
    throw error;
  }
}

module.exports = sendEmail;