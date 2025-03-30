import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'AI Enhancements | AI Features | Cloud Burst',
  description: 'Automated photo and video enhancement powered by AI',
};

export default function EnhancementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 