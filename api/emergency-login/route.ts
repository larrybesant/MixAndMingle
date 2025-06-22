import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the emergency login HTML file
    const filePath = path.join(process.cwd(), 'emergency-login.html');
    const html = fs.readFileSync(filePath, 'utf8');
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Emergency login page not found',
      message: 'Use /api/login-diagnostic directly for testing'
    }, { status: 404 });
  }
}
