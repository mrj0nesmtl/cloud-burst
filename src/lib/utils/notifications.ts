import { createClient } from '@supabase/supabase-js';

/**
 * Subscribes to moderation notifications through Supabase's realtime feature
 * @param supabaseClient - The Supabase client instance
 * @param onNotification - Callback function that will be called when a notification is received
 * @returns A function to unsubscribe from notifications
 */
export function subscribeToModerationNotifications(
  supabaseClient: ReturnType<typeof createClient>,
  onNotification: (payload: any) => void
) {
  const channel = supabaseClient
    .channel('moderation_notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'moderation_logs',
      },
      (payload) => {
        onNotification(payload);
      }
    )
    .subscribe();

  // Return an unsubscribe function
  return () => {
    supabaseClient.removeChannel(channel);
  };
}

/**
 * Formats a notification message based on moderation action
 * @param action - The moderation action (approved, rejected, reset, deleted)
 * @param count - The number of items affected
 * @returns A formatted notification message
 */
export function formatModerationNotification(action: string, count: number): string {
  const itemText = count === 1 ? 'item' : 'items';
  
  switch (action) {
    case 'approved':
      return `${count} ${itemText} approved and visible in gallery`;
    case 'rejected':
      return `${count} ${itemText} rejected from gallery`;
    case 'reset':
      return `${count} ${itemText} reset to pending status`;
    case 'deleted':
      return `${count} ${itemText} permanently deleted`;
    default:
      return `Moderation action completed: ${action} (${count} ${itemText})`;
  }
}

/**
 * Gets the base URL for admin navigation
 * @returns The base admin URL
 */
export function getAdminUrl(): string {
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';
    
    return isLocalhost 
      ? `http://${window.location.host}`
      : `https://${window.location.host}`;
  }
  
  return '';
}

/**
 * Gets the URL for the moderation page
 * @param eventId - Optional event ID to filter moderation by event
 * @returns The moderation page URL
 */
export function getModerationUrl(eventId?: string): string {
  const baseUrl = `${getAdminUrl()}/protected/gallery/moderate`;
  return eventId ? `${baseUrl}?eventId=${eventId}` : baseUrl;
}

/**
 * Checks browser notification permissions and requests if needed
 * @returns A promise that resolves to a boolean indicating if notifications are allowed
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

/**
 * Shows a browser notification for moderation actions
 * @param title - The notification title
 * @param options - Notification options
 * @returns The notification object if successful, null otherwise
 */
export async function showModerationNotification(
  title: string,
  options?: NotificationOptions
): Promise<Notification | null> {
  const hasPermission = await requestNotificationPermission();
  
  if (!hasPermission) {
    return null;
  }
  
  try {
    const notification = new Notification(title, {
      icon: '/images/logo.png',
      ...options
    });
    
    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
}