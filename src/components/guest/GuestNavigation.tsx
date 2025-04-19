"use client";

import Link from 'next/link';
import { Home, Camera, Image, Upload, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuestNavigationProps {
  token: string;
  activeItem?: 'home' | 'camera' | 'gallery' | 'upload' | 'profile';
}

export function GuestNavigation({ token, activeItem }: GuestNavigationProps) {
  if (!token) return null;
  
  const items = [
    {
      name: 'Home',
      icon: Home,
      href: `/guest/dashboard?token=${token}`,
      active: activeItem === 'home',
    },
    {
      name: 'Camera',
      icon: Camera,
      href: `/guest/camera?token=${token}`,
      active: activeItem === 'camera',
    },
    {
      name: 'Gallery',
      icon: Image,
      href: `/guest/gallery?token=${token}`,
      active: activeItem === 'gallery',
    },
    {
      name: 'Upload',
      icon: Upload,
      href: `/guest/upload?token=${token}`,
      active: activeItem === 'upload',
    },
    {
      name: 'Profile',
      icon: User,
      href: `/guest/profile?token=${token}`,
      active: activeItem === 'profile',
    },
  ];
  
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 h-16 border-t bg-background">
      <nav className="flex h-full items-center">
        {items.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center h-full text-muted-foreground transition-colors hover:text-foreground",
              item.active && "text-primary"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 mb-1",
              item.active && "text-primary"
            )} />
            <span className="text-xs font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
} 