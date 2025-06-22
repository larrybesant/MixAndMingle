import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }

    console.log('🔧 Generating direct password reset link...');

    // Create Supabase admin client
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!serviceRoleKey) {
      return NextResponse.json({ 
        error: 'Email service not configured. Please contact administrator.' 
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Check if user exists
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      return NextResponse.json({ 
        error: 'Unable to process request' 
      }, { status: 500 });
    }

    const userExists = users.users.find(user => user.email === email);
    
    if (!userExists) {
      // Don't reveal if user exists for security
      return NextResponse.json({ 
        message: 'If an account with that email exists, check the response below for reset instructions.',
        reset_link: 'No account found with this email address.'
      });
    }

    // Generate the magic link directly
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
      }
    });

    if (linkError) {
      console.error('Link generation error:', linkError);
      return NextResponse.json({ 
        error: 'Unable to generate reset link',
        suggestion: 'Email service needs to be configured in Supabase dashboard'
      }, { status: 500 });
    }

    // Return the magic link directly since email isn't configured
    return NextResponse.json({ 
      message: 'Email service not configured, but here is your direct reset link:',
      reset_link: linkData.properties?.action_link,
      instructions: [
        '1. Copy the reset_link above',
        '2. Paste it in your browser',
        '3. You will be redirected to reset your password',
        '4. To fix email sending: Configure email service in Supabase dashboard'
      ],
      dashboard_url: 'https://supabase.com/dashboard/project/ywfjmsbyksehjgwalqum/auth/settings'
    });

  } catch (error) {
    console.error('Direct reset link error:', error);
    return NextResponse.json({ 
      error: 'Unable to generate reset link',
      message: 'Please configure email service in Supabase dashboard first'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Direct Password Reset Link Generator',
    usage: 'POST with { "email": "your-email@example.com" } to get a direct reset link',
    note: 'This bypasses email sending since email service is not configured'
  });
}
