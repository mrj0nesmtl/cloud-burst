import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | Cloud Burst",
  description: "Manage notification settings and templates",
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 