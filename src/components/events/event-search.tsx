import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EventSearchProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  placeholder?: string;
}

/**
 * Event search component with debounced input
 * @param onSearch - Callback function when search query changes
 * @param initialQuery - Initial search query
 * @param placeholder - Placeholder text for search input
 */
export function EventSearch({ 
  onSearch, 
  initialQuery = '', 
  placeholder = 'Search events...' 
}: EventSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  
  // Debounce search input to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query, onSearch]);
  
  // Clear search query
  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };
  
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-9 pr-10"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2"
          onClick={clearSearch}
          type="button"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
} 