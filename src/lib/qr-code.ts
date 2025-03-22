import { QRCodeParams } from '@/types/events'

/**
 * Client-safe QR code utilities
 */

export interface QRCodeParams {
  event_id: string;
  type: 'event' | 'gallery' | 'check-in';
}

/**
 * Generate a QR code URL for an event using the external QR code service
 */
export function generateQRCodeUrl(params: QRCodeParams): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.cloudburst.io';
  let targetUrl = '';
  
  switch (params.type) {
    case 'event':
      targetUrl = `${baseUrl}/event/${params.event_id}`;
      break;
    case 'gallery':
      targetUrl = `${baseUrl}/gallery/${params.event_id}`;
      break;
    case 'check-in':
      targetUrl = `${baseUrl}/check-in/${params.event_id}`;
      break;
    default:
      targetUrl = `${baseUrl}/event/${params.event_id}`;
  }
  
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(targetUrl)}&size=300x300`;
}

/**
 * Fetch a QR code URL from our API endpoint
 */
export async function fetchEventQRCode(eventId: string): Promise<string> {
  try {
    const response = await fetch(`/api/events/qr-code?eventId=${eventId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch QR code');
    }
    
    const data = await response.json();
    return data.qrCodeUrl;
  } catch (error) {
    console.error('Error fetching QR code:', error);
    // Return a fallback URL
    return '/placeholder-qr.png';
  }
}

/**
 * Generate a data URL for a QR code
 * This function fetches the QR code image and converts it to a data URL
 */
export async function generateQRCodeDataUrl(params: QRCodeParams): Promise<string> {
  const qrCodeUrl = generateQRCodeUrl(params)
  
  try {
    // Fetch the QR code image
    const response = await fetch(qrCodeUrl)
    const blob = await response.blob()
    
    // Convert the blob to a data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error generating QR code data URL:', error)
    throw new Error('Failed to generate QR code data URL')
  }
}

/**
 * Generate a QR code for an event and update the event record
 */
export async function generateAndSaveEventQRCode(eventId: string): Promise<string> {
  // Import here to avoid circular dependencies
  const { updateEvent } = await import('@/lib/supabase/events')
  
  try {
    // Generate the QR code URL
    const qrCodeUrl = generateQRCodeUrl({
      event_id: eventId,
      type: 'event'
    })
    
    // Update the event with the QR code URL
    await updateEvent(eventId, { qr_code_url: qrCodeUrl })
    
    return qrCodeUrl
  } catch (error) {
    console.error('Error generating and saving event QR code:', error)
    throw new Error('Failed to generate and save event QR code')
  }
}

/**
 * Verify a QR code access URL
 */
export async function verifyQRCodeAccess(eventId: string, attendeeId?: string): Promise<boolean> {
  try {
    // Import here to avoid circular dependencies
    const { getEvent } = await import('@/lib/supabase/events')
    
    // Verify the event exists
    await getEvent(eventId)
    
    // If attendee ID is provided, verify the attendee exists
    if (attendeeId) {
      const { getEventAttendee } = await import('@/lib/supabase/events')
      await getEventAttendee(attendeeId)
    }
    
    return true
  } catch (error) {
    console.error('Error verifying QR code access:', error)
    return false
  }
} 