import { NextResponse } from 'next/server';

// This endpoint handles Supabase auth webhooks
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('📧 Auth webhook received:', {
      type: body.type,
      record: body.record?.id || 'no-record',
      timestamp: new Date().toISOString()
    });

    // Handle different webhook types
    switch (body.type) {
      case 'INSERT':
        console.log('✅ User created:', body.record?.id);
        break;
      case 'UPDATE':
        console.log('🔄 User updated:', body.record?.id);
        break;
      case 'DELETE':
        console.log('🗑️ User deleted:', body.record?.id);
        break;
      default:
        console.log('ℹ️ Unknown webhook type:', body.type);
    }

    // Always return 200 to prevent 405 errors
    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    // Still return 200 to prevent retry loops
    return NextResponse.json({ 
      success: false,
      error: 'Webhook processing failed',
      message: 'Error logged'
    });
  }
}

// Handle GET requests to prevent 405 errors
export async function GET() {
  return NextResponse.json({ 
    message: 'Auth webhook endpoint',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}

// Handle other methods to prevent 405 errors
export async function PUT() {
  return NextResponse.json({ message: 'Method handled' });
}

export async function PATCH() {
  return NextResponse.json({ message: 'Method handled' });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Method handled' });
}
