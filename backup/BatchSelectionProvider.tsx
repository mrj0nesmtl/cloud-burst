import { createContext, useContext, useState, ReactNode } from 'react';

interface BatchSelectionContextProps {
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: () => void;
  selectedCount: number;
}

const BatchSelectionContext = createContext<BatchSelectionContextProps | undefined>(undefined);

interface BatchSelectionProviderProps {
  children: ReactNode;
}

export function BatchSelectionProvider({ children }: BatchSelectionProviderProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelected = (id: string) => selectedIds.has(id);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  const selectAll = (ids: string[]) => {
    setSelectedIds(new Set(ids));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  return (
    <BatchSelectionContext.Provider
      value={{
        selectedIds,
        isSelected,
        toggleSelection,
        selectAll,
        deselectAll,
        selectedCount: selectedIds.size,
      }}
    >
      {children}
    </BatchSelectionContext.Provider>
  );
}

export function useBatchSelection() {
  const context = useContext(BatchSelectionContext);
  if (context === undefined) {
    throw new Error('useBatchSelection must be used within a BatchSelectionProvider');
  }
  return context;
} 