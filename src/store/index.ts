import { create } from 'zustand';
import { Player, PlayerFilters, Formation } from '@/types';

interface FPLState {
  // Player data
  players: Player[];
  selectedPlayers: Player[];
  filters: PlayerFilters;
  
  // Optimizer state
  budget: number;
  formation: Formation;
  includePlayers: number[];
  excludePlayers: number[];
  
  // User entry
  entryId: number | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPlayers: (players: Player[]) => void;
  setFilters: (filters: Partial<PlayerFilters>) => void;
  resetFilters: () => void;
  togglePlayerSelection: (player: Player) => void;
  clearSelection: () => void;
  
  setBudget: (budget: number) => void;
  setFormation: (formation: Formation) => void;
  toggleIncludePlayer: (playerId: number) => void;
  toggleExcludePlayer: (playerId: number) => void;
  
  setEntryId: (entryId: number | null) => void;
  
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultFilters: PlayerFilters = {
  position: undefined,
  team: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  search: undefined,
  sortBy: 'totalPoints',
  sortOrder: 'desc',
};

const defaultFormation: Formation = {
  name: '4-4-2',
  gk: 1,
  def: 4,
  mid: 4,
  fwd: 2,
};

export const useFPLStore = create<FPLState>((set) => ({
  // Initial state
  players: [],
  selectedPlayers: [],
  filters: defaultFilters,
  budget: 100,
  formation: defaultFormation,
  includePlayers: [],
  excludePlayers: [],
  entryId: null,
  isLoading: false,
  error: null,
  
  // Actions
  setPlayers: (players) => set({ players }),
  
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  togglePlayerSelection: (player) =>
    set((state) => {
      const isSelected = state.selectedPlayers.some((p) => p.id === player.id);
      if (isSelected) {
        return {
          selectedPlayers: state.selectedPlayers.filter((p) => p.id !== player.id),
        };
      }
      return {
        selectedPlayers: [...state.selectedPlayers, player],
      };
    }),
  
  clearSelection: () => set({ selectedPlayers: [] }),
  
  setBudget: (budget) => set({ budget }),
  
  setFormation: (formation) => set({ formation }),
  
  toggleIncludePlayer: (playerId) =>
    set((state) => {
      const isIncluded = state.includePlayers.includes(playerId);
      if (isIncluded) {
        return {
          includePlayers: state.includePlayers.filter((id) => id !== playerId),
        };
      }
      return {
        includePlayers: [...state.includePlayers, playerId],
        excludePlayers: state.excludePlayers.filter((id) => id !== playerId),
      };
    }),
  
  toggleExcludePlayer: (playerId) =>
    set((state) => {
      const isExcluded = state.excludePlayers.includes(playerId);
      if (isExcluded) {
        return {
          excludePlayers: state.excludePlayers.filter((id) => id !== playerId),
        };
      }
      return {
        excludePlayers: [...state.excludePlayers, playerId],
        includePlayers: state.includePlayers.filter((id) => id !== playerId),
      };
    }),
  
  setEntryId: (entryId) => set({ entryId }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
}));
