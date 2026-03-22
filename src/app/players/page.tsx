'use client';

import { useState, useMemo } from 'react';
import { usePlayers, useTeams } from '@/hooks/useFplData';
import { Player, Position } from '@/types';
import { useFPLStore } from '@/store';
import Link from 'next/link';

const POSITIONS: (Position | 'ALL')[] = ['ALL', 'GK', 'DEF', 'MID', 'FWD'];

export default function PlayersPage() {
  const { data: players, isLoading, error } = usePlayers();
  const { data: teams } = useTeams();
  const storeFilters = useFPLStore((state) => state.filters);
  const setFilters = useFPLStore((state) => state.setFilters);

  const [localSearch, setLocalSearch] = useState(storeFilters.search || '');

  const filteredPlayers = useMemo(() => {
    if (!players) return [];

    let result = [...players];

    // Filter by position
    if (storeFilters.position) {
      result = result.filter((p) => p.position === storeFilters.position);
    }

    // Filter by team
    if (storeFilters.team) {
      result = result.filter((p) => p.team === storeFilters.team);
    }

    // Filter by price range
    if (storeFilters.minPrice) {
      result = result.filter((p) => p.price >= storeFilters.minPrice!);
    }
    if (storeFilters.maxPrice) {
      result = result.filter((p) => p.price <= storeFilters.maxPrice!);
    }

    // Filter by search
    if (localSearch) {
      const search = localSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.webName.toLowerCase().includes(search) ||
          p.firstName.toLowerCase().includes(search) ||
          p.secondName.toLowerCase().includes(search)
      );
    }

    // Sort
    const sortBy = storeFilters.sortBy || 'totalPoints';
    const sortOrder = storeFilters.sortOrder || 'desc';
    result.sort((a, b) => {
      let aVal: number;
      let bVal: number;

      if (sortBy === 'value') {
        aVal = a.totalPoints / a.price;
        bVal = b.totalPoints / b.price;
      } else if (sortBy === 'price') {
        aVal = a.price;
        bVal = b.price;
      } else if (sortBy === 'form') {
        aVal = a.form;
        bVal = b.form;
      } else {
        aVal = a.totalPoints;
        bVal = b.totalPoints;
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [players, storeFilters, localSearch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Players</h2>
        <p className="text-slate-400">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Players</h1>
        <p className="text-slate-400">{filteredPlayers.length} players available</p>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Search</label>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search players..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Position Filter */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Position</label>
            <select
              value={storeFilters.position || 'ALL'}
              onChange={(e) =>
                setFilters({ position: e.target.value === 'ALL' ? undefined : (e.target.value as Position) })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Team</label>
            <select
              value={storeFilters.team || ''}
              onChange={(e) => setFilters({ team: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Teams</option>
              {teams?.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Sort By</label>
            <select
              value={`${storeFilters.sortBy}-${storeFilters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [string, 'asc' | 'desc'];
                setFilters({ sortBy: sortBy as any, sortOrder });
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="totalPoints-desc">Points (High to Low)</option>
              <option value="totalPoints-asc">Points (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="form-desc">Form (High to Low)</option>
              <option value="value-desc">Value (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Player Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPlayers.slice(0, 50).map((player) => (
          <Link
            key={player.id}
            href={`/players/${player.id}`}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-white font-semibold">{player.webName}</h3>
                <p className="text-sm text-slate-500">{player.teamName}</p>
              </div>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded ${
                  player.position === 'GK'
                    ? 'bg-amber-900 text-amber-200'
                    : player.position === 'DEF'
                    ? 'bg-blue-900 text-blue-200'
                    : player.position === 'MID'
                    ? 'bg-green-900 text-green-200'
                    : 'bg-red-900 text-red-200'
                }`}
              >
                {player.position}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mt-3">
              <div>
                <p className="text-lg font-bold text-white">{player.totalPoints}</p>
                <p className="text-xs text-slate-500">Pts</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-400">{player.form}</p>
                <p className="text-xs text-slate-500">Form</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-400">£{player.price}m</p>
                <p className="text-xs text-slate-500">Price</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No players found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
