"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type FavoritesState = {
  favorites: string[];
  toggleFavorite: (providerId: string) => void;
  isFavorite: (providerId: string) => boolean;
  clearFavorites: () => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (providerId: string) => {
        const current = get().favorites;
        const exists = current.includes(providerId);
        set({
          favorites: exists
            ? current.filter((id) => id !== providerId)
            : [...current, providerId],
        });
      },
      isFavorite: (providerId: string) => get().favorites.includes(providerId),
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: "hellvar-favorites",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

