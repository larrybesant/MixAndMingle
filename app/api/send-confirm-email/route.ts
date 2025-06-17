import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend('re_PfuwFkAW_4Y6P6d8i9MJsvN2hf4L3x4SK');

export async function POST(req: Request) {
  const { email, dj_name } = await req.json();

  try {
    const data = await resend.emails.send({
      from: 'mixandmingleapp@gmail.com',
      to: email,
      subject: 'Confirm your DJ Mix & Mingle email',
      html: `
        <p>Hey ${dj_name},</p>
        <p>Click below to confirm your email and start spinning:</p>
        <p><a href="https://v0-m-and-m-mvp-5d-82uexu1b5-larrybesants-projects.vercel.app/dashboard">Confirm Email</a></p>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Resend error:', error);
    return NextResponse.json({ success: false, error });
  }
}
