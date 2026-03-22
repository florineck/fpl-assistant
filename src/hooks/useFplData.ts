'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getAllPlayers,
  getBootstrapStatic,
  getTeams,
  getCurrentEvent,
  getNextEvent,
  getPlayer,
} from '@/lib/fpl-api';
import { Player, Team, Event } from '@/types';

// Query keys
export const queryKeys = {
  bootstrap: ['bootstrap'] as const,
  players: ['players'] as const,
  player: (id: number) => ['player', id] as const,
  teams: ['teams'] as const,
  currentEvent: ['currentEvent'] as const,
  nextEvent: ['nextEvent'] as const,
};

/**
 * Hook to fetch all players
 */
export function usePlayers() {
  return useQuery({
    queryKey: queryKeys.players,
    queryFn: async () => {
      const response = await getAllPlayers();
      if (response.error || !response.data) {
        throw new Error(response.error || 'Failed to fetch players');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single player by ID
 */
export function usePlayer(playerId: number | null) {
  return useQuery({
    queryKey: queryKeys.player(playerId ?? 0),
    queryFn: async () => {
      if (!playerId) return null;
      const response = await getPlayer(playerId);
      if (response.error || !response.data) {
        throw new Error(response.error || 'Failed to fetch player');
      }
      return response.data;
    },
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch all teams
 */
export function useTeams() {
  return useQuery({
    queryKey: queryKeys.teams,
    queryFn: async () => {
      const response = await getTeams();
      if (response.error || !response.data) {
        throw new Error(response.error || 'Failed to fetch teams');
      }
      return response.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour (teams don't change often)
  });
}

/**
 * Hook to fetch current event (gameweek)
 */
export function useCurrentEvent() {
  return useQuery({
    queryKey: queryKeys.currentEvent,
    queryFn: async () => {
      const response = await getCurrentEvent();
      if (response.error) {
        throw new Error(response.error || 'Failed to fetch current event');
      }
      return response.data;
    },
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Hook to fetch next event (gameweek)
 */
export function useNextEvent() {
  return useQuery({
    queryKey: queryKeys.nextEvent,
    queryFn: async () => {
      const response = await getNextEvent();
      if (response.error) {
        throw new Error(response.error || 'Failed to fetch next event');
      }
      return response.data;
    },
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Hook to fetch bootstrap static data
 */
export function useBootstrapStatic() {
  return useQuery({
    queryKey: queryKeys.bootstrap,
    queryFn: async () => {
      const response = await getBootstrapStatic();
      if (response.error || !response.data) {
        throw new Error(response.error || 'Failed to fetch bootstrap data');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
