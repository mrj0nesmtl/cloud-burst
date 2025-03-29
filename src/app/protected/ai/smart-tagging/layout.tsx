import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Smart Tagging | AI Features | Cloud Burst',
  description: 'Automated content tagging and organization powered by AI',
};

export default function SmartTaggingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 