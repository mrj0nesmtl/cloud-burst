import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const adminTabs = [
  {
    value: 'overview',
    label: 'Overview',
    href: '/protected/admin/overview',
  },
  {
    value: 'users',
    label: 'Users',
    href: '/protected/admin/users',
  },
  {
    value: 'settings',
    label: 'Settings',
    href: '/protected/admin/settings',
  },
  {
    value: 'analytics',
    label: 'Analytics',
    href: '/protected/admin/analytics',
  },
]

export function AdminTabs() {
  const pathname = usePathname()
  const currentTab = adminTabs.find(tab => pathname.includes(tab.value))?.value || 'overview'

  return (
    <Tabs value={currentTab} className="w-full">
      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
        {adminTabs.map(tab => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'relative h-9 rounded-none border-b-2 border-b-transparent',
              'data-[state=active]:border-b-primary data-[state=active]:shadow-none'
            )}
            asChild
          >
            <Link href={tab.href}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
} 