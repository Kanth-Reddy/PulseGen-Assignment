const nodemailer = require("nodemailer");
require("dotenv").config();

// Email configuration - supports multiple providers
// Set EMAIL_SERVICE in .env: "gmail", "hotmail", "outlook", or "custom"
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailService = process.env.EMAIL_SERVICE || "gmail";

// Debug logging
console.log("📧 Email Config Check:");
console.log("   EMAIL_USER:", emailUser ? "✅ Set" : "❌ Not set");
console.log("   EMAIL_PASS:", emailPass ? "✅ Set" : "❌ Not set");
console.log("   EMAIL_SERVICE:", emailService);

let transporter = null;

if (emailUser && emailPass) {
  // Configure transporter based on service type
  if (emailService === "hotmail" || emailService === "outlook") {
    // Outlook/Hotmail - uses regular password (no App Password needed!)
    transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    console.log("✅ Email transporter configured (Outlook/Hotmail)");
  } else if (emailService === "custom") {
    // Custom SMTP (for other providers)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    console.log("✅ Email transporter configured (Custom SMTP)");
  } else {
    // Gmail - requires App Password
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    console.log("✅ Email transporter configured (Gmail)");
  }
} else {
  console.warn("⚠️  Email credentials not configured. Email functionality will be disabled.");
  console.warn("   Please set EMAIL_USER and EMAIL_PASS in your .env file");
  console.warn("   See EMAIL_SETUP.md for detailed instructions");
}

const sendMail = async (to, subject, text, html = null) => {
  if (!transporter) {
    console.error("❌ Cannot send email: Email transporter not configured");
    console.log(`   Would send to: ${to}`);
    console.log(`   Subject: ${subject}`);
    // Don't throw error, just log it so the app continues to work
    return null;
  }

  try {
    const mailOptions = {
      from: emailUser,
      to,
      subject,
      text,
      html: html || text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    // Don't throw error, just log it
    return null;
  }
};

module.exports = sendMail;

