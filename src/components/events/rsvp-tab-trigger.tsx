"use client";

import { useRouter, usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface RsvpTabTriggerProps {
  eventId: string;
}

export function RsvpTabTrigger({ eventId }: RsvpTabTriggerProps) {
  const pathname = usePathname();
  
  // Check if we're already on the RSVPs tab
  const isActive = pathname.includes(`rsvps`);
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <TabsTrigger 
          value="rsvps" 
          style={{ 
            padding: '0.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            minWidth: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: 'var(--card)'
          }}
          className={`group ${isActive ? 'bg-primary/20' : ''}`}
        >
          <MessageCircle 
            size={18} 
            style={{
              position: 'relative',
              zIndex: 1,
              transition: 'color 0.2s ease'
            }} 
            className={`${isActive ? 'text-primary' : 'text-foreground'} group-hover:text-primary`}
          />
          <span 
            className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" 
            style={{ borderRadius: '50%' }}
          ></span>
        </TabsTrigger>
      </TooltipTrigger>
      <TooltipContent>RSVPs</TooltipContent>
    </Tooltip>
  );
} 