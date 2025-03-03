'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RoleGate } from '@/components/auth/permission-gate';
import { useUser } from '@/hooks/use-user';

interface MainNavProps {
  className?: string;
}

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useUser();

  // Navigation items with role-based access
  const navItems = [
    {
      name: 'Home',
      href: '/',
      active: pathname === '/',
      public: true,
    },
    {
      name: 'Dashboard',
      href: '/protected/dashboard',
      active: pathname === '/protected/dashboard',
      public: false,
    },
    {
      name: 'Events',
      href: '/protected/events',
      active: pathname.startsWith('/protected/events'),
      roles: ['super_admin', 'admin', 'organizer', 'event_host'],
    },
    {
      name: 'Gallery',
      href: '/protected/gallery',
      active: pathname.startsWith('/protected/gallery'),
      public: false,
    },
    {
      name: 'Admin',
      href: '/protected/admin',
      active: pathname.startsWith('/protected/admin'),
      roles: ['super_admin', 'admin'],
    },
  ];

  return (
    <nav className={cn('flex items-center space-x-4 lg:space-x-6', className)}>
      {navItems.map((item) => {
        // Public items or items that require authentication but no specific role
        if (item.public || (item.public === false && !item.roles)) {
          return (
            <Button
              key={item.name}
              asChild
              variant="ghost"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                item.active
                  ? 'text-black dark:text-white'
                  : 'text-muted-foreground'
              )}
            >
              {isAuthenticated || item.public ? (
                <Link href={item.href}>{item.name}</Link>
              ) : null}
            </Button>
          );
        }

        // Role-specific items
        if (item.roles) {
          return (
            <RoleGate key={item.name} roles={item.roles}>
              <Button
                asChild
                variant="ghost"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  item.active
                    ? 'text-black dark:text-white'
                    : 'text-muted-foreground'
                )}
              >
                <Link href={item.href}>{item.name}</Link>
              </Button>
            </RoleGate>
          );
        }

        return null;
      })}
    </nav>
  );
} 