/**
 * @file email.ts — Transactional email service powered by Resend
 *
 * Provides helper functions for all outbound emails:
 *  - Verification emails (account creation)
 *  - Welcome emails (post-subscription)
 *  - Password reset emails
 *  - Newsletter distribution
 *
 * All emails use branded HTML templates with inline CSS.
 *
 * Configuration:
 *  - `RESEND_API_KEY`  — Resend API key (required)
 *  - `EMAIL_FROM`      — Sender address (fallback: onboarding@resend.dev)
 *  - `NEXTAUTH_URL`    — Base URL used in email links
 *
 * @note The sending domain (nrbeurope.com) must be verified in the Resend
 *       dashboard before emails can be sent from a custom address.
 *       Until verified, use `onboarding@resend.dev` as the fallback.
 */

import { Resend } from 'resend'

/** Singleton Resend client instance */
let _resend: Resend | null = null

/** Lazily initialise and return the Resend SDK client. */
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

/**
 * Sender address for all outgoing emails.
 * Uses the `EMAIL_FROM` env var if set, otherwise falls back to the
 * Resend sandbox address (only delivers to the account owner's email).
 */
const FROM_EMAIL = process.env.EMAIL_FROM || 'NRB Europe <onboarding@resend.dev>'

/**
 * Low-level email sender — wraps Resend SDK.
 * Throws on failure so callers can handle errors (e.g. show a message to the user).
 *
 * @param to      - Recipient email address
 * @param subject - Email subject line
 * @param html    - Full HTML body of the email
 * @throws {Error} If the Resend API returns an error or the request fails
 */
export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) => {
  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })
    if (result.error) {
      console.error('Email sending failed:', result.error)
      throw new Error(`Email sending failed: ${result.error.message}`)
    }
  } catch (error) {
    console.error('Email sending failed:', error)
    throw error
  }
}

/**
 * Send a welcome email after a user subscribes to a paid plan.
 * Lists subscriber benefits (unlimited access, ad-free, exclusive content).
 *
 * @param email - Subscriber's email address
 * @param name  - Subscriber's display name
 */
export const sendWelcomeEmail = async (email: string, name: string) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>Welcome to NRB Europe</title></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb;">NRB Europe</h1>
          </div>
          <h2>Welcome, ${name}!</h2>
          <p>Thank you for subscribing to NRB Europe. We're excited to have you on board!</p>
          <p>As a subscriber, you now have access to:</p>
          <ul style="margin: 20px 0;">
            <li>Unlimited article access</li>
            <li>Ad-free experience</li>
            <li>Exclusive content and newsletters</li>
            <li>Early access to breaking news</li>
          </ul>
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Start Reading
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `

  await sendEmail({ to: email, subject: 'Welcome to NRB Europe!', html })
}

/**
 * Send an email-verification link after account registration.
 * The token is valid for 24 hours (enforced by the verify API route).
 *
 * @param email - New user's email address
 * @param name  - New user's display name
 * @param token - 32-byte hex verification token
 */
export const sendVerificationEmail = async (email: string, name: string, token: string) => {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>Verify Your Email - NRB Europe</title></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb;">NRB Europe</h1>
          </div>
          <h2>Verify your email address</h2>
          <p>Hi ${name},</p>
          <p>Thank you for creating an account with NRB Europe. Please verify your email address by clicking the button below:</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${verifyUrl}" 
               style="background-color: #2563eb; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #2563eb; font-size: 14px; word-break: break-all;">${verifyUrl}</p>
          <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `

  await sendEmail({ to: email, subject: 'Verify your email - NRB Europe', html })
}

/**
 * Send a password-reset link. The token is valid for 1 hour.
 * Only sent to users who signed up with credentials (not OAuth-only).
 *
 * @param email - User's email address
 * @param name  - User's display name
 * @param token - 32-byte hex reset token
 */
export const sendPasswordResetEmail = async (email: string, name: string, token: string) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>Reset Your Password - NRB Europe</title></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb;">NRB Europe</h1>
          </div>
          <h2>Reset your password</h2>
          <p>Hi ${name || 'there'},</p>
          <p>We received a request to reset your password. Click the button below to choose a new password:</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetUrl}" 
               style="background-color: #2563eb; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #2563eb; font-size: 14px; word-break: break-all;">${resetUrl}</p>
          <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            You're receiving this email because a password reset was requested for your NRB Europe account.
          </p>
        </div>
      </body>
    </html>
  `

  await sendEmail({ to: email, subject: 'Reset your password - NRB Europe', html })
}

/**
 * Send a newsletter email to a subscriber.
 * Wraps the provided HTML content in the NRB Europe branded template
 * and appends an unsubscribe link.
 *
 * @param email   - Subscriber's email address
 * @param subject - Newsletter subject line
 * @param content - Inner HTML content (article summaries, etc.)
 */
export const sendNewsletterEmail = async (
  email: string,
  subject: string,
  content: string
) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>NRB Europe Newsletter</title></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb;">NRB Europe</h1>
            <p style="color: #666;">Your trusted source for news</p>
          </div>
          ${content}
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            You're receiving this because you subscribed to NRB Europe newsletter.
            <br>
            <a href="${process.env.NEXTAUTH_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #2563eb;">
              Unsubscribe
            </a>
          </p>
        </div>
      </body>
    </html>
  `

  await sendEmail({ to: email, subject, html })
}
