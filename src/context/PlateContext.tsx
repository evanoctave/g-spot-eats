import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";

import type { MenuItem, PlateSelection, RecommendedItem } from "@/types/dining";

type PlateContextValue = {
  selections: PlateSelection[];
  addItem: (item: MenuItem) => void;
  replaceWithRecommendation: (items: RecommendedItem[]) => void;
  setServings: (id: string, servings: number) => void;
  removeItem: (id: string) => void;
  clearPlate: () => void;
};

const PlateContext = createContext<PlateContextValue | null>(null);

export function PlateProvider({ children }: PropsWithChildren) {
  const [selections, setSelections] = useState<PlateSelection[]>([]);
  const value = useMemo<PlateContextValue>(() => ({
    selections,
    addItem(item) {
      setSelections((current) => {
        const existing = current.find((selection) => selection.item.id === item.id);
        if (!existing) return [...current, { item, servings: 1 }];
        if (!item.serving?.multipliable) return current;
        return current.map((selection) => selection.item.id === item.id
          ? { ...selection, servings: selection.servings + 1 }
          : selection);
      });
    },
    replaceWithRecommendation(items) {
      setSelections(items.map(({ item, servings }) => ({ item, servings })));
    },
    setServings(id, servings) {
      setSelections((current) => current.map((selection) => selection.item.id === id
        ? { ...selection, servings: Math.max(1, Math.round(servings)) }
        : selection));
    },
    removeItem(id) {
      setSelections((current) => current.filter((selection) => selection.item.id !== id));
    },
    clearPlate() {
      setSelections([]);
    },
  }), [selections]);
  return <PlateContext.Provider value={value}>{children}</PlateContext.Provider>;
}

export function usePlate() {
  const context = useContext(PlateContext);
  if (!context) throw new Error("usePlate must be used inside PlateProvider");
  return context;
}
