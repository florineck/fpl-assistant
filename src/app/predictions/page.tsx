'use client';

import { useState, useMemo } from 'react';
import { usePlayers } from '@/hooks/useFplData';
import { Player, PlayerPrediction } from '@/types';
import Link from 'next/link';

export default function PredictionsPage() {
  const { data: players, isLoading, error } = usePlayers();
  const [search, setSearch] = useState('');
  const [filterPosition, setFilterPosition] = useState<string>('ALL');

  const predictions = useMemo(() => {
    if (!players) return [];

    let filtered = [...players];

    // Filter by position
    if (filterPosition !== 'ALL') {
      filtered = filtered.filter((p) => p.position === filterPosition);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.webName.toLowerCase().includes(searchLower) ||
          p.firstName.toLowerCase().includes(searchLower) ||
          p.secondName.toLowerCase().includes(searchLower)
      );
    }

    // Calculate predictions using the formula:
    // 40% form + 30% fixture difficulty + 30% historical
    return filtered.map((player) => {
      const form = player.form || 0;
      const fixtureDifficulty = 5; // Default difficulty (would need fixture API for real calculation)
      const historical = player.totalPoints / 20; // Approximate per-game average

      const predictedPoints = form * 0.4 + fixtureDifficulty * 0.3 + historical * 0.3;
      
      // Confidence based on minutes played and form
      const confidence = Math.min(
        100,
        (player.minutesPlayed / 1800) * 50 + Math.min(player.form * 10, 50)
      );

      // Recommendation
      let recommendation: 'buy' | 'hold' | 'sell' = 'hold';
      if (predictedPoints > 6 && player.form > 4) recommendation = 'buy';
      else if (player.form < 2 && player.minutesPlayed > 1000) recommendation = 'sell';

      return {
        player,
        predictedPoints,
        confidence,
        recommendation,
        factors: {
          form,
          fixtureDifficulty,
          historical,
        },
      };
    });
  }, [players, search, filterPosition]);

  // Sort by predicted points
  predictions.sort((a, b) => b.predictedPoints - a.predictedPoints);

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
        <h1 className="text-3xl font-bold text-white mb-2">Points Predictions</h1>
        <p className="text-slate-400">Predict player points for upcoming fixtures</p>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search players..."
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Positions</option>
            <option value="GK">Goalkeepers</option>
            <option value="DEF">Defenders</option>
            <option value="MID">Midfielders</option>
            <option value="FWD">Forwards</option>
          </select>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Player</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Position</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Predicted</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Confidence</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Form</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {predictions.slice(0, 50).map((pred) => (
                <tr key={pred.player.id} className="border-t border-slate-800 hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/players/${pred.player.id}`} className="text-white hover:text-emerald-400">
                      {pred.player.webName}
                    </Link>
                    <p className="text-xs text-slate-500">{pred.player.teamName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${
                        pred.player.position === 'GK'
                          ? 'bg-amber-900 text-amber-200'
                          : pred.player.position === 'DEF'
                          ? 'bg-blue-900 text-blue-200'
                          : pred.player.position === 'MID'
                          ? 'bg-green-900 text-green-200'
                          : 'bg-red-900 text-red-200'
                      }`}
                    >
                      {pred.player.position}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-white font-semibold">{pred.predictedPoints.toFixed(1)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-slate-400">{pred.confidence.toFixed(0)}%</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-blue-400">{pred.player.form}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        pred.recommendation === 'buy'
                          ? 'bg-emerald-900 text-emerald-200'
                          : pred.recommendation === 'sell'
                          ? 'bg-red-900 text-red-200'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {pred.recommendation.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {predictions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No players found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
