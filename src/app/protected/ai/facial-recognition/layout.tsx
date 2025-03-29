import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Facial Recognition | AI Features | Cloud Burst',
  description: 'Intelligent face detection and recognition for your event photos',
};

export default function FacialRecognitionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 