import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"
import nodemailer from "nodemailer"

initializeFirebaseAdmin()

/**
 * POST /api/debug/email
 * Send a test email via SMTP
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const body = await req.json()
      
      if (!body.email) {
        return errorResponse("Missing required field: email", 400)
      }

      // Configure SMTP transporter
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      // Prepare email
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: body.email,
        subject: body.subject || "Test Email from Shechetai Control Tower",
        text: body.message || "This is a test email to verify SMTP configuration.",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Test Email from Shechetai Control Tower</h2>
            <p style="color: #666;">
              ${body.message || "This is a test email to verify SMTP configuration."}
            </p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">
              Sent at: ${new Date().toLocaleString()}<br>
              From: Shechetai Control Tower Debug Tools
            </p>
          </div>
        `,
      }

      // Send email
      const info = await transporter.sendMail(mailOptions)

      console.log("Test email sent:", info.messageId)

      const emailLog = {
        recipient: body.email,
        subject: mailOptions.subject,
        messageId: info.messageId,
        sentAt: new Date().toISOString(),
        status: "sent"
      }

      return successResponse(emailLog, "Test email sent successfully via SMTP")
    } catch (error: any) {
      console.error("Email sending failed:", error)
      return errorResponse(
        error.message || "Failed to send email. Check SMTP configuration.",
        500
      )
    }
  })
}
