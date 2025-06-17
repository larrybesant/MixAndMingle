import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_KEY!);
const SUPABASE_SECRET = process.env.SUPABASE_WEBHOOK_SECRET!;

function verifySignature(req: Request, body: string): boolean {
  const signature = req.headers.get('supabase-signature');
  const expected = crypto
    .createHmac('sha256', SUPABASE_SECRET)
    .update(body)
    .digest('hex');

  return signature === expected;
}

export async function POST(req: Request) {
  const bodyText = await req.text();
  const valid = verifySignature(req, bodyText);

  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const { email, dj_name } = JSON.parse(bodyText);

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
