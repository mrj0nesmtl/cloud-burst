import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

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
      .select('name, qr_code_url')
      .eq('id', eventId)
      .single();
    
    if (error || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // If the event already has a stored QR code URL, return it
    if (event.qr_code_url) {
      console.log('Using existing QR code URL:', event.qr_code_url);
      return NextResponse.json({ qrCodeUrl: event.qr_code_url });
    }
    
    // Generate the QR code URL (using a placeholder service)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.cloudburst.io';
    const eventUrl = `${baseUrl}/event/${eventId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(eventUrl)}&size=300x300&format=png&ecc=H`;
    
    // Update the event record with the QR code URL
    const { error: updateError } = await supabase
      .from('events')
      .update({ qr_code_url: qrCodeUrl })
      .eq('id', eventId);
    
    if (updateError) {
      console.error('Error updating event with QR code URL:', updateError);
      // Continue anyway to return the QR code URL
    } else {
      console.log('Successfully updated event with QR code URL:', qrCodeUrl);
    }
    
    return NextResponse.json({ qrCodeUrl });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
} 