import { NotificationsContent } from "@/components/notifications/notifications-content";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications | Cloud Burst',
  description: 'Manage your notifications and alert preferences',
};

export default function NotificationsPage() {
  return <NotificationsContent />;
}
