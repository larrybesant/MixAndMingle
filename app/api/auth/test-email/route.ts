import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html } = await request.json();
    
    if (!process.env.RESEND_KEY) {
      // Gracefully handle missing key for Vercel build: return 200 with message
      return NextResponse.json(
        { error: 'Resend API key not configured (RESEND_KEY missing in environment). Email not sent, but build will not fail.' },
        { status: 200 }
      );
    }

    // Only initialize Resend if the key is present
    const resend = new Resend(process.env.RESEND_KEY);

    // Test sending email (in production, we would validate the recipient)
    const { data, error } = await resend.emails.send({
      from: 'Mix & Mingle <noreply@djmixandmingle.com>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: data
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
