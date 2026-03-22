'use client';

import { useState } from 'react';
import { usePlayers } from '@/hooks/useFplData';
import { suggestTransfers } from '@/lib/optimizer';

export default function TransfersPage() {
  const { data: players, isLoading, error } = usePlayers();
  const [numTransfers, setNumTransfers] = useState(1);
  const [budget, setBudget] = useState(0);
  const [suggestions, setSuggestions] = useState<{ in: typeof players extends infer P ? P extends (infer U)[] ? U : never : never; out: typeof players extends infer P ? P extends (infer U)[] ? U : never : never; pointsGain: number }[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);

  // For demo, we'll use top scorers as "current team" if no selection
  const currentTeam = players?.slice(0, 15) || [];

  const handleSuggest = () => {
    if (!players) return;
    
    const teamToUse = selectedPlayers.length > 0 
      ? players.filter(p => selectedPlayers.includes(p.id))
      : currentTeam;
    
    if (teamToUse.length === 0) return;
    
    const results = suggestTransfers(teamToUse, players, budget, numTransfers);
    setSuggestions(results as any);
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
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Transfer Suggestions</h1>
        <p className="text-slate-400">Get data-driven transfer recommendations</p>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Number of Transfers</label>
            <input
              type="number"
              value={numTransfers}
              onChange={(e) => setNumTransfers(parseInt(e.target.value) || 1)}
              min={1}
              max={5}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Transfer Budget (£m)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
              min={0}
              max={20}
              step={0.5}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              onClick={handleSuggest}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Get Suggestions
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Recommended Transfers</h2>
          {suggestions.map((suggestion, index) => (
            <div key={index} className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                {/* Out Player */}
                <div className="flex-1">
                  <p className="text-sm text-red-400 mb-1">OUT</p>
                  <p className="text-lg font-semibold text-white">{suggestion.out.webName}</p>
                  <p className="text-sm text-slate-400">
                    {suggestion.out.teamName} • {suggestion.out.position} • £{suggestion.out.price}m
                  </p>
                  <p className="text-sm text-slate-500">
                    Form: {suggestion.out.form} • Pts: {suggestion.out.totalPoints}
                  </p>
                </div>

                {/* Arrow */}
                <div className="px-6">
                  <div className="text-2xl text-slate-500">→</div>
                  <p className="text-sm text-emerald-400 text-center">
                    +{suggestion.pointsGain.toFixed(1)} pts
                  </p>
                </div>

                {/* In Player */}
                <div className="flex-1 text-right">
                  <p className="text-sm text-emerald-400 mb-1">IN</p>
                  <p className="text-lg font-semibold text-white">{suggestion.in.webName}</p>
                  <p className="text-sm text-slate-400">
                    {suggestion.in.teamName} • {suggestion.in.position} • £{suggestion.in.price}m
                  </p>
                  <p className="text-sm text-slate-500">
                    Form: {suggestion.in.form} • Pts: {suggestion.in.totalPoints}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!suggestions.length && (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-lg">
          <p className="text-slate-400">Click "Get Suggestions" to find the best transfers</p>
        </div>
      )}
    </div>
  );
}
