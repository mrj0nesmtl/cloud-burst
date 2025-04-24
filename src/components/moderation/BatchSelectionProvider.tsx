'use client';

import { createContext, useContext, useState, useMemo, ReactNode } from 'react';

type Media = {
  id: string;
  [key: string]: any;
};

interface BatchSelectionContextType {
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string) => void;
  selectAll: (mediaItems: Media[]) => void;
  deselectAll: () => void;
  hasSelected: boolean;
  selectedCount: number;
  getSelectedItems: (mediaItems: Media[]) => Media[];
}

const BatchSelectionContext = createContext<BatchSelectionContextType | null>(null);

interface BatchSelectionProviderProps {
  children: ReactNode;
}

export function BatchSelectionProvider({ children }: BatchSelectionProviderProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const contextValue = useMemo(() => {
    const isSelected = (id: string) => selectedIds.has(id);
    
    const toggleSelection = (id: string) => {
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    };
    
    const selectAll = (mediaItems: Media[]) => {
      const allIds = mediaItems.map(item => item.id);
      setSelectedIds(new Set(allIds));
    };
    
    const deselectAll = () => {
      setSelectedIds(new Set());
    };
    
    const getSelectedItems = (mediaItems: Media[]) => {
      return mediaItems.filter(item => selectedIds.has(item.id));
    };
    
    return {
      selectedIds,
      isSelected,
      toggleSelection,
      selectAll,
      deselectAll,
      hasSelected: selectedIds.size > 0,
      selectedCount: selectedIds.size,
      getSelectedItems
    };
  }, [selectedIds]);
  
  return (
    <BatchSelectionContext.Provider value={contextValue}>
      {children}
    </BatchSelectionContext.Provider>
  );
}

export function useBatchSelection() {
  const context = useContext(BatchSelectionContext);
  if (!context) {
    throw new Error('useBatchSelection must be used within a BatchSelectionProvider');
  }
  return context;
} 