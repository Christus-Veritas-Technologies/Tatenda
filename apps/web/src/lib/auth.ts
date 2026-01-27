import prisma from "@tatenda/db";
import { env } from "@tatenda/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import nodemailer from "nodemailer";

// Create nodemailer transporter for sending magic link emails
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.CORS_ORIGIN],

  // Disable email/password auth - we only use magic link and Google
  emailAndPassword: {
    enabled: false,
  },

  // Google OAuth
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      prompt: "select_account",
    },
  },

  // Cookie settings for Next.js
  advanced: {
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
    },
  },

  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }, _ctx) => {
        try {
          await transporter.sendMail({
            from: env.SMTP_FROM,
            to: email,
            subject: "Sign in to Tatenda",
            html: `
              <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #7148FC; font-size: 28px; margin-bottom: 24px;">Welcome to Tatenda</h1>
                <p style="color: #0C121C; font-size: 16px; line-height: 1.6;">
                  Click the button below to sign in to your Tatenda account. This link will expire in 5 minutes.
                </p>
                <a href="${url}" style="display: inline-block; background-color: #7148FC; color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0;">
                  Sign in to Tatenda
                </a>
                <p style="color: #B8BFC6; font-size: 14px; margin-top: 24px;">
                  If you didn't request this email, you can safely ignore it.
                </p>
                <hr style="border: none; border-top: 1px solid #D6DEE7; margin: 24px 0;" />
                <p style="color: #B8BFC6; font-size: 12px;">
                  Tatenda - E-learning platform for Zimbabwe
                </p>
              </div>
            `,
            text: `Sign in to Tatenda\n\nClick the following link to sign in: ${url}\n\nThis link will expire in 5 minutes.\n\nIf you didn't request this email, you can safely ignore it.`,
          });
        } catch (error) {
          console.error("Failed to send magic link email:", error);
          throw new Error("Failed to send magic link email");
        }
      },
      expiresIn: 300, // 5 minutes
      disableSignUp: false, // Allow new users to sign up via magic link
    }),
  ],
});
