'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RoleGate } from '@/components/auth/permission-gate';
import { usePermissions } from '@/hooks/use-permissions';
import type { UserRole } from '@/types/auth';

interface MainNavProps {
  className?: string;
}

interface NavItem {
  name: string;
  href: string;
  active: boolean;
  public?: boolean;
  roles?: UserRole[];
}

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname();
  const { user, hasAnyRole } = usePermissions();
  const isAuthenticated = !!user;

  // Navigation items with role-based access
  const navItems: NavItem[] = [
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
      roles: ['super_admin', 'admin', 'organizer', 'event_host'] as UserRole[],
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
      roles: ['super_admin', 'admin'] as UserRole[],
    },
  ];

  return (
    <nav className={cn('flex items-center space-x-4 lg:space-x-6', className)}>
      {navItems.map((item) => {
        // Public items
        if (item.public) {
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
              <Link href={item.href}>{item.name}</Link>
            </Button>
          );
        }

        // Items that require authentication but no specific role
        if (item.public === false && !item.roles) {
          return isAuthenticated ? (
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
              <Link href={item.href}>{item.name}</Link>
            </Button>
          ) : null;
        }

        // Role-specific items
        if (item.roles) {
          // Option 1: Using RoleGate component
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
          
          // Option 2: Using hasAnyRole function (alternative approach)
          /*
          return hasAnyRole(item.roles) ? (
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
              <Link href={item.href}>{item.name}</Link>
            </Button>
          ) : null;
          */
        }

        return null;
      })}
    </nav>
  );
} 