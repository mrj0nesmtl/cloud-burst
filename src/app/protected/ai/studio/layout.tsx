import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Studio | AI Features | Cloud Burst',
  description: 'Advanced AI workspace for custom photo and video transformations',
};

export default function AIStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 