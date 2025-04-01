import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Template Preview | Cloud Burst',
  description: 'Preview event template details',
}

export default function TemplateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 