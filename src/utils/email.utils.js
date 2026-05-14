// import { body } from "express-validator";
import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import {
  MAILTRAP_SMTP_HOST,
  MAILTRAP_SMTP_PASS,
  MAILTRAP_SMTP_PORT,
  MAILTRAP_SMTP_USER,
} from "../../config/env.config.js";
import logger from "./logger.utils.js";

export const sendMail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Task Manager",
      link: "https://mailgen.js/",
    },
  });
  // Generate an HTML email with the provided contents
  const emailBody = mailGenerator.generate(options.mailGenContent);

  // Generate the plaintext version of the e-mail (for clients that do not support HTML)
  const emailText = mailGenerator.generatePlaintext(options.mailGenContent);

  const transporter = nodemailer.createTransport({
    host: MAILTRAP_SMTP_HOST,
    port: MAILTRAP_SMTP_PORT,
    secure: false, // Use true for port 465, false for port 587
    auth: {
      user: MAILTRAP_SMTP_USER,
      pass: MAILTRAP_SMTP_PASS,
    },
  });

  const mail = {
    from: "mail.test@gmail.com",
    to: options.email,
    subject: options.subject,
    text: emailText, // Plain-text version of the message
    html: emailBody, // HTML version of the message
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    logger.error({ error }, "ERROR NODE MIALER MAIL SENDING");
  }
};

// utils/mail.js

export const emailVerificationMailContent = (userName, otp) => {
  return {
    body: {
      name: userName,
      intro: "Welcome! Please verify your account to get started.",

      // Copyable OTP box
      dictionary: {
        "Verification OTP": otp,
      },

      outro:
        "Enter the OTP above to verify your account. It expires in 10 minutes. If you didn't request this, please ignore this email.",
    },
  };
};

export const forgotPasswordMailContent = (userName, passwordResetUrl) => {
  return {
    body: {
      name: userName,
      intro: "RESET YOUR PASSWORD",

      // Replace button with copyable text box
      dictionary: {
        "Password Reset Link": passwordResetUrl,
      },

      outro:
        "Copy and paste the link above into your browser to reset your password. Need help? Just reply to this email.",
    },
  };
};
