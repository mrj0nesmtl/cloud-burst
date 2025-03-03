import { QRCodeParams } from '@/types/events'

/**
 * Generate a QR code URL for an event or attendee
 * Uses the QR Code Generator API (https://goqr.me/api/)
 */
export function generateQRCodeUrl(params: QRCodeParams): string {
  const { event_id, type, attendee_id, size = 300 } = params
  
  // Base URL for the application
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cb-beta.replit.app'
  
  // Create the target URL based on the type
  let targetUrl: string
  
  if (type === 'event') {
    // URL for accessing the event gallery
    targetUrl = `${baseUrl}/events/${event_id}/gallery`
  } else if (type === 'attendee' && attendee_id) {
    // URL for an attendee-specific access
    targetUrl = `${baseUrl}/events/${event_id}/access/${attendee_id}`
  } else {
    throw new Error('Invalid QR code parameters')
  }
  
  // Encode the URL for the QR code API
  const encodedUrl = encodeURIComponent(targetUrl)
  
  // Generate the QR code URL using the goqr.me API
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodedUrl}&size=${size}x${size}&margin=10`
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