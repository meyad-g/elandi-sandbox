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
    .badge { display: inline-block; background: #111827; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">New Tutoring Application</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Package: <span class="badge" style="background: white; color: #111827; margin-left: 10px;">${data.packageTitle}</span></p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2 style="margin-top: 0; color: #111827; font-size: 18px;">📚 Student Information</h2>
        <div style="margin-bottom: 15px;">
          <div class="label">Name</div>
          <div class="value">${data.studentName}</div>
        </div>
        <div style="margin-bottom: 15px;">
          <div class="label">Age/Year</div>
          <div class="value">${data.studentAge}</div>
        </div>
        <div>
          <div class="label">Current Level/School</div>
          <div class="value">${data.currentLevel}</div>
        </div>
      </div>

      <div class="section">
        <h2 style="margin-top: 0; color: #111827; font-size: 18px;">👤 Parent Contact</h2>
        <div style="margin-bottom: 15px;">
          <div class="label">Name</div>
          <div class="value">${data.parentName}</div>
        </div>
        <div style="margin-bottom: 15px;">
          <div class="label">Email</div>
          <div class="value"><a href="mailto:${data.parentEmail}">${data.parentEmail}</a></div>
        </div>
        <div>
          <div class="label">Phone</div>
          <div class="value"><a href="tel:${data.parentPhone}">${data.parentPhone}</a></div>
        </div>
      </div>

      <div class="section">
        <h2 style="margin-top: 0; color: #111827; font-size: 18px;">🎯 Academic Requirements</h2>
        <div style="margin-bottom: 15px;">
          <div class="label">Subjects Needed</div>
          <div class="value">${data.subjects}</div>
        </div>
        <div>
          <div class="label">Goals & Focus Areas</div>
          <div class="value" style="white-space: pre-wrap;">${data.goals}</div>
        </div>
      </div>

      <div class="section">
        <h2 style="margin-top: 0; color: #111827; font-size: 18px;">📅 Availability</h2>
        <div class="value">${data.availability}</div>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
        <p style="margin: 0;">Application received: ${new Date().toLocaleString('en-GB', { 
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
      from: 'Applications - XBridge <applications@notifications.xbridgetutors.com>',
      to: process.env.CONTACT_EMAIL || 'hello@xbridgetutors.com',
      subject: `New ${data.packageTitle} Application - ${data.studentName}`,
      html: emailHtml,
      replyTo: data.parentEmail
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to send application email' },
        { status: 500 }
      )
    }

    console.log('Email sent successfully:', emailData)

    return NextResponse.json({ 
      success: true, 
      message: 'Application submitted successfully',
      emailId: emailData?.id 
    })
  } catch (error) {
    console.error('Error processing application:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
