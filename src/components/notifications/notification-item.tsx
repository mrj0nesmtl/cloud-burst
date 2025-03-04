import { Notification } from '@/types/notifications';
import { getEventUrl } from '@/lib/utils';
import Link from 'next/link';

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  // Assuming notification might have an eventId and custom_url
  return (
    <div className="p-3 border-b">
      {notification.eventId && (
        <Link 
          href={getEventUrl({ 
            id: notification.eventId, 
            custom_url: notification.eventCustomUrl 
          })}
          className="hover:underline"
        >
          {notification.message}
        </Link>
      )}
      {/* Other notification content */}
    </div>
  );
} 