'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  User, UserCog, UserPlus, Crown, Camera, 
  Wrench, Megaphone, Briefcase, UserCheck
} from 'lucide-react'

type RoleType = 
  | 'super_admin' 
  | 'admin' 
  | 'organizer' 
  | 'event_host' 
  | 'event_staff' 
  | 'user' 
  | 'guest'
  | 'contractor'
  | 'photographer'
  | 'technician'
  | 'marketing'
  | string; // Fallback for unknown roles

interface StaffRoleBadgeProps {
  role: RoleType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StaffRoleBadge({ 
  role, 
  showIcon = true,
  size = 'md',
  className = ''
}: StaffRoleBadgeProps) {
  // Define role configurations
  const roleConfig: Record<string, { 
    label: string; 
    icon: React.ReactNode; 
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'contractor' | 'admin' | 'staff';
  }> = {
    super_admin: { 
      label: 'Super Admin', 
      icon: <Crown className="h-3 w-3 mr-1" />, 
      variant: 'admin'
    },
    admin: { 
      label: 'Admin', 
      icon: <UserCog className="h-3 w-3 mr-1" />, 
      variant: 'admin'
    },
    organizer: { 
      label: 'Organizer', 
      icon: <UserPlus className="h-3 w-3 mr-1" />, 
      variant: 'default'
    },
    event_host: { 
      label: 'Event Host', 
      icon: <UserCheck className="h-3 w-3 mr-1" />, 
      variant: 'staff'
    },
    event_staff: { 
      label: 'Event Staff', 
      icon: <User className="h-3 w-3 mr-1" />, 
      variant: 'staff'
    },
    contractor: { 
      label: 'Contractor', 
      icon: <Briefcase className="h-3 w-3 mr-1" />, 
      variant: 'contractor'
    },
    photographer: { 
      label: 'Photographer', 
      icon: <Camera className="h-3 w-3 mr-1" />, 
      variant: 'contractor'
    },
    technician: { 
      label: 'Technician', 
      icon: <Wrench className="h-3 w-3 mr-1" />, 
      variant: 'contractor'
    },
    marketing: { 
      label: 'Marketing', 
      icon: <Megaphone className="h-3 w-3 mr-1" />, 
      variant: 'contractor'
    },
    user: { 
      label: 'User', 
      icon: <User className="h-3 w-3 mr-1" />, 
      variant: 'secondary'
    },
    guest: { 
      label: 'Guest', 
      icon: <User className="h-3 w-3 mr-1" />, 
      variant: 'outline'
    }
  };

  // Default/fallback for unknown roles
  const defaultConfig = { 
    label: role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' '), 
    icon: <User className="h-3 w-3 mr-1" />,
    variant: 'outline' as const
  };

  // Get config for the provided role, or use default
  const config = roleConfig[role] || defaultConfig;

  // Size classes
  const sizeClasses = {
    sm: 'text-xs py-0 px-2',
    md: 'text-xs py-0.5 px-2.5',
    lg: 'text-sm py-1 px-3'
  };

  // Custom variant styles
  const variantStyles: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
    staff: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    contractor: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
  };

  // Generate classNames based on variant
  const variantClass = variantStyles[config.variant] || '';

  return (
    <Badge 
      variant={
        Object.keys(variantStyles).includes(config.variant) 
          ? 'outline' 
          : (config.variant as any)
      }
      className={`
        ${sizeClasses[size]} 
        ${variantClass} 
        ${className}
        font-medium whitespace-nowrap
      `}
    >
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
} 