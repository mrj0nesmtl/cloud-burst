import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import QRCode from 'qrcode';

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  
  if (!eventId) {
    return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
  }
  
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    // Get the event to verify it exists
    const { data: event, error } = await supabase
      .from('events')
      .select('name')
      .eq('id', eventId)
      .single();
    
    if (error || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Generate the QR code URL (using a placeholder service)
    const eventUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://app.cloudburst.io'}/event/${eventId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(eventUrl)}&size=300x300`;
    
    return NextResponse.json({ qrCodeUrl });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
} 