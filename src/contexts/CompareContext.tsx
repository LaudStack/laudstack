"use client";

/**
 * CompareContext — LaudStack
 * Manages up to 3 tools selected for side-by-side comparison.
 * State is kept in memory (resets on page close) — no persistence needed.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Tool } from '@/lib/types';

interface CompareContextValue {
  selected: Tool[];
  isSelected: (id: string) => boolean;
  toggle: (tool: Tool) => void;
  remove: (id: string) => void;
  clear: () => void;
  canAdd: boolean;   // true when fewer than 3 tools are selected
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Tool[]>([]);

  const isSelected = useCallback((id: string) => selected.some(t => t.id === id), [selected]);

  const toggle = useCallback((tool: Tool) => {
    setSelected(prev => {
      if (prev.some(t => t.id === tool.id)) {
        return prev.filter(t => t.id !== tool.id);
      }
      if (prev.length >= 3) return prev; // cap at 3
      return [...prev, tool];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setSelected(prev => prev.filter(t => t.id !== id));
  }, []);

  const clear = useCallback(() => setSelected([]), []);

  return (
    <CompareContext.Provider value={{ selected, isSelected, toggle, remove, clear, canAdd: selected.length < 3 }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used inside CompareProvider');
  return ctx;
}
