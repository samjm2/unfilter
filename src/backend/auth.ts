import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

/*  ================================================================
    AUTH UTILITIES
    - bcryptjs for password hashing (pure JS, no native deps)
    - JWT for session tokens (httpOnly cookies)
    - Nodemailer for verification emails
    ================================================================ */

/* ---- Env ---- */

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret && IS_PRODUCTION) {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  return secret || "unfilter-dev-secret-DO-NOT-USE-IN-PROD";
}

const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES = "7d";
const BCRYPT_ROUNDS = 12;

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function hasSmtpConfigured(): boolean {
  return !!(SMTP_USER && SMTP_PASS);
}

/* ---- HTML Safety ---- */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ---- Password ---- */

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/* ---- JWT ---- */

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as TokenPayload;
  } catch {
    return null;
  }
}

/* ---- Verification Token ---- */

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/* ---- Email ---- */

function getTransporter() {
  // In development without SMTP creds, log to console
  if (!SMTP_USER || !SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendVerificationEmail(
  email: string,
  username: string,
  token: string,
): Promise<boolean> {
  const verifyUrl = `${APP_URL}/api/auth/verify?token=${token}`;

  const transporter = getTransporter();

  if (!transporter) {
    // Dev mode: log to console
    console.log("\n╔══════════════════════════════════════════════╗");
    console.log("║  📧 VERIFICATION EMAIL (dev mode)            ║");
    console.log("╠══════════════════════════════════════════════╣");
    console.log(`║  To: ${email}`);
    console.log(`║  Username: ${username}`);
    console.log(`║  Verify URL:`);
    console.log(`║  ${verifyUrl}`);
    console.log("╚══════════════════════════════════════════════╝\n");
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"Unfilter" <${SMTP_USER}>`,
      to: email,
      subject: "Verify your Unfilter account",
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: #4a7c59; color: white; font-weight: bold; font-size: 18px; width: 44px; height: 44px; line-height: 44px; border-radius: 12px;">U</div>
          </div>
          <h1 style="font-size: 22px; font-weight: 700; color: #2d2620; margin: 0 0 8px;">Welcome to Unfilter, ${escapeHtml(username)}</h1>
          <p style="font-size: 15px; color: #6b5e50; line-height: 1.6; margin: 0 0 28px;">
            Please verify your email address to get started. This link expires in 24 hours.
          </p>
          <a href="${verifyUrl}" style="display: inline-block; background: #4a7c59; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600;">
            Verify Email
          </a>
          <p style="font-size: 13px; color: #8c7e6f; margin-top: 32px; line-height: 1.5;">
            If you didn't create an Unfilter account, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e8e1d6; margin: 32px 0;" />
          <p style="font-size: 11px; color: #b5a899;">
            Unfilter — Privacy-first skin health for teens.<br/>
            Your data never leaves your device.
          </p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("Failed to send verification email:", err);
    return false;
  }
}
