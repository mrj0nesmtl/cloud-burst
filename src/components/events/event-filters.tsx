import { useState } from 'react';
import { Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export type EventStatus = 'draft' | 'published' | 'completed' | 'cancelled';

export interface EventFilters {
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
  statuses: EventStatus[];
  isPublic?: boolean | null;
}

interface EventFiltersProps {
  filters: EventFilters;
  onFilterChange: (filters: EventFilters) => void;
}

/**
 * Event filters component for filtering events by date, status, and visibility
 * @param filters - Current filter state
 * @param onFilterChange - Callback function when filters change
 */
export function EventFilters({ filters, onFilterChange }: EventFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Count active filters
  const activeFilterCount = [
    filters.dateRange?.from || filters.dateRange?.to ? 1 : 0,
    filters.statuses.length > 0 ? 1 : 0,
    filters.isPublic !== null ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
  
  // Toggle status filter
  const toggleStatus = (status: EventStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    
    onFilterChange({
      ...filters,
      statuses: newStatuses,
    });
  };
  
  // Toggle visibility filter
  const toggleVisibility = (value: boolean | null) => {
    onFilterChange({
      ...filters,
      isPublic: filters.isPublic === value ? null : value,
    });
  };
  
  // Reset all filters
  const resetFilters = () => {
    onFilterChange({
      dateRange: undefined,
      statuses: [],
      isPublic: null,
    });
    setIsOpen(false);
  };
  
  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 rounded-full px-1 py-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-4" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Date Range</h4>
              <div className={cn(
                "grid gap-2",
                filters.dateRange?.from && filters.dateRange?.to ? "grid-cols-2" : "grid-cols-1"
              )}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? (
                        format(filters.dateRange.from, "PPP")
                      ) : (
                        "Start date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange?.from}
                      onSelect={(date) =>
                        onFilterChange({
                          ...filters,
                          dateRange: {
                            from: date,
                            to: filters.dateRange?.to,
                          },
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                {filters.dateRange?.from && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "justify-start text-left font-normal",
                          !filters.dateRange?.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange?.to ? (
                          format(filters.dateRange.to, "PPP")
                        ) : (
                          "End date"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange?.to}
                        onSelect={(date) =>
                          onFilterChange({
                            ...filters,
                            dateRange: {
                              from: filters.dateRange?.from,
                              to: date,
                            },
                          })
                        }
                        initialFocus
                        disabled={(date) =>
                          filters.dateRange?.from
                            ? date < filters.dateRange.from
                            : false
                        }
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              
              {(filters.dateRange?.from || filters.dateRange?.to) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      dateRange: undefined,
                    })
                  }
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear dates
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Status</h4>
              <div className="grid grid-cols-2 gap-3">
                {(['draft', 'published', 'completed', 'cancelled'] as EventStatus[]).map((status) => (
                  <div key={status} className="flex items-center space-x-2 bg-muted/40 px-3 py-2 rounded-md hover:bg-muted">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.statuses.includes(status)}
                      onCheckedChange={() => toggleStatus(status)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4"
                    />
                    <Label
                      htmlFor={`status-${status}`}
                      className="text-sm font-medium capitalize cursor-pointer w-full"
                    >
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Visibility</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 bg-muted/40 px-3 py-2 rounded-md hover:bg-muted">
                  <Checkbox
                    id="visibility-public"
                    checked={filters.isPublic === true}
                    onCheckedChange={() => toggleVisibility(true)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4"
                  />
                  <Label
                    htmlFor="visibility-public"
                    className="text-sm font-medium cursor-pointer w-full"
                  >
                    Public
                  </Label>
                </div>
                <div className="flex items-center space-x-2 bg-muted/40 px-3 py-2 rounded-md hover:bg-muted">
                  <Checkbox
                    id="visibility-private"
                    checked={filters.isPublic === false}
                    onCheckedChange={() => toggleVisibility(false)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4"
                  />
                  <Label
                    htmlFor="visibility-private"
                    className="text-sm font-medium cursor-pointer w-full"
                  >
                    Private
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs"
              >
                Reset filters
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 