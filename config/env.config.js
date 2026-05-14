import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV ?? "development"}.local` });

export const {
  //PORT
  PORT,
  MONGODB_URI,
  NODE_ENV,
  // MAILTRAP

  MAILTRAP_SMTP_HOST,
  MAILTRAP_SMTP_PORT,
  MAILTRAP_SMTP_USER,
  MAILTRAP_SMTP_PASS,

  JWT_EXPIRES_IN,
  JWT_SECRET,
  REFRESH_TOKEN_EXPIRES,
  REFRESH_TOKEN_SECRET,
} = process.env;
