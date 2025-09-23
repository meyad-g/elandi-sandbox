import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Format the email content with nice HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #111827; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 25px; padding: 20px; background: white; border-radius: 8px; }
    .label { font-weight: bold; color: #6b7280; text-transform: uppercase; font-size: 12px; margin-bottom: 5px; }
    .value { color: #111827; font-size: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">New Contact Message</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">From website contact form</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2 style="margin-top: 0; color: #111827; font-size: 18px;">📧 Contact Details</h2>
        <div style="margin-bottom: 15px;">
          <div class="label">Name</div>
          <div class="value">${data.name}</div>
        </div>
        <div style="margin-bottom: 15px;">
          <div class="label">Email</div>
          <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
        </div>
        ${data.phone ? `
        <div>
          <div class="label">Phone</div>
          <div class="value"><a href="tel:${data.phone}">${data.phone}</a></div>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <h2 style="margin-top: 0; color: #111827; font-size: 18px;">💬 Message</h2>
        <div class="value" style="white-space: pre-wrap;">${data.message}</div>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
        <p style="margin: 0;">Message received: ${new Date().toLocaleString('en-GB', { 
          dateStyle: 'full', 
          timeStyle: 'short' 
        })}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim()

    // Send email using Resend
    const { data: emailData, error } = await resend.emails.send({
      from: 'Contact - XBridge <contact@notifications.xbridgetutors.com>',
      to: process.env.CONTACT_EMAIL || 'hello@xbridgetutors.com',
      subject: `Contact Form Message from ${data.name}`,
      html: emailHtml,
      replyTo: data.email
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to send contact message' },
        { status: 500 }
      )
    }

    console.log('Contact email sent successfully:', emailData)

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      emailId: emailData?.id 
    })
  } catch (error) {
    console.error('Error processing contact message:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    )
  }
}
