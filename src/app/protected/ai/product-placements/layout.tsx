import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Product Placements | AI Features | Cloud Burst',
  description: 'Smart product placement and brand integration for event photos',
};

export default function ProductPlacementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 