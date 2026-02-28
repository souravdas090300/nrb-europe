import { Resend } from 'resend'

let _resend: Resend | null = null

function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

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
    await getResend().emails.send({
      from: 'NRB Europe <newsletter@nrbeurope.com>',
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Email sending failed:', error)
  }
}

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
