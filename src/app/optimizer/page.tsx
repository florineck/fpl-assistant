'use client';

import { useState, useMemo } from 'react';
import { usePlayers, useEntry, useEntryPicks, useCurrentEvent } from '@/hooks/useFplData';
import { Formation, FORMATIONS, OptimizedTeam } from '@/types';
import { optimizeTeam } from '@/lib/optimizer';
import { useFPLStore } from '@/store';
import { EntryIdInput } from '@/components/EntryIdInput';

export default function OptimizerPage() {
  const { data: players, isLoading, error } = usePlayers();
  const entryId = useFPLStore((state) => state.entryId);
  const { data: entry } = useEntry(entryId);
  const { data: currentEvent } = useCurrentEvent();
  const { data: entryPicks } = useEntryPicks(entryId, currentEvent?.id || null);
  
  // Calculate user's current team value from picks
  const userTeamValue = useMemo(() => {
    const picks = (entryPicks as any)?.picks;
    if (!picks || !players) return null;
    const playerIds = picks.map((p: any) => p.element);
    const teamPlayers = players.filter((p) => playerIds.includes(p.id));
    const totalValue = teamPlayers.reduce((sum, p) => sum + p.price, 0);
    const bank = entry?.bank || 0;
    return totalValue + (bank / 10);
  }, [entryPicks, players, entry]);

  const [budget, setBudget] = useState(100);
  const [formation, setFormation] = useState<Formation>(FORMATIONS[0]);
  const [optimizedTeam, setOptimizedTeam] = useState<OptimizedTeam | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Set default budget to user's team value
  useMemo(() => {
    if (userTeamValue && userTeamValue > 0) {
      setBudget(Math.round(userTeamValue * 10) / 10);
    }
  }, [userTeamValue]);

  const handleOptimize = () => {
    if (!players) return;
    
    setIsOptimizing(true);
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const result = optimizeTeam(players, formation, budget);
      setOptimizedTeam(result);
      setIsOptimizing(false);
    }, 100);
  };

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
        <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Data</h2>
        <p className="text-slate-400">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EntryIdInput />
      
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Team Optimizer</h1>
        <p className="text-slate-400">Find your optimal starting XI using linear programming</p>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Budget */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Budget (£m)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value) || 100)}
              min={50}
              max={150}
              step={0.5}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Formation */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Formation</label>
            <select
              value={formation.name}
              onChange={(e) => {
                const selected = FORMATIONS.find((f) => f.name === e.target.value);
                if (selected) setFormation(selected);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {FORMATIONS.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Optimize Button */}
          <div className="flex items-end">
            <button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isOptimizing ? 'Optimizing...' : 'Optimize Team'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {optimizedTeam && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">£{optimizedTeam.totalCost}m</p>
              <p className="text-sm text-slate-400">Total Cost</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{optimizedTeam.projectedPoints.toFixed(1)}</p>
              <p className="text-sm text-slate-400">Projected Pts</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{optimizedTeam.formation}</p>
              <p className="text-sm text-slate-400">Formation</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{optimizedTeam.players.length}</p>
              <p className="text-sm text-slate-400">Players</p>
            </div>
          </div>

          {/* Captain & Vice-Captain */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-400 mb-1">Captain</p>
              <p className="text-xl font-bold text-white">{optimizedTeam.captain.webName}</p>
              <p className="text-sm text-slate-400">£{optimizedTeam.captain.price}m • {optimizedTeam.captain.position}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Vice-Captain</p>
              <p className="text-xl font-bold text-white">{optimizedTeam.viceCaptain.webName}</p>
              <p className="text-sm text-slate-400">£{optimizedTeam.viceCaptain.price}m • {optimizedTeam.viceCaptain.position}</p>
            </div>
          </div>

          {/* Team List */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Optimal Starting XI</h3>
            <div className="space-y-2">
              {optimizedTeam.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
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
                    <span className="text-white font-medium">{player.webName}</span>
                    <span className="text-sm text-slate-400">{player.teamName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-semibold">
                      {(player.epThis || player.form).toFixed(1)} pts
                    </span>
                    <span className="text-slate-500 ml-2">£{player.price}m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {!optimizedTeam && !isOptimizing && (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-lg">
          <p className="text-slate-400">Click "Optimize Team" to find your best XI</p>
        </div>
      )}
    </div>
  );
}
