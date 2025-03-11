"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { updateEventStatus } from '@/lib/supabase/events'
import { toast } from 'sonner'

const statuses = [
  {
    value: 'draft',
    label: 'Draft',
    description: 'Event is in draft mode and not visible to attendees'
  },
  {
    value: 'published',
    label: 'Published',
    description: 'Event is live and visible to attendees'
  },
  {
    value: 'completed',
    label: 'Completed',
    description: 'Event has ended'
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    description: 'Event has been cancelled'
  }
]

interface EventStatusSelectorProps {
  eventId: string
  currentStatus: string
}

export function EventStatusSelector({ eventId, currentStatus }: EventStatusSelectorProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) {
      setOpen(false)
      return
    }

    setIsUpdating(true)
    try {
      await updateEventStatus(eventId, newStatus as 'draft' | 'published' | 'completed' | 'cancelled')
      setStatus(newStatus)
      toast.success('Event status updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Error updating event status:', error)
      toast.error('Failed to update event status')
    } finally {
      setIsUpdating(false)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          disabled={isUpdating}
        >
          {status ? statuses.find((s) => s.value === status)?.label : "Select status..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search status..." />
          <CommandEmpty>No status found.</CommandEmpty>
          <CommandGroup>
            {statuses.map((s) => (
              <CommandItem
                key={s.value}
                value={s.value}
                onSelect={() => handleStatusChange(s.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    status === s.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {s.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 